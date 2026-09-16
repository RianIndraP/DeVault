import { transactionService } from '../services/database.js';
import { exportService } from '../services/export.js';
import { icon } from '../components/icons.js';

export const reportsPage = {
  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    container.innerHTML = `
      <div>
        <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 class="font-display text-3xl font-semibold" style="color:var(--ink)">Laporan</h1>
            <p class="mt-1 text-sm" style="color:var(--ink-muted)">Lihat laporan keuangan per bulan</p>
          </div>
          <div class="flex gap-2">
            <button id="btn-export-excel" class="text-sm font-medium px-4 py-2 rounded-lg focus-ring btn-press flex items-center gap-1.5" style="background:var(--emerald); color:#fff;">
              ${icon('download', 'w-4 h-4')} Export Excel
            </button>
            <button id="btn-export-pdf" class="text-sm font-medium px-4 py-2 rounded-lg focus-ring btn-press flex items-center gap-1.5" style="background:var(--coral); color:#fff;">
              ${icon('file', 'w-4 h-4')} Export PDF
            </button>
          </div>
        </div>
        <div class="card card-hover rounded-2xl p-6 mb-6">
          <div class="flex flex-wrap gap-4 items-end">
            <div>
              <label class="text-xs font-medium block mb-1" style="color:var(--ink-muted)">Bulan</label>
              <select id="report-month" class="w-full rounded-lg px-3 py-2 text-sm outline-none" style="background:var(--surface-alt); border:1px solid var(--border); color:var(--ink)">
                ${Array.from({length: 12}, (_, i) => `<option value="${i + 1}">${new Date(2024, i).toLocaleString('id-ID', {month: 'long'})}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="text-xs font-medium block mb-1" style="color:var(--ink-muted)">Tahun</label>
              <input type="number" id="report-year" class="w-full rounded-lg px-3 py-2 text-sm outline-none" value="${new Date().getFullYear()}" min="2000" max="2030" style="background:var(--surface-alt); border:1px solid var(--border); color:var(--ink)" />
            </div>
            <button id="btn-generate-report" class="text-sm font-medium px-4 py-2 rounded-lg focus-ring btn-press" style="background:var(--indigo); color:#fff;">Lihat Laporan</button>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" id="report-cards">
          <div class="rounded-xl p-4" style="background:var(--surface-alt)">
            <p class="text-xs" style="color:var(--ink-muted)">Total Pemasukan</p>
            <p class="font-display text-2xl font-semibold mt-0.5" style="color:var(--emerald)" id="report-income">Rp0</p>
          </div>
          <div class="rounded-xl p-4" style="background:var(--surface-alt)">
            <p class="text-xs" style="color:var(--ink-muted)">Total Pengeluaran</p>
            <p class="font-display text-2xl font-semibold mt-0.5" style="color:var(--coral)" id="report-expense">Rp0</p>
          </div>
          <div class="rounded-xl p-4" style="background:var(--surface-alt)">
            <p class="text-xs" style="color:var(--ink-muted)">Net Savings</p>
            <p class="font-display text-2xl font-semibold mt-0.5" style="color:var(--ink)" id="report-net">Rp0</p>
          </div>
        </div>
        <div class="card card-hover rounded-2xl p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-display text-lg font-semibold" style="color:var(--ink)">Detail Transaksi</h3>
            <span id="report-count" class="text-xs font-medium" style="color:var(--ink-muted)"></span>
          </div>
          <div id="report-details" class="space-y-1">
            <p class="text-sm" style="color:var(--ink-muted)">Pilih bulan dan tahun, lalu klik "Lihat Laporan"</p>
          </div>
        </div>
        <div class="card card-hover rounded-2xl p-6">
          <h3 class="font-display text-lg font-semibold mb-4" style="color:var(--ink)">Ringkasan Kategori</h3>
          <div id="report-category-summary" class="space-y-3">
            <p class="text-sm" style="color:var(--ink-muted)">Pilih bulan dan tahun untuk melihat ringkasan</p>
          </div>
        </div>
      </div>
    `;
    this.attachEvents();
  },

  attachEvents() {
    const btn = document.getElementById('btn-generate-report');
    const btnExcel = document.getElementById('btn-export-excel');
    const btnPdf = document.getElementById('btn-export-pdf');
    if (btn) btn.addEventListener('click', () => this.generate());
    if (btnExcel) btnExcel.addEventListener('click', () => this.exportExcel());
    if (btnPdf) btnPdf.addEventListener('click', () => this.exportPDF());
  },

  async generate() {
    const month = document.getElementById('report-month').value;
    const year = document.getElementById('report-year').value;
    const { data: transactions, error } = await transactionService.getByMonth(parseInt(month), parseInt(year));
    if (error || !transactions) return;
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const net = income - expense;
    const el = (id) => document.getElementById(id);
    if (el('report-income')) el('report-income').textContent = 'Rp' + Math.round(income).toLocaleString('id-ID');
    if (el('report-expense')) el('report-expense').textContent = 'Rp' + Math.round(expense).toLocaleString('id-ID');
    if (el('report-net')) el('report-net').textContent = 'Rp' + Math.round(net).toLocaleString('id-ID');
    const details = document.getElementById('report-details');
    const count = document.getElementById('report-count');
    if (count) count.textContent = `${transactions.length} transaksi`;
    if (!transactions.length) {
      if (details) details.innerHTML = `<div class="rounded-xl p-8 text-center" style="background:var(--surface-alt)"><p class="text-sm" style="color:var(--ink-muted)">Tidak ada transaksi untuk bulan ini</p></div>`;
      const catSum = document.getElementById('report-category-summary');
      if (catSum) catSum.innerHTML = `<p class="text-sm" style="color:var(--ink-muted)">Tidak ada data</p>`;
      return;
    }
    if (details) details.innerHTML = transactions.map(t => `
      <div class="flex items-center justify-between py-2.5" style="border-bottom:1px solid var(--border)">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:${t.type === 'income' ? 'var(--emerald-soft)' : 'var(--coral-soft)'}; color:${t.type === 'income' ? 'var(--emerald)' : 'var(--coral)'}">${icon(t.type, 'w-4 h-4')}</span>
          <div>
            <p class="text-sm font-medium" style="color:var(--ink)">${t.description || '-'}</p>
            <p class="text-xs" style="color:var(--ink-muted)">${new Date(t.date).toLocaleDateString('id-ID')} · ${t.category_id || ''}</p>
          </div>
        </div>
        <span class="text-sm font-semibold tabular-nums" style="color:${t.type === 'income' ? 'var(--emerald)' : 'var(--coral)'}">${t.type === 'income' ? '+' : '-'}Rp${Number(t.amount).toLocaleString('id-ID')}</span>
      </div>
    `).join('');
    const catSum = document.getElementById('report-category-summary');
    if (catSum) {
      const catMap = {};
      transactions.filter(t => t.type === 'expense').forEach(t => { catMap[t.category_id] = (catMap[t.category_id] || 0) + Number(t.amount); });
      const totalExp = Object.values(catMap).reduce((s, v) => s + v, 0) || 1;
      const colors = ['var(--indigo)', 'var(--emerald)', 'var(--coral)', 'var(--amber)', 'var(--violet)', 'var(--ink-muted)'];
      catSum.innerHTML = Object.entries(catMap).map(([catId, amt], i) => `
        <div class="flex items-center justify-between py-2">
          <span class="text-sm" style="color:var(--ink)">Kategori ${catId}</span>
          <span class="text-sm font-semibold tabular-nums" style="color:var(--ink)">Rp${Math.round(amt).toLocaleString('id-ID')} (${Math.round(amt / totalExp * 100)}%)</span>
        </div>
      `).join('') || '<p class="text-sm" style="color:var(--ink-muted)">Tidak ada pengeluaran</p>';
    }
  },

  async exportExcel() {
    const month = document.getElementById('report-month').value;
    const year = document.getElementById('report-year').value;
    const { data: transactions } = await transactionService.getByMonth(parseInt(month), parseInt(year));
    if (!transactions || !transactions.length) { this.toast('Tidak ada data untuk diekspor.', 'coral'); return; }
    try {
      await exportService.exportToExcel(transactions.map(t => ({ date: t.date, description: t.description, type: t.type, amount: Number(t.amount), category_id: t.category_id })));
      this.toast('Excel berhasil diekspor!', 'emerald');
    } catch (e) { this.toast('Gagal export Excel.', 'coral'); }
  },

  async exportPDF() {
    const month = document.getElementById('report-month').value;
    const year = document.getElementById('report-year').value;
    const { data: transactions } = await transactionService.getByMonth(parseInt(month), parseInt(year));
    if (!transactions || !transactions.length) { this.toast('Tidak ada data untuk diekspor.', 'coral'); return; }
    try {
      await exportService.exportToPDF();
      this.toast('PDF berhasil diekspor!', 'emerald');
    } catch (e) { this.toast('Gagal export PDF.', 'coral'); }
  },

  toast(msg, tone = 'indigo') {
    const stack = document.getElementById('toast-stack') || document.body;
    const el = document.createElement('div');
    el.className = 'slide-in rounded-lg px-4 py-3 text-sm font-medium card';
    el.style.borderLeft = `4px solid var(--${tone})`;
    el.style.color = 'var(--ink)';
    el.textContent = msg;
    stack.appendChild(el);
    setTimeout(() => { el.classList.add('fade-out'); setTimeout(() => el.remove(), 320); }, 2600);
  }
};