"""
Flags a new transaction as unusual relative to the user's own spending history,
using Isolation Forest over [amount, day_of_month] for transactions in the
same category. Falls back to a simple z-score rule when history is too small
for a forest to be meaningful.
"""
import numpy as np
from sklearn.ensemble import IsolationForest


def detect_anomaly(transaction: dict, history: list[dict]) -> tuple[bool, float]:
    amount = abs(transaction.get("amount", 0))
    category = transaction.get("category", "Other")

    same_category = [
        abs(h["amount"]) for h in history
        if h.get("category") == category and h.get("amount", 0) < 0
    ]

    if len(same_category) < 8:
        # Not enough history for Isolation Forest - use a z-score heuristic instead
        if len(same_category) < 3:
            return False, 0.0
        mean = np.mean(same_category)
        std = np.std(same_category) or 1.0
        z = (amount - mean) / std
        return bool(z > 2.5), float(min(1.0, max(0.0, z / 5)))

    X = np.array(same_category + [amount]).reshape(-1, 1)
    model = IsolationForest(contamination=0.1, random_state=42)
    model.fit(X[:-1])  # fit on history only
    pred = model.predict(X[-1].reshape(1, -1))[0]  # -1 = anomaly, 1 = normal
    score = -model.score_samples(X[-1].reshape(1, -1))[0]  # higher = more anomalous

    normalized_score = float(min(1.0, max(0.0, score)))
    return bool(pred == -1), normalized_score
