# Personal Finance Dashboard

Aplikasi manajemen keuangan pribadi berbasis JavaScript, Vite, Tailwind CSS v4, dan Supabase.

## Teknologi

- Vite 5 + ES Modules
- Tailwind CSS v4 melalui PostCSS
- Supabase Auth + PostgreSQL + Row Level Security
- Chart.js untuk grafik
- Tesseract.js untuk OCR struk
- jsPDF, html2canvas, dan xlsx untuk export
- DOMPurify untuk sanitasi HTML

## Menjalankan

```bash
npm install
```

Buat `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Jalankan development server:

```bash
npm run dev
```

Buka `http://localhost:5173`.

Perintah lain:

```bash
npm run build       # build produksi
npm run preview     # preview build
npm run supabase    # Supabase CLI
```

## Struktur

```text
src/
├── main.js
├── index.css                 # Tailwind v4 + CSS variables + theme
└── js/
    ├── app.js                # auth gate, layout, routing
    ├── router.js             # client-side router
    ├── utils.js              # rupiah, ikon, warna, dan helper format
    ├── components/
    │   ├── icons.js          # library SVG icons
    │   ├── sidebar.js
    │   ├── topbar.js
    │   ├── toast.js
    │   ├── tutorial.js
    │   └── transaction_modal.js  # modal single, bulk, dan transfer
    ├── pages/
    │   ├── auth.js
    │   ├── dashboard.js
    │   ├── transactions.js
    │   ├── accounts.js
    │   ├── categories.js
    │   ├── budgets.js
    │   ├── goals.js
    │   ├── recurring.js
    │   ├── reports.js
    │   └── settings.js
    └── services/
        ├── supabase.js
        ├── auth.js
        ├── database.js
        ├── export.js
        └── ocr.js
```

## Fitur

### Auth

- Register, login, logout
- Protected routes
- Password visibility toggle
- Theme toggle pada halaman auth

### Dashboard

- Total saldo seluruh akun
- Pemasukan, pengeluaran, dan savings rate
- Perbandingan dengan bulan sebelumnya
- Financial health score
- Arus kas dan pergerakan saldo
- Budget berjalan
- Insight keuangan otomatis
- Target tabungan dan transaksi terjadwal
- Scan struk dan export

### Transaksi

- Pencarian dan filter waktu, tipe, kategori, serta akun
- Filter nominal dan rentang tanggal
- Sort nominal dan paginasi
- Detail drawer
- Edit, duplikasi, dan hapus
- Select all dan bulk delete
- Perubahan kategori massal
- Penyesuaian saldo akun otomatis saat create, edit, dan delete

Modal transaksi berada di `src/js/components/transaction_modal.js`:

- Satu transaksi
- Banyak transaksi seperti spreadsheet
- Transfer antar akun
- Edit transaksi
- Kategori bulk dengan pencocokan nama case-insensitive
- Validasi field dan error inline

Semua mode modal mengirim array payload ke `transactionsPage.save(payloads)`.

### Akun

- Bank, e-wallet, cash, dan other
- Saldo awal, saldo berjalan, dan arsip akun
- Verifikasi saldo awal pada awal bulan
- Koreksi saldo melalui transaksi adjustment
- Detail transaksi per akun
- Sembunyikan saldo dan theme preference

### Kategori

- Grid kategori
- Ikon SVG tanpa emoji
- Pencarian
- Sort A–Z atau terbaru
- Edit dan hapus
- Warna otomatis berdasarkan ID kategori

Kategori saat ini masih flat. `category_groups` hanya tersedia di schema/migration dan belum dipakai UI.

### Budget

- Budget per kategori dan bulan
- Status Aman, Warning, dan Terlampaui
- Ringkasan total terpakai dan sisa budget
- Peringatan budget duplikat

### Reports

- Laporan bulanan
- Ringkasan pemasukan, pengeluaran, dan bersih
- Grafik kategori dan tren pengeluaran
- Export Excel/PDF
- Import CSV/XLSX dengan preview

### Recurring

- Tambah transaksi berulang
- Aktifkan/nonaktifkan
- Hapus
- Eksekusi transaksi berikutnya

## Database

Project memakai Supabase PostgreSQL dengan RLS per pengguna.

Tabel utama yang digunakan aplikasi:

- `profiles`
- `accounts`
- `categories`
- `transactions`
- `transaction_items`
- `transfers`
- `budgets`
- `goals`
- `recurring_transactions`

File `database.sql` adalah export schema lokal dan sengaja diabaikan Git. Migration tracked berada di `supabase/migrations/`.

Untuk menerapkan schema pada project Supabase lain, gunakan SQL Editor atau migration SQL yang sesuai. Jangan mengimpor dump `database.sql` secara langsung ke database aplikasi.

## Catatan Teknis

- `@supabase/supabase-js` digunakan sebagai client; tidak ada Supabase client CDN.
- Chart.js dimuat dari CDN pada `index.html`.
- Font menggunakan fallback sistem; tidak ada runtime request ke Google Fonts.
- `transactionService`, `accountService`, `categoryService`, dan service lain berada di `src/js/services/database.js`.
- `ensureProfile()` memastikan profil user tersedia sebelum operasi database.
- Update dan delete database selalu difilter `user_id` untuk keamanan tenant isolation.
- Tutorial panel memakai `tutorialPanel.setContent()` per halaman.
- `src/js/store/` tidak digunakan saat ini.

## Fitur yang Belum Lengkap

- `settings.js` masih placeholder.
- `goals.js` masih memakai UI lama dan belum memiliki edit/delete.
- `recurring.js` memiliki bagian edit yang belum terimplementasi.
- Transfer belum sepenuhnya selaras dengan schema `transactions`; schema menyediakan tabel `transfers`, sementara aplikasi memakai `account_to_id`.
- Import laporan masih perlu validasi ID akun dan kategori.
- Export PDF langsung dari halaman Transaksi membutuhkan `window.jspdf` yang belum dimuat.
- OCR membutuhkan akses jaringan untuk worker, core, dan data bahasa Tesseract.

## Lisensi

Proprietary - Personal Use
