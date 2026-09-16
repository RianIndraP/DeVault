import { authService } from './services/auth.js';
import { router } from './router.js';
import { sidebar } from './components/sidebar.js';
import { topbar } from './components/topbar.js';
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
  globalSearchQuery: '',

  async init() {
    console.log('[Finance Dashboard] Initializing...');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    this.currentUser = await authService.getCurrentUser();
    this.setupRouter();
    this.renderLayout();
    this.setupAuthListener();
    this.setupGlobalSearch();
    this.executeRecurringTransactions();
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
        <div class="flex-1 min-w-0 lg:ml-64">
          <div id="topbar-container"></div>
          <main id="page-container" class="p-4 md:p-8 max-w-7xl mx-auto" style="color:var(--ink)"></main>
        </div>
      </div>
    `;
    sidebar.render();
    topbar.render();
    router.resolve();
  },

  setupAuthListener() {
    this.unsubscribeAuth = authService.onAuthStateChange(async (event, session) => {
      this.currentUser = session?.user || null;
      if (this.currentUser) {
        const displayName = this.currentUser?.user_metadata?.display_name || this.currentUser?.email?.split('@')[0] || 'User';
        sidebar.updateUser(displayName);
        topbar.updateUser(displayName);
        if (window.location.pathname === '/login' || window.location.pathname === '/register') {
          router.navigate('/');
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

  setupGlobalSearch() {
    document.addEventListener('search:changed', async (e) => {
      this.globalSearchQuery = e.detail.query;
      if (window.location.pathname !== '/dashboard') return;
      const event = new CustomEvent('global-search', { detail: { query: this.globalSearchQuery } });
      document.dispatchEvent(event);
    });
  },

  async executeRecurringTransactions() {
    try {
      const { recurringTransactionService } = await import('./services/database.js');
      const { data } = await recurringTransactionService.executeNext();
      if (data && data.length > 0) {
        console.log(`[Recurring] ${data.length} transaksi berulang dieksekusi.`);
      }
    } catch (e) {
      console.warn('[Recurring] Could not execute recurring transactions:', e.message);
    }
  },

  destroy() {
    if (this.unsubscribeAuth) this.unsubscribeAuth();
  }
};