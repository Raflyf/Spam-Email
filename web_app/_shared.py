import re
import numpy as np
from sklearn.metrics import f1_score

# ==========================================
# KONSTANTA BERSAMA
# ==========================================

SPAM_KW = [
    'free','click','unsubscribe','offer','winner','won',
    'urgent','immediately','guarantee','bonus','prize','cash',
    'congratulations','selected','limited','exclusive','deal',
    'discount','save','earn','income','money','profit',
    'investment','million','percent','risk','verify',
    'account','password','bank','credit','loan',
    'pharmacy','pills','medication','weight','diet',
]

UI_SPAM_KW = SPAM_KW + [
    'reward', 'redeem', 'expires', 'action-packed', 'tickets', 
    'bonuses', 'collaboration', 'secure', 'premium', 'worth', 'celebrate'
]

HAM_PLATFORMS = [
    'facebook','google','mozilla','firefox','instagram',
    'twitter','linkedin','microsoft','apple','amazon',
    'youtube','github','whatsapp','telegram','zoom',
    'netflix','spotify','dropbox','slack','notion',
]

# ==========================================
# FUNGSI PEMROSESAN BERSAMA
# ==========================================

def preprocess(text: str) -> str:
    """Preprocessing teks email: case folding, tokenisasi khusus, cleansing."""
    text = str(text).lower()
    text = re.sub(r'http\S+|www\S+',  ' urltoken ',   text)
    text = re.sub(r'\S+@\S+',         ' emailtoken ', text)
    text = re.sub(r'\$[\d,]+',        ' pricetoken ', text)
    text = re.sub(r'\b\d{5,}\b',      ' longnum ',    text)
    text = re.sub(r'\b\d+\b',         ' numtoken ',   text)
    text = re.sub(r'[^a-zA-Z\s]',     ' ',            text)
    return ' '.join(w for w in text.split() if len(w) > 1)


def extra_features(raw_text: str) -> list:
    """Ekstraksi fitur heuristik kustom (struktural dan kata kunci biner)."""
    text    = str(raw_text)
    lower   = text.lower()
    length  = max(len(text), 1)
    words   = text.split()
    n_words = max(len(words), 1)

    upper_count    = sum(1 for c in text if c.isupper())
    all_caps_words = sum(1 for w in words if w.isupper() and len(w) > 1)
    html_tags      = len(re.findall(r'<[^>]+>', text))
    excl_count     = text.count('!')
    url_count      = len(re.findall(r'http\S+|www\S+', lower))
    email_count    = len(re.findall(r'\S+@\S+', lower))

    feats = [
        min(length / 3000, 1.0),
        excl_count / length,
        text.count('$') / length,
        text.count('?') / length,
        upper_count / length,
        all_caps_words / n_words,
        min(url_count / 5, 1.0),
        email_count / n_words,
        min(html_tags / 20, 1.0),
        int(excl_count > 3),
        int(upper_count / length > 0.3),
        min(n_words / 500, 1.0),
        int(any(re.search(r'\b' + re.escape(p) + r'\b', lower) for p in HAM_PLATFORMS)),
    ]
    for kw in SPAM_KW:
        feats.append(int(bool(re.search(r'\b' + re.escape(kw) + r'\b', lower))))
    return feats


def find_best_threshold(proba, y_true):
    """Pencarian dynamic threshold tuning untuk optimalisasi F1-Score berbobot."""
    best_thresh, best_score = 0.5, 0.0
    # Evaluasi iteratif batas probabilitas dari 0.10 hingga 0.95
    for t in np.arange(0.10, 0.95, 0.01):
        pred  = (proba >= t).astype(int)
        score = f1_score(y_true, pred, average='weighted', zero_division=0)
        if score > best_score:
            best_score, best_thresh = score, t
    return float(best_thresh), float(best_score)
