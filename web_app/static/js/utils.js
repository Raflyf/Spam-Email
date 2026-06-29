window.dsStats = { trainNS: 4360, trainSp: 1368, testNS: 0, testSp: 0 };


// ═══════════════════════════════════════════
// UTILITY: Escape HTML untuk XSS prevention
// ═══════════════════════════════════════════

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// ═══════════════════════════════════════════
// TAB SWITCHING + Persistence via URL hash
// ═══════════════════════════════════════════

function switchTab(t) {
  document.querySelectorAll('.tabs > .tab-btn').forEach((b, i) =>
    b.classList.toggle('active', (i === 0 && t === 'text') || (i === 1 && t === 'csv') || (i === 2 && t === 'history')));
  document.getElementById('pane-text').classList.toggle('active', t === 'text');
  document.getElementById('pane-csv').classList.toggle('active', t === 'csv');
  const ph = document.getElementById('pane-history');
  if (ph) ph.classList.toggle('active', t === 'history');
  if (t === 'history') loadHistory();
  // Simpan state ke URL hash
  window.location.hash = t;
}

// Restore tab state saat halaman dimuat
window.addEventListener('hashchange', () => {
  const tab = window.location.hash.substring(1) || 'text';
  if (['text', 'csv', 'history'].includes(tab)) switchTab(tab);
});

document.addEventListener('DOMContentLoaded', function initTabState() {
  const hash = window.location.hash.substring(1) || 'text';
  if (['text', 'csv', 'history'].includes(hash)) {
    switchTab(hash);
  }
});


// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// DARK MODE
// ═══════════════════════════════════════════

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  document.querySelectorAll('.theme-toggle-btn .theme-icon').forEach(icon => {
    icon.textContent = isDark ? '☀️' : '🌙';
  });
  document.querySelectorAll('.theme-toggle-btn .theme-text').forEach(txt => {
    txt.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  });
  localStorage.setItem('darkMode', isDark ? '1' : '0');
}
// Apply saved preference
if (localStorage.getItem('darkMode') === '1') {
  document.body.classList.add('dark');
  document.querySelectorAll('.theme-toggle-btn .theme-icon').forEach(icon => {
    icon.textContent = '☀️';
  });
  document.querySelectorAll('.theme-toggle-btn .theme-text').forEach(txt => {
    txt.textContent = 'Light Mode';
  });
}


// ═══════════════════════════════════════════
// PROGRESS BAR (poin 7)
// ═══════════════════════════════════════════

const _progressStagesM1 = [
  { key: 'Memuat data', pct: 8 },
  { key: 'Memvalidasi', pct: 15 },
  { key: 'balancing', pct: 20 },
  { key: 'Metode 1', pct: 25 },
  { key: 'preprocessing', pct: 30 },
  { key: 'TF-IDF', pct: 45 },
  { key: 'Naive Bayes', pct: 60 },
  { key: 'XGBoost', pct: 75 },
  { key: 'selesai', pct: 100 },
];

const _progressStagesM2 = [
  { key: 'Memuat data', pct: 8 },
  { key: 'Memvalidasi', pct: 15 },
  { key: 'balancing', pct: 20 },
  { key: 'Metode 2', pct: 78 },
  { key: 'preprocessing', pct: 82 },
  { key: 'TF-IDF', pct: 85 },
  { key: 'Naive Bayes', pct: 90 },
  { key: 'XGBoost', pct: 95 },
  { key: 'selesai', pct: 100 },
];

function updateProgressBar(progressLines) {
  if (!progressLines || !progressLines.length) return;
  const last = progressLines[progressLines.length - 1].toLowerCase();
  const isM2 = last.includes('metode 2');
  const stages = isM2 ? _progressStagesM2 : _progressStagesM1;
  let bestPct = 5, bestLabel = 'Memulai...';
  for (const s of stages) {
    if (last.includes(s.key.toLowerCase())) {
      if (s.pct > bestPct) { bestPct = s.pct; bestLabel = s.key + '...'; }
    }
  }
  setProgressBar(bestPct, bestLabel);
}

function setProgressBar(pct, label) {
  const fill = document.getElementById('progressBarFill');
  const lbl = document.getElementById('progressLabel');
  const pctEl = document.getElementById('progressPct');
  if (fill) fill.style.width = pct + '%';
  if (lbl) lbl.textContent = label || '';
  if (pctEl) pctEl.textContent = pct + '%';
}

// Reset progress bar saat evaluasi baru dimulai (sudah ada di startEval reset block, tambah ini):
const _origResetProgress = () => setProgressBar(0, 'Menunggu...');

