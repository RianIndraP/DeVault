# Personal Finance Dashboard

## Deskripsi
Aplikasi web manajemen keuangan pribadi berbasis JavaScript + Supabase. Membantu pengguna mencatat, memantau, menganalisis, dan mengelola keuangan pribadi melalui dashboard interaktif dengan Row Level Security (RLS) untuk isolasi data antar pengguna.

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
| Supabase | Authentication, PostgreSQL database, RLS, Storage | ✅ Selesai |
| Supabase Auth | Register, Login, Logout | ✅ Selesai |
| PostgreSQL | Penyimpanan data dengan Row Level Security (RLS) | ✅ Selesai |

### Libraries
| Teknologi | Versi | Fungsi | Status |
|-----------|-------|--------|--------|
| xlsx | ^0.18.5 | Export file Excel (.xlsx) | ✅ Dependency terpasang |
| jspdf | ^3.0.0 | Export PDF | ✅ Dependency terpasang |
| tesseract.js | ^6.0.0 | OCR - pembacaan teks dari gambar struk | ✅ Dependency terpasang |
| dompurify | ^3.1.6 | Keamanan - sanitasi HTML input | ✅ Dependency terpasang |
| Chart.js | ^4.4.0 | Visualisasi grafik | ✅ Terintegrasi di dashboard |

## Struktur Project

```
personal-finance-dashboard/
├── index.html              ← File utama HTML (entry point + Chart.js CDN)
├── login.html              ← Standalone HTML (standalone login/register page, untuk preview/editing)
├── target.html             ← Standalone HTML (standalone target page, untuk preview/editing)
├── package.json            ← Dependency & script commands
├── vite.config.js          ← Konfigurasi Vite (PostCSS + Tailwind v4)
├── postcss.config.js       ← PostCSS config (@tailwindcss/postcss)
├── .env                    ← Environment variables (Supabase credentials)
├── .env.example            ← Template variabel environment
├── .gitignore              ← File yang tidak di-commit ke Git
├── database.sql            ← Schema SQL Supabase (9 tabel + RLS + triggers)
├── public/                 ← File statis (favicon)
├── dist/                   ← Build output
└── src/
    ├── main.js             ← Titik masuk JavaScript
    ├── index.css           ← Styles (CSS variables + layout classes + Tailwind)
    └── js/
        ├── app.js          ← Inisialisasi aplikasi utama (routing, layout)
        ├── router.js       ← Client-side router
        ├── components/     ← Komponen UI yang bisa dipakai ulang
        │   ├── sidebar.js      ← Sidebar navigasi (updateUser, attachEvents, setOpen, logout)
        │   ├── topbar.js       ← Topbar header (theme toggle, user info)
        │   ├── icons.js        ← Library icon SVG (42+ icons, stroke-width 1.8, viewBox 24x24)
        │   ├── toast.js        ← Shared toast notification component (showToast)
        │   └── tutorial.js     ← Tutorial panel component (setContent, render, setOpen)
        ├── pages/          ← Halaman aplikasi
        │   ├── auth.js         ← Register, Login, Logout
        │   ├── dashboard.js    ← Dashboard: hero, gauge, Chart.js, insights, modal, toast
        │   ├── transactions.js ← CRUD transaksi: stat cards, filters, sort, modal, export, tutorial
        │   ├── accounts.js     ← CRUD akun: stat cards, chips, search, modal, tutorial
        │   ├── categories.js   ← CRUD kategori: grid, search, sort, icons, tutorial
        │   ├── budgets.js      ← Budget per kategori (minimal, placeholder)
        │   ├── goals.js        ← Target tabungan (minimal, placeholder)
        │   ├── recurring.js    ← Transaksi berulang (icon + rupiah from utils)
        │   ├── reports.js      ← Laporan bulanan: Chart.js, Excel/CSV import, export, preview
        │   └── settings.js     ← Pengaturan (minimal, placeholder)
        ├── services/       ← Layanan API & integrasi
        │   ├── supabase.js   ← Client Supabase (createClient)
        │   ├── auth.js       ← Layanan autentikasi (onAuthStateChange)
        │   ├── database.js   ← CRUD service semua tabel (accounts, categories, transactions, budgets, goals, recurring)
        │   ├── export.js     ← Excel/PDF export service (exportToExcel, exportToPDF)
        │   └── ocr.js        ← OCR receipt scanning service (extractFromImage)
        ├── utils.js         ← Shared helper functions (rupiah, withAlpha, categoryIcon, goalIcon, accountIcon, accountTypeLabel)
        └── store/           ← Empty directory (reserved for state management)
```

## Cara Menjalankan

### Prasyarat
- **Node.js** versi 18 atau lebih tinggi
- **npm** (tersedia otomatis saat install Node.js)
- **Akun Supabase** — [https://supabase.com](https://supabase.com)

### Instalasi
```bash
# 1. Install dependency
npm install

# 2. Isi file .env dengan Supabase credentials
#    VITE_SUPABASE_URL=https://your-project.supabase.co
#    VITE_SUPABASE_ANON_KEY=your-anon-key

# 3. Jalankan dev server
npm run dev

# 4. Buka browser ke http://localhost:5173

# 5. Build untuk produksi
npm run build

# 6. Preview build produksi
npm run preview
```

## Konfigurasi Tailwind CSS v4

**Cara kerja Tailwind v4 berbeda dari v3:**
- **Tidak ada `tailwind.config.js`** — konfigurasi langsung di CSS
- **Tidak ada `@tailwind base/components/utilities`** — cukup `@import "tailwindcss"`
- **Menggunakan `@tailwindcss/postcss`** (via PostCSS) untuk memproses Tailwind di Vite

File konfigurasi:
- `src/index.css` — berisi `@import "tailwindcss"` + CSS custom properties
- `vite.config.js` — `css: { postcss: './postcss.config.js' }`
- `postcss.config.js` — berisi `import tailwindcss from '@tailwindcss/postcss'`
- `tailwind.config.js` — **tidak diperlukan**

## Konfigurasi Supabase

### Database Schema
9 tabel dengan RLS lengkap:
- `profiles` — Profil pengguna (id = auth.uid())
- `accounts` — Sumber uang (bank, e-wallet, cash, other)
- `categories` — Kategori transaksi buatan pengguna (icon: SVG path string, bukan emoji)
- `transactions` — Catatan transaksi utama (income, expense, transfer, adjustment)
- `transaction_items` — Detail item per transaksi expense
- `transfers` — Transfer antar akun
- `budgets` — Batas pengeluaran per kategori per bulan
- `goals` — Target tabungan
- `recurring_transactions` — Transaksi berulang

Semua tabel memiliki kolom `user_id` dan menggunakan **Row Level Security (RLS)** untuk isolasi data antar pengguna. `profiles.id` menggunakan `auth.uid()` sehingga FK constraint selalu valid.

### Auto-create Profile Trigger
Profil otomatis dibuat saat user baru mendaftar. `profiles.id` = `auth.uid()` memastikan FK constraint antara `accounts.user_id` dan `profiles.id` selalu terpenuhi.

### Verifikasi
- Buka browser ke `http://localhost:5173`
- Register → Login → Dashboard → navigasi ke semua halaman
- Buat akun, kategori, dan transaksi untuk verifikasi

## Fitur yang Direncanakan

### ✅ Selesai (Fitur Inti — MVP)
- **Nomor 1**: Setup Project JavaScript (Vite 5.2.0, ES Modules, Tailwind v4.3.3 via PostCSS)
- **Nomor 2**: Setup Tailwind CSS v4 dengan PostCSS (tanpa tailwind.config.js)
- **Nomor 3**: Setup Supabase Client & Auth (register, login, logout, onAuthStateChange, getCurrentUser)
- **Nomor 4**: Database + RLS (9 tabel: profiles, accounts, categories, transactions, transaction_items, transfers, budgets, goals, recurring_transactions; policies, triggers, auto-create profile)
- **Nomor 5**: Auth Pages (Register, Login, Logout dengan redirect, protected routes)
- **Nomor 6**: Layout Dashboard (Sidebar navigasi, Topbar header, Responsive, CSS Variables untuk dark/light theme)
- **Nomor 6b**: Dashboard Design — Hero gradient section, SVG health gauge, Chart.js line/bar charts, category breakdown, spending pattern analysis, activity feed dengan search/filter, budget status, goals dengan nabung button, insight otomatis, modal tambah transaksi, toast notifications, IntersectionObserver animate bars
- **Nomor 6c**: Theme Persistence — Dark/light theme disimpan ke localStorage, auto-applied saat load
- **Nomor 6d**: Icons Component — src/js/components/icons.js berisi 42+ SVG icon konsisten (stroke-width 1.8, viewBox 24x24, stroke=currentColor)
- **Nomor 6e**: Toast Component — src/js/components/toast.js dengan `showToast(message, type)` shared utility
- **Nomor 6f**: Tutorial Component — src/js/components/tutorial.js dengan `tutorialPanel.setContent({...})` per halaman
- **Nomor 7-10**: CRUD Pages (accounts.js, categories.js, transactions.js, dashboard.js)
- **Nomor 11-13**: Budget, Goals, Reports pages
- **Nomor 14**: Settings page
- **Nomor 15**: Export Service — exportService.exportToExcel(data) dan exportService.exportToPDF() sudah di-implementasikan di src/js/services/export.js, sudah terintegrasi di reports.js
- **Nomor 16**: OCR Service — ocrService.extractFromImage(imageFile) sudah di-implementasikan di src/js/services/ocr.js

### ✅ Selesai (Tambahan)
- **CSS Variables**: --canvas, --surface, --surface-alt, --border, --ink, --ink-muted, --emerald, --coral, --amber, --indigo, --violet, --shadow untuk light/dark theme native
- **Layout**: app.js pakai background:var(--canvas), margin-left:250px untuk sidebar alignment
- **Components**: sidebar.js, topbar.js pakai CSS variables (bukan Tailwind gray classes)
- **Sidebar**: updateUser(displayName), attachEvents(), setOpen(open), logout() methods
- **Dashboard**: hero gradient, health gauge SVG, Chart.js charts, category breakdown, spending pattern, activity feed, budget status, goals, insights, modal transaksi, toast, global events (search:changed, theme:changed, keydown:Escape)
- **Animations**: .slide-in, .fade-out, .card-hover, .btn-press keyframes di index.css
- **Chart.js**: CDN di index.html, responsive charts dengan CSS variabel colors, empty data handling, period toggle (3/6 bulan)
- **Global Events**: document.addEventListener untuk search:changed, theme:changed, keydown:Escape
- **Health Score**: Rumus savingsScore × 0.65 + budgetScore × 0.35, ditampilkan sebagai SVG gauge
- **Spending Pattern**: Rata-rata pengeluaran harian, hari paling boros/hemat, perbandingan akhir pekan vs hari biasa
- **Automatic Insights**: Insight tentang budget terpakai, pola akhir pekan, target tercapai
- **Shared Utils**: src/js/utils.js berisi rupiah(), withAlpha(), categoryIcon(), goalIcon(), accountIcon(), accountTypeLabel()
- **Shared Toast**: src/js/components/toast.js — showToast(message, 'success'|'error'|'info')
- **Tutorial Panel**: src/js/components/tutorial.js — setContent({eyebrow, title, description, steps, tip}) per halaman
- **Tutorial per Halaman**: accounts.js, transactions.js, categories.js sudah punya tutorialPanel.setContent() spesifik

### 🔲 Belum Dikerjakan (Perlu Integrasi UI)

#### Excel Import
- **Belum di-implementasikan sama sekali**
- exportService.exportToExcel(data) sudah ada di src/js/services/export.js dan sudah terintegrasi di reports.js
- Excel Import (preview & edit sebelum import) masih belum

#### OCR Receipt Scanning
- **OCR Service** — ocrService.extractFromImage(imageFile) sudah ada di src/js/services/ocr.js (menggunakan tesseract.js + dompurify) tapi belum ada tombol/fitur di UI
- **Cara mengintegrasikan**: Tambahkan tombol Scan Struk di halaman transaksi, panggil ocrService.extractFromImage(file), parse hasilnya jadi object transaksi, lalu panggil transactionService.create() otomatis

#### Recurring Transactions
- **Tabel recurring_transactions** sudah ada di database.sql, recurringTransactionService sudah ada di database.js
- **src/js/pages/recurring.js** sudah ada (import icon + rupiah dari utils.js) tapi belum punya tutorialPanel.setContent() dan CRUD interface
- **Apa yang perlu dibuat**: CRUD interface di recurring.js, render di sidebar, dan logika eksekusi berulang

#### Search & Filter Global
- **Dashboard** sudah punya search lokal di activity feed dan category filter
- **Belum ada**: Search & filter global yang menyebar ke semua halaman
- **Apa yang perlu dibuat**: Global search state di app.js, event listener universal, debounce optimization

#### Page-specific Tutorials (belum lengkap)
- **accounts.js** ✅ punya setContent() — cara buat akun
- **transactions.js** ✅ punya setContent() — cara tambah transaksi, filter, sort, export
- **categories.js** ✅ punya setContent() — cara buat kategori, edit, hapus
- **dashboard.js** ❌ belum punya setContent() — akan tampil default "Pilih menu di sidebar" (tambah health info modal)
- **budgets.js** ❌ belum punya setContent() — akan tampil default
- **goals.js** ❌ belum punya setContent() — akan tampil default
- **recurring.js** ❌ belum punya setContent() — akan tampil default (route /recurring sudah terdaftar)
- **reports.js** ❌ belum punya setContent() — akan tampil default
- **settings.js** ❌ belum punya setContent() — akan tampil default

### ✅ Selesai (Sudah Ada di Code tapi Perlu Verifikasi)
- **Savings Rate Calculation** — Sudah ada di dashboard.js totals().savings = (net / income) × 100
- **Financial Health Score** — Sudah ada di dashboard.js healthScore(totals), rumus: savingsScore × 0.65 + budgetScore × 0.35
- **Automatic Insights** — Sudah ada di dashboard.js buildInsights(totals)
- **Spending Pattern Analysis** — Sudah ada di dashboard.js spendingPattern()
- **Category Icon Mapping** — Sudah ada di dashboard.js categoryIcon() dan goalIcon() (di utils.js)
- **Transaction Modal** — Sudah ada di dashboard.js openModal(), closeModal(), submitTransaction()
- **Reports Excel/CSV Import** — Sudah terintegrasi di reports.js dengan preview + confirm
- **Reports Export** — Sudah terintegrasi di reports.js (Excel/PDF)

### Phase 2 (Setelah MVP Stabil)
- Excel Import (preview & edit sebelum import)
- Receipt OCR (implementasi penuh dengan UI scan)
- Recurring Transactions (CRUD + execution)
- Spending Pattern Analysis (detail di halaman reports)
- Savings Rate Calculation (detail di halaman reports)
- Financial Health Score (detail di halaman reports)
- Automatic Insights (detail di halaman reports)
- Advanced Reports (lengkap dengan export, filter, chart)
- Tutorial panel untuk semua halaman

### Phase 3 (Masa Depan)
- AI Financial Assistant
- Better OCR Parser
- Advanced Forecasting
- Progressive Web App (PWA)
- Offline Support
- Mobile Application
- Bank/API Integration

## Prinsip Desain
- **Input once, understand everywhere** - Data dimasukkan sekali, digunakan di semua fitur
- **Responsive** - Desktop, Laptop, Tablet, Mobile
- **Clean SaaS Dashboard** - Minimal, readable, rapi
- **Semi-Automatis** - Tidak terhubung bank langsung (versi awal)
- **Shared Components** - toast.js dan tutorial.js bisa dipakai di semua halaman
- **Per-Page Tutorial** - Setiap halaman memanggil tutorialPanel.setContent() sendiri di render()-nya; kalau belum di-set, otomatis tampil default "Pilih menu di sidebar"

## Keamanan
- Semua data diisolasi per pengguna (RLS)
- `profiles.id` = `auth.uid()` memastikan FK constraint valid
- `db.update()` dan `db.delete()` menyertakan filter `user_id` untuk RLS compliance
- `ensureProfile()` auto-membuat profil sebelum setiap operasi database
- Tidak menyimpan password sendiri
- Authentication via Supabase
- Tidak meminta data rekening bank
- `.env` tidak di-commit ke Git

## Database Schema Detail

### profiles
```
id UUID PRIMARY KEY DEFAULT auth.uid()
user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL
display_name TEXT
avatar_url TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### accounts
```
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
name TEXT NOT NULL
type TEXT CHECK (type IN ('bank', 'e_wallet', 'cash', 'other'))
initial_balance DECIMAL(15,2) DEFAULT 0
current_balance DECIMAL(15,2) DEFAULT 0
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### categories
```
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
name TEXT NOT NULL
icon TEXT DEFAULT '📁' (kini berisi SVG path string, bukan emoji)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### transactions
```
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
account_id UUID REFERENCES accounts(id) ON DELETE SET NULL
category_id UUID REFERENCES categories(id) ON DELETE SET NULL
type TEXT CHECK (type IN ('income', 'expense', 'transfer', 'adjustment'))
date DATE NOT NULL
description TEXT
amount DECIMAL(15,2) NOT NULL CHECK (amount > 0)
source TEXT CHECK (source IN ('manual', 'excel', 'receipt'))
month INTEGER CHECK (month BETWEEN 1 AND 12)
year INTEGER CHECK (year >= 2000)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### transaction_items
```
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL
item_name TEXT NOT NULL
unit_price DECIMAL(15,2) NOT NULL CHECK (unit_price >= 0)
quantity INTEGER NOT NULL CHECK (quantity > 0) DEFAULT 1
unit TEXT DEFAULT 'pcs'
subtotal DECIMAL(15,2) GENERATED ALWAYS AS (unit_price * quantity) STORED
created_at TIMESTAMPTZ
```

### budgets
```
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
category_id UUID REFERENCES categories(id) ON DELETE SET NULL
month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12)
year INTEGER NOT NULL CHECK (year >= 2000)
amount DECIMAL(15,2) NOT NULL CHECK (amount > 0)
UNIQUE(user_id, category_id, month, year)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### goals
```
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
name TEXT NOT NULL
target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0)
current_amount DECIMAL(15,2) DEFAULT 0 CHECK (current_amount >= 0)
deadline DATE
description TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### recurring_transactions
```
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
account_id UUID REFERENCES accounts(id) ON DELETE SET NULL
category_id UUID REFERENCES categories(id) ON DELETE SET NULL
type TEXT CHECK (type IN ('income', 'expense'))
amount DECIMAL(15,2) NOT NULL CHECK (amount > 0)
description TEXT
frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly'))
next_date DATE NOT NULL
active BOOLEAN DEFAULT TRUE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### transfers
```
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
from_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL
to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL
amount DECIMAL(15,2) NOT NULL CHECK (amount > 0)
date DATE NOT NULL
description TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

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

## Catatan Teknis
- Gunakan npm run dev untuk development
- Gunakan npm run build untuk produksi
- Selalu gunakan .env untuk credential Supabase (jangan commit ke Git)
- Semua kode JavaScript menggunakan ES Modules (import/export)
- src/js/components/ berisi komponen UI yang bisa dipakai ulang (sidebar, topbar, icons.js, toast.js, tutorial.js)
- src/js/pages/ berisi halaman aplikasi (auth, dashboard, transactions, accounts, categories, budgets, goals, recurring, reports, settings)
- src/js/services/ berisi semua panggilan API (supabase, auth, database, export, ocr)
- src/js/utils.js berisi helper functions shared (rupiah, withAlpha, categoryIcon, goalIcon, accountIcon, accountTypeLabel)
- src/index.css berisi CSS custom properties untuk dark/light theme dan semua kelas layout dashboard
- src/js/services/export.js — exportToExcel() dan exportToPDF() sudah di-implementasikan dan terintegrasi di reports.js
- src/js/services/ocr.js — extractFromImage() sudah di-implementasikan tapi belum terintegrasi ke UI
- src/js/components/icons.js — library icon SVG dengan fungsi icon(name, cls) untuk render SVG
- localStorage.setItem("theme", "dark"|"light") menyimpan preferensi tema
- document.documentElement.classList.toggle("dark") mengaktifkan tema gelap
- CSS custom properties di :root dan html.dark mendukung dark/light theme
- Semua komponen UI (sidebar, topbar, dashboard) menggunakan CSS variables bukan Tailwind gray classes
- Dashboard menggunakan hero gradient section, health gauge SVG, Chart.js line/bar charts, spending pattern analysis, insight otomatis, modal tambah transaksi, toast notifications
- ensureProfile() dipanggil otomatis sebelum setiap operasi database untuk memastikan profil pengguna ada
- profiles.id menggunakan auth.uid() sehingga FK constraint selalu valid
- Tailwind v4 menggunakan @import "tailwindcss" di CSS, diproses oleh @tailwindcss/postcss di Vite
- vite.config.js memiliki css: { postcss: "./postcss.config.js" } untuk integrasi PostCSS
- postcss.config.js berisi import tailwindcss from '@tailwindcss/postcss'
- Supabase client menggunakan @supabase/supabase-js npm package, bukan CDN
- Semua tabel memiliki RLS policies yang hanya mengizinkan akses oleh user yang bersangkutan
- db.update() dan db.delete() menyertakan eq("user_id", userId) untuk RLS compliance
- Semua data transaksi harus memiliki source field: manual, excel, atau receipt
- database.sql harus dijalankan di Supabase SQL Editor sebelum aplikasi digunakan
- crypto.randomUUID() tidak digunakan lagi — profiles.id menggunakan auth.uid()
- Auto-create profile trigger: on_auth_user_created di auth.users
- Chart.js dimuat via CDN di index.html, tidak via npm
- categories.js kini menggunakan icon() dari icons.js (SVG path) bukan emoji
- categories.js, accounts.js, transactions.js sudah punya tutorialPanel.setContent() spesifik per halaman
- src/js/store/ dan src/js/utils/ adalah direktori kosong yang dicadangkan untuk state management dan utils modular di masa depan
- login.html adalah file HTML standalone untuk halaman login/register, menggunakan Tailwind CDN dan CSS inline
- target.html adalah file HTML standalone untuk halaman target tabungan, menggunakan Tailwind CDN, sidebar, dan icon inline
- src/js/app.js — route /recurring terdaftar, import recurringPage sudah ditambahkan
- src/js/pages/budgets.js — current_amount dihitung dari transaksi (import transactionService), isThisMonth() method ditambahkan
- src/js/pages/dashboard.js — health-info-modal, warna net dinamis (emerald/coral), renderBudgets handle null category_id
- src/js/pages/transactions.js — month/year ditambahkan ke payload Supabase, account_to_id hanya dikirim saat transfer
- src/js/components/icons.js — tambah icon file (PDF export) dan camera (OCR receipt scan)

## Perubahan Terakhir
- **7118796** — fix: budget NaN%, recurring /recurring route, icon file/camera, net color fix, health info modal, transactions month/year payload
- **login.html** & **target.html** — standalone HTML files dibuat untuk preview editing
- **icons.js** — tambah icon file (PDF export) dan camera (OCR receipt scan)

## Git History
- `5ff2cdc` — feat: persist theme preference to localStorage, add icons.js component
- `65b58d4` — feat: dashboard design with hero section, stat tiles, gauge, activity, budgets
- `bb9ee4d` — feat: Step 6 Layout Dashboard
- `fdc8b5d` — docs: update README.md to reflect completed project state
- `312610e` — fix: add ensureProfile() to transactionService methods that bypass db()
- `7adb472` — fix: resolve 409 Conflict by making profiles.id use auth.uid()
- `d2a6b6f` — fix: rewrite transactions.js (was truncated)
- `701c881` — fix: rename data parameter to recordData to avoid ESBuild conflict
- `92ccdcc` — feat: Step 5 Database & RLS complete
- `3970da7` — feat: update icons.js with folder icon and complete SVG set
- `a8be722` — fix: remove setTimeout override that resets tutorial content
- `0c251e8` — fix: complete pages with icon(), utils, tutorialPanel
