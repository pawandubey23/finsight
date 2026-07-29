"""
Detects recurring subscription-like charges: same (normalized) description and
similar amount, repeating roughly monthly across at least 3 occurrences.
"""
import re
from collections import defaultdict
from datetime import datetime


def _normalize(desc: str) -> str:
    return re.sub(r"[^a-z ]", "", desc.lower()).strip()


def detect_subscriptions(history: list[dict]) -> list[dict]:
    groups = defaultdict(list)
    for h in history:
        if h.get("amount", 0) >= 0:
            continue
        key = _normalize(h.get("description", ""))
        if key:
            groups[key].append(h)

    subscriptions = []
    for key, txs in groups.items():
        if len(txs) < 3:
            continue

        amounts = [abs(t["amount"]) for t in txs]
        avg_amount = sum(amounts) / len(amounts)
        amount_stable = all(abs(a - avg_amount) / avg_amount < 0.15 for a in amounts)
        if not amount_stable:
            continue

        dates = []
        for t in txs:
            d = t["date"]
            if isinstance(d, str):
                d = datetime.fromisoformat(d.replace("Z", "+00:00"))
            dates.append(d)
        dates.sort()

        gaps = [(dates[i + 1] - dates[i]).days for i in range(len(dates) - 1)]
        monthly_like = all(20 <= g <= 40 for g in gaps)

        if monthly_like:
            subscriptions.append({
                "description": txs[0]["description"],
                "average_amount": round(avg_amount, 2),
                "occurrences": len(txs),
                "estimated_monthly_cost": round(avg_amount, 2),
                "estimated_yearly_cost": round(avg_amount * 12, 2)
            })

    subscriptions.sort(key=lambda s: -s["estimated_monthly_cost"])
    return subscriptions
