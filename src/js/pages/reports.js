import { transactionService } from '../services/database.js';

export const reportsPage = {
  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    container.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Laporan</h2>
          <p class="text-gray-500 mt-1">Lihat laporan keuangan per bulan</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div class="flex flex-wrap gap-4 items-end">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
              <select id="report-month" class="px-3 py-2 border border-gray-300 rounded-lg">
                ${Array.from({length: 12}, (_, i) => `<option value="${i + 1}">${new Date(2024, i).toLocaleString('id-ID', {month: 'long'})}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
              <input type="number" id="report-year" class="px-3 py-2 border border-gray-300 rounded-lg" value="2025" min="2000" max="2030" />
            </div>
            <button id="btn-generate-report" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lihat Laporan</button>
          </div>
        </div>
        <div id="report-results" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p class="text-sm text-gray-500">Total Pemasukan</p>
            <p class="text-2xl font-bold text-green-600" id="report-income">Rp 0</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p class="text-sm text-gray-500">Total Pengeluaran</p>
            <p class="text-2xl font-bold text-red-600" id="report-expense">Rp 0</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p class="text-sm text-gray-500">Net Savings</p>
            <p class="text-2xl font-bold text-blue-700" id="report-net">Rp 0</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
          <h3 class="font-semibold text-gray-800 mb-3">Detail Transaksi</h3>
          <div id="report-details" class="space-y-2">
            <p class="text-gray-400">Pilih bulan dan tahun, lalu klik "Lihat Laporan"</p>
          </div>
        </div>
      </div>
    `;
    this.attachEvents();
  },

  attachEvents() {
    const btn = document.getElementById('btn-generate-report');
    if (btn) btn.addEventListener('click', () => this.generate());
  },

  async generate() {
    const month = document.getElementById('report-month').value;
    const year = document.getElementById('report-year').value;
    const { data: transactions, error } = await transactionService.getByMonth(parseInt(month), parseInt(year));
    if (error || !transactions) return;
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    document.getElementById('report-income').textContent = `Rp ${Number(income).toLocaleString('id-ID')}`;
    document.getElementById('report-expense').textContent = `Rp ${Number(expense).toLocaleString('id-ID')}`;
    document.getElementById('report-net').textContent = `Rp ${Number(income - expense).toLocaleString('id-ID')}`;
    const details = document.getElementById('report-details');
    if (!transactions.length) { details.innerHTML = `
      <div class="bg-gray-50 rounded-xl p-8 text-center">
        <span class="text-3xl mb-3 block">📄</span>
        <p class="text-gray-500">Tidak ada transaksi untuk bulan ini</p>
        <p class="text-gray-400 text-sm">Tambahkan transaksi untuk melihat laporan</p>
      </div>`; return; }
    details.innerHTML = transactions.map(t => `
      <div class="flex justify-between py-2 border-b border-gray-100 text-sm">
        <span>${new Date(t.date).toLocaleDateString('id-ID')} - ${t.description || '-'}</span>
        <span class="font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}">Rp ${Number(t.amount).toLocaleString('id-ID')}</span>
      </div>
    `).join('');
  }
};
