import { accountService } from '../services/database.js';
import { icon } from '../components/icons.js';
import { showToast } from '../components/toast.js';
import { tutorialPanel } from '../components/tutorial.js';
import { rupiah } from '../utils.js';

const TYPE_META = {
  bank: { label: 'Bank', iconKey: 'bank', tone: 'indigo' },
  e_wallet: { label: 'E-Wallet', iconKey: 'wallet', tone: 'violet' },
  cash: { label: 'Cash', iconKey: 'cash', tone: 'emerald' },
  other: { label: 'Lainnya', iconKey: 'folder', tone: 'amber' },
};

export const accountsPage = {
  data: [],
  filterType: 'all',
  search: '',
  _globalBound: false,

  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    container.innerHTML = `
      <div class="mb-6">
        <p class="text-xs font-semibold mb-1" style="color:var(--indigo); letter-spacing:.04em;">KELOLA</p>
        <h2 class="text-2xl font-bold font-display" style="color:var(--ink)">Akun</h2>
        <p class="text-sm mt-1" style="color:var(--ink-muted)">Semua sumber uangmu — bank, e-wallet, dan tunai — dengan saldo yang otomatis terpakai di Dashboard dan Transaksi.</p>
      </div>

      <div id="acc-summary" class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5"></div>

      <div id="acc-distribution" class="card rounded-2xl p-5 mb-5 hidden"></div>

      <div class="flex flex-wrap items-center gap-2.5 mb-5">
        <button id="btn-add-account" class="px-4 py-2 rounded-lg text-white font-medium focus-ring btn-press text-sm flex items-center gap-1.5" style="background:var(--indigo)">
          ${icon('plus', 'w-4 h-4')} Tambah Akun
        </button>
        <div class="flex gap-1.5 overflow-x-auto" id="acc-type-chips">
          <button class="chip active" data-type="all">Semua</button>
          ${Object.entries(TYPE_META).map(([key, m]) => `<button class="chip" data-type="${key}">${icon(m.iconKey, 'w-3.5 h-3.5 inline -mt-0.5')} ${m.label}</button>`).join('')}
        </div>
        <div class="flex-1"></div>
        <div class="flex items-center gap-2 rounded-lg px-3 py-2 w-48" style="background:var(--surface); border:1px solid var(--border)">
          ${icon('search', 'w-4 h-4 shrink-0')}
          <input id="acc-search" type="text" placeholder="Cari akun..." class="bg-transparent text-sm w-full outline-none placeholder:opacity-60" style="color:var(--ink)" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="accounts-grid">
        <div class="col-span-full text-center py-16 text-sm" style="color:var(--ink-muted)">Memuat akun…</div>
      </div>

      <!-- Modal -->
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
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Tipe</label>
              <select id="acc-type" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)">
                ${Object.entries(TYPE_META).map(([key, m]) => `<option value="${key}">${m.label}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Saldo awal (Rp)</label>
              <input type="number" id="acc-balance" min="0" step="0.01" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="0" />
            </div>
          </div>
          <button type="submit" class="w-full mt-5 py-2.5 rounded-lg text-white font-semibold focus-ring btn-press text-sm" style="background:var(--indigo)">Simpan akun</button>
        </form>
      </div>
    `;

    tutorialPanel.setContent({
      eyebrow: 'HALAMAN INI',
      title: 'Akun',
      description: 'Daftarkan setiap sumber uangmu di sini — rekening bank, e-wallet, sampai kas tunai. Saldo tiap akun ini yang menjumlah jadi "Total saldo" di Dashboard, dan jadi pilihan akun saat kamu mencatat transaksi.',
      steps: [
        'Klik <b>+ Tambah Akun</b>, isi nama, pilih tipe, dan masukkan saldo awal.',
        'Saldo akun akan berubah otomatis setiap kali kamu mencatat transaksi di halaman Transaksi — kamu tidak perlu mengubahnya manual di sini.',
        'Pakai chip tipe (Bank/E-Wallet/Cash/Lainnya) atau kotak pencarian untuk menyaring daftar akun.',
        '<b>Edit</b> untuk mengubah nama atau tipe akun, <b>Hapus</b> untuk menghapusnya.'
      ],
      tip: 'kalau kamu koreksi saldo lewat "Edit" di sini, itu tidak tercatat sebagai transaksi apa pun — dampaknya tidak akan muncul di riwayat atau laporan.'
    });

    this.attachEvents();
    this.bindGlobalListenersOnce();
    await this.loadData();
  },

  async loadData() {
    const grid = document.getElementById('accounts-grid');
    const { data, error } = await accountService.getAll();
    if (error) {
      grid.innerHTML = `<div class="col-span-full card rounded-2xl p-8 text-center" style="border-color:var(--coral)">
        <p class="font-medium" style="color:var(--coral)">Gagal memuat akun</p>
        <p class="text-sm mt-1" style="color:var(--ink-muted)">Coba muat ulang halaman.</p>
      </div>`;
      document.getElementById('acc-summary').innerHTML = '';
      return;
    }
    this.data = data || [];
    this.renderSummary();
    this.renderDistribution();
    this.renderGrid();
  },

  getFiltered() {
    let list = [...this.data];
    if (this.filterType !== 'all') list = list.filter(a => a.type === this.filterType);
    if (this.search) {
      const q = this.search.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => Number(b.current_balance) - Number(a.current_balance));
  },

  renderSummary() {
    const total = this.data.reduce((s, a) => s + Number(a.current_balance), 0);
    const count = this.data.length;
    const avg = count ? total / count : 0;
    const top = this.data.reduce((max, a) => Number(a.current_balance) > Number(max?.current_balance ?? -Infinity) ? a : max, null);
    const cards = [
      { label: 'Total saldo', value: rupiah(total), tone: 'indigo' },
      { label: 'Jumlah akun', value: count, tone: 'violet' },
      { label: 'Rata-rata saldo', value: rupiah(avg), tone: 'amber' },
      { label: 'Saldo terbesar', value: top ? top.name : '—', tone: 'emerald' },
    ];
    document.getElementById('acc-summary').innerHTML = cards.map(c => `
      <div class="rounded-xl p-4 card-hover" style="background:var(--${c.tone}-soft); border:1px solid var(--border)">
        <p class="text-xs font-medium" style="color:var(--ink-muted)">${c.label}</p>
        <p class="text-base font-semibold mt-0.5 tabular-nums truncate" style="color:var(--${c.tone})">${c.value}</p>
      </div>`).join('');
  },

  renderDistribution() {
    const box = document.getElementById('acc-distribution');
    const total = this.data.reduce((s, a) => s + Math.max(0, Number(a.current_balance)), 0);
    if (!total || !this.data.length) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');

    const byType = {};
    this.data.forEach(a => {
      const t = a.type in TYPE_META ? a.type : 'other';
      byType[t] = (byType[t] || 0) + Math.max(0, Number(a.current_balance));
    });
    const segments = Object.entries(byType).filter(([, v]) => v > 0);

    box.innerHTML = `
      <h3 class="font-display text-base font-semibold mb-3" style="color:var(--ink)">Distribusi saldo per tipe akun</h3>
      <div class="h-3 rounded-full overflow-hidden flex mb-3" style="background:var(--surface-alt)">
        ${segments.map(([type, v]) => `<div style="width:${(v / total * 100).toFixed(1)}%; background:var(--${TYPE_META[type].tone})" title="${TYPE_META[type].label}"></div>`).join('')}
      </div>
      <div class="flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
        ${segments.map(([type, v]) => `
          <span class="flex items-center gap-1.5" style="color:var(--ink-muted)">
            <span class="w-2 h-2 rounded-full" style="background:var(--${TYPE_META[type].tone})"></span>
            ${TYPE_META[type].label} · <span class="font-medium tabular-nums" style="color:var(--ink)">${rupiah(v)}</span> (${(v / total * 100).toFixed(0)}%)
          </span>`).join('')}
      </div>`;
  },

  renderGrid() {
    const grid = document.getElementById('accounts-grid');
    const list = this.getFiltered();

    if (!this.data.length) {
      grid.innerHTML = `
        <div class="col-span-full card rounded-2xl p-12 text-center">
          <span class="mb-3 flex justify-center" style="color:var(--ink-muted)">${icon('bank', 'w-10 h-10')}</span>
          <h3 class="font-display text-lg font-semibold mb-1" style="color:var(--ink)">Belum ada akun</h3>
          <p class="text-sm" style="color:var(--ink-muted)">Buat akun pertama untuk mulai mengelola keuangan.</p>
        </div>`;
      return;
    }
    if (!list.length) {
      grid.innerHTML = `<div class="col-span-full card rounded-2xl p-10 text-center">
        <p class="font-medium" style="color:var(--ink)">Tidak ada akun yang cocok</p>
        <p class="text-sm mt-1" style="color:var(--ink-muted)">Coba ubah filter tipe atau kata kunci pencarian.</p>
      </div>`;
      return;
    }

    const totalPositive = this.data.reduce((s, a) => s + Math.max(0, Number(a.current_balance)), 0);

    grid.innerHTML = list.map(a => {
      const meta = TYPE_META[a.type] || TYPE_META.other;
      const balance = Number(a.current_balance);
      const share = totalPositive ? Math.max(0, balance) / totalPositive * 100 : 0;
      return `
      <div class="card card-hover rounded-2xl p-5">
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style="background:var(--${meta.tone}-soft); color:var(--${meta.tone})">${icon(meta.iconKey, 'w-5 h-5')}</span>
            <div class="min-w-0">
              <h3 class="font-semibold truncate" style="color:var(--ink)">${a.name}</h3>
              <span class="badge mt-0.5" style="background:var(--${meta.tone}-soft); color:var(--${meta.tone})">${meta.label}</span>
            </div>
          </div>
        </div>
        <p class="text-2xl font-display font-semibold tabular-nums" style="color:${balance >= 0 ? 'var(--ink)' : 'var(--coral)'}">${rupiah(balance)}</p>
        <div class="h-1.5 rounded-full mt-3 mb-1" style="background:var(--surface-alt)">
          <div class="h-1.5 rounded-full" style="width:${share.toFixed(1)}%; background:var(--${meta.tone})"></div>
        </div>
        <p class="text-xs" style="color:var(--ink-muted)">${share.toFixed(0)}% dari total saldo positif</p>
        <div class="mt-4 flex gap-2">
          <button class="edit-acc flex-1 text-xs font-semibold py-1.5 rounded-lg focus-ring btn-press" style="background:var(--surface-alt); color:var(--indigo)" data-id="${a.id}">Edit</button>
          <button class="delete-acc flex-1 text-xs font-semibold py-1.5 rounded-lg focus-ring btn-press" style="background:var(--coral-soft); color:var(--coral)" data-id="${a.id}">Hapus</button>
        </div>
      </div>`;
    }).join('');
  },

  attachEvents() {
    const modal = document.getElementById('account-modal');
    const form = document.getElementById('account-form');

    document.getElementById('btn-add-account').addEventListener('click', () => {
      document.getElementById('modal-title').textContent = 'Tambah Akun';
      form.reset();
      document.getElementById('acc-id').value = '';
      modal.classList.remove('hidden'); modal.classList.add('flex');
      setTimeout(() => document.getElementById('acc-name').focus(), 50);
    });
    document.getElementById('btn-cancel-modal').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    form.addEventListener('submit', (e) => { e.preventDefault(); this.save(); });

    document.querySelectorAll('#acc-type-chips .chip').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('#acc-type-chips .chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.filterType = btn.dataset.type;
      this.renderGrid();
    }));
    document.getElementById('acc-search').addEventListener('input', (e) => {
      this.search = e.target.value;
      this.renderGrid();
    });

    // Event delegation: grid dirender ulang cukup sering, jadi listener
    // dipasang sekali di parent statis, bukan diulang tiap renderGrid().
    document.getElementById('accounts-grid').addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-acc');
      const deleteBtn = e.target.closest('.delete-acc');

      if (editBtn) {
        const acc = this.data.find(a => a.id === editBtn.dataset.id);
        if (!acc) return;
        document.getElementById('modal-title').textContent = 'Edit Akun';
        document.getElementById('acc-id').value = acc.id;
        document.getElementById('acc-name').value = acc.name;
        document.getElementById('acc-type').value = acc.type;
        document.getElementById('acc-balance').value = acc.current_balance;
        modal.classList.remove('hidden'); modal.classList.add('flex');
      }
      if (deleteBtn) {
        const acc = this.data.find(a => a.id === deleteBtn.dataset.id);
        if (!confirm(`Hapus akun "${acc?.name || ''}"? Tindakan ini tidak bisa dibatalkan.`)) return;
        accountService.delete(deleteBtn.dataset.id).then(({ error }) => {
          if (error) { showToast('Gagal menghapus akun.', 'error'); return; }
          showToast('Akun berhasil dihapus.', 'success');
          this.loadData();
        });
      }
    });
  },

  // Listener global (keydown Escape) dipasang sekali saja lewat flag ini,
  // supaya tidak menumpuk tiap kali halaman ini dibuka ulang.
bindGlobalListenersOnce() {
     if (this._globalBound) return;
     this._globalBound = true;
     document.addEventListener('keydown', (e) => {
       const modal = document.getElementById('account-modal');
       if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) modal.classList.add('hidden');
     });
     document.addEventListener('transactions:changed', () => this.loadData());
   },

  async save() {
    const name = document.getElementById('acc-name').value.trim();
    const balance = parseFloat(document.getElementById('acc-balance').value) || 0;
    if (!name) { showToast('Nama akun wajib diisi.', 'error'); return; }

    const payload = {
      name,
      type: document.getElementById('acc-type').value,
      initial_balance: balance,
      current_balance: balance,
    };
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
  }
};