import { categoryService } from '../services/database.js';
import { icon, ICON_PATHS } from '../components/icons.js';
import { showToast } from '../components/toast.js';
import { tutorialPanel } from '../components/tutorial.js';

// ⚠️ CATATAN: pedoman aslinya memakai emoji bebas (input teks) untuk ikon
// kategori. Supaya konsisten dengan seluruh app (tidak ada emoji, semua
// ikon SVG satu gaya), field `icon` di sini diganti isinya jadi salah satu
// KEY dari icons.js (mis. "food", "bills") — bukan lagi karakter emoji.
// Kalau di database kamu sudah ada kategori lama yang `icon`-nya berupa
// emoji, kategori itu akan otomatis jatuh ke ikon "folder" sampai kamu
// edit ulang dan pilih ikon dari grid baru ini.

const PALETTE = ['indigo', 'emerald', 'coral', 'amber', 'violet'];
function toneFor(id) {
  let hash = 0;
  for (const ch of String(id)) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return PALETTE[hash % PALETTE.length];
}

const QUICK_ICONS = ['food', 'bills', 'transport', 'entertainment', 'health', 'income', 'general', 'shield', 'laptop', 'calendar', 'leaf', 'book', 'folder'];
function safeIconKey(key) { return ICON_PATHS[key] ? key : 'folder'; }

function relativeDate(iso) {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diffDays <= 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 30) return `${diffDays} hari lalu`;
  return `${Math.floor(diffDays / 30)} bulan lalu`;
}

export const categoriesPage = {
  data: [],
  search: '',
  sort: 'name', // 'name' | 'recent'
  selectedIcon: 'folder',
  _globalBound: false,

  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    container.innerHTML = `
      <div class="mb-6">
        <p class="text-xs font-semibold mb-1" style="color:var(--indigo); letter-spacing:.04em;">KELOLA</p>
        <h2 class="text-2xl font-bold font-display" style="color:var(--ink)">Kategori</h2>
        <p class="text-sm mt-1" style="color:var(--ink-muted)">Kelompokkan transaksimu di sini — dipakai lagi di Transaksi, Budget, dan breakdown Dashboard.</p>
      </div>

      <div id="cat-summary" class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5"></div>

      <div class="flex flex-wrap items-center gap-2.5 mb-5">
        <button id="btn-add-category" class="px-4 py-2 rounded-lg text-white font-medium focus-ring btn-press text-sm flex items-center gap-1.5" style="background:var(--indigo)">
          ${icon('plus', 'w-4 h-4')} Tambah Kategori
        </button>
        <div class="flex gap-1.5">
          <button class="chip active" data-sort="name">A–Z</button>
          <button class="chip" data-sort="recent">Terbaru</button>
        </div>
        <div class="flex-1"></div>
        <div class="flex items-center gap-2 rounded-lg px-3 py-2 w-48" style="background:var(--surface); border:1px solid var(--border)">
          ${icon('search', 'w-4 h-4 shrink-0')}
          <input id="cat-search" type="text" placeholder="Cari kategori..." class="bg-transparent text-sm w-full outline-none placeholder:opacity-60" style="color:var(--ink)" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="categories-grid">
        <div class="col-span-full text-center py-16 text-sm" style="color:var(--ink-muted)">Memuat kategori…</div>
      </div>

      <!-- Modal -->
      <div id="category-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
        <form id="category-form" class="rounded-2xl p-6 w-full max-w-md card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold font-display" id="modal-title" style="color:var(--ink)">Tambah Kategori</h3>
            <button type="button" id="btn-cancel-modal" class="p-1.5 rounded-lg btn-press" style="color:var(--ink-muted)">${icon('close', 'w-5 h-5')}</button>
          </div>
          <input type="hidden" id="cat-id" />
          <input type="hidden" id="cat-icon" value="folder" />

          <div class="flex items-center gap-4 mb-4 rounded-xl p-4" style="background:var(--surface-alt)">
            <span id="cat-icon-preview" class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style="background:var(--indigo-soft); color:var(--indigo)">${icon('folder', 'w-7 h-7')}</span>
            <div class="min-w-0">
              <p class="text-xs" style="color:var(--ink-muted)">Pratinjau</p>
              <p id="cat-name-preview" class="font-semibold truncate" style="color:var(--ink)">Nama kategori</p>
            </div>
          </div>

          <div class="space-y-3.5">
            <div>
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Nama</label>
              <input type="text" id="cat-name" required class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="Contoh: Makanan" />
            </div>
            <div>
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Ikon</label>
              <div class="flex flex-wrap gap-1.5" id="icon-picker">
                ${QUICK_ICONS.map(key => `
                  <button type="button" class="quick-icon w-9 h-9 rounded-lg flex items-center justify-center focus-ring btn-press" style="background:var(--surface-alt); border:1px solid var(--border); color:var(--ink-muted)" data-icon="${key}">
                    ${icon(key, 'w-4 h-4')}
                  </button>`).join('')}
              </div>
            </div>
          </div>

          <button type="submit" class="w-full mt-5 py-2.5 rounded-lg text-white font-semibold focus-ring btn-press text-sm" style="background:var(--indigo)">Simpan kategori</button>
        </form>
      </div>
    `;

    tutorialPanel.setContent({
      eyebrow: 'HALAMAN INI',
      title: 'Kategori',
      description: 'Kategori dipakai untuk mengelompokkan transaksi pengeluaran — hasilnya kamu lihat di breakdown Dashboard, dan tiap kategori bisa punya batas di halaman Budget.',
      steps: [
        'Klik <b>+ Tambah Kategori</b>, isi nama, lalu pilih salah satu ikon di grid.',
        'Warna tiap kategori dibuat otomatis (tetap sama untuk kategori yang sama) supaya mudah dibedakan di grafik.',
        'Pakai kotak pencarian atau tombol A–Z / Terbaru untuk menyusun daftar.',
        '<b>Edit</b> untuk mengubah nama atau ikon, <b>Hapus</b> untuk menghapus kategori.'
      ],
      tip: 'menghapus kategori tidak memindahkan transaksi yang sudah memakainya — transaksi lama akan tetap menyimpan kategori tersebut sampai kamu ubah manual satu per satu.'
    });

    this.attachEvents();
    this.bindGlobalListenersOnce();
    await this.loadData();
  },

  async loadData() {
    const grid = document.getElementById('categories-grid');
    const { data, error } = await categoryService.getAll();
    if (error) {
      grid.innerHTML = `<div class="col-span-full card rounded-2xl p-8 text-center" style="border-color:var(--coral)">
        <p class="font-medium" style="color:var(--coral)">Gagal memuat kategori</p>
        <p class="text-sm mt-1" style="color:var(--ink-muted)">Coba muat ulang halaman.</p>
      </div>`;
      document.getElementById('cat-summary').innerHTML = '';
      return;
    }
    this.data = data || [];
    this.renderSummary();
    this.renderGrid();
  },

  getFiltered() {
    let list = [...this.data];
    if (this.search) {
      const q = this.search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    if (this.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list;
  },

  renderSummary() {
    const count = this.data.length;
    const newest = [...this.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    const cards = [
      { label: 'Total kategori', value: count, tone: 'indigo' },
      { label: 'Terbaru dibuat', value: newest ? newest.name : '—', tone: 'emerald' },
      { label: 'Dibuat', value: newest ? relativeDate(newest.created_at) : '—', tone: 'amber' },
    ];
    document.getElementById('cat-summary').innerHTML = cards.map(c => `
      <div class="rounded-xl p-4 card-hover" style="background:var(--${c.tone}-soft); border:1px solid var(--border)">
        <p class="text-xs font-medium" style="color:var(--ink-muted)">${c.label}</p>
        <p class="text-base font-semibold mt-0.5 truncate" style="color:var(--${c.tone})">${c.value}</p>
      </div>`).join('');
  },

  renderGrid() {
    const grid = document.getElementById('categories-grid');
    const list = this.getFiltered();

    if (!this.data.length) {
      grid.innerHTML = `
        <div class="col-span-full card rounded-2xl p-12 text-center">
          <span class="mb-3 flex justify-center" style="color:var(--ink-muted)">${icon('categories', 'w-10 h-10')}</span>
          <h3 class="font-display text-lg font-semibold mb-1" style="color:var(--ink)">Belum ada kategori</h3>
          <p class="text-sm" style="color:var(--ink-muted)">Buat kategori agar transaksi lebih terorganisir.</p>
        </div>`;
      return;
    }
    if (!list.length) {
      grid.innerHTML = `<div class="col-span-full card rounded-2xl p-10 text-center">
        <p class="font-medium" style="color:var(--ink)">Tidak ada kategori yang cocok</p>
        <p class="text-sm mt-1" style="color:var(--ink-muted)">Coba kata kunci pencarian lain.</p>
      </div>`;
      return;
    }

    grid.innerHTML = list.map(c => {
      const tone = toneFor(c.id);
      const key = safeIconKey(c.icon);
      return `
      <div class="card card-hover rounded-2xl p-5 flex items-center gap-4">
        <span class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style="background:var(--${tone}-soft); color:var(--${tone})">${icon(key, 'w-5 h-5')}</span>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold truncate" style="color:var(--ink)">${c.name}</h3>
          <p class="text-xs mt-0.5" style="color:var(--ink-muted)">Dibuat ${relativeDate(c.created_at)} · ${new Date(c.created_at).toLocaleDateString('id-ID')}</p>
        </div>
        <div class="flex flex-col gap-1.5 shrink-0">
          <button class="edit-cat text-xs font-semibold px-3 py-1.5 rounded-lg focus-ring btn-press" style="background:var(--surface-alt); color:var(--indigo)" data-id="${c.id}">Edit</button>
          <button class="delete-cat text-xs font-semibold px-3 py-1.5 rounded-lg focus-ring btn-press" style="background:var(--coral-soft); color:var(--coral)" data-id="${c.id}">Hapus</button>
        </div>
      </div>`;
    }).join('');
  },

  attachEvents() {
    const modal = document.getElementById('category-modal');
    const form = document.getElementById('category-form');
    const nameInput = document.getElementById('cat-name');
    const iconInput = document.getElementById('cat-icon');
    const preview = document.getElementById('cat-icon-preview');
    const namePreview = document.getElementById('cat-name-preview');

    const syncPreview = () => {
      preview.innerHTML = icon(safeIconKey(iconInput.value), 'w-7 h-7');
      namePreview.textContent = nameInput.value.trim() || 'Nama kategori';
      document.querySelectorAll('.quick-icon').forEach(btn => {
        const active = btn.dataset.icon === iconInput.value;
        btn.style.background = active ? 'var(--indigo-soft)' : 'var(--surface-alt)';
        btn.style.color = active ? 'var(--indigo)' : 'var(--ink-muted)';
        btn.style.borderColor = active ? 'var(--indigo)' : 'var(--border)';
      });
    };
    nameInput.addEventListener('input', syncPreview);
    document.querySelectorAll('.quick-icon').forEach(btn => btn.addEventListener('click', () => {
      iconInput.value = btn.dataset.icon;
      syncPreview();
    }));

    document.getElementById('btn-add-category').addEventListener('click', () => {
      document.getElementById('modal-title').textContent = 'Tambah Kategori';
      form.reset();
      document.getElementById('cat-id').value = '';
      iconInput.value = 'folder';
      syncPreview();
      modal.classList.remove('hidden'); modal.classList.add('flex');
      setTimeout(() => nameInput.focus(), 50);
    });
    document.getElementById('btn-cancel-modal').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    form.addEventListener('submit', (e) => { e.preventDefault(); this.save(); });

    document.querySelectorAll('[data-sort]').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.sort = btn.dataset.sort;
      this.renderGrid();
    }));
    document.getElementById('cat-search').addEventListener('input', (e) => {
      this.search = e.target.value;
      this.renderGrid();
    });

    // Event delegation di parent statis — tidak perlu diikat ulang tiap renderGrid().
    document.getElementById('categories-grid').addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-cat');
      const deleteBtn = e.target.closest('.delete-cat');

      if (editBtn) {
        const cat = this.data.find(c => c.id === editBtn.dataset.id);
        if (!cat) return;
        document.getElementById('modal-title').textContent = 'Edit Kategori';
        document.getElementById('cat-id').value = cat.id;
        nameInput.value = cat.name;
        iconInput.value = safeIconKey(cat.icon);
        syncPreview();
        modal.classList.remove('hidden'); modal.classList.add('flex');
      }
      if (deleteBtn) {
        const cat = this.data.find(c => c.id === deleteBtn.dataset.id);
        if (!confirm(`Hapus kategori "${cat?.name || ''}"? Transaksi yang memakai kategori ini tidak akan otomatis pindah.`)) return;
        categoryService.delete(deleteBtn.dataset.id).then(({ error }) => {
          if (error) { showToast('Gagal menghapus kategori.', 'error'); return; }
          showToast('Kategori berhasil dihapus.', 'success');
          this.loadData();
        });
      }
    });
  },

  bindGlobalListenersOnce() {
    if (this._globalBound) return;
    this._globalBound = true;
    document.addEventListener('keydown', (e) => {
      const modal = document.getElementById('category-modal');
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) modal.classList.add('hidden');
    });
  },

  async save() {
    const name = document.getElementById('cat-name').value.trim();
    if (!name) { showToast('Nama kategori wajib diisi.', 'error'); return; }

    const payload = { name, icon: safeIconKey(document.getElementById('cat-icon').value) };
    const id = document.getElementById('cat-id').value;
    const submitBtn = document.querySelector('#category-form button[type="submit"]');
    submitBtn.disabled = true;
    try {
      const { error } = id ? await categoryService.update(id, payload) : await categoryService.create(payload);
      if (error) throw error;
      document.getElementById('category-modal').classList.add('hidden');
      showToast(id ? 'Kategori diperbarui.' : 'Kategori ditambahkan.', 'success');
      await this.loadData();
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan kategori.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  }
};