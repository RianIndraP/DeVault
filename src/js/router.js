export const router = {
  routes: {},

  init(routes) {
    this.routes = routes;
    window.addEventListener('popstate', () => this.resolve());
    this.interceptLinks();
  },

  // Menangkap klik pada elemen manapun yang punya atribut [data-route]
  // (mis. link sidebar) dan mengubahnya jadi navigasi client-side lewat
  // pushState, bukan full page reload. Modifier click (ctrl/cmd/shift/
  // middle-click) tetap dibiarkan berperilaku normal (buka tab baru dsb).
  interceptLinks() {
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = e.target.closest('[data-route]');
      if (!link) return;
      if (link.target === '_blank') return;

      const path = link.getAttribute('href') || link.getAttribute('data-route');
      if (!path || !path.startsWith('/')) return;

      e.preventDefault();
      if (path !== window.location.pathname) {
        this.navigate(path);
      }
    });
  },

  navigate(path) {
    window.history.pushState({}, '', path);
    this.resolve();
  },

  resolve() {
    const path = window.location.pathname;
    const page = this.routes[path] || this.routes['/'];
    if (page) {
      page.render();
    }
    this.updateActiveLink(path);
  },

  updateActiveLink(path) {
    document.querySelectorAll('[data-route]').forEach(el => {
      const isActive = el.getAttribute('data-route') === path;
      el.classList.toggle('active', isActive);
    });
  }
};