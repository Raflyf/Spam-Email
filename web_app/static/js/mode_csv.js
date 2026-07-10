// ═══════════════════════════════════════════
// MODE CSV
// ═══════════════════════════════════════════

let csvFile = null;
let csvTrain = null;
let uploadMode = 'test_only';

// Fungsi untuk disable/enable CSV inputs saat job running
function disableCsvInputs() {
  const csvFileInput = document.getElementById('csvFile');
  const csvTrainInput = document.getElementById('csvTrain');
  const dropZone = document.querySelector('[onclick*="csvFile"]');
  const dropZoneTrain = document.querySelector('[onclick*="csvTrain"]');
  const modeTestOnly = document.getElementById('modeTestOnly');
  const modeCustomTrain = document.getElementById('modeCustomTrain');
  
  if (csvFileInput) csvFileInput.disabled = true;
  if (csvTrainInput) csvTrainInput.disabled = true;
  if (dropZone) {
    dropZone.style.opacity = '0.5';
    dropZone.style.pointerEvents = 'none';
  }
  if (dropZoneTrain) {
    dropZoneTrain.style.opacity = '0.5';
    dropZoneTrain.style.pointerEvents = 'none';
  }
  if (modeTestOnly) modeTestOnly.disabled = true;
  if (modeCustomTrain) modeCustomTrain.disabled = true;
}

function enableCsvInputs() {
  const csvFileInput = document.getElementById('csvFile');
  const csvTrainInput = document.getElementById('csvTrain');
  const dropZone = document.querySelector('[onclick*="csvFile"]');
  const dropZoneTrain = document.querySelector('[onclick*="csvTrain"]');
  const modeTestOnly = document.getElementById('modeTestOnly');
  const modeCustomTrain = document.getElementById('modeCustomTrain');
  
  if (csvFileInput) csvFileInput.disabled = false;
  if (csvTrainInput) csvTrainInput.disabled = false;
  if (dropZone) {
    dropZone.style.opacity = '1';
    dropZone.style.pointerEvents = 'auto';
  }
  if (dropZoneTrain) {
    dropZoneTrain.style.opacity = '1';
    dropZoneTrain.style.pointerEvents = 'auto';
  }
  if (modeTestOnly) modeTestOnly.disabled = false;
  if (modeCustomTrain) modeCustomTrain.disabled = false;
}
let pollTimer = null;

// Implementasi lengkap fungsi file handler (override stub di head)
function dragOver(e, zoneId) {
  e.preventDefault();
  if (zoneId) document.getElementById(zoneId).classList.add('over');
}
function dragLeave(e, zoneId) {
  if (zoneId) document.getElementById(zoneId).classList.remove('over');
}
function dropFile(e, target) {
  e.preventDefault();
  dragLeave(e, target === 'train' ? 'dropZoneTrain' : 'dropZone');
  const f = e.dataTransfer.files[0];
  if (!f || !validateFile(f, target === 'train' ? 'training' : 'test')) return;
  if (target === 'train') {
    csvTrain = f; showFileLabel(f, 'fileNameTrain', '');
    fetchDatasetStats(f, 'trainDatasetStats');
  } else {
    csvFile = f; showFileLabel(f, 'fileName', '');
    fetchDatasetStats(f, 'testDatasetStats');
  }
  checkCanEval();
}
// Client-side file validation
function validateFile(file, targetName) {
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    showError('csvError', `File ${targetName} terlalu besar (${(file.size / 1024 / 1024).toFixed(1)}MB). Maksimal 100MB.`);
    return false;
  }
  if (!file.name.toLowerCase().endsWith('.csv')) {
    showError('csvError', `File ${targetName} harus berformat CSV.`);
    return false;
  }
  return true;
}

function fileSelected(input) {
  const file = input.files[0];
  if (!file) return;
  
  csvFile = file;
  showFileLabel(csvFile, 'fileName', '');
  checkCanEval();
  fetchDatasetStats(file, 'testDatasetStats');
}

function fileSelectedTrain(input) {
  const file = input.files[0];
  if (!file) return;
  
  csvTrain = file;
  showFileLabel(csvTrain, 'fileNameTrain', '');
  checkCanEval();
  fetchDatasetStats(file, 'trainDatasetStats');
}

function setUploadMode(mode) {
  uploadMode = mode;
  const isCustom = mode === 'custom_train';
  document.getElementById('modeTestOnly').classList.toggle('active', !isCustom);
  document.getElementById('modeCustomTrain').classList.toggle('active', isCustom);
  document.getElementById('trainUploadSection').style.display = isCustom ? 'block' : 'none';
  document.getElementById('modeInfo').innerHTML = isCustom
    ? '<b>Mode:</b> Anda upload <b>CSV Training sendiri</b> dan CSV Test. Model dilatih dari data training Anda.'
    : '<b>Mode:</b> Data training menggunakan <b>emails.csv</b> bawaan (5.728 email Kaggle). Anda hanya perlu upload CSV test.';
  if (!isCustom) { 
    csvTrain = null; 
    document.getElementById('fileNameTrain').style.display = 'none'; 
    window.dsStats.trainNS = 0;
    window.dsStats.trainSp = 0;
  } else {
    if (!csvTrain) {
      window.dsStats.trainNS = 0;
      window.dsStats.trainSp = 0;
    }
  }
  
  // Reset input ratio setiap ganti mode agar tidak pakai sisa nilai dari mode sebelumnya
  document.getElementById('nTrainNonSpam').value = 0;
  document.getElementById('nTrainSpam').value = 0;
  if (typeof updateTrainBalancePreview === 'function') updateTrainBalancePreview();
  
  checkCanEval();
}

function checkCanEval() {
  const testOk = csvFile != null;
  const trainOk = uploadMode === 'test_only' || csvTrain != null;
  document.getElementById('evalBtn').disabled = !(testOk && trainOk);
}

document.getElementById('chkM2').addEventListener('change', e => {
  document.getElementById('m2Settings').style.opacity = e.target.checked ? '1' : '0.35';
});

function showFileLabel(f, elId, _ignoredIconArg) {
  if (!f) return;
  const el = document.getElementById(elId);
  el.innerHTML = '<i data-lucide="file-check" style="width:14px;height:14px;vertical-align:text-bottom;margin-right:4px;"></i> ' + f.name + ' (' + (f.size / 1024).toFixed(1) + ' KB)';
  el.style.display = 'block';
  if (typeof lucide !== 'undefined') lucide.createIcons({nodes: [el]});
}

function resetCsv() {
  csvFile = null; csvTrain = null;
  currentJobId = null;
  sessionStorage.removeItem('lastJobId');
  localStorage.removeItem('lastJobId');
  // Hapus hasil tersimpan di server
  fetch('/lastresult/clear', { method: 'POST' }).catch(() => { });
  // Reset badge tab CSV
  const csvTab = document.querySelectorAll('.tab-btn')[1];
  if (csvTab) {
    csvTab.style.background = '';
    csvTab.style.color = '';
    csvTab.title = '';
    const dot = csvTab.querySelector('.result-dot');
    if (dot) dot.remove();
  }
  document.getElementById('csvFile').value = '';
  document.getElementById('csvTrain').value = '';
  document.getElementById('fileName').style.display = 'none';
  document.getElementById('fileNameTrain').style.display = 'none';
  document.getElementById('evalBtn').disabled = true;
  enableCsvInputs();
  document.getElementById('csvResults').style.display = 'none';
  document.getElementById('csvResults').innerHTML = '';
  document.getElementById('realtimeSection').style.display = 'none';
  document.getElementById('realtimeResult').innerHTML = '';
  document.getElementById('realtimeText').value = '';
  document.getElementById('nNonSpam').value = '500';
  document.getElementById('nSpam').value = '500';
  document.getElementById('nTrainNonSpam').value = '0';
  document.getElementById('nTrainSpam').value = '0';
  updateBalancePreview();
  updateTrainBalancePreview();
  setLoading('csvLoading', false);
  document.getElementById('progressLog').textContent = '';
  hide('csvError');
  hide('realtimeError');
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}



// Helper: reset teks tombol evaluasi
function _resetEvalBtn() {
  const btn = document.getElementById('evalBtn');
  btn.disabled = false;
  btn.innerHTML = '<i data-lucide="play" style="width:14px;height:14px;vertical-align:text-bottom;margin-right:5px;"></i>Mulai Evaluasi';
  lucide.createIcons();
}

function pollJob(jobId) {
  const logEl = document.getElementById('progressLog');
  let elapsed = 0;
  let interval = 1200;
  const MAX_POLL_TIME = 30 * 60 * 1000; // 30 menit timeout

  function doPoll() {
    // Check timeout
    if (elapsed >= MAX_POLL_TIME) {
      if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
      sessionStorage.removeItem('lastRunningJobId');
      const cancelBtn = document.getElementById('cancelJobBtn');
      if (cancelBtn) cancelBtn.style.display = 'none';
      setLoading('csvLoading', false);
      _resetEvalBtn();
      setProgressBar(0, '');
      showError('csvError', '⏱ Training timeout (melebihi 30 menit). Coba gunakan mode Fast atau dataset lebih kecil.');
      return;
    }

    fetch('/job/' + jobId)
      .then(r => r.json())
      .then(data => {
        if (data.progress && data.progress.length) {
          logEl.textContent = data.progress.join('\n');
          logEl.scrollTop = logEl.scrollHeight;
          // Update progress bar
          updateProgressBar(data.progress);
        }
        if (data.status === 'done') {
          if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
          currentJobId = jobId;
          sessionStorage.setItem('lastJobId', jobId);
          localStorage.setItem('lastJobId', jobId);   // persist antar session
          sessionStorage.removeItem('lastRunningJobId');
          const cancelBtn = document.getElementById('cancelJobBtn');
          if (cancelBtn) cancelBtn.style.display = 'none';
          setLoading('csvLoading', false);
          _resetEvalBtn();
          enableCsvInputs(); // Enable CSV inputs saat job selesai
          setProgressBar(100, 'Selesai');
          try {
            renderCsvResults(data.result);
            setTimeout(() => {
              const resEl = document.getElementById('csvResults');
              if (resEl) {
                resEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 300);
          } catch (renderErr) {
            showError('csvError', 'Gagal render hasil: ' + renderErr.message);
            console.error('renderCsvResults error:', renderErr);
          }
        } else if (data.status === 'error') {
          if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
          sessionStorage.removeItem('lastRunningJobId');
          const cancelBtn = document.getElementById('cancelJobBtn');
          if (cancelBtn) cancelBtn.style.display = 'none';
          setLoading('csvLoading', false);
          _resetEvalBtn();
          enableCsvInputs(); // Enable CSV inputs saat job error
          setProgressBar(0, '');
          showError('csvError', data.error || 'Terjadi kesalahan saat evaluasi.');
        } else if (data.status === 'cancelled') {
          if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
          sessionStorage.removeItem('lastRunningJobId');
          const cancelBtn = document.getElementById('cancelJobBtn');
          if (cancelBtn) cancelBtn.style.display = 'none';
          setLoading('csvLoading', false);
          _resetEvalBtn();
          enableCsvInputs(); // Enable CSV inputs saat job dibatalkan
          setProgressBar(0, '');
          // Pesan cancel yang bersih — bukan error merah
          const errEl = document.getElementById('csvError');
          errEl.style.background = '#fef9c3';
          errEl.style.borderColor = '#fde68a';
          errEl.style.color = 'var(--warning)';
          errEl.textContent = '⏹ Training dibatalkan.';
          errEl.classList.add('active');
          errEl.style.display = 'block';
          setTimeout(() => {
            errEl.style.background = '';
            errEl.style.borderColor = '';
            errEl.style.color = '';
          }, 100);
        } else {
          // Masih running — exponential backoff
          elapsed += interval;
          if (elapsed > 120000) interval = Math.min(interval + 1500, 8000);  // naik bertahap max 8s
          else if (elapsed > 60000) interval = Math.min(interval + 500, 5000); // naik bertahap max 5s
          else if (elapsed > 30000) interval = 2000;
          pollTimer = setTimeout(doPoll, interval);
        }
      })
      .catch(e => {
        console.warn('Poll error (retrying):', e.message);
        pollTimer = setTimeout(doPoll, interval);
      });
  }

  if (pollTimer) { clearTimeout(pollTimer); }
  pollTimer = setTimeout(doPoll, 800);
}

// ─── Tampilkan tombol Cancel setelah 2 detik training ───
function _showCancelBtn(jobId) {
  setTimeout(() => {
    const btn = document.getElementById('cancelJobBtn');
    if (btn) { btn.style.display = 'inline-block'; btn._jobId = jobId; }
  }, 2000);
}

async function cancelCurrentJob() {
  const btn = document.getElementById('cancelJobBtn');
  const jobId = (btn ? btn._jobId : null) || sessionStorage.getItem('lastRunningJobId');
  if (!jobId) return;
  if (!confirm('Batalkan proses training yang sedang berjalan?')) return;
  try {
    await fetch('/job/' + jobId + '/cancel', { method: 'POST' });
  } catch (e) { }
  if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
  setLoading('csvLoading', false);
  _resetEvalBtn();
  enableCsvInputs();
  if (btn) btn.style.display = 'none';
  sessionStorage.removeItem('lastRunningJobId');
  showError('csvError', 'Training dibatalkan.');
}

// ─── Auto-resume job yang masih running saat halaman di-refresh ───
document.addEventListener('DOMContentLoaded', function autoResumeJob() {
  const savedRunning = sessionStorage.getItem('lastRunningJobId');
  if (!savedRunning) return;

  fetch('/job/' + savedRunning)
    .then(r => r.json())
    .then(d => {
      if (d.status === 'running') {
        switchTab('csv');
        setLoading('csvLoading', true);
        document.getElementById('evalBtn').disabled = true;
        _showCancelBtn(savedRunning);
        pollJob(savedRunning);
      } else if (d.status === 'done' && d.result) {
        sessionStorage.removeItem('lastRunningJobId');
        currentJobId = savedRunning;
        switchTab('csv');
        try { renderCsvResults(d.result); } catch (e) { console.error(e); }
      } else {
        sessionStorage.removeItem('lastRunningJobId');
      }
    })
    .catch(() => sessionStorage.removeItem('lastRunningJobId'));
});

function renderCsvResults(results) {
  const el = document.getElementById('csvResults');
  el.innerHTML = '';
  el.style.display = 'block';

  const keys = ['metode1', 'metode2'].filter(k => results[k]);
  keys.forEach(key => {
    const r = results[key];
    el.appendChild(buildMethodCard(r, key));
  });

  if (results.metode1 && results.metode2) {
    el.appendChild(buildComparison(results.metode1, results.metode2));
  }

  // ── Tombol Save ──
  const saveBar = document.createElement('div');
  saveBar.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;margin-top:6px;flex-wrap:wrap;';
  saveBar.innerHTML = `
    <button class="btn-secondary" onclick="saveResultsJSON()" title="Download hasil lengkap sebagai JSON">
      <i data-lucide="download" style="width:14px;height:14px;vertical-align:text-bottom;margin-right:5px;"></i>Simpan JSON
    </button>
    <button class="btn-secondary" onclick="saveResultsCSV()" title="Download ringkasan sebagai CSV">
      <i data-lucide="file-down" style="width:14px;height:14px;vertical-align:text-bottom;margin-right:5px;"></i>Simpan CSV
    </button>
    <button class="btn-primary" onclick="printResults()" title="Print atau Save PDF via browser">
      <i data-lucide="printer" style="width:14px;height:14px;vertical-align:text-bottom;margin-right:5px;"></i>Print / PDF
    </button>`;
  el.appendChild(saveBar);
  lucide.createIcons({ nodes: [saveBar] });

  // Simpan ke window untuk tombol save
  window._lastCsvResults = results;

  // Refresh history badge
  setTimeout(() => {
    fetch('/history').then(r => r.json()).then(d => {
      _historyData = d;
      const histTabText = document.getElementById('histTabText');
      if (histTabText && d.length) histTabText.textContent = 'Riwayat (' + d.length + ')';
    }).catch(() => { });
  }, 600);

  // Cek model yang tersedia lalu tampilkan section realtime
  const checkJobId = currentJobId || 'saved_models';
  // Tunggu sebentar agar file model selesai ditulis worker
  function tryLoadModels(attempt) {
    fetch('/job_models/' + checkJobId)
      .then(r => r.json())
      .then(avail => {
        // BUGFIX: Jangan izinkan metode yang tidak dieksekusi di job ini untuk dipilih 
        // (mencegah fallback membaca model dari eksperimen lama)
        if (!results.metode1) avail.metode1 = false;
        if (!results.metode2) avail.metode2 = false;

        if (avail.metode1 || avail.metode2) {
          if (!currentJobId) currentJobId = 'saved_models';
          initRealtimeSection(currentJobId, avail);
        } else if (attempt < 3) {
          // Model belum ada — coba lagi
          setTimeout(() => tryLoadModels(attempt + 1), 2000);
        }
      })
      .catch(() => {
        if (attempt < 3) setTimeout(() => tryLoadModels(attempt + 1), 2000);
      });
  }
  setTimeout(() => tryLoadModels(1), 1500);
} // end renderCsvResults

function buildMethodCard(r, key) {
  const color = key === 'metode1' ? '#4f46e5' : '#0284c7';
  const nb = r.naive_bayes;
  const xgb = r.xgboost;

  const wrap = document.createElement('div');
  wrap.className = 'card';
  if (typeof window.observeScrollReveal === 'function') {
    window.observeScrollReveal(wrap);
  }
  wrap.style.borderTop = `4px solid ${color}`;

  const infoChips = key === 'metode1'
    ? `<span class="info-chip"><i data-lucide="database" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:3px;"></i>Train: ${r.n_train.toLocaleString()}</span>
       <span class="info-chip"><i data-lucide="flask-conical" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:3px;"></i>Test: ${r.n_test.toLocaleString()}</span>
       <span class="info-chip">${r.gpu ? '<i data-lucide="zap" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:2px;"></i>GPU (CUDA)' : '<i data-lucide="cpu" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:2px;"></i>CPU'}</span>
       <span class="info-chip" style="color:${r.preset === 'full' ? 'var(--warning)' : 'var(--success)'}">
         ${r.preset === 'full' ? '<i data-lucide="microscope" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:2px;"></i>Mode Full' : '<i data-lucide="zap" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:2px;"></i>Mode Fast'}</span>`
    : `<span class="info-chip"><i data-lucide="database" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:3px;"></i>Train: ${r.n_train.toLocaleString()}</span>
       <span class="info-chip"><i data-lucide="repeat" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:3px;"></i>Adapt: ${r.n_adapt} (${Math.round(r.adapt_frac * 100)}%)</span>
       <span class="info-chip"><i data-lucide="weight" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:3px;"></i>Bobot: ${r.adapt_weight}×</span>
       <span class="info-chip"><i data-lucide="flask-conical" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:3px;"></i>Test: ${r.n_test.toLocaleString()}</span>
       <span class="info-chip">${r.gpu ? '<i data-lucide="zap" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:2px;"></i>GPU (CUDA)' : '<i data-lucide="cpu" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:2px;"></i>CPU'}</span>
       <span class="info-chip" style="color:${r.preset === 'full' ? 'var(--warning)' : 'var(--success)'}">
         ${r.preset === 'full' ? '<i data-lucide="microscope" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:2px;"></i>Mode Full' : '<i data-lucide="zap" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:2px;"></i>Mode Fast'}</span>`;

  wrap.innerHTML = `
    <div class="method-divider"><span style="color:${color}">${r.metode}</span></div>
    <div style="margin-bottom:14px;">${infoChips}</div>

    <div class="model-row model-row-grid">
      <div class="nb-wrap">
        ${buildModelSection(nb, 'Complement Naive Bayes', '#6366f1')}
        
        <div class="result-section chi-square-section" style="margin-top:24px; padding-top:18px; border-top:1px dashed var(--gray-200);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <h3 style="margin:0; font-size:14px; color:#6366f1;"><i data-lucide="bar-chart-2" style="width:14px;height:14px;vertical-align:text-bottom;margin-right:4px;"></i>Top 20 Fitur Chi-Square</h3>
            <button onclick="exportChi2AsPNG('chi2_${key}','chi2_${(r.metode || '').replace(/\\s/g, '_')}.png')"
                    class="btn-secondary" style="font-size:12px;padding:4px 8px;">
              <i data-lucide="image" style="width:13px;height:13px;vertical-align:text-bottom;margin-right:4px;"></i>Simpan PNG
            </button>
          </div>
          <div class="top20-grid" id="chi2_${key}">${buildTop20(r.top20_chi2)}</div>
        </div>
      </div>

      <div class="xgb-wrap" style="margin-top: 48px; padding-top: 32px; border-top: 2px dashed var(--gray-300);">
        ${buildModelSection(xgb, 'XGBoost', '#0284c7')}
      </div>
    </div>`;
  lucide.createIcons({ nodes: [wrap] });
  return wrap;
}

function buildModelSection(m, name, color) {
  const cm = m.cm;
  return `
    <div>
      <div style="background: ${color}12; border: 1px solid ${color}30; border-left: 4px solid ${color}; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <i data-lucide="${name === 'Complement Naive Bayes' ? 'brain-circuit' : 'zap'}" style="width:18px;height:18px;margin-right:10px;color:${color};"></i>
        <span style="font-size:15px;font-weight:700;color:${color};letter-spacing: 0.5px;text-transform:uppercase;">Model ${name}</span>
      </div>
      <div class="metric-grid" style="grid-template-columns:repeat(2,1fr);margin-bottom:12px;">
        ${metricBox(m.accuracy, 'Akurasi', color)}
        ${metricBox(m.f1, 'F1-Score', color)}
        ${metricBox(m.precision, 'Presisi', color)}
        ${metricBox(m.recall, 'Recall', color)}
      </div>
      <div style="font-size:14px;font-weight:600;color:var(--gray-600);margin-bottom:6px;">
        Confusion Matrix &nbsp;<span style="font-weight:400;color:var(--gray-400)">threshold ${m.threshold}%</span>
      </div>
      <table class="cm-table cm-table-main">
        <tr><th></th><th>Pred Non-Spam</th><th>Pred Spam</th></tr>
        <tr><th>Aktual Non-Spam</th><td class="tn">${cm.tn}<br><small>TN</small></td>
            <td class="fp">${cm.fp}<br><small>FP</small></td></tr>
        <tr><th>Aktual Spam</th><td class="fn">${cm.fn}<br><small>FN</small></td>
            <td class="tp">${cm.tp}<br><small>TP</small></td></tr>
      </table>
      <div style="margin-top:10px;">
        <div style="font-size:14px;font-weight:600;color:var(--gray-600);margin-bottom:6px;">Per Kelas</div>
        <table class="per-class-table per-class-table-main">
          <tr><th>Kelas</th><th>Presisi</th><th>Recall</th><th>F1</th></tr>
          <tr><td><span class="badge-nonspam">Non-Spam</span></td>
              <td>${m.per_class.non_spam.precision}%</td>
              <td>${m.per_class.non_spam.recall}%</td>
              <td>${m.per_class.non_spam.f1}%</td></tr>
          <tr><td><span class="badge-spam">Spam</span></td>
              <td>${m.per_class.spam.precision}%</td>
              <td>${m.per_class.spam.recall}%</td>
              <td>${m.per_class.spam.f1}%</td></tr>
        </table>
      </div>
    </div>`;
}

function metricBox(val, lbl, color) {
  return `<div class="metric-box"><div class="val" style="color:${color}">${val}%</div>
          <div class="lbl">${lbl}</div></div>`;
}

function buildTop20(features) {
  const validFeatures = features.filter(f => f.score !== null && f.score !== undefined);
  if (validFeatures.length === 0) return '<div style="color:var(--gray-400);font-size:14px;">Tidak ada fitur tersedia.</div>';
  const max = validFeatures[0].score;

  const half = Math.ceil(validFeatures.length / 2);
  const leftFeatures = validFeatures.slice(0, half);
  const rightFeatures = validFeatures.slice(half);

  const renderRows = (list, offset) => list.map((f, i) => `
    <tr>
      <td style="width:24px;text-align:center;color:var(--gray-400);font-size:13px;">${i + offset + 1}</td>
      <td style="width:125px;font-weight:600;font-size:14px;white-space:nowrap;
                 overflow:hidden;text-overflow:ellipsis;" title="${f.feature}">${f.feature}</td>
      <td style="width:auto;padding:0 4px 0 8px;">
        <div style="background:var(--gray-100);border-radius:99px;height:10px;overflow:hidden;">
          <div style="background:var(--primary);height:100%;border-radius:99px;
                      width:${max > 0 ? Math.round(f.score / max * 100) : 0}%;
                      print-color-adjust:exact;-webkit-print-color-adjust:exact;"></div>
        </div>
      </td>
      <td style="width:42px;font-size:13px;color:var(--gray-500);text-align:right;white-space:nowrap;">
        ${f.score.toLocaleString()}
      </td>
    </tr>`).join('');

  return `
    <table style="width:100%;border-collapse:collapse;align-self:start;table-layout:fixed;">
      <tbody>${renderRows(leftFeatures, 0)}</tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;align-self:start;table-layout:fixed;">
      <tbody>${renderRows(rightFeatures, half)}</tbody>
    </table>`;
}



// ═══════════════════════════════════════════
// PERBANDINGAN METODE 1 vs METODE 2
// ═══════════════════════════════════════════

function buildComparison(r1, r2) {
  const wrap = document.createElement('div');
  wrap.className = 'card';
  if (typeof window.observeScrollReveal === 'function') {
    window.observeScrollReveal(wrap);
  }
  wrap.style.borderTop = '4px solid #16a34a';

  const models = ['naive_bayes', 'xgboost'];
  const mNames = ['Complement Naive Bayes', 'XGBoost'];
  const metrics = [
    { key: 'accuracy', label: 'Akurasi' },
    { key: 'precision', label: 'Presisi' },
    { key: 'recall', label: 'Recall' },
    { key: 'f1', label: 'F1-Score' },
  ];

  const rows = models.map((mk, mi) => {
    const cols = metrics.map(({ key, label }) => {
      const v1 = r1[mk][key];
      const v2 = r2[mk][key];
      const diff = (v2 - v1).toFixed(2);
      const arrow = diff > 0 ? `<span style="color:var(--success)">▲ +${diff}%</span>`
        : diff < 0 ? `<span style="color:var(--danger)">▼ ${diff}%</span>`
          : `<span style="color:var(--gray-400)">= ${diff}%</span>`;
      return `<td>${v1}%</td><td>${v2}%</td><td>${arrow}</td>`;
    }).join('');
    return `<tr><td><b>${mNames[mi]}</b></td>${cols}</tr>`;
  }).join('');

  const heads = metrics.map(({ label }) =>
    `<th colspan="3">${label}</th>`).join('');
  const subHeads = metrics.map(() =>
    `<th style="font-size:13px;color:#6366f1">M1</th>
     <th style="font-size:13px;color:#0284c7">M2</th>
     <th style="font-size:13px;">Δ</th>`).join('');

  wrap.innerHTML = `
    <div class="method-divider">
      <span style="color:var(--success)"><i data-lucide="git-compare" style="width:14px;height:14px;vertical-align:text-bottom;margin-right:5px;"></i>Perbandingan Metode 1 vs Metode 2</span>
    </div>
    <div style="overflow-x:auto;">
      <table class="cm-table" style="font-size:14px;">
        <thead>
          <tr><th rowspan="2">Model</th>${heads}</tr>
          <tr>${subHeads}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="margin-top:10px;font-size:14px;color:var(--gray-400);">
      M1 = Tanpa Domain Adaptation &nbsp;&bull;&nbsp; M2 = Domain Adaptation ${Math.round(r2.adapt_frac * 100)}%
      &nbsp;&bull;&nbsp; Δ = selisih M2 terhadap M1
    </div>`;
  lucide.createIcons({ nodes: [wrap] });
  return wrap;
}


// ═══════════════════════════════════════════
// SAVE / EXPORT HASIL
// ═══════════════════════════════════════════

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getNowStr() {
  const d = new Date();
  return d.getFullYear() + '-'
    + String(d.getMonth() + 1).padStart(2, '0') + '-'
    + String(d.getDate()).padStart(2, '0') + '_'
    + String(d.getHours()).padStart(2, '0')
    + String(d.getMinutes()).padStart(2, '0');
}

function saveResultsJSON() {
  const res = window._lastCsvResults;
  if (!res) { alert('Belum ada hasil untuk disimpan.'); return; }
  // Hapus _models (tidak JSON serializable)
  const clean = JSON.parse(JSON.stringify(res));
  downloadFile(JSON.stringify(clean, null, 2),
    'hasil_evaluasi_' + getNowStr() + '.json', 'application/json');
}

function saveResultsCSV() {
  const res = window._lastCsvResults;
  if (!res) { alert('Belum ada hasil untuk disimpan.'); return; }

  const rows = [
    ['Metode', 'Model', 'Akurasi (%)', 'Presisi (%)', 'Recall (%)', 'F1-Score (%)',
      'Threshold (%)', 'TN', 'FP', 'FN', 'TP',
      'NonSpam Presisi', 'NonSpam Recall', 'NonSpam F1',
      'Spam Presisi', 'Spam Recall', 'Spam F1']
  ];

  ['metode1', 'metode2'].forEach(mk => {
    if (!res[mk]) return;
    const r = res[mk];
    ['naive_bayes', 'xgboost'].forEach(model => {
      const m = r[model];
      const cm = m.cm;
      const pc = m.per_class;
      rows.push([
        r.metode, m.model,
        m.accuracy, m.precision, m.recall, m.f1, m.threshold,
        cm.tn, cm.fp, cm.fn, cm.tp,
        pc.non_spam.precision, pc.non_spam.recall, pc.non_spam.f1,
        pc.spam.precision, pc.spam.recall, pc.spam.f1,
      ]);
    });
  });

  const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
  downloadFile('\uFEFF' + csv,   // BOM untuk Excel
    'hasil_evaluasi_' + getNowStr() + '.csv', 'text/csv;charset=utf-8');
}

function printResults() {
  const el = document.getElementById('csvResults');
  const content = el.innerHTML;
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <title>Hasil Evaluasi Spam Classifier — ${getNowStr()}</title>
    <style>
      * { box-sizing:border-box; margin:0; padding:0; }
      html { scroll-behavior: smooth; }
    body { font-family:'Segoe UI',Arial,sans-serif; padding:20px 28px;
             color:#1f2937; font-size:14px; }
      h1   { font-size:17px; font-weight:800; margin-bottom:4px; }
      p.sub { color:#6b7280; font-size:13px; margin-bottom:14px; }
      hr   { border:none; border-top:1px solid #e5e7eb; margin:10px 0; }

      /* method divider */
      .method-divider { display:flex; align-items:center; gap:10px;
                         margin:16px 0 10px; font-size:15px; font-weight:800; }
      .method-divider::before, .method-divider::after
        { content:''; flex:1; height:2px; background:#e5e7eb; }

      /* info chips */
      .info-chip { display:inline-block; background:#f3f4f6; border:1px solid #e5e7eb;
                   border-radius:99px; padding:2px 8px; font-size:12px; color:#4b5563;
                   margin:1px; }

      /* metrics */
      .metric-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:6px;
                     margin-bottom:10px; }
      .metric-box  { border:1px solid #e5e7eb; border-radius:8px; padding:8px;
                     text-align:center; }
      .metric-box .val { font-size:1.2rem; font-weight:800; color:#4f46e5; }
      .metric-box .lbl { font-size:12px; color:#9ca3af; }

      /* 2-col model layout */
      .model-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
      .model-col  { }

      /* tables */
      table { width:100%; border-collapse:collapse; font-size:13px;
              margin:6px 0; page-break-inside:avoid; }
      th,td { border:1px solid #e5e7eb; padding:4px 7px; }
      th    { background:#f3f4f6; font-weight:700; text-align:center; }
      .tn   { background:#dbeafe; font-weight:700; color:#1d4ed8; }
      .fp   { background:#fef9c3; font-weight:700; color:#ca8a04; }
      .fn   { background:#fee2e2; font-weight:700; color:#dc2626; }
      .tp   { background:#dcfce7; font-weight:700; color:#16a34a; }

      /* chi2 */
      .chi2-bar { background:#4f46e5; height:10px; border-radius:99px;
                  print-color-adjust:exact; -webkit-print-color-adjust:exact; }
      .chi2-bg  { background:#f3f4f6; border-radius:99px; overflow:hidden; }
      .chi2-tbl td { border:none; padding:2px 4px; vertical-align:middle; }

      /* comparison table */
      .cmp-tbl { width:100%; border-collapse:collapse; font-size:13px; }
      .cmp-tbl th,td { border:1px solid #e5e7eb; padding:4px 7px; text-align:center; }
      .cmp-tbl th { background:#f3f4f6; font-weight:700; }

      /* section headers */
      .section-title { font-size:14px; font-weight:700; color:#4b5563; margin:8px 0 4px;
                       border-bottom:1px solid #e5e7eb; padding-bottom:3px; }

      /* badges */
      .badge-spam    { background:#fee2e2; color:#dc2626; border-radius:99px;
                       padding:1px 7px; font-size:12px; font-weight:700; }
      .badge-nonspam { background:#dcfce7; color:#16a34a; border-radius:99px;
                       padding:1px 7px; font-size:12px; font-weight:700; }

      @media print {
        button, .btn-row, [onclick] { display:none !important; }
        html { scroll-behavior: smooth; }
    body { padding:12px; }
        .model-row { grid-template-columns:1fr 1fr; }
      }
    th { position: sticky; top: 0; background: inherit; z-index: 10; }
  </style>
  </head><body>
    <h1>Hasil Evaluasi — Spam Email Classifier</h1>
    <p class="sub">Dicetak: ${new Date().toLocaleString('id-ID')}</p>
    <hr>
    ${content}
    <script>
      // Hapus elemen non-print
      document.querySelectorAll('.btn-row, [onclick^="save"], [onclick^="print"]')
        .forEach(el => el.remove());
      window.onload = () => window.print();
    <\/script>
  </body></html>`);
  w.document.close();
}
function updateBalancePreview() {
  const ns = parseInt(document.getElementById('nNonSpam').value) || 0;
  const sp = parseInt(document.getElementById('nSpam').value) || 0;
  const tot = (ns > 0 || sp > 0) ? (ns + sp) : null;
  const totalEl = document.getElementById('totalSample');
  const noteEl = document.getElementById('balanceNote');
  
  let warnNS = '', warnSp = '';
  const tNS = window.dsStats.testNS;
  const tSp = window.dsStats.testSp;
  if (tNS > 0 && ns > 0 && ns > tNS) warnNS = 'Max ' + tNS.toLocaleString('id');
  if (tSp > 0 && sp > 0 && sp > tSp) warnSp = 'Max ' + tSp.toLocaleString('id');
  
  const wN = document.getElementById('warnTestNS');
  const wS = document.getElementById('warnTestSpam');
  if(wN) { wN.textContent = warnNS; wN.style.display = warnNS ? 'block' : 'none'; }
  if(wS) { wS.textContent = warnSp; wS.style.display = warnSp ? 'block' : 'none'; }
  document.getElementById('nNonSpam').style.borderColor = warnNS ? 'var(--danger)' : 'var(--gray-200)';
  document.getElementById('nSpam').style.borderColor = warnSp ? 'var(--danger)' : 'var(--gray-200)';

  if (tot === null) {
    totalEl.textContent = 'semua';
    noteEl.textContent = '(pakai semua data)';
    noteEl.style.color = 'var(--gray-400)';
  } else {
    totalEl.textContent = tot.toLocaleString('id');
    if (ns > 0 && sp > 0 && ns === sp) {
      noteEl.innerHTML = '<i data-lucide="check" style="width:13px;height:13px;vertical-align:text-bottom;margin-right:3px;"></i>Seimbang';
      if (typeof lucide !== 'undefined') lucide.createIcons({nodes:[noteEl]});
      noteEl.style.color = 'var(--success)';
    } else if (ns === 0 || sp === 0) {
      noteEl.textContent = '';
    } else {
      const ratio = Math.max(ns, sp) / Math.min(ns, sp);
      noteEl.textContent = 'Rasio ' + ratio.toFixed(1) + ':1';
      noteEl.style.color = ratio <= 2 ? 'var(--warning)' : 'var(--danger)';
    }
  }
}

function updateTrainBalancePreview() {
  const ns = parseInt(document.getElementById('nTrainNonSpam').value) || 0;
  const sp = parseInt(document.getElementById('nTrainSpam').value) || 0;
  const noteEl = document.getElementById('trainBalanceNote');
  
  let warnNS = '', warnSp = '';
  const isCustomTrain = document.getElementById('modeCustomTrain') && document.getElementById('modeCustomTrain').classList.contains('active');
  const tNS = isCustomTrain ? window.dsStats.trainNS : 4360;
  const tSp = isCustomTrain ? window.dsStats.trainSp : 1368;
  
  if (ns > 0 && ns > tNS) warnNS = 'Max ' + tNS.toLocaleString('id');
  if (sp > 0 && sp > tSp) warnSp = 'Max ' + tSp.toLocaleString('id');
  
  const wN = document.getElementById('warnTrainNS');
  const wS = document.getElementById('warnTrainSpam');
  if(wN) { wN.textContent = warnNS; wN.style.display = warnNS ? 'block' : 'none'; }
  if(wS) { wS.textContent = warnSp; wS.style.display = warnSp ? 'block' : 'none'; }
  document.getElementById('nTrainNonSpam').style.borderColor = warnNS ? 'var(--danger)' : 'var(--gray-200)';
  document.getElementById('nTrainSpam').style.borderColor = warnSp ? 'var(--danger)' : 'var(--gray-200)';

  if (ns === 0 && sp === 0) {
    noteEl.textContent = 'Menggunakan semua data training yang tersedia';
    noteEl.style.color = 'var(--gray-400)';
  } else {
    const tot = ns + sp;
    let note = `Total: ${tot.toLocaleString('id')} email (Non-Spam=${ns}, Spam=${sp})`;
    if (ns > 0 && sp > 0) {
      if (ns === sp) {
        note += ' — <i data-lucide="check" style="width:13px;height:13px;vertical-align:text-bottom;margin-right:2px;"></i>Seimbang';
        noteEl.style.color = 'var(--success)';
      } else {
        const ratio = Math.max(ns, sp) / Math.min(ns, sp);
        note += ` — Rasio ${ratio.toFixed(1)}:1`;
        noteEl.style.color = ratio <= 2 ? 'var(--warning)' : 'var(--danger)';
      }
    } else {
      noteEl.style.color = 'var(--gray-600)';
    }
    noteEl.innerHTML = note;
    if (typeof lucide !== 'undefined') lucide.createIcons({nodes:[noteEl]});
  }
}

function applyBalanceRatio(target, rNS, rSpam) {
  const isTrain = target === 'train';
  const isCustomTrain = document.getElementById('modeCustomTrain') && document.getElementById('modeCustomTrain').classList.contains('active');
  
  const maxNS = isTrain ? (isCustomTrain ? window.dsStats.trainNS : 4360) : window.dsStats.testNS;
  const maxSp = isTrain ? (isCustomTrain ? window.dsStats.trainSp : 1368) : window.dsStats.testSp;
  
  if (maxNS === 0 || maxSp === 0) {
    alert('Harap upload/pilih dataset terlebih dahulu!');
    return;
  }
  
  const maxMultiplier = Math.floor(Math.min(maxNS / rNS, maxSp / rSpam));
  if (maxMultiplier < 1) {
    alert('Dataset tidak cukup untuk rasio ini.');
    return;
  }
  
  const valNS = maxMultiplier * rNS;
  const valSp = maxMultiplier * rSpam;
  
  if (isTrain) {
    document.getElementById('nTrainNonSpam').value = valNS;
    document.getElementById('nTrainSpam').value = valSp;
    updateTrainBalancePreview();
  } else {
    document.getElementById('nNonSpam').value = valNS;
    document.getElementById('nSpam').value = valSp;
    updateBalancePreview();
  }
}
// Init on load
updateBalancePreview();
updateTrainBalancePreview();

// Sinkronkan slider dengan label saat halaman pertama load
(function syncSliders() {
  function doSync() {
    const pairs = [
      { sliderId: 'adaptFrac', labelId: 'fracVal', suffix: '%', defaultVal: '30' },
      { sliderId: 'adaptWeight', labelId: 'weightVal', suffix: '×', defaultVal: '8' },
    ];
    pairs.forEach(({ sliderId, labelId, suffix, defaultVal }) => {
      const slider = document.getElementById(sliderId);
      const label = document.getElementById(labelId);
      if (slider && label) {
        // Paksa ke default agar tidak terpengaruh browser autocomplete
        slider.value = defaultVal;
        label.textContent = defaultVal + suffix;
      }
    });
  }
  // Jalankan segera dan juga setelah sedikit delay (antisipasi browser restore)
  doSync();
  setTimeout(doSync, 150);
})();

// Semua init yang perlu renderCsvResults — jalankan setelah DOM siap
document.addEventListener('DOMContentLoaded', function initRestoreState() {
  setUploadMode('test_only');
  // Restore job ID terakhir dari session atau local storage
  const saved = sessionStorage.getItem('lastJobId') || localStorage.getItem('lastJobId');
  if (saved) {
    currentJobId = saved;
    fetch('/job_models/' + saved)
      .then(r => r.json())
      .then(avail => {
        if (avail.metode1 || avail.metode2) initRealtimeSection(saved, avail);
      })
      .catch(() => { });
  }

  // Load hasil CSV terakhir yang tersimpan di disk
  fetch('/lastresult')
    .then(r => r.json())
    .then(d => {
      if (d.result) {
        // Restore currentJobId dari session/local SEBELUM render agar tryLoadModels bisa jalan
        const savedJobId = sessionStorage.getItem('lastJobId') || localStorage.getItem('lastJobId');
        if (savedJobId && !currentJobId) currentJobId = savedJobId;

        try { renderCsvResults(d.result); } catch (e) { console.error('restore last_result:', e); }
        const csvTab = document.querySelectorAll('.tab-btn')[1];
        if (csvTab && !csvTab.querySelector('.result-dot')) {
          csvTab.title = 'Ada hasil tersimpan — klik untuk melihat';
          const dot = document.createElement('span');
          dot.className = 'result-dot';
          dot.style.cssText = 'display:inline-block;width:7px;height:7px;border-radius:50%;background:#16a34a;margin-left:5px;vertical-align:middle;';
          csvTab.appendChild(dot);
        }
      }
    })
    .catch(() => { });
});


// ═══════════════════════════════════════════
// DATASET STATS PREVIEW
// ═══════════════════════════════════════════

async function fetchDatasetStats(file, targetElId) {
  const fd = new FormData();
  fd.append('file', file);
  try {
    const res = await fetch('/dataset_preview', { method: 'POST', body: fd });
    const data = await res.json();
    const el = document.getElementById(targetElId);
    if (!res.ok || data.error) {
      el.style.display = 'none'; return;
    }
    if (targetElId === 'trainDatasetStats') {
      window.dsStats.trainNS = data.n_nonspam;
      window.dsStats.trainSp = data.n_spam;
      updateTrainBalancePreview();
    } else {
      window.dsStats.testNS = data.n_nonspam;
      window.dsStats.testSp = data.n_spam;
      updateBalancePreview();
    }
    const ratio = data.n_nonspam > 0 && data.n_spam > 0
      ? Math.max(data.n_nonspam, data.n_spam) / Math.min(data.n_nonspam, data.n_spam)
      : 0;
    const balColor = ratio <= 1.05 ? 'var(--success)' : ratio <= 2 ? 'var(--warning)' : 'var(--danger)';
    el.style.display = 'block';
    el.innerHTML = `
      <div class="stat-chips">
        <span class="stat-chip total"><i data-lucide="hash" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:3px;"></i>Total: ${data.total.toLocaleString('id')}</span>
        <span class="stat-chip nonspam"><i data-lucide="shield-check" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:3px;"></i>Non-Spam: ${data.n_nonspam.toLocaleString('id')}</span>
        <span class="stat-chip spam"><i data-lucide="shield-alert" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:3px;"></i>Spam: ${data.n_spam.toLocaleString('id')}</span>
        <span class="stat-chip info">Kolom Teks: <b>${data.text_col}</b></span>
        <span class="stat-chip info">Kolom Label: <b>${data.label_col}</b></span>
        <span class="stat-chip info">Rata-rata panjang: ${data.avg_len} karakter</span>
        <span style="font-size:14px;font-weight:600;color:${balColor};align-self:center;">
        </span>
      </div>`;
    lucide.createIcons({ nodes: [el] });
  } catch (e) {
    document.getElementById(targetElId).style.display = 'none';
  }
}


// ═══════════════════════════════════════════
// EXPORT CHI-SQUARE PNG (poin 4)
// ═══════════════════════════════════════════

function exportChi2AsPNG(containerId, filename) {
  const container = document.getElementById(containerId);
  if (!container) { alert('Grafik tidak ditemukan.'); return; }

  // Buat canvas dari tabel chi2
  const rows = container.querySelectorAll('tr');
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = Math.max(rows.length * 28 + 60, 120);
  const ctx = canvas.getContext('2d');

  // Background
  const isDark = document.body.classList.contains('dark');
  ctx.fillStyle = isDark ? '#1e1e2e' : '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = isDark ? '#eeeef8' : '#1f2937';
  ctx.font = 'bold 14px Segoe UI, sans-serif';
  ctx.fillText('Top 20 Fitur Chi-Square', 16, 28);

  rows.forEach((row, i) => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 4) return;
    const y = 50 + i * 26;
    const label = cells[1].textContent.trim();
    const barDiv = cells[2].querySelector('div > div');
    const score = cells[3].textContent.trim();
    const barW = barDiv ? parseFloat(barDiv.style.width) / 100 * 280 : 0;

    ctx.fillStyle = isDark ? '#8888aa' : '#9ca3af';
    ctx.font = '10px Segoe UI';
    ctx.fillText((i + 1) + '', 8, y + 10);

    ctx.fillStyle = isDark ? '#eeeef8' : '#1f2937';
    ctx.font = '11px Segoe UI';
    ctx.fillText(label.substring(0, 18), 28, y + 10);

    // Bar
    ctx.fillStyle = isDark ? '#2a2a3e' : '#f3f4f6';
    ctx.fillRect(170, y, 280, 14);
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(170, y, barW, 14);

    ctx.fillStyle = isDark ? '#8888aa' : '#6b7280';
    ctx.font = '10px Segoe UI';
    ctx.fillText(score, 458, y + 11);
  });

  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = filename || 'chi2_features.png';
  a.click();
}

