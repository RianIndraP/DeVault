import './index.css';
import { supabase } from './js/services/supabase.js';
import { authService } from './js/services/auth.js';

const app = document.getElementById('app');
app.innerHTML = `
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Personal Finance Dashboard</h1>
      <p class="text-gray-500 mb-2">Setup JavaScript + Tailwind CSS v4 + Supabase successful!</p>
      <p id="supabase-status" class="text-sm text-blue-600">Connecting to Supabase...</p>
    </div>
  </div>
`;

supabase.getSession().then(({ data: { session } }) => {
  const statusEl = document.getElementById('supabase-status');
  if (statusEl) {
    if (session) {
      statusEl.textContent = '✅ Supabase terhubung. User: ' + session.user.email;
      statusEl.classList.remove('text-blue-600');
      statusEl.classList.add('text-green-600');
    } else {
      statusEl.textContent = '✅ Supabase terhubung. Belum ada user login.';
      statusEl.classList.remove('text-blue-600');
      statusEl.classList.add('text-green-600');
    }
  }
}).catch(() => {
  const statusEl = document.getElementById('supabase-status');
  if (statusEl) {
    statusEl.textContent = '⚠️ Supabase belum dikonfigurasi. Cek file .env';
    statusEl.classList.remove('text-blue-600');
    statusEl.classList.add('text-red-600');
  }
});

console.log('[Finance Dashboard] JavaScript + Tailwind + Supabase initialized.');