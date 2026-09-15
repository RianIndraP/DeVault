import { authService } from '../services/auth.js';
import { accountService } from '../services/database.js';
import { transactionService } from '../services/database.js';
import { categoryService } from '../services/database.js';
import { budgetService } from '../services/database.js';
import { goalService } from '../services/database.js';

export const dashboardPage = {
  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    const user = await authService.getCurrentUser();
    const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
    container.innerHTML = `
      <div>
        <div class="page-head">
          <h1>Dashboard</h1>
          <p>Selamat datang, ${displayName}! 👋</p>
        </div>
        <div class="hero">
          <div class="hero-top">
            <div>
              <div class="hero-label">Total Saldo</div>
              <div class="hero-amount" id="stat-balance">Rp 0</div>
              <div class="hero-sub">Berikut ringkasan keuangan bulan ini</div>
            </div>
            <canvas id="sparkline" class="sparkline" width="180" height="52"></canvas>
          </div>
          <div class="hero-strip">
            <div class="hero-metric">
              <div class="lbl"><span class="swatch" style="background:#F59E0B"></span> Tabungan Bersih</div>
              <div class="hero-amount" id="stat-net" style="font-size:17px">Rp 0</div>
            </div>
            <div class="hero-metric">
              <div class="lbl"><span class="swatch" style="background:#10B981"></span> Pemasukan</div>
              <div class="hero-amount" id="stat-income" style="font-size:17px">Rp 0</div>
            </div>
            <div class="hero-metric">
              <div class="lbl"><span class="swatch" style="background:#EF4444"></span> Pengeluaran</div>
              <div class="hero-amount" id="stat-expense" style="font-size:17px">Rp 0</div>
            </div>
            <div class="hero-metric">
              <div class="lbl"><span class="swatch" style="background:#0EA5E9"></span> Target Tabungan</div>
              <div class="hero-amount" id="stat-savings" style="font-size:17px">Rp 0</div>
            </div>
          </div>
        </div>
        <div class="stat-grid">
          <div class="tile">
            <div class="tile-accent" style="background:var(--accent)"></div>
            <div class="tile-label">Total Saldo</div>
            <div class="tile-value num" id="tile-balance">Rp 0</div>
            <div class="tile-note">Di semua akun</div>
          </div>
          <div class="tile">
            <div class="tile-accent" style="background:var(--income)"></div>
            <div class="tile-label">Pemasukan</div>
            <div class="tile-value num" id="tile-income">Rp 0</div>
            <div class="tile-note">Bulan ini</div>
          </div>
          <div class="tile">
            <div class="tile-accent" style="background:var(--expense)"></div>
            <div class="tile-label">Pengeluaran</div>
            <div class="tile-value num" id="tile-expense">Rp 0</div>
            <div class="tile-note">Bulan ini</div>
          </div>
          <div class="tile">
            <div class="tile-accent" style="background:var(--accent-2)"></div>
            <div class="gauge-row">
              <div class="gauge" style="background:var(--accent-soft)">
                <div class="gauge-inner num" id="tile-health">0%</div>
              </div>
              <div style="flex:1">
                <div class="tile-label">Kesehatan Keuangan</div>
                <div class="bar-track"><div class="bar-fill" id="health-bar" style="width:0%;background:var(--accent)"></div></div>
              </div>
            </div>
          </div>
        </div>
        <div class="grid-2">
          <div class="card">
            <div class="card-head">
              <h3>Ringkasan Akun</h3>
              <span class="tag">${displayName}</span>
            </div>
            <div id="dashboard-accounts">
              <div style="color:var(--text-faint);font-size:13px">Memuat akun...</div>
            </div>
          </div>
          <div class="card">
            <div class="card-head">
              <h3>Aktivitas Terakhir</h3>
              <span class="tag">5 terbaru</span>
            </div>
            <div id="dashboard-activity">
              <div style="color:var(--text-faint);font-size:13px">Memuat...</div>
            </div>
          </div>
        </div>
        <div class="grid-2 rev">
          <div class="card">
            <div class="card-head">
              <h3>Budget & Target</h3>
              <span class="tag">Bulan ini</span>
            </div>
            <div id="dashboard-budgets">
              <div style="color:var(--text-faint);font-size:13px">Memuat...</div>
            </div>
          </div>
          <div class="card">
            <div class="card-head">
              <h3>Wawasan</h3>
              <span class="tag">Insight</span>
            </div>
            <div class="insight-grid" id="dashboard-insights">
              <div class="insight-card"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg><p>Total pemasukan dan pengeluaran bulan ini akan ditampilkan di sini</p></div>
              <div class="insight-card"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg><p>Tren pengeluaran bulan berjalan akan ditampilkan di sini</p></div>
              <div class="insight-card"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><p>Waktu terbaik untuk mencatat transaksi akan ditampilkan di sini</p></div>
            </div>
          </div>
        </div>
      </div>
    `;
    await this.loadStatistics();
    await this.loadAccounts();
    await this.loadActivity();
    await this.loadBudgets();
    await this.loadGoals();
    await this.drawSparkline();
  },

  async loadStatistics() {
    const { data: accounts } = await accountService.getAll();
    const { data: transactions } = await transactionService.getAll();
    const accountList = accounts || [];
    const txList = transactions || [];
    const totalBalance = accountList.reduce((sum, a) => sum + Number(a.current_balance || 0), 0);
    const income = txList.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expense = txList.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const net = income - expense;
    const el = (id) => document.getElementById(id);
    if (el('stat-balance')) el('stat-balance').textContent = `Rp ${totalBalance.toLocaleString('id-ID')}`;
    if (el('stat-income')) el('stat-income').textContent = `Rp ${income.toLocaleString('id-ID')}`;
    if (el('stat-expense')) el('stat-expense').textContent = `Rp ${expense.toLocaleString('id-ID')}`;
    if (el('stat-net')) el('stat-net').textContent = `Rp ${net.toLocaleString('id-ID')}`;
    if (el('tile-balance')) el('tile-balance').textContent = `Rp ${totalBalance.toLocaleString('id-ID')}`;
    if (el('tile-income')) el('tile-income').textContent = `Rp ${income.toLocaleString('id-ID')}`;
    if (el('tile-expense')) el('tile-expense').textContent = `Rp ${expense.toLocaleString('id-ID')}`;
    const health = totalBalance > 0 ? Math.min(100, Math.round((net / totalBalance) * 100)) : 0;
    if (el('tile-health')) el('tile-health').textContent = `${health}%`;
    if (el('health-bar')) el('health-bar').style.width = `${health}%`;
  },

  async loadAccounts() {
    const { data, error } = await accountService.getAll();
    const container = document.getElementById('dashboard-accounts');
    if (!container) return;
    if (error || !data) { container.innerHTML = '<p style="color:var(--danger);font-size:13px">Gagal memuat akun</p>'; return; }
    if (!data.length) { container.innerHTML = '<p style="color:var(--text-faint);font-size:13px">Belum punya akun. Buat akun pertama di menu Akun.</p>'; return; }
    container.innerHTML = data.map(a => `
      <div class="acct-row">
        <div class="flex items-center gap-3">
          <div class="acct-icon" style="background:var(--accent-soft);color:var(--accent)">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>
          </div>
          <div>
            <div class="acct-name">${a.name}</div>
            <div class="acct-type">${a.type === 'bank' ? 'Bank' : a.type === 'e_wallet' ? 'E-Wallet' : a.type === 'cash' ? 'Cash' : 'Lainnya'}</div>
          </div>
        </div>
        <span class="acct-bal num">Rp ${Number(a.current_balance).toLocaleString('id-ID')}</span>
      </div>
    `).join('');
  },

  async loadActivity() {
    const { data, error } = await transactionService.getAll();
    const { data: categories } = await categoryService.getAll();
    const container = document.getElementById('dashboard-activity');
    if (!container) return;
    if (error || !data) { container.innerHTML = '<p style="color:var(--danger);font-size:13px">Gagal memuat aktivitas</p>'; return; }
    if (!data.length) { container.innerHTML = '<p style="color:var(--text-faint);font-size:13px">Belum ada transaksi. Mulai catat transaksi pertama!</p>'; return; }
    const catMap = {};
    (categories || []).forEach(c => { catMap[c.id] = c.name; });
    const recent = data.slice(0, 5).sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = recent.map(t => `
      <div class="activity-row">
        <div class="act-icon" style="background:${t.type === 'income' ? 'var(--income-soft)' : t.type === 'expense' ? 'var(--expense-soft)' : 'var(--transfer-soft)'};color:${t.type === 'income' ? 'var(--income)' : t.type === 'expense' ? 'var(--expense)' : 'var(--transfer)'}">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${t.type === 'income' ? '<path d="M12 5v14M5 12l7-7 7 7"/>' : t.type === 'expense' ? '<path d="M12 19V5M5 12l7 7 7-7"/>' : '<path d="M7 16l5-5 5 5M7 9l5 5 5-5"/>'}</svg>
        </div>
        <div style="flex:1;min-width:0">
          <div class="act-name">${t.description || '-'}</div>
          <div class="act-meta">${catMap[t.category_id] || 'N/A'} · ${new Date(t.date).toLocaleDateString('id-ID')}<span class="src-pill">${t.type}</span></div>
        </div>
        <span class="act-amt num" style="color:${t.type === 'income' ? 'var(--income)' : t.type === 'expense' ? 'var(--expense)' : 'var(--transfer)'}">${t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString('id-ID')}</span>
      </div>
    `).join('');
  },

  async loadBudgets() {
    const { data: budgets, error } = await budgetService.getAll();
    const { data: categories } = await categoryService.getAll();
    const { data: transactions } = await transactionService.getAll();
    const catMap = {};
    (categories || []).forEach(c => { catMap[c.id] = c; });
    const txList = transactions || [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const monthTx = txList.filter(t => { const d = new Date(t.date); return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear; });
    const container = document.getElementById('dashboard-budgets');
    if (!container) return;
    if (error || !budgets) { container.innerHTML = '<p style="color:var(--danger);font-size:13px">Gagal memuat budget</p>'; return; }
    if (!budgets.length) { container.innerHTML = '<p style="color:var(--text-faint);font-size:13px">Belum ada budget. Buat di menu Budget.</p>'; return; }
    container.innerHTML = budgets.map(b => {
      const spent = monthTx.filter(t => t.category_id === b.category_id && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
      const left = Number(b.amount || 0) - spent;
      const pct = Number(b.amount) > 0 ? Math.round((spent / Number(b.amount)) * 100) : 0;
      const status = pct >= 100 ? 'EXCEEDED' : pct >= 80 ? 'WARNING' : 'SAFE';
      const statusColor = status === 'EXCEEDED' ? 'var(--danger)' : status === 'WARNING' ? 'var(--warning)' : 'var(--income)';
      const statusBg = status === 'EXCEEDED' ? 'var(--danger-soft)' : status === 'WARNING' ? 'var(--warning-soft)' : 'var(--income-soft)';
      const color = catMap[b.category_id]?.color || '#999';
      return `<div class="budget-item">
        <div class="bi-top">
          <span class="bi-cat"><span class="cat-dot" style="background:${color}"></span>${catMap[b.category_id]?.name || 'N/A'}</span>
          <span class="bi-status" style="background:${statusBg};color:${statusColor}">${status}</span>
        </div>
        <div class="bi-figures">Rp ${Number(b.amount).toLocaleString('id-ID')} · Terpakai Rp ${spent.toLocaleString('id-ID')}</div>
        <div class="bar-track" style="margin-top:6px"><div class="bar-fill" style="width:${pct}%;background:${statusColor}"></div></div>
        <div class="bi-remaining">Sisa: Rp ${Math.max(0, left).toLocaleString('id-ID')}</div>
      </div>`;
    }).join('');
  },

  async loadGoals() {
    const { data: goals, error } = await goalService.getAll();
    const container = document.getElementById('dashboard-budgets');
    if (!container) return;
    if (error || !goals) return;
    if (!goals.length) return;
    const existing = container.querySelector('.budget-item');
    if (goals.length) {
      const goalsHtml = goals.map(g => {
        const pct = g.target_amount > 0 ? Math.round((Number(g.current_amount || 0) / Number(g.target_amount)) * 100) : 0;
        const left = Number(g.target_amount || 0) - Number(g.current_amount || 0);
        return `<div class="goal-item">
          <div class="bi-top">
            <span class="bi-cat">🎯 ${g.name}</span>
            <span class="bi-status" style="background:var(--accent-soft);color:var(--accent)">${pct >= 100 ? 'COMPLETE' : 'IN PROGRESS'}</span>
          </div>
          <div class="bi-figures">Rp ${Number(g.current_amount || 0).toLocaleString('id-ID')} / Rp ${Number(g.target_amount).toLocaleString('id-ID')}</div>
          <div class="bar-track" style="margin-top:6px"><div class="bar-fill" style="width:${Math.min(pct,100)}%;background:var(--accent)"></div></div>
          <div class="bi-remaining">Sisa: Rp ${Math.max(0, left).toLocaleString('id-ID')}</div>
        </div>`;
      }).join('');
      const existingGoals = container.querySelectorAll('.goal-item');
      existingGoals.forEach(e => e.remove());
      container.insertAdjacentHTML('beforeend', goalsHtml);
    }
  },

  drawSparkline() {
    const canvas = document.getElementById('sparkline');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const data = Array.from({length: 12}, () => Math.random() * 0.6 + 0.2);
    const max = Math.max(...data);
    const points = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - (v / max) * (h - 4) - 2 }));
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
    });
  }
};