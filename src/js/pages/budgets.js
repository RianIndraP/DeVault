import { budgetService, categoryService } from '../services/database.js';
import { icon, ICON_PATHS } from '../components/icons.js';
import { showToast } from '../components/toast.js';
import { tutorialPanel } from '../components/tutorial.js';
import { rupiah } from '../utils.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function safeIconKey(key) { return ICON_PATHS[key] ? key : 'folder'; }

// PRD status thresholds: 0-79% Aman, 80-99% Warning, 100%+ Terlampaui
function statusFor(pct) {
  if (pct >= 100) return { key: 'exceeded', label: 'Terlampaui', tone: 'coral' };
  if (pct >= 80) return { key: 'warning', label: 'Warning', tone: 'amber' };
  return { key: 'safe', label: 'Aman', tone: 'emerald' };
}

const now = new Date();

export const budgetsPage = {
  data: [],
  categories: [],
  monthFilter: now.getMonth() + 1,
  yearFilter: now.getFullYear(),
  statusFilter: 'all',
  _globalBound: false,

  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    container.innerHTML = `
      <div class="mb-6">
        <p class="text-xs font-semibold mb-1" style="color:var(--indigo); letter-spacing:.04em;">KELOLA</p>
        <h2 class="text-2xl font-bold font-display" style="color:var(--ink)">Budget</h2>
        <p class="text-sm mt-1" style="color:var(--ink-muted)">Atur batas pengeluaran per kategori dan pantau progresnya setiap bulan.</p>
      </div>

      <div id="bud-summary" class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5"></div>

      <div class="flex flex-wrap items-center gap-2.5 mb-5">
        <button id="btn-add-budget" class="px-4 py-2 rounded-lg text-white font-medium focus-ring btn-press text-sm flex items-center gap-1.5" style="background:var(--indigo)">
          ${icon('plus', 'w-4 h-4')} Tambah Budget
        </button>
        <div class="flex gap-1.5" id="bud-status-chips">
          <button class="chip active" data-status="all">Semua</button>
          <button class="chip" data-status="safe">Aman</button>
          <button class="chip" data-status="warning">Warning</button>
          <button class="chip" data-status="exceeded">Terlampaui</button>
        </div>
        <div class="flex-1"></div>
        <input type="month" id="bud-month-filter" value="${this.yearFilter}-${String(this.monthFilter).padStart(2, '0')}"
          class="px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface); color:var(--ink)" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="budgets-grid">
        <div class="col-span-full text-center py-16 text-sm" style="color:var(--ink-muted)">Memuat budget…</div>
      </div>

      <!-- Modal -->
      <div id="budget-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
        <form id="budget-form" class="rounded-2xl p-6 w-full max-w-md card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold font-display" id="modal-title" style="color:var(--ink)">Tambah Budget</h3>
            <button type="button" id="btn-cancel-modal" class="p-1.5 rounded-lg btn-press" style="color:var(--ink-muted)">${icon('close', 'w-5 h-5')}</button>
          </div>
          <input type="hidden" id="bud-id" />
          <div class="space-y-3.5">
            <div>
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Kategori</label>
              <select id="bud-category" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)"><option value="">Memuat...</option></select>
              <p id="bud-dup-warning" class="hidden text-xs mt-1.5 flex items-center gap-1.5" style="color:var(--amber)">${icon('warning', 'w-3.5 h-3.5 shrink-0')} Kategori ini sudah punya budget di bulan tersebut — menyimpan akan menimpa nilainya.</p>
            </div>
            <div>
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Bulan</label>
              <input type="month" id="bud-month" required class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" />
            </div>
            <div>
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Jumlah budget (Rp)</label>
              <input type="number" id="bud-amount" min="1" step="0.01" required class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="0" />
            </div>
          </div>
          <button type="submit" class="w-full mt-5 py-2.5 rounded-lg text-white font-semibold focus-ring btn-press text-sm" style="background:var(--indigo)">Simpan budget</button>
        </form>
      </div>
    `;

    tutorialPanel.setContent({
      eyebrow: 'HALAMAN INI',
      title: 'Budget',
      description: 'Tentukan batas pengeluaran per kategori untuk satu bulan tertentu. Progresnya dihitung otomatis dari transaksi pengeluaran yang kamu catat di halaman Transaksi, dan status warna-nya juga muncul di Dashboard.',
      steps: [
        'Klik <b>+ Tambah Budget</b>, pilih kategori (atau biarkan kosong untuk budget gabungan semua kategori), pilih bulan, lalu isi jumlahnya.',
        'Status budget otomatis berubah: <b>Aman</b> (di bawah 80%), <b>Warning</b> (80–99%), <b>Terlampaui</b> (100% ke atas).',
        'Pakai chip status atau pemilih bulan di kanan atas untuk menyaring daftar yang tampil.',
        '<b>Edit</b> untuk mengubah jumlah atau bulan, <b>Hapus</b> untuk menghapus budget.'
      ],
      tip: 'satu kategori hanya boleh punya satu budget per bulan — kalau kamu simpan budget baru untuk kombinasi kategori & bulan yang sama, nilainya akan menimpa yang lama (akan ada peringatan di form sebelum kamu simpan).'
    });

    this.attachEvents();
    this.bindGlobalListenersOnce();
    await this.loadCategories();
    await this.loadData();
  },

  async loadCategories() {
    const { data } = await categoryService.getAll();
    this.categories = data || [];
    const select = document.getElementById('bud-category');
    select.innerHTML = '<option value="">Semua kategori</option>' + this.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  },

  catInfo(id) { return this.categories.find(c => c.id === id); },

  async loadData() {
    const grid = document.getElementById('budgets-grid');
    const { data, error } = await budgetService.getAll();
    if (error) {
      grid.innerHTML = `<div class="col-span-full card rounded-2xl p-8 text-center" style="border-color:var(--coral)">
        <p class="font-medium" style="color:var(--coral)">Gagal memuat budget</p>
        <p class="text-sm mt-1" style="color:var(--ink-muted)">Coba muat ulang halaman.</p>
      </div>`;
      document.getElementById('bud-summary').innerHTML = '';
      return;
    }
    this.data = data || [];
    this.renderSummary();
    this.renderGrid();
  },

  getMonthly() {
    return this.data.filter(b => b.month === this.monthFilter && b.year === this.yearFilter);
  },

  getFiltered() {
    let list = this.getMonthly().map(b => {
      const pct = b.amount > 0 ? (Number(b.current_amount) / Number(b.amount)) * 100 : 0;
      return { ...b, pct, status: statusFor(pct) };
    });
    if (this.statusFilter !== 'all') list = list.filter(b => b.status.key === this.statusFilter);
    return list.sort((a, b) => b.pct - a.pct);
  },

  renderSummary() {
    const monthly = this.getMonthly();
    const totalBudget = monthly.reduce((s, b) => s + Number(b.amount), 0);
    const totalUsed = monthly.reduce((s, b) => s + Number(b.current_amount), 0);
    const exceededCount = monthly.filter(b => (b.amount > 0 ? b.current_amount / b.amount * 100 : 0) >= 100).length;
    const cards = [
      { label: `Budget ${MONTH_NAMES[this.monthFilter - 1]} ${this.yearFilter}`, value: rupiah(totalBudget), tone: 'indigo' },
      { label: 'Terpakai', value: rupiah(totalUsed), tone: 'violet' },
      { label: 'Sisa', value: rupiah(Math.max(0, totalBudget - totalUsed)), tone: 'emerald' },
      { label: 'Kategori terlampaui', value: exceededCount, tone: exceededCount ? 'coral' : 'emerald' },
    ];
    document.getElementById('bud-summary').innerHTML = cards.map(c => `
      <div class="rounded-xl p-4 card-hover" style="background:var(--${c.tone}-soft); border:1px solid var(--border)">
        <p class="text-xs font-medium" style="color:var(--ink-muted)">${c.label}</p>
        <p class="text-base font-semibold mt-0.5 tabular-nums truncate" style="color:var(--${c.tone})">${c.value}</p>
      </div>`).join('');
  },

  renderGrid() {
    const grid = document.getElementById('budgets-grid');
    const monthly = this.getMonthly();
    const list = this.getFiltered();

    if (!monthly.length) {
      grid.innerHTML = `
        <div class="col-span-full card rounded-2xl p-12 text-center">
          <span class="mb-3 flex justify-center" style="color:var(--ink-muted)">${icon('budgets', 'w-10 h-10')}</span>
          <h3 class="font-display text-lg font-semibold mb-1" style="color:var(--ink)">Belum ada budget di ${MONTH_NAMES[this.monthFilter - 1]} ${this.yearFilter}</h3>
          <p class="text-sm" style="color:var(--ink-muted)">Atur batasan pengeluaran per kategori untuk bulan ini.</p>
        </div>`;
      return;
    }
    if (!list.length) {
      grid.innerHTML = `<div class="col-span-full card rounded-2xl p-10 text-center">
        <p class="font-medium" style="color:var(--ink)">Tidak ada budget dengan status ini</p>
        <p class="text-sm mt-1" style="color:var(--ink-muted)">Coba pilih filter status lain.</p>
      </div>`;
      return;
    }

    grid.innerHTML = list.map(b => {
      const cat = this.catInfo(b.category_id);
      const width = Math.min(100, b.pct);
      const titleIcon = cat ? icon(safeIconKey(cat.icon), 'w-4 h-4 inline -mt-0.5') : icon('budgets', 'w-4 h-4 inline -mt-0.5');
      const titleText = cat ? cat.name : 'Semua kategori';
      return `
      <div class="card card-hover rounded-2xl p-5">
        <div class="flex items-start justify-between gap-2 mb-3">
          <h3 class="font-semibold truncate flex items-center gap-1.5" style="color:var(--ink)">${titleIcon} ${titleText}</h3>
          <span class="badge shrink-0" style="background:var(--${b.status.tone}-soft); color:var(--${b.status.tone})">${b.status.label}</span>
        </div>
        <div class="h-2.5 rounded-full mb-2" style="background:var(--surface-alt)">
          <div class="h-2.5 rounded-full" style="width:${width}%; background:var(--${b.status.tone})"></div>
        </div>
        <p class="text-sm tabular-nums" style="color:var(--ink-muted)">${rupiah(b.current_amount)} / ${rupiah(b.amount)} · ${Math.round(b.pct)}%</p>
        <p class="text-xs mt-1" style="color:var(--ink-muted)">${MONTH_NAMES[b.month - 1]} ${b.year}</p>
        <div class="mt-4 flex gap-2">
          <button class="edit-bud flex-1 text-xs font-semibold py-1.5 rounded-lg focus-ring btn-press" style="background:var(--surface-alt); color:var(--indigo)" data-id="${b.id}">Edit</button>
          <button class="delete-bud flex-1 text-xs font-semibold py-1.5 rounded-lg focus-ring btn-press" style="background:var(--coral-soft); color:var(--coral)" data-id="${b.id}">Hapus</button>
        </div>
      </div>`;
    }).join('');
  },

  attachEvents() {
    const modal = document.getElementById('budget-modal');
    const form = document.getElementById('budget-form');
    const catSelect = document.getElementById('bud-category');
    const monthInput = document.getElementById('bud-month');
    const dupWarning = document.getElementById('bud-dup-warning');

    const checkDuplicate = () => {
      const id = document.getElementById('bud-id').value;
      const [y, m] = (monthInput.value || '').split('-').map(Number);
      const catId = catSelect.value;
      const dupe = this.data.find(b => b.id !== id && b.category_id === (catId || null) && b.month === m && b.year === y);
      dupWarning.classList.toggle('hidden', !dupe);
    };
    catSelect.addEventListener('change', checkDuplicate);
    monthInput.addEventListener('change', checkDuplicate);

    document.getElementById('btn-add-budget').addEventListener('click', () => {
      document.getElementById('modal-title').textContent = 'Tambah Budget';
      form.reset();
      document.getElementById('bud-id').value = '';
      monthInput.value = `${this.yearFilter}-${String(this.monthFilter).padStart(2, '0')}`;
      dupWarning.classList.add('hidden');
      modal.classList.remove('hidden'); modal.classList.add('flex');
    });
    document.getElementById('btn-cancel-modal').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    form.addEventListener('submit', (e) => { e.preventDefault(); this.save(); });

    document.querySelectorAll('#bud-status-chips .chip').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('#bud-status-chips .chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.statusFilter = btn.dataset.status;
      this.renderGrid();
    }));
    document.getElementById('bud-month-filter').addEventListener('change', (e) => {
      const [y, m] = e.target.value.split('-').map(Number);
      this.yearFilter = y; this.monthFilter = m;
      this.renderSummary(); this.renderGrid();
    });

    // Event delegation di parent statis — tidak perlu diikat ulang tiap renderGrid().
    document.getElementById('budgets-grid').addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-bud');
      const deleteBtn = e.target.closest('.delete-bud');

      if (editBtn) {
        const b = this.data.find(x => x.id === editBtn.dataset.id);
        if (!b) return;
        document.getElementById('modal-title').textContent = 'Edit Budget';
        document.getElementById('bud-id').value = b.id;
        catSelect.value = b.category_id || '';
        monthInput.value = `${b.year}-${String(b.month).padStart(2, '0')}`;
        document.getElementById('bud-amount').value = b.amount;
        dupWarning.classList.add('hidden');
        modal.classList.remove('hidden'); modal.classList.add('flex');
      }
      if (deleteBtn) {
        const b = this.data.find(x => x.id === deleteBtn.dataset.id);
        const cat = b ? this.catInfo(b.category_id) : null;
        if (!confirm(`Hapus budget "${cat ? cat.name : 'Semua kategori'}" untuk ${b ? MONTH_NAMES[b.month - 1] : ''} ${b?.year || ''}?`)) return;
        budgetService.delete(deleteBtn.dataset.id).then(({ error }) => {
          if (error) { showToast('Gagal menghapus budget.', 'error'); return; }
          showToast('Budget berhasil dihapus.', 'success');
          this.loadData();
        });
      }
    });
  },

  bindGlobalListenersOnce() {
    if (this._globalBound) return;
    this._globalBound = true;
    document.addEventListener('keydown', (e) => {
      const modal = document.getElementById('budget-modal');
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) modal.classList.add('hidden');
    });
  },

  async save() {
    const monthVal = document.getElementById('bud-month').value;
    const amount = parseFloat(document.getElementById('bud-amount').value);
    if (!monthVal || !amount || amount <= 0) { showToast('Lengkapi bulan dan jumlah budget.', 'error'); return; }

    const [year, month] = monthVal.split('-').map(Number);
    const payload = {
      category_id: document.getElementById('bud-category').value || null,
      month, year,
      amount,
    };
    const id = document.getElementById('bud-id').value;
    const submitBtn = document.querySelector('#budget-form button[type="submit"]');
    submitBtn.disabled = true;
    try {
      const { error } = id ? await budgetService.update(id, payload) : await budgetService.create(payload);
      if (error) throw error;
      document.getElementById('budget-modal').classList.add('hidden');
      showToast(id ? 'Budget diperbarui.' : 'Budget ditambahkan.', 'success');
      await this.loadData();
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan budget.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  }
};