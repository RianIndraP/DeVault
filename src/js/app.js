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

export const app = {
  currentUser: null,
  unsubscribeAuth: null,

async init() {
     console.log('[Finance Dashboard] Initializing...');
     const savedTheme = localStorage.getItem('theme');
     if (savedTheme === 'dark') document.documentElement.classList.add('dark');
     this.currentUser = await authService.getCurrentUser();
     this.setupRouter();
     this.renderLayout();
     this.setupAuthListener();
     await this.checkAuth();
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
    if (!this.currentUser) {
      appEl.innerHTML = '<div id="page-container" style="background:var(--canvas); min-height:100vh;"></div>';
      router.resolve();
      return;
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
        const onAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
        if (onAuthPage || wasLoggedOut) {
          // Shell sebelumnya (saat belum login) cuma berisi #page-container
          // polos tanpa sidebar/topbar/tutorial — bangun ulang shell penuh.
          if (onAuthPage) window.history.pushState({}, '', '/');
          this.renderLayout();
        } else {
          const displayName = this.currentUser?.user_metadata?.display_name || this.currentUser?.email?.split('@')[0] || 'User';
          sidebar.updateUser(displayName);
          topbar.updateUser(displayName);
        }
      } else {
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          router.navigate('/login');
        }
      }
    });
  },

  async checkAuth() {
    const user = await authService.getCurrentUser();
    if (!user && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      router.navigate('/login');
    }
    return user;
  },

  destroy() {
    if (this.unsubscribeAuth) this.unsubscribeAuth();
  }
};