from datetime import datetime
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from categorizer import predict_category
from anomaly import detect_anomaly
from forecast import forecast_spend
from subscriptions import detect_subscriptions

app = FastAPI(title="FinSight ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your Node backend's URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)


class CategorizeRequest(BaseModel):
    description: str


class TransactionIn(BaseModel):
    amount: float
    category: Optional[str] = "Other"
    date: Optional[str] = None


class AnomalyRequest(BaseModel):
    transaction: TransactionIn
    history: list[dict]


class ForecastRequest(BaseModel):
    history: list[dict]


class SubscriptionRequest(BaseModel):
    history: list[dict]


@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@app.post("/categorize")
def categorize(req: CategorizeRequest):
    return {"category": predict_category(req.description)}


@app.post("/detect-anomaly")
def detect_anomaly_endpoint(req: AnomalyRequest):
    is_anomaly, score = detect_anomaly(req.transaction.dict(), req.history)
    return {"is_anomaly": is_anomaly, "score": score}


@app.post("/forecast")
def forecast_endpoint(req: ForecastRequest):
    return forecast_spend(req.history)


@app.post("/detect-subscriptions")
def subscriptions_endpoint(req: SubscriptionRequest):
    return {"subscriptions": detect_subscriptions(req.history)}
