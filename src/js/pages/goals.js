import { goalService } from '../services/database.js';

export const goalsPage = {
  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    container.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Target Tabungan</h2>
          <p class="text-gray-500 mt-1">Tetapkan target dan pantau perkembangan</p>
        </div>
        <button id="btn-add-goal" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4">+ Tambah Target</button>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="goals-grid"></div>
        <div id="goal-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 class="text-lg font-bold mb-4" id="modal-title">Tambah Target</h3>
            <form id="goal-form" class="space-y-4">
              <input type="hidden" id="goal-id" />
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Target</label>
                <input type="text" id="goal-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Contoh: Dana Pernikahan" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <input type="number" id="goal-amount" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0" min="1" step="0.01" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input type="date" id="goal-deadline" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <input type="text" id="goal-desc" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Opsional..." />
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
    const { data, error } = await goalService.getAll();
    const grid = document.getElementById('goals-grid');
    if (error || !data) { grid.innerHTML = '<p class="text-red-500">Gagal memuat</p>'; return; }
    if (!data.length) { grid.innerHTML = '<p class="text-gray-400 col-span-full">Belum ada target</p>'; return; }
    grid.innerHTML = data.map(g => {
      const pct = g.target_amount > 0 ? Math.min((g.current_amount / g.target_amount) * 100, 100) : 0;
      return `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 class="font-bold text-gray-800 mb-1">${g.name}</h3>
          <p class="text-sm text-gray-500 mb-3">${g.description || ''}</p>
          <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div class="h-3 rounded-full bg-green-600" style="width: ${pct}%"></div>
          </div>
          <p class="text-sm text-gray-600">Rp ${Number(g.current_amount).toLocaleString('id-ID')} / Rp ${Number(g.target_amount).toLocaleString('id-ID')} (${Math.round(pct)}%)</p>
          <p class="text-xs text-gray-400 mt-1">${g.deadline ? 'Deadline: ' + new Date(g.deadline).toLocaleDateString('id-ID') : 'No deadline'}</p>
        </div>
      `;
    }).join('');
  },

  attachEvents() {
    const modal = document.getElementById('goal-modal');
    const form = document.getElementById('goal-form');
    const addBtn = document.getElementById('btn-add-goal');
    const cancelBtn = document.getElementById('btn-cancel-modal');

    if (addBtn) addBtn.addEventListener('click', () => { document.getElementById('modal-title').textContent = 'Tambah Target'; document.getElementById('goal-id').value = ''; modal.classList.remove('hidden'); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    if (form) form.addEventListener('submit', async (e) => { e.preventDefault(); await this.save(); });
  },

  async save() {
    const data = {
      name: document.getElementById('goal-name').value,
      target_amount: parseFloat(document.getElementById('goal-amount').value),
      deadline: document.getElementById('goal-deadline').value || null,
      description: document.getElementById('goal-desc').value || null
    };
    const id = document.getElementById('goal-id').value;
    const { error } = id ? await goalService.update(id, data) : await goalService.create(data);
    if (!error) { document.getElementById('goal-modal').classList.add('hidden'); await this.loadData(); }
  }
};
