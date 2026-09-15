import { authService } from '../services/auth.js';

export const topbar = {
  notificationCount: 0,

  async render() {
    const container = document.getElementById('topbar-container');
    if (!container) return;
    const user = await authService.getCurrentUser();
    const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
    container.innerHTML = `
      <header class="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3 border-b sticky top-0 z-10" style="background:var(--surface);border-color:var(--border)">
        <div class="flex items-center gap-3">
          <button id="btn-mobile-menu" class="md:hidden text-gray-600 hover:text-blue-700 text-xl">☰</button>
          <div class="relative hidden md:block">
            <input type="text" id="global-search" placeholder="Cari transaksi..." class="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 lg:w-80" style="background:var(--surface);color:var(--text)" />
            <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <button id="btn-notification" class="text-gray-500 hover:text-blue-700 p-1 transition">🔔</button>
            ${this.notificationCount > 0 ? `<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">${this.notificationCount}</span>` : ''}
          </div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">${displayName.charAt(0).toUpperCase()}</div>
            <span id="topbar-user-name" class="hidden md:block text-sm font-medium" style="color:var(--text)">${displayName}</span>
          </div>
        </div>
      </header>
    `;
    this.attachEvents();
  },

  attachEvents() {
    const mobileMenuBtn = document.getElementById('btn-mobile-menu');
    const drawer = document.getElementById('mobile-drawer');
    if (mobileMenuBtn && drawer) {
      mobileMenuBtn.addEventListener('click', () => drawer.classList.remove('hidden'));
    }
    const notifBtn = document.getElementById('btn-notification');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        this.notificationCount = 0;
        this.render();
      });
    }
  },

  updateUser(name) {
    const el = document.getElementById('topbar-user-name');
    if (el) el.textContent = name;
  }
};