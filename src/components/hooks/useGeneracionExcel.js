import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
 
const useGeneracionExcel = () => {
  const exportToExcel = async (sheetsData, fileName = 'reporte') => {
    const workbook = new ExcelJS.Workbook();
 
    for (const { sheetName, data } of sheetsData) {
      const sheet = workbook.addWorksheet(sheetName || 'Hoja');
 
      // Agregar encabezados
      const headers = Object.keys(data[0] || {});
      sheet.columns = headers.map((key) => ({
        header: key,
        key: key,
        width: Math.max(15, key.length + 5),
      }));
 
      // Estilos para encabezado
      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'A8D08D' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
 
      // Agregar filas
      data.forEach((row) => sheet.addRow(row));
    }
 
    const buffer = await workbook.xlsx.writeBuffer();
    const fecha = new Date().toISOString().split('T')[0];
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
 
    saveAs(blob, `${fileName}-${fecha}.xlsx`);
  };
 
  return { exportToExcel };
};
 
export default useGeneracionExcel;