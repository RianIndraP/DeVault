import { accountService, transactionService } from '../services/database.js';
import { icon } from '../components/icons.js';
import { showToast } from '../components/toast.js';
import { tutorialPanel } from '../components/tutorial.js';
import { rupiah } from '../utils.js';

// ⚠️ CATATAN: fitur Sembunyikan/Tutup akun butuh kolom accounts.status dan
// accounts.closed_at (lihat migration_accounts_status.sql). Sebelum kolom
// itu ada, semua akun dianggap 'active' (fallback aman lewat `a.status ||
// 'active'`), jadi halaman tetap jalan tanpa error meski migration belum
// dijalankan — fitur sembunyikan/tutup-nya saja yang belum benar2 tersimpan.
//
// CATATAN SCOPE: "Lihat transaksi" diimplementasikan sebagai drawer di
// halaman ini (bukan route terpisah /accounts/:id) karena router.js belum
// mendukung dynamic route. Rekonsiliasi ("Periksa saldo" vs saldo bank
// asli) dan field last-4-digit/ikon-warna kustom di form tambah akun belum
// dikerjakan di iterasi ini.

const TYPE_META = {
  cash: { label: 'Cash', iconKey: 'cash', tone: 'emerald' },
  bank: { label: 'Bank', iconKey: 'bank', tone: 'indigo' },
  e_wallet: { label: 'E-Wallet', iconKey: 'wallet', tone: 'violet' },
  other: { label: 'Lainnya', iconKey: 'folder', tone: 'amber' },
};
const TYPE_ORDER = ['cash', 'bank', 'e_wallet', 'other'];
const HIDE_PREF_KEY = 'dompetku-hide-balance';

export const accountsPage = {
  data: [],
  transactions: [],
  filterType: 'all',
  search: '',
  hideAmount: localStorage.getItem(HIDE_PREF_KEY) === 'true',
  _globalBound: false,

  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    container.innerHTML = `
      <div class="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <p class="text-xs font-semibold mb-1" style="color:var(--indigo); letter-spacing:.04em;">KELOLA</p>
          <h2 class="text-2xl font-bold font-display" style="color:var(--ink)">Akun</h2>
          <p class="text-sm mt-1" style="color:var(--ink-muted)">Lihat dan kelola seluruh akun keuanganmu.</p>
        </div>
        <button id="btn-add-account" class="px-4 py-2 rounded-lg text-white font-semibold focus-ring btn-press text-sm flex items-center gap-1.5" style="background:var(--indigo)">
          ${icon('plus', 'w-4 h-4')} Tambah Akun
        </button>
      </div>

      <!-- HERO -->
      <div class="card rounded-2xl p-6 mb-5">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p class="text-sm" style="color:var(--ink-muted)">Total saldo</p>
            <p id="acc-total" class="font-display text-4xl md:text-5xl font-semibold mt-1 tabular-nums" style="color:var(--ink)">Rp0</p>
          </div>
          <button id="btn-toggle-hide" class="text-xs font-medium px-3 py-1.5 rounded-full btn-press" style="background:var(--surface-alt); color:var(--ink-muted)">${this.hideAmount ? 'Tampilkan saldo' : 'Sembunyikan saldo'}</button>
        </div>
        <p id="acc-count" class="text-sm mt-2" style="color:var(--ink-muted)"></p>
        <p id="acc-distribution" class="text-sm mt-1" style="color:var(--ink-muted)"></p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 mb-5">
        <div class="flex gap-1.5 overflow-x-auto" id="acc-type-chips">
          <button class="chip active" data-type="all">Semua</button>
          ${TYPE_ORDER.map(key => `<button class="chip" data-type="${key}">${icon(TYPE_META[key].iconKey, 'w-3.5 h-3.5 inline -mt-0.5')} ${TYPE_META[key].label}</button>`).join('')}
        </div>
        <div class="flex-1"></div>
        <div class="flex items-center gap-2 rounded-lg px-3 py-2 w-48" style="background:var(--surface); border:1px solid var(--border)">
          ${icon('search', 'w-4 h-4 shrink-0')}
          <input id="acc-search" type="text" placeholder="Cari akun..." class="bg-transparent text-sm w-full outline-none placeholder:opacity-60" style="color:var(--ink)" />
        </div>
      </div>

      <div id="accounts-groups">
        <div class="text-center py-16 text-sm" style="color:var(--ink-muted)">Memuat akun…</div>
      </div>

      <!-- AKUN TERSEMBUNYI / DITUTUP -->
      <details id="acc-archive" class="hidden mt-6 rounded-xl card p-4">
        <summary class="cursor-pointer text-sm font-semibold" style="color:var(--ink)">Akun tersembunyi / ditutup <span id="acc-archive-count" style="color:var(--ink-muted); font-weight:500"></span></summary>
        <div id="acc-archive-list" class="mt-3 space-y-2"></div>
      </details>

      <!-- MODAL TAMBAH/EDIT -->
      <div id="account-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
        <form id="account-form" class="rounded-2xl p-6 w-full max-w-md card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold font-display" id="modal-title" style="color:var(--ink)">Tambah Akun</h3>
            <button type="button" id="btn-cancel-modal" class="p-1.5 rounded-lg btn-press" style="color:var(--ink-muted)">${icon('close', 'w-5 h-5')}</button>
          </div>
          <input type="hidden" id="acc-id" />
          <div class="space-y-3.5">
            <div>
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Nama akun</label>
              <input type="text" id="acc-name" required class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="Contoh: BCA" />
            </div>
            <div>
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Jenis akun</label>
              <select id="acc-type" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)">
                ${TYPE_ORDER.map(key => `<option value="${key}">${TYPE_META[key].label}</option>`).join('')}
              </select>
            </div>
            <div id="acc-balance-wrap">
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Saldo awal (Rp)</label>
              <input type="number" id="acc-balance" min="0" step="0.01" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="0" />
            </div>
            <p id="acc-balance-hint" class="hidden text-xs mt-1" style="color:var(--ink-muted)">Untuk mengubah saldo akun yang sudah berjalan, pakai <b>Koreksi saldo</b> di menu ••• supaya tercatat sebagai penyesuaian, bukan diubah diam-diam.</p>
          </div>
          <button type="submit" class="w-full mt-5 py-2.5 rounded-lg text-white font-semibold focus-ring btn-press text-sm" style="background:var(--indigo)">Simpan akun</button>
        </form>
      </div>

      <!-- MODAL KOREKSI SALDO -->
      <div id="adjust-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
        <div class="rounded-2xl p-6 w-full max-w-sm card">
          <h3 class="font-display text-lg font-semibold mb-1" style="color:var(--ink)">Koreksi saldo</h3>
          <p id="adjust-acc-name" class="text-sm mb-4" style="color:var(--ink-muted)"></p>
          <div class="mb-3 p-3 rounded-lg" style="background:var(--surface-alt)">
            <p class="text-xs" style="color:var(--ink-muted)">Saldo tercatat saat ini</p>
            <p id="adjust-current" class="text-xl font-bold font-display tabular-nums" style="color:var(--ink)">Rp0</p>
          </div>
          <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Saldo sebenarnya sekarang (Rp)</label>
          <input type="number" id="adjust-actual" min="0" step="0.01" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" />
          <p class="text-xs mt-1 mb-4" style="color:var(--ink-muted)">Selisihnya akan dicatat sebagai transaksi penyesuaian, jadi tetap terlacak di riwayat.</p>
          <div class="flex gap-2 justify-end">
            <button id="adjust-cancel" class="text-sm font-medium px-4 py-2 rounded-lg btn-press" style="color:var(--ink-muted)">Batal</button>
            <button id="adjust-save" class="text-sm font-semibold px-4 py-2 rounded-lg btn-press" style="background:var(--indigo); color:#fff">Simpan koreksi</button>
          </div>
        </div>
      </div>

      <!-- MODAL KONFIRMASI HAPUS -->
      <div id="confirm-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
        <div class="rounded-2xl p-6 w-full max-w-sm card">
          <h3 class="text-lg font-bold font-display mb-2" style="color:var(--ink)">Hapus akun?</h3>
          <p id="confirm-message" class="text-sm mb-5" style="color:var(--ink-muted)"></p>
          <div class="flex gap-2 justify-end">
            <button id="confirm-cancel" class="text-sm font-medium px-4 py-2 rounded-lg btn-press" style="color:var(--ink-muted)">Batal</button>
            <button id="confirm-ok" class="text-sm font-semibold px-4 py-2 rounded-lg btn-press" style="background:var(--coral); color:#fff">Hapus akun</button>
          </div>
        </div>
      </div>

      <!-- MODAL VERIFIKASI SALDO AWAL BULAN -->
      <div id="verify-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
        <div class="rounded-2xl p-6 w-full max-w-md card">
          <h3 class="font-display text-lg font-semibold mb-2" style="color:var(--ink)">Verifikasi Saldo Awal</h3>
          <p class="text-sm mb-3" style="color:var(--ink-muted)">Saldo akhir bulan lalu akan menjadi saldo awal bulan ini. Apakah jumlahnya sudah benar?</p>
          <div class="mb-4 p-3 rounded-lg" style="background:var(--surface-alt)">
            <p class="text-xs" style="color:var(--ink-muted)">Saldo yang dihitung</p>
            <p class="text-xl font-bold font-display tabular-nums" id="verify-amount" style="color:var(--indigo)">Rp0</p>
          </div>
          <div class="mb-4">
            <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Saldo aktual (jika berbeda)</label>
            <input type="number" id="verify-adjust" min="0" step="0.01" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="Kosongkan jika sama" />
            <p class="text-xs mt-1" style="color:var(--ink-muted)">Jika ada selisih, isi di sini. Selisih akan dicatat sebagai penyesuaian.</p>
          </div>
          <div class="flex gap-2">
            <button id="btn-verify-skip" class="flex-1 py-2.5 rounded-lg text-sm font-semibold focus-ring btn-press" style="background:var(--surface-alt); color:var(--ink-muted)">Lanjutkan</button>
            <button id="btn-verify-confirm" class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white focus-ring btn-press" style="background:var(--indigo)">Simpan</button>
          </div>
        </div>
      </div>

      <!-- DETAIL DRAWER: LIHAT TRANSAKSI -->
      <div id="acc-drawer-backdrop" class="hidden fixed inset-0 z-40" style="background:rgba(0,0,0,.4)"></div>
      <aside id="acc-drawer" class="fixed inset-y-0 right-0 z-50 w-full max-w-md card" style="border-left:1px solid var(--border); transform:translateX(100%); transition:transform .2s ease;">
        <div class="h-16 flex items-center justify-between px-5" style="border-bottom:1px solid var(--border)">
          <h3 class="font-display text-lg font-semibold" style="color:var(--ink)">Detail akun</h3>
          <button id="acc-drawer-close" class="p-1.5 rounded-lg btn-press" style="color:var(--ink-muted)">${icon('close', 'w-5 h-5')}</button>
        </div>
        <div id="acc-drawer-content" class="p-5 space-y-5 overflow-y-auto" style="height:calc(100% - 4rem)"></div>
      </aside>
    `;

    tutorialPanel.setContent({
      eyebrow: 'HALAMAN INI',
      title: 'Akun',
      description: 'Daftarkan setiap sumber uangmu di sini — rekening bank, e-wallet, sampai kas tunai. Saldo tiap akun ini yang menjumlah jadi "Total saldo", dan jadi pilihan akun saat kamu mencatat transaksi.',
      steps: [
        'Klik <b>+ Tambah Akun</b>, isi nama, pilih jenis, dan masukkan saldo awal.',
        'Saldo akun berubah otomatis tiap kamu mencatat transaksi — kamu tidak perlu mengubahnya manual di sini.',
        'Kalau saldo tercatat meleset dari kenyataan, pakai <b>Koreksi saldo</b> di menu ••• supaya selisihnya tetap tercatat sebagai riwayat, bukan diam-diam berubah.',
        'Klik <b>Lihat transaksi</b> di menu ••• untuk melihat ringkasan bulan ini dan riwayat transaksi akun tersebut.',
        '<b>Sembunyikan</b> menyingkirkan akun dari daftar utama tanpa menghapus datanya — saldonya tetap masuk Total saldo. <b>Tutup akun</b> untuk akun yang sudah tidak dipakai — histori tetap disimpan tapi saldonya tidak lagi dihitung ke Total saldo.'
      ],
      tip: 'akun yang disembunyikan atau ditutup tetap bisa dibuka lagi lewat bagian "Akun tersembunyi / ditutup" di bawah daftar.'
    });

    this.attachEvents();
    this.bindGlobalListenersOnce();
    await this.loadData();
  },

  async loadData() {
    const groupsEl = document.getElementById('accounts-groups');
    const [{ data: accounts, error }, { data: transactions }] = await Promise.all([
      accountService.getAll(), transactionService.getAll()
    ]);
    if (error) {
      groupsEl.innerHTML = `<div class="card rounded-2xl p-8 text-center" style="border-color:var(--coral)">
        <p class="font-medium" style="color:var(--coral)">Gagal memuat akun</p>
        <p class="text-sm mt-1" style="color:var(--ink-muted)">Coba muat ulang halaman.</p>
      </div>`;
      document.getElementById('acc-total').textContent = '-';
      return;
    }
    this.data = accounts || [];
    this.transactions = transactions || [];
    this.renderHero();
    this.renderGroups();
    this.renderArchive();
    this.checkMonthlyVerification();
  },

  status(a) { return a.status || 'active'; },
  isThisMonth(d) { const dt = new Date(d), n = new Date(); return dt.getMonth() === n.getMonth() && dt.getFullYear() === n.getFullYear(); },
  fmt(n) { return this.hideAmount ? 'Rp••••••' : rupiah(n); },

  // Akun non-closed dianggap "aktif" secara finansial (uangnya nyata dan
  // dihitung ke Total saldo); yang closed dikeluarkan dari perhitungan ini.
  nonClosedAccounts() { return this.data.filter(a => this.status(a) !== 'closed'); },
  // Yang tampil di daftar utama (dikelompokkan per tipe): hanya yang 'active'.
  visibleAccounts() { return this.data.filter(a => this.status(a) === 'active'); },
  archivedAccounts() { return this.data.filter(a => this.status(a) !== 'active'); },

  getFilteredVisible() {
    let list = this.visibleAccounts();
    if (this.filterType !== 'all') list = list.filter(a => a.type === this.filterType);
    if (this.search) {
      const q = this.search.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(q));
    }
    return list;
  },

  renderHero() {
    const nonClosed = this.nonClosedAccounts();
    const total = nonClosed.reduce((s, a) => s + Number(a.current_balance || 0), 0);
    const activeCount = this.visibleAccounts().length;
    document.getElementById('acc-total').textContent = this.fmt(total);
    document.getElementById('acc-count').textContent = `${activeCount} akun aktif`;

    const byType = {};
    nonClosed.forEach(a => {
      const t = a.type in TYPE_META ? a.type : 'other';
      byType[t] = (byType[t] || 0) + Math.max(0, Number(a.current_balance || 0));
    });
    const positiveTotal = Object.values(byType).reduce((s, v) => s + v, 0);
    const segs = TYPE_ORDER.filter(t => byType[t] > 0);
    document.getElementById('acc-distribution').textContent = positiveTotal
      ? segs.map(t => `${TYPE_META[t].label} ${Math.round(byType[t] / positiveTotal * 100)}%`).join(' · ')
      : '';
  },

  accountCardHtml(a, opts = {}) {
    const meta = TYPE_META[a.type] || TYPE_META.other;
    const balance = Number(a.current_balance || 0);
    const nonClosedTotal = this.nonClosedAccounts().reduce((s, x) => s + Math.max(0, Number(x.current_balance || 0)), 0);
    const share = nonClosedTotal ? Math.max(0, balance) / nonClosedTotal * 100 : 0;
    const st = this.status(a);
    const archived = opts.archived;

    return `
    <div class="card ${archived ? '' : 'card-hover'} rounded-xl p-4 relative" style="${archived ? 'opacity:.75' : ''}">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style="background:var(--${meta.tone}-soft); color:var(--${meta.tone})">${icon(meta.iconKey, 'w-4 h-4')}</span>
          <div class="min-w-0">
            <p class="font-medium truncate" style="color:var(--ink)">${a.name}</p>
            <p class="text-xs" style="color:var(--ink-muted)">${meta.label}${st === 'hidden' ? ' · Disembunyikan' : st === 'closed' ? ` · Ditutup${a.closed_at ? ' ' + new Date(a.closed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}` : ' · Saldo tersedia'}</p>
          </div>
        </div>
        <p class="font-semibold tabular-nums text-right shrink-0" style="color:${balance >= 0 ? 'var(--ink)' : 'var(--coral)'}">${this.fmt(balance)}</p>
        <div class="relative shrink-0">
          <button class="acc-menu-btn px-2 py-1.5 rounded-lg btn-press text-base leading-none" data-id="${a.id}" style="color:var(--ink-muted)">⋮</button>
          <div class="acc-menu hidden absolute right-0 top-9 z-20 rounded-lg py-1 w-48 card" data-menu="${a.id}">
            <button class="menu-view w-full text-left px-3 py-1.5 text-xs" data-id="${a.id}" style="color:var(--ink)">Lihat transaksi</button>
            <button class="menu-edit w-full text-left px-3 py-1.5 text-xs" data-id="${a.id}" style="color:var(--ink)">Edit</button>
            <button class="menu-adjust w-full text-left px-3 py-1.5 text-xs" data-id="${a.id}" style="color:var(--ink)">Koreksi saldo</button>
            <button class="menu-hide w-full text-left px-3 py-1.5 text-xs" data-id="${a.id}" style="color:var(--ink)">${st === 'hidden' ? 'Tampilkan' : 'Sembunyikan'}</button>
            <button class="menu-close w-full text-left px-3 py-1.5 text-xs" data-id="${a.id}" style="color:var(--ink)">${st === 'closed' ? 'Buka kembali' : 'Tutup akun'}</button>
            <button class="menu-delete w-full text-left px-3 py-1.5 text-xs" data-id="${a.id}" style="color:var(--coral)">Hapus akun</button>
          </div>
        </div>
      </div>
      ${!archived ? `
      <div class="h-1.5 rounded-full mt-3" style="background:var(--surface-alt)"><div class="h-1.5 rounded-full" style="width:${share.toFixed(1)}%; background:var(--${meta.tone})"></div></div>
      <p class="text-xs mt-1" style="color:var(--ink-muted)">${share.toFixed(0)}% dari total saldo</p>` : ''}
    </div>`;
  },

  renderGroups() {
    const wrap = document.getElementById('accounts-groups');
    if (!this.data.length) {
      wrap.innerHTML = `
        <div class="card rounded-2xl p-12 text-center">
          <span class="mb-3 flex justify-center" style="color:var(--ink-muted)">${icon('bank', 'w-10 h-10')}</span>
          <h3 class="font-display text-lg font-semibold mb-1" style="color:var(--ink)">Belum ada akun</h3>
          <p class="text-sm" style="color:var(--ink-muted)">Buat akun pertama untuk mulai mengelola keuangan.</p>
        </div>`;
      return;
    }
    const list = this.getFilteredVisible();
    if (!list.length) {
      wrap.innerHTML = `<div class="card rounded-2xl p-10 text-center">
        <p class="font-medium" style="color:var(--ink)">Tidak ada akun yang cocok</p>
        <p class="text-sm mt-1" style="color:var(--ink-muted)">Coba ubah filter jenis atau kata kunci pencarian.</p>
      </div>`;
      return;
    }
    const groups = {};
    list.forEach(a => { const t = a.type in TYPE_META ? a.type : 'other'; (groups[t] = groups[t] || []).push(a); });
    wrap.innerHTML = TYPE_ORDER.filter(t => groups[t]?.length).map(t => `
      <div class="mb-5">
        <p class="text-xs font-semibold mb-2" style="color:var(--ink-muted); letter-spacing:.04em;">${TYPE_META[t].label.toUpperCase()}</p>
        <div class="space-y-2">${groups[t].map(a => this.accountCardHtml(a)).join('')}</div>
      </div>`).join('');
  },

  renderArchive() {
    const archived = this.archivedAccounts();
    const box = document.getElementById('acc-archive');
    box.classList.toggle('hidden', archived.length === 0);
    if (!archived.length) return;
    document.getElementById('acc-archive-count').textContent = `(${archived.length})`;
    document.getElementById('acc-archive-list').innerHTML = archived.map(a => this.accountCardHtml(a, { archived: true })).join('');
  },

  // ---------- events ----------
  attachEvents() {
    const modal = document.getElementById('account-modal');
    const form = document.getElementById('account-form');

    document.getElementById('btn-add-account').addEventListener('click', () => {
      document.getElementById('modal-title').textContent = 'Tambah Akun';
      form.reset();
      document.getElementById('acc-id').value = '';
      document.getElementById('acc-balance-wrap').classList.remove('hidden');
      document.getElementById('acc-balance-hint').classList.add('hidden');
      modal.classList.remove('hidden'); modal.classList.add('flex');
      setTimeout(() => document.getElementById('acc-name').focus(), 50);
    });
    document.getElementById('btn-cancel-modal').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    form.addEventListener('submit', (e) => { e.preventDefault(); this.save(); });

    document.getElementById('btn-toggle-hide').addEventListener('click', () => {
      this.hideAmount = !this.hideAmount;
      localStorage.setItem(HIDE_PREF_KEY, String(this.hideAmount));
      document.getElementById('btn-toggle-hide').textContent = this.hideAmount ? 'Tampilkan saldo' : 'Sembunyikan saldo';
      this.renderHero();
      this.renderGroups();
      this.renderArchive();
    });

    document.querySelectorAll('#acc-type-chips .chip').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('#acc-type-chips .chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.filterType = btn.dataset.type;
      this.renderGroups();
    }));
    document.getElementById('acc-search').addEventListener('input', (e) => {
      this.search = e.target.value;
      this.renderGroups();
    });

    // Event delegation untuk kartu akun (daftar utama + arsip)
    document.body.addEventListener('click', (e) => {
      const menuBtn = e.target.closest('.acc-menu-btn');
      if (menuBtn) {
        e.stopPropagation();
        document.querySelectorAll('.acc-menu').forEach(m => { if (m.dataset.menu !== menuBtn.dataset.id) m.classList.add('hidden'); });
        document.querySelector(`.acc-menu[data-menu="${menuBtn.dataset.id}"]`)?.classList.toggle('hidden');
        return;
      }
      const viewItem = e.target.closest('.menu-view');
      if (viewItem) { this.closeAllMenus(); this.openDetail(viewItem.dataset.id); return; }
      const editItem = e.target.closest('.menu-edit');
      if (editItem) { this.closeAllMenus(); this.openEdit(editItem.dataset.id); return; }
      const adjustItem = e.target.closest('.menu-adjust');
      if (adjustItem) { this.closeAllMenus(); this.openAdjust(adjustItem.dataset.id); return; }
      const hideItem = e.target.closest('.menu-hide');
      if (hideItem) { this.closeAllMenus(); this.toggleHideStatus(hideItem.dataset.id); return; }
      const closeItem = e.target.closest('.menu-close');
      if (closeItem) { this.closeAllMenus(); this.toggleCloseStatus(closeItem.dataset.id); return; }
      const deleteItem = e.target.closest('.menu-delete');
      if (deleteItem) { this.closeAllMenus(); this.confirmDelete(deleteItem.dataset.id); return; }
      if (!e.target.closest('.acc-menu')) this.closeAllMenus();
    });

    document.getElementById('verify-modal').addEventListener('click', (e) => { if (e.target === document.getElementById('verify-modal')) document.getElementById('verify-modal').classList.add('hidden'); });
    document.getElementById('acc-drawer-close').addEventListener('click', () => this.closeDrawer());
    document.getElementById('acc-drawer-backdrop').addEventListener('click', () => this.closeDrawer());
    document.getElementById('adjust-cancel').addEventListener('click', () => this.closeAdjust());
    document.getElementById('adjust-save').addEventListener('click', () => this.saveAdjust());
    document.getElementById('confirm-cancel').addEventListener('click', () => this.closeConfirm());
  },

  closeAllMenus() { document.querySelectorAll('.acc-menu').forEach(m => m.classList.add('hidden')); },

  bindGlobalListenersOnce() {
    if (this._globalBound) return;
    this._globalBound = true;
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const modal = document.getElementById('account-modal');
      if (modal && !modal.classList.contains('hidden')) modal.classList.add('hidden');
      this.closeDrawer();
      this.closeAdjust();
      this.closeConfirm();
    });
    document.addEventListener('transactions:changed', () => this.loadData());
  },

  // ---------- detail drawer ----------
  accountDailyBalance(acc) {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentBalance = Number(acc.current_balance || 0);
    const txs = this.transactions.filter(t => (t.account_id === acc.id || t.account_to_id === acc.id) && this.isThisMonth(t.date) && t.type !== 'adjustment');
    let netThisMonth = 0;
    txs.forEach(t => {
      if (t.account_id === acc.id) {
        if (t.type === 'income') netThisMonth += Number(t.amount || 0);
        else if (t.type === 'expense') netThisMonth -= Number(t.amount || 0);
        else if (t.type === 'transfer') netThisMonth -= Number(t.amount || 0);
      }
      if (t.account_to_id === acc.id && t.type === 'transfer') netThisMonth += Number(t.amount || 0);
    });
    const opening = currentBalance - netThisMonth;
    const balance = Array(daysInMonth).fill(0);
    let running = opening;
    for (let d = 1; d <= daysInMonth; d++) {
      txs.filter(t => new Date(t.date).getDate() === d).forEach(t => {
        if (t.account_id === acc.id) {
          if (t.type === 'income') running += Number(t.amount || 0);
          else if (t.type === 'expense') running -= Number(t.amount || 0);
          else if (t.type === 'transfer') running -= Number(t.amount || 0);
        }
        if (t.account_to_id === acc.id && t.type === 'transfer') running += Number(t.amount || 0);
      });
      balance[d - 1] = running;
    }
    return { labels: Array.from({ length: daysInMonth }, (_, i) => i + 1), balance };
  },

  openDetail(id) {
    const acc = this.data.find(a => a.id === id);
    if (!acc) return;
    const meta = TYPE_META[acc.type] || TYPE_META.other;

    const txsThisMonth = this.transactions.filter(t => (t.account_id === id || t.account_to_id === id) && this.isThisMonth(t.date));
    const income = txsThisMonth.filter(t => t.account_id === id && t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
    const expense = txsThisMonth.filter(t => t.account_id === id && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
    const transferIn = txsThisMonth.filter(t => t.account_to_id === id && t.type === 'transfer').reduce((s, t) => s + Number(t.amount || 0), 0);
    const transferOut = txsThisMonth.filter(t => t.account_id === id && t.type === 'transfer').reduce((s, t) => s + Number(t.amount || 0), 0);
    const net = income - expense + transferIn - transferOut;

    const related = [...this.transactions]
      .filter(t => t.account_id === id || t.account_to_id === id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20);

    document.getElementById('acc-drawer-content').innerHTML = `
      <div class="flex items-center gap-3">
        <span class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style="background:var(--${meta.tone}-soft); color:var(--${meta.tone})">${icon(meta.iconKey, 'w-5 h-5')}</span>
        <div>
          <p class="font-display text-lg font-semibold" style="color:var(--ink)">${acc.name}</p>
          <p class="text-xs" style="color:var(--ink-muted)">${meta.label}</p>
        </div>
      </div>
      <div>
        <p class="text-xs" style="color:var(--ink-muted)">Saldo saat ini</p>
        <p class="text-3xl font-display font-bold tabular-nums" style="color:var(--ink)">${this.fmt(acc.current_balance)}</p>
      </div>
      <div class="grid grid-cols-2 gap-3 text-sm pt-3" style="border-top:1px solid var(--border)">
        <div><p style="color:var(--ink-muted)">Pemasukan bulan ini</p><p class="font-semibold tabular-nums mt-0.5" style="color:var(--emerald)">${rupiah(income)}</p></div>
        <div><p style="color:var(--ink-muted)">Pengeluaran bulan ini</p><p class="font-semibold tabular-nums mt-0.5" style="color:var(--coral)">${rupiah(expense)}</p></div>
        <div><p style="color:var(--ink-muted)">Transfer masuk/keluar</p><p class="font-semibold tabular-nums mt-0.5" style="color:var(--ink)">${rupiah(transferIn)} / ${rupiah(transferOut)}</p></div>
        <div><p style="color:var(--ink-muted)">Perubahan bulan ini</p><p class="font-semibold tabular-nums mt-0.5" style="color:${net >= 0 ? 'var(--emerald)' : 'var(--coral)'}">${net >= 0 ? '+' : '-'}${rupiah(Math.abs(net))}</p></div>
      </div>
      <div class="pt-3" style="border-top:1px solid var(--border)">
        <p class="text-xs font-semibold mb-2" style="color:var(--ink-muted)">PERGERAKAN SALDO — BULAN INI</p>
        <canvas id="acc-detail-chart" height="140"></canvas>
      </div>
      <div class="pt-3" style="border-top:1px solid var(--border)">
        <p class="text-xs font-semibold mb-2" style="color:var(--ink-muted)">TRANSAKSI</p>
        <div class="space-y-1">
          ${related.map(t => {
      const isOut = t.account_id === id;
      const label = t.type === 'transfer' ? (isOut ? `Transfer ke akun lain` : `Transfer dari akun lain`) : (t.description || '-');
      const tone = t.type === 'income' || (t.type === 'transfer' && !isOut) ? 'emerald' : 'coral';
      const sign = t.type === 'income' || (t.type === 'transfer' && !isOut) ? '+' : '-';
      return `
            <div class="flex items-center justify-between py-2" style="border-bottom:1px solid var(--border)">
              <div class="min-w-0"><p class="text-sm font-medium truncate" style="color:var(--ink)">${label}</p><p class="text-xs" style="color:var(--ink-muted)">${new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p></div>
              <span class="text-sm font-semibold tabular-nums shrink-0" style="color:var(--${tone})">${sign}${rupiah(t.amount)}</span>
            </div>`;
    }).join('') || `<p class="text-sm" style="color:var(--ink-muted)">Belum ada transaksi.</p>`}
        </div>
      </div>
    `;

    document.getElementById('acc-drawer').style.transform = 'translateX(0)';
    document.getElementById('acc-drawer-backdrop').classList.remove('hidden');

    if (typeof Chart !== 'undefined') {
      const { labels, balance } = this.accountDailyBalance(acc);
      const styles = getComputedStyle(document.documentElement);
      const cIndigo = styles.getPropertyValue('--indigo').trim();
      if (this._detailChart) this._detailChart.destroy();
      this._detailChart = new Chart(document.getElementById('acc-detail-chart'), {
        type: 'line',
        data: { labels, datasets: [{ data: balance, borderColor: cIndigo, backgroundColor: cIndigo + '22', tension: .25, fill: true, pointRadius: 2 }] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false }, x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } } } }
      });
    }
  },

  closeDrawer() {
    document.getElementById('acc-drawer').style.transform = 'translateX(100%)';
    document.getElementById('acc-drawer-backdrop').classList.add('hidden');
  },

  // ---------- koreksi saldo ----------
  openAdjust(id) {
    const acc = this.data.find(a => a.id === id);
    if (!acc) return;
    document.getElementById('adjust-acc-name').textContent = acc.name;
    document.getElementById('adjust-current').textContent = rupiah(acc.current_balance);
    document.getElementById('adjust-actual').value = acc.current_balance;
    document.getElementById('adjust-modal').dataset.id = id;
    const modal = document.getElementById('adjust-modal');
    modal.classList.remove('hidden'); modal.classList.add('flex');
  },

  closeAdjust() {
    const modal = document.getElementById('adjust-modal');
    modal.classList.add('hidden'); modal.classList.remove('flex');
  },

  async saveAdjust() {
    const id = document.getElementById('adjust-modal').dataset.id;
    const acc = this.data.find(a => a.id === id);
    if (!acc) return;
    const actual = parseFloat(document.getElementById('adjust-actual').value);
    if (isNaN(actual) || actual < 0) { showToast('Masukkan saldo yang valid.', 'error'); return; }
    const delta = actual - Number(acc.current_balance || 0);
    this.closeAdjust();
    if (delta === 0) { showToast('Tidak ada perubahan saldo.', 'info'); return; }
    try {
      const now = new Date();
      await transactionService.create({
        type: 'adjustment',
        account_id: id,
        category_id: null,
        date: now.toISOString().slice(0, 10),
        description: 'Koreksi saldo',
        amount: Math.abs(delta),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        source: 'manual'
      });
      await accountService.updateBalance(id, actual);
      await this.loadData();
      showToast('Saldo dikoreksi.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengoreksi saldo.', 'error');
    }
  },

  // ---------- sembunyikan / tutup ----------
  async toggleHideStatus(id) {
    const acc = this.data.find(a => a.id === id);
    if (!acc) return;
    const newStatus = this.status(acc) === 'hidden' ? 'active' : 'hidden';
    try {
      const { error } = await accountService.update(id, { status: newStatus });
      if (error) throw error;
      await this.loadData();
      showToast(newStatus === 'hidden' ? 'Akun disembunyikan.' : 'Akun ditampilkan kembali.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengubah status akun — pastikan migration kolom status sudah dijalankan.', 'error');
    }
  },

  async toggleCloseStatus(id) {
    const acc = this.data.find(a => a.id === id);
    if (!acc) return;
    const willClose = this.status(acc) !== 'closed';
    try {
      const { error } = await accountService.update(id, willClose ? { status: 'closed', closed_at: new Date().toISOString() } : { status: 'active', closed_at: null });
      if (error) throw error;
      await this.loadData();
      showToast(willClose ? 'Akun ditutup. Histori tetap tersimpan.' : 'Akun dibuka kembali.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengubah status akun — pastikan migration kolom status sudah dijalankan.', 'error');
    }
  },

  // ---------- hapus ----------
  confirmDelete(id) {
    const acc = this.data.find(a => a.id === id);
    if (!acc) return;
    document.getElementById('confirm-message').textContent = `"${acc.name}" beserta pengaturannya akan dihapus permanen — transaksi yang sudah tercatat di akun ini tidak ikut terhapus, tapi tidak akan lagi terhubung ke akun manapun.`;
    const okBtn = document.getElementById('confirm-ok');
    const handler = () => { this.remove(id); this.closeConfirm(); okBtn.removeEventListener('click', handler); };
    okBtn.addEventListener('click', handler);
    const modal = document.getElementById('confirm-modal');
    modal.classList.remove('hidden'); modal.classList.add('flex');
  },

  closeConfirm() {
    const modal = document.getElementById('confirm-modal');
    modal.classList.add('hidden'); modal.classList.remove('flex');
    const okBtn = document.getElementById('confirm-ok');
    okBtn.replaceWith(okBtn.cloneNode(true));
  },

  async remove(id) {
    const acc = this.data.find(a => a.id === id);
    const { error } = await accountService.delete(id);
    if (error) { showToast('Gagal menghapus akun.', 'error'); return; }
    showToast(`Akun "${acc?.name || ''}" berhasil dihapus.`, 'success');
    this.loadData();
  },

  // ---------- edit / tambah ----------
  openEdit(id) {
    const acc = this.data.find(a => a.id === id);
    if (!acc) return;
    document.getElementById('modal-title').textContent = 'Edit Akun';
    document.getElementById('acc-id').value = acc.id;
    document.getElementById('acc-name').value = acc.name;
    document.getElementById('acc-type').value = acc.type;
    document.getElementById('acc-balance-wrap').classList.add('hidden');
    document.getElementById('acc-balance-hint').classList.remove('hidden');
    const modal = document.getElementById('account-modal');
    modal.classList.remove('hidden'); modal.classList.add('flex');
  },

  async checkMonthlyVerification() {
    const today = new Date();
    if (today.getDate() !== 1) return;
    const thisMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const accountsNeedingVerification = this.visibleAccounts().filter(a => {
      if (!a.opening_date) return true;
      return !a.opening_date.startsWith(thisMonthStr);
    });
    if (!accountsNeedingVerification.length) return;
    const acc = accountsNeedingVerification[0];
    const currentBalance = Number(acc.current_balance || 0);
    document.getElementById('verify-amount').textContent = rupiah(currentBalance);
    document.getElementById('verify-adjust').value = '';
    document.getElementById('verify-modal').classList.remove('hidden');
    document.getElementById('verify-modal').classList.add('flex');
    document.getElementById('btn-verify-skip').onclick = async () => {
      document.getElementById('verify-modal').classList.add('hidden');
      if (!acc.opening_date) {
        const openingDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        await accountService.update(acc.id, { opening_balance: currentBalance, opening_date: openingDate });
      }
    };
    document.getElementById('btn-verify-confirm').onclick = async () => {
      const adjustVal = parseFloat(document.getElementById('verify-adjust').value) || 0;
      const finalBalance = currentBalance + adjustVal;
      document.getElementById('verify-modal').classList.add('hidden');
      const openingDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const updates = { opening_balance: finalBalance, opening_date: openingDate };
      if (adjustVal !== 0) {
        updates.current_balance = finalBalance;
        try {
          await transactionService.create({
            type: 'adjustment',
            account_id: acc.id,
            category_id: null,
            date: openingDate,
            description: 'Penyesuaian saldo awal bulan ini',
            amount: Math.abs(adjustVal),
            month: today.getMonth() + 1,
            year: today.getFullYear(),
            source: 'manual'
          });
          await accountService.updateBalance(acc.id, finalBalance);
        } catch (e) { console.warn('[Adjustment]', e.message); }
      }
      await accountService.update(acc.id, updates);
      await this.loadData();
      showToast(adjustVal !== 0 ? 'Saldo disesuaikan dengan penyesuaian.' : 'Saldo awal diverifikasi.', 'success');
    };
  },

  async save() {
    const name = document.getElementById('acc-name').value.trim();
    if (!name) { showToast('Nama akun wajib diisi.', 'error'); return; }

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const isEdit = !!document.getElementById('acc-id').value;

    let payload;
    if (isEdit) {
      // Edit HANYA mengubah nama & tipe — saldo tidak pernah diubah lewat
      // form ini supaya tidak ada perubahan saldo tanpa jejak. Untuk
      // koreksi saldo, pakai menu "Koreksi saldo" (transaksi 'adjustment').
      payload = { name, type: document.getElementById('acc-type').value };
    } else {
      const balance = parseFloat(document.getElementById('acc-balance').value) || 0;
      payload = {
        name,
        type: document.getElementById('acc-type').value,
        initial_balance: balance,
        current_balance: balance,
        opening_balance: balance,
        opening_date: firstOfMonth.toISOString().split('T')[0],
        status: 'active'
      };
    }
    const id = document.getElementById('acc-id').value;
    const submitBtn = document.querySelector('#account-form button[type="submit"]');
    submitBtn.disabled = true;
    try {
      const { error } = id ? await accountService.update(id, payload) : await accountService.create(payload);
      if (error) throw error;
      document.getElementById('account-modal').classList.add('hidden');
      showToast(id ? 'Akun diperbarui.' : 'Akun ditambahkan.', 'success');
      await this.loadData();
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan akun.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  },
};