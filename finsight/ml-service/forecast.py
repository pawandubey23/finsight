"""
Forecasts next month's spend, overall and per category, by fitting a simple
linear trend to monthly aggregates. Lightweight by design (no Prophet
dependency) - swap in Prophet or statsmodels here if you want seasonality
modeling once you have 12+ months of data.
"""
from collections import defaultdict
from datetime import datetime
import numpy as np


def _monthly_totals(history: list[dict], category: str | None = None):
    totals = defaultdict(float)
    for h in history:
        if h.get("amount", 0) >= 0:
            continue
        if category and h.get("category") != category:
            continue
        d = h["date"]
        if isinstance(d, str):
            d = datetime.fromisoformat(d.replace("Z", "+00:00"))
        key = d.year * 12 + d.month
        totals[key] += abs(h["amount"])
    return totals


def _linear_forecast(totals: dict) -> float | None:
    if len(totals) < 2:
        return round(list(totals.values())[0], 2) if totals else None
    keys = sorted(totals.keys())
    x = np.array(range(len(keys)))
    y = np.array([totals[k] for k in keys])
    coeffs = np.polyfit(x, y, 1)
    next_val = np.polyval(coeffs, len(keys))
    return round(max(0, float(next_val)), 2)


def forecast_spend(history: list[dict]) -> dict:
    overall = _linear_forecast(_monthly_totals(history))

    categories = {h.get("category", "Other") for h in history if h.get("amount", 0) < 0}
    by_category = {}
    for cat in categories:
        val = _linear_forecast(_monthly_totals(history, category=cat))
        if val is not None:
            by_category[cat] = val

    return {"next_month_estimate": overall, "by_category": by_category}
