# DeVault — Perjalanan Membangun Web

Selasa, 5 Agustus 2026 — 12:17 WIB (Banda Aceh)

## Status
Kode aplikasi BELUM ditulis. Konfigurasi Firebase di Console SUDAH selesai.

## Sudah selesai (Console Firebase)
- [x] Project Firebase dibuat (project id: devault-8349b)
- [x] Firestore database dibuat
- [x] Authentication Email/Password diaktifkan
- [x] Font Inter disalin ke folder fonts/

## Langkah berikutnya (belum dikerjakan)
- [ ] Perbarui firebase.js (tambah getAuth + export auth)
- [ ] Isi index.html (UI login + vault)
- [ ] Buat script.js (Firebase Auth + Firestore CRUD)
- [ ] Lengkapi styles/index.css (terapkan font Inter)
- [ ] Update README.md (cara menjalankan via server lokal)
- [ ] Atur Firestore Rules di Console (hanya pemilik data)

## Struktur data vault (rencana)
Collection: vaults
Field tiap dokumen: uid (pemilik), title, value

## Catatan tambahan
- File memakai ES module (type="module") => WAJIB lewat server lokal
  (Live Server / npx serve), tidak bisa dibuka via double-click index.html.
- Config firebase di firebase.js (apiKey boleh publik di client; jangan
  simpan Secret/Service Account di project; keamanan diatur lewat Rules).