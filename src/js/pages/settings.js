export const settingsPage = {
  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    const user = await (await import('../services/auth.js')).authService.getCurrentUser();
    container.innerHTML = `
      <div class="max-w-2xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Pengaturan</h2>
          <p class="text-gray-500 mt-1">Kelola akun dan preferensi kamu</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
          <h3 class="font-semibold text-gray-800 mb-4">Informasi Akun</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm text-gray-500 mb-1">Email</label>
              <p class="text-gray-800">${user?.email || '-'}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">Nama</label>
              <p class="text-gray-800">${user?.user_metadata?.display_name || user?.user_metadata?.full_name || '-'}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">Status</label>
              <p class="text-green-600 text-sm">✅ Aktif</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
          <h3 class="font-semibold text-gray-800 mb-4">Preferensi</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-800">Notifikasi</p>
                <p class="text-sm text-gray-500">Terima notifikasi untuk budget dan target</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked class="sr-only peer" id="toggle-notifications" />
                <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-800">Currency</p>
                <p class="text-sm text-gray-500">Pilih currency untuk laporan</p>
              </div>
              <select class="px-3 py-2 border border-gray-300 rounded-lg">
                <option value="IDR">IDR (Rp)</option>
                <option value="USD">USD ($)</option>
                <option value="SGD">SGD ($)</option>
              </select>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-800 mb-4">Data & Export</h3>
          <div class="space-y-3">
            <button id="btn-export-excel" class="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">📥 Export ke Excel</button>
            <button id="btn-export-pdf" class="w-full text-left px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition">📄 Export ke PDF</button>
            <button id="btn-import-excel" class="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">📤 Import dari Excel</button>
            <button id="btn-clear-data" class="w-full text-left px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition">🗑️ Hapus Semua Data</button>
          </div>
        </div>
      </div>
    `;
    this.attachEvents();
  },

  attachEvents() {
    const exportExcel = document.getElementById('btn-export-excel');
    const exportPdf = document.getElementById('btn-export-pdf');
    const importExcel = document.getElementById('btn-import-excel');
    const clearData = document.getElementById('btn-clear-data');
    if (exportExcel) exportExcel.addEventListener('click', () => alert('Fitur export Excel akan tersedia di langkah selanjutnya'));
    if (exportPdf) exportPdf.addEventListener('click', () => alert('Fitur export PDF akan tersedia di langkah selanjutnya'));
    if (importExcel) importExcel.addEventListener('click', () => alert('Fitur import Excel akan tersedia di langkah selanjutnya'));
    if (clearData) clearData.addEventListener('click', async () => { if (confirm('Hapus semua data? Ini tidak bisa dibatalkan.')) { alert('Fitur hapus data akan tersedia di langkah selanjutnya'); } });
  }
};
