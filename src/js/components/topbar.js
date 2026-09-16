import { authService } from '../services/auth.js';
import { icon } from './icons.js';

export const topbar = {
  notificationCount: 0,

  async render() {
    const container = document.getElementById('topbar-container');
    if (!container) return;
    const user = await authService.getCurrentUser();
    const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
    const isDark = document.documentElement.classList.contains('dark');

    container.innerHTML = `
      <header class="h-16 sticky top-0 z-10 flex items-center justify-between gap-3 px-4 md:px-8" style="background:var(--canvas); border-bottom:1px solid var(--border);">
        <div class="flex items-center gap-3 min-w-0">
          <button id="btn-mobile-menu" class="lg:hidden p-2 rounded-lg focus-ring btn-press" style="border:1px solid var(--border); color:var(--ink-muted)" aria-label="Buka menu">
            ${icon('menu', 'w-5 h-5')}
          </button>
          <div class="hidden sm:flex items-center gap-2 rounded-lg px-3 py-2 w-64" style="background:var(--surface); border:1px solid var(--border);">
            <span style="color:var(--ink-muted);">${icon('search', 'w-4 h-4 shrink-0')}</span>
            <input type="text" id="global-search" placeholder="Cari transaksi..." class="bg-transparent text-sm w-full outline-none placeholder:opacity-60" style="color:var(--ink)" />
          </div>
        </div>

        <div class="flex items-center gap-2 md:gap-3">
          <button id="btn-theme" class="p-2 rounded-lg focus-ring btn-press" style="border:1px solid var(--border); color:var(--ink-muted)" aria-label="Ubah tema">
            ${icon(isDark ? 'moon' : 'sun', 'w-5 h-5')}
          </button>
          <button id="btn-notification" class="relative p-2 rounded-lg focus-ring btn-press" style="border:1px solid var(--border); color:var(--ink-muted)" aria-label="Notifikasi">
            ${icon('bell', 'w-5 h-5')}
            ${this.notificationCount > 0 ? `<span class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-semibold" style="background:var(--coral); color:#fff;">${this.notificationCount}</span>` : ''}
          </button>
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold" style="background:var(--indigo); color:#fff;">${displayName.charAt(0).toUpperCase()}</div>
            <span id="topbar-user-name" class="hidden md:block text-sm font-medium" style="color:var(--ink)">${displayName}</span>
          </div>
        </div>
      </header>
    `;
    this.attachEvents();
  },

  attachEvents() {
    const mobileMenuBtn = document.getElementById('btn-mobile-menu');
    const themeBtn = document.getElementById('btn-theme');
    const notifBtn = document.getElementById('btn-notification');
    const search = document.getElementById('global-search');

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('sidebar:toggle', { detail: { open: true } }));
      });
    }
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const isNowDark = !document.documentElement.classList.contains('dark');
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isNowDark ? 'dark' : 'light');
        this.render();
        document.dispatchEvent(new CustomEvent('theme:changed', {
          detail: { dark: isNowDark }
        }));
      });
    }
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        this.notificationCount = 0;
        this.render();
      });
    }
    if (search) {
      search.addEventListener('input', (e) => {
        // halaman aktif (mis. dashboard.js) bisa dengar event ini untuk
        // memfilter daftar transaksinya sendiri.
        document.dispatchEvent(new CustomEvent('search:changed', { detail: { query: e.target.value } }));
      });
    }
  },

  updateUser(name) {
    const el = document.getElementById('topbar-user-name');
    if (el) el.textContent = name;
  }
};