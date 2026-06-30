// ═══════════════════════════════════════════
// REALTIME PREDICT dari model job
// ═══════════════════════════════════════════

let currentJobId = null;

function initRealtimeSection(jobId, availableModels) {
  currentJobId = jobId;
  const sec = document.getElementById('realtimeSection');
  sec.style.display = 'block';

  // Badge model tersedia
  const badges = document.getElementById('realtimeModelBadges');
  badges.innerHTML = '';
  if (availableModels.metode1) {
    badges.innerHTML += `<span class="info-chip" style="color:#4f46e5;">✓ Model Metode 1 siap</span>`;
  }
  if (availableModels.metode2) {
    badges.innerHTML += `<span class="info-chip" style="color:#0284c7;">✓ Model Metode 2 siap</span>`;
  }

  // Tampilkan picker metode jika keduanya ada
  const picker = document.getElementById('realtimeMetodePicker');
  picker.style.display = (availableModels.metode1 && availableModels.metode2) ? 'block' : 'none';

  // Set radio button sesuai model yang tersedia, disable yang tidak ada
  const r1 = document.querySelector('input[name="realtimeMetode"][value="metode1"]');
  const r2 = document.querySelector('input[name="realtimeMetode"][value="metode2"]');
  if (r1) {
    r1.disabled = !availableModels.metode1;
    r1.parentElement.style.opacity = availableModels.metode1 ? '1' : '0.4';
  }
  if (r2) {
    r2.disabled = !availableModels.metode2;
    r2.parentElement.style.opacity = availableModels.metode2 ? '1' : '0.4';
  }

  // Set default ke model yang tersedia
  if (availableModels.metode2 && r2) r2.checked = true;
  else if (availableModels.metode1 && r1) r1.checked = true;

  // Tampilkan section tanpa auto-scroll
  sec.style.display = 'block';
}

function clearRealtime() {
  document.getElementById('realtimeText').value = '';
  hide('realtimeError');
  
  // Smooth fade-out animation before hiding
  const resultEl = document.getElementById('realtimeResult');
  if (resultEl.style.display !== 'none') {
    resultEl.style.transition = 'opacity 0.3s ease-out';
    resultEl.style.opacity = '0';
    setTimeout(() => {
      resultEl.style.display = 'none';
      resultEl.innerHTML = '';
      resultEl.style.opacity = '1';
      resultEl.style.transition = '';
    }, 300);
  }
}

async function analyzeRealtime() {
  hide('realtimeError');
  const text = document.getElementById('realtimeText').value.trim();
  if (!text) { showError('realtimeError', 'Masukkan teks email terlebih dahulu.'); return; }
  if (!currentJobId) { showError('realtimeError', 'Job ID tidak ditemukan.'); return; }

  const picked = document.querySelector('input[name="realtimeMetode"]:checked');
  const metode = picked ? picked.value : 'metode2';

  const btn = document.getElementById('realtimeBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Menganalisis...';

  try {
    const res = await fetch('/predict_job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: currentJobId, text, metode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal prediksi');
    renderRealtimeResult(data, metode);
  } catch (e) {
    showError('realtimeError', e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '⚡ Analisis dengan Model Ini';
  }
}

function renderRealtimeResult(d, metode) {
  const el = document.getElementById('realtimeResult');
  el.style.display = 'block';

  const { naive_bayes: nb, xgboost: xgb, consensus: c, rekomendasi: rek } = d;
  const finalIsSpam = rek ? rek.is_spam : c.is_spam;
  const metodeLabel = metode === 'metode1'
    ? 'Metode 1 (Tanpa Domain Adaptation)' : 'Metode 2 (Domain Adaptation)';

  const spamTags = (rek?.indikator_spam || []).map(r =>
    `<span class="indicator-spam">🚩 ${r}</span>`).join('');
  const hamTags = (rek?.indikator_ham || []).map(r =>
    `<span class="indicator-ham">✓ ${r}</span>`).join('');

  el.innerHTML = `
    <div class="card" style="border-top:4px solid ${finalIsSpam ? 'var(--danger)' : 'var(--success)'};">
      <div style="font-size:13px;font-weight:700;color:var(--gray-400);
           text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">
        Hasil Prediksi — ${metodeLabel}
      </div>

      <!-- Banner -->
      <div class="consensus-banner ${finalIsSpam ? 'spam' : 'ham'}" style="margin-bottom:14px;">
        <div class="consensus-icon">${finalIsSpam ? '🚨' : '✅'}</div>
        <div class="consensus-text">
          <h3>${finalIsSpam ? 'EMAIL INI TERDETEKSI SPAM' : 'EMAIL INI BUKAN SPAM'}</h3>
          <p>${c.agreement ? 'Kedua model sepakat: ' + c.label
      : 'NB: ' + c.nb_vote + ' | XGB: ' + c.xgb_vote + ' — mengikuti XGBoost'}</p>
        </div>
      </div>

      <!-- Rekomendasi -->
      ${rek ? `
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px;
           padding:12px 14px;background:transparent;border-radius:8px;
           border:1px solid var(--border);">
        <div style="flex:1;min-width:180px;">
          <div style="font-size:13px;font-weight:700;color:var(--gray-400);
               text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;">Rekomendasi</div>
          <div style="font-weight:800;color:${rek.is_spam ? 'var(--danger)' : 'var(--success)'};
               font-size:1rem;">${rek.is_spam ? '🚨' : '✅'} ${rek.label}</div>
          <div style="font-size:14px;color:var(--gray-600);margin-top:4px;">${rek.alasan}</div>
        </div>
        <div style="flex:1;min-width:180px;">
          <div style="font-size:13px;font-weight:700;color:var(--gray-400);
               text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;">Indikator</div>
          <div>${spamTags}${hamTags || '<span style="font-size:14px;color:var(--gray-400);">-</span>'}</div>
        </div>
      </div>` : ''}

      <!-- Model cards -->
      <div class="model-row">
        ${[{ name: 'Naive Bayes', m: nb, note: 'Probabilistik' }, { name: 'XGBoost', m: xgb, note: 'Ensemble ★' }]
      .map(({ name, m, note }) => `
          <div class="compare-card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span class="compare-model-title">${name}</span>
              <span class="label-badge ${m.is_spam ? 'spam' : 'ham'}">${m.label}</span>
            </div>
            <div style="font-size:13px;color:var(--gray-400);margin-bottom:8px;">${note}</div>
            <div class="prob-bar-wrap">
              <div class="prob-bar-label"><span>Prob. Spam</span><span>${m.probability}%</span></div>
              <div class="prob-bar-track">
                <div class="prob-bar-fill ${m.is_spam ? 'spam' : 'ham'}" data-width="${m.probability}%" style="width: 0%"></div>
              </div>
            </div>
            <div style="font-size:13px;color:var(--gray-400);margin-top:4px;">
              Threshold: <b>${m.threshold}%</b> | Conf: <b>${m.confidence}</b>
            </div>
          </div>`).join('')}
      </div>
      <div style="margin-top:12px;padding:14px;background:transparent;border:1px solid var(--border);border-radius:8px;font-size:14px;line-height:1.7;color:var(--gray-800);">
        <div style="font-size:13px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Analisis Teks — Kata merah = indikator spam</div>
        ${highlightSpamWords(document.getElementById('realtimeText').value.trim() || '')}
      </div>
    </div>`;

  // Animate probability bars (ref 16)
  requestAnimationFrame(() => {
    el.querySelectorAll('.prob-bar-fill').forEach(bar => {
      bar.style.width = bar.getAttribute('data-width');
    });
  });
}

document.getElementById('realtimeText').addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') analyzeRealtime();
});


// ═══════════════════════════════════════════
// PERBANDINGAN DUA RUN SIDE-BY-SIDE (poin 5)
// ═══════════════════════════════════════════

function compareSelectedRuns() {
  const checked = [...document.querySelectorAll('.hist-check:checked')];
  if (checked.length < 2) { showToast('Pilih minimal 2 eksperimen.'); return; }
  const ids = checked.map(c => c.dataset.jobid);
  const runs = ids.map(id => _historyData.find(h => h.job_id === id)).filter(Boolean);
  if (runs.length < 2) { showToast('Data eksperimen tidak ditemukan.'); return; }
  showCompareModal(runs);
}

function buildTop10(features) {
  if (!features || features.length === 0) return '<div style="color:var(--gray-400);font-size:13px;padding:4px 0;">Tidak ada data.</div>';
  const validFeatures = features.slice(0, 10).filter(f => f.score !== null && f.score !== undefined);
  if (validFeatures.length === 0) return '<div style="color:var(--gray-400);font-size:13px;padding:4px 0;">Tidak ada data.</div>';
  const max = validFeatures[0].score;

  const rows = validFeatures.map((f, i) => `
    <tr style="border-bottom:1px solid var(--border);height:24px;">
      <td style="width:20px;text-align:center;color:var(--gray-400);font-size:12px;padding:2px 0;">${i + 1}</td>
      <td style="font-weight:600;font-size:13px;max-width:85px;white-space:nowrap;
                 overflow:hidden;text-overflow:ellipsis;padding:2px 0;" title="${f.feature}">${f.feature}</td>
      <td style="width:70px;padding:0 4px;">
        <div style="background:var(--gray-100);border-radius:99px;height:5px;overflow:hidden;">
          <div style="background:var(--primary);height:100%;border-radius:99px;
                      width:${max > 0 ? Math.round(f.score / max * 100) : 0}%;"></div>
        </div>
      </td>
      <td style="font-size:12px;color:var(--gray-500);text-align:right;white-space:nowrap;padding:2px 0;">
        ${Math.round(f.score).toLocaleString()}
      </td>
    </tr>`).join('');

  return `
    <table style="width:100%;border-collapse:collapse;line-height:1.2;">
      <tbody>${rows}</tbody>
    </table>`;
}

function showCompareModal(runs) {
  const existing = document.getElementById('compareModal');
  if (existing) existing.remove();

  const colors = ['#818cf8', '#4f46e5', '#38bdf8', '#0284c7', '#34d399', '#f59e0b', '#f87171', '#a78bfa'];
  const metrics = [
    { key: 'nb_acc', label: 'NB Akurasi' },
    { key: 'xgb_acc', label: 'XGB Akurasi' },
    { key: 'nb_f1', label: 'NB F1-Score' },
    { key: 'xgb_f1', label: 'XGB F1-Score' },
  ];

  const headersHtml = metrics.map(m => runs.map((r, i) => `<th style="color:var(--primary);">${m.label}<br><small>Eks ${i + 1}</small></th>`).join('')).join('');

  const rowsHtml = ['metode1', 'metode2'].map(mk => {
    const mLabel = mk === 'metode1' ? 'Metode 1 (Tanpa Adaptasi)' : 'Metode 2 (Domain Adaptasi)';
    const cells = metrics.map(({ key }) => {
      const vals = runs.map(r => r[mk]?.[key] ?? null);
      const max = Math.max(...vals.filter(v => v != null));
      return vals.map(v => {
        const isMax = v === max && max != null;
        return `<td style="${isMax ? 'font-weight:800;color:var(--success);' : ''}">${v != null ? v + '%' : '—'}</td>`;
      }).join('');
    }).join('');
    return `<tr><td><b>${mLabel}</b></td>${cells}</tr>`;
  }).join('');

  const infoCards = runs.map((r, i) => `
    <div style="padding:10px;background:var(--gray-100);border-radius:8px;border-left:3px solid ${colors[i % colors.length]};">
      <b style="color:${colors[i % colors.length]};">Eks ${i + 1}${r.label_name ? ' — ' + r.label_name : ''}</b><br>
      <span style="font-size:13px;color:var(--gray-600);">${r.timestamp}</span><br>
      Adapt: ${Math.round((r.adapt_frac ?? 0) * 100)}% | Test: ${r.n_nonspam ?? 'all'}/${r.n_spam ?? 'all'} | ${r.preset?.toUpperCase()}
      ${r.note ? `<br><i style="color:var(--gray-400);font-size:13px;">"${r.note}"</i>` : ''}
    </div>`).join('');

  // Build chart datasets: one dataset per eksperimen, across 4 metrics
  const chartLabels = ['NB Akurasi', 'XGB Akurasi', 'NB F1', 'XGB F1'];
  const chartDatasets = runs.map((r, i) => ({
    label: (r.label_name || ('Eks ' + (i + 1))) + ' M1',
    data: ['nb_acc', 'xgb_acc', 'nb_f1', 'xgb_f1'].map(k => r.metode1?.[k] ?? null),
    backgroundColor: colors[i % colors.length] + 'bb',
    borderColor: colors[i % colors.length],
    borderWidth: 1
  })).concat(runs.map((r, i) => ({
    label: (r.label_name || ('Eks ' + (i + 1))) + ' M2',
    data: ['nb_acc', 'xgb_acc', 'nb_f1', 'xgb_f1'].map(k => r.metode2?.[k] ?? null),
    backgroundColor: colors[(i + Math.ceil(runs.length / 2)) % colors.length] + 'bb',
    borderColor: colors[(i + Math.ceil(runs.length / 2)) % colors.length],
    borderWidth: 1,
    borderDash: [4, 2]
  })));

  const cmGridsHtml = runs.map((r, i) => {
    let grids = '';
    ['metode1', 'metode2'].forEach(mk => {
      if (!r[mk]) return;
      ['nb', 'xgb'].forEach(alg => {
        const cm = r[mk][alg + '_cm'];
        if (cm) {
          grids += `
            <div style="flex: 0 0 auto; width: 220px;">
              <div style="font-size:13px;font-weight:600;margin-bottom:4px;color:var(--gray-600)">${mk === 'metode1' ? 'M1' : 'M2'} - ${alg.toUpperCase()}</div>
              <table class="cm-table" style="font-size:12px;margin-bottom:0;width:100%;">
                <tr><th></th><th>P. Non-Spam</th><th>P. Spam</th></tr>
                <tr><th>A. Non-Spam</th><td class="tn">${cm.tn}<br><small>TN</small></td><td class="fp">${cm.fp}<br><small>FP</small></td></tr>
                <tr><th>A. Spam</th><td class="fn">${cm.fn}<br><small>FN</small></td><td class="tp">${cm.tp}<br><small>TP</small></td></tr>
              </table>
            </div>`;
        }
      });
    });
    if (!grids) return '';
    return `
      <div style="margin-bottom:16px;background:transparent;border:1px solid var(--border);border-radius:8px;padding:14px;border-left:4px solid ${colors[i % colors.length]};box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div style="font-size:14px;font-weight:700;margin-bottom:12px;color:${colors[i % colors.length]}">Eks ${i + 1}${r.label_name ? ' — ' + r.label_name : ''}</div>
        <div style="display:flex;gap:16px;overflow-x:auto;padding-bottom:6px;">
          ${grids}
        </div>
      </div>
    `;
  }).join('');

  const chiGridsHtml = runs.map((r, i) => {
    let grids = '';
    ['metode1', 'metode2'].forEach(mk => {
      if (!r[mk]) return;
      const top10 = r[mk].top10_chi2;
      if (top10 && top10.length > 0) {
        grids += `
          <div style="flex: 1 1 0; min-width: 170px; max-width: 250px;">
            <div style="font-size:13px;font-weight:600;margin-bottom:4px;color:var(--gray-600)">${mk === 'metode1' ? 'M1 (Pure)' : 'M2 (Adapt)'} - Chi-Square (Naive Bayes)</div>
            <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:6px;padding:6px;">
              ${buildTop10(top10)}
            </div>
          </div>`;
      }
    });
    if (!grids) return '';
    return `
      <div style="margin-bottom:16px;background:transparent;border:1px solid var(--border);border-radius:8px;padding:14px;border-left:4px solid ${colors[i % colors.length]};box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div style="font-size:14px;font-weight:700;margin-bottom:12px;color:${colors[i % colors.length]}">Eks ${i + 1}${r.label_name ? ' — ' + r.label_name : ''}</div>
        <div style="display:flex;gap:16px;overflow-x:auto;padding-bottom:6px;flex-wrap:wrap;">
          ${grids}
        </div>
      </div>
    `;
  }).join('');

  const chartId = 'compareBarChart_' + Date.now();

  const modal = document.createElement('div');
  modal.id = 'compareModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="font-size:16px;font-weight:800;">&#128260; Perbandingan ${runs.length} Eksperimen</h3>
        <button onclick="document.getElementById('compareModal').remove()"
                style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--gray-400);">&#10005;</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;margin-bottom:16px;font-size:14px;">
        ${infoCards}
      </div>
      <div style="overflow-x:auto;margin-bottom:18px;">
        <table class="cm-table" style="font-size:14px;min-width:600px;">
          <thead><tr><th>Model</th>${headersHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div style="font-size:13px;color:var(--success);margin-top:4px;">&#9654; Nilai tertinggi ditampilkan tebal hijau</div>
      </div>
      <div style="margin-top:4px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:8px;">&#128202; Grafik Perbandingan Akurasi &amp; F1</div>
        <canvas id="${chartId}" height="120"></canvas>
      </div>
      <div style="margin-top:20px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:12px;">🟦 Confusion Matrix</div>
        ${cmGridsHtml || '<div style="font-size:13px;color:var(--gray-400)">Tidak ada data Confusion Matrix di histori yang dipilih.</div>'}
      </div>
      <div style="margin-top:20px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:12px;">📊 Top 10 Fitur Chi-Square</div>
        ${chiGridsHtml || '<div style="font-size:13px;color:var(--gray-400)">Tidak ada data Fitur Chi-Square di histori yang dipilih.</div>'}
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  // Draw chart after element exists in DOM
  setTimeout(() => {
    const ctx = document.getElementById(chartId)?.getContext('2d');
    if (!ctx || typeof Chart === 'undefined') return;
    new Chart(ctx, {
      type: 'bar',
      data: { labels: chartLabels, datasets: chartDatasets },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { font: { size: 10 } } },
          tooltip: { callbacks: { label: c => ' ' + c.dataset.label + ': ' + (c.raw ?? '—') + '%' } }
        },
        scales: {
          y: { min: 0, max: 100, ticks: { callback: v => v + '%', font: { size: 10 } }, grid: { color: 'rgba(128,128,128,0.15)' } },
          x: { ticks: { font: { size: 11 } }, grid: { display: false } }
        }
      }
    });
  }, 80);
}

// ═══════════════════════════════════════════
// CATATAN PER EKSPERIMEN (poin 6)
// ═══════════════════════════════════════════

async function editNote(jobId, currentNote) {
  const note = prompt('Catatan untuk eksperimen ini (max 300 karakter):', currentNote || '');
  if (note === null) return;  // cancel
  await fetch('/history/note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, note: note.substring(0, 300) }),
  });
  await loadHistory();  // reload
}


// ═══════════════════════════════════════════
// UPDATE TOMBOL COMPARE di Riwayat
// ═══════════════════════════════════════════
let _selectMode = false;
function toggleSelectMode() {
  _selectMode = !_selectMode;
  const btn = document.getElementById('toggleSelectModeBtn');
  const clearBtn = document.getElementById('clearHistBtn');

  if (_selectMode) {
    btn.innerHTML = '❌ Batal Pilih';
    btn.classList.add('active');
    clearBtn.style.display = 'inline-flex';
    document.querySelectorAll('.select-col').forEach(el => el.style.display = 'table-cell');
    document.querySelectorAll('#historyTbody tr').forEach(tr => tr.style.cursor = 'pointer');
  } else {
    btn.innerHTML = 'Pilih Data';
    btn.classList.remove('active');
    clearBtn.style.display = 'none';
    document.querySelectorAll('.select-col').forEach(el => el.style.display = 'none');
    document.querySelectorAll('#historyTbody tr').forEach(tr => tr.style.cursor = '');
    // Uncheck all when leaving select mode
    const all = document.getElementById('checkAll');
    if (all) all.checked = false;
    toggleCheckAll(all || { checked: false });
  }
}

function toggleRowSelection(e, jobId) {
  if (typeof _selectMode === 'undefined' || !_selectMode) return;
  const tag = e.target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'button') return;
  
  const chk = document.querySelector(`.hist-check[data-jobid="${jobId}"]`);
  if (chk) {
    chk.checked = !chk.checked;
    updateDeleteBtn();
  }
}

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Debounced search untuk history (300ms delay)
const debouncedFilterHistory = debounce(function() {
  const q = document.getElementById('historySearch').value.toLowerCase();
  document.querySelectorAll('#historyTbody tr').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}, 300);

function filterHistory() {
  debouncedFilterHistory();
}

function updateDeleteBtn() {
  const checked = document.querySelectorAll('.hist-check:checked');
  const delBtn = document.getElementById('deleteSelectedBtn');
  const cmpBtn = document.getElementById('compareRunsBtn');
  const all = document.getElementById('checkAll');
  const total = document.querySelectorAll('.hist-check').length;

  if (delBtn) {
    delBtn.style.display = checked.length > 0 ? 'inline-flex' : 'none';
    delBtn.innerHTML = `🗑 Hapus ${checked.length} Terpilih`;
  }
  if (cmpBtn) {
    cmpBtn.style.display = checked.length >= 2 ? 'inline-flex' : 'none';
    cmpBtn.innerHTML = `🔄 Bandingkan ${checked.length} Run`;
  }

  if (all) {
    all.checked = checked.length === total && total > 0;
    all.indeterminate = checked.length > 0 && checked.length < total;
  }

  // Sync visual highlight pada row parent
  document.querySelectorAll('.hist-check').forEach(c => {
    const tr = c.closest('tr');
    if (tr) tr.classList.toggle('selected-row', c.checked);
  });
}

// Sync highlight via event delegation (untuk toggle saat baris diklik)
document.addEventListener('change', e => {
  if (e.target && e.target.classList && e.target.classList.contains('hist-check')) {
    const tr = e.target.closest('tr');
    if (tr) tr.classList.toggle('selected-row', e.target.checked);
  }
});
let _historyData = [];
let _histChart = null;

async function togglePin(jobId) {
  const h = _historyData.find(x => x.job_id === jobId);
  if (!h) return;
  h.is_pinned = !h.is_pinned;
  renderHistory(); // optimistic update

  try {
    await fetch('/history/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, is_pinned: h.is_pinned })
    });
  } catch (e) {
    console.error(e);
    h.is_pinned = !h.is_pinned; // revert on fail
    renderHistory();
  }
}

async function loadHistory() {
  try {
    const res = await fetch('/history');
    _historyData = await res.json();
    
    // Update badge di tab riwayat jika elemen tersedia
    const histTabText = document.getElementById('histTabText');
    if (histTabText && _historyData.length > 0) {
      histTabText.textContent = 'Riwayat (' + _historyData.length + ')';
    }

    renderHistory();
  } catch (e) { console.warn('Gagal load history:', e); }
}

let _sortKey = 'no';
let _sortAsc = true;   // default: No 1 di atas (ascending = lama dulu)

function sortHistory(key) {
  if (_sortKey === key) {
    _sortAsc = !_sortAsc;
  } else {
    _sortKey = key;
    _sortAsc = key === 'no' || key === 'time';  // no & time default ascending
  }
  renderHistory();
}

function renderHistory() {
  const empty = document.getElementById('historyEmpty');
  const wrap = document.getElementById('historyTableWrap');
  const tbody = document.getElementById('historyTbody');
  const chartCard = document.getElementById('historyChartCard');
  const exportBtn = document.getElementById('exportHistBtn');
  const clearBtn = document.getElementById('clearHistBtn');

  if (!_historyData.length) {
    empty.style.display = 'block';
    wrap.style.display = 'none';
    chartCard.style.display = 'none';
    exportBtn.disabled = true; clearBtn.disabled = true;
    return;
  }

  empty.style.display = 'none';
  wrap.style.display = 'block';
  chartCard.style.display = 'block';
  exportBtn.disabled = false; clearBtn.disabled = false;

  // Assign nomor urut (1 = terlama, n = terbaru) sebelum sort
  // _historyData sudah urut terbaru di atas dari /history endpoint
  let q = document.getElementById('historySearch')?.value.toLowerCase() || '';
  let dataToRender = _historyData;
  if (q) dataToRender = _historyData.filter(h => JSON.stringify(h).toLowerCase().includes(q));
  const withNo = [...dataToRender].reverse().map((h, i) => ({ ...h, _no: i + 1 }));

  // Sort
  const sorted = withNo.sort((a, b) => {
    let va, vb;
    switch (_sortKey) {
      case 'no': va = a._no; vb = b._no; break;
      case 'time': va = a.timestamp; vb = b.timestamp; break;
      case 'preset': va = a.preset; vb = b.preset; break;
      case 'adapt': va = a.adapt_frac ?? 0; vb = b.adapt_frac ?? 0; break;
      case 'nb_m1': va = a.metode1?.nb_acc ?? -1; vb = b.metode1?.nb_acc ?? -1; break;
      case 'xgb_m1': va = a.metode1?.xgb_acc ?? -1; vb = b.metode1?.xgb_acc ?? -1; break;
      case 'nb_m2': va = a.metode2?.nb_acc ?? -1; vb = b.metode2?.nb_acc ?? -1; break;
      case 'xgb_m2': va = a.metode2?.xgb_acc ?? -1; vb = b.metode2?.xgb_acc ?? -1; break;
      case 'elapsed': va = a.elapsed_s ?? 0; vb = b.elapsed_s ?? 0; break;
      default: va = a._no; vb = b._no;
    }
    if (va < vb) return _sortAsc ? -1 : 1;
    if (va > vb) return _sortAsc ? 1 : -1;
    return 0;
  });

  // Update sort indicator icons
  const cols = ['no', 'time', 'preset', 'adapt', 'nb_m1', 'xgb_m1', 'nb_m2', 'xgb_m2', 'elapsed'];
  cols.forEach(c => {
    const el = document.getElementById('sort_' + c);
    if (!el) return;
    el.textContent = _sortKey === c ? (_sortAsc ? ' ▲' : ' ▼') : ' ⇅';
    el.style.opacity = _sortKey === c ? '1' : '0.3';
  });

  tbody.innerHTML = sorted.map(h => {
    const m1 = h.metode1, m2 = h.metode2;
    const acc = v => v != null ? `<b>${v}%</b>` : '<span style="color:var(--gray-300);">—</span>';
    const statusBadge = h.status === 'done'
      ? '<span style="color:var(--success);font-size:13px;">✓ Selesai</span>'
      : h.status === 'cancelled'
        ? '<span style="color:var(--warning);font-size:13px;">⏹ Dibatalkan</span>'
        : '<span style="color:var(--danger);font-size:13px;">✗ Error</span>';
    const adaptPct = h.adapt_frac != null
      ? `<span style="font-weight:700;color:#0284c7;">${Math.round(h.adapt_frac * 100)}%</span>`
      : '<span style="color:var(--gray-300);">—</span>';
    const trainNS = (h.n_train_nonspam > 0) ? h.n_train_nonspam : 'all';
    const trainSp = (h.n_train_spam > 0) ? h.n_train_spam : 'all';
    const isPinned = !!h.is_pinned;
    const nameAttr = h.label_name ? ` data-label="${h.label_name.replace(/"/g, '&quot;')}"` : '';
    const nameStyle = h.label_name ? ' style="white-space:nowrap;cursor:default;text-decoration:underline dotted var(--primary);"' : ' style="white-space:nowrap;"';
    return `<tr class="${isPinned ? 'pinned-row' : ''}" style="${isPinned ? 'background:#fffbeb;' : ''}${_selectMode ? 'cursor:pointer;' : ''}" onclick="toggleRowSelection(event, '${h.job_id}')">
      <td class="select-col" style="display:${_selectMode ? 'table-cell' : 'none'};">
        <input type="checkbox" class="hist-check" data-jobid="${h.job_id}"
               onchange="updateDeleteBtn()"
               style="accent-color:var(--primary);cursor:pointer;">
      </td>
      <td>${h._no}</td>
      <td style="white-space:nowrap;text-align:center;">
        <button onclick="togglePin('${h.job_id}')"
                class="${isPinned ? 'pin-star-filled' : 'pin-star-empty'}"
                style="background:none;border:none;cursor:pointer;font-size:15px;padding:0 2px;vertical-align:middle;"
                title="${isPinned ? 'Hapus pin' : 'Pin eksperimen ini'}">${isPinned ? '&#9733;' : '&#9734;'}</button>
      </td>
      <td${nameAttr}${nameStyle}>${h.timestamp}</td>
      <td>
        <span style="text-transform:uppercase;font-size:13px;font-weight:700;
          color:${h.preset === 'full' ? 'var(--warning)' : 'var(--success)'};">${h.preset}</span>
        <br>
        <span style="font-size:12px;background:var(--gray-700);color:#fff;padding:2px 4px;border-radius:4px;white-space:nowrap;display:inline-block;margin-top:2px;">
          ${h.custom_train ? 'Train+Test' : 'Hanya Test'}
        </span>
      </td>
      <td>
        <div style="font-size:12px; opacity:0.9; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(h.train_dataset_name || (h.custom_train ? 'Custom Train' : 'emails.csv (bawaan)'))}">
          <span style="opacity:0.6; font-weight:bold;">Tr:</span> ${escapeHtml(h.train_dataset_name || (h.custom_train ? 'Custom Train' : 'emails.csv (bawaan)'))}
        </div>
        <div style="font-size:12px; opacity:0.9; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px;" title="${escapeHtml(h.test_dataset_name || 'data_test_berlabel_awal.csv')}">
          <span style="opacity:0.6; font-weight:bold;">Ts:</span> ${escapeHtml(h.test_dataset_name || 'data_test_berlabel_awal.csv')}
        </div>
      </td>
      <td>${trainNS}/${trainSp}</td>
      <td>${h.n_nonspam || 'all'}/${h.n_spam || 'all'}</td>
      <td>${adaptPct}</td>
      <td style="font-weight:700;color:var(--success);">${h.adapt_weight != null ? h.adapt_weight + '\u00d7' : '8\u00d7'}</td>
      <td>${m1 ? acc(m1.nb_acc) : '\u2014'}</td>
      <td>${m1 ? acc(m1.xgb_acc) : '\u2014'}</td>
      <td>${m2 ? acc(m2.nb_acc) : '\u2014'}</td>
      <td>${m2 ? acc(m2.xgb_acc) : '\u2014'}</td>
      <td>${h.elapsed_s}s</td>
      <td>${statusBadge}</td>
      <td style="white-space:nowrap;">
        <span style="font-size:13px;color:var(--gray-600);max-width:90px;display:inline-block;
              overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;"
              title="${h.note || ''}">${h.note || ''}</span>
        <button onclick="editNote('${h.job_id}','${(h.note || '').replace(/'/g, '\\\'')}')"
                style="background:none;border:none;cursor:pointer;font-size:14px;
                       color:var(--gray-400);padding:0 2px;vertical-align:middle;" title="Edit catatan">&#9998;</button>
      </td>
      </tr>`;
  }).join('');

  updateDeleteBtn();
  renderHistoryChart();
}

function renderHistoryChart() {
  const metric = document.getElementById('chartMetric')?.value || 'acc';
  const key = metric === 'acc' ? 'acc' : 'f1';
  const chronData = [..._historyData].reverse();   // urut lama→baru
  const labels = chronData.map((h, i) => ['Eks #' + (i + 1), h.timestamp.slice(5, 16)]);

  // Pakai bar chart — lebih jelas untuk data sedikit
  const barData = [
    { label: 'NB M1', data: chronData.map(h => h.metode1?.[`nb_${key}`] ?? null), backgroundColor: '#818cf8' },
    { label: 'XGB M1', data: chronData.map(h => h.metode1?.[`xgb_${key}`] ?? null), backgroundColor: '#4f46e5' },
    { label: 'NB M2', data: chronData.map(h => h.metode2?.[`nb_${key}`] ?? null), backgroundColor: '#38bdf8' },
    { label: 'XGB M2', data: chronData.map(h => h.metode2?.[`xgb_${key}`] ?? null), backgroundColor: '#0284c7' },
  ];

  const ctx = document.getElementById('historyChart').getContext('2d');
  if (_histChart) _histChart.destroy();
  _histChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: barData },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: c => ' ' + c.dataset.label + ': ' + (c.raw ?? '—') + '%',
          }
        },
        datalabels: false,
      },
      scales: {
        y: {
          min: 0, max: 100,
          ticks: { callback: v => v + '%', font: { size: 10 } },
          title: { display: true, text: metric === 'acc' ? 'Akurasi (%)' : 'F1-Score (%)' },
          grid: { color: 'rgba(128,128,128,0.15)' },
        },
        x: {
          ticks: { font: { size: 10 } },
          grid: { display: false },
        },
      },
    },
  });
}

function exportHistoryCSV() {
  if (!_historyData.length) return;
  const rows = [['#', 'Waktu', 'Preset', 'Train NS', 'Train Sp', 'Test NS', 'Test Sp', 'Adapt %', 'Weight ×', 'NB M1 Acc', 'XGB M1 Acc', 'NB M2 Acc', 'XGB M2 Acc', 'NB M1 F1', 'XGB M1 F1', 'NB M2 F1', 'XGB M2 F1', 'Waktu(s)', 'Status']];
  _historyData.forEach((h, i) => {
    const m1 = h.metode1 || {}, m2 = h.metode2 || {};
    rows.push([_historyData.length - i, h.timestamp, h.preset,
    h.n_train_nonspam || 'all', h.n_train_spam || 'all',
    h.n_nonspam, h.n_spam,
    h.adapt_frac != null ? Math.round(h.adapt_frac * 100) + '%' : '-',
    h.adapt_weight != null ? h.adapt_weight + '×' : '-',
    m1.nb_acc ?? '', m1.xgb_acc ?? '', m2.nb_acc ?? '', m2.xgb_acc ?? '',
    m1.nb_f1 ?? '', m1.xgb_f1 ?? '', m2.nb_f1 ?? '', m2.xgb_f1 ?? '',
    h.elapsed_s, h.status]);
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  downloadFile('\uFEFF' + csv, 'riwayat_eksperimen_' + getNowStr() + '.csv', 'text/csv;charset=utf-8');
}

async function clearHistory() {
  if (!confirm('Hapus semua riwayat eksperimen?')) return;
  await fetch('/history/clear', { method: 'POST' });
  _historyData = [];
  
  const histTabText = document.getElementById('histTabText');
  if (histTabText) histTabText.textContent = 'Riwayat';
  
  renderHistory();
  showToast('Semua riwayat berhasil dihapus.');
}

function toggleCheckAll(cb) {
  document.querySelectorAll('.hist-check').forEach(c => c.checked = cb.checked);
  updateDeleteBtn();
}

async function deleteSelectedHistory() {
  const checked = document.querySelectorAll('.hist-check:checked');
  if (!checked.length) return;
  const ids = [...checked].map(c => c.dataset.jobid);
  if (!confirm(`Hapus ${ids.length} entri terpilih?`)) return;

  const res = await fetch('/history/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_ids: ids }),
  });
  const d = await res.json();
  if (d.ok) {
    await loadHistory();  // reload dari server
  } else {
    alert('Gagal menghapus: ' + (d.error || 'Unknown error'));
  }
}

// Catat waktu mulai evaluasi
async function startEval() {
  window._evalStartTime = Date.now();

  hide('csvError');
  if (!csvFile) { showError('csvError', 'Pilih file CSV test terlebih dahulu.'); return; }
  if (uploadMode === 'custom_train' && !csvTrain) {
    showError('csvError', 'Mode Custom Train: pilih file CSV training terlebih dahulu.'); return;
  }
  const m1 = document.getElementById('chkM1').checked;
  const m2 = document.getElementById('chkM2').checked;
  if (!m1 && !m2) { showError('csvError', 'Pilih minimal satu metode.'); return; }

  const frac = parseInt(document.getElementById('adaptFrac').value) / 100;
  const weight = parseFloat(document.getElementById('adaptWeight').value);
  const nNonSpam = parseInt(document.getElementById('nNonSpam').value) || 0;
  const nSpamVal = parseInt(document.getElementById('nSpam').value) || 0;
  const preset = document.querySelector('input[name="preset"]:checked').value;

  const fd = new FormData();
  fd.append('file_test', csvFile);
  if (uploadMode === 'custom_train' && csvTrain) fd.append('file_train', csvTrain);
  fd.append('run_m1', m1 ? 'true' : 'false');
  fd.append('run_m2', m2 ? 'true' : 'false');
  fd.append('adapt_frac', frac);
  fd.append('adapt_weight', weight);
  fd.append('n_nonspam', nNonSpam);
  fd.append('n_spam', nSpamVal);
  fd.append('preset', preset);
  fd.append('n_train_nonspam', parseInt(document.getElementById('nTrainNonSpam').value) || 0);
  fd.append('n_train_spam', parseInt(document.getElementById('nTrainSpam').value) || 0);
  const labelName = document.getElementById('evalLabel')?.value.trim() || '';
  if (labelName) fd.append('label_name', labelName);

  const evalBtn = document.getElementById('evalBtn');
  evalBtn.disabled = true;
  evalBtn.textContent = '⏳ Memproses...';
  disableCsvInputs(); // Disable CSV inputs saat job running
  // Reset hasil sebelumnya — hapus juga dari server agar tidak muncul kembali saat refresh
  fetch('/last_result/clear', { method: 'POST' }).catch(() => { });
  document.getElementById('csvResults').style.display = 'none';
  document.getElementById('csvResults').innerHTML = '';
   document.getElementById('realtimeSection').style.display = 'none';
   document.getElementById('realtimeResult').innerHTML = '';
   document.getElementById('realtimeText').value = '';
   currentJobId = null;
   sessionStorage.removeItem('lastJobId');
   localStorage.removeItem('lastJobId');
   hide('realtimeError');
  document.getElementById('progressLog').textContent = '';
  setProgressBar(0, 'Menunggu...');
  setLoading('csvLoading', true);

  try {
    const res = await fetch('/evaluate', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload gagal');
    sessionStorage.setItem('lastRunningJobId', data.job_id);
    _showCancelBtn(data.job_id);
    pollJob(data.job_id);
  } catch (e) {
    setLoading('csvLoading', false);
    evalBtn.disabled = false;
    evalBtn.textContent = '▶ Mulai Evaluasi';
    enableCsvInputs();
    showError('csvError', e.message);
  }
}


// Duplicate darkMode init removed


function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
// Override native alert
window.alert = (msg) => showToast(msg, 'info');

window.addEventListener('beforeunload', () => {
  if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
  if (_histChart) { _histChart.destroy(); _histChart = null; }
});


(function () {
  const tip = document.getElementById('histTooltip');
  document.addEventListener('mouseover', function (e) {
    const td = e.target.closest('td[data-label]');
    if (td) {
      tip.textContent = td.getAttribute('data-label');
      tip.style.display = 'block';
    }
  });
  document.addEventListener('mousemove', function (e) {
    if (tip.style.display === 'block') {
      tip.style.left = (e.clientX + 14) + 'px';
      tip.style.top = (e.clientY + 14) + 'px';
    }
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest('td[data-label]')) tip.style.display = 'none';
  });
})();
