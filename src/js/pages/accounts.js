import { accountService } from '../services/database.js';

export const accountsPage = {
  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    container.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Akun</h2>
          <p class="text-gray-500 mt-1">Kelola akun bank dan e-wallet kamu</p>
        </div>
        <button id="btn-add-account" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4">+ Tambah Akun</button>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="accounts-grid"></div>
        <div id="account-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 class="text-lg font-bold mb-4" id="modal-title">Tambah Akun</h3>
            <form id="account-form" class="space-y-4">
              <input type="hidden" id="acc-id" />
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input type="text" id="acc-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Contoh: BCA" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select id="acc-type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="bank">Bank</option>
                  <option value="e_wallet">E-Wallet</option>
                  <option value="cash">Cash</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Saldo Awal</label>
                <input type="number" id="acc-balance" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0" min="0" step="0.01" />
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
    const { data, error } = await accountService.getAll();
    const grid = document.getElementById('accounts-grid');
    if (error || !data) { grid.innerHTML = '<p class="text-red-500">Gagal memuat akun</p>'; return; }
    if (!data.length) {
      grid.innerHTML = `
        <div class="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span class="text-4xl mb-4 block">🏦</span>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Belum ada akun</h3>
          <p class="text-gray-400 text-sm mb-4">Buat akun pertama untuk mulai mengelola keuangan</p>
        </div>`;
      return;
    }
    grid.innerHTML = data.map(a => `
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-gray-800">${a.name}</h3>
            <p class="text-sm text-gray-500">${a.type === 'bank' ? '🏦' : a.type === 'e_wallet' ? '📱' : a.type === 'cash' ? '💵' : '📁'} ${a.type}</p>
          </div>
          <span class="text-lg font-bold ${a.current_balance >= 0 ? 'text-green-600' : 'text-red-600'}">Rp ${Number(a.current_balance).toLocaleString('id-ID')}</span>
        </div>
        <div class="mt-3 flex gap-2">
          <button class="text-sm text-blue-600 hover:underline edit-acc" data-id="${a.id}">Edit</button>
          <button class="text-sm text-red-600 hover:underline delete-acc" data-id="${a.id}">Hapus</button>
        </div>
      </div>
    `).join('');
  },

  attachEvents() {
    const modal = document.getElementById('account-modal');
    const form = document.getElementById('account-form');
    const addBtn = document.getElementById('btn-add-account');
    const cancelBtn = document.getElementById('btn-cancel-modal');

    if (addBtn) addBtn.addEventListener('click', () => { document.getElementById('modal-title').textContent = 'Tambah Akun'; document.getElementById('acc-id').value = ''; modal.classList.remove('hidden'); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    if (form) form.addEventListener('submit', async (e) => { e.preventDefault(); await this.save(); });
    document.querySelectorAll('.delete-acc').forEach(btn => btn.addEventListener('click', async () => { if (confirm('Hapus akun ini?')) { await accountService.delete(btn.dataset.id); await this.loadData(); } }));
    document.querySelectorAll('.edit-acc').forEach(btn => btn.addEventListener('click', async () => {
      const { data } = await accountService.getAll();
      const acc = (data || []).find(a => a.id === btn.dataset.id);
      if (acc) {
        document.getElementById('modal-title').textContent = 'Edit Akun';
        document.getElementById('acc-id').value = acc.id;
        document.getElementById('acc-name').value = acc.name;
        document.getElementById('acc-type').value = acc.type;
        document.getElementById('acc-balance').value = acc.current_balance;
        modal.classList.remove('hidden');
      }
    }));
  },

  async save() {
    const data = {
      name: document.getElementById('acc-name').value,
      type: document.getElementById('acc-type').value,
      initial_balance: parseFloat(document.getElementById('acc-balance').value) || 0,
      current_balance: parseFloat(document.getElementById('acc-balance').value) || 0
    };
    const id = document.getElementById('acc-id').value;
    const { error } = id ? await accountService.update(id, data) : await accountService.create(data);
    if (!error) { document.getElementById('account-modal').classList.add('hidden'); await this.loadData(); }
  }
};
