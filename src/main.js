import './index.css';
import { authService } from './js/services/auth.js';
import { app } from './js/app.js';

const appEl = document.getElementById('app');

app.init().then(() => {
  console.log('[Finance Dashboard] App initialized.');
}).catch((err) => {
  console.error('[Finance Dashboard] Init error:', err);
  if (appEl) {
    appEl.innerHTML = `
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h1>
          <p class="text-gray-500">${err.message || 'Gagal menginisialisasi aplikasi. Cek koneksi Supabase.'}</p>
        </div>
      </div>
    `;
  }
});
