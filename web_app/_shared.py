"""
_shared.py — Shared constants, preprocessing, feature engineering, and utilities.
Extracted from evaluator.py and model_pipeline.py to eliminate duplication.
"""

import re
import math
import numpy as np
import xgboost as xgb
from sklearn.metrics import f1_score


# ──────────────────────────────────────────
# CONSTANTS
# ──────────────────────────────────────────

SPAM_KW = [
    'free', 'click', 'unsubscribe', 'offer', 'winner', 'won',
    'urgent', 'immediately', 'guarantee', 'bonus', 'prize', 'cash',
    'congratulations', 'selected', 'limited', 'exclusive', 'deal',
    'discount', 'save', 'earn', 'income', 'money', 'profit',
    'investment', 'million', 'percent', 'risk', 'verify',
    'account', 'password', 'bank', 'credit', 'loan',
    'pharmacy', 'pills', 'medication', 'weight', 'diet',
]

HAM_PLATFORMS = [
    'facebook', 'google', 'mozilla', 'firefox', 'instagram',
    'twitter', 'linkedin', 'microsoft', 'apple', 'amazon',
    'youtube', 'github', 'whatsapp', 'telegram', 'zoom',
    'netflix', 'spotify', 'dropbox', 'slack', 'notion',
]


# ──────────────────────────────────────────
# PREPROCESSING
# ──────────────────────────────────────────

def preprocess(text: str) -> str:
    """Preprocessing teks email — identik di semua pipeline."""
    text = str(text).lower()
    text = re.sub(r'http\S+|www\S+', ' urltoken ', text)
    text = re.sub(r'\S+@\S+', ' emailtoken ', text)
    text = re.sub(r'\$[\d,]+', ' pricetoken ', text)
    text = re.sub(r'\b\d{5,}\b', ' longnum ', text)
    text = re.sub(r'\b\d+\b', ' numtoken ', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    return ' '.join(w for w in text.split() if len(w) > 1)


# ──────────────────────────────────────────
# EXTRA FEATURES
# ──────────────────────────────────────────

def extra_features(raw_text: str, tfidf_word=None, tfidf_char=None) -> list:
    """
    Handcrafted features — evaluator.py version.
    Uses `in` (not `\\b` regex) for keyword/platform matching — catches more matches.
    """
    text = str(raw_text)
    lower = text.lower()
    length = max(len(text), 1)
    words = text.split()
    n_words = max(len(words), 1)

    upper_count = sum(1 for c in text if c.isupper())
    all_caps_words = sum(1 for w in words if w.isupper() and len(w) > 1)
    html_tags = len(re.findall(r'<[^>]+>', text))
    excl_count = text.count('!')
    url_count = len(re.findall(r'http\S+|www\S+', lower))
    email_count = len(re.findall(r'\S+@\S+', lower))

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
        int(any(p in lower for p in HAM_PLATFORMS)),
    ]
    for kw in SPAM_KW:
        feats.append(int(kw in lower))
    return feats


# ──────────────────────────────────────────
# THRESHOLD OPTIMIZATION
# ──────────────────────────────────────────

def find_best_threshold(y_true, y_prob, n_trials=500):
    """Cari threshold optimal berdasarkan F1-Score weighted. Range 0.10-0.95."""
    best_thresh, best_score = 0.5, 0.0
    for t in np.arange(0.10, 0.95, 0.01):
        pred = (y_prob >= t).astype(int)
        score = f1_score(y_true, pred, average='weighted', zero_division=0)
        if score > best_score:
            best_score, best_thresh = score, t
    return float(best_thresh), float(best_score)


# ──────────────────────────────────────────
# GPU CHECK
# ──────────────────────────────────────────

def check_gpu() -> bool:
    """Lightweight GPU check — trains tiny model, not real data."""
    try:
        xgb.XGBClassifier(
            n_estimators=1, device='cuda', tree_method='hist'
        ).fit([[0]], [0])
        return True
    except Exception:
        return False


# ──────────────────────────────────────────
# SANITIZE (NaN/Infinity → None)
# ──────────────────────────────────────────

def sanitize(obj):
    """Recursive tree-walk replacing NaN/Infinity with None. Handles nested dicts/lists."""
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    if isinstance(obj, dict):
        return {k: sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize(i) for i in obj]
    return obj


# ──────────────────────────────────────────
# METRICS
# ──────────────────────────────────────────

def _metrics_dict(y_true, y_pred, threshold=None, model_name=None, label_names=('Spam', 'Non-Spam')):
    """Shared metrics computation — returns JSON-serializable dict.
    
    Supports optional threshold and model_name for backward compatibility
    with evaluator.py output format.
    """
    from sklearn.metrics import (
        accuracy_score, precision_score, recall_score,
        f1_score, confusion_matrix,
    )

    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = int(cm[0, 0]), int(cm[0, 1]), int(cm[1, 0]), int(cm[1, 1])

    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, average='weighted', zero_division=0))
    rec = float(recall_score(y_true, y_pred, average='weighted', zero_division=0))
    f1 = float(f1_score(y_true, y_pred, average='weighted', zero_division=0))

    prec0 = float(precision_score(y_true, y_pred, labels=[0], average='micro', zero_division=0))
    rec0 = float(recall_score(y_true, y_pred, labels=[0], average='micro', zero_division=0))
    f10 = float(f1_score(y_true, y_pred, labels=[0], average='micro', zero_division=0))

    prec1 = float(precision_score(y_true, y_pred, labels=[1], average='micro', zero_division=0))
    rec1 = float(recall_score(y_true, y_pred, labels=[1], average='micro', zero_division=0))
    f11 = float(f1_score(y_true, y_pred, labels=[1], average='micro', zero_division=0))

    result = {
        'accuracy': round(acc * 100, 2),
        'precision': round(prec * 100, 2),
        'recall': round(rec * 100, 2),
        'f1': round(f1 * 100, 2),
        'cm': {'tn': tn, 'fp': fp, 'fn': fn, 'tp': tp},
        'per_class': {
            label_names[1]: {'precision': round(prec0 * 100, 2), 'recall': round(rec0 * 100, 2), 'f1': round(f10 * 100, 2)},
            label_names[0]: {'precision': round(prec1 * 100, 2), 'recall': round(rec1 * 100, 2), 'f1': round(f11 * 100, 2)},
        },
    }
    if model_name is not None:
        result['model'] = model_name
    if threshold is not None:
        result['threshold'] = round(threshold * 100, 1)
    return result
