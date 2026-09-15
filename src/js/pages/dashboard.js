import { authService } from '../services/auth.js';
import { accountService } from '../services/database.js';
import { transactionService } from '../services/database.js';
import { categoryService } from '../services/database.js';
import { budgetService } from '../services/database.js';

export const dashboardPage = {
  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    const user = await authService.getCurrentUser();
    const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
    container.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p class="text-gray-500 mt-1">Selamat datang, ${displayName}! 👋</p>
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
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Ringkasan Akun</h3>
            <div id="dashboard-accounts" class="space-y-3">
              <p class="text-gray-400 text-sm">Memuat akun...</p>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terakhir</h3>
            <div id="dashboard-activity" class="space-y-3">
              <p class="text-gray-400 text-sm">Memuat...</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Ringkasan Bulan Ini</h3>
          <div id="dashboard-monthly" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Transaksi</p>
              <p class="text-2xl font-bold text-gray-800" id="stat-count">0</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Rata-rata/Hari</p>
              <p class="text-2xl font-bold text-gray-800" id="stat-daily-avg">Rp 0</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Budget Tersisa</p>
              <p class="text-2xl font-bold text-green-600" id="stat-budget-left">-</p>
            </div>
          </div>
        </div>
      </div>
    `;
    await this.loadStatistics();
    await this.loadAccounts();
    await this.loadActivity();
    await this.loadMonthlySummary();
  },

  async loadStatistics() {
    const { data: accounts } = await accountService.getAll();
    const { data: transactions } = await transactionService.getAll();
    const accountList = accounts || [];
    const txList = transactions || [];
    const totalBalance = accountList.reduce((sum, a) => sum + Number(a.current_balance || 0), 0);
    const income = txList.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expense = txList.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const net = income - expense;
    const el = (id) => document.getElementById(id);
    if (el('stat-balance')) el('stat-balance').textContent = `Rp ${totalBalance.toLocaleString('id-ID')}`;
    if (el('stat-income')) el('stat-income').textContent = `Rp ${income.toLocaleString('id-ID')}`;
    if (el('stat-expense')) el('stat-expense').textContent = `Rp ${expense.toLocaleString('id-ID')}`;
    if (el('stat-net')) el('stat-net').textContent = `Rp ${net.toLocaleString('id-ID')}`;
  },

  async loadAccounts() {
    const { data, error } = await accountService.getAll();
    const container = document.getElementById('dashboard-accounts');
    if (!container) return;
    if (error || !data) { container.innerHTML = '<p class="text-red-500 text-sm">Gagal memuat akun</p>'; return; }
    if (!data.length) { container.innerHTML = '<p class="text-gray-400 text-sm">Belum punya akun. Buat akun pertama di menu Akun.</p>'; return; }
    container.innerHTML = data.map(a => `
      <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <div class="flex items-center gap-3">
          <span class="text-xl">${a.type === 'bank' ? '🏦' : a.type === 'e_wallet' ? '📱' : a.type === 'cash' ? '💵' : '📁'}</span>
          <div>
            <p class="text-sm font-medium text-gray-800">${a.name}</p>
            <p class="text-xs text-gray-400">${a.type === 'bank' ? 'Bank' : a.type === 'e_wallet' ? 'E-Wallet' : a.type === 'cash' ? 'Cash' : 'Lainnya'}</p>
          </div>
        </div>
        <span class="text-sm font-bold ${Number(a.current_balance) >= 0 ? 'text-green-600' : 'text-red-600'}">Rp ${Number(a.current_balance).toLocaleString('id-ID')}</span>
      </div>
    `).join('');
  },

  async loadActivity() {
    const { data, error } = await transactionService.getAll();
    const { data: categories } = await categoryService.getAll();
    const container = document.getElementById('dashboard-activity');
    if (!container) return;
    if (error || !data) { container.innerHTML = '<p class="text-red-500 text-sm">Gagal memuat aktivitas</p>'; return; }
    if (!data.length) { container.innerHTML = '<p class="text-gray-400 text-sm">Belum ada transaksi. Mulai catat transaksi pertama!</p>'; return; }
    const catMap = {};
    (categories || []).forEach(c => { catMap[c.id] = c.name; });
    const recent = data.slice(0, 5).sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = recent.map(t => `
      <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <div class="flex items-center gap-3">
          <span class="text-lg">${t.type === 'income' ? '🟢' : t.type === 'expense' ? '🔴' : t.type === 'transfer' ? '🔵' : '📝'}</span>
          <div>
            <p class="text-sm font-medium text-gray-800">${t.description || '-'}</p>
            <p class="text-xs text-gray-400">${catMap[t.category_id] || 'N/A'} · ${new Date(t.date).toLocaleDateString('id-ID')}</p>
          </div>
        </div>
        <span class="text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}">${t.type === 'income' ? '+' : ''}Rp ${Number(t.amount).toLocaleString('id-ID')}</span>
      </div>
    `).join('');
  },

  async loadMonthlySummary() {
    const { data: transactions } = await transactionService.getAll();
    const { data: budgets, error: budgetErr } = await budgetService.getAll();
    const txList = transactions || [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const monthTx = txList.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    });
    const totalBudget = (budgets || []).reduce((sum, b) => sum + Number(b.amount || 0), 0);
    const totalSpent = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const budgetLeft = totalBudget > 0 ? totalBudget - totalSpent : 0;
    const el = (id) => document.getElementById(id);
    if (el('stat-count')) el('stat-count').textContent = monthTx.length;
    if (el('stat-daily-avg')) el('stat-daily-avg').textContent = monthTx.length > 0 ? `Rp ${Math.round(totalSpent / now.getDate()).toLocaleString('id-ID')}` : 'Rp 0';
    if (el('stat-budget-left')) el('stat-budget-left').textContent = totalBudget > 0 ? `Rp ${Math.max(0, budgetLeft).toLocaleString('id-ID')}` : '-';
  }
};