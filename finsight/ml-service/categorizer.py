"""
Auto-categorization of transactions from free-text descriptions.

Trained on a small seed dataset here so the service works out of the box.
Swap SEED_DATA for your own exported transaction history for better accuracy -
the more real (description, category) pairs you feed it, the smarter it gets.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

SEED_DATA = [
    ("swiggy order", "Food & Dining"), ("zomato dinner", "Food & Dining"),
    ("starbucks coffee", "Food & Dining"), ("restaurant bill", "Food & Dining"),
    ("dominos pizza", "Food & Dining"), ("cafe latte", "Food & Dining"),
    ("bigbasket grocery", "Groceries"), ("dmart shopping", "Groceries"),
    ("vegetable market", "Groceries"), ("grofers order", "Groceries"),
    ("supermarket bill", "Groceries"),
    ("uber ride", "Transport"), ("ola cab", "Transport"), ("petrol pump", "Transport"),
    ("metro card recharge", "Transport"), ("fuel refill", "Transport"),
    ("amazon purchase", "Shopping"), ("flipkart order", "Shopping"),
    ("myntra clothes", "Shopping"), ("mall shopping", "Shopping"),
    ("netflix subscription", "Entertainment"), ("spotify premium", "Entertainment"),
    ("movie tickets pvr", "Entertainment"), ("bookmyshow", "Entertainment"),
    ("hotstar subscription", "Entertainment"), ("gaming purchase steam", "Entertainment"),
    ("electricity bill", "Bills & Utilities"), ("water bill payment", "Bills & Utilities"),
    ("internet broadband bill", "Bills & Utilities"), ("mobile recharge", "Bills & Utilities"),
    ("gas cylinder booking", "Bills & Utilities"),
    ("monthly rent payment", "Rent"), ("house rent", "Rent"),
    ("youtube premium", "Subscriptions"), ("amazon prime", "Subscriptions"),
    ("gym membership", "Subscriptions"), ("icloud storage", "Subscriptions"),
    ("apollo pharmacy", "Health"), ("hospital bill", "Health"),
    ("doctor consultation", "Health"), ("medical insurance premium", "Health"),
    ("gym personal training", "Health"),
    ("udemy course", "Education"), ("coursera subscription", "Education"),
    ("college fee payment", "Education"), ("book purchase amazon", "Education"),
    ("flight booking indigo", "Travel"), ("hotel booking oyo", "Travel"),
    ("train ticket irctc", "Travel"), ("goa trip expenses", "Travel"),
    ("salary credited", "Income"), ("freelance payment received", "Income"),
    ("interest credited", "Income"), ("refund received", "Income"),
    ("stipend credited", "Income"),
    ("miscellaneous expense", "Other"), ("cash withdrawal atm", "Other"),
]

_texts = [t for t, _ in SEED_DATA]
_labels = [c for _, c in SEED_DATA]

_model = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
    ("clf", MultinomialNB()),
])
_model.fit(_texts, _labels)


def predict_category(description: str) -> str:
    if not description or not description.strip():
        return "Other"
    try:
        pred = _model.predict([description.lower()])[0]
        # Guard against low-confidence predictions on very short/unknown text
        proba = _model.predict_proba([description.lower()])[0].max()
        # Baseline for 13 classes is ~0.077, so anything meaningfully above that is a real signal
        return pred if proba > 0.14 else "Other"
    except Exception:
        return "Other"
