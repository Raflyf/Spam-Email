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
  const copyBtn = `<button onclick="copyResultToClipboard()" style="margin-left:auto;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);border-radius:6px;padding:5px 12px;font-size:14px;font-weight:600;color:inherit;cursor:pointer;" title="Salin hasil ke clipboard">📋 Salin Hasil</button>`;

  banner.innerHTML = `
    <div class="consensus-banner ${finalIsSpam ? 'spam' : 'ham'}">
      <div class="consensus-icon">${finalIsSpam ? '🚨' : '✅'}</div>
      <div class="consensus-text" style="flex:1;">
        <h3>${finalIsSpam ? 'EMAIL INI TERDETEKSI SPAM' : 'EMAIL INI BUKAN SPAM'}</h3>
        <p>${finalDesc}</p>
      </div>
      ${copyBtn}
    </div>
    ${rawText ? `<div style="margin-top:12px;padding:14px;background:transparent;border:1px solid var(--border);border-radius:8px;font-size:14px;line-height:1.7;color:var(--gray-800);">
      <div style="font-size:13px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Analisis Teks — Kata merah = indikator spam</div>
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
          <div style="font-size:14px;font-weight:700;color:var(--gray-400);
               text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">
            Rekomendasi Final (XGBoost)
          </div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-size:1.6rem;">${isSpam ? '🚨' : '✅'}</span>
            <span style="font-size:1.1rem;font-weight:800;
              color:${isSpam ? 'var(--danger)' : 'var(--success)'};">${rek.label}</span>
            <span style="font-size:14px;color:${levelColor};font-weight:600;">
              ${levelIcon} Keyakinan ${rek.level}
            </span>
          </div>
          <div style="font-size:14px;color:var(--gray-600);line-height:1.5;">
            ${rek.alasan}
          </div>
        </div>
        <div style="flex:1;min-width:200px;">
          <div style="font-size:14px;font-weight:700;color:var(--gray-400);
               text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">
            Indikator Ditemukan
          </div>
          ${spamTags || hamTags
        ? `<div>${spamTags}${hamTags}</div>`
        : `<div style="font-size:14px;color:var(--gray-400);">Tidak ada indikator khusus</div>`}
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
        <span style="font-weight:700;font-size:15px;letter-spacing:.5px;text-transform:uppercase;">${name}</span>
        <span class="label-badge ${m.is_spam ? 'spam' : 'ham'}">${m.label}</span>
      </div>
      <div style="font-size:13px;color:var(--gray-400);margin-bottom:10px;">${note}</div>
      <div class="prob-bar-wrap">
        <div class="prob-bar-label"><span>Probabilitas Spam</span><span>${m.probability}%</span></div>
        <div class="prob-bar-track">
          <div class="prob-bar-fill ${m.is_spam ? 'spam' : 'ham'}" style="width:${m.probability}%"></div>
        </div>
      </div>
      <div style="font-size:14px;color:var(--gray-400);margin-top:6px;">
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
          <span style="font-size:13px;color:var(--gray-400);white-space:nowrap;margin:0 6px;">
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

