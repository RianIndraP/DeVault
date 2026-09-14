import { authService } from '../services/auth.js';

export const dashboardPage = {
  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    const user = await authService.getCurrentUser();
    const email = user?.email || 'Belum login';
    container.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-dark-800">Dashboard</h2>
          <p class="text-dark-500 mt-1">Selamat datang, ${email}!</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-xl shadow-sm border border-dark-200 p-5">
            <p class="text-sm text-dark-500">Total Saldo</p>
            <p class="text-2xl font-bold text-dark-800 mt-1" id="stat-balance">Rp 0</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-dark-200 p-5">
            <p class="text-sm text-dark-500">Pemasukan</p>
            <p class="text-2xl font-bold text-success mt-1">Rp 0</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-dark-200 p-5">
            <p class="text-sm text-dark-500">Pengeluaran</p>
            <p class="text-2xl font-bold text-danger mt-1">Rp 0</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-dark-200 p-5">
            <p class="text-sm text-dark-500">Net Savings</p>
            <p class="text-2xl font-bold text-primary-700 mt-1">Rp 0</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-dark-200 p-6">
          <h3 class="text-lg font-semibold text-dark-800 mb-4">Status Auth</h3>
          <p class="text-dark-600">Auth Service: ✅ Aktif</p>
          <p class="text-dark-600">Status: ${user ? '✅ User terautentikasi' : '⚠️ Belum login'}</p>
        </div>
      </div>
    `;
  }
};