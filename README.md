# Personal Finance Dashboard

## Deskripsi
Aplikasi web manajemen keuangan pribadi berbasis JavaScript. Membantu pengguna mencatat, memantau, menganalisis, dan mengelola keuangan pribadi melalui dashboard interaktif.

## Teknologi yang Digunakan

### Core
| Teknologi | Versi | Fungsi | Status |
|-----------|-------|--------|--------|
| Vite | ^5.2.0 | Build tool & dev server | ✅ Selesai |
| JavaScript | ES Modules | Bahasa pemrograman utama | ✅ Selesai |
| HTML5 | - | Struktur halaman | ✅ Selesai |
| Tailwind CSS | ^4.3.3 | Styling & responsive design | ✅ Selesai |

### Backend & Data
| Teknologi | Fungsi | Status |
|-----------|--------|--------|
| Supabase | Authentication, PostgreSQL database, RLS, Storage | 🔄 Belum |
| Supabase Auth | Register, Login, Logout, Reset Password | 🔄 Belum |
| PostgreSQL | Penyimpanan data dengan Row Level Security | 🔄 Belum |

### Libraries
| Teknologi | Versi | Fungsi | Status |
|-----------|-------|--------|--------|
| Chart.js | ^4.4.0 | Visualisasi grafik (line, bar, doughnut) | 🔲 Belum |
| SheetJS (xlsx) | ^0.18.5 | Import & export file Excel (.xlsx, .csv) | 🔲 Belum |
| Tesseract.js | ^5.0.4 | OCR - pembacaan teks dari gambar struk | 🔲 Belum |
| DOMPurify | ^3.1.6 | Keamanan - sanitasi HTML input | 🔲 Belum |

## Struktur Project

```
personal-finance-dashboard/
├── index.html              ← File utama HTML (entry point)
├── package.json            ← Dependency & script commands
├── vite.config.js          ← Konfigurasi Vite (port, plugin Tailwind)
├── .env.example            ← Template variabel environment (Supabase)
├── .env                    ← Environment variables (isi sendiri)
├── .gitignore              ← File yang tidak di-commit ke Git
├── public/                 ← File statis (favicon, gambar)
└── src/
    ├── main.js             ← Titik masuk JavaScript
    ├── index.css           ← Styles (hanya berisi @import "tailwindcss")
    └── js/
        ├── app.js          ← Inisialisasi aplikasi utama
        ├── router.js       ← Client-side routing
        ├── store.js        ← Manajemen state global
        ├── components/     ← Komponen UI yang bisa dipakai ulang
        │   ├── sidebar.js      ← Sidebar navigasi
        │   ├── topbar.js       ← Topbar header
        │   ├── dashboard.js    ← Komponen dashboard
        │   ├── transaction.js  ← Komponen transaksi
        │   ├── chart.js        ← Komponen grafik Chart.js
        │   └── ...
        ├── pages/          ← Halaman aplikasi
        │   ├── dashboard.js
        │   ├── transactions.js
        │   ├── accounts.js
        │   ├── categories.js
        │   ├── budgets.js
        │   ├── goals.js
        │   ├── reports.js
        │   └── settings.js
        ├── services/       ← Layanan API & integrasi
        │   ├── supabase.js     ← Client Supabase
        │   ├── auth.js         ← Layanan autentikasi
        │   ├── transaction.js  ← CRUD transaksi
        │   ├── account.js      ← CRUD akun
        │   ├── category.js     ← CRUD kategori
        │   ├── budget.js       ← CRUD budget
        │   ├── goal.js         ← CRUD target
        │   ├── export.js       ← Excel export
        │   └── ocr.js          ← OCR receipt scanning
        └── utils/          ← Fungsi bantu
            ├── helpers.js      ← Utility umum
            ├── format.js       ← Format rupiah, tanggal, dll
            └── validators.js   ← Validasi input
```

## Cara Menjalankan

### Prasyarat
- **Node.js** versi 18 atau lebih tinggi
- **npm** (tersedia otomatis saat install Node.js)

### Instalasi
```bash
# 1. Install dependency
npm install

# 2. Jalankan dev server
npm run dev

# 3. Buka browser ke http://localhost:5173

# 4. Build untuk produksi
npm run build

# 5. Preview build produksi
npm run preview
```

## Konfigurasi Tailwind CSS v4

**Cara kerja Tailwind v4 berbeda dari v3:**
- **Tidak ada `tailwind.config.js`** — konfigurasi langsung di CSS
- **Tidak ada `@tailwind base/components/utilities`** — cukup `@import "tailwindcss"`
- **Menggunakan `@tailwindcss/vite` plugin** — memproses Tailwind di Vite

File konfigurasi:
- `src/index.css` — hanya berisi `@import "tailwindcss"`
- `vite.config.js` — menambahkan plugin `@tailwindcss/vite`
- `postcss.config.js` — **tidak diperlukan**
- `tailwind.config.js` — **tidak diperlukan**

## Konfigurasi Supabase
*(Belum dikerjakan - Nomor 3)*

1. Buat akun di [https://supabase.com](https://supabase.com)
2. Buat project baru
3. Buka **Settings > API**
4. Salin **URL** dan **anon key**
5. Buat file `.env` di root project:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
6. Tambahkan script tag Supabase CDN di `index.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

## Fitur yang Direncanakan

### Nomor 1: Setup Project JavaScript ✅
- Vite ^5.2.0 sebagai build tool & dev server
- ES Modules (`import/export`)
- Struktur folder: `src/js/{components,pages,services,utils,store}`
- `package.json`, `vite.config.js`, `index.html`, `src/main.js`
- Dev server berjalan di `http://localhost:5173`

### Nomor 2: Setup Tailwind CSS v4 ✅
- Tailwind CSS v4.3.3
- Plugin `@tailwindcss/vite` untuk integrasi dengan Vite
- File `src/index.css` berisi `@import "tailwindcss"`
- Tidak perlu `tailwind.config.js` atau `postcss.config.js`
- Styling responsive: `bg-gray-50`, `flex`, `font-bold`, `text-gray-800`, dll.

### Nomor 3: Setup Supabase 🔄 Belum
- Install `@supabase/supabase-js` via CDN atau npm
- Buat akun di supabase.com
- Buat project, dapatkan URL dan anon key
- Konfigurasi `.env`

### Nomor 4-18: Fitur Lainnya 🔲 Belum
- Authentication (Register, Login, Logout)
- Database + RLS (PostgreSQL)
- Layout Dashboard
- Accounts, Categories, Transactions
- Dashboard Statistics
- Chart.js (Grafik harian, kategori, income vs expense)
- Budget (Buat budget, progres, warning)
- Goals (Buat target tabungan)
- Reports (Laporan bulanan)
- Excel Export (Download laporan .xlsx)
- Excel Import (Upload .xlsx / .csv)
- OCR (Scan struk via kamera/gambar)
- Insights (Analisis otomatis)

### Phase 2 (Setelah MVP Stabil)
- Excel Import (preview & edit)
- Receipt OCR
- Recurring Transactions
- Spending Pattern Analysis
- Savings Rate Calculation
- Financial Health Score
- Automatic Insights
- Advanced Reports

### Phase 3 (Masa Depan)
- AI Financial Assistant
- Better OCR Parser
- Advanced Forecasting
- Progressive Web App (PWA)
- Offline Support
- Mobile Application
- Bank/API Integration

## Database Schema

Tabel yang akan dibuat di Supabase PostgreSQL:
- `profiles` - Profil pengguna
- `accounts` - Sumber uang (bank, e-wallet, cash)
- `categories` - Kategori transaksi buatan pengguna
- `transactions` - Catatan transaksi utama
- `transaction_items` - Detail item per transaksi expense
- `transfers` - Transfer antar akun
- `budgets` - Batas pengeluaran per kategori
- `goals` - Target tabungan
- `recurring_transactions` - Transaksi berulang

Semua tabel memiliki kolom `user_id` dan menggunakan **Row Level Security (RLS)** untuk isolasi data antar pengguna.

## Prinsip Desain
- **Input once, understand everywhere** - Data dimasukkan sekali, digunakan di semua fitur
- **Responsive** - Desktop, Laptop, Tablet, Mobile
- **Clean SaaS Dashboard** - Minimal, readable, rapi
- **Semi-Automatis** - Tidak terhubung bank langsung (versi awal)

## Keamanan
- Semua data diisolasi per pengguna (RLS)
- Tidak menyimpan password sendiri
- Authentication via Supabase
- Tidak meminta data rekening bank
- File receipt terisolasi per user

## Metrik Sukses MVP
- Jumlah pengguna aktif
- Jumlah transaksi tercatat
- Jumlah transaksi per user
- Jumlah laporan di-download
- Jumlah penggunaan import Excel
- Jumlah penggunaan OCR
- Jumlah goal yang dibuat
- Jumlah budget yang dibuat
- Feedback utama: "Apakah pengguna merasa aplikasi membantu mereka memahami ke mana uang mereka pergi?"

## Target Pengguna
- Penggunaan pribadi
- ±20 pengguna untuk uji coba publik
- Satu akun = satu profil keuangan pribadi

## Lisensi
Proprietary - Personal Use

## Developer Notes
- Gunakan `npm run dev` untuk development
- Gunakan `npm run build` untuk produksi
- Selalu gunakan `.env` untuk credential Supabase (jangan commit ke Git)
- Semua kode JavaScript menggunakan ES Modules (`import/export`)
- Folder `src/js/components/` berisi komponen yang bisa dipakai ulang
- Folder `src/js/pages/` berisi halaman aplikasi
- Folder `src/js/services/` berisi semua panggilan API
- Folder `src/js/store.js` adalah state manager sederhana
- Folder `src/js/router.js` adalah client-side router
- Semua data transaksi harus memiliki `source` field: `manual`, `excel`, atau `receipt`
- Tailwind v4 menggunakan `@import "tailwindcss"` di CSS, bukan `@tailwind` directives
- Tidak ada `tailwind.config.js` atau `postcss.config.js` di project ini
- File CSS Tailwind diproses oleh `@tailwindcss/vite` plugin di Vite
