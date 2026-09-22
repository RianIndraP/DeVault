import { transactionService, accountService, categoryService } from '../services/database.js';
import { icon } from '../components/icons.js';
import { showToast } from '../components/toast.js';
import { tutorialPanel } from '../components/tutorial.js';
import { rupiah, withAlpha, categoryIcon, accountTypeLabel } from '../utils.js';

// ⚠️ CATATAN: save()/delete() memanggil transactionService.create()/.update()/
// .delete() — samakan namanya dengan database.js aslimu kalau berbeda.
// Field transfer diasumsikan account_id (akun asal) + account_to_id (akun
// tujuan) — sesuaikan kalau nama kolommu beda.
//
// CATATAN DESAIN: panel "Panduan halaman" di kanan (tutorial.js) adalah
// komponen global (dipakai semua halaman), jadi tidak diubah jadi
// collapsible dari sini — itu butuh ubah tutorial.js/index.css yang
// mempengaruhi semua halaman lain juga. Kalau kamu mau itu diubah,
// kabari aku, itu tugas terpisah.

const PAGE_SIZE = 50;

export const transactionsPage = {
  data: { transactions: [], accounts: [], categories: [] },
  filters: { type: 'all', category: 'all', account: 'all', search: '', period: 'all', customFrom: '', customTo: '', minAmount: '', maxAmount: '' },
  sort: { key: 'date', dir: 'desc' },
  selected: new Set(),
  page: 1,
  currentPageIds: [],
  _searchBound: false,

  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;

    container.innerHTML = `
      <div class="mb-5">
        <p class="text-xs font-semibold mb-1" style="color:var(--indigo); letter-spacing:.04em;">TRANSAKSI</p>
        <h2 class="text-2xl font-bold font-display" style="color:var(--ink)">Semua transaksi</h2>
        <p class="text-sm mt-1" style="color:var(--ink-muted)">Cari, tambah, dan kelola seluruh transaksi keuanganmu.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 mb-4">
        <button id="btn-add-transaction" class="px-4 py-2 rounded-lg text-white font-semibold focus-ring btn-press text-sm flex items-center gap-1.5" style="background:var(--indigo)">
          ${icon('plus', 'w-4 h-4')} Tambah Transaksi
        </button>
        <div class="relative">
          <button id="btn-export-toggle" class="px-3.5 py-2 rounded-lg font-medium focus-ring btn-press text-sm flex items-center gap-1.5" style="border:1px solid var(--border); color:var(--ink-muted)">
            ${icon('download', 'w-4 h-4')} Export <span id="export-count"></span>
          </button>
          <div id="export-menu" class="hidden absolute left-0 top-11 z-20 rounded-lg py-1 w-40 card">
            <button id="btn-export-excel" class="w-full text-left px-3 py-2 text-sm" style="color:var(--ink)">Excel (CSV)</button>
            <button id="btn-export-pdf" class="w-full text-left px-3 py-2 text-sm" style="color:var(--ink)">PDF</button>
          </div>
        </div>
      </div>

      <!-- SEARCH -->
      <div class="flex items-center gap-2 rounded-xl px-4 py-3 mb-3 card">
        ${icon('search', 'w-4 h-4 shrink-0')}
        <input id="tx-search" type="text" placeholder="Cari transaksi, kategori, atau akun..." class="bg-transparent text-sm w-full outline-none placeholder:opacity-60" style="color:var(--ink)" />
      </div>

      <!-- QUICK FILTERS -->
      <div class="flex flex-wrap items-center gap-2 mb-2">
        <select id="filter-period" class="px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface); color:var(--ink)">
          <option value="all">Semua waktu</option>
          <option value="today">Hari ini</option>
          <option value="7d">7 hari terakhir</option>
          <option value="month">Bulan ini</option>
          <option value="lastmonth">Bulan lalu</option>
          <option value="3m">3 bulan terakhir</option>
          <option value="6m">6 bulan terakhir</option>
          <option value="year">Tahun ini</option>
          <option value="custom">Rentang kustom…</option>
        </select>
        <select id="filter-type" class="px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface); color:var(--ink)">
          <option value="all">Semua tipe</option><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option><option value="transfer">Transfer</option>
        </select>
        <select id="filter-category" class="px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface); color:var(--ink)">
          <option value="all">Semua kategori</option>
        </select>
        <select id="filter-account" class="px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface); color:var(--ink)">
          <option value="all">Semua akun</option>
        </select>
        <button id="btn-more-filters" class="chip">Filter lainnya</button>
        <button id="btn-reset-filters" class="hidden chip">✕ Reset filter</button>
      </div>

      <!-- ADVANCED FILTERS (nominal + custom date) -->
      <div id="advanced-filters" class="hidden flex-wrap items-end gap-3 mb-3 rounded-xl p-4 card">
        <div id="custom-date-wrap" class="hidden flex items-end gap-2">
          <div>
            <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Dari tanggal</label>
            <input type="date" id="filter-date-from" class="px-2.5 py-1.5 rounded-lg text-sm" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Sampai tanggal</label>
            <input type="date" id="filter-date-to" class="px-2.5 py-1.5 rounded-lg text-sm" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Nominal min (Rp)</label>
          <input type="number" id="filter-min" min="0" class="px-2.5 py-1.5 rounded-lg text-sm w-32" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="0" />
        </div>
        <div>
          <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Nominal max (Rp)</label>
          <input type="number" id="filter-max" min="0" class="px-2.5 py-1.5 rounded-lg text-sm w-32" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="Tanpa batas" />
        </div>
        <button id="btn-apply-advanced" class="text-xs font-semibold px-3 py-2 rounded-lg btn-press" style="background:var(--indigo); color:#fff">Terapkan</button>
      </div>

      <!-- SUMMARY BAR -->
      <div id="summary-bar" class="text-sm mb-3 px-1"></div>

      <!-- BULK ACTION BAR -->
      <div id="bulk-bar" class="hidden items-center gap-3 mb-3 px-4 py-2.5 rounded-xl flex-wrap" style="background:var(--indigo-soft)">
        <span class="text-sm font-medium" id="bulk-count" style="color:var(--indigo)"></span>
        <div class="flex-1"></div>
        <select id="bulk-category" class="px-2.5 py-1.5 rounded-lg text-xs focus-ring" style="border:1px solid var(--border); background:var(--surface); color:var(--ink)">
          <option value="">Ubah kategori…</option>
        </select>
        <button id="bulk-delete" class="text-xs font-semibold px-3 py-1.5 rounded-lg btn-press" style="background:var(--coral); color:#fff">Hapus</button>
        <button id="bulk-clear" class="text-xs font-medium px-3 py-1.5 rounded-lg btn-press" style="color:var(--ink-muted)">Batal</button>
      </div>

      <!-- TABLE -->
      <div class="rounded-xl overflow-hidden card">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr style="background:var(--surface-alt)">
              <th class="px-3 py-3 w-8"><input type="checkbox" id="select-all" /></th>
              <th class="px-2 py-3 text-left text-xs font-semibold" style="color:var(--ink-muted)">Transaksi</th>
              <th class="px-2 py-3 text-left text-xs font-semibold" style="color:var(--ink-muted)">Kategori</th>
              <th class="sortable px-2 py-3 text-right text-xs font-semibold" data-sort="amount" style="color:var(--ink-muted)">Nominal <span id="arrow-amount"></span></th>
              <th class="px-2 py-3 w-10"></th>
            </tr></thead>
            <tbody id="tx-rows"></tbody>
          </table>
        </div>
        <div id="pagination" class="flex items-center justify-between px-5 py-3 text-xs flex-wrap gap-2" style="color:var(--ink-muted); border-top:1px solid var(--border)"></div>
      </div>

      <!-- MODAL TAMBAH/EDIT -->
      <div id="tx-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
        <form id="tx-form" class="rounded-2xl p-6 w-full max-w-md card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold font-display" id="modal-title" style="color:var(--ink)">Tambah Transaksi</h3>
            <button type="button" id="btn-cancel-modal" class="p-1.5 rounded-lg btn-press" style="color:var(--ink-muted)">${icon('close', 'w-5 h-5')}</button>
          </div>
          <input type="hidden" id="tx-id" />
          <div class="space-y-3.5">
            <div>
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Tipe</label>
              <select id="tx-type" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)">
                <option value="income">Pemasukan</option><option value="expense">Pengeluaran</option><option value="transfer">Transfer</option>
              </select>
            </div>
            <div id="tx-category-wrap">
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Kategori</label>
              <select id="tx-category" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)"></select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label id="tx-account-label" class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Akun</label>
                <select id="tx-account" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)"></select>
              </div>
              <div id="tx-account-to-wrap" class="hidden">
                <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Ke akun</label>
                <select id="tx-account-to" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)"></select>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Tanggal</label>
              <input type="date" id="tx-date" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" />
            </div>
            <div>
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Transaksi</label>
              <input type="text" id="tx-desc" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="Cth. Makan siang" />
            </div>
            <div>
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Nominal (Rp)</label>
              <input type="number" id="tx-amount" min="1" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="0" />
            </div>
          </div>
          <button type="submit" class="w-full mt-5 py-2.5 rounded-lg text-white font-semibold focus-ring btn-press text-sm" style="background:var(--indigo)">Simpan transaksi</button>
        </form>
      </div>

      <!-- MODAL KONFIRMASI HAPUS -->
      <div id="confirm-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
        <div class="rounded-2xl p-6 w-full max-w-sm card">
          <h3 class="text-lg font-bold font-display mb-2" style="color:var(--ink)">Hapus transaksi?</h3>
          <p id="confirm-message" class="text-sm mb-5" style="color:var(--ink-muted)"></p>
          <div class="flex gap-2 justify-end">
            <button id="confirm-cancel" class="text-sm font-medium px-4 py-2 rounded-lg btn-press" style="color:var(--ink-muted)">Batal</button>
            <button id="confirm-ok" class="text-sm font-semibold px-4 py-2 rounded-lg btn-press" style="background:var(--coral); color:#fff">Hapus transaksi</button>
          </div>
        </div>
      </div>

      <!-- DETAIL DRAWER -->
      <div id="tx-drawer-backdrop" class="hidden fixed inset-0 z-40" style="background:rgba(0,0,0,.4)"></div>
      <aside id="tx-drawer" class="fixed inset-y-0 right-0 z-50 w-full max-w-sm card" style="border-left:1px solid var(--border); transform:translateX(100%); transition:transform .2s ease;">
        <div class="h-16 flex items-center justify-between px-5" style="border-bottom:1px solid var(--border)">
          <h3 class="font-display text-lg font-semibold" style="color:var(--ink)">Detail transaksi</h3>
          <button id="drawer-close" class="p-1.5 rounded-lg btn-press" style="color:var(--ink-muted)">${icon('close', 'w-5 h-5')}</button>
        </div>
        <div id="drawer-content" class="p-5 space-y-4 overflow-y-auto" style="height:calc(100% - 4rem)"></div>
      </aside>
    `;

    tutorialPanel.setContent({
      eyebrow: 'HALAMAN INI',
      title: 'Transaksi',
      description: 'Pusat pencatatan seluruh transaksi keuanganmu — cari, filter, dan kelola pemasukan, pengeluaran, dan transfer di sini.',
      steps: [
        'Klik <b>+ Tambah Transaksi</b>, pilih tipenya, lalu isi detail dan tekan Simpan.',
        'Ketik di kotak <b>pencarian</b> untuk mencari berdasarkan nama transaksi, kategori, atau akun.',
        'Gunakan filter <b>Waktu / Tipe / Kategori / Akun</b>, atau buka <b>Filter lainnya</b> untuk rentang nominal dan tanggal kustom.',
        'Bar ringkasan di atas tabel otomatis mengikuti filter yang sedang aktif.',
        'Klik satu transaksi untuk membuka <b>detail</b> — dari situ kamu bisa Edit, Duplikat, atau Hapus.',
        'Centang beberapa transaksi untuk <b>ubah kategori</b> atau <b>hapus sekaligus</b> lewat toolbar bulk action.',
        'Tombol <b>Export</b> mengunduh transaksi yang sedang tampil sesuai filter, bukan semua data.'
      ],
      tip: 'Transfer antar akun tidak dihitung sebagai pengeluaran — saldo akun asal berkurang, akun tujuan bertambah, tapi total pengeluaranmu tidak berubah.'
    });

    this.attachEvents();
    await this.loadData();
    this.bindGlobalSearchOnce();
  },

  async loadData() {
    const [{ data: transactions }, { data: accounts }, { data: categories }] = await Promise.all([
      transactionService.getAll(), accountService.getAll(), categoryService.getAll()
    ]);
    this.data.transactions = transactions || [];
    this.data.accounts = accounts || [];
    this.data.categories = categories || [];
    this.fillFilterOptions();
    this.fillModalSelects();
    this.fillBulkCategoryOptions();
    this.renderRows();
  },

  fillFilterOptions() {
    const catSel = document.getElementById('filter-category');
    const accSel = document.getElementById('filter-account');
    if (catSel) {
      catSel.innerHTML = '<option value="all">Semua kategori</option>' + this.data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      catSel.value = this.filters.category;
    }
    if (accSel) {
      accSel.innerHTML = '<option value="all">Semua akun</option>' + this.data.accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
      accSel.value = this.filters.account;
    }
  },

  fillModalSelects() {
    const catSel = document.getElementById('tx-category');
    const accSel = document.getElementById('tx-account');
    const accToSel = document.getElementById('tx-account-to');
    if (catSel) catSel.innerHTML = this.data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const accOpts = this.data.accounts.map(a => `<option value="${a.id}">${a.name} (${accountTypeLabel(a.type)})</option>`).join('');
    if (accSel) accSel.innerHTML = accOpts;
    if (accToSel) accToSel.innerHTML = accOpts;
  },

  fillBulkCategoryOptions() {
    const sel = document.getElementById('bulk-category');
    if (sel) sel.innerHTML = '<option value="">Ubah kategori…</option>' + this.data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  },

  accName(id) { return this.data.accounts.find(a => a.id === id)?.name || '-'; },
  catInfo(id) { return this.data.categories.find(c => c.id === id); },

  // ---------- filter helpers ----------
  periodRange() {
    const f = this.filters;
    const now = new Date();
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    switch (f.period) {
      case 'today': return { from: startOfDay(now), to: endOfDay(now) };
      case '7d': { const from = new Date(now); from.setDate(from.getDate() - 6); return { from: startOfDay(from), to: endOfDay(now) }; }
      case 'month': return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)) };
      case 'lastmonth': return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)) };
      case '3m': return { from: new Date(now.getFullYear(), now.getMonth() - 2, 1), to: endOfDay(now) };
      case '6m': return { from: new Date(now.getFullYear(), now.getMonth() - 5, 1), to: endOfDay(now) };
      case 'year': return { from: new Date(now.getFullYear(), 0, 1), to: endOfDay(new Date(now.getFullYear(), 11, 31)) };
      case 'custom':
        if (f.customFrom && f.customTo) return { from: startOfDay(new Date(f.customFrom)), to: endOfDay(new Date(f.customTo)) };
        return null;
      default: return null;
    }
  },

  periodLabel() {
    const labels = { all: 'Semua transaksi', today: 'Hari ini', '7d': '7 hari terakhir', month: 'Bulan ini', lastmonth: 'Bulan lalu', '3m': '3 bulan terakhir', '6m': '6 bulan terakhir', year: 'Tahun ini', custom: 'Rentang kustom' };
    return labels[this.filters.period] || 'Semua transaksi';
  },

  getFiltered() {
    let data = [...this.data.transactions];
    const f = this.filters;
    if (f.type !== 'all') data = data.filter(t => t.type === f.type);
    if (f.category !== 'all') data = data.filter(t => t.category_id === f.category);
    if (f.account !== 'all') data = data.filter(t => t.account_id === f.account || t.account_to_id === f.account);
    if (f.search) {
      const q = f.search.toLowerCase();
      data = data.filter(t =>
        (t.description || '').toLowerCase().includes(q) ||
        (this.catInfo(t.category_id)?.name || '').toLowerCase().includes(q) ||
        (this.accName(t.account_id) || '').toLowerCase().includes(q)
      );
    }
    const range = this.periodRange();
    if (range) data = data.filter(t => { const d = new Date(t.date); return d >= range.from && d <= range.to; });
    if (f.minAmount) data = data.filter(t => Number(t.amount) >= Number(f.minAmount));
    if (f.maxAmount) data = data.filter(t => Number(t.amount) <= Number(f.maxAmount));

    data.sort((a, b) => {
      const dir = this.sort.dir === 'asc' ? 1 : -1;
      if (this.sort.key === 'amount') return (Number(a.amount) - Number(b.amount)) * dir;
      return (new Date(a.date) - new Date(b.date)) * dir;
    });
    return data;
  },

  hasActiveFilters() {
    const f = this.filters;
    return f.type !== 'all' || f.category !== 'all' || f.account !== 'all' || f.search || f.period !== 'all' || f.minAmount || f.maxAmount;
  },

  // ---------- render ----------
  renderSummaryBar(filtered) {
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
    const net = income - expense;
    document.getElementById('summary-bar').innerHTML = `
      <span class="font-medium" style="color:var(--ink)">${this.periodLabel()}</span>
      <span style="color:var(--ink-muted)"> · ${filtered.length} transaksi · <span style="color:var(--emerald)">↑ ${rupiah(income)}</span> · <span style="color:var(--coral)">↓ ${rupiah(expense)}</span> · Bersih ${net >= 0 ? '+' : '-'}${rupiah(Math.abs(net))}</span>
    `;
    document.getElementById('export-count').textContent = `(${filtered.length})`;
  },

  rowHtml(t) {
    const cat = t.category_id ? this.catInfo(t.category_id) : null;
    const catCell = cat
      ? `<span class="badge" style="background:${withAlpha(cat.color, '22') || 'var(--surface-alt)'}; color:${cat.color || 'var(--ink-muted)'}">${icon(categoryIcon(cat.name), 'w-3.5 h-3.5')} ${cat.name}</span>`
      : `<span class="text-xs" style="color:var(--ink-muted)">—</span>`;
    const sub = t.type === 'transfer' ? `${this.accName(t.account_id)} → ${this.accName(t.account_to_id)}` : this.accName(t.account_id);
    const arrow = t.type === 'income' ? '↑' : t.type === 'expense' ? '↓' : '↔';
    const tone = t.type === 'income' ? 'emerald' : t.type === 'expense' ? 'coral' : 'indigo';
    const sign = t.type === 'income' ? '+' : t.type === 'expense' ? '-' : '';
    const checked = this.selected.has(t.id) ? 'checked' : '';
    return `
    <tr class="tx-row" style="border-top:1px solid var(--border)">
      <td class="px-3 py-3"><input type="checkbox" class="row-check" data-id="${t.id}" ${checked} /></td>
      <td class="px-2 py-3 cursor-pointer tx-open" data-id="${t.id}">
        <div class="flex items-center gap-2">
          <span class="font-semibold" style="color:var(--${tone})">${arrow}</span>
          <div class="min-w-0">
            <p class="font-medium truncate" style="color:var(--ink)">${t.description || '-'}</p>
            <p class="text-xs truncate" style="color:var(--ink-muted)">${sub}</p>
          </div>
        </div>
      </td>
      <td class="px-2 py-3 cursor-pointer tx-open" data-id="${t.id}">${catCell}</td>
      <td class="px-2 py-3 text-right font-semibold tabular-nums whitespace-nowrap cursor-pointer tx-open" data-id="${t.id}" style="color:var(--${tone})">${sign}${rupiah(t.amount)}</td>
      <td class="px-2 py-3 text-right relative">
        <button class="row-menu-btn px-2 py-1.5 rounded-lg btn-press text-base leading-none" data-id="${t.id}" style="color:var(--ink-muted)">⋮</button>
        <div class="row-menu hidden absolute right-2 top-10 z-20 rounded-lg py-1 w-36 card" data-menu="${t.id}">
          <button class="menu-edit w-full text-left px-3 py-1.5 text-xs" data-id="${t.id}" style="color:var(--ink)">Edit</button>
          <button class="menu-duplicate w-full text-left px-3 py-1.5 text-xs" data-id="${t.id}" style="color:var(--ink)">Duplikat</button>
          <button class="menu-delete w-full text-left px-3 py-1.5 text-xs" data-id="${t.id}" style="color:var(--coral)">Hapus</button>
        </div>
      </td>
    </tr>`;
  },

  renderRows() {
    const filtered = this.getFiltered();
    this.renderSummaryBar(filtered);
    document.getElementById('btn-reset-filters').classList.toggle('hidden', !this.hasActiveFilters());

    document.getElementById('arrow-amount').textContent = this.sort.key === 'amount' ? (this.sort.dir === 'asc' ? '↑' : '↓') : '';

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (this.page > totalPages) this.page = totalPages;
    const start = (this.page - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);
    this.currentPageIds = pageItems.map(t => t.id);

    const tbody = document.getElementById('tx-rows');
    if (!pageItems.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="px-5 py-14 text-center">
        <p class="font-medium" style="color:var(--ink)">Belum ada transaksi</p>
        <p class="text-sm mt-0.5" style="color:var(--ink-muted)">${this.hasActiveFilters() ? 'Tidak ada transaksi yang cocok dengan filter saat ini.' : 'Tambahkan transaksi pertamamu.'}</p>
      </td></tr>`;
    } else if (this.sort.key === 'amount') {
      tbody.innerHTML = pageItems.map(t => this.rowHtml(t)).join('');
    } else {
      const groups = {};
      pageItems.forEach(t => { const k = (t.date || '').slice(0, 10); (groups[k] = groups[k] || []).push(t); });
      tbody.innerHTML = Object.keys(groups).map(dateKey => {
        const items = groups[dateKey];
        const dayNet = items.reduce((s, t) => s + (t.type === 'income' ? Number(t.amount || 0) : t.type === 'expense' ? -Number(t.amount || 0) : 0), 0);
        const dateLabel = dateKey ? new Date(dateKey).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
        return `
          <tr><td colspan="5" class="px-5 pt-4 pb-1.5">
            <div class="flex items-center justify-between text-xs font-semibold" style="color:var(--ink-muted)">
              <span>${dateLabel}</span>
              ${dayNet !== 0 ? `<span class="tabular-nums" style="color:${dayNet >= 0 ? 'var(--emerald)' : 'var(--coral)'}">${dayNet >= 0 ? '+' : '-'}${rupiah(Math.abs(dayNet))}</span>` : ''}
            </div>
          </td></tr>
          ${items.map(t => this.rowHtml(t)).join('')}
        `;
      }).join('');
    }

    this.renderPagination(total, totalPages);
    this.renderBulkBar();
    this.updateSelectAllState();
  },

  renderPagination(total, totalPages) {
    const start = total === 0 ? 0 : (this.page - 1) * PAGE_SIZE + 1;
    const end = Math.min(total, this.page * PAGE_SIZE);
    document.getElementById('pagination').innerHTML = `
      <span>Menampilkan ${start}–${end} dari ${total} transaksi</span>
      <div class="flex items-center gap-2">
        <button id="page-prev" class="chip" ${this.page <= 1 ? 'disabled style="opacity:.5;cursor:default"' : ''}>← Sebelumnya</button>
        <span>Halaman ${this.page} dari ${totalPages}</span>
        <button id="page-next" class="chip" ${this.page >= totalPages ? 'disabled style="opacity:.5;cursor:default"' : ''}>Berikutnya →</button>
      </div>
    `;
    document.getElementById('page-prev')?.addEventListener('click', () => { if (this.page > 1) { this.page--; this.renderRows(); } });
    document.getElementById('page-next')?.addEventListener('click', () => { if (this.page < totalPages) { this.page++; this.renderRows(); } });
  },

  renderBulkBar() {
    const bar = document.getElementById('bulk-bar');
    const n = this.selected.size;
    bar.classList.toggle('hidden', n === 0);
    bar.classList.toggle('flex', n > 0);
    if (n > 0) {
      const total = this.data.transactions.filter(t => this.selected.has(t.id)).reduce((s, t) => s + (t.type === 'expense' ? -Number(t.amount || 0) : t.type === 'income' ? Number(t.amount || 0) : 0), 0);
      document.getElementById('bulk-count').textContent = `${n} transaksi dipilih · Bersih ${total >= 0 ? '+' : '-'}${rupiah(Math.abs(total))}`;
    }
  },

  updateSelectAllState() {
    const cb = document.getElementById('select-all');
    if (!cb || !this.currentPageIds.length) { if (cb) { cb.checked = false; cb.indeterminate = false; } return; }
    const selectedOnPage = this.currentPageIds.filter(id => this.selected.has(id)).length;
    cb.checked = selectedOnPage === this.currentPageIds.length;
    cb.indeterminate = selectedOnPage > 0 && selectedOnPage < this.currentPageIds.length;
  },

  // ---------- events ----------
  attachEvents() {
    const modal = document.getElementById('tx-modal');
    const openBtn = document.getElementById('btn-add-transaction');
    const cancelBtn = document.getElementById('btn-cancel-modal');
    const form = document.getElementById('tx-form');
    const typeSelect = document.getElementById('tx-type');

    openBtn.addEventListener('click', () => {
      if (!this.data.accounts.length) { showToast('Buat akun dulu sebelum menambah transaksi.', 'error'); return; }
      document.getElementById('modal-title').textContent = 'Tambah Transaksi';
      document.getElementById('tx-id').value = '';
      form.reset();
      document.getElementById('tx-date').value = new Date().toISOString().slice(0, 10);
      typeSelect.value = 'income';
      this.syncTxTypeFields('income');
      modal.classList.remove('hidden'); modal.classList.add('flex');
    });
    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    typeSelect.addEventListener('change', (e) => this.syncTxTypeFields(e.target.value));
    form.addEventListener('submit', (e) => { e.preventDefault(); this.save(); });

    // search
    document.getElementById('tx-search').addEventListener('input', (e) => {
      this.filters.search = e.target.value;
      this.page = 1;
      this.renderRows();
    });

    // quick filters
    document.getElementById('filter-period').addEventListener('change', (e) => {
      this.filters.period = e.target.value;
      document.getElementById('custom-date-wrap').classList.toggle('hidden', e.target.value !== 'custom');
      if (e.target.value === 'custom') document.getElementById('advanced-filters').classList.remove('hidden');
      this.page = 1;
      this.renderRows();
    });
    document.getElementById('filter-type').addEventListener('change', (e) => { this.filters.type = e.target.value; this.page = 1; this.renderRows(); });
    document.getElementById('filter-category').addEventListener('change', (e) => { this.filters.category = e.target.value; this.page = 1; this.renderRows(); });
    document.getElementById('filter-account').addEventListener('change', (e) => { this.filters.account = e.target.value; this.page = 1; this.renderRows(); });

    document.getElementById('btn-more-filters').addEventListener('click', () => {
      document.getElementById('advanced-filters').classList.toggle('hidden');
      document.getElementById('advanced-filters').classList.toggle('flex');
    });
    document.getElementById('btn-apply-advanced').addEventListener('click', () => {
      this.filters.minAmount = document.getElementById('filter-min').value;
      this.filters.maxAmount = document.getElementById('filter-max').value;
      this.filters.customFrom = document.getElementById('filter-date-from').value;
      this.filters.customTo = document.getElementById('filter-date-to').value;
      this.page = 1;
      this.renderRows();
    });
    document.getElementById('btn-reset-filters').addEventListener('click', () => {
      this.filters = { type: 'all', category: 'all', account: 'all', search: '', period: 'all', customFrom: '', customTo: '', minAmount: '', maxAmount: '' };
      document.getElementById('tx-search').value = '';
      document.getElementById('filter-period').value = 'all';
      document.getElementById('filter-type').value = 'all';
      document.getElementById('filter-category').value = 'all';
      document.getElementById('filter-account').value = 'all';
      document.getElementById('filter-min').value = '';
      document.getElementById('filter-max').value = '';
      document.getElementById('filter-date-from').value = '';
      document.getElementById('filter-date-to').value = '';
      document.getElementById('custom-date-wrap').classList.add('hidden');
      this.page = 1;
      this.renderRows();
    });

    document.querySelectorAll('.sortable').forEach(th => th.addEventListener('click', () => {
      const key = th.dataset.sort;
      this.sort.dir = (this.sort.key === key && this.sort.dir === 'desc') ? 'asc' : 'desc';
      this.sort.key = key;
      this.renderRows();
    }));

    // export dropdown
    document.getElementById('btn-export-toggle').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('export-menu').classList.toggle('hidden');
    });
    document.getElementById('btn-export-excel').addEventListener('click', () => { this.exportExcel(); document.getElementById('export-menu').classList.add('hidden'); });
    document.getElementById('btn-export-pdf').addEventListener('click', () => { this.exportPDF(); document.getElementById('export-menu').classList.add('hidden'); });

    // select all (current page)
    document.getElementById('select-all').addEventListener('change', (e) => {
      if (e.target.checked) this.currentPageIds.forEach(id => this.selected.add(id));
      else this.currentPageIds.forEach(id => this.selected.delete(id));
      this.renderRows();
    });

    // bulk actions
    document.getElementById('bulk-clear').addEventListener('click', () => { this.selected.clear(); this.renderRows(); });
    document.getElementById('bulk-delete').addEventListener('click', () => this.confirmBulkDelete());
    document.getElementById('bulk-category').addEventListener('change', (e) => {
      if (e.target.value) this.bulkChangeCategory(e.target.value);
      e.target.value = '';
    });

    // table row interactions (delegated)
    document.getElementById('tx-rows').addEventListener('click', (e) => {
      const check = e.target.closest('.row-check');
      if (check) {
        if (check.checked) this.selected.add(check.dataset.id); else this.selected.delete(check.dataset.id);
        this.renderBulkBar();
        this.updateSelectAllState();
        return;
      }
      const menuBtn = e.target.closest('.row-menu-btn');
      if (menuBtn) {
        e.stopPropagation();
        document.querySelectorAll('.row-menu').forEach(m => { if (m.dataset.menu !== menuBtn.dataset.id) m.classList.add('hidden'); });
        document.querySelector(`.row-menu[data-menu="${menuBtn.dataset.id}"]`)?.classList.toggle('hidden');
        return;
      }
      const editItem = e.target.closest('.menu-edit');
      if (editItem) { this.closeAllMenus(); this.openEdit(editItem.dataset.id); return; }
      const dupItem = e.target.closest('.menu-duplicate');
      if (dupItem) { this.closeAllMenus(); this.duplicateTransaction(dupItem.dataset.id); return; }
      const delItem = e.target.closest('.menu-delete');
      if (delItem) { this.closeAllMenus(); this.confirmDelete(delItem.dataset.id); return; }
      const openRow = e.target.closest('.tx-open');
      if (openRow) { this.openDrawer(openRow.dataset.id); return; }
    });

    document.addEventListener('click', () => { this.closeAllMenus(); document.getElementById('export-menu')?.classList.add('hidden'); });

    document.getElementById('drawer-close').addEventListener('click', () => this.closeDrawer());
    document.getElementById('tx-drawer-backdrop').addEventListener('click', () => this.closeDrawer());
    document.getElementById('confirm-cancel').addEventListener('click', () => this.closeConfirm());
  },

  closeAllMenus() { document.querySelectorAll('.row-menu').forEach(m => m.classList.add('hidden')); },

  bindGlobalSearchOnce() {
    if (this._searchBound) return;
    this._searchBound = true;
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const modal = document.getElementById('tx-modal');
      if (modal && !modal.classList.contains('hidden')) modal.classList.add('hidden');
      this.closeDrawer();
      this.closeConfirm();
    });
  },

  syncTxTypeFields(type) {
    document.getElementById('tx-category-wrap').classList.toggle('hidden', type !== 'expense');
    document.getElementById('tx-account-to-wrap').classList.toggle('hidden', type !== 'transfer');
    document.getElementById('tx-account-label').textContent = type === 'transfer' ? 'Dari akun' : 'Akun';
  },

  openEdit(id) {
    const tx = this.data.transactions.find(t => t.id === id);
    if (!tx) return;
    document.getElementById('modal-title').textContent = 'Edit Transaksi';
    document.getElementById('tx-id').value = tx.id;
    document.getElementById('tx-type').value = tx.type;
    this.syncTxTypeFields(tx.type);
    document.getElementById('tx-account').value = tx.account_id || '';
    if (tx.account_to_id) document.getElementById('tx-account-to').value = tx.account_to_id;
    if (tx.category_id) document.getElementById('tx-category').value = tx.category_id;
    document.getElementById('tx-date').value = (tx.date || '').slice(0, 10);
    document.getElementById('tx-desc').value = tx.description || '';
    document.getElementById('tx-amount').value = tx.amount;
    const modal = document.getElementById('tx-modal');
    modal.classList.remove('hidden'); modal.classList.add('flex');
  },

  // ---------- detail drawer ----------
  openDrawer(id) {
    const tx = this.data.transactions.find(t => t.id === id);
    if (!tx) return;
    const cat = tx.category_id ? this.catInfo(tx.category_id) : null;
    const tone = tx.type === 'income' ? 'emerald' : tx.type === 'expense' ? 'coral' : 'indigo';
    const sign = tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '';
    const typeLabel = tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer';

    document.getElementById('drawer-content').innerHTML = `
      <div>
        <p class="text-xl font-display font-semibold" style="color:var(--ink)">${tx.description || '-'}</p>
        <p class="text-3xl font-display font-bold mt-1 tabular-nums" style="color:var(--${tone})">${sign}${rupiah(tx.amount)}</p>
        <span class="badge mt-2 inline-block" style="background:var(--${tone}-soft); color:var(--${tone})">${typeLabel}</span>
      </div>
      <div class="space-y-3 pt-3" style="border-top:1px solid var(--border)">
        <div class="flex justify-between text-sm"><span style="color:var(--ink-muted)">Tanggal</span><span style="color:var(--ink)">${new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
        <div class="flex justify-between text-sm"><span style="color:var(--ink-muted)">Akun</span><span style="color:var(--ink)">${tx.type === 'transfer' ? `${this.accName(tx.account_id)} → ${this.accName(tx.account_to_id)}` : this.accName(tx.account_id)}</span></div>
        ${cat ? `<div class="flex justify-between text-sm"><span style="color:var(--ink-muted)">Kategori</span><span style="color:var(--ink)">${cat.name}</span></div>` : ''}
        <div class="flex justify-between text-sm"><span style="color:var(--ink-muted)">Sumber</span><span style="color:var(--ink)">${tx.source === 'manual' ? 'Input manual' : tx.source === 'excel' ? 'Import Excel' : tx.source === 'receipt' ? 'Scan struk' : tx.source === 'recurring' ? 'Transaksi berulang' : '-'}</span></div>
      </div>
      <div class="flex gap-2 pt-3" style="border-top:1px solid var(--border)">
        <button id="drawer-edit" class="flex-1 text-sm font-semibold py-2 rounded-lg btn-press" style="background:var(--indigo-soft); color:var(--indigo)">Edit</button>
        <button id="drawer-duplicate" class="flex-1 text-sm font-semibold py-2 rounded-lg btn-press" style="background:var(--surface-alt); color:var(--ink)">Duplikat</button>
        <button id="drawer-delete" class="flex-1 text-sm font-semibold py-2 rounded-lg btn-press" style="background:var(--coral-soft); color:var(--coral)">Hapus</button>
      </div>
    `;
    document.getElementById('drawer-edit').addEventListener('click', () => { this.closeDrawer(); this.openEdit(tx.id); });
    document.getElementById('drawer-duplicate').addEventListener('click', () => { this.closeDrawer(); this.duplicateTransaction(tx.id); });
    document.getElementById('drawer-delete').addEventListener('click', () => { this.closeDrawer(); this.confirmDelete(tx.id); });

    document.getElementById('tx-drawer').style.transform = 'translateX(0)';
    document.getElementById('tx-drawer-backdrop').classList.remove('hidden');
  },

  closeDrawer() {
    document.getElementById('tx-drawer').style.transform = 'translateX(100%)';
    document.getElementById('tx-drawer-backdrop').classList.add('hidden');
  },

  // ---------- confirm modal ----------
  confirmDelete(id) {
    const tx = this.data.transactions.find(t => t.id === id);
    if (!tx) return;
    document.getElementById('confirm-message').textContent = `${tx.description || 'Transaksi ini'} · ${rupiah(tx.amount)} — tindakan ini tidak dapat dibatalkan.`;
    const okBtn = document.getElementById('confirm-ok');
    okBtn.textContent = 'Hapus transaksi';
    const handler = () => { this.remove(id); this.closeConfirm(); okBtn.removeEventListener('click', handler); };
    okBtn.addEventListener('click', handler);
    const modal = document.getElementById('confirm-modal');
    modal.classList.remove('hidden'); modal.classList.add('flex');
  },

  confirmBulkDelete() {
    const n = this.selected.size;
    if (!n) return;
    document.getElementById('confirm-message').textContent = `${n} transaksi akan dihapus — tindakan ini tidak dapat dibatalkan.`;
    const okBtn = document.getElementById('confirm-ok');
    okBtn.textContent = `Hapus ${n} transaksi`;
    const handler = () => { this.bulkDelete(); this.closeConfirm(); okBtn.removeEventListener('click', handler); };
    okBtn.addEventListener('click', handler);
    const modal = document.getElementById('confirm-modal');
    modal.classList.remove('hidden'); modal.classList.add('flex');
  },

  closeConfirm() {
    const modal = document.getElementById('confirm-modal');
    modal.classList.add('hidden'); modal.classList.remove('flex');
    // lepas listener "confirm" sebelumnya (dipasang ulang tiap confirmDelete/confirmBulkDelete)
    // supaya tidak menumpuk kalau modal dibuka berkali-kali.
    const okBtn = document.getElementById('confirm-ok');
    okBtn.replaceWith(okBtn.cloneNode(true));
  },

  // ---------- balance helper ----------
  async adjustBalance(accountId, delta) {
    if (!accountId || !delta) return;
    try {
      const { data: accounts } = await accountService.getAll();
      const acc = accounts.find(a => a.id === accountId);
      if (acc) await accountService.updateBalance(accountId, Number(acc.current_balance || 0) + delta);
    } catch (err) { console.warn('[Balance adjust]', err.message); }
  },

  async applyTransactionBalance(payload) {
    if (payload.type === 'transfer') {
      await this.adjustBalance(payload.account_id, -Number(payload.amount));
      await this.adjustBalance(payload.account_to_id, Number(payload.amount));
    } else {
      const sign = payload.type === 'expense' ? -1 : payload.type === 'income' ? 1 : 0;
      if (sign !== 0) await this.adjustBalance(payload.account_id, Number(payload.amount) * sign);
    }
  },

  async reverseTransactionBalance(tx) {
    if (tx.type === 'transfer') {
      await this.adjustBalance(tx.account_id, Number(tx.amount));
      if (tx.account_to_id) await this.adjustBalance(tx.account_to_id, -Number(tx.amount));
    } else {
      const sign = tx.type === 'expense' ? -1 : tx.type === 'income' ? 1 : 0;
      if (sign !== 0) await this.adjustBalance(tx.account_id, -Number(tx.amount) * sign);
    }
  },

  // ---------- CRUD ----------
  async remove(id) {
    try {
      const tx = this.data.transactions.find(t => t.id === id);
      const { error } = await transactionService.delete(id);
      if (error) throw error;
      if (tx) await this.reverseTransactionBalance(tx);
      this.selected.delete(id);
      await this.loadData();
      showToast('Transaksi berhasil dihapus.', 'success');
      document.dispatchEvent(new CustomEvent('transactions:changed'));
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus transaksi.', 'error');
    }
  },

  async bulkDelete() {
    const ids = [...this.selected];
    try {
      for (const id of ids) {
        const tx = this.data.transactions.find(t => t.id === id);
        const { error } = await transactionService.delete(id);
        if (error) throw error;
        if (tx) await this.reverseTransactionBalance(tx);
      }
      this.selected.clear();
      await this.loadData();
      showToast(`${ids.length} transaksi berhasil dihapus.`, 'success');
      document.dispatchEvent(new CustomEvent('transactions:changed'));
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus beberapa transaksi.', 'error');
    }
  },

  async bulkChangeCategory(categoryId) {
    const ids = [...this.selected];
    try {
      for (const id of ids) {
        const { error } = await transactionService.update(id, { category_id: categoryId });
        if (error) throw error;
      }
      await this.loadData();
      const catName = this.catInfo(categoryId)?.name || '-';
      showToast(`${ids.length} transaksi diubah ke kategori "${catName}".`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengubah kategori.', 'error');
    }
  },

  async duplicateTransaction(id) {
    const tx = this.data.transactions.find(t => t.id === id);
    if (!tx) return;
    const now = new Date();
    const payload = {
      type: tx.type,
      account_id: tx.account_id,
      ...(tx.type === 'transfer' ? { account_to_id: tx.account_to_id } : {}),
      category_id: tx.category_id || null,
      date: now.toISOString().slice(0, 10),
      description: tx.description,
      amount: Number(tx.amount),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      source: 'manual'
    };
    try {
      const { error } = await transactionService.create(payload);
      if (error) throw error;
      await this.applyTransactionBalance(payload);
      await this.loadData();
      showToast('Transaksi diduplikat dengan tanggal hari ini.', 'success');
      document.dispatchEvent(new CustomEvent('transactions:changed'));
    } catch (err) {
      console.error(err);
      showToast('Gagal menduplikat transaksi.', 'error');
    }
  },

  async save() {
    const type = document.getElementById('tx-type').value;
    const dateVal = document.getElementById('tx-date').value;
    const [year, month] = dateVal ? [parseInt(dateVal.split('-')[0]), parseInt(dateVal.split('-')[1])] : [new Date().getFullYear(), new Date().getMonth() + 1];
    const payload = {
      type,
      account_id: document.getElementById('tx-account').value,
      ...(type === 'transfer' ? { account_to_id: document.getElementById('tx-account-to').value } : {}),
      category_id: type === 'expense' ? document.getElementById('tx-category').value : null,
      date: dateVal,
      description: document.getElementById('tx-desc').value.trim(),
      amount: parseFloat(document.getElementById('tx-amount').value),
      month, year,
      source: 'manual'
    };
    if (!payload.date || !payload.description || !payload.amount || payload.amount <= 0 || !payload.account_id) {
      showToast('Lengkapi semua kolom.', 'error'); return;
    }
    if (type === 'transfer' && payload.account_id === payload.account_to_id) {
      showToast('Akun tujuan harus berbeda.', 'error'); return;
    }

    const id = document.getElementById('tx-id').value;
    const submitBtn = document.querySelector('#tx-form button[type="submit"]');
    submitBtn.disabled = true;
    try {
      if (id) {
        const oldTx = this.data.transactions.find(t => t.id === id);
        const { error } = await transactionService.update(id, payload);
        if (error) throw error;
        if (oldTx) await this.reverseTransactionBalance(oldTx);
        await this.applyTransactionBalance(payload);
      } else {
        const { error } = await transactionService.create(payload);
        if (error) throw error;
        await this.applyTransactionBalance(payload);
      }
      document.getElementById('tx-modal').classList.add('hidden');
      await this.loadData();
      showToast(id ? 'Transaksi diperbarui.' : 'Transaksi ditambahkan.', 'success');
      document.dispatchEvent(new CustomEvent('transactions:changed'));
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan transaksi.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  },

  // ---------- export ----------
  exportExcel() {
    const data = this.getFiltered();
    if (!data.length) { showToast('Tidak ada data untuk diekspor.', 'error'); return; }
    const header = 'Tanggal,Deskripsi,Akun,Kategori,Tipe,Nominal\n';
    const rows = data.map(t => `${t.date},"${(t.description || '').replace(/"/g, '""')}","${this.accName(t.account_id)}","${t.category_id ? (this.catInfo(t.category_id)?.name || '-') : '-'}",${t.type},${t.amount}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transaksi-dompetku.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast(`Excel (CSV) — ${data.length} transaksi berhasil diunduh.`, 'success');
  },

  exportPDF() {
    const data = this.getFiltered();
    if (!data.length) { showToast('Tidak ada data untuk diekspor.', 'error'); return; }
    if (window.jspdf) {
      const doc = new window.jspdf.jsPDF();
      doc.setFontSize(16); doc.text('Laporan Transaksi — Dompetku', 14, 20);
      doc.setFontSize(10);
      let y = 30;
      data.forEach(t => {
        const cat = t.category_id ? (this.catInfo(t.category_id)?.name || '-') : '-';
        doc.text(`${t.date} | ${t.description} | ${this.accName(t.account_id)} | ${cat} | ${t.type} | ${rupiah(t.amount)}`, 14, y);
        y += 7;
        if (y > 270) { doc.addPage(); y = 20; }
      });
      doc.save('transaksi-dompetku.pdf');
      showToast(`PDF — ${data.length} transaksi berhasil diunduh.`, 'success');
    } else {
      showToast('Modul PDF belum dimuat. Tambahkan jsPDF di index.html.', 'error');
    }
  }
};