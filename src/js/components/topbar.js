export const topbar = {
  render() {
    const container = document.getElementById('topbar-container');
    if (!container) return;
    container.innerHTML = `
      <header class="bg-white border-b border-dark-200 px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-10">
        <div class="flex items-center gap-3">
          <div class="relative hidden md:block">
            <input type="text" id="global-search" placeholder="Cari transaksi..." class="pl-10 pr-4 py-2 bg-dark-50 border border-dark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64" />
            <span class="absolute left-3 top-2.5 text-dark-400">🔍</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button id="btn-notification" class="relative text-dark-500 hover:text-blue-700">🔔</button>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">U</div>
            <span id="user-name" class="hidden md:block text-sm font-medium text-dark-700">User</span>
          </div>
        </div>
      </header>
    `;
  }
};