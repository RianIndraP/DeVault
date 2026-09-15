import { authService } from '../services/auth.js';
import { icon } from './icons.js';

export const sidebar = {
  links: [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/transactions', label: 'Transaksi', icon: 'transactions' },
    { path: '/accounts', label: 'Akun', icon: 'accounts' },
    { path: '/categories', label: 'Kategori', icon: 'categories' },
    { path: '/budgets', label: 'Budget', icon: 'budgets' },
    { path: '/goals', label: 'Target', icon: 'goals' },
    { path: '/reports', label: 'Laporan', icon: 'reports' },
    { path: '/settings', label: 'Pengaturan', icon: 'settings' }
  ],

  async render() {
    const container = document.getElementById('sidebar-container');
    if (!container) return;
    const user = await authService.getCurrentUser();
    const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
    const initials = displayName.charAt(0).toUpperCase();
    const activePath = window.location.pathname;

    container.innerHTML = `
      <aside id="sidebar" class="fixed inset-y-0 left-0 z-30 w-64 flex-col -translate-x-full lg:translate-x-0 lg:flex transition-transform duration-200"
             style="background:var(--surface); border-right:1px solid var(--border);">
        <div class="h-16 flex items-center gap-2 px-5" style="border-bottom:1px solid var(--border);">
          <span class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style="background:var(--emerald); color:#fff;">Rp</span>
          <span class="font-display text-lg font-semibold" style="color:var(--ink)">Dompetku</span>
          <button id="btn-sidebar-close" class="ml-auto lg:hidden p-1.5 rounded-lg focus-ring" style="color:var(--ink-muted)" aria-label="Tutup menu">
            ${icon('close', 'w-4 h-4')}
          </button>
        </div>

        <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 text-sm">
          ${this.links.map(link => {
      const active = activePath === link.path;
      return `
            <a href="${link.path}" data-route="${link.path}"
               class="flex items-center gap-3 px-3 py-2 rounded-lg font-medium focus-ring"
               style="${active
          ? 'background:var(--emerald-soft); color:var(--emerald-strong);'
          : 'color:var(--ink-muted);'}">
              ${icon(link.icon, 'w-4 h-4')}
              ${link.label}
            </a>`;
    }).join('')}
        </nav>

        <div class="p-3" style="border-top:1px solid var(--border);">
          <div class="flex items-center gap-3 px-3 py-2 rounded-lg" style="background:var(--surface-alt);">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0" style="background:var(--emerald); color:#fff;">${initials}</div>
            <div class="leading-tight min-w-0">
              <p class="text-sm font-medium truncate" id="sidebar-user-name" style="color:var(--ink)">${displayName}</p>
              <p class="text-xs" style="color:var(--ink-muted);">Profil pribadi</p>
            </div>
          </div>
          <button id="btn-logout" class="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-lg focus-ring" style="color:var(--ink-muted);">
            ${icon('logout', 'w-4 h-4')}
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <div id="sidebar-backdrop" class="fixed inset-0 z-20 hidden lg:hidden" style="background:rgba(0,0,0,.4);"></div>
    `;
    this.attachEvents();
  },

  attachEvents() {
    const logoutBtn = document.getElementById('btn-logout');
    const closeBtn = document.getElementById('btn-sidebar-close');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
    if (closeBtn) closeBtn.addEventListener('click', () => this.setOpen(false));
    if (backdrop) backdrop.addEventListener('click', () => this.setOpen(false));

    // Dibuka dari tombol hamburger di topbar (lihat topbar.js)
    document.addEventListener('sidebar:toggle', (e) => this.setOpen(e.detail?.open));
  },

  setOpen(open) {
    const sidebarEl = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!sidebarEl || !backdrop) return;
    sidebarEl.classList.toggle('-translate-x-full', !open);
    sidebarEl.classList.toggle('flex', !!open);
    backdrop.classList.toggle('hidden', !open);
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