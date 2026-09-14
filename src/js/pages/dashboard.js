import { authService } from '../services/auth.js';
import { accountService } from '../services/database.js';

export const dashboardPage = {
  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    const user = await authService.getCurrentUser();
    const email = user?.email || user?.user_metadata?.email || 'Belum login';
    container.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p class="text-gray-500 mt-1">Selamat datang, ${email}! 👋</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-500">Total Saldo</p>
              <span class="text-2xl">💰</span>
            </div>
            <p class="text-2xl font-bold text-gray-800 mt-1" id="stat-balance">Rp 0</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-500">Pemasukan</p>
              <span class="text-2xl">📈</span>
            </div>
            <p class="text-2xl font-bold text-green-600 mt-1" id="stat-income">Rp 0</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-500">Pengeluaran</p>
              <span class="text-2xl">📉</span>
            </div>
            <p class="text-2xl font-bold text-red-600 mt-1" id="stat-expense">Rp 0</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-500">Tabungan Bersih</p>
              <span class="text-2xl">🏦</span>
            </div>
            <p class="text-2xl font-bold text-blue-700 mt-1" id="stat-net">Rp 0</p>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Ringkasan Akun</h3>
            <div id="dashboard-accounts" class="space-y-3">
              <p class="text-gray-400 text-sm">Memuat akun...</p>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terakhir</h3>
            <div id="dashboard-activity" class="space-y-3">
              <p class="text-gray-400 text-sm">Belum ada transaksi</p>
            </div>
          </div>
        </div>
      </div>
    `;
    this.loadAccounts();
  },

  async loadAccounts() {
    const { data, error } = await accountService.getAll();
    const container = document.getElementById('dashboard-accounts');
    if (!container) return;
    if (error || !data) { container.innerHTML = '<p class="text-red-500 text-sm">Gagal memuat akun</p>'; return; }
    if (!data.length) { container.innerHTML = '<p class="text-gray-400 text-sm">Belum punya akun</p>'; return; }
    container.innerHTML = data.map(a => `
      <div class="flex items-center justify-between py-2 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <span>${a.type === 'bank' ? '🏦' : a.type === 'e_wallet' ? '📱' : a.type === 'cash' ? '💵' : '📁'}</span>
          <span class="text-sm font-medium text-gray-800">${a.name}</span>
        </div>
        <span class="text-sm font-bold ${a.current_balance >= 0 ? 'text-green-600' : 'text-red-600'}">Rp ${Number(a.current_balance).toLocaleString('id-ID')}</span>
      </div>
    `).join('');
  }
};
