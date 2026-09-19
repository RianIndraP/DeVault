import { recurringTransactionService } from '../services/database.js';
import { rupiah } from '../utils.js';
import { icon } from '../components/icons.js';
import { authService } from '../services/auth.js';

export const recurringPage = {
  data: { recurring: [] },

  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    const user = await authService.getCurrentUser();
    const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
    container.innerHTML = `
      <div>
        <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 class="font-display text-3xl font-semibold" style="color:var(--ink)">Transaksi Berulang</h1>
            <p class="mt-1 text-sm" style="color:var(--ink-muted)">Kelola transaksi yang berulang setiap periode</p>
          </div>
          <button id="btn-add-recurring" class="text-sm font-medium px-4 py-2 rounded-lg focus-ring btn-press flex items-center gap-1.5" style="background:var(--indigo); color:#fff;">
            ${icon('plus', 'w-4 h-4')} Tambah Berulang
          </button>
        </div>
        <div id="recurring-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <p class="text-sm" style="color:var(--ink-muted)">Memuat...</p>
        </div>
        <div class="card card-hover rounded-2xl p-6">
          <h3 class="font-display text-lg font-semibold mb-4" style="color:var(--ink)">Eksekusi Sekarang</h3>
          <p class="text-sm mb-4" style="color:var(--ink-muted)">Jalankan semua transaksi berulang yang sudah jatuh tempo.</p>
          <button id="btn-execute-recurring" class="text-sm font-medium px-4 py-2 rounded-lg focus-ring btn-press" style="background:var(--emerald); color:#fff;">
            ${icon('refresh', 'w-4 h-4')} Eksekusi Sekarang
          </button>
          <p id="execute-result" class="mt-3 text-sm" style="color:var(--ink-muted)"></p>
        </div>
      </div>
    `;
    await this.loadData();
    this.renderList();
    this.attachEvents();
  },

  async loadData() {
    const { data, error } = await recurringTransactionService.getAll();
    if (!error) this.data.recurring = data || [];
  },

  renderList() {
    const container = document.getElementById('recurring-list');
    if (!container) return;
    if (!this.data.recurring.length) {
      container.innerHTML = `<p class="text-sm" style="color:var(--ink-muted)">Belum ada transaksi berulang. Tambah di atas.</p>`;
      return;
    }
    container.innerHTML = this.data.recurring.map(rt => {
      const freqLabel = rt.frequency === 'monthly' ? 'Bulanan' : rt.frequency === 'weekly' ? 'Mingguan' : rt.frequency === 'daily' ? 'Harian' : 'Tahunan';
      const nextDate = new Date(rt.next_date).toLocaleDateString('id-ID');
      return `
        <div class="card card-hover rounded-2xl p-6" id="rt-${rt.id}">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="font-display text-lg font-semibold" style="color:var(--ink)">${rt.description || 'N/A'}</h4>
              <p class="text-xs" style="color:var(--ink-muted)">${freqLabel} · ${rupiah(rt.amount)}</p>
            </div>
            <span class="text-xs font-semibold px-2 py-1 rounded-full" style="background:var(--emerald-soft); color:var(--emerald)">${rt.active ? 'Aktif' : 'Nonaktif'}</span>
          </div>
          <div class="flex justify-between text-sm" style="color:var(--ink-muted)">
            <span>Jatuh tempo: ${nextDate}</span>
            <span>Ke akun: ${rt.account_id || '-'}</span>
          </div>
          <div class="mt-3 flex gap-2">
            <button type="button" data-edit="${rt.id}" class="text-xs font-semibold px-3 py-1.5 rounded-lg btn-press" style="background:var(--indigo-soft); color:var(--indigo)">Edit</button>
            <button type="button" data-toggle="${rt.id}" class="text-xs font-semibold px-3 py-1.5 rounded-lg btn-press" style="background:var(--surface-alt); color:var(--ink-muted)">${rt.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
            <button type="button" data-delete="${rt.id}" class="text-xs font-semibold px-3 py-1.5 rounded-lg btn-press" style="background:var(--danger-soft); color:var(--danger)">Hapus</button>
          </div>
        </div>
      `;
    }).join('');
  },

  attachEvents() {
    document.getElementById('btn-add-recurring').addEventListener('click', () => this.showAddForm());
    document.getElementById('btn-execute-recurring').addEventListener('click', () => this.executeNow());

    document.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => this.editRecurring(btn.dataset.edit)));
    document.querySelectorAll('[data-toggle]').forEach(btn => btn.addEventListener('click', () => this.toggleRecurring(btn.dataset.toggle)));
    document.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => this.deleteRecurring(btn.dataset.delete)));
  },

  showAddForm() {
    const list = document.getElementById('recurring-list');
    const formId = 'add-recurring-form';
    if (document.getElementById(formId)) return;
    const categories = ['Makan', 'Transport', 'Tagihan', 'Hiburan', 'Sehat', 'Lainnya'];
    const accounts = ['Bank Utama', 'E-Wallet', 'Cash'];
    list.innerHTML = `
      <div class="card card-hover rounded-2xl p-6 md:col-span-2" id="${formId}">
        <h4 class="font-display text-lg font-semibold mb-4" style="color:var(--ink)">Tambah Transaksi Berulang</h4>
        <div class="space-y-3">
          <input type="text" id="rt-desc" placeholder="Deskripsi" class="w-full rounded-lg px-3 py-2 text-sm outline-none" style="background:var(--surface-alt); border:1px solid var(--border); color:var(--ink)" />
          <div class="grid grid-cols-2 gap-3">
            <select id="rt-freq" class="rounded-lg px-3 py-2 text-sm outline-none" style="background:var(--surface-alt); border:1px solid var(--border); color:var(--ink)">
              <option value="monthly">Bulanan</option>
              <option value="weekly">Mingguan</option>
              <option value="daily">Harian</option>
              <option value="yearly">Tahunan</option>
            </select>
            <input type="number" id="rt-amount" placeholder="Jumlah" min="1" class="rounded-lg px-3 py-2 text-sm outline-none" style="background:var(--surface-alt); border:1px solid var(--border); color:var(--ink)" />
          </div>
          <select id="rt-type" class="rounded-lg px-3 py-2 text-sm outline-none" style="background:var(--surface-alt); border:1px solid var(--border); color:var(--ink)">
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
          <button type="button" id="btn-save-recurring" class="w-full mt-2 py-2 rounded-lg text-sm font-semibold btn-press" style="background:var(--indigo); color:#fff;">Simpan</button>
          <button type="button" id="btn-cancel-recurring" class="w-full py-2 rounded-lg text-sm font-semibold btn-press" style="background:var(--surface-alt); color:var(--ink-muted)">Batal</button>
        </div>
      </div>
    `;
    document.getElementById('btn-save-recurring').addEventListener('click', () => this.saveRecurring());
    document.getElementById('btn-cancel-recurring').addEventListener('click', () => this.renderList());
  },

  async saveRecurring() {
    const desc = document.getElementById('rt-desc').value.trim();
    const freq = document.getElementById('rt-freq').value;
    const amount = Number(document.getElementById('rt-amount').value);
    const type = document.getElementById('rt-type').value;
    if (!desc || !amount) { this.toast('Lengkapi deskripsi dan jumlah.', 'coral'); return; }
    try {
      await recurringTransactionService.create({ description: desc, frequency: freq, amount, type, account_id: '1', category_id: '1', next_date: new Date().toISOString().split('T')[0], active: true });
      await this.loadData();
      this.renderList();
      this.toast('Transaksi berulang ditambahkan.', 'emerald');
    } catch (e) { this.toast('Gagal menyimpan.', 'coral'); }
  },

  async toggleRecurring(id) {
    try {
      const rt = this.data.recurring.find(r => r.id === id);
      if (rt) {
        await recurringTransactionService.update(id, { active: !rt.active });
        await this.loadData();
        this.renderList();
        this.toast(`Transaksi ${rt.active ? 'dinonaktifkan' : 'diaktifkan'}.`, 'emerald');
      }
    } catch (e) { this.toast('Gagal.', 'coral'); }
  },

  async deleteRecurring(id) {
    try {
      await recurringTransactionService.delete(id);
      await this.loadData();
      this.renderList();
      this.toast('Transaksi berulang dihapus.', 'emerald');
    } catch (e) { this.toast('Gagal.', 'coral'); }
  },

  async executeNow() {
    const result = document.getElementById('execute-result');
    if (!result) return;
    result.textContent = 'Sedang mengeksekusi...';
    try {
      const { data } = await recurringTransactionService.executeNext();
      result.textContent = data && data.length > 0 ? `${data.length} transaksi berulang berhasil dieksekusi.` : 'Tidak ada transaksi berulang yang jatuh tempo.';
      await this.loadData();
      this.renderList();
    } catch (e) { result.textContent = 'Gagal eksekusi.'; }
  },

  toast(msg, tone = 'indigo') {
    const stack = document.getElementById('toast-stack') || document.body;
    const el = document.createElement('div');
    el.className = 'slide-in rounded-lg px-4 py-3 text-sm font-medium card';
    el.style.borderLeft = `4px solid var(--${tone})`;
    el.style.color = 'var(--ink)';
    el.textContent = msg;
    stack.appendChild(el);
    setTimeout(() => { el.classList.add('fade-out'); setTimeout(() => el.remove(), 320); }, 2600);
  }
};

