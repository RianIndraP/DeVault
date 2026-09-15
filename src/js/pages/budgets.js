import { budgetService } from '../services/database.js';
import { categoryService } from '../services/database.js';

export const budgetsPage = {
  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    container.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Budget</h2>
          <p class="text-gray-500 mt-1">Atur batasan pengeluaran per kategori</p>
        </div>
        <button id="btn-add-budget" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4">+ Tambah Budget</button>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="budgets-grid"></div>
        <div id="budget-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 class="text-lg font-bold mb-4" id="modal-title">Tambah Budget</h3>
            <form id="budget-form" class="space-y-4">
              <input type="hidden" id="bud-id" />
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select id="bud-category" class="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="">Memuat...</option></select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                <input type="month" id="bud-month" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah Budget</label>
                <input type="number" id="bud-amount" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0" min="1" step="0.01" required />
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
    await this.loadCategories();
    await this.loadData();
  },

  async loadCategories() {
    const { data: categories } = await categoryService.getAll();
    const select = document.getElementById('bud-category');
    if (select && categories) {
      select.innerHTML = '<option value="">Pilih kategori...</option>' + categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
    }
  },

  async loadData() {
    const { data, error } = await budgetService.getAll();
    const grid = document.getElementById('budgets-grid');
    if (error || !data) { grid.innerHTML = '<p class="text-red-500">Gagal memuat</p>'; return; }
    if (!data.length) {
      grid.innerHTML = `
        <div class="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span class="text-4xl mb-4 block">📋</span>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Belum ada budget</h3>
          <p class="text-gray-400 text-sm mb-4">Atur batasan pengeluaran per kategori</p>
        </div>`;
      return;
    }
    const { data: categories } = await categoryService.getAll();
    const catMap = {};
    (categories || []).forEach(c => { catMap[c.id] = c.name; });
    grid.innerHTML = data.map(b => {
      const pct = b.amount > 0 ? Math.min((b.current_amount / b.amount) * 100, 100) : 0;
      const over = b.current_amount > b.amount;
      return `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 class="font-bold text-gray-800 mb-2">${catMap[b.category_id] || b.category_id || 'Semua Kategori'}</h3>
          <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div class="h-3 rounded-full ${over ? 'bg-red-500' : 'bg-blue-600'}" style="width: ${Math.min(pct, 100)}%"></div>
          </div>
          <p class="text-sm text-gray-600">Rp ${Number(b.current_amount).toLocaleString('id-ID')} / Rp ${Number(b.amount).toLocaleString('id-ID')}</p>
          <p class="text-xs text-gray-400 mt-1">${b.month}/${b.year}</p>
        </div>
      `;
    }).join('');
  },

  attachEvents() {
    const modal = document.getElementById('budget-modal');
    const form = document.getElementById('budget-form');
    const addBtn = document.getElementById('btn-add-budget');
    const cancelBtn = document.getElementById('btn-cancel-modal');
    if (addBtn) addBtn.addEventListener('click', () => { document.getElementById('modal-title').textContent = 'Tambah Budget'; document.getElementById('bud-id').value = ''; modal.classList.remove('hidden'); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    if (form) form.addEventListener('submit', async (e) => { e.preventDefault(); await this.save(); });
  },

  async save() {
    const data = {
      category_id: document.getElementById('bud-category').value,
      month: parseInt(document.getElementById('bud-month').value?.split('-')[1]),
      year: parseInt(document.getElementById('bud-month').value?.split('-')[0]),
      amount: parseFloat(document.getElementById('bud-amount').value)
    };
    const id = document.getElementById('bud-id').value;
    const { error } = id ? await budgetService.update(id, data) : await budgetService.create(data);
    if (!error) { document.getElementById('budget-modal').classList.add('hidden'); await this.loadData(); }
  }
};
