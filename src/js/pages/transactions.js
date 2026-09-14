import { transactionService } from '../services/database.js';

export const transactionsPage = {
  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    container.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Transaksi</h2>
          <p class="text-gray-500 mt-1">Kelola semua transaksi keuangan kamu</p>
        </div>
        <div class="flex flex-wrap gap-3 mb-4">
          <button id="btn-add-transaction" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">+ Tambah Transaksi</button>
          <select id="filter-type" class="px-3 py-2 border border-gray-300 rounded-lg">
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody id="transaction-table-body" class="divide-y divide-gray-200">
              <tr><td colspan="5" class="px-6 py-4 text-center text-gray-400">Memuat...</td></tr>
            </tbody>
          </table>
        </div>
        <div id="transaction-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 class="text-lg font-bold mb-4" id="modal-title">Tambah Transaksi</h3>
            <form id="transaction-form" class="space-y-4">
              <input type="hidden" id="tx-id" />
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select id="tx-type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Akun</label>
                <select id="tx-account" class="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="">Pilih akun...</option></select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select id="tx-category" class="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="">Pilih kategori...</option></select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input type="date" id="tx-date" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <input type="text" id="tx-desc" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Deskripsi..." />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                <input type="number" id="tx-amount" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0" min="1" />
              </div>
              <div class="flex gap-3">
                <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
                <button type="button" id="btn-cancel-modal" class="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Batal</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    this.attachEvents();
    await this.loadData();
  },

  async loadData() {
    const { data, error } = await transactionService.getAll();
    const tbody = document.getElementById('transaction-table-body');
    if (error || !data) { tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Gagal memuat</td></tr>'; return; }
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-400">Tidak ada transaksi</td></tr>'; return; }
    tbody.innerHTML = data.map(t => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 text-sm">${new Date(t.date).toLocaleDateString('id-ID')}</td>
        <td class="px-6 py-4 text-sm">${t.description || '-'}</td>
        <td class="px-6 py-4 text-sm">${t.category_id || '-'}</td>
        <td class="px-6 py-4 text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}">Rp ${Number(t.amount).toLocaleString('id-ID')}</td>
        <td class="px-6 py-4 text-sm">
          <button class="text-blue-600 hover:underline edit-tx" data-id="${t.id}">Edit</button>
          <button class="text-red-600 hover:underline ml-2 delete-tx" data-id="${t.id}">Hapus</button>
        </td>
      </tr>
    `).join('');
  },

  attachEvents() {
    const modal = document.getElementById('transaction-modal');
    const form = document.getElementById('transaction-form');
    const addBtn = document.getElementById('btn-add-transaction');
    const cancelBtn = document.getElementById('btn-cancel-modal');

    if (addBtn) addBtn.addEventListener('click', () => { document.getElementById('modal-title').textContent = 'Tambah Transaksi'; modal.classList.remove('hidden'); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    if (form) form.addEventListener('submit', async (e) => { e.preventDefault(); await this.save(); });
    document.querySelectorAll('.delete-tx').forEach(btn => btn.addEventListener('click', async () => { await this.delete(btn.dataset.id); }));
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
  },

  async delete(id) {
    if (!confirm('Hapus transaksi ini?')) return;
    const { error } = await transactionService.delete(id);
    if (!error) await this.loadData();
  }
};
