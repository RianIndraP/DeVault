// Satu set ikon SVG (stroke-width 1.8, viewBox 24x24) yang dipakai di semua
// komponen, supaya gaya ikon konsisten (tidak ada emoji lagi).

export const ICON_PATHS = {
  // ---- nav ----
  dashboard: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 13h4v8H3zM10 8h4v13h-4zM17 3h4v18h-4z"/>',
  transactions: '<rect x="3" y="5" width="18" height="14" rx="2"/><path stroke-linecap="round" d="M3 10h18"/>',
  accounts: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 10l9-6 9 6M5 9v10h14V9"/>',
  categories: '<path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M3 11l8-8h6a2 2 0 012 2v6l-8 8a2 2 0 01-2.8 0l-5.2-5.2a2 2 0 010-2.8z"/>',
  budgets: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6M9 8h6M5 3h14v18l-7-4-7 4V3z"/>',
  goals: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".5" fill="currentColor"/>',
  reports: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-6m3 6v-9m3 9v-3M5 21h14a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1v16a1 1 0 001 1z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82A1.65 1.65 0 003 13.09H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
  logout: '<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 5v1a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3h4a3 3 0 013 3v1"/>',
  refresh: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v6h6M20 20v-6h-6M4.5 10a8 8 0 0114.3-3.5M19.5 14a8 8 0 01-14.3 3.5"/>',
  book: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V4a2 2 0 00-2-2H6.5A2.5 2.5 0 004 4.5v15z"/>',
  download: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v13m0 0l-4-4m4 4l4-4M4 19h16"/>',
  file: '<path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path stroke-linecap="round" stroke-linejoin="round" d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  camera: '<path stroke-linecap="round" stroke-linejoin="round" d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>',
  edit: '<path stroke-linecap="round" stroke-linejoin="round" d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  trash: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>',

  // ---- chrome ----
  search: '<circle cx="11" cy="11" r="7"/><path stroke-linecap="round" d="M21 21l-4.3-4.3"/>',
  bell: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>',
  menu: '<path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>',
  chevronLeft: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 18l-6-6 6-6"/>',
  chevronRight: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/>',
  chevronDown: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/>',
  moreVertical: '<circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M12 2v2m0 16v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M2 12h2m16 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
  moon: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/>',
  plus: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>',
  check: '<path stroke-linecap="round" stroke-linejoin="round" d="M20 6L9 17l-5-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path stroke-linecap="round" d="M12 8h.01M11 12h1v4h1"/>',
  eye: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.5 5.3A9.9 9.9 0 0112 5c6 0 9.5 7 9.5 7a13.6 13.6 0 01-3.2 4.1M6.4 6.4C4 8 2.5 12 2.5 12a13.7 13.7 0 004.2 5"/>',

  // ---- account types ----
  bank: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 10l9-6 9 6M4 10v9m4-9v9m4-9v9m4-9v9M2 21h20"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path stroke-linecap="round" d="M3 10h18"/><circle cx="16" cy="13.5" r="1" fill="currentColor" stroke="none"/>',
  cash: '<rect x="2" y="7" width="20" height="10" rx="2"/><circle cx="12" cy="12" r="2.5"/><path stroke-linecap="round" d="M6 10v.01M18 14v.01"/>',
  folder: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>',

  // ---- transaction types ----
  income: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 19V5M5 12l7-7 7 7"/>',
  expense: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12l7 7 7-7"/>',
  transfer: '<path stroke-linecap="round" stroke-linejoin="round" d="M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3"/>',
  trendUp: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 12l5-5 4 4 5-6"/>',

  // ---- categories ----
  food: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 11h18a9 9 0 01-9 9 9 9 0 01-9-9zM7 11V7m5 4V6m5 5V8"/>',
  bills: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 2h9l3 3v17l-3-2-3 2-3-2-3 2V2z"/><path stroke-linecap="round" d="M9 8h6M9 12h6M9 16h4"/>',
  transport: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 17l2-6h10l3 6M7 11V7h4M5 17h14"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>',
  entertainment: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 7l2-3h3l-2 3m4 0l2-3h3l-2 3m4 0l2-3h1a2 2 0 012 2v1M3 7h18v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>',
  health: '<path stroke-linecap="round" stroke-linejoin="round" d="M8 12h2l1.5-3L13 15l1.5-3H18M12 21c-4-2.5-8-6-8-10.5A4.5 4.5 0 0112 6a4.5 4.5 0 018 4.5C20 15 16 18.5 12 21z"/>',
  general: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',

  // ---- goals ----
  laptop: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 5h16v10H4zM2 19h20M9 19v-2m6 2v-2"/>',
  shield: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  car: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 13l1.5-5A2 2 0 016.4 6.5h11.2A2 2 0 0119.5 8L21 13M4 13h16v5a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-5z"/><circle cx="7.5" cy="16.5" r="1.2"/><circle cx="16.5" cy="16.5" r="1.2"/>',
  home: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 11l9-7 9 7M5 10v10h14V10"/>',
  plane: '<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 20l1.5-5 7-5-1-2-8 2-3-3-2 .5 2 4-4 2v2l4-1 1 3z"/>',
  ring: '<circle cx="9" cy="16" r="4"/><circle cx="17" cy="16" r="4"/><path stroke-linecap="round" d="M12 12l2-8"/>',
  grad: '<path stroke-linecap="round" stroke-linejoin="round" d="M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',

  // ---- insight icons ----
  warning: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path stroke-linecap="round" d="M16 3v4M8 3v4M3 10h18"/>',
  leaf: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 21c0-9 6-15 15-15 0 9-6 15-15 15zM5 21c0-4 2-8 6-10"/>',
};

/**
 * Render satu ikon sebagai string SVG.
 * @param {keyof typeof ICON_PATHS} name
 * @param {string} cls - kelas Tailwind untuk ukuran, mis. "w-4 h-4"
 */
export function icon(name, cls = 'w-4 h-4') {
  const paths = ICON_PATHS[name] || '';
  return `<svg class="${cls}" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
}
