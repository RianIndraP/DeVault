import { authService } from './services/auth.js';
import { router } from './router.js';
import { sidebar } from './components/sidebar.js';
import { topbar } from './components/topbar.js';
import { tutorialPanel } from './components/tutorial.js';
import { dashboardPage } from './pages/dashboard.js';
import { authPage } from './pages/auth.js';
import { transactionsPage } from './pages/transactions.js';
import { accountsPage } from './pages/accounts.js';
import { categoriesPage } from './pages/categories.js';
import { budgetsPage } from './pages/budgets.js';
import { goalsPage } from './pages/goals.js';
import { reportsPage } from './pages/reports.js';
import { recurringPage } from './pages/recurring.js';
import { settingsPage } from './pages/settings.js';

const PUBLIC_PATHS = ['/login', '/register'];

export const app = {
  currentUser: null,
  unsubscribeAuth: null,

  async init() {
    console.log('[Finance Dashboard] Initializing...');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');

    this.setupRouter();

    // PENTING: hanya SATU pengecekan auth yang otoritatif sebelum apa pun
    // dirender. Sebelumnya ada dua fetch terpisah (di sini + di checkAuth()
    // yang dipanggil belakangan) — kalau fetch kedua mengoreksi hasil fetch
    // pertama (mis. sesi ternyata sudah invalid) SETELAH halaman pertama
    // (mis. dashboard) mulai render secara async, hasil render halaman lama
    // itu bisa menimpa balik halaman login yang baru dipasang. Dengan satu
    // fetch di awal, currentUser sudah pasti benar sebelum renderLayout()
    // memutuskan halaman mana yang dipanggil, jadi tidak ada dua render
    // yang berebut menulis ke #page-container.
    this.currentUser = await authService.getCurrentUser();

    this.renderLayout();
    this.setupAuthListener();
  },

  setupRouter() {
    const routes = {
      '/': dashboardPage,
      '/dashboard': dashboardPage,
      '/transactions': transactionsPage,
      '/accounts': accountsPage,
      '/categories': categoriesPage,
      '/budgets': budgetsPage,
      '/goals': goalsPage,
      '/reports': reportsPage,
      '/recurring': recurringPage,
      '/settings': settingsPage,
      '/login': authPage,
      '/register': authPage
    };
    router.init(routes);
  },

  renderLayout() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    const appEl = document.getElementById('app');
    if (!appEl) return;

    const path = window.location.pathname;

    if (!this.currentUser) {
      // Belum login: shell polos, dan kalau path sekarang bukan halaman
      // publik (mis. langsung buka /transactions tanpa sesi), arahkan ke
      // /login SEBELUM router.resolve() dipanggil — jadi hanya satu
      // keputusan render, tidak ada page lain yang sempat mulai render
      // duluan lalu dikoreksi belakangan.
      appEl.innerHTML = '<div id="page-container" style="background:var(--canvas); min-height:100vh;"></div>';
      if (!PUBLIC_PATHS.includes(path)) {
        window.history.replaceState({}, '', '/login');
      }
      router.resolve();
      return;
    }

    // Sudah login tapi masih nyangkut di /login atau /register: bawa ke
    // dashboard sebelum resolve, dengan alasan yang sama seperti di atas.
    if (PUBLIC_PATHS.includes(path)) {
      window.history.replaceState({}, '', '/');
    }

    appEl.innerHTML = `
      <div class="flex min-h-screen" style="background:var(--canvas)">
        <div id="sidebar-container"></div>
        <div class="flex-1 min-w-0 lg:ml-64 xl:mr-[300px]">
          <div id="topbar-container"></div>
          <main id="page-container" class="p-4 md:p-8 max-w-7xl mx-auto" style="color:var(--ink)"></main>
        </div>
        <div id="tutorial-container"></div>
      </div>
    `;
    sidebar.render();
    topbar.render();
    tutorialPanel.render();
    router.resolve();
  },

  setupAuthListener() {
    this.unsubscribeAuth = authService.onAuthStateChange(async (event, session) => {
      const wasLoggedOut = !this.currentUser;
      this.currentUser = session?.user || null;

      if (this.currentUser) {
        const onAuthPage = PUBLIC_PATHS.includes(window.location.pathname);
        if (onAuthPage || wasLoggedOut) {
          // Shell sebelumnya (saat belum login) cuma berisi #page-container
          // polos tanpa sidebar/topbar/tutorial — bangun ulang shell penuh.
          this.renderLayout();
        } else {
          const displayName = this.currentUser?.user_metadata?.display_name || this.currentUser?.email?.split('@')[0] || 'User';
          sidebar.updateUser(displayName);
          topbar.updateUser(displayName);
        }
      } else {
        // Sesi berakhir (logout / token invalid) — render ulang shell,
        // renderLayout() sendiri yang akan mengarahkan ke /login kalau perlu.
        this.renderLayout();
      }
    });
  },

  // Dipertahankan untuk kompatibilitas kalau ada kode lain yang memanggil
  // app.checkAuth() — tapi TIDAK dipanggil dari init() lagi (itu sumber
  // race condition-nya), dan tidak melakukan redirect sendiri lagi karena
  // proteksi rute sekarang sepenuhnya ada di renderLayout().
  async checkAuth() {
    return this.currentUser;
  },

  destroy() {
    if (this.unsubscribeAuth) this.unsubscribeAuth();
  }
};