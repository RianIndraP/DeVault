export const tutorialPanel = {
  async render() {
    const container = document.getElementById('tutorial-container');
    if (!container) return;
    container.innerHTML = `
      <div id="tutorial-backdrop"></div>
      <aside id="tutorial-panel" class="flex flex-col overflow-y-auto py-6 px-4">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-display text-lg font-semibold" style="color:var(--ink)">Tutorial</h3>
          <button id="btn-tutorial-close" class="p-1.5 rounded-lg focus-ring btn-press" style="color:var(--ink-muted)" aria-label="Tutup tutorial">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div id="tutorial-steps" class="space-y-4 flex-1">
          <div class="step" data-step="1">
            <div class="flex items-center gap-3 mb-1">
              <span class="step-num">1</span>
              <p class="text-sm font-semibold" style="color:var(--ink)">Buat Akun</p>
            </div>
            <p class="text-xs ml-8" style="color:var(--ink-muted)">Tambahkan akun bank, e-wallet, atau kas untuk memulai pencatatan</p>
          </div>
          <div class="step" data-step="2">
            <div class="flex items-center gap-3 mb-1">
              <span class="step-num">2</span>
              <p class="text-sm font-semibold" style="color:var(--ink)">Tambah Kategori</p>
            </div>
            <p class="text-xs ml-8" style="color:var(--ink-muted)">Atur kategori pengeluaran dan pemasukan sesuai kebutuhan</p>
          </div>
          <div class="step" data-step="3">
            <div class="flex items-center gap-3 mb-1">
              <span class="step-num">3</span>
              <p class="text-sm font-semibold" style="color:var(--ink)">Catat Transaksi</p>
            </div>
            <p class="text-xs ml-8" style="color:var(--ink-muted)">Masukkan transaksi harian untuk memantau arus keuangan</p>
          </div>
          <div class="step" data-step="4">
            <div class="flex items-center gap-3 mb-1">
              <span class="step-num">4</span>
              <p class="text-sm font-semibold" style="color:var(--ink)">Lihat Laporan</p>
            </div>
            <p class="text-xs ml-8" style="color:var(--ink-muted)">Periksa ringkasan dan tren pengeluaran per bulan di halaman Laporan</p>
          </div>
          <div class="step" data-step="5">
            <div class="flex items-center gap-3 mb-1">
              <span class="step-num">5</span>
              <p class="text-sm font-semibold" style="color:var(--ink)">Atur Target</p>
            </div>
            <p class="text-xs ml-8" style="color:var(--ink-muted)">Tetapkan target tabungan dan budget untuk mengontrol pengeluaran</p>
          </div>
        </div>
        <button id="btn-tutorial-done" class="mt-4 w-full px-4 py-3 rounded-lg text-white font-medium focus-ring btn-press" style="background:var(--indigo)">Selesai</button>
      </aside>
    `;
    this.attachEvents();
  },

  attachEvents() {
    const closeBtn = document.getElementById('btn-tutorial-close');
    const backdrop = document.getElementById('tutorial-backdrop');
    const doneBtn = document.getElementById('btn-tutorial-done');
    const panel = document.getElementById('tutorial-panel');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (backdrop) backdrop.addEventListener('click', () => this.close());
    if (doneBtn) doneBtn.addEventListener('click', () => this.close());
  },

  open() {
    const panel = document.getElementById('tutorial-panel');
    const backdrop = document.getElementById('tutorial-backdrop');
    if (panel) panel.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  },

  close() {
    const panel = document.getElementById('tutorial-panel');
    const backdrop = document.getElementById('tutorial-backdrop');
    if (panel) panel.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  }
};
