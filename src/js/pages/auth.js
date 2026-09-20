import { authService } from '../services/auth.js';
import { icon } from '../components/icons.js';

export const authPage = {
  mode: 'login',

  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    this.mode = window.location.pathname === '/register' ? 'register' : 'login';

    container.innerHTML = `
      <div class="min-h-screen flex" style="background:var(--canvas); color:var(--ink)">

        <!-- PANEL BRAND (selalu gelap — identitas brand, tidak ikut toggle tema) -->
        <aside class="hidden lg:flex lg:w-[44%] xl:w-2/5 relative flex-col justify-between p-10 xl:p-14 dot-grid"
               style="background:radial-gradient(120% 120% at 0% 0%, #3646A8 0%, #171B33 55%, #10121F 100%);">
          <div class="relative z-10 flex items-center gap-2.5">
            <span class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style="background:rgba(255,255,255,.14); color:#fff;">Rp</span>
            <span class="font-display text-xl font-semibold text-white">Dompetku</span>
          </div>

          <div class="relative z-10 max-w-sm">
            <h1 class="font-display text-3xl xl:text-4xl font-semibold text-white leading-tight">Keuanganmu, dalam satu genggaman.</h1>
            <p class="mt-4 text-sm leading-relaxed" style="color:rgba(255,255,255,.72)">Catat transaksi, atur budget, dan kejar target tabunganmu — semua akun (bank, e-wallet, tunai) terangkum rapi di satu dashboard.</p>

            <ul class="mt-8 space-y-4">
              <li class="flex items-start gap-3">
                <span class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background:rgba(255,255,255,.1); color:#fff">${icon('shield', 'w-4 h-4')}</span>
                <div><p class="text-sm font-medium text-white">Data tersimpan aman</p><p class="text-xs mt-0.5" style="color:rgba(255,255,255,.6)">Transaksi dan saldo akunmu terenkripsi end-to-end.</p></div>
              </li>
              <li class="flex items-start gap-3">
                <span class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background:rgba(255,255,255,.1); color:#fff">${icon('plus', 'w-4 h-4')}</span>
                <div><p class="text-sm font-medium text-white">Catat dalam hitungan detik</p><p class="text-xs mt-0.5" style="color:rgba(255,255,255,.6)">Tambah transaksi dan pantau budget secepat mengetik.</p></div>
              </li>
              <li class="flex items-start gap-3">
                <span class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background:rgba(255,255,255,.1); color:#fff">${icon('dashboard', 'w-4 h-4')}</span>
                <div><p class="text-sm font-medium text-white">Satu tempat untuk semua akun</p><p class="text-xs mt-0.5" style="color:rgba(255,255,255,.6)">Bank, e-wallet, dan tunai — jadi satu dashboard yang sama.</p></div>
              </li>
            </ul>
          </div>

          <p class="relative z-10 text-xs" style="color:rgba(255,255,255,.45)">© 2026 Dompetku. Seluruh hak cipta dilindungi.</p>
        </aside>

        <!-- PANEL FORM -->
        <main class="flex-1 flex flex-col">
          <div class="flex items-center justify-between p-5 lg:p-8">
            <div class="flex items-center gap-2 lg:hidden">
              <span class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style="background:var(--indigo); color:#fff;">Rp</span>
              <span class="font-display text-lg font-semibold">Dompetku</span>
            </div>
            <div class="lg:ml-auto">
              <button id="auth-theme-btn" class="p-2 rounded-lg focus-ring btn-press" style="border:1px solid var(--border); color:var(--ink-muted);" aria-label="Ubah tema">
                <span id="auth-icon-sun">${icon('sun', 'w-5 h-5')}</span>
                <span id="auth-icon-moon" class="hidden">${icon('moon', 'w-5 h-5')}</span>
              </button>
            </div>
          </div>

          <div class="flex-1 flex items-center justify-center px-5 pb-10">
            <div class="w-full max-w-sm">

              <div class="grid grid-cols-2 gap-1 p-1 rounded-xl mb-6" style="background:var(--surface-alt);">
                <button id="tab-login" class="tab-btn text-sm font-semibold py-2 rounded-lg focus-ring btn-press" data-mode="login">Masuk</button>
                <button id="tab-register" class="tab-btn text-sm font-semibold py-2 rounded-lg focus-ring btn-press" data-mode="register">Daftar</button>
              </div>

              <div id="mode-heading"></div>

              <div id="form-alert" class="hidden mt-4 rounded-lg px-3.5 py-2.5 text-sm flex items-start gap-2"></div>

              <form id="auth-form" class="mt-5 space-y-4" novalidate>
                <div id="name-field" class="hidden">
                  <label for="auth-name" class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Nama lengkap</label>
                  <input id="auth-name" type="text" autocomplete="name" placeholder="Nama kamu"
                    class="w-full px-3.5 py-2.5 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink);" />
                  <p class="hidden text-xs mt-1 field-error-text"></p>
                </div>

                <div id="email-wrap">
                  <label for="auth-email" class="block text-xs font-medium mb-1" style="color:var(--ink-muted)">Email</label>
                  <input id="auth-email" type="email" autocomplete="email" placeholder="kamu@email.com"
                    class="w-full px-3.5 py-2.5 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink);" />
                  <p class="hidden text-xs mt-1 field-error-text"></p>
                </div>

                <div id="password-wrap">
                  <div class="flex items-center justify-between mb-1">
                    <label for="auth-password" class="block text-xs font-medium" style="color:var(--ink-muted)">Password</label>
                    <a href="#" id="forgot-link" class="text-xs font-medium focus-ring" style="color:var(--indigo)">Lupa password?</a>
                  </div>
                  <div class="relative">
                    <input id="auth-password" type="password" autocomplete="current-password" placeholder="Minimal 8 karakter"
                      class="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm focus-ring" style="border:1px solid var(--border); background:var(--surface-alt); color:var(--ink);" />
                    <button type="button" id="toggle-pw" class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded focus-ring" style="color:var(--ink-muted)" aria-label="Tampilkan password">
                      <span id="eye-open">${icon('eye', 'w-4 h-4')}</span>
                      <span id="eye-closed" class="hidden">${icon('eyeOff', 'w-4 h-4')}</span>
                    </button>
                  </div>
                  <p class="hidden text-xs mt-1 field-error-text"></p>
                  <div id="strength-wrap" class="hidden mt-2">
                    <div class="strength-bar"><div id="strength-fill" class="strength-fill"></div></div>
                    <p id="strength-label" class="text-xs mt-1" style="color:var(--ink-muted)"></p>
                  </div>
                </div>

                <div id="terms-wrap" class="hidden items-start gap-2">
                  <input id="auth-terms" type="checkbox" class="mt-0.5 w-4 h-4 rounded focus-ring" style="accent-color:var(--indigo)" />
                  <label for="auth-terms" class="text-xs leading-relaxed" style="color:var(--ink-muted)">Saya setuju dengan <a href="#" class="font-medium" style="color:var(--indigo)">Ketentuan Layanan</a> dan <a href="#" class="font-medium" style="color:var(--indigo)">Kebijakan Privasi</a> Dompetku.</label>
                </div>

                <label id="remember-wrap" class="flex items-center gap-2 text-xs" style="color:var(--ink-muted)">
                  <input id="remember-me" type="checkbox" class="w-4 h-4 rounded focus-ring" style="accent-color:var(--indigo)" checked />
                  Ingat saya di perangkat ini
                </label>

                <button type="submit" id="auth-submit" class="w-full py-2.5 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 focus-ring btn-press" style="background:var(--indigo)">
                  <span id="auth-submit-text">Masuk</span>
                </button>
              </form>

              <p class="text-center text-xs mt-6" style="color:var(--ink-muted)">Dengan melanjutkan, kamu akan diarahkan ke dashboard Dompetku-mu.</p>
            </div>
          </div>
        </main>
      </div>
    `;

    this.attachEvents();
    this.setMode(this.mode, { skipHistory: true });
  },

  attachEvents() {
    const $ = (sel) => document.querySelector(sel);

    $('#auth-theme-btn').addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      $('#auth-icon-sun').classList.toggle('hidden', isDark);
      $('#auth-icon-moon').classList.toggle('hidden', !isDark);
    });

    $('#tab-login').addEventListener('click', () => this.setMode('login'));
    $('#tab-register').addEventListener('click', () => this.setMode('register'));
    $('#forgot-link').addEventListener('click', (e) => { e.preventDefault(); this.showAlert('info', 'Fitur reset password akan tersedia di versi berikutnya.'); });

    $('#toggle-pw').addEventListener('click', () => {
      const input = $('#auth-password');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      $('#eye-open').classList.toggle('hidden', show);
      $('#eye-closed').classList.toggle('hidden', !show);
    });

    $('#auth-password').addEventListener('input', (e) => {
      if (this.mode !== 'register') return;
      const s = this.strengthOf(this.scorePassword(e.target.value));
      $('#strength-fill').style.width = s.width;
      $('#strength-fill').style.background = s.color;
      $('#strength-label').textContent = e.target.value ? `Kekuatan password: ${s.label || '—'}` : '';
    });

    $('#auth-form').addEventListener('submit', (e) => { e.preventDefault(); this.handleSubmit(); });
  },

  strengthOf(score) {
    const STRENGTH = [
      { label: '', color: 'var(--border)', width: '0%' },
      { label: 'Lemah', color: 'var(--coral)', width: '25%' },
      { label: 'Cukup', color: 'var(--amber)', width: '50%' },
      { label: 'Kuat', color: 'var(--emerald)', width: '75%' },
      { label: 'Sangat kuat', color: 'var(--emerald-strong)', width: '100%' },
    ];
    return STRENGTH[score];
  },

  scorePassword(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  },

  setMode(mode, { skipHistory = false } = {}) {
    this.mode = mode;
    const $ = (sel) => document.querySelector(sel);

    $('#tab-login').classList.toggle('active', mode === 'login');
    $('#tab-register').classList.toggle('active', mode === 'register');
    $('#name-field').classList.toggle('hidden', mode !== 'register');
    $('#terms-wrap').classList.toggle('flex', mode === 'register');
    $('#terms-wrap').classList.toggle('hidden', mode !== 'register');
    $('#remember-wrap').classList.toggle('hidden', mode === 'register');
    $('#forgot-link').classList.toggle('hidden', mode === 'register');
    $('#strength-wrap').classList.toggle('hidden', mode !== 'register');
    $('#auth-submit-text').textContent = mode === 'register' ? 'Buat akun' : 'Masuk';

    const heading = $('#mode-heading');
    heading.innerHTML = mode === 'register'
      ? `<h2 class="font-display text-2xl font-semibold" style="color:var(--ink)">Buat akun baru</h2><p class="text-sm mt-1" style="color:var(--ink-muted)">Mulai kelola keuanganmu di Dompetku.</p>`
      : `<h2 class="font-display text-2xl font-semibold" style="color:var(--ink)">Selamat datang kembali</h2><p class="text-sm mt-1" style="color:var(--ink-muted)">Masuk untuk melanjutkan ke dashboard-mu.</p>`;
    heading.classList.remove('fade-swap'); void heading.offsetWidth; heading.classList.add('fade-swap');

    if (!skipHistory) {
      const path = mode === 'register' ? '/register' : '/login';
      if (window.location.pathname !== path) window.history.pushState({}, '', path);
    }

    this.hideAlert();
    this.clearFieldErrors();
  },

  setFieldError(wrapId, message) {
    const wrap = document.getElementById(wrapId);
    const input = wrap.querySelector('input');
    const errText = wrap.querySelector('.field-error-text');
    wrap.classList.add('field-error');
    errText.textContent = message;
    errText.classList.remove('hidden');
  },

  clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(w => w.classList.remove('field-error'));
    document.querySelectorAll('.field-error-text').forEach(t => { t.classList.add('hidden'); t.textContent = ''; });
  },

  showAlert(type, message) {
    const tone = type === 'success' ? 'emerald' : type === 'error' ? 'coral' : 'indigo';
    const iconKey = type === 'success' ? 'check' : type === 'error' ? 'warning' : 'info';
    const alertEl = document.getElementById('form-alert');
    alertEl.style.background = `var(--${tone}-soft)`;
    alertEl.style.color = `var(--${tone})`;
    alertEl.innerHTML = `<span class="shrink-0">${icon(iconKey, 'w-4 h-4')}</span><span>${message}</span>`;
    alertEl.classList.remove('hidden');
  },

  hideAlert() {
    const alertEl = document.getElementById('form-alert');
    alertEl.classList.add('hidden');
    alertEl.innerHTML = '';
  },

  validate() {
    this.clearFieldErrors();
    let ok = true;
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value.trim();

    if (this.mode === 'register' && !name) { this.setFieldError('name-field', 'Nama wajib diisi.'); ok = false; }
    if (!email) { this.setFieldError('email-wrap', 'Email wajib diisi.'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { this.setFieldError('email-wrap', 'Format email tidak valid.'); ok = false; }

    if (!password) { this.setFieldError('password-wrap', 'Password wajib diisi.'); ok = false; }
    else if (this.mode === 'register' && password.length < 8) { this.setFieldError('password-wrap', 'Minimal 8 karakter.'); ok = false; }

    if (this.mode === 'register' && !document.getElementById('auth-terms').checked) {
      this.showAlert('error', 'Kamu harus menyetujui Ketentuan Layanan untuk mendaftar.'); ok = false;
    }
    return ok;
  },

  async handleSubmit() {
    this.hideAlert();
    if (!this.validate()) return;

    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value.trim();
    const submitBtn = document.getElementById('auth-submit');
    const isRegister = this.mode === 'register';

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span><span>${isRegister ? 'Membuat akun…' : 'Memeriksa…'}</span>`;

    try {
      if (isRegister) {
        const { error } = await authService.register(email, password, name);
        if (error) throw error;
        this.showAlert('success', 'Registrasi berhasil! Silakan masuk dengan akun barumu.');
        document.getElementById('auth-form').reset();
        setTimeout(() => this.setMode('login'), 1400);
      } else {
        const { error } = await authService.login(email, password);
        if (error) throw error;
        this.showAlert('success', 'Berhasil masuk. Mengalihkan ke dashboard…');
        // Redirect & pembangunan ulang shell (sidebar/topbar/tutorial)
        // ditangani otomatis oleh listener onAuthStateChange di app.js.
      }
    } catch (err) {
      this.showAlert('error', err?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span id="auth-submit-text">${this.mode === 'register' ? 'Buat akun' : 'Masuk'}</span>`;
    }
  }
};