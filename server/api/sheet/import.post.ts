import ExcelJS from "exceljs";
import { readFiles } from "h3-formidable";
interface DataRow {
  [key: string]: string | number | boolean | object | null;
}

export default defineEventHandler(async (event) => {
  try {
    const { files } = await readFiles(event);
    const file = files.file![0].filepath;
    if (!file) {
      throw createError({
        statusCode: 402,
        statusMessage: "Please attach file in the form",
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file);
    const worksheet = workbook.getWorksheet("Data");

    const jsonData: DataRow[] = [];
    const headers: string[] = [];

    // Mendapatkan header kolom
    worksheet?.getRow(1).eachCell((cell) => {
      headers.push(cell.value as string);
    });

    // Mendapatkan data baris
    worksheet?.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        // Mulai dari baris kedua (baris pertama adalah header)
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1]; // Mendapatkan header yang sesuai dengan kolom
          const nestedKeys = header.split("."); // Memisahkan header yang mungkin bersarang
          let currentObject = rowData;

          // Menangani header bersarang
          for (let i = 0; i < nestedKeys.length - 1; i++) {
            const key = nestedKeys[i];
            if (!currentObject[key]) {
              currentObject[key] = {}; // Membuat objek kosong jika belum ada
            }
            currentObject = currentObject[key]; // Masuk ke objek yang lebih dalam
          }

          // Mengisi nilai pada objek terakhir
          currentObject[nestedKeys[nestedKeys.length - 1]] = cell.value;
        });
        jsonData.push(rowData as DataRow); // Mengkonversi rowData menjadi DataMahasiswa
      }
    });

    return jsonData; // Kirim JSON sebagai respons
  } catch (error) {
    return error;
  }
});
