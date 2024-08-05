import ExcelJS from "exceljs";

interface DataRow {
  [key: string]: string | number | boolean | object | null;
}

// Fungsi untuk meratakan objek JSON bersarang
function flattenObject(
  obj: Record<string, any>,
  prefix = ""
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const complexData: DataRow[] = body.data;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(body.title);

    // Mendapatkan semua header yang mungkin dari data
    const allHeaders = new Set<string>();
    complexData.forEach((item) => {
      Object.keys(flattenObject(item)).forEach((header) =>
        allHeaders.add(header)
      );
    });

    // Menambahkan header kolom
    worksheet.addRow(Array.from(allHeaders));

    // Menambahkan data baris
    complexData.forEach((item) => {
      const flattenedItem = flattenObject(item);
      const rowValues = Array.from(allHeaders).map(
        (header) => flattenedItem[header] ?? ""
      );
      worksheet.addRow(rowValues);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    var blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    return blob;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    setResponseStatus(event, 500); // Internal Server Error
    return { error: "Terjadi kesalahan saat mengekspor data." };
  }
});
