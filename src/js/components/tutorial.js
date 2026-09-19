import { icon } from './icons.js';

// Panel bantuan di sisi kanan. Tiap halaman mengatur isinya sendiri lewat
// tutorialPanel.setContent({...}) di dalam render()-nya. Kalau sebuah
// halaman belum mengatur isi, panel menampilkan konten default di bawah.

const DEFAULT_CONTENT = {
  eyebrow: 'PANDUAN',
  title: 'Dompetku',
  description: 'Pilih menu di sidebar untuk mulai mencatat dan memantau keuanganmu. Panduan khusus halaman akan muncul di sini.',
  steps: [],
  tip: null
};

export const tutorialPanel = {
  content: DEFAULT_CONTENT,

  render() {
    const container = document.getElementById('tutorial-container');
    if (!container) return;
    const c = this.content || DEFAULT_CONTENT;

    container.innerHTML = `
      <div id="tutorial-backdrop"></div>
      <aside id="tutorial-panel">
        <div class="h-16 flex items-center gap-2 px-5 shrink-0" style="border-bottom:1px solid var(--border)">
          <span style="color:var(--indigo)">${icon('book', 'w-5 h-5')}</span>
          <span class="font-display text-base font-semibold" style="color:var(--ink)">Panduan halaman</span>
          <button id="btn-tutorial-close" class="ml-auto xl:hidden p-1.5 rounded-lg focus-ring btn-press" style="color:var(--ink-muted)" aria-label="Tutup panduan">
            ${icon('close', 'w-4 h-4')}
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-5 py-5 text-sm">
          <p class="text-xs font-semibold mb-1.5" style="color:var(--indigo); letter-spacing:.04em;">${c.eyebrow}</p>
          <h3 class="font-display text-lg font-semibold mb-2" style="color:var(--ink)">${c.title}</h3>
          <p class="leading-relaxed mb-5" style="color:var(--ink-muted)">${c.description}</p>

          ${c.steps.length ? `
            <p class="text-xs font-semibold mb-2" style="color:var(--indigo); letter-spacing:.04em;">CARA PAKAI</p>
            <ol class="space-y-3 mb-5">
              ${c.steps.map((s, i) => `<li class="flex gap-2.5" style="color:var(--ink)"><span class="step-num">${i + 1}</span><span>${s}</span></li>`).join('')}
            </ol>` : ''}

          ${c.tip ? `
            <div class="rounded-xl p-3.5" style="background:var(--emerald-soft)">
              <p class="text-xs leading-relaxed" style="color:var(--ink)"><b>💡 Tips:</b> ${c.tip}</p>
            </div>` : ''}
        </div>
      </aside>
      <button id="btn-tutorial-toggle" class="xl:hidden fixed bottom-5 right-5 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-lg focus-ring btn-press" style="background:var(--indigo); color:#fff" aria-label="Buka panduan">
        ${icon('book', 'w-5 h-5')}
      </button>
    `;
    this.attachEvents();
  },

  attachEvents() {
    const toggleBtn = document.getElementById('btn-tutorial-toggle');
    const closeBtn = document.getElementById('btn-tutorial-close');
    const backdrop = document.getElementById('tutorial-backdrop');
    if (toggleBtn) toggleBtn.addEventListener('click', () => this.setOpen(true));
    if (closeBtn) closeBtn.addEventListener('click', () => this.setOpen(false));
    if (backdrop) backdrop.addEventListener('click', () => this.setOpen(false));
  },

  setOpen(open) {
    document.getElementById('tutorial-panel')?.classList.toggle('open', !!open);
    document.getElementById('tutorial-backdrop')?.classList.toggle('open', !!open);
  },

  /**
   * Dipanggil dari render() tiap halaman untuk mengatur isi panduan.
   * @param {{eyebrow?:string, title:string, description:string, steps?:string[], tip?:string}} content
   */
  setContent(content) {
    this.content = { ...DEFAULT_CONTENT, ...content, steps: content.steps || [] };
    this.render();
  }
};
