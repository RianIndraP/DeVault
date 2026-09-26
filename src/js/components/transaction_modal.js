import { icon } from './icons.js';
import { accountTypeLabel } from '../utils.js';

let _categories = [];
let _accounts = [];
let _bulkRowSeq = 0;

export function transactionModalHtml() {
  return `
    <div id="tx-mode-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div class="rounded-2xl p-6 w-full max-w-sm card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold font-display" style="color:var(--ink)">Tambah transaksi</h3>
          <button type="button" id="tx-mode-close" class="p-1.5 rounded-lg btn-press" style="color:var(--ink-muted)">${icon('close', 'w-5 h-5')}</button>
        </div>
        <div class="space-y-2">
          <button type="button" id="tx-mode-single" class="w-full text-left px-4 py-3 rounded-lg btn-press" style="background:var(--surface-alt)">
            <p class="font-medium text-sm" style="color:var(--ink)">Satu transaksi</p>
            <p class="text-xs mt-0.5" style="color:var(--ink-muted)">Catat satu pemasukan atau pengeluaran.</p>
          </button>
          <button type="button" id="tx-mode-bulk" class="w-full text-left px-4 py-3 rounded-lg btn-press" style="background:var(--surface-alt)">
            <p class="font-medium text-sm" style="color:var(--ink)">Banyak transaksi</p>
            <p class="text-xs mt-0.5" style="color:var(--ink-muted)">Masukkan beberapa transaksi sekaligus, seperti spreadsheet.</p>
          </button>
          <button type="button" id="tx-mode-transfer" class="w-full text-left px-4 py-3 rounded-lg btn-press" style="background:var(--surface-alt)">
            <p class="font-medium text-sm" style="color:var(--ink)">Transfer antar akun</p>
            <p class="text-xs mt-0.5" style="color:var(--ink-muted)">Pindahkan saldo dari satu akun ke akun lain.</p>
          </button>
        </div>
      </div>
    </div>

    <div id="tx-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <form id="tx-form" class="rounded-2xl p-6 w-full max-w-md card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold font-display" id="modal-title" style="color:var(--ink)">Tambah Transaksi</h3>
          <button type="button" id="btn-cancel-modal" class="p-1.5 rounded-lg btn-press" style="color:var(--ink-muted)">${icon('close', 'w-5 h-5')}</button>
        </div>
        <input type="hidden" id="tx-id" />
        <div class="space-y-3.5">
          <div>
            <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Tipe</label>
            <select id="tx-type" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)">
              <option value="income">Pemasukan</option><option value="expense">Pengeluaran</option><option value="transfer">Transfer</option>
            </select>
          </div>
          <div id="tx-category-wrap">
            <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Kategori</label>
            <select id="tx-category" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)"></select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label id="tx-account-label" class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Akun</label>
              <select id="tx-account" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)"></select>
            </div>
            <div id="tx-account-to-wrap" class="hidden">
              <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Ke akun</label>
              <select id="tx-account-to" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)"></select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Tanggal</label>
            <input type="date" id="tx-date" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Transaksi</label>
            <input type="text" id="tx-desc" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="Cth. Makan siang" />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Nominal (Rp)</label>
            <input type="number" id="tx-amount" min="1" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="0" />
          </div>
          <p id="tx-form-error" class="hidden text-xs" style="color:var(--coral)">Lengkapi transaksi dan nominal dulu.</p>
        </div>
        <button type="submit" class="w-full mt-5 py-2.5 rounded-lg text-white font-semibold focus-ring btn-press text-sm" style="background:var(--indigo)">Simpan transaksi</button>
      </form>
    </div>

    <div id="tx-bulk-modal" class="hidden fixed inset-0 z-50 items-center justify-center p-4 modal-backdrop">
      <div class="rounded-2xl p-6 w-full card" style="max-width:900px">
        <div class="flex items-center justify-between mb-1">
          <h3 class="text-lg font-bold font-display" style="color:var(--ink)">Tambah banyak transaksi</h3>
          <button type="button" id="bulk-close" class="p-1.5 rounded-lg btn-press" style="color:var(--ink-muted)">${icon('close', 'w-5 h-5')}</button>
        </div>
        <p class="text-sm mb-4" style="color:var(--ink-muted)">Nilai default di bawah berlaku untuk semua baris.</p>
        <div class="flex flex-wrap gap-2 mb-4">
          <select id="bulk-default-type" class="px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)">
            <option value="expense">Pengeluaran</option><option value="income">Pemasukan</option>
          </select>
          <select id="bulk-default-account" class="px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)"></select>
          <input type="date" id="bulk-default-date" class="px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" />
        </div>
        <div class="overflow-x-auto rounded-xl" style="border:1px solid var(--border); max-height:320px; overflow-y:auto;">
          <table class="w-full text-sm">
            <thead><tr style="background:var(--surface-alt)"><th class="px-3 py-2 text-left text-xs font-semibold" style="color:var(--ink-muted)">Transaksi</th><th class="px-3 py-2 text-left text-xs font-semibold" style="color:var(--ink-muted)">Kategori</th><th class="px-3 py-2 text-right text-xs font-semibold" style="color:var(--ink-muted)">Nominal</th><th class="px-2 py-2 w-8"></th></tr></thead>
            <tbody id="bulk-rows"></tbody>
          </table>
        </div>
        <datalist id="bulk-category-options"></datalist>
        <button type="button" id="bulk-add-row" class="mt-3 text-sm font-semibold px-3 py-1.5 rounded-lg btn-press" style="background:var(--surface-alt); color:var(--indigo)">+ Tambah baris</button>
        <p id="bulk-error" class="hidden text-xs mt-2" style="color:var(--coral)"></p>
        <div class="flex items-center justify-between mt-5 pt-4 flex-wrap gap-2" style="border-top:1px solid var(--border)">
          <p class="text-sm" style="color:var(--ink-muted)"><span id="bulk-count">0</span> transaksi · <span id="bulk-total" class="font-semibold tabular-nums" style="color:var(--ink)">Rp0</span></p>
          <div class="flex gap-2"><button type="button" id="bulk-cancel" class="text-sm font-medium px-4 py-2 rounded-lg btn-press" style="color:var(--ink-muted)">Batal</button><button type="button" id="bulk-save" class="text-sm font-semibold px-4 py-2 rounded-lg btn-press" style="background:var(--indigo); color:#fff">Simpan</button></div>
        </div>
      </div>
    </div>

    <div id="tx-transfer-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <form id="transfer-form" class="rounded-2xl p-6 w-full max-w-md card">
        <div class="flex items-center justify-between mb-4"><h3 class="text-lg font-bold font-display" style="color:var(--ink)">Transfer antar akun</h3><button type="button" id="transfer-close" class="p-1.5 rounded-lg btn-press" style="color:var(--ink-muted)">${icon('close', 'w-5 h-5')}</button></div>
        <div class="space-y-3.5">
          <div><label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Dari akun</label><select id="transfer-from" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)"></select></div>
          <div><label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Ke akun</label><select id="transfer-to" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)"></select></div>
          <div><label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Nominal (Rp)</label><input type="number" id="transfer-amount" min="1" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" placeholder="0" /></div>
          <div><label class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Tanggal</label><input type="date" id="transfer-date" class="w-full px-3 py-2 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink)" /></div>
          <p id="transfer-error" class="hidden text-xs" style="color:var(--coral)"></p>
        </div>
        <button type="submit" class="w-full mt-5 py-2.5 rounded-lg text-white font-semibold focus-ring btn-press text-sm" style="background:var(--indigo)">Simpan transfer</button>
      </form>
    </div>
  `;
}

export function fillTransactionModal(categories, accounts) {
  _categories = categories || [];
  _accounts = accounts || [];
  const catSel = document.getElementById('tx-category');
  const accSel = document.getElementById('tx-account');
  const accToSel = document.getElementById('tx-account-to');
  if (catSel) catSel.innerHTML = _categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const accOpts = _accounts.map(a => `<option value="${a.id}">${a.name} (${accountTypeLabel(a.type)})</option>`).join('');
  if (accSel) { accSel.innerHTML = accOpts; accSel.selectedIndex = 0; }
  if (accToSel) { accToSel.innerHTML = accOpts; accToSel.selectedIndex = _accounts.length > 1 ? 1 : 0; }
  const bulkAccSel = document.getElementById('bulk-default-account');
  if (bulkAccSel) { bulkAccSel.innerHTML = accOpts; bulkAccSel.selectedIndex = 0; }
  const transferFrom = document.getElementById('transfer-from');
  const transferTo = document.getElementById('transfer-to');
  if (transferFrom) { transferFrom.innerHTML = accOpts; transferFrom.selectedIndex = 0; }
  if (transferTo) { transferTo.innerHTML = accOpts; transferTo.selectedIndex = _accounts.length > 1 ? 1 : 0; }
  const catList = document.getElementById('bulk-category-options');
  if (catList) catList.innerHTML = _categories.map(c => `<option value="${c.name}"></option>`).join('');
}

export function syncTransactionTypeFields(type) {
  document.getElementById('tx-category-wrap')?.classList.toggle('hidden', type !== 'expense');
  document.getElementById('tx-account-to-wrap')?.classList.toggle('hidden', type !== 'transfer');
  const label = document.getElementById('tx-account-label');
  if (label) label.textContent = type === 'transfer' ? 'Dari akun' : 'Akun';
}

function openModeChooser() {
  const modal = document.getElementById('tx-mode-modal');
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}
function closeModeChooser() {
  const modal = document.getElementById('tx-mode-modal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

export function openTransactionModal(tx = null) {
  const modal = document.getElementById('tx-modal');
  const form = document.getElementById('tx-form');
  if (!modal || !form) return;
  document.getElementById('tx-form-error')?.classList.add('hidden');
  document.getElementById('modal-title').textContent = tx ? 'Edit Transaksi' : 'Tambah Transaksi';
  form.reset();
  document.getElementById('tx-id').value = tx?.id || '';
  document.getElementById('tx-type').value = tx?.type || 'income';
  document.getElementById('tx-date').value = tx?.date ? String(tx.date).slice(0, 10) : new Date().toISOString().slice(0, 10);
  const account = document.getElementById('tx-account');
  const accountTo = document.getElementById('tx-account-to');
  if (tx) {
    account.value = tx.account_id || '';
    accountTo.value = tx.account_to_id || '';
  } else {
    account.selectedIndex = 0;
    accountTo.selectedIndex = _accounts.length > 1 ? 1 : 0;
  }
  document.getElementById('tx-category').value = tx?.category_id || '';
  document.getElementById('tx-desc').value = tx?.description || '';
  document.getElementById('tx-amount').value = tx?.amount || '';
  syncTransactionTypeFields(tx?.type || 'income');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

export function closeTransactionModal() {
  const modal = document.getElementById('tx-modal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

function readSingleForm() {
  const type = document.getElementById('tx-type').value;
  const description = document.getElementById('tx-desc').value.trim();
  const amount = parseFloat(document.getElementById('tx-amount').value);
  const dateVal = document.getElementById('tx-date').value;
  const errorEl = document.getElementById('tx-form-error');
  if (!description || !amount || amount <= 0 || !dateVal) {
    errorEl?.classList.remove('hidden');
    return null;
  }
  errorEl?.classList.add('hidden');
  const [year, month] = dateVal.split('-').map(Number);
  const id = document.getElementById('tx-id').value;
  const payload = {
    ...(id ? { id } : {}),
    type,
    account_id: document.getElementById('tx-account').value,
    category_id: type === 'expense' ? (document.getElementById('tx-category').value || null) : null,
    date: dateVal,
    description,
    amount,
    month,
    year,
    source: 'manual'
  };
  if (type === 'transfer') payload.account_to_id = document.getElementById('tx-account-to').value;
  return payload;
}

function bulkRowHtml(rowId) {
  return `
  <tr class="bulk-row" data-row="${rowId}" style="border-top:1px solid var(--border)">
    <td class="px-3 py-2"><input type="text" class="bulk-desc w-full bg-transparent text-sm outline-none" style="color:var(--ink)" placeholder="Nama transaksi" /></td>
    <td class="px-3 py-2"><input type="text" list="bulk-category-options" class="bulk-category w-full bg-transparent text-sm outline-none" style="color:var(--ink)" placeholder="Kategori (opsional)" /></td>
    <td class="px-3 py-2 text-right"><input type="number" min="0" class="bulk-amount w-28 bg-transparent text-sm text-right outline-none tabular-nums" style="color:var(--ink)" placeholder="0" /></td>
    <td class="px-2 py-2 text-center"><button type="button" class="bulk-row-remove p-1 rounded btn-press" style="color:var(--coral)">✕</button></td>
  </tr>`;
}

function addBulkRow(focus) {
  const tbody = document.getElementById('bulk-rows');
  if (!tbody) return;
  _bulkRowSeq++;
  tbody.insertAdjacentHTML('beforeend', bulkRowHtml(_bulkRowSeq));
  if (focus) {
    const rows = tbody.querySelectorAll('.bulk-row');
    rows[rows.length - 1]?.querySelector('.bulk-desc')?.focus();
  }
}

function updateBulkSummary() {
  const amounts = [...document.querySelectorAll('#bulk-rows .bulk-amount')].map(el => Number(el.value) || 0);
  const descs = [...document.querySelectorAll('#bulk-rows .bulk-desc')].map(el => el.value.trim());
  let count = 0, total = 0;
  amounts.forEach((amount, index) => {
    if (amount > 0 && descs[index]) { count++; total += amount; }
  });
  const countEl = document.getElementById('bulk-count');
  const totalEl = document.getElementById('bulk-total');
  if (countEl) countEl.textContent = count;
  if (totalEl) totalEl.textContent = 'Rp' + Math.round(total).toLocaleString('id-ID');
}

export function openBulkModal() {
  const modal = document.getElementById('tx-bulk-modal');
  if (!modal) return;
  document.getElementById('bulk-error')?.classList.add('hidden');
  document.getElementById('bulk-default-type').value = 'expense';
  document.getElementById('bulk-default-date').value = new Date().toISOString().slice(0, 10);
  const tbody = document.getElementById('bulk-rows');
  tbody.innerHTML = '';
  _bulkRowSeq = 0;
  for (let i = 0; i < 4; i++) addBulkRow(false);
  updateBulkSummary();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => tbody.querySelector('.bulk-desc')?.focus(), 50);
}

export function closeBulkModal() {
  const modal = document.getElementById('tx-bulk-modal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

function findCategoryIdByName(name) {
  if (!name) return null;
  const match = _categories.find(category => category.name.toLowerCase() === name.trim().toLowerCase());
  return match ? match.id : null;
}

function readBulkRows() {
  const type = document.getElementById('bulk-default-type').value;
  const accountId = document.getElementById('bulk-default-account').value;
  const dateVal = document.getElementById('bulk-default-date').value || new Date().toISOString().slice(0, 10);
  const [year, month] = dateVal.split('-').map(Number);
  const payloads = [];
  let incomplete = 0;
  document.querySelectorAll('#bulk-rows .bulk-row').forEach(row => {
    const description = row.querySelector('.bulk-desc').value.trim();
    const amount = parseFloat(row.querySelector('.bulk-amount').value);
    const categoryName = row.querySelector('.bulk-category').value;
    if (!description && (!amount || amount <= 0)) return;
    if (!description || !amount || amount <= 0) { incomplete++; return; }
    payloads.push({
      type,
      account_id: accountId,
      category_id: type === 'expense' ? findCategoryIdByName(categoryName) : null,
      date: dateVal,
      description,
      amount,
      month,
      year,
      source: 'manual'
    });
  });
  return { payloads, incomplete };
}

function showBulkError(message) {
  const el = document.getElementById('bulk-error');
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
}

export function openTransferModal() {
  const modal = document.getElementById('tx-transfer-modal');
  const form = document.getElementById('transfer-form');
  if (!modal || !form) return;
  document.getElementById('transfer-error')?.classList.add('hidden');
  form.reset();
  document.getElementById('transfer-from').selectedIndex = 0;
  document.getElementById('transfer-to').selectedIndex = _accounts.length > 1 ? 1 : 0;
  document.getElementById('transfer-date').value = new Date().toISOString().slice(0, 10);
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

export function closeTransferModal() {
  const modal = document.getElementById('tx-transfer-modal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

function readTransferForm() {
  const fromId = document.getElementById('transfer-from').value;
  const toId = document.getElementById('transfer-to').value;
  const amount = parseFloat(document.getElementById('transfer-amount').value);
  const dateVal = document.getElementById('transfer-date').value;
  const errorEl = document.getElementById('transfer-error');
  if (!fromId || !toId || fromId === toId || !amount || amount <= 0 || !dateVal) {
    if (errorEl) {
      errorEl.textContent = fromId && fromId === toId ? 'Akun tujuan harus berbeda dari akun asal.' : 'Lengkapi semua kolom dengan benar.';
      errorEl.classList.remove('hidden');
    }
    return null;
  }
  errorEl?.classList.add('hidden');
  const [year, month] = dateVal.split('-').map(Number);
  return { type: 'transfer', account_id: fromId, account_to_id: toId, category_id: null, date: dateVal, description: 'Transfer antar akun', amount, month, year, source: 'manual' };
}

export function bindTransactionModal({ onBeforeOpen, onSubmit } = {}) {
  document.getElementById('btn-add-transaction')?.addEventListener('click', () => {
    if (onBeforeOpen && onBeforeOpen() === false) return;
    openModeChooser();
  });
  document.getElementById('tx-mode-close')?.addEventListener('click', closeModeChooser);
  document.getElementById('tx-mode-modal')?.addEventListener('click', (e) => { if (e.target.id === 'tx-mode-modal') closeModeChooser(); });
  document.getElementById('tx-mode-single')?.addEventListener('click', () => { closeModeChooser(); openTransactionModal(); });
  document.getElementById('tx-mode-bulk')?.addEventListener('click', () => { closeModeChooser(); openBulkModal(); });
  document.getElementById('tx-mode-transfer')?.addEventListener('click', () => { closeModeChooser(); openTransferModal(); });

  const modal = document.getElementById('tx-modal');
  const form = document.getElementById('tx-form');
  if (modal && form) {
    document.getElementById('btn-cancel-modal')?.addEventListener('click', closeTransactionModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeTransactionModal(); });
    document.getElementById('tx-type')?.addEventListener('change', (e) => syncTransactionTypeFields(e.target.value));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = readSingleForm();
      if (!payload) return;
      closeTransactionModal();
      onSubmit?.([payload]);
    });
  }

  const bulkModal = document.getElementById('tx-bulk-modal');
  if (bulkModal) {
    document.getElementById('bulk-close')?.addEventListener('click', closeBulkModal);
    document.getElementById('bulk-cancel')?.addEventListener('click', closeBulkModal);
    bulkModal.addEventListener('click', (e) => { if (e.target === bulkModal) closeBulkModal(); });
    document.getElementById('bulk-add-row')?.addEventListener('click', () => addBulkRow(true));
    document.getElementById('bulk-rows')?.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.bulk-row-remove');
      if (removeBtn) { removeBtn.closest('.bulk-row')?.remove(); updateBulkSummary(); }
    });
    document.getElementById('bulk-rows')?.addEventListener('input', (e) => {
      if (e.target.classList.contains('bulk-amount') || e.target.classList.contains('bulk-desc')) updateBulkSummary();
    });
    document.getElementById('bulk-rows')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.classList.contains('bulk-amount')) { e.preventDefault(); addBulkRow(true); }
    });
    document.getElementById('bulk-save')?.addEventListener('click', () => {
      const { payloads, incomplete } = readBulkRows();
      if (!payloads.length) { showBulkError('Isi minimal satu transaksi yang lengkap (nama & nominal).'); return; }
      closeBulkModal();
      onSubmit?.(payloads);
      if (incomplete > 0) console.info(`[bulk transaksi] ${incomplete} baris dilewati karena belum lengkap.`);
    });
  }

  const transferModal = document.getElementById('tx-transfer-modal');
  if (transferModal) {
    document.getElementById('transfer-close')?.addEventListener('click', closeTransferModal);
    transferModal.addEventListener('click', (e) => { if (e.target === transferModal) closeTransferModal(); });
    document.getElementById('transfer-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = readTransferForm();
      if (!payload) return;
      closeTransferModal();
      onSubmit?.([payload]);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeModeChooser();
    closeTransactionModal();
    closeBulkModal();
    closeTransferModal();
  });
}
