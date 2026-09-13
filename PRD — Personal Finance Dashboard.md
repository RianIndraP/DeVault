# Product Requirements Document (PRD)
## Personal Finance Dashboard

**Versi:** 1.0  
**Status:** Ready for Development  
**Target awal:** ±20 pengguna untuk uji coba publik  
**Platform:** Web  
**Fokus teknologi:** JavaScript  
**Model:** Personal Finance Management

---

# 1. Product Overview

Personal Finance Dashboard adalah aplikasi web untuk membantu pengguna mencatat, memantau, menganalisis, dan mengelola keuangan pribadi.

Aplikasi tidak hanya berfungsi sebagai tempat mencatat pemasukan dan pengeluaran, tetapi juga membantu pengguna memahami:

- ke mana uang mereka habis,
- bagaimana pola pengeluaran mereka,
- apakah pengeluaran sesuai budget,
- berapa banyak uang yang berhasil disimpan,
- apakah target tabungan tercapai,
- dan bagaimana kondisi keuangan mereka dari waktu ke waktu.

Aplikasi menggunakan pendekatan **semi-otomatis**.

Pada versi awal, aplikasi **tidak terhubung langsung ke rekening bank**. Data transaksi berasal dari:

1. Input manual.
2. Import Excel.
3. Upload foto struk dan OCR.

---

# 2. Problem Statement

Banyak orang mencatat pengeluaran secara terpisah di catatan, spreadsheet, atau bahkan tidak mencatat sama sekali.

Masalah yang ingin diselesaikan:

- Pengguna tidak mengetahui ke mana uang paling banyak habis.
- Sulit membandingkan pengeluaran antarhari dan antarb match.
- Sulit mengetahui apakah budget telah terlampaui.
- Sulit memantau target menabung.
- Data transaksi sering tidak terstruktur.
- Membuat laporan bulanan secara manual memerlukan waktu.
- Informasi keuangan hanya berupa daftar transaksi tanpa insight.

Aplikasi ini menyatukan semua informasi tersebut menjadi satu dashboard.

---

# 3. Product Goal

Tujuan utama:

> Membantu pengguna memahami kondisi keuangan pribadinya melalui pencatatan transaksi, analisis, budget, target tabungan, dan laporan otomatis.

Empat tujuan utama pengguna:

### 3.1 Mengetahui ke mana uang habis

Pengguna dapat melihat total pengeluaran berdasarkan:

- kategori,
- item,
- tanggal,
- minggu,
- bulan.

### 3.2 Mengontrol budget

Pengguna dapat menentukan batas pengeluaran dan melihat progresnya secara visual.

### 3.3 Menabung untuk target tertentu

Pengguna dapat membuat target keuangan dan mengetahui progresnya.

### 3.4 Melakukan analisis keuangan

Pengguna dapat melihat grafik, pola pengeluaran, perbandingan periode, savings rate, dan insight otomatis.

---

# 4. Target User

Target produk:

> Semua orang yang ingin mengelola keuangan pribadi.

Versi awal difokuskan pada penggunaan pribadi dan pengujian dengan sekitar 20 pengguna.

Tidak ada konsep:

- keluarga,
- perusahaan,
- multi-profile,
- business accounting.

Satu akun mewakili satu profil keuangan pribadi.

---

# 5. Product Scope

## Included

- Authentication
- Dashboard
- Account management
- Transaction management
- Income
- Expense
- Transfer
- Custom category
- Budget
- Financial goals
- Analytics
- Financial insights
- Recurring transactions
- Excel import
- Excel export
- Receipt OCR
- Search
- Filter
- Monthly reports

## Excluded for initial release

- Integrasi bank
- Internet banking
- Open Banking
- Automatic bank synchronization
- Payment gateway
- Family account
- Business accounting
- Level 3 bank automation

---

# 6. Core Concept

Alur utama aplikasi:

```text
User
 ↓
Create Account
 ↓
Create Financial Accounts
 ↓
Create Categories
 ↓
Add Transactions
      ├── Manual
      ├── Excel
      └── Receipt OCR
 ↓
Transaction Database
 ↓
Analytics Engine
 ↓
Dashboard
      ├── Statistics
      ├── Charts
      ├── Budget
      ├── Goals
      └── Insights
 ↓
Monthly Report
 ↓
Excel Export
```

---

# 7. Authentication

Pengguna dapat:

- Register
- Login
- Logout
- Reset password
- Update profile

Setiap pengguna hanya boleh melihat data keuangannya sendiri.

Data antar pengguna harus terisolasi.

---

# 8. Financial Accounts

Pengguna dapat membuat beberapa sumber uang.

Contoh:

- BCA
- Mandiri
- DANA
- GoPay
- Cash

Setiap account memiliki saldo.

## Account fields

```text
id
user_id
name
type
initial_balance
current_balance
created_at
updated_at
```

### Account Type

Contoh:

```text
bank
e_wallet
cash
other
```

---

# 9. Transaction System

Transaksi memiliki 4 jenis utama:

```text
income
expense
transfer
adjustment
```

---

## 9.1 Income

Contoh:

```text
Bantu Ayah
Rp100.000
13 September 2026
```

Fields:

```text
id
user_id
account_id
type
date
description
amount
source
created_at
```

---

## 9.2 Expense

Expense mendukung detail item.

Contoh:

```text
Tanggal: 13 September 2026
Kategori: Makanan

Beras
Rp75.000
1 pcs

Galon
Rp20.000
2 pcs
```

Detail expense:

```text
transaction
    ├── transaction_item
    ├── transaction_item
    └── transaction_item
```

---

# 10. Transaction Item

Setiap pengeluaran dapat memiliki beberapa item.

Fields:

```text
id
transaction_id
item_name
unit_price
quantity
unit
subtotal
```

Contoh:

| Item | Harga | Jumlah | Satuan | Subtotal |
|---|---:|---:|---|---:|
| Beras | 75.000 | 1 | pcs | 75.000 |
| Galon | 20.000 | 2 | pcs | 40.000 |

Total:

```text
Rp115.000
```

---

# 11. Unit / Satuan

Pengguna dapat menulis satuan seperti:

- pcs
- kali
- kg
- gram
- liter
- botol
- pack
- bungkus
- kotak
- lainnya

Tidak perlu membatasi satuan secara ketat.

---

# 12. Transfer

Transfer tidak dianggap sebagai expense.

Contoh:

```text
BCA
 ↓
DANA

Rp100.000
```

Saldo:

```text
BCA  -100.000
DANA +100.000
```

Namun:

```text
Total Expense = Rp0
```

Transfer harus memiliki:

```text
from_account_id
to_account_id
amount
date
description
```

---

# 13. Adjustment

Adjustment digunakan untuk memperbaiki saldo ketika saldo aplikasi tidak sama dengan saldo sebenarnya.

Contoh:

```text
Saldo sistem
Rp2.450.000

Saldo sebenarnya
Rp2.500.000
```

User membuat:

```text
Adjustment
+Rp50.000

Reason:
Saldo awal / koreksi
```

Adjustment tidak dihitung sebagai pemasukan biasa.

---

# 14. Categories

Kategori dibuat sendiri oleh pengguna.

Saat akun baru dibuat:

```text
No categories yet
```

User dapat membuat:

```text
Makanan
Transportasi
Tagihan
Hiburan
Pendidikan
Kesehatan
Umum
dll.
```

Category fields:

```text
id
user_id
name
icon
created_at
updated_at
```

Tidak ada kategori default yang wajib.

---

# 15. Item / Product Memory

Aplikasi dapat mengenali item yang pernah digunakan.

Contoh user sebelumnya:

```text
Beras
→ Makanan
```

Saat user mengetik:

```text
Beras
```

sistem dapat memberikan saran:

```text
Kategori yang terakhir digunakan:
Makanan
```

Sistem tidak menentukan kategori secara otomatis berdasarkan merchant.

Kategori tetap dikontrol oleh pengguna.

---

# 16. Dashboard

Dashboard adalah halaman utama aplikasi.

## Top section

Menampilkan:

```text
Total Balance

Rp4.725.000
```

Kemudian:

```text
Income
Rp5.000.000

Expense
Rp2.300.000

Net
Rp2.700.000
```

---

# 17. Dashboard Statistics

Minimal statistik:

- Total balance
- Total income
- Total expense
- Net income
- Savings rate
- Total budget
- Budget used
- Total goals
- Goal progress

---

# 18. Line Chart

## Daily Expense Chart

X-axis:

```text
Tanggal
```

Y-axis:

```text
Jumlah pengeluaran
```

Tujuan:

> Mengetahui hari dengan pengeluaran terbesar.

---

# 19. Income vs Expense Chart

Dua line:

```text
Income
Expense
```

Filter:

- 7 hari
- 30 hari
- bulan
- custom range

---

# 20. Monthly Chart

Menampilkan beberapa bulan:

```text
April
May
June
July
August
September
```

Data:

```text
Income
Expense
Savings
```

---

# 21. Category Analysis

Menampilkan total expense berdasarkan kategori.

Contoh:

```text
Food            Rp800.000
Transport       Rp400.000
Bills           Rp350.000
General         Rp150.000
```

Visualisasi dapat berupa:

- Doughnut Chart
- Bar Chart

---

# 22. Spending Pattern

Sistem menganalisis:

- rata-rata pengeluaran harian,
- hari paling boros,
- hari paling hemat,
- kategori terbesar,
- perubahan pengeluaran,
- pengeluaran akhir pekan,
- pengeluaran dibanding periode sebelumnya.

Contoh insight:

> Pengeluaranmu pada akhir pekan rata-rata 35% lebih tinggi dibanding hari biasa.

---

# 23. Savings Rate

Formula:

```text
Savings Rate =
(Income - Expense) / Income × 100
```

Contoh:

```text
Income  = Rp5.000.000
Expense = Rp3.000.000

Savings = Rp2.000.000

Savings Rate = 40%
```

---

# 24. Financial Health Score

Aplikasi menghitung skor indikator keuangan berdasarkan:

- pengeluaran vs pemasukan,
- budget,
- saving rate,
- progress goals,
- konsistensi pengeluaran.

Contoh:

```text
Financial Health

78 / 100
```

Score hanya digunakan sebagai indikator internal aplikasi dan bukan penilaian finansial profesional.

---

# 25. Automatic Insights

Sistem menghasilkan insight berdasarkan data.

Contoh:

```text
Pengeluaran makanan meningkat 18%
dibanding bulan lalu.
```

```text
Budget hiburan telah digunakan 92%.
```

```text
Kamu berhasil menyimpan 40%
dari pemasukan bulan ini.
```

```text
Pengeluaran terbesar bulan ini:
Makanan — Rp800.000
```

```text
Jika pola menabung tetap sama,
target laptop diperkirakan tercapai
pada November.
```

Insight tahap awal menggunakan rule-based analytics.

AI dapat ditambahkan di masa depan.

---

# 26. Budget

User membuat budget berdasarkan periode dan kategori.

Contoh:

```text
Makanan
Budget = Rp1.000.000
Period = September 2026
```

Sistem menghitung:

```text
Used = Rp750.000
Remaining = Rp250.000
```

Progress:

```text
75%
```

Status:

```text
0-79%  = Safe
80-99% = Warning
100%+  = Exceeded
```

---

# 27. Financial Goals

User dapat membuat target.

Contoh:

```text
Goal:
Beli Laptop

Target:
Rp10.000.000

Current:
Rp6.000.000

Remaining:
Rp4.000.000

Deadline:
31 December 2026
```

Progress:

```text
60%
```

Sistem memperkirakan jumlah tabungan yang diperlukan per periode.

---

# 28. Recurring Transactions

User dapat membuat transaksi berulang.

Contoh:

```text
Internet
Rp300.000
Setiap tanggal 5
```

Jenis:

```text
Recurring Income
Recurring Expense
```

Sistem membuat transaksi berdasarkan jadwal.

---

# 29. Transaction Search

User dapat mencari:

```text
Beras
QRIS
Grab
Bantu Ayah
```

Search berdasarkan:

- nama transaksi,
- item,
- deskripsi.

---

# 30. Transaction Filters

Filter:

```text
Date
Category
Account
Transaction Type
Amount
```

Contoh:

```text
September
+
Category = Food
+
Account = BCA
```

---

# 31. Excel Import

User dapat upload `.xlsx` atau `.csv`.

Flow:

```text
Select File
 ↓
Parse
 ↓
Validate
 ↓
Preview
 ↓
User Edit
 ↓
Confirm
 ↓
Save
```

Sistem harus menampilkan error jika:

- tanggal tidak valid,
- nominal tidak valid,
- tipe transaksi tidak dikenali,
- kolom wajib kosong.

Import tidak boleh langsung menyimpan data tanpa preview.

---

# 32. Import Template

Aplikasi menyediakan template Excel:

```text
Date
Type
Category
Description
Amount
Account
```

Untuk expense detail dapat disediakan template tambahan.

---

# 33. Receipt OCR

User dapat:

```text
Upload image
```

Kemudian:

```text
OCR
 ↓
Extract text
 ↓
Parse item
 ↓
Preview
 ↓
Edit
 ↓
Save
```

Data yang dapat dicoba dibaca:

- nama toko,
- tanggal,
- item,
- harga,
- jumlah,
- total.

OCR hanya sebagai bantuan.

User tetap harus mengonfirmasi hasilnya.

---

# 34. Receipt Data Example

Input:

```text
Beras       75.000
Galon       20.000
Gula        18.000

TOTAL      113.000
```

Output:

```text
Category: Makanan

Beras
75.000 × 1 pcs

Galon
20.000 × 1 pcs

Gula
18.000 × 1 pcs
```

User bisa mengubah hasil OCR sebelum menyimpan.

---

# 35. Monthly Excel Report

User memilih:

```text
September 2026
```

Kemudian:

```text
Download Excel
```

File:

```text
financial-report-september-2026.xlsx
```

---

# 36. Struktur Excel

## Sheet 1 — Summary

Isi:

```text
September 2026

Total Income
Total Expense
Net Savings
Savings Rate

Largest Category
```

---

# 37. Sheet Category

Setiap kategori yang memiliki transaksi akan memiliki sheet.

Contoh:

```text
Makanan
Transportasi
Umum
```

Kategori yang tidak memiliki transaksi pada bulan tersebut tidak perlu dibuatkan sheet detail.

---

# 38. Category Sheet Structure

Contoh:

### Makanan

| Tanggal | Nama | Harga | Jumlah | Satuan | Total |
|---|---|---:|---:|---|---:|
| 01/09 | Beras | 75.000 | 1 | pcs | 75.000 |
| 03/09 | Galon | 20.000 | 2 | pcs | 40.000 |
| 07/09 | Telur | 30.000 | 1 | kg | 30.000 |

Di sebelah tabel:

| Minggu | Total Pengeluaran |
|---|---:|
| Minggu 1 | Rp350.000 |
| Minggu 2 | Rp275.000 |
| Minggu 3 | Rp325.000 |
| Minggu 4 | Rp180.000 |

---

# 39. Weekly Calculation

Bulan dibagi menjadi:

```text
Week 1
Week 2
Week 3
Week 4
```

Jika diperlukan, data tanggal ke-29 sampai akhir bulan tetap masuk ke minggu ke-4.

Logika minggu harus konsisten di seluruh laporan.

---

# 40. Income Sheet

Sheet:

```text
Pemasukan
```

Contoh:

| Tanggal | Nama Pemasukan | Nominal |
|---|---|---:|
| 02/09 | Bantu Ayah | 100.000 |
| 05/09 | Freelance | 300.000 |
| 15/09 | Bantu Ayah | 150.000 |

Di sebelahnya:

| Minggu | Total |
|---|---:|
| Minggu 1 | Rp400.000 |
| Minggu 2 | Rp250.000 |
| Minggu 3 | Rp300.000 |
| Minggu 4 | Rp150.000 |

---

# 41. Recap Sheet

Sheet:

```text
Rekap Pengeluaran
```

Struktur:

```text
MAKANAN

Beras        Rp225.000
Galon        Rp80.000
Telur        Rp120.000

Total Makanan
Rp425.000


UMUM

Donasi       Rp50.000

Total Umum
Rp50.000
```

Hanya item yang mempunyai transaksi pada bulan tersebut yang ditampilkan.

Contoh:

Jika tidak ada:

```text
Sedekah
```

maka Sedekah tidak muncul.

---

# 42. Important Reporting Rule

Excel harus dibuat berdasarkan data aktual bulan yang dipilih.

Tidak boleh membuat daftar item statis dari seluruh database.

Artinya:

```text
Database Item Master
        ↓
Filter Month
        ↓
Filter Category
        ↓
Hanya transaksi aktif
        ↓
Generate Excel
```

---

# 43. Reports Page

Halaman laporan menyediakan:

```text
Select Month
[ September 2026 ]

[ View Report ]

[ Download Excel ]
```

Preview laporan sebelum download dapat disediakan.

---

# 44. Navigation

Sidebar:

```text
Dashboard

Transactions
  All Transactions
  Income
  Expense
  Transfer
  Import Excel
  Scan Receipt

Accounts

Categories

Budgets

Goals

Reports

Settings
```

---

# 45. UI / UX Direction

Style:

> Clean SaaS Dashboard

Karakteristik:

- whitespace cukup,
- layout rapi,
- card sederhana,
- typography jelas,
- rounded corners secukupnya,
- chart tidak berlebihan,
- warna digunakan untuk status,
- responsive desktop/mobile,
- fokus pada readability.

Inspirasi visual:

```text
Modern SaaS
+
Personal Finance
+
Minimal Dashboard
```

---

# 46. Responsive Design

Aplikasi harus dapat digunakan pada:

- Desktop
- Laptop
- Tablet
- Mobile

Desktop:

```text
Sidebar + Content
```

Mobile:

```text
Topbar
Content
Bottom/Drawer Navigation
```

---

# 47. Recommended Tech Stack

## Frontend

```text
HTML
CSS
JavaScript
Tailwind CSS
```

## Backend / Data

```text
Supabase
```

Digunakan untuk:

- Authentication
- PostgreSQL database
- Row Level Security
- Storage

## Chart

```text
Chart.js
```

## Excel

```text
SheetJS
```

## OCR

```text
Tesseract.js
```

---

# 48. Initial Database Schema

## profiles

```text
id
user_id
display_name
avatar_url
created_at
updated_at
```

## accounts

```text
id
user_id
name
type
initial_balance
current_balance
created_at
updated_at
```

## categories

```text
id
user_id
name
icon
created_at
updated_at
```

## transactions

```text
id
user_id
account_id
category_id
type
date
description
amount
source
created_at
updated_at
```

## transaction_items

```text
id
transaction_id
item_name
unit_price
quantity
unit
subtotal
created_at
```

## transfers

```text
id
user_id
from_account_id
to_account_id
amount
date
description
created_at
```

## budgets

```text
id
user_id
category_id
month
year
amount
created_at
updated_at
```

## goals

```text
id
user_id
name
target_amount
current_amount
deadline
description
created_at
updated_at
```

## recurring_transactions

```text
id
user_id
account_id
category_id
type
amount
description
frequency
next_date
active
created_at
updated_at
```

---

# 49. Source Tracking

Setiap transaksi menyimpan sumber input:

```text
manual
excel
receipt
```

Contoh:

```text
source = manual
```

atau:

```text
source = excel
```

Hal ini berguna untuk debugging dan histori.

---

# 50. Security Requirements

Karena data keuangan bersifat pribadi:

- Semua tabel memiliki `user_id`.
- RLS wajib digunakan.
- User hanya dapat membaca datanya sendiri.
- User hanya dapat mengubah datanya sendiri.
- User hanya dapat menghapus datanya sendiri.
- File receipt harus terisolasi per user.
- Jangan menyimpan password sendiri.
- Gunakan authentication provider.
- Jangan meminta username/password rekening bank.

---

# 51. Data Validation

Input nominal:

```text
> 0
```

Tanggal:

```text
valid date
```

Quantity:

```text
> 0
```

Expense:

```text
category wajib
account wajib
amount wajib
```

Transfer:

```text
from_account != to_account
```

Goal:

```text
target_amount > 0
```

---

# 52. Error Handling

Contoh:

```text
Upload gagal
Format file tidak didukung.
```

```text
Import gagal
Kolom "Amount" tidak ditemukan.
```

```text
Transaksi gagal disimpan
Nominal harus lebih besar dari 0.
```

```text
OCR gagal
Data struk tidak dapat dibaca.
Silakan masukkan transaksi secara manual.
```

---

# 53. Empty States

Karena kategori di awal kosong, halaman pertama harus memiliki empty state.

Contoh:

```text
No transactions yet.

Mulai catat transaksi pertamamu.

[Tambah Transaksi]
```

Kategori:

```text
No categories yet.

Buat kategori agar transaksi lebih terorganisir.

[Tambah Kategori]
```

Goal:

```text
Belum ada target.

Buat target pertamamu.

[Tambah Target]
```

---

# 54. MVP

Versi pertama yang wajib selesai:

### Authentication

- Register
- Login
- Logout

### Accounts

- Create
- Edit
- Delete
- Balance

### Categories

- Create
- Edit
- Delete

### Transactions

- Income
- Expense
- Transfer
- Edit
- Delete
- Search
- Filter

### Dashboard

- Balance
- Income
- Expense
- Net
- Daily chart
- Income vs Expense
- Category chart

### Budget

- Create
- Progress
- Warning

### Goals

- Create
- Progress

### Reports

- Monthly report
- Excel export

---

# 55. Phase 2

Setelah MVP stabil:

- Excel import
- Receipt OCR
- Recurring transactions
- Spending pattern
- Savings rate
- Financial health
- Automatic insights
- Advanced reports

---

# 56. Phase 3

Fitur masa depan:

- AI financial assistant
- Better OCR parser
- Advanced forecasting
- PWA
- Offline support
- Mobile application
- Bank/API integration

Bank integration **tidak termasuk roadmap development saat ini** dan hanya disimpan sebagai kemungkinan jangka panjang.

---

# 57. Definition of Done — MVP

MVP dianggap selesai apabila pengguna dapat:

```text
Register
 ↓
Login
 ↓
Create Account
 ↓
Create Category
 ↓
Add Income
 ↓
Add Expense
 ↓
Add Transfer
 ↓
View Dashboard
 ↓
See Charts
 ↓
Create Budget
 ↓
Create Goal
 ↓
View Monthly Report
 ↓
Download Excel
```

Dan semua data hanya dapat diakses oleh user pemiliknya.

---

# 58. Example User Journey

User baru:

```text
Register
```

Kemudian:

```text
Create Account

BCA
Rp2.500.000
```

Membuat kategori:

```text
Makanan
Transportasi
Umum
```

Menambah pemasukan:

```text
Bantu Ayah
+Rp100.000
```

Menambah pengeluaran:

```text
Beras
Rp75.000
Makanan
```

Dashboard berubah:

```text
Balance
Rp2.525.000

Income
Rp100.000

Expense
Rp75.000

Net
Rp25.000
```

Chart ikut berubah.

Budget ikut berubah.

Report Excel ikut berubah.

Insight ikut berubah.

---

# 59. Product Philosophy

Aplikasi harus mengikuti prinsip:

> **Input once, understand everywhere.**

Pengguna cukup memasukkan transaksi sekali.

Data tersebut kemudian digunakan untuk:

```text
Transaction History
        ↓
Dashboard
        ↓
Charts
        ↓
Budget
        ↓
Goals
        ↓
Insights
        ↓
Monthly Report
        ↓
Excel
```

Tidak boleh meminta user memasukkan data yang sama berkali-kali.

---

# 60. Primary Success Metrics

Untuk uji coba awal ±20 pengguna, metrik yang dapat digunakan:

- jumlah pengguna aktif,
- jumlah transaksi tercatat,
- jumlah transaksi per user,
- jumlah laporan yang di-download,
- jumlah penggunaan import Excel,
- jumlah penggunaan OCR,
- jumlah goal yang dibuat,
- jumlah budget yang dibuat.

Feedback terpenting:

> Apakah pengguna merasa aplikasi membantu mereka memahami ke mana uang mereka pergi?

---

# 61. Final Product Definition

**Personal Finance Dashboard** adalah aplikasi web personal finance berbasis JavaScript yang memungkinkan pengguna mencatat pemasukan, pengeluaran, transfer, dan saldo dari berbagai sumber uang; mengelompokkan transaksi berdasarkan kategori; mengontrol budget; menetapkan target tabungan; menganalisis pola keuangan melalui grafik dan statistik; mendapatkan insight otomatis; mengimpor data dari Excel; membaca struk melalui OCR; serta menghasilkan laporan Excel bulanan yang terstruktur berdasarkan kategori, minggu, item, harga, jumlah, dan satuan.

Versi awal **tidak menggunakan koneksi bank** dan dirancang untuk pengujian terbatas sekitar 20 pengguna.