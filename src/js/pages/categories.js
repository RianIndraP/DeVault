import { categoryService } from '../services/database.js';

export const categoriesPage = {
  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    container.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Kategori</h2>
          <p class="text-gray-500 mt-1">Kelola kategori pemasukan dan pengeluaran</p>
        </div>
        <button id="btn-add-category" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4">+ Tambah Kategori</button>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="categories-grid"></div>
        <div id="category-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 class="text-lg font-bold mb-4" id="modal-title">Tambah Kategori</h3>
            <form id="category-form" class="space-y-4">
              <input type="hidden" id="cat-id" />
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input type="text" id="cat-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Contoh: Makanan" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ikon</label>
                <input type="text" id="cat-icon" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="🎂" value="📁" />
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
    const { data, error } = await categoryService.getAll();
    const grid = document.getElementById('categories-grid');
    if (error || !data) { grid.innerHTML = '<p class="text-red-500">Gagal memuat</p>'; return; }
    if (!data.length) {
      grid.innerHTML = `
        <div class="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span class="text-4xl mb-4 block">🏷️</span>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Belum ada kategori</h3>
          <p class="text-gray-400 text-sm mb-4">Buat kategori agar transaksi lebih terorganisir</p>
        </div>`;
      return;
    }
    grid.innerHTML = data.map(c => `
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
        <span class="text-3xl">${c.icon || '📁'}</span>
        <div class="flex-1">
          <h3 class="font-bold text-gray-800">${c.name}</h3>
          <p class="text-sm text-gray-500">Dibuat: ${new Date(c.created_at).toLocaleDateString('id-ID')}</p>
        </div>
        <div class="flex gap-2">
          <button class="text-sm text-blue-600 hover:underline edit-cat" data-id="${c.id}">Edit</button>
          <button class="text-sm text-red-600 hover:underline delete-cat" data-id="${c.id}">Hapus</button>
        </div>
      </div>
    `).join('');
  },

  attachEvents() {
    const modal = document.getElementById('category-modal');
    const form = document.getElementById('category-form');
    const addBtn = document.getElementById('btn-add-category');
    const cancelBtn = document.getElementById('btn-cancel-modal');

    if (addBtn) addBtn.addEventListener('click', () => { document.getElementById('modal-title').textContent = 'Tambah Kategori'; document.getElementById('cat-id').value = ''; modal.classList.remove('hidden'); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    if (form) form.addEventListener('submit', async (e) => { e.preventDefault(); await this.save(); });
    document.querySelectorAll('.delete-cat').forEach(btn => btn.addEventListener('click', async () => { if (confirm('Hapus kategori ini?')) { await categoryService.delete(btn.dataset.id); await this.loadData(); } }));
    document.querySelectorAll('.edit-cat').forEach(btn => btn.addEventListener('click', async () => {
      const { data } = await categoryService.getAll();
      const cat = (data || []).find(c => c.id === btn.dataset.id);
      if (cat) {
        document.getElementById('modal-title').textContent = 'Edit Kategori';
        document.getElementById('cat-id').value = cat.id;
        document.getElementById('cat-name').value = cat.name;
        document.getElementById('cat-icon').value = cat.icon || '📁';
        modal.classList.remove('hidden');
      }
    }));
  },

  async save() {
    const data = {
      name: document.getElementById('cat-name').value,
      icon: document.getElementById('cat-icon').value || '📁'
    };
    const id = document.getElementById('cat-id').value;
    const { error } = id ? await categoryService.update(id, data) : await categoryService.create(data);
    if (!error) { document.getElementById('category-modal').classList.add('hidden'); await this.loadData(); }
  }
};
