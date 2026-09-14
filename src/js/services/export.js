import { supabase } from './supabase.js';

export const exportService = {
  async exportToExcel(data) {
    const { default: XLSX } = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'finance-dashboard-export.xlsx');
  },

  async exportToPDF() {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.text('Finance Dashboard Report', 20, 20);
    doc.save('finance-dashboard-report.pdf');
  }
};
