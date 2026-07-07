window.dsStats = { trainNS: 0, trainSp: 0, testNS: 0, testSp: 0 };


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
  const targetPane = document.getElementById(`pane-${t}`);
  if (targetPane && targetPane.classList.contains('active')) {
    return; // Cegah double-click menghapus card
  }

  document.querySelectorAll('.tabs > .tab-btn').forEach((b, i) => {
    const isActive = (i === 0 && t === 'text') || (i === 1 && t === 'csv') || (i === 2 && t === 'history');
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  document.getElementById('pane-text').classList.toggle('active', t === 'text');
  document.getElementById('pane-csv').classList.toggle('active', t === 'csv');
  const ph = document.getElementById('pane-history');
  if (ph) ph.classList.toggle('active', t === 'history');
  if (t === 'history') loadHistory();
  else {
    // Tutup mode pilih data otomatis jika pindah ke tab lain
    if (typeof toggleSelectMode === 'function' && typeof _selectMode !== 'undefined' && _selectMode) {
      toggleSelectMode();
    }
  }
  // Simpan state ke URL hash
  window.location.hash = t;
  
  // Perbaiki posisi scroll (bug di Mode CSV tertahan tengah layar)
  if (t === 'csv') {
    setTimeout(() => window.scrollTo(0, 0), 50);
  }
  
  // Re-trigger animasi scroll-reveal untuk tab yang aktif
  const activePane = document.getElementById(`pane-${t}`);
  if (activePane && typeof window.observeScrollReveal === 'function') {
    activePane.querySelectorAll('.scroll-reveal').forEach(el => {
      window.observeScrollReveal(el);
    });
  }
}


// Restore tab state saat halaman dimuat
window.addEventListener('hashchange', () => {
  const tab = window.location.hash.substring(1) || 'text';
  if (['text', 'csv', 'history'].includes(tab)) switchTab(tab);
});

document.addEventListener('DOMContentLoaded', function initTabState() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

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
  document.documentElement.classList.toggle('dark', isDark);
  _applyThemeIcons(isDark);
  localStorage.setItem('darkMode', isDark ? '1' : '0');
  const metaTheme = document.getElementById('theme-color-meta');
  if (metaTheme) metaTheme.setAttribute('content', isDark ? '#0a0a0a' : '#fafafa');
}

function _applyThemeIcons(isDark) {
  const iconName = isDark ? 'sun' : 'moon';
  const wrappers = document.querySelectorAll('.theme-toggle-btn .theme-icon-wrapper');
  
  wrappers.forEach(wrapper => {
    wrapper.innerHTML = `<i data-lucide="${iconName}" style="width:16px;height:16px;"></i>`;
  });
  
  if (typeof lucide !== 'undefined' && wrappers.length > 0) {
    lucide.createIcons({ nodes: Array.from(wrappers) });
  }

  document.querySelectorAll('.theme-toggle-btn .theme-text').forEach(txt => {
    txt.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  });
}

// Apply saved preference (Default is Dark Mode)
if (localStorage.getItem('darkMode') === '0') {
  document.body.classList.remove('dark');
  document.documentElement.classList.remove('dark');
  // Will be applied after lucide loads via DOMContentLoaded
}

// Apply theme icons after page & lucide are ready
document.addEventListener('DOMContentLoaded', function() {
  const isDark = document.body.classList.contains('dark');
  _applyThemeIcons(isDark);
});


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


// ═══════════════════════════════════════════
// UTILITY: UI State Helpers (hide, showError, setLoading)
// ═══════════════════════════════════════════

function hide(id) { 
  const el = document.getElementById(id);
  if(el) {
    el.classList.remove('active'); 
    el.style.display = 'none'; 
  }
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if(el) {
    el.textContent = msg; 
    el.classList.add('active'); 
    el.style.display = 'block';
  }
}

function setLoading(id, active, display = 'block') {
  const el = document.getElementById(id);
  if(el) {
    if (active) { el.classList.add('active'); el.style.display = display; }
    else { el.classList.remove('active'); el.style.display = 'none'; }
  }
}


// -------------------------------------------
// SCROLL REVEAL OBSERVER
// -------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const revealOptions = {
    root: null,
    rootMargin: '0px 0px -15px 0px',
    threshold: 0.05
  };

  window.revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, revealOptions);

  window.observeScrollReveal = function(el) {
    el.classList.add('scroll-reveal');
    el.classList.remove('active');
    window.revealObserver.unobserve(el); // Wajib di-unobserve agar callback observer terpicu ulang
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.revealObserver.observe(el);
      });
    });
  };

  document.querySelectorAll('.scroll-reveal').forEach(window.observeScrollReveal);
});

