import { transactionService, accountService, categoryService } from '../services/database.js';
import { icon } from '../components/icons.js';
import { showToast } from '../components/toast.js';
import { tutorialPanel } from '../components/tutorial.js';
import { rupiah, withAlpha, categoryIcon, accountTypeLabel } from '../utils.js';

// ⚠️ CATATAN: save()/delete() memanggil transactionService.create()/.update()/
// .delete() — samakan namanya dengan database.js aslimu kalau berbeda.
// Field transfer diasumsikan account_id (akun asal) + account_to_id (akun
// tujuan) — sesuaikan kalau nama kolommu beda.

export const transactionsPage = {
  data: { transactions: [], accounts: [], categories: [] },
  filters: { type: 'all', category: 'all', account: 'all', search: '' },
  sort: { key: 'date', dir: 'desc' },
  _searchBound: false,

  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;

    container.innerHTML = `
      <div class="mb-6">
        <p class="text-xs font-semibold mb-1" style="color:var(--indigo); letter-spacing:.04em;">TRANSAKSI</p>
        <h2 class="text-2xl font-bold font-display" style="color:var(--ink)">Semua transaksi</h2>
        <p class="text-sm mt-1" style="color:var(--ink-muted)">Catat pemasukan, pengeluaran, dan transfer di sini — semua kartu di Dashboard mengikuti data yang kamu tambahkan di halaman ini.</p>
      </div>

      <div id="stat-cards" class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5"></div>

      <div class="flex flex-wrap gap-2.5 mb-4">
        <button id="btn-add-transaction" class="px-4 py-2 rounded-lg text-white font-medium focus-ring btn-press text-sm flex items-center gap-1.5" style="background:var(--indigo)">
          ${icon('plus', 'w-4 h-4')} Tambah Transaksi
        </button>
        <button id="btn-export-excel" class="px-4 py-2 rounded-lg font-medium focus-ring btn-press text-sm flex items-center gap-1.5" style="background:var(--emerald); color:#fff">
          ${icon('download', 'w-4 h-4')} Excel
        </button>
        <button id="btn-export-pdf" class="px-4 py-2 rounded-lg font-medium focus-ring btn-press text-sm flex items-center gap-1.5" style="background:var(--coral); color:#fff">
          ${icon('download', 'w-4 h-4')} PDF
        </button>
        <div class="flex-1"></div>
        <select id="filter-type" class="px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface); color:var(--ink)">
          <option value="all">Semua tipe</option><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option><option value="transfer">Transfer</option>
        </select>
        <select id="filter-category" class="px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface); color:var(--ink)">
          <option value="all">Semua kategori</option>
        </select>
        <select id="filter-account" class="px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface); color:var(--ink)">
          <option value="all">Semua akun</option>
        </select>
      </div>

      <div class="rounded-xl overflow-hidden card">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr style="background:var(--surface-alt)">
              <th class="sortable px-5 py-3 text-left text-xs font-semibold" data-sort="date" style="color:var(--ink-muted)">Tanggal <span id="arrow-date"></span></th>
              <th class="px-5 py-3 text-left text-xs font-semibold" style="color:var(--ink-muted)">Deskripsi</th>
              <th class="px-5 py-3 text-left text-xs font-semibold" style="color:var(--ink-muted)">Kategori</th>
              <th class="px-5 py-3 text-left text-xs font-semibold" style="color:var(--ink-muted)">Tipe</th>
              <th class="sortable px-5 py-3 text-right text-xs font-semibold" data-sort="amount" style="color:var(--ink-muted)">Jumlah <span id="arrow-amount"></span></th>
              <th class="px-5 py-3 text-left text-xs font-semibold" style="color:var(--ink-muted)">Aksi</th>
            </tr></thead>
            <tbody id="tx-rows"></tbody>
          </table>
        </div>
      </div>

      <!-- MODAL -->
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
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Deskripsi</label>
              <input type="text" id="tx-desc" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="Cth. Makan siang" />
            </div>
            <div>
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Jumlah (Rp)</label>
              <input type="number" id="tx-amount" min="1" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="0" />
            </div>
          </div>
          <button type="submit" class="w-full mt-5 py-2.5 rounded-lg text-white font-semibold focus-ring btn-press text-sm" style="background:var(--indigo)">Simpan transaksi</button>
        </form>
      </div>
    `;

    tutorialPanel.setContent({
      eyebrow: 'HALAMAN INI',
      title: 'Transaksi',
      description: 'Ini pusat pencatatan seluruh transaksi keuanganmu — pemasukan, pengeluaran, dan transfer antar akun. Semua data di sini otomatis dipakai lagi di Dashboard, Budget, Target, dan Laporan.',
      steps: [
        'Klik <b>+ Tambah Transaksi</b>, lalu pilih tipenya: Pemasukan, Pengeluaran, atau Transfer.',
        'Pilih akun & kategori, isi tanggal dan jumlah, lalu tekan <b>Simpan</b>.',
        'Pakai kotak pencarian atau filter Tipe/Kategori/Akun untuk menemukan transaksi tertentu.',
        'Klik judul kolom <b>Tanggal</b> atau <b>Jumlah</b> untuk mengurutkan.',
        '<b>Edit</b> untuk mengubah data, <b>Hapus</b> untuk menghapus transaksi.',
        'Klik <b>Excel</b> atau <b>PDF</b> untuk mengunduh laporan transaksi yang sedang tampil.'
      ],
      tip: 'transfer antar akun tidak dihitung sebagai pengeluaran — saldo akun asal berkurang, akun tujuan bertambah, tapi total pengeluaranmu tidak berubah.'
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
    this.renderStatCards();
    this.renderRows();
  },

  fillFilterOptions() {
    const catSel = document.getElementById('filter-category');
    const accSel = document.getElementById('filter-account');
    if (catSel) {
      catSel.innerHTML = '<option value="all">Semua kategori</option>' + this.data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      catSel.value = this.filters.category; // jaga filter tetap kepilih setelah reload data
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

  accName(id) { return this.data.accounts.find(a => a.id === id)?.name || '-'; },
  catInfo(id) { return this.data.categories.find(c => c.id === id); },

  getFiltered() {
    let data = [...this.data.transactions];
    const f = this.filters;
    if (f.type !== 'all') data = data.filter(t => t.type === f.type);
    if (f.category !== 'all') data = data.filter(t => t.category_id === f.category);
    if (f.account !== 'all') data = data.filter(t => t.account_id === f.account || t.account_to_id === f.account);
    if (f.search) {
      const q = f.search.toLowerCase();
      data = data.filter(t => (t.description || '').toLowerCase().includes(q));
    }
    data.sort((a, b) => {
      const dir = this.sort.dir === 'asc' ? 1 : -1;
      if (this.sort.key === 'amount') return (Number(a.amount) - Number(b.amount)) * dir;
      return (new Date(a.date) - new Date(b.date)) * dir;
    });
    return data;
  },

  renderStatCards() {
    const income = this.data.transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
    const expense = this.data.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
    const cards = [
      { label: 'Total transaksi', value: this.data.transactions.length, tone: 'indigo', prefix: '' },
      { label: 'Pemasukan', value: income, tone: 'emerald', prefix: 'Rp' },
      { label: 'Pengeluaran', value: expense, tone: 'coral', prefix: 'Rp' },
      { label: 'Net', value: income - expense, tone: 'violet', prefix: 'Rp' },
    ];
    document.getElementById('stat-cards').innerHTML = cards.map(c => `
      <div class="rounded-xl p-4 card-hover" style="background:var(--${c.tone}-soft); border:1px solid var(--border);">
        <p class="text-xs font-medium" style="color:var(--ink-muted)">${c.label}</p>
        <p class="text-lg font-semibold mt-0.5 tabular-nums" style="color:var(--${c.tone})">${c.prefix}${c.value.toLocaleString('id-ID')}</p>
      </div>`).join('');
  },

  renderRows() {
    const tbody = document.getElementById('tx-rows');
    const data = this.getFiltered();

    document.getElementById('arrow-date').textContent = this.sort.key === 'date' ? (this.sort.dir === 'asc' ? '↑' : '↓') : '';
    document.getElementById('arrow-amount').textContent = this.sort.key === 'amount' ? (this.sort.dir === 'asc' ? '↑' : '↓') : '';

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-14 text-center">
        <p class="font-medium" style="color:var(--ink)">Tidak ada transaksi yang cocok</p>
        <p class="text-sm mt-0.5" style="color:var(--ink-muted)">Coba ubah filter atau kata kunci pencarian.</p>
      </td></tr>`;
      return;
    }

    const typeBadge = (t) => {
      if (t.type === 'income') return `<span class="badge" style="background:var(--emerald-soft); color:var(--emerald-strong)">Pemasukan</span>`;
      if (t.type === 'expense') return `<span class="badge" style="background:var(--coral-soft); color:var(--coral)">Pengeluaran</span>`;
      return `<span class="badge" style="background:var(--indigo-soft); color:var(--indigo)">Transfer</span>`;
    };
    const amountColor = (t) => t.type === 'income' ? 'var(--emerald-strong)' : t.type === 'expense' ? 'var(--coral)' : 'var(--indigo)';
    const amountSign = (t) => t.type === 'income' ? '+' : t.type === 'expense' ? '-' : '';

    tbody.innerHTML = data.map(t => {
      const cat = t.category_id ? this.catInfo(t.category_id) : null;
      const catCell = cat
        ? `<span class="badge" style="background:${withAlpha(cat.color, '22') || 'var(--surface-alt)'}; color:${cat.color || 'var(--ink-muted)'}">${icon(categoryIcon(cat.name), 'w-3.5 h-3.5')} ${cat.name}</span>`
        : `<span class="text-xs" style="color:var(--ink-muted)">—</span>`;
      const descSub = t.type === 'transfer' ? `${this.accName(t.account_id)} → ${this.accName(t.account_to_id)}` : this.accName(t.account_id);
      return `
      <tr style="border-top:1px solid var(--border)">
        <td class="px-5 py-3.5 whitespace-nowrap" style="color:var(--ink-muted)">${new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</td>
        <td class="px-5 py-3.5">
          <p class="font-medium" style="color:var(--ink)">${t.description || '-'}</p>
          <p class="text-xs" style="color:var(--ink-muted)">${descSub}</p>
        </td>
        <td class="px-5 py-3.5">${catCell}</td>
        <td class="px-5 py-3.5">${typeBadge(t)}</td>
        <td class="px-5 py-3.5 text-right font-semibold tabular-nums whitespace-nowrap" style="color:${amountColor(t)}">${amountSign(t)}${rupiah(t.amount)}</td>
        <td class="px-5 py-3.5 whitespace-nowrap">
          <button class="edit-tx text-xs font-semibold focus-ring btn-press" style="color:var(--indigo)" data-id="${t.id}">Edit</button>
          <button class="delete-tx text-xs font-semibold ml-3 focus-ring btn-press" style="color:var(--coral)" data-id="${t.id}">Hapus</button>
        </td>
      </tr>`;
    }).join('');
  },

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

    document.getElementById('filter-type').addEventListener('change', (e) => { this.filters.type = e.target.value; this.renderRows(); });
    document.getElementById('filter-category').addEventListener('change', (e) => { this.filters.category = e.target.value; this.renderRows(); });
    document.getElementById('filter-account').addEventListener('change', (e) => { this.filters.account = e.target.value; this.renderRows(); });

    document.querySelectorAll('.sortable').forEach(th => th.addEventListener('click', () => {
      const key = th.dataset.sort;
      this.sort.dir = (this.sort.key === key && this.sort.dir === 'desc') ? 'asc' : 'desc';
      this.sort.key = key;
      this.renderRows();
    }));

    document.getElementById('btn-export-excel').addEventListener('click', () => this.exportExcel());
    document.getElementById('btn-export-pdf').addEventListener('click', () => this.exportPDF());

    document.getElementById('tx-rows').addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-tx');
      const deleteBtn = e.target.closest('.delete-tx');
      if (editBtn) this.openEdit(editBtn.dataset.id);
      if (deleteBtn) this.remove(deleteBtn.dataset.id);
    });
  },

  bindGlobalSearchOnce() {
    if (this._searchBound) return;
    this._searchBound = true;
    document.addEventListener('search:changed', (e) => {
      if (!document.getElementById('tx-rows')) return; // halaman lain sedang aktif
      this.filters.search = e.detail.query;
      this.renderRows();
    });
    document.addEventListener('keydown', (e) => {
      const modal = document.getElementById('tx-modal');
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) modal.classList.add('hidden');
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

async remove(id) {
     if (!confirm('Hapus transaksi ini?')) return;
     try {
       const tx = this.data.transactions.find(t => t.id === id);
       const { error } = await transactionService.delete(id);
       if (error) throw error;
       if (tx) {
         const accounts = await accountService.getAll();
         const accId = tx.account_id;
         const sign = tx.type === 'expense' ? -1 : tx.type === 'income' ? 1 : 0;
         const acc = accounts.find(a => a.id === accId);
         if (acc && sign !== 0) {
           await accountService.updateBalance(accId, Number(acc.current_balance || 0) - (tx.amount * sign));
         }
         if (tx.type === 'transfer' && tx.account_to_id) {
           const dstAcc = accounts.find(a => a.id === tx.account_to_id);
           if (dstAcc) await accountService.updateBalance(tx.account_to_id, Number(dstAcc.current_balance || 0) + tx.amount);
         }
       }
       await this.loadData();
       showToast('Transaksi berhasil dihapus.', 'success');
     } catch (err) {
      console.error(err);
      showToast('Gagal menghapus transaksi.', 'error');
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
       month,
       year
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
       const { error } = id ? await transactionService.update(id, payload) : await transactionService.create(payload);
       if (error) throw error;
       const accId = payload.type === 'transfer' ? payload.account_to_id : payload.account_id;
       const sign = payload.type === 'expense' ? -1 : payload.type === 'income' ? 1 : 0;
       if (sign !== 0 && accId) {
         const accounts = await accountService.getAll();
         const acc = accounts.find(a => a.id === accId);
         if (acc) {
           const newBalance = Number(acc.current_balance || 0) + (payload.amount * sign);
           await accountService.updateBalance(accId, newBalance);
         }
       }
       if (payload.type === 'transfer' && payload.account_id && payload.account_to_id) {
         const accounts = await accountService.getAll();
         const srcAcc = accounts.find(a => a.id === payload.account_id);
         const dstAcc = accounts.find(a => a.id === payload.account_to_id);
         if (srcAcc) await accountService.updateBalance(payload.account_id, Number(srcAcc.current_balance || 0) - payload.amount);
         if (dstAcc) await accountService.updateBalance(payload.account_to_id, Number(dstAcc.current_balance || 0) + payload.amount);
       }
       document.getElementById('tx-modal').classList.add('hidden');
       await this.loadData();
       showToast(id ? 'Transaksi diperbarui.' : 'Transaksi ditambahkan.', 'success');
     } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan transaksi.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  },

  exportExcel() {
    const data = this.getFiltered();
    const header = 'Tanggal,Deskripsi,Kategori,Tipe,Jumlah\n';
    const rows = data.map(t => `${t.date},"${(t.description || '').replace(/"/g, '""')}","${t.category_id ? (this.catInfo(t.category_id)?.name || '-') : '-'}",${t.type},${t.amount}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transaksi-dompetku.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Excel (CSV) berhasil diunduh.', 'success');
  },

  exportPDF() {
    const data = this.getFiltered();
    if (window.jspdf) {
      const doc = new window.jspdf.jsPDF();
      doc.setFontSize(16); doc.text('Laporan Transaksi — Dompetku', 14, 20);
      doc.setFontSize(10);
      let y = 30;
      data.forEach(t => {
        const cat = t.category_id ? (this.catInfo(t.category_id)?.name || '-') : '-';
        doc.text(`${t.date} | ${t.description} | ${cat} | ${t.type} | ${rupiah(t.amount)}`, 14, y);
        y += 7;
        if (y > 270) { doc.addPage(); y = 20; }
      });
      doc.save('transaksi-dompetku.pdf');
      showToast('PDF berhasil diunduh.', 'success');
    } else {
      showToast('Modul PDF belum dimuat. Tambahkan jsPDF di index.html.', 'error');
    }
  }
};