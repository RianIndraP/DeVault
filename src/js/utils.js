// Helper format & pemetaan ikon yang dipakai di beberapa halaman.
// (dashboard.js punya salinan lokal dari sebagian fungsi ini — aman,
// tidak wajib disatukan, tapi bisa dirapikan nanti kalau mau.)

export const rupiah = (n) => 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID');

// Tempel alpha channel (2 digit hex, mis. '22' ~13%) ke warna hex kategori,
// dipakai untuk background lembut badge/ikon tanpa perlu token warna tetap.
export const withAlpha = (hex, alpha) => (hex && hex.startsWith('#')) ? hex + alpha : hex;

export function categoryIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('makan')) return 'food';
  if (n.includes('tagih')) return 'bills';
  if (n.includes('transport')) return 'transport';
  if (n.includes('hibur')) return 'entertainment';
  if (n.includes('sehat')) return 'health';
  if (n.includes('gaji') || n.includes('invest') || n.includes('dividen')) return 'income';
  return 'general';
}

export function goalIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('laptop') || n.includes('gadget') || n.includes('hp')) return 'laptop';
  if (n.includes('darurat') || n.includes('emergency')) return 'shield';
  return 'goals';
}

export function accountIcon(type) {
  if (type === 'bank') return 'bank';
  if (type === 'e_wallet') return 'wallet';
  if (type === 'cash') return 'cash';
  return 'wallet';
}

export function accountTypeLabel(type) {
  return type === 'bank' ? 'Bank' : type === 'e_wallet' ? 'E-Wallet' : type === 'cash' ? 'Tunai' : 'Lainnya';
}
