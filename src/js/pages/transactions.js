import { transactionService, accountService, categoryService } from '../services/database.js';

import { icon } from './components/icons.js';
import { showToast } from './components/toast.js';
import { tutorialPanel } from './components/tutorial.js';
import { rupiah, withAlpha, categoryIcon, accountTypeLabel } from '../utils.js';
export const transactionsPage = {
  filter: 'all',
  searchQuery: '',

  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    container.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold font-display" style="color:var(--ink)">Transaksi</h2>
          <p class="text-sm mt-1" style="color:var(--ink-muted)">Kelola semua transaksi keuangan kamu</p>
        </div>
        <div class="flex flex-wrap gap-3 mb-4">
          <button id="btn-add-transaction" class="px-4 py-2 rounded-lg text-white font-medium focus-ring btn-press" style="background:var(--indigo)">+ Tambah Transaksi</button>
          <select id="filter-type" class="px-3 py-2 rounded-lg focus-ring" style="border:1px solid var(--border);background:var(--surface);color:var(--ink)">
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>
        <div class="rounded-xl overflow-hidden" style="background:var(--surface);border:1px solid var(--border)">
          <table class="w-full">
            <thead><tr style="background:var(--surface-alt)">
              <th class="px-6 py-3 text-left text-xs font-medium uppercase" style="color:var(--ink-muted)">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase" style="color:var(--ink-muted)">Deskripsi</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase" style="color:var(--ink-muted)">Kategori</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase" style="color:var(--ink-muted)">Jumlah</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase" style="color:var(--ink-muted)">Aksi</th>
            </tr></thead>
            <tbody id="transaction-table-body" class="divide-y" style="border-color:var(--border)">
              <tr><td colspan="5" class="px-6 py-4 text-center" style="color:var(--ink-muted)">Memuat...</td></tr>
            </tbody>
          </table>
        </div>
        <div id="transaction-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center" style="background:rgba(0,0,0,.5)">
          <div class="rounded-xl p-6 w-full max-w-md" style="background:var(--surface);border:1px solid var(--border)">
            <h3 class="text-lg font-bold mb-4" id="modal-title">Tambah Transaksi</h3>
            <form id="transaction-form" class="space-y-4">
              <input type="hidden" id="tx-id" />
              <div>
                <label class="block text-sm font-medium mb-1" style="color:var(--ink-muted)">Tipe</label>
                <select id="tx-type" class="w-full px-3 py-2 rounded-lg focus-ring" style="border:1px solid var(--border);background:var(--surface);color:var(--ink)">
                  <option value="income">Pemasukan</option><option value="expense">Pengeluaran</option><option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color:var(--ink-muted)">Akun</label>
                <select id="tx-account" class="w-full px-3 py-2 rounded-lg focus-ring" style="border:1px solid var(--border);background:var(--surface);color:var(--ink)"><option value="">Memuat...</option></select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color:var(--ink-muted)">Kategori</label>
                <select id="tx-category" class="w-full px-3 py-2 rounded-lg focus-ring" style="border:1px solid var(--border);background:var(--surface);color:var(--ink)"><option value="">Memuat...</option></select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color:var(--ink-muted)">Tanggal</label>
                <input type="date" id="tx-date" class="w-full px-3 py-2 rounded-lg focus-ring" style="border:1px solid var(--border);background:var(--surface);color:var(--ink)" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color:var(--ink-muted)">Deskripsi</label>
                <input type="text" id="tx-desc" class="w-full px-3 py-2 rounded-lg focus-ring" style="border:1px solid var(--border);background:var(--surface);color:var(--ink)" placeholder="Deskripsi..." />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color:var(--ink-muted)">Jumlah</label>
                <input type="number" id="tx-amount" class="w-full px-3 py-2 rounded-lg focus-ring" style="border:1px solid var(--border);background:var(--surface);color:var(--ink)" placeholder="0" min="1" />
              </div>
              <div class="flex gap-3">
                <button type="submit" class="flex-1 px-4 py-2 rounded-lg text-white font-medium focus-ring btn-press" style="background:var(--indigo)">Simpan</button>
                <button type="button" id="btn-cancel-modal" class="flex-1 px-4 py-2 rounded-lg focus-ring btn-press" style="background:var(--surface-alt)">Batal</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    this.attachEvents();
    await this.loadAccountsAndCategories();
    await this.loadData();
  },

  async loadAccountsAndCategories() {
    const accountSelect = document.getElementById('tx-account');
    const categorySelect = document.getElementById('tx-category');
    if (accountSelect) accountSelect.innerHTML = '<option value="">Memuat...</option>';
    if (categorySelect) categorySelect.innerHTML = '<option value="">Memuat...</option>';
    const { data: accounts } = await accountService.getAll();
    const { data: categories } = await categoryService.getAll();
    if (accountSelect && accounts) {
      accountSelect.innerHTML = '<option value="">Pilih akun...</option>' + accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    }
    if (categorySelect && categories) {
      categorySelect.innerHTML = '<option value="">Pilih kategori...</option>' + categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
    }
  },

  async loadData() {
    const { data, error } = await transactionService.getAll();
    const tbody = document.getElementById('transaction-table-body');
    if (error || !data) { tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center" style="color:var(--coral)">Gagal memuat</td></tr>'; return; }
    const { data: categories } = await categoryService.getAll();
    const catMap = {};
    (categories || []).forEach(c => { catMap[c.id] = c.name; });
    let filtered = data;
    if (this.filter !== 'all') filtered = filtered.filter(t => t.type === this.filter);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(t => (t.description||'').toLowerCase().includes(q) || (catMap[t.category_id]||'').toLowerCase().includes(q));
    }
    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-12 text-center">
        <span class="text-4xl mb-3 block">💳</span>
        <p class="font-medium" style="color:var(--ink-muted)">Belum ada transaksi</p>
        <p class="text-sm" style="color:var(--border)">Tambahkan transaksi pertama Anda</p>
      </td></tr>`;
      return;
    }
    tbody.innerHTML = filtered.map(t => `
      <tr class="hover:opacity-80 transition" style="background:var(--surface)">
        <td class="px-6 py-4 text-sm" style="color:var(--ink-muted)">${new Date(t.date).toLocaleDateString('id-ID')}</td>
        <td class="px-6 py-4 text-sm font-medium" style="color:var(--ink)">${t.description||'-'}</td>
        <td class="px-6 py-4 text-sm" style="color:var(--ink-muted)">${catMap[t.category_id]||t.category_id||'-'}</td>
        <td class="px-6 py-4 text-sm font-bold" style="color:${t.type==='income'?'var(--emerald)':'var(--coral)'}">Rp ${Number(t.amount).toLocaleString('id-ID')}</td>
        <td class="px-6 py-4 text-sm">
          <button class="edit-tx text-blue-600 hover:underline focus-ring btn-press" data-id="${t.id}">Edit</button>
          <button class="delete-tx text-red-600 hover:underline ml-3 focus-ring btn-press" data-id="${t.id}">Hapus</button>
        </td>
      </tr>
    `).join('');
  },

  attachEvents() {
    const modal = document.getElementById('transaction-modal');
    const form = document.getElementById('transaction-form');
    const addBtn = document.getElementById('btn-add-transaction');
    const cancelBtn = document.getElementById('btn-cancel-modal');
    const filterSelect = document.getElementById('filter-type');
    if (addBtn) addBtn.addEventListener('click', () => { document.getElementById('modal-title').textContent = 'Tambah Transaksi'; document.getElementById('tx-id').value = ''; if (modal) modal.classList.remove('hidden'); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => { if (modal) modal.classList.add('hidden'); });
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    if (form) form.addEventListener('submit', async (e) => { e.preventDefault(); await this.save(); });
    if (filterSelect) filterSelect.addEventListener('change', (e) => { this.filter = e.target.value; this.loadData(); });
    document.addEventListener('global-search', (e) => {
      this.searchQuery = e.detail.query || '';
      this.loadData();
    });
    const tbody = document.getElementById('transaction-table-body');
    if (tbody) {
      tbody.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit-tx');
        const deleteBtn = e.target.closest('.delete-tx');
        if (editBtn) {
          const { data } = await transactionService.getAll();
          const tx = (data || []).find(t => t.id === editBtn.dataset.id);
          if (tx) {
            document.getElementById('modal-title').textContent = 'Edit Transaksi';
            document.getElementById('tx-id').value = tx.id;
            document.getElementById('tx-type').value = tx.type;
            document.getElementById('tx-account').value = tx.account_id||'';
            document.getElementById('tx-category').value = tx.category_id||'';
            document.getElementById('tx-date').value = tx.date;
            document.getElementById('tx-desc').value = tx.description||'';
            document.getElementById('tx-amount').value = tx.amount;
            if (modal) modal.classList.remove('hidden');
          }
        }
        if (deleteBtn) {
          if (confirm('Hapus transaksi ini?')) {
            const { error } = await transactionService.delete(deleteBtn.dataset.id);
            if (!error) await this.loadData();
          }
        }
      });
    }
  },

  async save() {
    const data = {
      type: document.getElementById('tx-type').value,
      account_id: document.getElementById('tx-account').value,
      category_id: document.getElementById('tx-category').value,
      date: document.getElementById('tx-date').value,
      description: document.getElementById('tx-desc').value,
      amount: parseFloat(document.getElementById('tx-amount').value)
    };
    const id = document.getElementById('tx-id').value;
    const { error } = id ? await transactionService.update(id, data) : await transactionService.create(data);
    if (!error) { document.getElementById('transaction-modal').classList.add('hidden'); await this.loadData(); }
  }
};
