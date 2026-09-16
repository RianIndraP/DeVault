// Satu set ikon SVG (stroke-width 1.8, viewBox 24x24) yang dipakai di semua
// komponen, supaya gaya ikon konsisten (tidak ada emoji lagi).

export const ICON_PATHS = {
  // ---- nav ----
  dashboard: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 13h4v8H3zM10 8h4v13h-4zM17 3h4v18h-4z"/>',
  transactions: '<rect x="3" y="5" width="18" height="14" rx="2"/><path stroke-linecap="round" d="M3 10h18"/>',
  accounts: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 10l9-6 9 6M5 9v10h14V9"/>',
  categories: '<path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M3 11l8-8h6a2 2 0 012 2v6l-8 8a2 2 0 01-2.8 0l-5.2-5.2a2 2 0 010-2.8z"/>',
  budgets: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6M9 8h6M5 3h14v18l-7-4-7 4V3z"/>',
  goals: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".5" fill="currentColor" stroke="none"/>',
  reports: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-6m3 6v-9m3 9v-3M5 21h14a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1v16a1 1 0 001 1z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82A1.65 1.65 0 003 13.09H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
  logout: '<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 5v1a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3h4a3 3 0 013 3v1"/>',

  // ---- chrome ----
  search: '<circle cx="11" cy="11" r="7"/><path stroke-linecap="round" d="M21 21l-4.3-4.3"/>',
  bell: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>',
  menu: '<path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>',
  chevronLeft: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 18l-6-6 6-6"/>',
  chevronRight: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/>',
  plus: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>',
  minus: '<path stroke-linecap="round" d="M5 12h14"/>',
  check: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 12l5 5L19 7"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M12 2v2m0 16v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M2 12h2m16 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
  moon: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/>',

  // ---- account types ----
  bank: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 10l9-6 9 6M4 10v9m4-9v9m4-9v9m4-9v9M2 21h20"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path stroke-linecap="round" d="M3 10h18"/><circle cx="16" cy="13.5" r="1" fill="currentColor" stroke="none"/>',
  cash: '<rect x="2" y="7" width="20" height="10" rx="2"/><circle cx="12" cy="12" r="2.5"/><path stroke-linecap="round" d="M6 10v.01M18 14v.01"/>',

  // ---- transaction types ----
  income: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12l7-7 7 7"/>',
  expense: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 19V5M5 12l7 7 7-7"/>',
  transfer: '<path stroke-linecap="round" stroke-linejoin="round" d="M7 16l5-5 5 5M7 9l5 5 5-5"/>',

  // ---- ui ----
  home: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h3m10-11a1 1 0 011 1v9a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 00-1-1h-2a1 1 0 00-1 1v4a1 1 0 01-1 1h-2a1 1 0 01-1-1z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path stroke-linecap="round" d="M3 8h18M8 4v4M16 4v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path stroke-linecap="round" d="M12 7v5l3.5 2"/>',
  download: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  upload: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M19 8l-7-7-7 7M12 3v12"/>',
  refresh: '<path stroke-linecap="round" stroke-linejoin="round" d="M23 4v6h-6M1 20v-6h6"/><path stroke-linecap="round" d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>',
  filter: '<path stroke-linecap="round" stroke-linejoin="round" d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
  sort: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M3 12h18M3 18h18"/>',
  edit: '<path stroke-linecap="round" stroke-linejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  trash: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path stroke-linecap="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path stroke-linecap="round" d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>',
  search2: '<circle cx="11" cy="11" r="7"/><path stroke-linecap="round" d="M21 21l-4.3-4.3"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 8v4M12 16h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 16v-4M12 8h.01"/>',
  success: '<circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4"/>',
  warning: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M12 3l9.5 16.5H2.5L12 3z"/>',
  error: '<circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M15 9l-6 6M9 9l6 6"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4"/>',
  xCircle: '<circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M15 9l-6 6M9 9l6 6"/>',
  alertCircle: '<circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 8v4M12 16h.01"/>',
  infoCircle: '<circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 16v-4M12 8h.01"/>',
  question: '<circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>',
  help: '<circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>',

  // ---- feedback ----
  star: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  heart: '<path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>',
  thumbsUp: '<path stroke-linecap="round" stroke-linejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h-3a2 2 0 01-2-2 2 2 0 012-2h3"/>',
  thumbsDown: '<path stroke-linecap="round" stroke-linejoin="round" d="M10 15v5a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM14 2H20a2 2 0 012 2 2 2 0 01-2 2h-3l-2-2z"/>',
  bookmark: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/>',
  flag: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line stroke-linecap="round" x1="4" y1="22" x2="20" y2="22"/>',

  // ---- media ----
  camera: '<path stroke-linecap="round" stroke-linejoin="round" d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path stroke-linecap="round" d="M21 15l-5-5L5 21"/>',
  video: '<path stroke-linecap="round" stroke-linejoin="round" d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  music: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  file: '<path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path stroke-linecap="round" d="M14 2v6h6"/><path stroke-linecap="round" d="M16 13H8M16 17H8M10 9H8"/>',
  folder: '<path stroke-linecap="round" stroke-linejoin="round" d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>',
  bookmarkAdd: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/><path stroke-linecap="round" d="M12 8v8M8 12h8"/>',
  bookmarkCheck: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4"/>',
  bookmarkMinus: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/><path stroke-linecap="round" d="M12 8v1"/>',
  bookmarkX: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/><path stroke-linecap="round" d="M15 9l-6 6M9 9l6 6"/>',
  starFill: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  heartFill: '<path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>',

  // ---- more ----
  moreHorizontal: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  moreVertical: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  slider: '<line stroke-linecap="round" x1="4" y1="6" x2="20" y2="6"/><line stroke-linecap="round" x1="4" y1="12" x2="20" y2="12"/><line stroke-linecap="round" x1="4" y1="18" x2="20" y2="18"/>',
  toggleLeft: '<rect x="1" y="6" width="18" height="12" rx="6"/><circle cx="5" cy="12" r="2" fill="currentColor" stroke="none"/>',
  toggleRight: '<rect x="1" y="6" width="18" height="12" rx="6"/><circle cx="19" cy="12" r="2" fill="currentColor" stroke="none"/>',
  eye: '<path stroke-linecap="round" stroke-linejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path stroke-linecap="round" stroke-linejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path stroke-linecap="round" d="M7 11V7a5 5 0 0110 0v4"/>',
  unlock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path stroke-linecap="round" d="M7 11V7a5 5 0 019.9-1"/>',
  phone: '<path stroke-linecap="round" stroke-linejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>',
  mail: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  map: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
  location: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
  folderOpen: '<path stroke-linecap="round" stroke-linejoin="round" d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>',
  calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><line stroke-linecap="round" x1="8" y1="6" x2="16" y2="6"/><line stroke-linecap="round" x1="8" y1="10" x2="16" y2="10"/><line stroke-linecap="round" x1="8" y1="14" x2="16" y2="14"/><line stroke-linecap="round" x1="8" y1="18" x2="12" y2="18"/>',
  invoice: '<path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path stroke-linecap="round" d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  piggyBank: '<ellipse cx="12" cy="13" rx="9" ry="7"/><path stroke-linecap="round" d="M3 13V9a9 9 0 0118 0v4"/><path stroke-linecap="round" d="M7 13v3M17 13v3"/><circle cx="7" cy="16" r="1" fill="currentColor" stroke="none"/><circle cx="17" cy="16" r="1" fill="currentColor" stroke="none"/>',
  chart: '<path stroke-linecap="round" stroke-linejoin="round" d="M18 20V10M12 20V4M6 20v-6"/>',
  pieChart: '<circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 2a10 10 0 010 20"/><circle cx="12" cy="12" r="4"/>',
  barChart: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 20V10M18 20V4M6 20v-4"/>',
  trendUp: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  trendDown: '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
  arrowUp: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 19V5M5 12l7-7 7 7"/>',
  arrowDown: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M19 12l-7 7-7-7"/>',
  leftArrow: '<path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5M12 19l-7-7 7-7"/>',
  rightArrow: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/>',
  upArrow: '<path stroke-linecap="round" stroke-linejoin="round" d="M18 15l-6-6-6 6"/>',
  downArrow: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/>',
  refreshCw: '<path stroke-linecap="round" stroke-linejoin="round" d="M23 4v6h-6M1 20v-6h6"/><path stroke-linecap="round" d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>',
  loader: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-6.219-8.56"/>',
  spinner: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 2a10 10 0 11-5.636 1.968"/><path stroke-linecap="round" d="M12 2v6l4.24 2.12"/>',
  loaderCircle: '<circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 2a10 10 0 0110 10"/>',

  // ---- other ----
  gift: '<path stroke-linecap="round" stroke-linejoin="round" d="M20 5H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2z"/><rect x="6" y="2" width="12" height="6" rx="3"/><path stroke-linecap="round" d="M6 8h12M8 12h8M10 16h4"/>',
  shield: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  fire: '<path stroke-linecap="round" stroke-linejoin="round" d="M8 12h8M10 8l4 8 4-8M12 4v12"/>',
  clipboard: '<path stroke-linecap="round" stroke-linejoin="round" d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line stroke-linecap="round" x1="8" y1="10" x2="16" y2="10"/><line stroke-linecap="round" x1="8" y1="14" x2="16" y2="14"/>',
  creditCard: '<rect x="1" y="4" width="22" height="16" rx="2"/><path stroke-linecap="round" d="M1 10h22"/>',
  tag: '<path stroke-linecap="round" stroke-linejoin="round" d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5"/>',
  receipt: '<path stroke-linecap="round" stroke-linejoin="round" d="M20 7h-9M20 7H5M20 7v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7M5 7h14"/><line stroke-linecap="round" x1="8" y1="11" x2="16" y2="11"/><line stroke-linecap="round" x1="8" y1="15" x2="12" y2="15"/>',
  airplane: '<path stroke-linecap="round" stroke-linejoin="round" d="M17.8 19.2l-.6-.28a2 2 0 00-1.6-.1l-1.1.45a2 2 0 01-1.6.1l-1.1-.45a2 2 0 00-1.6-.1l-1.1.45a2 2 0 01-1.6.1l-1.1-.45a2 2 0 00-1.6-.1l-1.1.45a2 2 0 01-1.6.1L2.8 19.2a1 1 0 00.9 1.4h16.8a1 1 0 00.9-1.4z"/>',
  scale: '<path stroke-linecap="round" stroke-linejoin="round" d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  wifi: '<path stroke-linecap="round" d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M2.86 5.78a20 20 0 0124.12 0"/><line stroke-linecap="round" x1="12" y1="20" x2="12.01" y2="20"/>',
  battery: '<rect x="1" y="6" width="18" height="12" rx="2"/><path stroke-linecap="round" d="M23 13v2M23 17h2M23 21h2M20 21H4a2 2 0 01-2-2V7a2 2 0 012-2h3l2-3h6l2 3h3a2 2 0 012 2v4a1 1 0 01-1 1h-1a1 1 0 01-1-1V7"/>',
  bluetooth: '<path stroke-linecap="round" stroke-linejoin="round" d="M6.41 4.59a8 8 0 000 11.82M17.59 4.59a8 8 0 010 11.82M12 2a10 10 0 017.07 2.93L12 7.07A4 4 0 009.93 10 4 4 0 0012 14l2.07-2.07A10 10 0 0112 2z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>',
  headphones: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>',
  mic: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>',
  camera2: '<path stroke-linecap="round" stroke-linejoin="round" d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>',
  printer: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 9h12M6 9v7M18 9v7"/>',
  scanner: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>',
  qr: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path stroke-linecap="round" d="M9 3v2M9 19v2M3 9h2M19 9h2M19 3h2M19 19h2M3 19h2"/>',
  barcode: '<line stroke-linecap="round" x1="4" y1="20" x2="20" y2="20"/><rect x="6" y="6" width="1" height="12"/><rect x="10" y="6" width="1" height="12"/><rect x="14" y="6" width="1" height="12"/><rect x="18" y="6" width="1" height="12"/><line stroke-linecap="round" x1="7" y1="8" x2="7" y2="12"/><line stroke-linecap="round" x1="11" y1="8" x2="11" y2="12"/><line stroke-linecap="round" x1="15" y1="8" x2="15" y2="12"/><line stroke-linecap="round" x1="19" y1="8" x2="19" y2="12"/>',
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