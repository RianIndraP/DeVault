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
import { settingsPage } from './pages/settings.js';

export const app = {
  currentUser: null,
  unsubscribeAuth: null,

  async init() {
    console.log('[Finance Dashboard] Initializing...');
    this.currentUser = await authService.getCurrentUser();
    this.setupRouter();
    await this.renderLayout();
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
      '/settings': settingsPage,
      '/login': authPage,
      '/register': authPage
    };
    router.init(routes);
  },

  async renderLayout() {
    const appEl = document.getElementById('app');
    if (!appEl) return;
    if (!this.currentUser) {
      appEl.innerHTML = '<div id="page-container" style="background:var(--canvas); min-height:100vh;"></div>';
      router.navigate('/login');
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
    await sidebar.render();
    await topbar.render();
    await tutorialPanel.render();
    router.resolve();
    this._layoutRendered = true;
  },

  setupAuthListener() {
    this.unsubscribeAuth = authService.onAuthStateChange(async (event, session) => {
      this.currentUser = session?.user || null;
      if (this.currentUser) {
        const displayName = this.currentUser?.user_metadata?.display_name || this.currentUser?.email?.split('@')[0] || 'User';
        sidebar.updateUser(displayName);
        topbar.updateUser(displayName);
        if (this._layoutRendered && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
          router.navigate('/');
        }
      } else {
        if (this._layoutRendered && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
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
