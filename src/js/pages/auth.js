import { authService } from '../services/auth.js';
import { router } from '../router.js';

export const authPage = {
  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    const isRegister = window.location.pathname === '/register';
    container.innerHTML = `
      <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
          <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900" id="auth-title">
              ${isRegister ? 'Buat Akun Baru' : 'Masuk ke Akunmu'}
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600" id="auth-subtitle">
              ${isRegister
                ? 'Sudah punya akun? <a href="#/" id="btn-switch-to-login" class="font-medium text-primary-600 hover:text-primary-500">Masuk</a>'
                : 'Belum punya akun? <a href="#/register" id="btn-switch-to-register" class="font-medium text-primary-600 hover:text-primary-500">Daftar baru</a>'}
            </p>
          </div>
          <form id="auth-form" class="mt-8 space-y-6">
            <div id="auth-name-field" class="${isRegister ? '' : 'hidden'}">
              <label for="auth-name" class="sr-only">Nama</label>
              <input id="auth-name" name="name" type="text" ${isRegister ? '' : 'disabled'} class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" placeholder="Nama lengkap" />
            </div>
            <div>
              <label for="auth-email" class="sr-only">Email</label>
              <input id="auth-email" name="email" type="email" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" placeholder="Email address" />
            </div>
            <div>
              <label for="auth-password" class="sr-only">Password</label>
              <input id="auth-password" name="password" type="password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" placeholder="Password" />
            </div>
            <div id="auth-error" class="hidden text-red-600 text-sm text-center"></div>
            <div>
              <button type="submit" id="auth-submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <span id="auth-submit-text">${isRegister ? 'Daftar' : 'Masuk'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    this.attachEvents();
  },

  attachEvents() {
    const form = document.getElementById('auth-form');
    if (form) form.addEventListener('submit', async (e) => { e.preventDefault(); await this.handleSubmit(); });
    const switchToRegister = document.getElementById('btn-switch-to-register');
    const switchToLogin = document.getElementById('btn-switch-to-login');
    if (switchToRegister) switchToRegister.addEventListener('click', () => { router.navigate('/register'); });
    if (switchToLogin) switchToLogin.addEventListener('click', () => { router.navigate('/'); });
  },

  async handleSubmit() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name')?.value.trim() || '';
    const errorEl = document.getElementById('auth-error');
    const submitBtn = document.getElementById('auth-submit');
    const isRegister = window.location.pathname === '/register';

    if (!email || !password) {
      if (errorEl) { errorEl.textContent = 'Email dan Password wajib diisi'; errorEl.classList.remove('hidden'); }
      return;
    }
    if (errorEl) errorEl.classList.add('hidden');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Loading...'; }

    try {
      if (isRegister) {
        const { data, error } = await authService.register(email, password, name);
        if (error) throw error;
        if (errorEl) { errorEl.textContent = '✅ Registrasi berhasil! Silakan cek email untuk verifikasi.'; errorEl.classList.remove('hidden'); errorEl.classList.remove('text-red-600'); errorEl.classList.add('text-green-600'); }
      } else {
        const { data, error } = await authService.login(email, password);
        if (error) throw error;
      }
    } catch (err) {
      if (errorEl) { errorEl.textContent = err.message || 'Terjadi kesalahan. Coba lagi.'; errorEl.classList.remove('hidden'); }
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = isRegister ? 'Daftar' : 'Masuk'; }
    }
  }
};