import { authService } from '../services/auth.js';
import { accountService } from '../services/database.js';
import { transactionService } from '../services/database.js';
import { rupiah, withAlpha, categoryIcon, goalIcon, accountIcon, accountTypeLabel } from '../utils.js';
import { categoryService } from '../services/database.js';
import { budgetService } from '../services/database.js';
import { goalService } from '../services/database.js';
import { recurringTransactionService } from '../services/database.js';
import { exportService } from '../services/export.js';
import { ocrService } from '../services/ocr.js';
import { icon } from '../components/icons.js';
import { showToast } from '../components/toast.js';
import { tutorialPanel } from '../components/tutorial.js';

// ⚠️ CATATAN: dashboard ini memanggil transactionService.create(),
// accountService.update() dan goalService.update() saat menambah transaksi
// atau menabung ke target. Nama method ini ASUMSI mengikuti pola getAll()
// yang sudah ada di database.js kamu — sesuaikan nama/parameternya kalau
// beda di implementasi aslimu.
export const dashboardPage = {
  data: { accounts: [], transactions: [], categories: [], budgets: [], goals: [], recurrings: [] },
  ui: { activeType: 'all', activeCategory: null, search: '', txType: 'expense' },
  charts: { cashflow: null, balance: null },
  _globalListenersBound: false,

  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    const user = await authService.getCurrentUser();
    const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
    const monthLabel = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    container.innerHTML = `
        <!-- HEADER -->
        <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 class="font-display text-2xl font-semibold" style="color:var(--ink)">Selamat datang, ${displayName}</h1>
            <p class="mt-1 text-sm" style="color:var(--ink-muted)">Berikut kondisi keuanganmu — ${monthLabel}.</p>
          </div>
          <div class="flex gap-2 flex-wrap items-center">
            <button id="btn-add-tx" class="text-sm font-semibold px-4 py-2 rounded-lg focus-ring btn-press flex items-center gap-1.5" style="background:var(--indigo); color:#fff;">
              ${icon('plus', 'w-4 h-4')} Tambah transaksi
            </button>
            <button id="btn-scan-receipt" class="text-sm font-medium px-3.5 py-2 rounded-lg focus-ring btn-press flex items-center gap-1.5" style="background:var(--amber-soft); color:var(--amber);">
              ${icon('camera', 'w-4 h-4')} Scan struk
            </button>
            <div class="w-px h-6" style="background:var(--border)"></div>
            <button id="btn-export-excel" class="text-xs font-medium px-2.5 py-2 rounded-lg focus-ring btn-press flex items-center gap-1.5" style="background:transparent; border:1px solid var(--border); color:var(--ink-muted)">
              ${icon('download', 'w-3.5 h-3.5')} Excel
            </button>
            <button id="btn-export-pdf" class="text-xs font-medium px-2.5 py-2 rounded-lg focus-ring btn-press flex items-center gap-1.5" style="background:transparent; border:1px solid var(--border); color:var(--ink-muted)">
              ${icon('file', 'w-3.5 h-3.5')} PDF
            </button>
          </div>
        </div>

        <!-- HERO: TOTAL SALDO -->
        <div class="card card-hover rounded-2xl p-6 md:p-7 mb-4">
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p class="text-sm" style="color:var(--ink-muted)">Total saldo — semua akun</p>
              <p id="stat-balance" class="font-display text-5xl md:text-6xl font-semibold mt-2 tabular-nums" style="color:var(--ink)">Rp0</p>
              <div class="mt-1.5 flex items-center gap-1.5 text-sm font-medium" id="stat-net-row" style="color:var(--emerald)">
                ${icon('trendUp', 'w-4 h-4')}
                <span id="stat-net">+Rp0</span> sejak awal bulan
              </div>
            </div>
            <label class="flex items-center gap-2 text-xs font-medium cursor-pointer select-none" style="color:var(--ink-muted)">
              Bandingkan bulan lalu
              <span id="compare-switch" class="switch"><span class="dot"></span></span>
            </label>
          </div>
          <div id="compare-row" class="hidden mt-4 grid grid-cols-3 gap-4 text-xs rounded-xl p-3" style="background:var(--surface-alt)"></div>
          <div class="mt-6 pt-5 flex flex-wrap items-center justify-between gap-4" style="border-top:1px solid var(--border)">
            <div class="grid grid-cols-3 gap-6">
              <div><p class="text-xs" style="color:var(--ink-muted)">Pemasukan</p><p id="stat-income" class="text-lg font-semibold mt-0.5 tabular-nums" style="color:var(--emerald)">Rp0</p></div>
              <div><p class="text-xs" style="color:var(--ink-muted)">Pengeluaran</p><p id="stat-expense" class="text-lg font-semibold mt-0.5 tabular-nums" style="color:var(--coral)">Rp0</p></div>
              <div><p class="text-xs" style="color:var(--ink-muted)">Savings rate</p><p id="stat-savings" class="text-lg font-semibold mt-0.5 tabular-nums" style="color:var(--ink)">0%</p></div>
            </div>
            <button id="btn-health-info" class="text-xs font-medium px-3 py-1.5 rounded-full btn-press flex items-center gap-1.5" style="background:var(--surface-alt); color:var(--ink-muted)">
              Skor kesehatan: <span id="mini-health-score" class="font-semibold" style="color:var(--ink)">0</span>/100 · Lihat detail
            </button>
          </div>
        </div>

        <!-- MODAL: HEALTH SCORE INFO -->
        <div id="health-info-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
          <div id="health-info-backdrop" class="absolute inset-0 modal-backdrop"></div>
          <div class="relative w-full max-w-md rounded-2xl p-6 card z-10">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-display text-lg font-semibold" style="color:var(--ink)">Cara Kerja Skor Kesehatan Finansial</h3>
              <button type="button" id="btn-close-health-info" class="p-1.5 rounded-lg btn-press" style="color:var(--ink-muted)">${icon('close', 'w-5 h-5')}</button>
            </div>
            <div id="health-info-content" class="text-sm space-y-3" style="color:var(--ink-muted)"></div>
          </div>
        </div>

        <!-- ARUS KAS (grafik utama) -->
        <div class="card card-hover rounded-2xl p-6 mb-4">
          <div class="flex items-center justify-between mb-1 flex-wrap gap-2">
            <h3 class="font-display text-lg font-semibold" style="color:var(--ink)">Arus kas</h3>
            <div class="flex gap-1 text-xs">
              <button class="period-btn chip" data-range="3">3 bulan</button>
              <button class="period-btn chip active" data-range="6">6 bulan</button>
              <button class="period-btn chip" data-range="12">1 tahun</button>
            </div>
          </div>
          <p class="text-sm mb-4" style="color:var(--ink-muted)">Pemasukan dan pengeluaran dari waktu ke waktu</p>
          <canvas id="cashflow-chart" height="220"></canvas>
        </div>

        <!-- BUDGET + KATEGORI -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
          <div class="lg:col-span-2 card card-hover rounded-2xl p-6">
            <h3 class="font-display text-lg font-semibold mb-4" style="color:var(--ink)">Budget bulan ini</h3>
            <p class="text-sm tabular-nums mb-1" style="color:var(--ink)"><span id="budget-used" class="font-semibold">Rp0</span> <span style="color:var(--ink-muted)">/ <span id="budget-total">Rp0</span></span></p>
            <div class="h-2.5 rounded-full mb-2" style="background:var(--surface-alt)"><div id="budget-bar" class="h-2.5 rounded-full bar-fill" data-w="0" style="background:var(--indigo)"></div></div>
            <p class="text-xs mb-4" style="color:var(--ink-muted)"><span id="budget-pct">0%</span> terpakai</p>
            <div class="rounded-xl p-3 mb-4" style="background:var(--surface-alt)">
              <p class="text-xs" style="color:var(--ink-muted)">Sisa budget</p>
              <p id="budget-remaining" class="text-lg font-semibold tabular-nums" style="color:var(--ink)">Rp0</p>
              <p class="text-xs mt-0.5" style="color:var(--ink-muted)">≈ <span id="budget-per-day" class="font-medium tabular-nums" style="color:var(--indigo)">Rp0</span> / hari agar tetap aman</p>
            </div>
            <div id="budget-mini-list" class="space-y-3"></div>
          </div>
          <div class="lg:col-span-3 card card-hover rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-display text-lg font-semibold" style="color:var(--ink)">Pengeluaran per kategori</h3>
              <button id="reset-cat-filter" class="hidden chip">✕ Reset filter</button>
            </div>
            <div id="category-list" class="space-y-3.5"></div>
            <p class="text-xs mt-4" style="color:var(--ink-muted)">Klik kategori untuk memfilter transaksi di panel sebelah.</p>
          </div>
        </div>

        <!-- SALDO -->
        <div class="card card-hover rounded-2xl p-6 mb-4">
          <h3 class="font-display text-lg font-semibold mb-1" style="color:var(--ink)">Pergerakan saldo</h3>
          <p class="text-sm mb-4" style="color:var(--ink-muted)">Saldo akhir setiap hari — bulan berjalan</p>
          <canvas id="balance-chart" height="180"></canvas>
        </div>

        <!-- ACCOUNTS + ACTIVITY -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div class="card card-hover rounded-2xl p-6">
            <h3 class="font-display text-lg font-semibold mb-4" style="color:var(--ink)">Akun</h3>
            <div id="account-list" class="space-y-1"></div>
          </div>
          <div class="card card-hover rounded-2xl p-6">
            <div class="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <h3 class="font-display text-lg font-semibold" style="color:var(--ink)">Transaksi terbaru</h3>
              <div class="flex items-center gap-2 rounded-lg px-2.5 py-1.5 w-40" style="background:var(--surface-alt); border:1px solid var(--border)">
                ${icon('search', 'w-3.5 h-3.5 shrink-0')}
                <input id="activity-search" type="text" placeholder="Cari…" class="bg-transparent text-xs w-full outline-none placeholder:opacity-60" style="color:var(--ink)" />
              </div>
            </div>
            <div class="flex gap-1.5 mb-4 overflow-x-auto pb-1">
              <button class="type-chip chip active" data-type="all">Semua</button>
              <button class="type-chip chip" data-type="income">Pemasukan</button>
              <button class="type-chip chip" data-type="expense">Pengeluaran</button>
              <button class="type-chip chip" data-type="transfer">Transfer</button>
            </div>
            <div id="activity-list" class="space-y-1 max-h-72 overflow-y-auto pr-1"></div>
            <p id="activity-empty" class="hidden text-sm text-center py-6" style="color:var(--ink-muted)">Tidak ada transaksi yang cocok.</p>
          </div>
        </div>

        <!-- INSIGHT -->
        <div class="mb-4">
          <h3 class="font-display text-lg font-semibold mb-4" style="color:var(--ink)">Insight keuangan</h3>
          <div id="insight-list" class="grid grid-cols-1 sm:grid-cols-3 gap-4"></div>
        </div>

        <!-- TARGET + AKAN DATANG -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div id="goal-featured"></div>
          <div class="card card-hover rounded-2xl p-6">
            <h3 class="font-display text-lg font-semibold mb-4 flex items-center gap-2" style="color:var(--ink)">${icon('calendar', 'w-4 h-4')} Akan datang</h3>
            <div id="upcoming-list" class="space-y-1"></div>
          </div>
        </div>

        <!-- MODAL: TAMBAH TRANSAKSI -->
        <div id="tx-modal" class="fixed inset-0 z-40 hidden items-center justify-center p-4">
          <div id="tx-modal-backdrop" class="absolute inset-0 modal-backdrop"></div>
          <form id="tx-form" class="relative w-full max-w-md rounded-2xl p-6 card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-display text-xl font-semibold" style="color:var(--ink)">Tambah transaksi</h3>
              <button type="button" id="tx-modal-close" class="p-1.5 rounded-lg btn-press" style="color:var(--ink-muted)">${icon('close', 'w-5 h-5')}</button>
            </div>
            <div class="grid grid-cols-3 gap-1.5 mb-4 rounded-lg p-1" style="background:var(--surface-alt)">
              <button type="button" data-txtype="income" class="tx-type-btn text-sm font-medium py-1.5 rounded-md">Pemasukan</button>
              <button type="button" data-txtype="expense" class="tx-type-btn text-sm font-medium py-1.5 rounded-md">Pengeluaran</button>
              <button type="button" data-txtype="transfer" class="tx-type-btn text-sm font-medium py-1.5 rounded-md">Transfer</button>
            </div>
            <div class="space-y-3">
              <div>
                <label class="text-xs font-medium block mb-1" style="color:var(--ink-muted)">Jumlah (Rp)</label>
                <input required id="tx-amount" type="number" min="1" placeholder="0" class="w-full rounded-lg px-3 py-2 text-sm outline-none" style="background:var(--surface-alt); border:1px solid var(--border); color:var(--ink)" />
              </div>
              <div>
                <label class="text-xs font-medium block mb-1" style="color:var(--ink-muted)">Deskripsi</label>
                <input required id="tx-desc" type="text" placeholder="Cth. Makan siang" class="w-full rounded-lg px-3 py-2 text-sm outline-none" style="background:var(--surface-alt); border:1px solid var(--border); color:var(--ink)" />
              </div>
              <div id="tx-category-wrap">
                <label class="text-xs font-medium block mb-1" style="color:var(--ink-muted)">Kategori</label>
                <select id="tx-category" class="w-full rounded-lg px-3 py-2 text-sm outline-none" style="background:var(--surface-alt); border:1px solid var(--border); color:var(--ink)"></select>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label id="tx-account-label" class="text-xs font-medium block mb-1" style="color:var(--ink-muted)">Akun</label>
                  <select id="tx-account" class="w-full rounded-lg px-3 py-2 text-sm outline-none" style="background:var(--surface-alt); border:1px solid var(--border); color:var(--ink)"></select>
                </div>
                <div id="tx-account-to-wrap">
                  <label class="text-xs font-medium block mb-1" style="color:var(--ink-muted)">Ke akun</label>
                  <select id="tx-account-to" class="w-full rounded-lg px-3 py-2 text-sm outline-none" style="background:var(--surface-alt); border:1px solid var(--border); color:var(--ink)"></select>
                </div>
              </div>
            </div>
            <button type="submit" class="w-full mt-5 py-2.5 rounded-lg text-sm font-semibold btn-press" style="background:var(--indigo); color:#fff;">Simpan transaksi</button>
          </form>
        </div>

        <div id="toast-stack" class="fixed bottom-4 right-4 z-50 space-y-2 w-72"></div>
    `;

    await this.loadData();
    this.renderAll();
    this.attachEvents();
    this.bindGlobalListenersOnce();
    this.setTutorial();
  },

  setTutorial() {
    tutorialPanel.setContent({
      eyebrow: 'PANDUAN',
      title: 'Dashboard',
      description: 'Ringkasan cepat kondisi keuanganmu bulan ini — saldo, arus kas, budget, dan apa yang perlu diperhatikan.',
      steps: [
        'Kartu paling atas menampilkan <b>total saldo</b> semua akun. Tombol "Bandingkan bulan lalu" menampilkan perubahan pemasukan/pengeluaran vs bulan sebelumnya.',
        'Klik <b>"Skor kesehatan"</b> di pojok kanan kartu saldo untuk melihat rincian cara perhitungannya.',
        '<b>Arus Kas</b> menunjukkan pemasukan vs pengeluaran dari waktu ke waktu — ganti rentang waktu (3 bulan/6 bulan/1 tahun) di kanan atas grafik.',
        '<b>Budget bulan ini</b> menampilkan sisa budget dan batas aman pengeluaran per hari. Di bawahnya ada progres tiap kategori budget.',
        'Klik salah satu <b>kategori</b> di daftar "Pengeluaran per kategori" untuk memfilter transaksi terkait di panel "Transaksi terbaru".',
        '<b>Pergerakan saldo</b> menunjukkan saldo harian bulan berjalan, mirip grafik saham.',
        '<b>Target</b> menampilkan tabungan yang progresnya paling dekat tercapai. <b>Akan datang</b> menampilkan tagihan/pemasukan terjadwal dalam 14 hari ke depan.',
        'Gunakan tombol <b>Tambah transaksi</b> untuk input manual, atau <b>Scan struk</b> untuk mengisi otomatis dari foto struk.'
      ],
      tip: 'Kartu di bagian "Insight keuangan" bisa ditutup satu per satu kalau sudah tidak relevan — akan muncul lagi otomatis kalau kondisinya berubah.'
    });
  },

  async loadData() {
    const [{ data: accounts }, { data: transactions }, { data: categories }, { data: budgets }, { data: goals }, { data: recurrings }] = await Promise.all([
      accountService.getAll(), transactionService.getAll(), categoryService.getAll(), budgetService.getAll(), goalService.getAll(), recurringTransactionService.getAll()
    ]);
    this.data.accounts = accounts || [];
    this.data.transactions = transactions || [];
    this.data.categories = categories || [];
    this.data.budgets = budgets || [];
    this.data.goals = goals || [];
    this.data.recurrings = recurrings || [];
  },

  // ---------- derived data ----------
  monthKey(d) { const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`; },
  isThisMonth(d) { const dt = new Date(d), n = new Date(); return dt.getMonth() === n.getMonth() && dt.getFullYear() === n.getFullYear(); },

  totals() {
    const balance = this.data.accounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);
    const txThisMonth = this.data.transactions.filter(t => this.isThisMonth(t.date));
    const income = txThisMonth.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
    const expense = txThisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
    const net = income - expense;
    const savings = income > 0 ? Math.round((net / income) * 100) : 0;
    return { balance, income, expense, net, savings };
  },

  monthlySeries(count) {
    const map = {};
    this.data.transactions.forEach(t => {
      const k = this.monthKey(t.date);
      if (!map[k]) map[k] = { income: 0, expense: 0 };
      if (t.type === 'income') map[k].income += Number(t.amount || 0);
      if (t.type === 'expense') map[k].expense += Number(t.amount || 0);
    });
    const now = new Date();
    const labels = [], income = [], expense = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      labels.push(d.toLocaleDateString('id-ID', { month: 'short' }));
      income.push((map[k]?.income || 0) / 1000000);
      expense.push((map[k]?.expense || 0) / 1000000);
    }
    return { labels, income, expense };
  },

  dailyFinancialTimeline() {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentBalance = this.data.accounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);
    const txs = this.data.transactions.filter(t => this.isThisMonth(t.date));
    const netThisMonth = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0) - txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
    const openingBalance = currentBalance - netThisMonth;
    const balance = Array(daysInMonth).fill(0);
    let runningBalance = openingBalance;
    for (let d = 1; d <= daysInMonth; d++) {
      txs.filter(t => new Date(t.date).getDate() === d).forEach(t => {
        if (t.type === 'income') runningBalance += Number(t.amount || 0);
        else if (t.type === 'expense') runningBalance -= Number(t.amount || 0);
      });
      balance[d - 1] = runningBalance;
    }
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return { labels, balance };
  },

  categoryBreakdown() {
    const txThisMonth = this.data.transactions.filter(t => t.type === 'expense' && this.isThisMonth(t.date));
    const totalExpense = txThisMonth.reduce((s, t) => s + Number(t.amount || 0), 0) || 1;
    return this.data.categories.map(c => {
      const spent = txThisMonth.filter(t => t.category_id === c.id).reduce((s, t) => s + Number(t.amount || 0), 0);
      return { ...c, spent, pct: Math.round((spent / totalExpense) * 100) };
    }).filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent);
  },

  spendingPattern() {
    const txThisMonth = this.data.transactions.filter(t => t.type === 'expense' && this.isThisMonth(t.date));
    if (!txThisMonth.length) return [];
    const now = new Date();
    const daysSoFar = now.getDate();
    const total = txThisMonth.reduce((s, t) => s + Number(t.amount || 0), 0);
    const avgDaily = total / daysSoFar;

    const byDay = {};
    txThisMonth.forEach(t => { const d = new Date(t.date).getDate(); byDay[d] = (byDay[d] || 0) + Number(t.amount || 0); });
    const entries = Object.entries(byDay);
    const maxDay = entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0]);

    let weekendTotal = 0, weekendCount = 0, weekdayTotal = 0, weekdayCount = 0;
    txThisMonth.forEach(t => {
      const day = new Date(t.date).getDay();
      if (day === 0 || day === 6) { weekendTotal += Number(t.amount || 0); weekendCount++; }
      else { weekdayTotal += Number(t.amount || 0); weekdayCount++; }
    });
    const weekendAvg = weekendCount ? weekendTotal / weekendCount : 0;
    const weekdayAvg = weekdayCount ? weekdayTotal / weekdayCount : 0;
    const diffPct = weekdayAvg > 0 ? Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100) : 0;

    return { avgDaily, maxDay, weekendCount, weekdayCount, diffPct };
  },

  budgetStatus(pct) {
    if (pct >= 100) return { label: 'Terlampaui', tone: 'coral' };
    if (pct >= 80) return { label: 'Warning', tone: 'amber' };
    return { label: 'Aman', tone: 'emerald' };
  },

  budgetSummary() {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1);
    const totalBudget = this.data.budgets.reduce((s, b) => s + Number(b.amount || 0), 0);
    const totalSpent = this.data.budgets.reduce((s, b) => {
      return s + this.data.transactions.filter(t => t.type === 'expense' && (!b.category_id || t.category_id === b.category_id) && this.isThisMonth(t.date)).reduce((s2, t) => s2 + Number(t.amount || 0), 0);
    }, 0);
    const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const remaining = Math.max(0, totalBudget - totalSpent);
    const perDay = remaining / daysLeft;
    return { totalBudget, totalSpent, pct, remaining, perDay };
  },

  healthScore(totals) {
    if (!this.data.accounts.length && !this.data.transactions.length && !this.data.budgets.length) return 0;
    const budgetPcts = this.data.budgets.map(b => {
      const spent = this.data.transactions.filter(t => t.type === 'expense' && (!b.category_id || t.category_id === b.category_id) && this.isThisMonth(t.date)).reduce((s, t) => s + Number(t.amount || 0), 0);
      return Number(b.amount) > 0 ? (spent / Number(b.amount)) * 100 : 0;
    });
    const overage = budgetPcts.length ? budgetPcts.reduce((s, p) => s + Math.max(0, p - 100), 0) / budgetPcts.length : 0;
    const budgetScore = Math.max(0, 100 - overage);
    const savingsScore = Math.max(0, Math.min(100, totals.savings));
    return Math.round(savingsScore * 0.65 + budgetScore * 0.35);
  },

  featuredGoal() {
    if (!this.data.goals.length) return null;
    return [...this.data.goals].sort((a, b) => (b.current_amount / b.target_amount) - (a.current_amount / a.target_amount))[0];
  },

  upcomingItems() {
    const now = new Date();
    const horizon = new Date(now); horizon.setDate(horizon.getDate() + 14);
    const catMap = {}; this.data.categories.forEach(c => { catMap[c.id] = c.name; });
    return this.data.recurrings
      .filter(r => r.active && new Date(r.next_date) >= new Date(now.toDateString()) && new Date(r.next_date) <= horizon)
      .sort((a, b) => new Date(a.next_date) - new Date(b.next_date))
      .slice(0, 6)
      .map(r => ({ ...r, categoryName: catMap[r.category_id] }));
  },

  buildInsights(totals) {
    const insights = [];
    const cats = this.categoryBreakdown();
    if (cats[0]) {
      insights.push({ id: 'top-category', icon: categoryIcon(cats[0].name), tone: 'indigo', html: `<b>${cats[0].name}</b> menyumbang <b>${cats[0].pct}%</b> dari pengeluaran bulan ini.` });
    }
    const pattern = this.spendingPattern();
    if (pattern.maxDay) {
      insights.push({ id: 'top-day', icon: 'warning', tone: 'coral', html: `Hari terboros: <b>Tanggal ${pattern.maxDay[0]}</b> — ${rupiah(pattern.maxDay[1])}.` });
    }
    this.data.budgets.forEach(b => {
      const cat = this.data.categories.find(c => c.id === b.category_id);
      const spent = this.data.transactions.filter(t => t.type === 'expense' && (!b.category_id || t.category_id === b.category_id) && this.isThisMonth(t.date)).reduce((s, t) => s + Number(t.amount || 0), 0);
      const pct = Number(b.amount) > 0 ? Math.round((spent / Number(b.amount)) * 100) : 0;
      if (pct >= 80) {
        insights.push({ id: `budget-${b.id}`, icon: 'warning', tone: pct >= 100 ? 'coral' : 'amber', html: `Budget <b>${cat?.name || 'Semua kategori'}</b> sudah ${pct}% terpakai.` });
      }
    });
    if (totals.income > 0) {
      insights.push({ id: 'savings', icon: 'leaf', tone: 'emerald', html: `Kamu menyisihkan <b>${totals.savings}%</b> dari pemasukan bulan ini.` });
    }
    const uncategorized = this.data.transactions.filter(t => t.type === 'expense' && !t.category_id && this.isThisMonth(t.date)).length;
    if (uncategorized > 0) {
      insights.push({ id: 'uncategorized', icon: 'warning', tone: 'amber', html: `<b>${uncategorized}</b> transaksi bulan ini belum dikategorikan.` });
    }
    return insights.slice(0, 3);
  },

  // ---------- render ----------
  renderAll() {
    const totals = this.totals();
    this.renderHero(totals);
    this.renderAccounts();
    this.renderCategoryList();
    this.renderBudgetSummary();
    this.renderActivity();
    this.renderGoalFeatured();
    this.renderUpcoming();
    this.renderInsights(totals);
    this.renderCharts();
    this.observeBars();
  },

  countUp(el, to, { prefix = '', suffix = '' } = {}) {
    if (!el) return;
    const duration = 700, start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(to * eased).toLocaleString('id-ID') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },

  renderHero(totals) {
    const el = (id) => document.getElementById(id);
    this.countUp(el('stat-balance'), totals.balance, { prefix: 'Rp' });
    el('stat-net').textContent = (totals.net >= 0 ? '+' : '-') + rupiah(Math.abs(totals.net));
    el('stat-net-row').style.color = totals.net >= 0 ? 'var(--emerald)' : 'var(--coral)';
    this.countUp(el('stat-income'), totals.income, { prefix: 'Rp' });
    this.countUp(el('stat-expense'), totals.expense, { prefix: 'Rp' });
    this.countUp(el('stat-savings'), totals.savings, { suffix: '%' });

    const score = this.healthScore(totals);
    el('mini-health-score').textContent = score;
  },

  renderAccounts() {
    const total = this.data.accounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);
    document.getElementById('account-list').innerHTML = this.data.accounts.map(a => `
      <div class="flex items-center justify-between py-3" style="border-bottom:1px solid var(--border)">
        <div class="flex items-center gap-3">
          <span class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:var(--indigo-soft); color:var(--indigo)">${icon(accountIcon(a.type), 'w-4 h-4')}</span>
          <div><p class="text-sm font-medium" style="color:var(--ink)">${a.name}</p><p class="text-xs" style="color:var(--ink-muted)">${accountTypeLabel(a.type)}</p></div>
        </div>
        <span class="text-sm font-semibold tabular-nums" style="color:var(--ink)">${rupiah(a.current_balance)}</span>
      </div>`).join('') || `<p class="text-sm" style="color:var(--ink-muted)">Belum punya akun. Buat akun pertama di menu Akun.</p>`;
    if (this.data.accounts.length) {
      document.getElementById('account-list').insertAdjacentHTML('beforeend', `
        <div class="flex items-center justify-between pt-3 text-sm font-semibold" style="color:var(--ink)">
          <span>${this.data.accounts.length} akun</span><span class="tabular-nums">${rupiah(total)}</span>
        </div>`);
    }
  },

  renderCategoryList() {
    const cats = this.categoryBreakdown();
    document.getElementById('category-list').innerHTML = cats.map(c => `
      <button type="button" data-cat="${c.id}" class="cat-row w-full text-left">
        <div class="flex justify-between text-sm mb-1" style="color:var(--ink)">
          <span class="flex items-center gap-2">${icon(categoryIcon(c.name), 'w-4 h-4')} ${c.name}</span>
          <span class="tabular-nums font-medium">${rupiah(c.spent)} · ${c.pct}%</span>
        </div>
        <div class="h-2 rounded-full" style="background:var(--surface-alt)">
          <div class="h-2 rounded-full bar-fill" data-w="${c.pct}" style="background:${c.color || 'var(--indigo)'}"></div>
        </div>
      </button>`).join('') || `<p class="text-sm" style="color:var(--ink-muted)">Belum ada pengeluaran bulan ini.</p>`;

    document.querySelectorAll('.cat-row').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.cat;
      this.ui.activeCategory = this.ui.activeCategory === id ? null : id;
      document.getElementById('reset-cat-filter').classList.toggle('hidden', !this.ui.activeCategory);
      this.ui.activeType = 'expense';
      document.querySelectorAll('.type-chip').forEach(b => b.classList.toggle('active', b.dataset.type === 'expense'));
      this.renderActivity();
    }));
  },

  renderBudgetSummary() {
    const s = this.budgetSummary();
    const el = (id) => document.getElementById(id);
    el('budget-used').textContent = rupiah(s.totalSpent);
    el('budget-total').textContent = rupiah(s.totalBudget);
    el('budget-pct').textContent = `${s.pct}%`;
    el('budget-bar').dataset.w = Math.min(100, s.pct);
    el('budget-bar').style.background = s.pct >= 100 ? 'var(--coral)' : s.pct >= 80 ? 'var(--amber)' : 'var(--indigo)';
    el('budget-remaining').textContent = rupiah(s.remaining);
    el('budget-per-day').textContent = rupiah(Math.round(s.perDay));

    document.getElementById('budget-mini-list').innerHTML = this.data.budgets.map(b => {
      const cat = this.data.categories.find(c => c.id === b.category_id);
      const spent = this.data.transactions.filter(t => t.type === 'expense' && (!b.category_id || t.category_id === b.category_id) && this.isThisMonth(t.date)).reduce((s2, t) => s2 + Number(t.amount || 0), 0);
      const realPct = Number(b.amount) > 0 ? Math.round((spent / Number(b.amount)) * 100) : 0;
      const st = this.budgetStatus(realPct);
      return `
      <div>
        <div class="flex justify-between text-xs mb-1" style="color:var(--ink)">
          <span>${cat?.name || 'Semua kategori'}</span>
          <span class="tabular-nums" style="color:var(--${st.tone})">${realPct}%</span>
        </div>
        <div class="h-1.5 rounded-full" style="background:var(--surface-alt)"><div class="h-1.5 rounded-full bar-fill" data-w="${Math.min(100, realPct)}" style="background:var(--${st.tone})"></div></div>
      </div>`;
    }).join('') || `<p class="text-xs" style="color:var(--ink-muted)">Belum ada budget. Buat di menu Budget.</p>`;
  },

  renderActivity() {
    let list = [...this.data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (this.ui.activeType !== 'all') list = list.filter(t => t.type === this.ui.activeType);
    if (this.ui.activeCategory) list = list.filter(t => t.category_id === this.ui.activeCategory);
    if (this.ui.search) {
      const q = this.ui.search.toLowerCase();
      list = list.filter(t => (t.description || '').toLowerCase().includes(q));
    }
    const catMap = {}; this.data.categories.forEach(c => { catMap[c.id] = c.name; });
    const toneOf = (t) => t.type === 'income' ? 'emerald' : t.type === 'expense' ? 'coral' : 'indigo';
    const signOf = (t) => t.type === 'income' ? '+' : t.type === 'expense' ? '-' : '';

    document.getElementById('activity-list').innerHTML = list.slice(0, 20).map(t => `
      <div class="flex items-center gap-3 py-2.5 slide-in" style="border-bottom:1px solid var(--border)">
        <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style="background:var(--${toneOf(t)}-soft); color:var(--${toneOf(t)})">${icon(t.type, 'w-4 h-4')}</span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium truncate" style="color:var(--ink)">${t.description || '-'}</p>
          <p class="text-xs" style="color:var(--ink-muted)">${catMap[t.category_id] || t.type} · ${new Date(t.date).toLocaleDateString('id-ID')}</p>
        </div>
        <span class="text-sm font-semibold tabular-nums shrink-0" style="color:var(--${toneOf(t)})">${signOf(t)}${rupiah(t.amount)}</span>
      </div>`).join('');
    document.getElementById('activity-empty').classList.toggle('hidden', list.length > 0);
  },

  renderGoalFeatured() {
    const g = this.featuredGoal();
    const wrap = document.getElementById('goal-featured');
    if (!g) {
      wrap.innerHTML = `
      <div class="card rounded-2xl p-6">
        <h3 class="font-display text-lg font-semibold mb-2" style="color:var(--ink)">Target tabungan</h3>
        <p class="text-sm mb-3" style="color:var(--ink-muted)">Belum punya target tabungan. Tentukan tujuan dan mulai sisihkan uang.</p>
        <button id="btn-create-goal" class="text-xs font-semibold px-3 py-1.5 rounded-lg btn-press" style="background:var(--indigo-soft); color:var(--indigo)">Buat target</button>
      </div>`;
      return;
    }
    const pct = Math.min(100, Math.round((Number(g.current_amount || 0) / Number(g.target_amount || 1)) * 100));
    const others = this.data.goals.length - 1;
    wrap.innerHTML = `
      <div class="card card-hover rounded-2xl p-6" id="goal-${g.id}">
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-sm flex items-center gap-1.5" style="color:var(--ink-muted)">${icon(goalIcon(g.name), 'w-4 h-4')} Target tabungan</p>
            <h4 class="font-display text-xl font-semibold mt-0.5" style="color:var(--ink)">${g.name}</h4>
          </div>
          <span class="text-sm font-semibold px-2.5 py-1 rounded-full" style="background:var(--indigo-soft); color:var(--indigo)">${pct}%</span>
        </div>
        <div class="h-2.5 rounded-full mb-3" style="background:var(--surface-alt)"><div class="h-2.5 rounded-full bar-fill" data-w="${pct}" style="background:var(--indigo)"></div></div>
        <div class="flex justify-between text-sm tabular-nums" style="color:var(--ink)">
          <span style="color:var(--ink-muted)">${rupiah(g.current_amount || 0)} terkumpul</span>
          <span class="font-medium">dari ${rupiah(g.target_amount)}</span>
        </div>
        <div class="mt-3 flex items-center gap-2">
          <button type="button" data-goaladd="${g.id}" class="add-goal-btn text-xs font-semibold px-3 py-1.5 rounded-lg btn-press" style="background:var(--indigo-soft); color:var(--indigo)">+ Nabung</button>
          <input type="number" min="1" placeholder="Jumlah" data-goalinput="${g.id}" class="hidden goal-input text-xs w-28 rounded-lg px-2 py-1.5 outline-none" style="background:var(--surface-alt); border:1px solid var(--border); color:var(--ink)" />
          <button type="button" data-goalconfirm="${g.id}" class="hidden goal-confirm text-xs font-semibold px-2.5 py-1.5 rounded-lg btn-press" style="background:var(--indigo); color:#fff;">OK</button>
        </div>
        ${others > 0 ? `<p class="mt-3 text-xs" style="color:var(--ink-muted)">+${others} target lainnya</p>` : ''}
      </div>`;

    document.querySelectorAll('.add-goal-btn').forEach(btn => btn.addEventListener('click', () => {
      btn.classList.add('hidden');
      document.querySelector(`[data-goalinput="${btn.dataset.goaladd}"]`).classList.remove('hidden');
      document.querySelector(`[data-goalconfirm="${btn.dataset.goaladd}"]`).classList.remove('hidden');
      document.querySelector(`[data-goalinput="${btn.dataset.goaladd}"]`).focus();
    }));
    document.querySelectorAll('.goal-confirm').forEach(btn => btn.addEventListener('click', () => this.contributeToGoal(btn.dataset.goalconfirm)));
  },

  async contributeToGoal(goalId) {
    const input = document.querySelector(`[data-goalinput="${goalId}"]`);
    const amount = Number(input.value);
    if (!amount || amount <= 0) { showToast('Masukkan jumlah yang valid.', 'error'); return; }
    const goal = this.data.goals.find(g => g.id === goalId);
    const newAmount = Math.min(Number(goal.target_amount), Number(goal.current_amount || 0) + amount);
    try {
      await goalService.update(goalId, { current_amount: newAmount });
      const reached = newAmount >= Number(goal.target_amount);
      await this.loadData();
      this.renderAll();
      showToast(reached ? `🎉 Target "${goal.name}" tercapai!` : `${rupiah(amount)} ditambahkan ke "${goal.name}".`, reached ? 'success' : 'info');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan tabungan. Cek koneksi/izin akun.', 'error');
    }
  },

  renderUpcoming() {
    const items = this.upcomingItems();
    document.getElementById('upcoming-list').innerHTML = items.map(r => {
      const tone = r.type === 'income' ? 'emerald' : 'coral';
      const sign = r.type === 'income' ? '+' : '-';
      return `
      <div class="flex items-center justify-between py-2.5" style="border-bottom:1px solid var(--border)">
        <div class="min-w-0">
          <p class="text-sm font-medium truncate" style="color:var(--ink)">${r.description || r.categoryName || '-'}</p>
          <p class="text-xs" style="color:var(--ink-muted)">${new Date(r.next_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
        </div>
        <span class="text-sm font-semibold tabular-nums shrink-0" style="color:var(--${tone})">${sign}${rupiah(r.amount)}</span>
      </div>`;
    }).join('') || `<p class="text-sm" style="color:var(--ink-muted)">Tidak ada tagihan/pemasukan terjadwal dalam 14 hari ke depan.</p>`;
  },

  renderInsights(totals) {
    const insights = this.buildInsights(totals);
    document.getElementById('insight-list').innerHTML = insights.map(i => `
      <div id="insight-${i.id}" class="card-hover rounded-2xl p-5 relative" style="background:var(--${i.tone}-soft); border:1px solid var(--border)">
        <button type="button" data-dismiss="${i.id}" class="absolute top-3 right-3 p-1 rounded" style="color:var(--ink-muted)" aria-label="Tutup">${icon('close', 'w-3.5 h-3.5')}</button>
        <p class="mb-2" style="color:var(--${i.tone})">${icon(i.icon, 'w-5 h-5')}</p>
        <p class="text-sm leading-relaxed pr-4" style="color:var(--ink)">${i.html}</p>
      </div>`).join('') || `<p class="text-sm" style="color:var(--ink-muted)">Belum ada insight bulan ini.</p>`;

    document.querySelectorAll('[data-dismiss]').forEach(btn => btn.addEventListener('click', () => {
      const card = document.getElementById(`insight-${btn.dataset.dismiss}`);
      card.classList.add('fade-out');
      setTimeout(() => card.remove(), 300);
    }));
  },

  renderCharts() {
    if (typeof Chart === 'undefined') {
      document.getElementById('cashflow-chart').parentElement.innerHTML = '<p class="text-sm" style="color:var(--ink-muted)">Chart.js belum dimuat. Tambahkan CDN-nya di index.html.</p>';
      return;
    }
    const styles = getComputedStyle(document.documentElement);
    Chart.defaults.color = styles.getPropertyValue('--ink').trim();
    Chart.defaults.borderColor = styles.getPropertyValue('--border').trim();
    Chart.defaults.font.family = 'Inter';
    const cEmerald = styles.getPropertyValue('--emerald').trim();
    const cCoral = styles.getPropertyValue('--coral').trim();
    const cIndigo = styles.getPropertyValue('--indigo').trim();

    if (this.charts.cashflow) this.charts.cashflow.destroy();
    if (this.charts.balance) this.charts.balance.destroy();

    const activeRange = document.querySelector('.period-btn.active')?.dataset.range || '6';
    const series = this.monthlySeries(Number(activeRange));
    this.charts.cashflow = new Chart(document.getElementById('cashflow-chart'), {
      type: 'line',
      data: {
        labels: series.labels,
        datasets: [
          { label: 'Pemasukan (juta)', data: series.income, borderColor: cEmerald, backgroundColor: cEmerald + '33', tension: .35, fill: true, pointRadius: 3 },
          { label: 'Pengeluaran (juta)', data: series.expense, borderColor: cCoral, backgroundColor: cCoral + '22', tension: .35, fill: true, pointRadius: 3 }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
    });

    document.querySelectorAll('.period-btn').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const d = this.monthlySeries(Number(btn.dataset.range));
      this.charts.cashflow.data.labels = d.labels;
      this.charts.cashflow.data.datasets[0].data = d.income;
      this.charts.cashflow.data.datasets[1].data = d.expense;
      this.charts.cashflow.update();
    }));

    const timeline = this.dailyFinancialTimeline();
    this.charts.balance = new Chart(document.getElementById('balance-chart'), {
      type: 'line',
      data: {
        labels: timeline.labels,
        datasets: [
          { label: 'Saldo', data: timeline.balance, borderColor: cIndigo, backgroundColor: cIndigo + '22', tension: .25, fill: true, pointRadius: 2, pointHoverRadius: 5 }
        ]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false }, x: { grid: { display: false }, ticks: { maxTicksLimit: 15 } } } }
    });
  },

  observeBars() {
    if (this._barObserver) this._barObserver.disconnect();
    this._barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          requestAnimationFrame(() => { el.style.width = el.dataset.w + '%'; });
          this._barObserver.unobserve(el);
        }
      });
    }, { threshold: .2 });
    document.querySelectorAll('.bar-fill').forEach(el => this._barObserver.observe(el));
  },

  // ---------- events ----------
  attachEvents() {
    document.getElementById('reset-cat-filter').addEventListener('click', () => {
      this.ui.activeCategory = null;
      document.getElementById('reset-cat-filter').classList.add('hidden');
      this.renderActivity();
    });

    document.querySelectorAll('.type-chip').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('.type-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.ui.activeType = btn.dataset.type;
      this.renderActivity();
    }));

    document.getElementById('activity-search').addEventListener('input', (e) => {
      this.ui.search = e.target.value;
      this.renderActivity();
    });

    document.getElementById('compare-switch').addEventListener('click', (e) => {
      e.currentTarget.classList.toggle('on');
      document.getElementById('compare-row').classList.toggle('hidden');
      if (e.currentTarget.classList.contains('on')) this.renderCompare();
    });

    document.getElementById('btn-add-tx').addEventListener('click', () => this.openModal());
    document.getElementById('tx-modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('tx-modal-backdrop').addEventListener('click', () => this.closeModal());
    document.querySelectorAll('.tx-type-btn').forEach(b => b.addEventListener('click', () => this.setTxType(b.dataset.txtype)));
    document.getElementById('tx-form').addEventListener('submit', (e) => this.submitTransaction(e));

    document.getElementById('btn-export-excel').addEventListener('click', () => this.exportExcel());
    document.getElementById('btn-export-pdf').addEventListener('click', () => this.exportPDF());
    document.getElementById('btn-scan-receipt').addEventListener('click', () => this.scanReceipt());

    document.getElementById('btn-health-info').addEventListener('click', () => this.showHealthInfo());
    document.getElementById('btn-close-health-info').addEventListener('click', () => this.closeHealthInfo());
    document.getElementById('health-info-backdrop').addEventListener('click', () => this.closeHealthInfo());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeHealthInfo(); });

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.id = 'ocr-file-input';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (e) => this.handleOCRFile(e));
    document.body.appendChild(fileInput);
  },

  bindGlobalListenersOnce() {
    if (this._globalListenersBound) return;
    this._globalListenersBound = true;
    document.addEventListener('search:changed', (e) => {
      const input = document.getElementById('activity-search');
      if (!input) return;
      input.value = e.detail.query;
      this.ui.search = e.detail.query;
      this.renderActivity();
    });
    document.addEventListener('global-search', (e) => {
      const input = document.getElementById('activity-search');
      if (!input) return;
      input.value = e.detail.query;
      this.ui.search = e.detail.query;
      this.renderActivity();
    });
    document.addEventListener('theme:changed', () => {
      if (document.getElementById('cashflow-chart')) this.renderCharts();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeModal(); });
  },

  renderCompare() {
    const series = this.monthlySeries(2);
    const prevIncome = series.income[0] * 1000000, curIncome = series.income[1] * 1000000;
    const prevExpense = series.expense[0] * 1000000, curExpense = series.expense[1] * 1000000;
    const diff = (a, b) => a - b;
    const pct = (a, b) => (b > 0 ? Math.round(((a - b) / b) * 100) : 0);
    document.getElementById('compare-row').innerHTML = `
      <div><p style="color:var(--ink-muted)">Pemasukan vs bulan lalu</p><p class="font-semibold mt-0.5" style="color:var(--ink)">${diff(curIncome, prevIncome) >= 0 ? '+' : ''}${rupiah(diff(curIncome, prevIncome))} (${pct(curIncome, prevIncome)}%)</p></div>
      <div><p style="color:var(--ink-muted)">Pengeluaran vs bulan lalu</p><p class="font-semibold mt-0.5" style="color:var(--ink)">${diff(curExpense, prevExpense) >= 0 ? '+' : ''}${rupiah(diff(curExpense, prevExpense))} (${pct(curExpense, prevExpense)}%)</p></div>
      <div><p style="color:var(--ink-muted)">Net vs bulan lalu</p><p class="font-semibold mt-0.5" style="color:var(--ink)">${rupiah(diff(curIncome - curExpense, prevIncome - prevExpense))}</p></div>
    `;
  },

  // ---------- modal tambah transaksi ----------
  fillSelects() {
    const catSel = document.getElementById('tx-category');
    catSel.innerHTML = this.data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const accSel = document.getElementById('tx-account'), accToSel = document.getElementById('tx-account-to');
    const opts = this.data.accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    accSel.innerHTML = opts;
    accToSel.innerHTML = opts;
    if (this.data.accounts[1]) accToSel.value = this.data.accounts[1].id;
  },

  setTxType(type) {
    this.ui.txType = type;
    document.querySelectorAll('.tx-type-btn').forEach(b => {
      const active = b.dataset.txtype === type;
      b.style.background = active ? 'var(--indigo)' : 'transparent';
      b.style.color = active ? '#fff' : 'var(--ink-muted)';
    });
    document.getElementById('tx-category-wrap').classList.toggle('hidden', type !== 'expense');
    document.getElementById('tx-account-to-wrap').classList.toggle('hidden', type !== 'transfer');
    document.getElementById('tx-account-label').textContent = type === 'transfer' ? 'Dari akun' : 'Akun';
  },

  openModal() {
    if (!this.data.accounts.length) { showToast('Buat akun dulu sebelum menambah transaksi.', 'error'); return; }
    this.fillSelects();
    this.setTxType('expense');
    document.getElementById('tx-amount').value = '';
    document.getElementById('tx-desc').value = '';
    const modal = document.getElementById('tx-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => document.getElementById('tx-amount').focus(), 50);
  },

  closeModal() {
    const modal = document.getElementById('tx-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  },

  showHealthInfo() {
    const totals = this.totals();
    const budgetPcts = this.data.budgets.map(b => {
      const spent = this.data.transactions.filter(t => t.type === 'expense' && t.category_id === b.category_id && this.isThisMonth(t.date)).reduce((s, t) => s + Number(t.amount || 0), 0);
      return Number(b.amount) > 0 ? (spent / Number(b.amount)) * 100 : 0;
    });
    const overage = budgetPcts.length ? budgetPcts.reduce((s, p) => s + Math.max(0, p - 100), 0) / budgetPcts.length : 0;
    const budgetScore = Math.max(0, 100 - overage);
    const savingsScore = Math.max(0, Math.min(100, totals.savings));
    const score = Math.round(savingsScore * 0.65 + budgetScore * 0.35);

    const el = (id) => document.getElementById(id);
    el('health-info-content').innerHTML = `
      <div class="rounded-xl p-4" style="background:var(--surface-alt)">
        <p class="font-semibold mb-2" style="color:var(--ink)">Rumus</p>
        <p class="font-mono text-xs leading-relaxed">
          <code>Skor = SavingsScore × 0.65 + BudgetScore × 0.35</code><br>
          <code>SavingsScore = (Pemasukan − Pengeluaran) ÷ Pemasukan × 100</code><br>
          <code>BudgetScore = 100 − rata-rata overage budget</code>
        </p>
      </div>
      <div class="rounded-xl p-4" style="background:var(--surface-alt)">
        <p class="font-semibold mb-3" style="color:var(--ink)">Perhitungan Bulan Ini</p>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between"><span>Pemasukan</span><span class="font-semibold" style="color:var(--ink)">${rupiah(totals.income)}</span></div>
          <div class="flex justify-between"><span>Pengeluaran</span><span class="font-semibold" style="color:var(--ink)">${rupiah(totals.expense)}</span></div>
          <div class="flex justify-between"><span>Net (Pemasukan − Pengeluaran)</span><span class="font-semibold" style="color:var(--ink)">${rupiah(totals.net)}</span></div>
          <div class="flex justify-between border-t pt-2" style="border-color:var(--border)"><span>SavingsScore</span><span class="font-semibold" style="color:var(--ink)">${savingsScore.toFixed(0)} / 100 ${totals.savings < 0 ? '(negatif)' : '(' + totals.savings + '%)'}</span></div>
          <div class="flex justify-between"><span>BudgetScore (overage rata-rata: ${overage.toFixed(1)}%)</span><span class="font-semibold" style="color:var(--ink)">${budgetScore.toFixed(1)}</span></div>
          <div class="flex justify-between border-t pt-2" style="border-color:var(--border)"><span class="font-semibold" style="color:var(--ink)">Skor Akhir</span><span class="font-display text-lg font-bold" style="color:var(--indigo)">${score} / 100</span></div>
        </div>
      </div>
      <button type="button" id="btn-health-info-ok" class="w-full py-2 rounded-lg text-sm font-medium btn-press" style="background:var(--indigo); color:#fff;">Tutup</button>
    `;
    const modal = document.getElementById('health-info-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.getElementById('btn-health-info-ok').addEventListener('click', () => this.closeHealthInfo());
  },

  closeHealthInfo() {
    const modal = document.getElementById('health-info-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  },

  async submitTransaction(e) {
    e.preventDefault();
    const amount = Number(document.getElementById('tx-amount').value);
    const description = document.getElementById('tx-desc').value.trim();
    const type = this.ui.txType;
    const accountId = document.getElementById('tx-account').value;
    if (!amount || amount <= 0 || !description || !accountId) { showToast('Lengkapi jumlah, deskripsi, dan akun.', 'error'); return; }

    const now = new Date();
    const payload = {
      type, amount, description,
      date: now.toISOString(),
      account_id: accountId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      source: 'manual'
    };
    if (type === 'expense') payload.category_id = document.getElementById('tx-category').value;
    if (type === 'transfer') {
      payload.to_account_id = document.getElementById('tx-account-to').value;
      if (payload.to_account_id === accountId) { showToast('Akun tujuan harus berbeda.', 'error'); return; }
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      const { error } = await transactionService.create(payload);
      if (error) throw error;
      await this.loadData();
      this.renderAll();
      this.closeModal();
      showToast('Transaksi ditambahkan.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan transaksi. Cek koneksi atau coba lagi.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  },

  async exportExcel() {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const { data: transactions } = await transactionService.getByMonth(month, year);
    if (!transactions || !transactions.length) { showToast('Tidak ada data untuk diekspor.', 'error'); return; }
    try {
      await exportService.exportToExcel(transactions.map(t => ({ date: t.date, description: t.description, type: t.type, amount: Number(t.amount), category_id: t.category_id })));
      showToast('Excel berhasil diekspor!', 'success');
    } catch (e) { showToast('Gagal export Excel.', 'error'); }
  },

  async exportPDF() {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const { data: transactions } = await transactionService.getByMonth(month, year);
    if (!transactions || !transactions.length) { showToast('Tidak ada data untuk diekspor.', 'error'); return; }
    try {
      await exportService.exportToPDF();
      showToast('PDF berhasil diekspor!', 'success');
    } catch (e) { showToast('Gagal export PDF.', 'error'); }
  },

  async scanReceipt() {
    const input = document.getElementById('ocr-file-input');
    if (input) input.click();
  },

  async handleOCRFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    showToast('Sedang memindai struk...', 'info');
    try {
      const result = await ocrService.extractFromImage(file);
      if (result.items.length > 0) {
        const total = result.items.reduce((s, item) => s + (item.amount || 0), 0);
        showToast(`Struk terdeteksi: ${result.items.length} item, total Rp${Math.round(total).toLocaleString('id-ID')}`, 'success');
        const desc = result.items.map(i => i.description).join(', ').substring(0, 100);
        this.openModal();
        setTimeout(() => {
          const amtInput = document.getElementById('tx-amount');
          if (amtInput) amtInput.value = Math.round(total);
          const descInput = document.getElementById('tx-desc');
          if (descInput) descInput.value = desc;
        }, 500);
      } else {
        showToast('Tidak ada angka yang terdeteksi dari struk.', 'amber');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal scan struk. Coba lagi.', 'error');
    }
    e.target.value = '';
  }
};