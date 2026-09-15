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
| Chart.js | ^4.4.0 | Visualisasi grafik | 🔲 Belum |

## Struktur Project

```
personal-finance-dashboard/
├── index.html              ← File utama HTML (entry point)
├── package.json            ← Dependency & script commands
├── vite.config.js          ← Konfigurasi Vite (PostCSS + Tailwind v4)
├── postcss.config.js       ← PostCSS config (@tailwindcss/postcss)
├── .env                    ← Environment variables (Supabase credentials)
├── .env.example            ← Template variabel environment
├── .gitignore              ← File yang tidak di-commit ke Git
├── database.sql            ← Schema SQL Supabase (9 tabel + RLS + triggers)
├── public/                 ← File statis (favicon, gambar)
└── src/
    ├── main.js             ← Titik masuk JavaScript
    ├── index.css           ← Styles (CSS variables + layout classes)
    └── js/
        ├── app.js          ← Inisialisasi aplikasi utama (routing)
        ├── router.js       ← Client-side router
        ├── components/     ← Komponen UI yang bisa dipakai ulang
        │   ├── sidebar.js      ← Sidebar navigasi
        │   ├── topbar.js       ← Topbar header
        │   └── icons.js        ← Library icon SVG
        ├── pages/          ← Halaman aplikasi
        │   ├── auth.js         ← Register, Login, Logout
        │   ├── dashboard.js    ← Dashboard dengan statistik & ringkasan akun
        │   ├── transactions.js ← CRUD transaksi + transaction items
        │   ├── accounts.js     ← CRUD akun (bank, e-wallet, cash)
        │   ├── categories.js   ← CRUD kategori
        │   ├── budgets.js      ← Budget per kategori
        │   ├── goals.js        ← Target tabungan
        │   ├── reports.js      ← Laporan bulanan
        │   └── settings.js     ← Pengaturan
        └── services/       ← Layanan API & integrasi
            ├── supabase.js   ← Client Supabase (createClient)
            ├── auth.js       ← Layanan autentikasi
            ├── database.js   ← CRUD service semua tabel (accounts, categories, transactions, budgets, goals)
            ├── export.js     ← Excel/PDF export service
            └── ocr.js        ← OCR receipt scanning service
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
- `src/index.css` — hanya berisi `@import "tailwindcss"`
- `vite.config.js` — `css: { postcss: './postcss.config.js' }`
- `postcss.config.js` — berisi `import { from } from '@tailwindcss/postcss'`
- `tailwind.config.js` — **tidak diperlukan**

## Konfigurasi Supabase

### Database Schema
9 tabel dengan RLS lengkap:
- `profiles` — Profil pengguna (id = auth.uid())
- `accounts` — Sumber uang (bank, e-wallet, cash)
- `categories` — Kategori transaksi buatan pengguna
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

### ✅ Selesai
- Nomor 1: Setup Project JavaScript (Vite, ES Modules, Tailwind v4)
- Nomor 2: Setup Tailwind CSS v4 dengan PostCSS
- Nomor 3: Setup Supabase Client & Auth
- Nomor 4: Database + RLS (9 tabel, policies, triggers, auto-create profile)
- Nomor 5: Auth Pages (Register, Login, Logout dengan redirect)
- Nomor 6: Layout Dashboard (Sidebar, Topbar, Responsive, CSS Variables)
- Nomor 6b: Dashboard Design — Hero section, stat tiles, health gauge, activity feed, budgets, goals, insights
- Nomor 6c: Theme Persistence — Dark/light theme saved to localStorage, auto-applied on load
- Nomor 7-10: CRUD Pages (Accounts, Categories, Transactions, Dashboard)
- Nomor 11-13: Budget, Goals, Reports pages
- Nomor 14: Settings page
- Nomor 15: Export/Import services (stub)
- Nomor 16: OCR service (stub)
- Nomor 17: Icons component (SVG icon library)
- Nomor 18: Dashboard layout refactored to CSS Variables (bg-gray-50 → var(--bg))

### 🔲 Belum Dikerjakan
- Chart.js (Grafik harian, kategori, income vs expense)
- Excel Export (download laporan .xlsx)
- Excel Import (upload .xlsx / .csv)
- OCR Receipt Scanning (implementasi Tesseract.js)
- Insights (Analisis otomatis)
- Recurring Transactions
- Search & Filter
- Advanced Reports

### ✅ Selesai (Tambahan Terakhir)
- Theme persistence ke `localStorage` — dark/light mode tersimpan, auto-applied saat load
- Dashboard design: Hero gradient section, stat tiles dengan accent bar, health gauge, sparkline, activity feed dengan SVG icons, budgets dengan status badges, goals section, insight cards
- CSS custom properties untuk semua komponen (dark/light theming native)
- Layout refactored: `bg-gray-50` → `var(--bg)` CSS variables
- Sidebar/Topbar pakai CSS variables
- `src/js/components/icons.js` — SVG icon library

### Phase 2 (Setelah MVP Stabil)
- Excel Import (preview & edit)
- Receipt OCR (implementasi penuh)
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

## Prinsip Desain
- **Input once, understand everywhere** - Data dimasukkan sekali, digunakan di semua fitur
- **Responsive** - Desktop, Laptop, Tablet, Mobile
- **Clean SaaS Dashboard** - Minimal, readable, rapi
- **Semi-Automatis** - Tidak terhubung bank langsung (versi awal)

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
icon TEXT DEFAULT '📁'
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

## Developer Notes
- Gunakan `npm run dev` untuk development
- Gunakan `npm run build` untuk produksi
- Selalu gunakan `.env` untuk credential Supabase (jangan commit ke Git)
- Semua kode JavaScript menggunakan ES Modules (`import/export`)
- `src/js/components/` berisi komponen UI yang bisa dipakai ulang (sidebar, topbar, icons)
- `src/js/pages/` berisi halaman aplikasi (auth, dashboard, transactions, accounts, categories, budgets, goals, reports, settings)
- `src/js/services/` berisi semua panggilan API (supabase, auth, database, export, ocr)
- `src/index.css` berisi CSS custom properties (variabel) untuk dark/light theme dan semua kelas layout dashboard
- `ensureProfile()` dipanggil otomatis sebelum setiap operasi database untuk memastikan profil pengguna ada
- `profiles.id` menggunakan `auth.uid()` sehingga FK constraint selalu valid
- Tailwind v4 menggunakan `@import "tailwindcss"` di CSS, diproses oleh `@tailwindcss/postcss` di Vite
- `vite.config.js` memiliki `css: { postcss: './postcss.config.js' }` untuk integrasi PostCSS
- `postcss.config.js` berisi `import { from } from '@tailwindcss/postcss'`
- Supabase client menggunakan `@supabase/supabase-js` npm package, bukan CDN
- Semua tabel memiliki RLS policies yang hanya mengizinkan akses oleh user yang bersangkutan
- `db.update()` dan `db.delete()` menyertakan `eq('user_id', userId)` untuk RLS compliance
- `transactionService.create()` dan `transactionService.addItem()` memanggil `ensureProfile()` sebelum insert
- Semua data transaksi harus memiliki `source` field: `manual`, `excel`, atau `receipt`
- `database.sql` harus dijalankan di Supabase SQL Editor sebelum aplikasi digunakan
- `crypto.randomUUID()` tidak digunakan lagi — `profiles.id` menggunakan `auth.uid()`
- Auto-create profile trigger: `on_auth_user_created` di `auth.users`
- `src/js/components/icons.js` — library icon SVG, setiap icon punya key dan nilai SVG string
- `localStorage.setItem('theme', 'dark'|'light')` menyimpan preferensi tema
- `document.documentElement.classList.toggle('dark')` mengaktifkan tema gelap
- CSS custom properties di `:root` dan `html.dark` mendukung dark/light theme
- Semua komponen UI (sidebar, topbar, dashboard) menggunakan CSS variables bukan Tailwind gray classes
- `src/index.css` berisi CSS variabel + semua kelas layout dashboard (`.hero`, `.stat-grid`, `.tile`, `.card`, `.grid-2`, `.activity-row`, `.acct-row`, `.budget-item`, `.goal-item`, `.insight-grid`, `.gauge-row`, `.bar-track`, dll.)
- Dashboard menggunakan hero gradient section, stat tiles, health gauge, sparkline canvas, activity feed dengan SVG icons

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
