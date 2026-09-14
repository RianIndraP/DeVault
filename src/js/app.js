import { supabase } from './services/supabase.js';
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
import { settingsPage } from './pages/settings.js';

export const app = {
  currentUser: null,

  async init() {
    console.log('[Finance Dashboard] Initializing...');
    this.currentUser = await authService.getCurrentUser();
    this.setupRouter();
    this.renderLayout();
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
      '/settings': settingsPage,
      '/login': authPage,
      '/register': authPage
    };
    router.init(routes);
  },

  renderLayout() {
    const appEl = document.getElementById('app');
    if (!appEl) return;
    appEl.innerHTML = `
      <div class="flex min-h-screen bg-gray-50">
        <div id="sidebar-container"></div>
        <div class="flex-1 flex flex-col">
          <div id="topbar-container"></div>
          <main id="page-container" class="flex-1 p-4 md:p-6 lg:p-8 overflow-auto"></main>
        </div>
      </div>
    `;
    sidebar.render();
    topbar.render();
    router.resolve();
  },

  async checkAuth() {
    const user = await authService.getCurrentUser();
    if (!user && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      router.navigate('/login');
    }
    return user;
  }
};
