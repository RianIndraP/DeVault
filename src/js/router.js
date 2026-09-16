export const router = {
  routes: {},

  init(routes) {
    this.routes = routes;
    window.addEventListener('popstate', () => this.resolve());
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