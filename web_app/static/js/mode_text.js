// ═══════════════════════════════════════════
// MODE TEKS
// ═══════════════════════════════════════════

const LI = (name, size=14) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:text-bottom;" data-lucide="${name}"><use href="#lucide-${name}"></use></svg>`;

const examples = [
  {
    label: 'Spam: Hadiah',
    text: 'One More Week of Launch Discount!\nWITHOUT A HITCH launched last week, and it\'s been amazing to watch players explore the chaotic wasteland with their friends!\nIf you haven\'t already joined us, the 10% launch discount It is available for one more week, ending May 19th at 10 AM PT. Now\'s the time to grab your crew, pick up the Apocazon P.A.C.K.A.G.E., and hit the road.\nIf you\'ve been waiting to jump in, now\'s the time to grab your crew, pick up the Apocazon P.A.C.K.A.G.E., and hit the road.\nWe\'ve got a second free reward for you:\n🎁Another Free Launch Reward 🎁\nWOAH Graphic\nYour Code:\nGETY-OURB-EARG-RILL\nThis is a new gift, separate from last week\'s code. Once you\'ve got WITHOUT A HITCH, you can redeem both codes in-game.This WITHOUT A HITCH in-game code expires in 2 weeks, on May 26th, at 10 AM PT\nReady to roll?'
  },
  {
    label: 'Spam: Game Crossover',
    text: 'Play the Crossover Event!\nAdventure with Sung Jinwoo, Choi Jong-In,\nCha Hae-In, & Igris!\nGrand Summoners, an action-packed mobile JRPG, is collaborating with Solo Leveling!!\nHere are some of the highlights for the crossover starting on June 12, 2026 (PDT):\nSummon a Guaranteed ★5 Legend on your first roll.\n    Get the chance to summon fully voiced Sung Jinwoo, Choi Jong-In, Cha Hae-In, and Igris & their weapons by using over 100 free Crossover Summon Tickets obtainable from daily login bonuses and limited-time missions.\n    The Demon Monach\'s Sword, as well as other iconic items such as Igris\' Claymore, emerge as summonable powerful Equips.\n    The characters\' skills and Arts recreate epic moves from the anime.\nFor exciting videos on the collaboration, visit Grand Summoners\' official YouTube channel.\nJoin the GS Community!\nDiscord, Facebook, X X, Bluesky, Instagram,\nYouTube, Displate\nWhat are you waiting for? Download Grand Summoners and start your adventure with Sung Jinwoo & co. today!'
  },
  {
    label: 'Spam: Promo Bisnis',
    text: 'Hello Description\nBig news! Genie AI has secured $17.8 million in Series A funding, led by Google Ventures and joined by Khosla Ventures.\nThis is a huge leap forward for us in our mission to empower everyone to create quality legal agreements, instantly.\nRead more about what this means for you here - as we build the world\'s most secure and accurate Legal AI.\nWe need your help to celebrate 🎉\nWe will add 3 Premium documents with 5 AI uses each to your Genie account (worth ~$140) if you comment on and share our LinkedIn post today!\nHere\'s what to do:\n    Comments on the LinkedIn post - tell us what you like about Genie\n    Share the post with your network - with or without a personal message\n    Reply to this email with \'done\' - to lock in +3 Premium Docs for your help\nWhen will you get them? We\'ll tally everything up in 48 hours, and update your account with new premium documents by Monday or Tuesday next week.\nWhy help? We get to showcase you, our fantastic users, and build momentum around our Legal AI.\nReady to celebrate with us? Amazing! Click here to comment on our LinkedIn post. Don\'t forget to mention what you love about Genie.'
  },
  {
    label: 'Normal: IBM SkillsBuild',
    text: 'Footprint in collaboration with IBM SkillsBuild\nHello Participants of DescriptionDeadline Steps to work on the class at IBM SkillsBuild is getting closer. Come on, immediately continue and finish the class before June 30, 2022 so that your learning progress remains safe. Please make the most of the time left and work out gradually from now on. Make sure you complete the class until you successfully print the certificate. If you have completed the class, please ignore this message. The spirit of learning with the footing 🙌\nIntroduction to Artificial Intelligence'
  },
  {
    label: 'Normal: GitHub Copilot',
    text: 'Hi there,\n\nWe\'re updating how GitHub uses data to improve AI-powered coding tools. From April 24 onward, your interactions with GitHub Copilot—including inputs, outputs, code snippets, and associated context—may be used to train and enhance AI models unless you opt out.\n\nIf you previously opted out of the setting allowing GitHub to collect this data for product improvements, your preference has been retained— your choice is preserved, and your data will not be used for training unless you opt in.\n\nThis approach aligns with established industry practices and will enable our models to deliver more context-aware AI coding assistance. We have tested this with Microsoft interaction data and have seen meaningful improvements, including increased acceptance rates in multiple languages.\n\nPlease review your settings and choose whether your interactions with Copilot can be leveraged for training AI models before this update goes into effect on April 24. To opt out or adjust your settings:\n\n    Go to GitHub Account Settings\n    Select Copilot\n    Choose whether to allow your data to be used for AI model training\n\nTo learn more, please refer to our blog post and FAQ.\n\nPlease reach out to our support team if you have any questions about this update. Thank you for your continued use of GitHub Copilot.\n\nSincerely,\nThe GitHub Team'
  },
  {
    label: 'Normal: Tugas Kampus',
    text: 'Hi,\n\nYour instructor has posted a new announcement in "Skripsi dan Tugas Akhir".\n\n"Please submit your draft document by next Friday so we can review the progress. If you have any questions regarding the formatting, check the syllabus guidelines attached in the portal."\n\nTo view this announcement, please log in to the student academic portal.\n\nBest regards,\nUniversity Academic System'
  },
];
document.querySelectorAll('.example-pills').forEach(pillsEl => {
  const isRealtime = !pillsEl.closest('#pane-text');
  examples.forEach(ex => {
    const p = document.createElement('button');
    p.className = 'pill';
    const isSpam = ex.label.toLowerCase().includes('spam');
    const iconName = isSpam ? 'mail-warning' : 'mail-check';
    p.innerHTML = `<i data-lucide="${iconName}" style="width:14px;height:14px;"></i> ${ex.label}`;
    p.style.display = 'inline-flex';
    p.style.alignItems = 'center';
    p.style.gap = '6px';
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
  clearBatch();
  
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
  
  const resultsEl = document.getElementById('textResults');
  if (resultsEl.style.display === 'none') {
    setLoading('textLoading', true);
  }
  
  const analyzeBtn = document.getElementById('analyzeBtn');
  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = '<i data-lucide="loader-2" style="width:15px;height:15px;vertical-align:text-bottom;margin-right:5px;"></i>Menganalisis...';
  lucide.createIcons();
  try {
    const res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    
    renderTextResult(data, text);
    
    // Panggil observer HANYA jika sebelumnya tersembunyi
    if (resultsEl.style.display === 'none' && typeof window.observeScrollReveal === 'function') {
      window.observeScrollReveal(resultsEl);
    }
    
    resultsEl.style.display = 'block';
    
    setTimeout(() => {
      document.querySelectorAll('#textResults .prob-bar-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-prob') + '%';
      });
    }, 50);
  } catch (e) { showError('textError', e.message); }
  finally { 
    setLoading('textLoading', false); 
    analyzeBtn.disabled = false; 
    analyzeBtn.innerHTML = '<i data-lucide="search" style="width:15px;height:15px;vertical-align:text-bottom;margin-right:5px;"></i>Analisis'; 
    lucide.createIcons(); 
  }
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
  const escaped = text.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/\n/g, '<br>');
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
  const copyBtn = `<button onclick="copyResultToClipboard()" style="margin-left:auto;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);border-radius:6px;padding:5px 12px;font-size:14px;font-weight:600;color:inherit;cursor:pointer;display:flex;align-items:center;gap:5px;" title="Salin hasil ke clipboard"><i data-lucide="clipboard" style="width:14px;height:14px;"></i> Salin Hasil</button>`;

  banner.innerHTML = `
    <div class="consensus-banner ${finalIsSpam ? 'spam' : 'ham'}">
      <div class="consensus-icon">${finalIsSpam ? '<i data-lucide="shield-alert" style="width:28px;height:28px;"></i>' : '<i data-lucide="shield-check" style="width:28px;height:28px;"></i>'}</div>
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
  lucide.createIcons({ nodes: [banner] });

  // Rekomendasi & indikator
  const rekBox = document.getElementById('rekomendasiBox');
  if (rek) {
    rekBox.style.display = 'block';
    const isSpam = rek.is_spam;
    const levelColor = rek.level === 'tinggi' ? 'var(--success)' : 'var(--warning)';
    const levelIcon = rek.level === 'tinggi' ? '<i data-lucide="circle-check" style="width:14px;height:14px;color:var(--success);vertical-align:text-bottom;"></i>' : '<i data-lucide="circle-alert" style="width:14px;height:14px;color:var(--warning);vertical-align:text-bottom;"></i>';

    const spamTags = (rek.indikator_spam || []).map(r =>
      `<span class="indicator-spam"><i data-lucide="flag" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:3px;"></i>${r}</span>`).join('');
    const hamTags = (rek.indikator_ham || []).map(r =>
      `<span class="indicator-ham"><i data-lucide="check" style="width:12px;height:12px;vertical-align:text-bottom;margin-right:3px;"></i>${r}</span>`).join('');

    rekBox.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;">
          <div style="font-size:14px;font-weight:700;color:var(--gray-400);
               text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">
            Rekomendasi Final (XGBoost)
          </div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-size:1.4rem;line-height:1;">${isSpam ? '<i data-lucide="shield-alert" style="width:28px;height:28px;color:var(--danger);"></i>' : '<i data-lucide="shield-check" style="width:28px;height:28px;color:var(--success);"></i>'}</span>
            <span style="font-size:1.1rem;font-weight:800;
              color:${isSpam ? 'var(--danger)' : 'var(--success)'};"><b>${rek.label}</b></span>
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
    lucide.createIcons({ nodes: [rekBox] });
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
          <div class="prob-bar-fill ${m.is_spam ? 'spam' : 'ham'}" style="width:0%" data-prob="${m.probability}"></div>
        </div>
      </div>
      <div style="font-size:14px;color:var(--gray-400);margin-top:6px;">
        Threshold: <b>${m.threshold}%</b> &nbsp;|&nbsp; Confidence: <b>${m.confidence}</b>
      </div>
    </div>`).join('');

  const note = document.getElementById('agreementNote');
  note.style.color = c.agreement ? 'var(--success)' : 'var(--warning)';
  note.innerHTML = c.agreement
    ? '<i data-lucide="check-circle" style="width:14px;height:14px;vertical-align:text-bottom;margin-right:4px;color:var(--success);"></i>Kedua model memberikan prediksi yang sama.'
    : '<i data-lucide="alert-triangle" style="width:14px;height:14px;vertical-align:text-bottom;margin-right:4px;color:var(--warning);"></i>Kedua model berbeda pendapat — rekomendasi mengikuti XGBoost (akurasi lebih tinggi).'; lucide.createIcons({nodes:[note]});
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
let _batchSortKey = 'num';
let _batchSortAsc = true;

function sortBatch(key) {
  if (_batchSortKey === key) {
    _batchSortAsc = !_batchSortAsc;
  } else {
    _batchSortKey = key;
    _batchSortAsc = key === 'num';
  }
  renderBatchResults();
}

function getSortIndicator(key) {
  if (_batchSortKey !== key) return '';
  return _batchSortAsc ? ' ▲' : ' ▼';
}

function renderBatchResults() {
  const sorted = [..._batchData].sort((a, b) => {
    let va, vb;
    switch (_batchSortKey) {
      case 'num': va = a._num; vb = b._num; break;
      case 'result': va = a.isSpam ? 1 : 0; vb = b.isSpam ? 1 : 0; break;
      case 'nb_prob': va = a.nb_prob || 0; vb = b.nb_prob || 0; break;
      case 'xgb_prob': va = a.xgb_prob || 0; vb = b.xgb_prob || 0; break;
      default: va = a._num; vb = b._num;
    }
    if (va < vb) return _batchSortAsc ? -1 : 1;
    if (va > vb) return _batchSortAsc ? 1 : -1;
    return 0;
  });

  const rows = sorted.map((d) => {
    const preview = d.email.substring(0, 100) + (d.email.length > 100 ? '...' : '');
    const hasError = d._error;
    return `<tr>
      <td style="text-align:center;font-weight:700;color:var(--gray-400);width:80px;">${d._num}</td>
      <td style="font-size:13px;color:var(--gray-600);width:auto;text-align:left;padding-left:10px;">${preview}</td>
      <td style="font-size:13px;color:var(--gray-400);white-space:nowrap;width:180px;text-align:center;">${hasError ? 'Error' : 'NB ' + d.nb_prob + '% | XGB ' + d.xgb_prob + '%'}</td>
      <td style="font-weight:700;font-size:14px;white-space:nowrap;width:130px;${hasError ? 'color:var(--gray-400);' : d.isSpam ? 'color:var(--danger);' : 'color:var(--success);'}">${hasError ? '<i data-lucide="alert-triangle" style="width:13px;height:13px;vertical-align:text-bottom;margin-right:3px;"></i>Error' : d.isSpam ? '<i data-lucide="shield-alert" style="width:13px;height:13px;vertical-align:text-bottom;margin-right:3px;"></i>SPAM' : '<i data-lucide="shield-check" style="width:13px;height:13px;vertical-align:text-bottom;margin-right:3px;"></i>Bukan Spam'}</td>
    </tr>`;
  }).join('');

  document.getElementById('batchResults').innerHTML = `<table class="cm-table" style="table-layout:fixed;width:100%;min-width:600px;text-align:left;">
    <thead><tr>
      <th style="cursor:pointer;user-select:none;width:80px;text-align:center;" onclick="sortBatch('num')">Email #${getSortIndicator('num')}</th>
      <th style="width:auto;text-align:left;padding-left:10px;">Preview Teks</th>
      <th style="cursor:pointer;user-select:none;font-size:13px;width:180px;text-align:center;" onclick="sortBatch('nb_prob')">Probabilitas${getSortIndicator('nb_prob')}</th>
      <th style="cursor:pointer;user-select:none;width:130px;" onclick="sortBatch('result')">Result${getSortIndicator('result')}</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
  lucide.createIcons({ nodes: [document.getElementById('batchResults')] });
}

// (Tombol Batch sekarang langsung di index.html)

async function analyzeBatch() {
  const raw = document.getElementById('emailText').value.trim();
  if (!raw) { showError('textError', 'Masukkan beberapa email (pisah dengan baris kosong).'); return; }

  // Split per dua baris kosong atau single line
  const emails = raw.split(/\n\s*\n/).map(s => s.trim()).filter(s => s.length > 0);
  if (emails.length < 2) {
    showError('textError', 'Untuk mode batch: pisahkan email dengan baris kosong. Minimal 2 email.');
    return;
  }

  const btnBatch = document.getElementById('batchBtnHtml');
  const btnAnalyze = document.getElementById('analyzeBtn');
  const bCard = document.getElementById('batchCard');
  
  // Disable both buttons during processing
  btnBatch.disabled = true;
  btnAnalyze.disabled = true;
  
  // Ubah teks tombol Batch menjadi loading
  const originalBatchHtml = btnBatch.innerHTML;
  btnBatch.innerHTML = '<i data-lucide="loader-2" style="width:15px;height:15px;vertical-align:text-bottom;margin-right:5px;"></i>Menganalisis...';
  lucide.createIcons();

  if (bCard.style.display === 'none') {
    setLoading('textLoading', true);
  }
  
  hide('textError');
  _batchData = [];

  let spam = 0, nonspam = 0;

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
        _num: i + 1,
        email: emails[i], isSpam,
        nb_prob: d.naive_bayes?.probability,
        xgb_prob: d.xgboost?.probability,
        nb_label: d.naive_bayes?.label,
        xgb_label: d.xgboost?.label,
      });
    } catch (e) {
      _batchData.push({
        _num: i + 1,
        email: emails[i], isSpam: null,
        nb_prob: null, xgb_prob: null,
        nb_label: 'Error', xgb_label: 'Error',
        _error: e.message
      });
    }
  }

  setLoading('textLoading', false);
  btnBatch.disabled = false;
  btnAnalyze.disabled = false;
  btnBatch.innerHTML = originalBatchHtml;
  lucide.createIcons();
  
  // Hide text results if it was showing
  document.getElementById('textResults').style.display = 'none';

  renderBatchResults();
  document.getElementById('batchSummary').innerHTML =
    `${emails.length} email &mdash; <i data-lucide="shield-alert" style="width:13px;height:13px;vertical-align:text-bottom;color:var(--danger);"></i> ${spam} Spam &nbsp;|&nbsp; <i data-lucide="shield-check" style="width:13px;height:13px;vertical-align:text-bottom;color:var(--success);"></i> ${nonspam} Bukan Spam`;
  lucide.createIcons({nodes:[document.getElementById('batchSummary')]});
  
  // Panggil observer HANYA jika sebelumnya tersembunyi
  if (bCard.style.display === 'none' && typeof window.observeScrollReveal === 'function') {
    window.observeScrollReveal(bCard);
  }
  
  bCard.style.display = 'block';
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
        analyzeBtn.innerHTML = '<i data-lucide="loader" style="width:14px;height:14px;vertical-align:text-bottom;margin-right:4px;"></i>Model dimuat...'; lucide.createIcons({nodes:[analyzeBtn]});
        // Poll tiap 2 detik sampai ready
        const t = setInterval(() => {
          fetch('/status').then(r => r.json()).then(s => {
            if (s.status === 'ready') {
              clearInterval(t);
              analyzeBtn.disabled = false;
              analyzeBtn.innerHTML = '<i data-lucide="search" style="width:14px;height:14px;vertical-align:text-bottom;margin-right:4px;"></i>Analisis'; lucide.createIcons({nodes:[analyzeBtn]});
            } else if (s.status === 'error') {
              clearInterval(t);
              analyzeBtn.innerHTML = '<i data-lucide="x-circle" style="width:14px;height:14px;vertical-align:text-bottom;margin-right:4px;"></i>Model gagal dimuat'; lucide.createIcons({nodes:[analyzeBtn]});
            }
          }).catch(() => { });
        }, 2000);
      }
    })
    .catch(() => { });
})();
