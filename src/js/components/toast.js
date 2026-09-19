// Toast notification bersama — dipakai oleh semua halaman (dashboard,
// transaksi, dll) supaya tidak ada implementasi duplikat.

function ensureContainer() {
  let el = document.getElementById('toast-container');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast-container';
    el.className = 'toast-container';
    document.body.appendChild(el);
  }
  return el;
}

/**
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
export function showToast(message, type = 'info') {
  const container = ensureContainer();
  const el = document.createElement('div');
  el.className = `toast toast-${type} slide-in`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => el.remove(), 300);
  }, 2800);
}
