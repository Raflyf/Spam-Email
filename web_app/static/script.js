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
// MODE TEKS
// ═══════════════════════════════════════════
const examples = [
  {
    label: '🚨 Spam: Hadiah',
    text: 'One More Week of Launch Discount!\nWITHOUT A HITCH launched last week, and it\'s been amazing to watch players explore the chaotic wasteland with their friends!\nIf you haven\'t already joined us, the 10% launch discount It is available for one more week, ending May 19th at 10 AM PT. Now\'s the time to grab your crew, pick up the Apocazon P.A.C.K.A.G.E., and hit the road.\nIf you\'ve been waiting to jump in, now\'s the time to grab your crew, pick up the Apocazon P.A.C.K.A.G.E., and hit the road.\nWe\'ve got a second free reward for you:\n🎁Another Free Launch Reward 🎁\nWOAH Graphic\nYour Code:\nGETY-OURB-EARG-RILL\nThis is a new gift, separate from last week\'s code. Once you\'ve got WITHOUT A HITCH, you can redeem both codes in-game.This WITHOUT A HITCH in-game code expires in 2 weeks, on May 26th, at 10 AM PT\nReady to roll?'
  },
  {
    label: '🚨 Spam: Game Crossover',
    text: 'Play the Crossover Event!\nAdventure with Sung Jinwoo, Choi Jong-In,\nCha Hae-In, & Igris!\nGrand Summoners, an action-packed mobile JRPG, is collaborating with Solo Leveling!!\nHere are some of the highlights for the crossover starting on June 12, 2026 (PDT):\nSummon a Guaranteed ★5 Legend on your first roll.\n    Get the chance to summon fully voiced Sung Jinwoo, Choi Jong-In, Cha Hae-In, and Igris & their weapons by using over 100 free Crossover Summon Tickets obtainable from daily login bonuses and limited-time missions.\n    The Demon Monach\'s Sword, as well as other iconic items such as Igris\' Claymore, emerge as summonable powerful Equips.\n    The characters\' skills and Arts recreate epic moves from the anime.\nFor exciting videos on the collaboration, visit Grand Summoners\' official YouTube channel.\nJoin the GS Community!\nDiscord, Facebook, X X, Bluesky, Instagram,\nYouTube, Displate\nWhat are you waiting for? Download Grand Summoners and start your adventure with Sung Jinwoo & co. today!'
  },
  {
    label: '🚨 Spam: Promo Bisnis',
    text: 'Hello Description\nBig news! Genie AI has secured $17.8 million in Series A funding, led by Google Ventures and joined by Khosla Ventures.\nThis is a huge leap forward for us in our mission to empower everyone to create quality legal agreements, instantly.\nRead more about what this means for you here - as we build the world\'s most secure and accurate Legal AI.\nWe need your help to celebrate 🎉\nWe will add 3 Premium documents with 5 AI uses each to your Genie account (worth ~$140) if you comment on and share our LinkedIn post today!\nHere\'s what to do:\n    Comments on the LinkedIn post - tell us what you like about Genie\n    Share the post with your network - with or without a personal message\n    Reply to this email with \'done\' - to lock in +3 Premium Docs for your help\nWhen will you get them? We\'ll tally everything up in 48 hours, and update your account with new premium documents by Monday or Tuesday next week.\nWhy help? We get to showcase you, our fantastic users, and build momentum around our Legal AI.\nReady to celebrate with us? Amazing! Click here to comment on our LinkedIn post. Don’t forget to mention what you love about Genie.'
  },
  {
    label: '✅ Normal: IBM SkillsBuild',
    text: 'Footprint in collaboration with IBM SkillsBuild\nHello Participants of DescriptionDeadline Steps to work on the class at IBM SkillsBuild is getting closer. Come on, immediately continue and finish the class before June 30, 2022 so that your learning progress remains safe. Please make the most of the time left and work out gradually from now on. Make sure you complete the class until you successfully print the certificate. If you have completed the class, please ignore this message. The spirit of learning with the footing 🙌\nIntroduction to Artificial Intelligence'
  },
  {
    label: '✅ Normal: GitHub Copilot',
    text: 'Hi there,\n\nWe’re updating how GitHub uses data to improve AI-powered coding tools. From April 24 onward, your interactions with GitHub Copilot—including inputs, outputs, code snippets, and associated context—may be used to train and enhance AI models unless you opt out.\n\nIf you previously opted out of the setting allowing GitHub to collect this data for product improvements, your preference has been retained— your choice is preserved, and your data will not be used for training unless you opt in.\n\nThis approach aligns with established industry practices and will enable our models to deliver more context-aware AI coding assistance. We have tested this with Microsoft interaction data and have seen meaningful improvements, including increased acceptance rates in multiple languages.\n\nPlease review your settings and choose whether your interactions with Copilot can be leveraged for training AI models before this update goes into effect on April 24. To opt out or adjust your settings:\n\n    Go to GitHub Account Settings\n    Select Copilot\n    Choose whether to allow your data to be used for AI model training\n\nTo learn more, please refer to our blog post and FAQ.\n\nPlease reach out to our support team if you have any questions about this update. Thank you for your continued use of GitHub Copilot.\n\nSincerely,\nThe GitHub Team'
  },
  {
    label: '✅ Normal: Tugas Kampus',
    text: 'Hi,\n\nYour instructor has posted a new announcement in "Skripsi dan Tugas Akhir".\n\n"Please submit your draft document by next Friday so we can review the progress. If you have any questions regarding the formatting, check the syllabus guidelines attached in the portal."\n\nTo view this announcement, please log in to the student academic portal.\n\nBest regards,\nUniversity Academic System'
  },
];
document.querySelectorAll('.example-pills').forEach(pillsEl => {
  const isRealtime = !pillsEl.closest('#pane-text');
  examples.forEach(ex => {
    const p = document.createElement('button');
    p.className = 'pill'; p.textContent = ex.label;
    p.onclick = () => {
      if (isRealtime) {
        document.getElementById('realtimeText').value = ex.text;
      } else {
        document.getElementById('emailText').value = ex.text;
        updateCharCount();
      }
    };
    pillsEl.appendChild(p);
  });
});
document.getElementById('emailText').addEventListener('input', updateCharCount);
function updateCharCount() {
  const n = document.getElementById('emailText').value.length;
  document.getElementById('charCount').textContent = n.toLocaleString('id') + ' karakter';
}
function clearText() {
  document.getElementById('emailText').value = '';
  updateCharCount();
  hide('textError');
  
  // Smooth fade-out animation before hiding
  const resultsEl = document.getElementById('textResults');
  if (resultsEl.style.display !== 'none') {
    resultsEl.style.transition = 'opacity 0.3s ease-out';
    resultsEl.style.opacity = '0';
    setTimeout(() => {
      resultsEl.style.display = 'none';
      resultsEl.style.opacity = '1';
      resultsEl.style.transition = '';
    }, 300);
  }
}
async function analyzeText() {
  const text = document.getElementById('emailText').value.trim();
  hide('textError');
  if (!text) { showError('textError', 'Masukkan teks email terlebih dahulu.'); return; }
  setLoading('textLoading', true); setLoading('textResults', false, 'block');
  document.getElementById('analyzeBtn').disabled = true;
  try {
    const res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    renderTextResult(data, text);
    document.getElementById('textResults').style.display = 'block';
  } catch (e) { showError('textError', e.message); }
  finally { setLoading('textLoading', false); document.getElementById('analyzeBtn').disabled = false; }
}
// ═══ Spam keyword highlighter ═══
const SPAM_KEYWORDS = [
  'free', 'win', 'winner', 'won', 'prize', 'claim', 'cash', 'money', 'guaranteed', 'offer', 'limited',
  'click', 'urgent', 'act now', 'immediately', 'expire', 'bonus', 'risk-free', 'credit', 'loan',
  'earn', 'profit', 'investment', 'income', 'reward', 'gift', 'selected', 'congratulations',
  'verify', 'password', 'account', 'suspended', 'confirm', 'bank', 'paypal', 'bitcoin',
  'cheap', 'discount', 'save', 'deal', 'buy now', 'order now', 'subscribe', 'unsubscribe',
  'million', 'billion', 'lottery', 'jackpot', 'inheritance', 'reward', 'redeem', 'expires',
  'action-packed', 'tickets', 'bonuses', 'collaboration', 'secure', 'premium', 'worth', 'celebrate'
];
function highlightSpamWords(text) {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  const pattern = new RegExp('\\b(' + SPAM_KEYWORDS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'gi');
  return escaped.replace(pattern, '<mark class="highlight-spam">$1</mark>');
}

function renderTextResult(d, rawText) {
  const { naive_bayes: nb, xgboost: xgb, consensus: c, rekomendasi: rek } = d;

  // Consensus banner — ikuti rekomendasi final jika ada
  const finalLabel = rek ? rek.label : c.label;
  const finalIsSpam = rek ? rek.is_spam : c.is_spam;
  const finalDesc = rek
    ? (c.agreement
      ? 'Kedua model sepakat: ' + c.label
      : 'NB: ' + c.nb_vote + ' | XGB: ' + c.xgb_vote + ' — mengikuti XGBoost')
    : (c.agreement ? 'Kedua model sepakat: ' + c.label
      : 'NB: ' + c.nb_vote + ' | XGB: ' + c.xgb_vote);

  const banner = document.getElementById('consensusBanner');

  // Copy to clipboard button
  const copyBtn = `<button onclick="copyResultToClipboard()" style="margin-left:auto;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);border-radius:6px;padding:5px 12px;font-size:12px;font-weight:600;color:inherit;cursor:pointer;" title="Salin hasil ke clipboard">📋 Salin Hasil</button>`;

  banner.innerHTML = `
    <div class="consensus-banner ${finalIsSpam ? 'spam' : 'ham'}">
      <div class="consensus-icon">${finalIsSpam ? '🚨' : '✅'}</div>
      <div class="consensus-text" style="flex:1;">
        <h3>${finalIsSpam ? 'EMAIL INI TERDETEKSI SPAM' : 'EMAIL INI BUKAN SPAM'}</h3>
        <p>${finalDesc}</p>
      </div>
      ${copyBtn}
    </div>
    ${rawText ? `<div style="margin-top:12px;padding:14px;background:transparent;border:1px solid var(--border);border-radius:8px;font-size:13px;line-height:1.7;color:var(--gray-800);">
      <div style="font-size:11px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Analisis Teks — Kata merah = indikator spam</div>
      ${highlightSpamWords(rawText)}
    </div>` : ''}`;

  // Store result for copy
  window._lastTextResult = { d, rawText };

  // Rekomendasi & indikator
  const rekBox = document.getElementById('rekomendasiBox');
  if (rek) {
    rekBox.style.display = 'block';
    const isSpam = rek.is_spam;
    const levelColor = rek.level === 'tinggi' ? 'var(--success)' : 'var(--warning)';
    const levelIcon = rek.level === 'tinggi' ? '🟢' : '🟡';

    const spamTags = (rek.indikator_spam || []).map(r =>
      `<span class="indicator-spam">🚩 ${r}</span>`).join('');
    const hamTags = (rek.indikator_ham || []).map(r =>
      `<span class="indicator-ham">✓ ${r}</span>`).join('');

    rekBox.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;">
          <div style="font-size:12px;font-weight:700;color:var(--gray-400);
               text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">
            Rekomendasi Final (XGBoost)
          </div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-size:1.6rem;">${isSpam ? '🚨' : '✅'}</span>
            <span style="font-size:1.1rem;font-weight:800;
              color:${isSpam ? 'var(--danger)' : 'var(--success)'};">${rek.label}</span>
            <span style="font-size:12px;color:${levelColor};font-weight:600;">
              ${levelIcon} Keyakinan ${rek.level}
            </span>
          </div>
          <div style="font-size:13px;color:var(--gray-600);line-height:1.5;">
            ${rek.alasan}
          </div>
        </div>
        <div style="flex:1;min-width:200px;">
          <div style="font-size:12px;font-weight:700;color:var(--gray-400);
               text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">
            Indikator Ditemukan
          </div>
          ${spamTags || hamTags
        ? `<div>${spamTags}${hamTags}</div>`
        : `<div style="font-size:12px;color:var(--gray-400);">Tidak ada indikator khusus</div>`}
        </div>
      </div>`;
  } else {
    rekBox.style.display = 'none';
  }

  // Model cards
  const cards = document.getElementById('modelCards');
  cards.innerHTML = [
    { name: 'Naive Bayes', m: nb, note: 'Akurasi 77% — lebih sensitif terhadap kata kunci' },
    { name: 'XGBoost', m: xgb, note: 'Akurasi 93% — lebih handal untuk email modern' },
  ].map(({ name, m, note }, i) => `
    <div style="${i === 0 ? 'border-right: 1px dashed var(--border); padding-right: 20px;' : 'padding-left: 20px;'}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-weight:700;font-size:14px;letter-spacing:.5px;text-transform:uppercase;">${name}</span>
        <span class="label-badge ${m.is_spam ? 'spam' : 'ham'}">${m.label}</span>
      </div>
      <div style="font-size:11px;color:var(--gray-400);margin-bottom:10px;">${note}</div>
      <div class="prob-bar-wrap">
        <div class="prob-bar-label"><span>Probabilitas Spam</span><span>${m.probability}%</span></div>
        <div class="prob-bar-track">
          <div class="prob-bar-fill ${m.is_spam ? 'spam' : 'ham'}" style="width:${m.probability}%"></div>
        </div>
      </div>
      <div style="font-size:12px;color:var(--gray-400);margin-top:6px;">
        Threshold: <b>${m.threshold}%</b> &nbsp;|&nbsp; Confidence: <b>${m.confidence}</b>
      </div>
    </div>`).join('');

  const note = document.getElementById('agreementNote');
  note.style.color = c.agreement ? 'var(--success)' : 'var(--warning)';
  note.textContent = c.agreement
    ? '✓ Kedua model memberikan prediksi yang sama.'
    : '⚠ Kedua model berbeda pendapat — rekomendasi mengikuti XGBoost (akurasi lebih tinggi).';
}

function copyResultToClipboard() {
  if (!window._lastTextResult) return;
  const { d, rawText } = window._lastTextResult;
  const { naive_bayes: nb, xgboost: xgb, consensus: c, rekomendasi: rek } = d;
  const label = rek ? rek.label : c.label;
  const lines = [
    '=== Hasil Klasifikasi Spam Email ===',
    'Hasil: ' + label,
    'Naive Bayes: ' + nb.label + ' (' + nb.probability + '%)',
    'XGBoost: ' + xgb.label + ' (' + xgb.probability + '%)',
    rek ? 'Rekomendasi: ' + rek.label + ' — ' + rek.alasan : '',
    '',
    'Teks email:',
    rawText || ''
  ].filter(Boolean).join('\n');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(lines).then(() => showToast('Hasil disalin ke clipboard!'));
  } else {
    // Fallback untuk HTTP non-localhost (misal via IP lokal 192.168.x.x)
    const textArea = document.createElement("textarea");
    textArea.value = lines;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Hasil disalin ke clipboard!');
    } catch (err) {
      showToast('Gagal menyalin teks secara otomatis.');
    }
    document.body.removeChild(textArea);
  }
}

document.getElementById('emailText').addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') analyzeText();
});


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
    csvTrain = f; showFileLabel(f, 'fileNameTrain', '📗');
    fetchDatasetStats(f, 'trainDatasetStats');
  } else {
    csvFile = f; showFileLabel(f, 'fileName', '📘');
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
  
  if (!validateFile(file, 'test')) {
    input.value = '';
    return;
  }
  
  csvFile = file;
  showFileLabel(csvFile, 'fileName', '📘');
  checkCanEval();
  fetchDatasetStats(file, 'testDatasetStats');
}

function fileSelectedTrain(input) {
  const file = input.files[0];
  if (!file) return;
  
  if (!validateFile(file, 'training')) {
    input.value = '';
    return;
  }
  
  csvTrain = file;
  showFileLabel(csvTrain, 'fileNameTrain', '📗');
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
  // Reset file train jika kembali ke test_only
  if (!isCustom) { csvTrain = null; document.getElementById('fileNameTrain').style.display = 'none'; }
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

function showFileLabel(f, elId, icon) {
  if (!f) return;
  const el = document.getElementById(elId);
  el.textContent = icon + ' ' + f.name + ' (' + (f.size / 1024).toFixed(1) + ' KB)';
  el.style.display = 'block';
}

function resetCsv() {
  csvFile = null; csvTrain = null;
  currentJobId = null;
  sessionStorage.removeItem('lastJobId');
  localStorage.removeItem('lastJobId');
  // Hapus hasil tersimpan di server
  fetch('/last_result/clear', { method: 'POST' }).catch(() => { });
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
      document.getElementById('evalBtn').disabled = false;
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
          document.getElementById('evalBtn').disabled = false;
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
          document.getElementById('evalBtn').disabled = false;
          enableCsvInputs(); // Enable CSV inputs saat job error
          setProgressBar(0, '');
          showError('csvError', data.error || 'Terjadi kesalahan saat evaluasi.');
        } else if (data.status === 'cancelled') {
          if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
          sessionStorage.removeItem('lastRunningJobId');
          const cancelBtn = document.getElementById('cancelJobBtn');
          if (cancelBtn) cancelBtn.style.display = 'none';
          setLoading('csvLoading', false);
          document.getElementById('evalBtn').disabled = false;
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
  const jobId = btn?._jobId || sessionStorage.getItem('lastRunningJobId');
  if (!jobId) return;
  if (!confirm('Batalkan proses training yang sedang berjalan?')) return;
  try {
    await fetch('/job/' + jobId + '/cancel', { method: 'POST' });
  } catch (e) { }
  if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
  setLoading('csvLoading', false);
  document.getElementById('evalBtn').disabled = false;
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
      💾 Simpan JSON
    </button>
    <button class="btn-secondary" onclick="saveResultsCSV()" title="Download ringkasan sebagai CSV">
      📊 Simpan CSV
    </button>
    <button class="btn-primary" onclick="printResults()" title="Print atau Save PDF via browser">
      🖨️ Print / PDF
    </button>`;
  el.appendChild(saveBar);

  // Simpan ke window untuk tombol save
  window._lastCsvResults = results;

  // Refresh history badge
  setTimeout(() => {
    fetch('/history').then(r => r.json()).then(d => {
      _historyData = d;
      const histTab = document.querySelectorAll('.tab-btn')[2];
      if (histTab && d.length) histTab.textContent = '📋 Riwayat (' + d.length + ')';
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
  wrap.style.borderTop = `4px solid ${color}`;

  const infoChips = key === 'metode1'
    ? `<span class="info-chip">🗂 Train: ${r.n_train.toLocaleString()}</span>
       <span class="info-chip">🧪 Test: ${r.n_test.toLocaleString()}</span>
       <span class="info-chip">${r.gpu ? '⚡ GPU (CUDA)' : '💻 CPU'}</span>
       <span class="info-chip" style="color:${r.preset === 'full' ? 'var(--warning)' : 'var(--success)'}">
         ${r.preset === 'full' ? '🔬 Mode Full' : '⚡ Mode Fast'}</span>`
    : `<span class="info-chip">🗂 Train: ${r.n_train.toLocaleString()}</span>
       <span class="info-chip">🔄 Adapt: ${r.n_adapt} (${Math.round(r.adapt_frac * 100)}%)</span>
       <span class="info-chip">⚖️ Bobot: ${r.adapt_weight}×</span>
       <span class="info-chip">🧪 Test: ${r.n_test.toLocaleString()}</span>
       <span class="info-chip">${r.gpu ? '⚡ GPU (CUDA)' : '💻 CPU'}</span>
       <span class="info-chip" style="color:${r.preset === 'full' ? 'var(--warning)' : 'var(--success)'}">
         ${r.preset === 'full' ? '🔬 Mode Full' : '⚡ Mode Fast'}</span>`;

  wrap.innerHTML = `
    <div class="method-divider"><span style="color:${color}">${r.metode}</span></div>
    <div style="margin-bottom:14px;">${infoChips}</div>

    <div class="model-row">
      ${buildModelSection(nb, 'Naive Bayes', '#6366f1')}
      ${buildModelSection(xgb, 'XGBoost', '#0284c7')}
    </div>

    <div class="result-section" style="margin-top:18px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <h3 style="margin:0;">📊 Top 20 Fitur Chi-Square (Naive Bayes)</h3>
        <button onclick="exportChi2AsPNG('chi2_${key}','chi2_${r.metode?.replace(/\s/g, '_')}.png')"
                class="btn-secondary" style="font-size:11px;padding:4px 10px;">
          🖼 Simpan PNG
        </button>
      </div>
      <div class="top20-grid" id="chi2_${key}">${buildTop20(r.top20_chi2)}</div>
    </div>`;
  return wrap;
}

function buildModelSection(m, name, color) {
  const cm = m.cm;
  return `
    <div>
      <div style="font-size:13px;font-weight:700;color:${color};margin-bottom:10px;">${name}</div>
      <div class="metric-grid" style="grid-template-columns:repeat(2,1fr);margin-bottom:12px;">
        ${metricBox(m.accuracy, 'Akurasi', color)}
        ${metricBox(m.f1, 'F1-Score', color)}
        ${metricBox(m.precision, 'Presisi', color)}
        ${metricBox(m.recall, 'Recall', color)}
      </div>
      <div style="font-size:12px;font-weight:600;color:var(--gray-600);margin-bottom:6px;">
        Confusion Matrix &nbsp;<span style="font-weight:400;color:var(--gray-400)">threshold ${m.threshold}%</span>
      </div>
      <table class="cm-table">
        <tr><th></th><th>Pred Non-Spam</th><th>Pred Spam</th></tr>
        <tr><th>Aktual Non-Spam</th><td class="tn">${cm.tn}<br><small>TN</small></td>
            <td class="fp">${cm.fp}<br><small>FP</small></td></tr>
        <tr><th>Aktual Spam</th><td class="fn">${cm.fn}<br><small>FN</small></td>
            <td class="tp">${cm.tp}<br><small>TP</small></td></tr>
      </table>
      <div style="margin-top:10px;">
        <div style="font-size:12px;font-weight:600;color:var(--gray-600);margin-bottom:6px;">Per Kelas</div>
        <table class="per-class-table">
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
  if (validFeatures.length === 0) return '<div style="color:var(--gray-400);font-size:12px;">Tidak ada fitur tersedia.</div>';
  const max = validFeatures[0].score;

  const half = Math.ceil(validFeatures.length / 2);
  const leftFeatures = validFeatures.slice(0, half);
  const rightFeatures = validFeatures.slice(half);

  const renderRows = (list, offset) => list.map((f, i) => `
    <tr>
      <td style="width:22px;text-align:center;color:var(--gray-400);font-size:11px;">${i + offset + 1}</td>
      <td style="font-weight:600;font-size:12px;max-width:120px;white-space:nowrap;
                 overflow:hidden;text-overflow:ellipsis;" title="${f.feature}">${f.feature}</td>
      <td style="width:160px;padding:0 8px;">
        <div style="background:var(--gray-100);border-radius:99px;height:10px;overflow:hidden;">
          <div style="background:var(--primary);height:100%;border-radius:99px;
                      width:${max > 0 ? Math.round(f.score / max * 100) : 0}%;
                      print-color-adjust:exact;-webkit-print-color-adjust:exact;"></div>
        </div>
      </td>
      <td style="font-size:11px;color:var(--gray-500);text-align:right;white-space:nowrap;">
        ${f.score.toLocaleString()}
      </td>
    </tr>`).join('');

  return `
    <table style="width:100%;border-collapse:collapse;align-self:start;">
      <tbody>${renderRows(leftFeatures, 0)}</tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;align-self:start;">
      <tbody>${renderRows(rightFeatures, half)}</tbody>
    </table>`;
}


// ═══════════════════════════════════════════
// PERBANDINGAN METODE 1 vs METODE 2
// ═══════════════════════════════════════════
function buildComparison(r1, r2) {
  const wrap = document.createElement('div');
  wrap.className = 'card';
  wrap.style.borderTop = '4px solid #16a34a';

  const models = ['naive_bayes', 'xgboost'];
  const mNames = ['Naive Bayes', 'XGBoost'];
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
    `<th style="font-size:11px;color:#6366f1">M1</th>
     <th style="font-size:11px;color:#0284c7">M2</th>
     <th style="font-size:11px;">Δ</th>`).join('');

  wrap.innerHTML = `
    <div class="method-divider">
      <span style="color:var(--success)">🔄 Perbandingan Metode 1 vs Metode 2</span>
    </div>
    <div style="overflow-x:auto;">
      <table class="cm-table" style="font-size:13px;">
        <thead>
          <tr><th rowspan="2">Model</th>${heads}</tr>
          <tr>${subHeads}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="margin-top:10px;font-size:12px;color:var(--gray-400);">
      M1 = Tanpa Domain Adaptation &nbsp;&bull;&nbsp; M2 = Domain Adaptation ${Math.round(r2.adapt_frac * 100)}%
      &nbsp;&bull;&nbsp; Δ = selisih M2 terhadap M1
    </div>`;
  return wrap;
}

// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
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
      <div style="font-size:11px;font-weight:700;color:var(--gray-400);
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
          <div style="font-size:11px;font-weight:700;color:var(--gray-400);
               text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;">Rekomendasi</div>
          <div style="font-weight:800;color:${rek.is_spam ? 'var(--danger)' : 'var(--success)'};
               font-size:1rem;">${rek.is_spam ? '🚨' : '✅'} ${rek.label}</div>
          <div style="font-size:12px;color:var(--gray-600);margin-top:4px;">${rek.alasan}</div>
        </div>
        <div style="flex:1;min-width:180px;">
          <div style="font-size:11px;font-weight:700;color:var(--gray-400);
               text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;">Indikator</div>
          <div>${spamTags}${hamTags || '<span style="font-size:12px;color:var(--gray-400);">-</span>'}</div>
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
            <div style="font-size:11px;color:var(--gray-400);margin-bottom:8px;">${note}</div>
            <div class="prob-bar-wrap">
              <div class="prob-bar-label"><span>Prob. Spam</span><span>${m.probability}%</span></div>
              <div class="prob-bar-track">
                <div class="prob-bar-fill ${m.is_spam ? 'spam' : 'ham'}" style="width:${m.probability}%"></div>
              </div>
            </div>
            <div style="font-size:11px;color:var(--gray-400);margin-top:4px;">
              Threshold: <b>${m.threshold}%</b> | Conf: <b>${m.confidence}</b>
            </div>
          </div>`).join('')}
      </div>
      <div style="margin-top:12px;padding:14px;background:transparent;border:1px solid var(--border);border-radius:8px;font-size:13px;line-height:1.7;color:var(--gray-800);">
        <div style="font-size:11px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Analisis Teks — Kata merah = indikator spam</div>
        ${highlightSpamWords(document.getElementById('realtimeText').value.trim() || '')}
      </div>
    </div>`;
}

document.getElementById('realtimeText').addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') analyzeRealtime();
});

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
             color:#1f2937; font-size:12px; }
      h1   { font-size:17px; font-weight:800; margin-bottom:4px; }
      p.sub { color:#6b7280; font-size:11px; margin-bottom:14px; }
      hr   { border:none; border-top:1px solid #e5e7eb; margin:10px 0; }

      /* method divider */
      .method-divider { display:flex; align-items:center; gap:10px;
                         margin:16px 0 10px; font-size:14px; font-weight:800; }
      .method-divider::before, .method-divider::after
        { content:''; flex:1; height:2px; background:#e5e7eb; }

      /* info chips */
      .info-chip { display:inline-block; background:#f3f4f6; border:1px solid #e5e7eb;
                   border-radius:99px; padding:2px 8px; font-size:10px; color:#4b5563;
                   margin:1px; }

      /* metrics */
      .metric-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:6px;
                     margin-bottom:10px; }
      .metric-box  { border:1px solid #e5e7eb; border-radius:8px; padding:8px;
                     text-align:center; }
      .metric-box .val { font-size:1.2rem; font-weight:800; color:#4f46e5; }
      .metric-box .lbl { font-size:10px; color:#9ca3af; }

      /* 2-col model layout */
      .model-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
      .model-col  { }

      /* tables */
      table { width:100%; border-collapse:collapse; font-size:11px;
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
      .cmp-tbl { width:100%; border-collapse:collapse; font-size:11px; }
      .cmp-tbl th,td { border:1px solid #e5e7eb; padding:4px 7px; text-align:center; }
      .cmp-tbl th { background:#f3f4f6; font-weight:700; }

      /* section headers */
      .section-title { font-size:12px; font-weight:700; color:#4b5563; margin:8px 0 4px;
                       border-bottom:1px solid #e5e7eb; padding-bottom:3px; }

      /* badges */
      .badge-spam    { background:#fee2e2; color:#dc2626; border-radius:99px;
                       padding:1px 7px; font-size:10px; font-weight:700; }
      .badge-nonspam { background:#dcfce7; color:#16a34a; border-radius:99px;
                       padding:1px 7px; font-size:10px; font-weight:700; }

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
function hide(id) { document.getElementById(id).classList.remove('active'); document.getElementById(id).style.display = 'none'; }
function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg; el.classList.add('active'); el.style.display = 'block';
}
function setLoading(id, active, display = 'block') {
  const el = document.getElementById(id);
  if (active) { el.classList.add('active'); el.style.display = display; }
  else { el.classList.remove('active'); el.style.display = 'none'; }
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
      noteEl.textContent = '✓ Seimbang';
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
        note += ' — ✓ Seimbang';
        noteEl.style.color = 'var(--success)';
      } else {
        const ratio = Math.max(ns, sp) / Math.min(ns, sp);
        note += ` — Rasio ${ratio.toFixed(1)}:1`;
        noteEl.style.color = ratio <= 2 ? 'var(--warning)' : 'var(--danger)';
      }
    } else {
      noteEl.style.color = 'var(--gray-600)';
    }
    noteEl.textContent = note;
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
  // Restore job ID terakhir dari session
  const saved = sessionStorage.getItem('lastJobId');
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
  fetch('/last_result')
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
        <span class="stat-chip total">📊 Total: ${data.total.toLocaleString('id')}</span>
        <span class="stat-chip nonspam">✅ Non-Spam: ${data.n_nonspam.toLocaleString('id')}</span>
        <span class="stat-chip spam">🚨 Spam: ${data.n_spam.toLocaleString('id')}</span>
        <span class="stat-chip info">Kolom Teks: <b>${data.text_col}</b></span>
        <span class="stat-chip info">Kolom Label: <b>${data.label_col}</b></span>
        <span class="stat-chip info">Rata-rata panjang: ${data.avg_len} karakter</span>
        <span style="font-size:12px;font-weight:600;color:${balColor};align-self:center;">
        </span>
      </div>`;
  } catch (e) {
    document.getElementById(targetElId).style.display = 'none';
  }
}

// ═══════════════════════════════════════════
// BATCH PREDIKSI TEKS
// ═══════════════════════════════════════════
let _batchData = [];

// Tambah tombol Batch ke card input teks
document.addEventListener('DOMContentLoaded', () => {
  const btnGroup = document.querySelector('.btn-group') ||
    document.querySelector('#analyzeBtn')?.parentElement;
  if (btnGroup) {
    const batchBtn = document.createElement('button');
    batchBtn.className = 'btn-secondary';
    batchBtn.textContent = '📋 Batch';
    batchBtn.title = 'Prediksi banyak email (satu per baris)';
    batchBtn.onclick = analyzeBatch;
    btnGroup.appendChild(batchBtn);
  }
});

async function analyzeBatch() {
  const raw = document.getElementById('emailText').value.trim();
  if (!raw) { showError('textError', 'Masukkan beberapa email (pisah dengan baris kosong).'); return; }

  // Split per dua baris kosong atau single line
  const emails = raw.split(/\n\s*\n/).map(s => s.trim()).filter(s => s.length > 0);
  if (emails.length < 2) {
    showError('textError', 'Untuk mode batch: pisahkan email dengan baris kosong. Minimal 2 email.');
    return;
  }

  const btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  setLoading('textLoading', true);
  document.getElementById('batchCard').style.display = 'none';
  document.getElementById('textResults').style.display = 'none';
  hide('textError');
  _batchData = [];

  let spam = 0, nonspam = 0;
  const rows = [];

  for (let i = 0; i < emails.length; i++) {
    try {
      const res = await fetch('/predict', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: emails[i] }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      const rek = d.rekomendasi || d.consensus;
      const isSpam = rek?.is_spam ?? false;
      if (isSpam) spam++; else nonspam++;
      _batchData.push({
        email: emails[i], isSpam,
        nb_prob: d.naive_bayes?.probability,
        xgb_prob: d.xgboost?.probability,
        nb_label: d.naive_bayes?.label,
        xgb_label: d.xgboost?.label,
      });
      const preview = emails[i].substring(0, 60) + (emails[i].length > 60 ? '...' : '');
      rows.push(`
        <div class="batch-row">
          <span class="batch-num">${i + 1}</span>
          <span class="batch-text" title="${emails[i].replace(/"/g, '&quot;')}">${preview}</span>
          <span style="font-size:11px;color:var(--gray-400);white-space:nowrap;margin:0 6px;">
            NB ${d.naive_bayes?.probability}% | XGB ${d.xgboost?.probability}%
          </span>
          <span class="${isSpam ? 'batch-spam' : 'batch-ham'}">${isSpam ? '🚨 SPAM' : '✅ NON-SPAM'}</span>
        </div>`);
    } catch (e) {
      rows.push(`<div class="batch-row"><span class="batch-num">${i + 1}</span>
        <span class="batch-text">Error: ${e.message}</span></div>`);
    }
  }

  setLoading('textLoading', false);
  btn.disabled = false;
  document.getElementById('batchResults').innerHTML = rows.join('');
  document.getElementById('batchSummary').textContent =
    `${emails.length} email — 🚨 ${spam} Spam | ✅ ${nonspam} Non-Spam`;
  document.getElementById('batchCard').style.display = 'block';
}

function clearBatch() {
  document.getElementById('batchCard').style.display = 'none';
  _batchData = [];
}

function exportBatchCSV() {
  if (!_batchData.length) return;
  const rows = [['No', 'Preview Email', 'Label', 'NB Prob (%)', 'XGB Prob (%)', 'NB Label', 'XGB Label']];
  _batchData.forEach((d, i) => {
    rows.push([i + 1,
    '"' + d.email.substring(0, 80).replace(/"/g, '""') + '"',
    d.isSpam ? 'SPAM' : 'NON-SPAM',
    d.nb_prob, d.xgb_prob, d.nb_label, d.xgb_label]);
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  downloadFile('\uFEFF' + csv, 'batch_prediksi_' + getNowStr() + '.csv', 'text/csv;charset=utf-8');
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

// ═══════════════════════════════════════════
// MODEL LOADING STATUS di Mode Teks (poin 1)
// ═══════════════════════════════════════════
(function checkModelStatus() {
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (!analyzeBtn) return;

  fetch('/status')
    .then(r => r.json())
    .then(d => {
      if (d.status === 'loading') {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = '⏳ Model dimuat...';
        // Poll tiap 2 detik sampai ready
        const t = setInterval(() => {
          fetch('/status').then(r => r.json()).then(s => {
            if (s.status === 'ready') {
              clearInterval(t);
              analyzeBtn.disabled = false;
              analyzeBtn.textContent = '🔍 Analisis';
            } else if (s.status === 'error') {
              clearInterval(t);
              analyzeBtn.textContent = '❌ Model gagal dimuat';
            }
          }).catch(() => { });
        }, 2000);
      }
    })
    .catch(() => { });
})();

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
  if (!features || features.length === 0) return '<div style="color:var(--gray-400);font-size:11px;padding:4px 0;">Tidak ada data.</div>';
  const validFeatures = features.slice(0, 10).filter(f => f.score !== null && f.score !== undefined);
  if (validFeatures.length === 0) return '<div style="color:var(--gray-400);font-size:11px;padding:4px 0;">Tidak ada data.</div>';
  const max = validFeatures[0].score;

  const rows = validFeatures.map((f, i) => `
    <tr style="border-bottom:1px solid var(--border);height:24px;">
      <td style="width:20px;text-align:center;color:var(--gray-400);font-size:10px;padding:2px 0;">${i + 1}</td>
      <td style="font-weight:600;font-size:11px;max-width:85px;white-space:nowrap;
                 overflow:hidden;text-overflow:ellipsis;padding:2px 0;" title="${f.feature}">${f.feature}</td>
      <td style="width:70px;padding:0 4px;">
        <div style="background:var(--gray-100);border-radius:99px;height:5px;overflow:hidden;">
          <div style="background:var(--primary);height:100%;border-radius:99px;
                      width:${max > 0 ? Math.round(f.score / max * 100) : 0}%;"></div>
        </div>
      </td>
      <td style="font-size:10px;color:var(--gray-500);text-align:right;white-space:nowrap;padding:2px 0;">
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
      <span style="font-size:11px;color:var(--gray-600);">${r.timestamp}</span><br>
      Adapt: ${Math.round((r.adapt_frac ?? 0) * 100)}% | Test: ${r.n_nonspam ?? 'all'}/${r.n_spam ?? 'all'} | ${r.preset?.toUpperCase()}
      ${r.note ? `<br><i style="color:var(--gray-400);font-size:11px;">"${r.note}"</i>` : ''}
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
              <div style="font-size:11px;font-weight:600;margin-bottom:4px;color:var(--gray-600)">${mk === 'metode1' ? 'M1' : 'M2'} - ${alg.toUpperCase()}</div>
              <table class="cm-table" style="font-size:10px;margin-bottom:0;width:100%;">
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
        <div style="font-size:13px;font-weight:700;margin-bottom:12px;color:${colors[i % colors.length]}">Eks ${i + 1}${r.label_name ? ' — ' + r.label_name : ''}</div>
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
            <div style="font-size:11px;font-weight:600;margin-bottom:4px;color:var(--gray-600)">${mk === 'metode1' ? 'M1 (Pure)' : 'M2 (Adapt)'} - Chi-Square (Naive Bayes)</div>
            <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:6px;padding:6px;">
              ${buildTop10(top10)}
            </div>
          </div>`;
      }
    });
    if (!grids) return '';
    return `
      <div style="margin-bottom:16px;background:transparent;border:1px solid var(--border);border-radius:8px;padding:14px;border-left:4px solid ${colors[i % colors.length]};box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div style="font-size:13px;font-weight:700;margin-bottom:12px;color:${colors[i % colors.length]}">Eks ${i + 1}${r.label_name ? ' — ' + r.label_name : ''}</div>
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
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;margin-bottom:16px;font-size:13px;">
        ${infoCards}
      </div>
      <div style="overflow-x:auto;margin-bottom:18px;">
        <table class="cm-table" style="font-size:12px;min-width:600px;">
          <thead><tr><th>Model</th>${headersHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div style="font-size:11px;color:var(--success);margin-top:4px;">&#9654; Nilai tertinggi ditampilkan tebal hijau</div>
      </div>
      <div style="margin-top:4px;">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px;">&#128202; Grafik Perbandingan Akurasi &amp; F1</div>
        <canvas id="${chartId}" height="120"></canvas>
      </div>
      <div style="margin-top:20px;">
        <div style="font-size:13px;font-weight:700;margin-bottom:12px;">🟦 Confusion Matrix</div>
        ${cmGridsHtml || '<div style="font-size:11px;color:var(--gray-400)">Tidak ada data Confusion Matrix di histori yang dipilih.</div>'}
      </div>
      <div style="margin-top:20px;">
        <div style="font-size:13px;font-weight:700;margin-bottom:12px;">📊 Top 10 Fitur Chi-Square</div>
        ${chiGridsHtml || '<div style="font-size:11px;color:var(--gray-400)">Tidak ada data Fitur Chi-Square di histori yang dipilih.</div>'}
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
  const countEl = document.getElementById('selectedCount');
  const all = document.getElementById('checkAll');
  const total = document.querySelectorAll('.hist-check').length;

  countEl.textContent = checked.length;
  delBtn.style.display = checked.length > 0 ? 'inline-flex' : 'none';
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
      ? '<span style="color:var(--success);font-size:11px;">✓ Selesai</span>'
      : h.status === 'cancelled'
        ? '<span style="color:var(--warning);font-size:11px;">⏹ Dibatalkan</span>'
        : '<span style="color:var(--danger);font-size:11px;">✗ Error</span>';
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
        <span style="text-transform:uppercase;font-size:11px;font-weight:700;
          color:${h.preset === 'full' ? 'var(--warning)' : 'var(--success)'};">${h.preset}</span>
        <br>
        <span style="font-size:9px;background:var(--gray-700);color:#fff;padding:2px 4px;border-radius:4px;white-space:nowrap;display:inline-block;margin-top:2px;">
          ${h.custom_train ? 'Train+Test' : 'Hanya Test'}
        </span>
      </td>
      <td>
        <div style="font-size:10px; opacity:0.9; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(h.train_dataset_name || (h.custom_train ? 'Custom Train' : 'emails.csv (bawaan)'))}">
          <span style="opacity:0.6; font-weight:bold;">Tr:</span> ${escapeHtml(h.train_dataset_name || (h.custom_train ? 'Custom Train' : 'emails.csv (bawaan)'))}
        </div>
        <div style="font-size:10px; opacity:0.9; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px;" title="${escapeHtml(h.test_dataset_name || 'data_test_berlabel_awal.csv')}">
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
        <span style="font-size:11px;color:var(--gray-600);max-width:90px;display:inline-block;
              overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;"
              title="${h.note || ''}">${h.note || ''}</span>
        <button onclick="editNote('${h.job_id}','${(h.note || '').replace(/'/g, '\\\'')}')"
                style="background:none;border:none;cursor:pointer;font-size:12px;
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
  renderHistory();
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

  document.getElementById('evalBtn').disabled = true;
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
    document.getElementById('evalBtn').disabled = false;
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
