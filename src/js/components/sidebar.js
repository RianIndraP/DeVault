import { authService } from '../services/auth.js';

export const sidebar = {
  collapsed: false,

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

  async render() {
    const container = document.getElementById('sidebar-container');
    if (!container) return;
    const user = await authService.getCurrentUser();
    const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
    const initials = displayName.charAt(0).toUpperCase();
    container.innerHTML = `
      <aside id="sidebar" class="${this.collapsed ? 'lg:w-16' : 'w-64'} flex flex-col min-h-screen fixed lg:relative z-20 transition-all duration-300 ease-in-out" style="background:var(--surface);border-right:1px solid var(--border)">
        <div class="p-4 border-b flex items-center justify-between" style="border-color:var(--border)">
          <div class="flex items-center gap-2 overflow-hidden ${this.collapsed ? 'justify-center' : ''}">
            <span class="text-xl flex-shrink-0">💰</span>
            <span class="text-lg font-bold whitespace-nowrap ${this.collapsed ? 'hidden' : ''}" style="color:var(--accent)">FinanceApp</span>
          </div>
          <button id="btn-sidebar-toggle" class="text-gray-400 hover:text-blue-700 p-1 flex-shrink-0">
            <span class="text-lg">${this.collapsed ? '→' : '←'}</span>
          </button>
        </div>
        <nav class="flex-1 overflow-y-auto py-4">
          ${this.links.map(link => `
            <a href="${link.path}" data-route="${link.path}" class="flex items-center gap-3 px-4 py-3 transition-colors group ${this.collapsed ? 'justify-center' : ''}" title="${link.label}" style="color:var(--text-muted)">
              <span class="text-lg flex-shrink-0">${link.icon}</span>
              <span class="whitespace-nowrap ${this.collapsed ? 'hidden' : ''}">${link.label}</span>
              ${this.collapsed ? `<span class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">${link.label}</span>` : ''}
            </a>
          `).join('')}
        </nav>
        <div class="p-3 border-t" style="border-color:var(--border)">
          <div class="flex items-center gap-3 px-3 py-2 ${this.collapsed ? 'justify-center' : ''}">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">${initials}</div>
            <span class="text-sm font-medium whitespace-nowrap ${this.collapsed ? 'hidden' : ''}" id="sidebar-user-name" style="color:var(--text)">${displayName}</span>
          </div>
          <button id="btn-logout" class="w-full text-left px-3 py-2 mt-1 rounded-lg transition-colors flex items-center gap-2 ${this.collapsed ? 'justify-center' : ''}" style="color:var(--text-muted)">
            <span>🚪</span><span class="whitespace-nowrap ${this.collapsed ? 'hidden' : ''}">Keluar</span>
          </button>
        </div>
      </aside>
      ${window.innerWidth < 768 ? `
        <button id="btn-menu-toggle" class="fixed bottom-4 right-4 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg z-30 flex items-center justify-center text-2xl">☰</button>
        <div id="mobile-drawer" class="fixed inset-0 bg-black/50 z-40 hidden">
          <div class="absolute left-0 top-0 bottom-0 w-72 p-4" style="background:var(--surface)">
            <button id="btn-close-drawer" class="text-2xl mb-4" style="color:var(--text)">✕</button>
            ${this.links.map(link => `<a href="${link.path}" class="block py-3 rounded-lg px-3 transition-colors" style="color:var(--text)">${link.icon} ${link.label}</a>`).join('')}
          </div>
        </div>
      ` : ''}
    `;
    this.attachEvents();
  },

  attachEvents() {
    const sidebarEl = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('btn-sidebar-toggle');
    const logoutBtn = document.getElementById('btn-logout');
    const menuToggle = document.getElementById('btn-menu-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const closeDrawer = document.getElementById('btn-close-drawer');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.collapsed = !this.collapsed;
        this.render();
      });
    }
    if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
    if (menuToggle && drawer) menuToggle.addEventListener('click', () => drawer.classList.remove('hidden'));
    if (closeDrawer && drawer) closeDrawer.addEventListener('click', () => drawer.classList.add('hidden'));
  },

  async logout() {
    await authService.logout();
    window.location.href = '/';
  },

  updateUser(name) {
    const el = document.getElementById('sidebar-user-name');
    if (el) el.textContent = name;
  }
};