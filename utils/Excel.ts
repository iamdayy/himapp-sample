import ExcelJs, { Workbook, type Worksheet } from "exceljs";

export default class Excel<T extends Array<Object>> {
  public title: string;
  private worksheet: Worksheet;
  private workbook: Workbook;
  public buffer: ExcelJs.Buffer | undefined = undefined;

  constructor(title: string) {
    this.title = title;
    this.workbook = new ExcelJs.Workbook();
    this.worksheet = this.workbook.addWorksheet(title);
  }

  private flattenData(obj: Object) {
    return Object.assign(
      {},
      Object.fromEntries(
        Object.values(obj)
          .filter((x) => typeof x === "object")
          .map((x) => Object.entries(x))
          .flat(1)
      ),
      Object.fromEntries(
        Object.entries(obj).filter(([, x]) => typeof x !== "object")
      )
    );
  }

  private getKeyData(data: T) {
    const item = this.flattenData(data[0]);

    return Object.keys(item).map((key) => {
      return {
        key: key,
        header: key.toUpperCase(),
      };
    });
  }

  public async generate(data: T) {
    this.worksheet.columns = this.getKeyData(data);
    data.forEach((item) => {
      const flattenItem = this.flattenData(item);
      this.worksheet.addRow(flattenItem);
    });

    this.buffer = await this.workbook.xlsx.writeBuffer();
  }

  public download(): Boolean {
    if (this.buffer) {
      var blob = new Blob([this.buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      var link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      var fileName = `${new Date(Date.now())}-${this.title}.xlsx`;
      link.download = fileName;
      link.click();
      return true;
    } else {
      return false;
    }
  }
}
