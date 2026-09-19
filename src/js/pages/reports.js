import { transactionService } from '../services/database.js';
import { exportService } from '../services/export.js';
import { icon } from '../components/icons.js';
import { showToast } from '../components/toast.js';

export const reportsPage = {
  _listenersBound: false,
  _importPreview: null,

  async render() {
    const container = document.getElementById('page-container');
    if (!container) return;
    container.innerHTML = `
      <div>
        <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 class="font-display text-3xl font-semibold" style="color:var(--ink)">Laporan</h1>
            <p class="mt-1 text-sm" style="color:var(--ink-muted)">Lihat laporan keuangan per bulan</p>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button id="btn-import-excel" class="text-sm font-medium px-4 py-2 rounded-lg focus-ring btn-press flex items-center gap-1.5" style="background:var(--violet);color:#fff;">
              ${icon('upload', 'w-4 h-4')} Import Excel
            </button>
            <button id="btn-export-excel" class="text-sm font-medium px-4 py-2 rounded-lg focus-ring btn-press flex items-center gap-1.5" style="background:var(--emerald);color:#fff;">
              ${icon('download', 'w-4 h-4')} Export Excel
            </button>
            <button id="btn-export-pdf" class="text-sm font-medium px-4 py-2 rounded-lg focus-ring btn-press flex items-center gap-1.5" style="background:var(--coral);color:#fff;">
              ${icon('file', 'w-4 h-4')} Export PDF
            </button>
          </div>
        </div>
        <div class="card card-hover rounded-2xl p-6 mb-6">
          <div class="flex flex-wrap gap-4 items-end">
            <div>
              <label class="text-xs font-medium block mb-1" style="color:var(--ink-muted)">Bulan</label>
              <select id="report-month" class="w-full rounded-lg px-3 py-2 text-sm outline-none" style="background:var(--surface-alt);border:1px solid var(--border);color:var(--ink)">
                ${Array.from({length:12},(_,i)=>`<option value="${i+1}">${new Date(2024,i).toLocaleString('id-ID',{month:'long'})}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="text-xs font-medium block mb-1" style="color:var(--ink-muted)">Tahun</label>
              <input type="number" id="report-year" class="w-full rounded-lg px-3 py-2 text-sm outline-none" value="${new Date().getFullYear()}" min="2000" max="2030" style="background:var(--surface-alt);border:1px solid var(--border);color:var(--ink)"/>
            </div>
            <button id="btn-generate-report" class="text-sm font-medium px-4 py-2 rounded-lg focus-ring btn-press" style="background:var(--indigo);color:#fff;">Lihat Laporan</button>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" id="report-cards">
          <div class="rounded-xl p-4" style="background:var(--surface-alt)">
            <p class="text-xs" style="color:var(--ink-muted)">Total Pemasukan</p>
            <p class="font-display text-2xl font-semibold mt-0.5" style="color:var(--emerald)" id="report-income">Rp0</p>
          </div>
          <div class="rounded-xl p-4" style="background:var(--surface-alt)">
            <p class="text-xs" style="color:var(--ink-muted)">Total Pengeluaran</p>
            <p class="font-display text-2xl font-semibold mt-0.5" style="color:var(--coral)" id="report-expense">Rp0</p>
          </div>
          <div class="rounded-xl p-4" style="background:var(--surface-alt)">
            <p class="text-xs" style="color:var(--ink-muted)">Net Savings</p>
            <p class="font-display text-2xl font-semibold mt-0.5" style="color:var(--ink)" id="report-net">Rp0</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="card card-hover rounded-2xl p-6">
            <h3 class="font-display text-lg font-semibold mb-4" style="color:var(--ink)">Tren Pengeluaran 6 Bulan</h3>
            <canvas id="report-trend-chart" height="220"></canvas>
          </div>
          <div class="card card-hover rounded-2xl p-6">
            <h3 class="font-display text-lg font-semibold mb-4" style="color:var(--ink)">Ringkasan Kategori</h3>
            <canvas id="report-category-chart" height="220"></canvas>
          </div>
        </div>
        <div class="card card-hover rounded-2xl p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-display text-lg font-semibold" style="color:var(--ink)">Detail Transaksi</h3>
            <span id="report-count" class="text-xs font-medium" style="color:var(--ink-muted)"></span>
          </div>
          <div id="report-details" class="space-y-1">
            <p class="text-sm" style="color:var(--ink-muted)">Pilih bulan dan tahun, lalu klik "Lihat Laporan"</p>
          </div>
        </div>
        <div class="card card-hover rounded-2xl p-6">
          <h3 class="font-display text-lg font-semibold mb-4" style="color:var(--ink)">Ringkasan Kategori</h3>
          <div id="report-category-summary" class="space-y-3">
            <p class="text-sm" style="color:var(--ink-muted)">Pilih bulan dan tahun untuk melihat ringkasan</p>
          </div>
        </div>
        <input type="file" id="import-file-input" accept=".csv,.xlsx" class="hidden" />
      </div>
    `;
    this.attachEvents();
  },

  attachEvents() {
    const btn = document.getElementById('btn-generate-report');
    const btnExcel = document.getElementById('btn-export-excel');
    const btnPdf = document.getElementById('btn-export-pdf');
    const btnImport = document.getElementById('btn-import-excel');
    const fileInput = document.getElementById('import-file-input');
    if (btn) btn.addEventListener('click', () => this.generate());
    if (btnExcel) btnExcel.addEventListener('click', () => this.exportExcel());
    if (btnPdf) btnPdf.addEventListener('click', () => this.exportPDF());
    if (btnImport) btnImport.addEventListener('click', () => fileInput?.click());
    if (fileInput) fileInput.addEventListener('change', (e) => this.handleImport(e));
  },

  async generate() {
    const month = parseInt(document.getElementById('report-month').value);
    const year = parseInt(document.getElementById('report-year').value);
    const { data: transactions, error } = await transactionService.getByMonth(month, year);
    if (error || !transactions) return;
    const income = transactions.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0);
    const net = income - expense;
    const el = (id) => document.getElementById(id);
    if (el('report-income')) el('report-income').textContent = 'Rp' + Math.round(income).toLocaleString('id-ID');
    if (el('report-expense')) el('report-expense').textContent = 'Rp' + Math.round(expense).toLocaleString('id-ID');
    if (el('report-net')) el('report-net').textContent = 'Rp' + Math.round(net).toLocaleString('id-ID');
    const details = document.getElementById('report-details');
    const count = document.getElementById('report-count');
    if (count) count.textContent = `${transactions.length} transaksi`;
    if (!transactions.length) {
      if (details) details.innerHTML = `<div class="rounded-xl p-8 text-center" style="background:var(--surface-alt)"><p class="text-sm" style="color:var(--ink-muted)">Tidak ada transaksi untuk bulan ini</p></div>`;
      const catSum = document.getElementById('report-category-summary');
      if (catSum) catSum.innerHTML = `<p class="text-sm" style="color:var(--ink-muted)">Tidak ada data</p>`;
      this.destroyCharts();
      return;
    }
    if (details) details.innerHTML = transactions.map(t => `
      <div class="flex items-center justify-between py-2.5" style="border-bottom:1px solid var(--border)">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:${t.type==='income'?'var(--emerald-soft)':'var(--coral-soft)'};color:${t.type==='income'?'var(--emerald)':'var(--coral)'}">${icon(t.type,'w-4 h-4')}</span>
          <div>
            <p class="text-sm font-medium" style="color:var(--ink)">${t.description||'-'}</p>
            <p class="text-xs" style="color:var(--ink-muted)">${new Date(t.date).toLocaleDateString('id-ID')} · ${t.category_id||''}</p>
          </div>
        </div>
        <span class="text-sm font-semibold tabular-nums" style="color:${t.type==='income'?'var(--emerald)':'var(--coral)'}">${t.type==='income'?'+':'-'}Rp${Number(t.amount).toLocaleString('id-ID')}</span>
      </div>
    `).join('');
    const catSum = document.getElementById('report-category-summary');
    if (catSum) {
      const catMap = {};
      transactions.filter(t => t.type === 'expense').forEach(t => { catMap[t.category_id] = (catMap[t.category_id]||0) + Number(t.amount); });
      const catNames = {};
      transactions.forEach(t => { if (!catNames[t.category_id]) catNames[t.category_id] = t.category_id; });
      const totalExp = Object.values(catMap).reduce((s,v)=>s+v,0) || 1;
      const colors = ['var(--indigo)','var(--emerald)','var(--coral)','var(--amber)','var(--violet)','var(--ink-muted)'];
      catSum.innerHTML = Object.entries(catMap).map(([catId,amt],i) => `
        <div class="flex items-center justify-between py-2">
          <span class="text-sm" style="color:var(--ink)">${catId}</span>
          <span class="text-sm font-semibold tabular-nums" style="color:var(--ink)">Rp${Math.round(amt).toLocaleString('id-ID')} (${Math.round(amt/totalExp*100)}%)</span>
        </div>
      `).join('') || '<p class="text-sm" style="color:var(--ink-muted)">Tidak ada pengeluaran</p>';
    }
    await this.renderCharts(transactions, month, year);
  },

  async renderCharts(transactions, month, year) {
    if (typeof Chart === 'undefined') {
      document.getElementById('report-trend-chart')?.parentElement?.querySelector('h3')?.insertAdjacentHTML('afterend','<p class="text-sm" style="color:var(--ink-muted)">Chart.js belum dimuat.</p>');
      return;
    }
    const styles = getComputedStyle(document.documentElement);
    const ink = styles.getPropertyValue('--ink').trim();
    const border = styles.getPropertyValue('--border').trim();
    Chart.defaults.color = ink;
    Chart.defaults.borderColor = border;
    Chart.defaults.font.family = 'Inter';
    const catColors = ['#4A5FD1','#1E8F63','#C34C3C','#B6790F','#7C5CD6','#6E6C78'];
    const catMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => { catMap[t.category_id] = (catMap[t.category_id]||0) + Number(t.amount); });
    const catLabels = Object.keys(catMap);
    const catData = Object.values(catMap);
    const catCtx = document.getElementById('report-category-chart');
    if (catCtx) {
      if (this._catChart) this._catChart.destroy();
      this._catChart = new Chart(catCtx, {
        type: 'doughnut',
        data: { labels: catLabels, datasets: [{ data: catData, backgroundColor: catColors.slice(0, catLabels.length), borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { padding: 12, usePointStyle: true } } } }
      });
    }
    const months = [];
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const m = month - i;
      const y = m < 1 ? year - 1 : year;
      const mm = m < 1 ? 12 + m : m;
      const label = new Date(y, mm-1).toLocaleString('id-ID', {month:'short'});
      months.push(label);
      const { data: td } = await transactionService.getByMonth(mm, y);
      const exp = td?.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0) || 0;
      monthlyData.push(Math.round(exp));
    }
    const trendCtx = document.getElementById('report-trend-chart');
    if (trendCtx) {
      if (this._trendChart) this._trendChart.destroy();
      this._trendChart = new Chart(trendCtx, {
        type: 'line',
        data: { labels: months, datasets: [{ label: 'Pengeluaran', data: monthlyData, borderColor: '#C34C3C', backgroundColor: 'rgba(195,76,60,0.1)', fill: true, tension: 0.4, pointRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => 'Rp'+v.toLocaleString('id-ID') } } } }
      });
    }
  },

  destroyCharts() {
    if (this._catChart) { this._catChart.destroy(); this._catChart = null; }
    if (this._trendChart) { this._trendChart.destroy(); this._trendChart = null; }
  },

  async handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name.toLowerCase();
    const text = await file.text();
    if (fileName.endsWith('.csv')) {
      const rows = text.trim().split('\n').slice(1);
      const preview = rows.map(row => {
        const cols = row.split(',');
        return { date: cols[0]?.trim(), description: cols[1]?.trim(), category: cols[2]?.trim(), amount: cols[3]?.trim(), type: cols[4]?.trim() };
      }).filter(r => r.date && r.description && r.amount);
      if (!preview.length) { showToast('Tidak ada data CSV valid.', 'error'); return; }
      this._importPreview = preview;
      const details = document.getElementById('report-details');
      if (details) details.innerHTML = `
        <div class="rounded-xl p-4 mb-3" style="background:var(--surface-alt)">
          <p class="font-semibold mb-2" style="color:var(--ink)">Preview ${preview.length} transaksi (terakhir 5):</p>
          <div class="space-y-1 text-sm" style="color:var(--ink-muted)">
            ${preview.slice(0,5).map(r => `<div class="flex justify-between"><span>${r.date} | ${r.description} | Rp${Number(r.amount).toLocaleString('id-ID')}</span><span class="${r.type==='income'?'color:var(--emerald)':'color:var(--coral)'}">${r.type}</span></div>`).join('')}
          </div>
        </div>
        <button id="btn-confirm-import" class="w-full px-4 py-3 rounded-lg text-white font-medium focus-ring btn-press" style="background:var(--emerald)">Konfirmasi Import ${preview.length} Transaksi</button>
      `;
      const confirmBtn = document.getElementById('btn-confirm-import');
      if (confirmBtn) confirmBtn.addEventListener('click', () => this.confirmImport(preview));
      showToast(`Preview ${preview.length} baris dari CSV`, 'info');
    } else if (fileName.endsWith('.xlsx')) {
      try {
        const XLSX = await import('xlsx');
        const wb = XLSX.read(file, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws);
        const preview = json.slice(0, 50).map(r => ({
          date: r.date || r.tanggal || '',
          description: r.description || r.deskripsi || r.keterangan || '',
          category: r.category || r.kategori || '',
          amount: r.amount || r.jumlah || 0,
          type: r.type || r.tipe || 'expense'
        })).filter(r => r.date && r.description && r.amount);
        if (!preview.length) { showToast('Tidak ada data Excel valid.', 'error'); return; }
        this._importPreview = preview;
        const details = document.getElementById('report-details');
        if (details) details.innerHTML = `
          <div class="rounded-xl p-4 mb-3" style="background:var(--surface-alt)">
            <p class="font-semibold mb-2" style="color:var(--ink)">Preview ${preview.length} transaksi (terakhir 5):</p>
            <div class="space-y-1 text-sm" style="color:var(--ink-muted)">
              ${preview.slice(0,5).map(r => `<div class="flex justify-between"><span>${r.date} | ${r.description} | Rp${Number(r.amount).toLocaleString('id-ID')}</span><span class="${r.type==='income'?'color:var(--emerald)':'color:var(--coral)'}">${r.type}</span></div>`).join('')}
            </div>
          </div>
          <button id="btn-confirm-import" class="w-full px-4 py-3 rounded-lg text-white font-medium focus-ring btn-press" style="background:var(--emerald)">Konfirmasi Import ${preview.length} Transaksi</button>
        `;
        const confirmBtn = document.getElementById('btn-confirm-import');
        if (confirmBtn) confirmBtn.addEventListener('click', () => this.confirmImport(preview));
        showToast(`Preview ${preview.length} baris dari Excel`, 'info');
      } catch (err) { showToast('Gagal parse Excel.', 'error'); }
    } else {
      showToast('Format tidak didukung. Gunakan .csv atau .xlsx', 'error');
    }
  },

  async confirmImport(preview) {
    let success = 0, fail = 0;
    for (const item of preview) {
      const catId = item.category || 'cat1';
      const { error } = await transactionService.create({
        type: item.type || 'expense',
        account_id: 'acc1',
        category_id: catId,
        date: item.date,
        description: item.description,
        amount: parseFloat(item.amount)
      });
      if (!error) success++; else fail++;
    }
    this._importPreview = null;
    showToast(`Import selesai: ${success} berhasil, ${fail} gagal`, success > 0 ? 'success' : 'error');
    this.generate();
  },

  async exportExcel() {
    const month = document.getElementById('report-month').value;
    const year = document.getElementById('report-year').value;
    const { data: transactions } = await transactionService.getByMonth(parseInt(month), parseInt(year));
    if (!transactions || !transactions.length) { showToast('Tidak ada data untuk diekspor.', 'error'); return; }
    try {
      await exportService.exportToExcel(transactions.map(t => ({ date:t.date, description:t.description, type:t.type, amount:Number(t.amount), category_id:t.category_id })));
      showToast('Excel berhasil diekspor!', 'success');
    } catch (e) { showToast('Gagal export Excel.', 'error'); }
  },

  async exportPDF() {
    const month = document.getElementById('report-month').value;
    const year = document.getElementById('report-year').value;
    const { data: transactions } = await transactionService.getByMonth(parseInt(month), parseInt(year));
    if (!transactions || !transactions.length) { showToast('Tidak ada data untuk diekspor.', 'error'); return; }
    try {
      await exportService.exportToPDF();
      showToast('PDF berhasil diekspor!', 'success');
    } catch (e) { showToast('Gagal export PDF.', 'error'); }
  },

};
