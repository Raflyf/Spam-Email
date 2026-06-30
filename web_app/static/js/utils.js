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
  const tabs = [...document.querySelectorAll('.tabs > .tab-btn')];
  tabs.forEach(b => {
    const isActive = b.getAttribute('data-tab') === t;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  document.getElementById('pane-text').classList.toggle('active', t === 'text');
  document.getElementById('pane-csv').classList.toggle('active', t === 'csv');
  const ph = document.getElementById('pane-history');
  if (ph) ph.classList.toggle('active', t === 'history');
  if (t === 'history') loadHistory();
  else {
    if (typeof toggleSelectMode === 'function' && typeof _selectMode !== 'undefined' && _selectMode) {
      toggleSelectMode();
    }
  }
  // Move sliding pill to active tab
  const activeTab = tabs.find(b => b.getAttribute('data-tab') === t);
  if (activeTab) movePill(activeTab, true);
  window.location.hash = t;
}

// ── Tabs sliding pill orchestration (ref 16) ──
function movePill(tab, animate) {
  const pill = document.querySelector('.tabs-pill');
  if (!pill) return;
  if (!animate) {
    const prev = pill.style.transition;
    pill.style.transition = 'none';
    pill.style.transform = `translateX(${tab.offsetLeft}px)`;
    pill.style.width = `${tab.offsetWidth}px`;
    void pill.offsetWidth; // force reflow
    pill.style.transition = prev;
  } else {
    pill.style.transform = `translateX(${tab.offsetLeft}px)`;
    pill.style.width = `${tab.offsetWidth}px`;
  }
}

// ── Texts reveal orchestration (ref 18) ──
function revealText(block) {
  block.classList.remove('is-hiding');
  block.classList.remove('is-shown');
  void block.offsetHeight;
  block.classList.add('is-shown');
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
  } else {
    // Snap pill to default active tab on first paint
    const activeTab = document.querySelector('.tabs > .tab-btn[aria-selected="true"]');
    if (activeTab) movePill(activeTab, false);
  }

  // Hero texts reveal on load
  document.querySelectorAll('header .t-stagger').forEach(el => revealText(el));
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
// Apply saved preference (Default is Dark Mode)
if (localStorage.getItem('darkMode') === '0') {
  document.body.classList.remove('dark');
  document.querySelectorAll('.theme-toggle-btn .theme-icon').forEach(icon => {
    icon.textContent = '🌙';
  });
  document.querySelectorAll('.theme-toggle-btn .theme-text').forEach(txt => {
    txt.textContent = 'Dark Mode';
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
  // Use transform: scaleX() instead of width for performance (GPU-composited)
  if (fill) fill.style.transform = 'scaleX(' + (pct / 100) + ')';
  if (lbl) lbl.textContent = label || '';
  if (pctEl) pctEl.textContent = pct + '%';
}

// Reset progress bar saat evaluasi baru dimulai (sudah ada di startEval reset block, tambah ini):
const _origResetProgress = () => setProgressBar(0, 'Menunggu...');

