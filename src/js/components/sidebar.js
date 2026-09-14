import { authService } from '../services/auth.js';

const isMobile = window.innerWidth < 768;

export const sidebar = {
  links: [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/transactions', label: 'Transaksi', icon: '💳' },
    { path: '/accounts', label: 'Akun', icon: '🏦' },
    { path: '/categories', label: 'Kategori', icon: '🏷️' },
    { path: '/budgets', label: 'Budget', icon: '📋' },
    { path: '/goals', label: 'Target', icon: '🎯' },
    { path: '/reports', label: 'Laporan', icon: '📄' },
    { path: '/settings', label: 'Pengaturan', icon: '⚙️' }
  ],

  render() {
    const container = document.getElementById('sidebar-container');
    if (!container) return;
    container.innerHTML = `
      <aside class="${isMobile ? 'hidden' : 'flex'} w-64 bg-white border-r border-gray-200 flex-col min-h-screen fixed lg:relative z-20">
        <div class="p-5 border-b border-gray-200">
          <h1 class="text-xl font-bold text-blue-700">💰 FinanceApp</h1>
          <p class="text-xs text-gray-500 mt-1">Personal Finance Dashboard</p>
        </div>
        <nav class="flex-1 overflow-y-auto py-4">
          ${this.links.map(link => `<a href="${link.path}" data-route="${link.path}" class="flex items-center gap-3 px-5 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <span>${link.icon}</span><span>${link.label}</span>
          </a>`).join('')}
        </nav>
        <div class="p-4 border-t border-gray-200">
          <button id="btn-logout" class="w-full text-left px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            🚪 Keluar
          </button>
        </div>
      </aside>
      ${isMobile ? `
        <button id="btn-menu-toggle" class="fixed bottom-4 right-4 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg z-30 flex items-center justify-center text-2xl">☰</button>
        <div id="mobile-drawer" class="fixed inset-0 bg-black/50 z-40 hidden">
          <div class="absolute left-0 top-0 bottom-0 w-72 bg-white p-4">
            <button id="btn-close-drawer" class="text-2xl mb-4">✕</button>
            ${this.links.map(link => `<a href="${link.path}" class="block py-2 text-gray-700 hover:text-blue-700">${link.label}</a>`).join('')}
          </div>
        </div>
      ` : ''}
    `;
    this.attachEvents();
  },

  attachEvents() {
    const logoutBtn = document.getElementById('btn-logout');
    const menuToggle = document.getElementById('btn-menu-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const closeDrawer = document.getElementById('btn-close-drawer');
    if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
    if (menuToggle && drawer) menuToggle.addEventListener('click', () => drawer.classList.remove('hidden'));
    if (closeDrawer && drawer) closeDrawer.addEventListener('click', () => drawer.classList.add('hidden'));
  },

  async logout() {
    await authService.logout();
    window.location.href = '/';
  }
};
