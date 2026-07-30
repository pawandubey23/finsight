# FinSight — AI-powered personal finance copilot **Developed by Pawan Dubey**

A MERN stack app with a Python ML microservice bolted on. Not just a transaction
tracker — it categorizes, forecasts, and flags your spending automatically.

## What makes it different from a typical finance tracker project

- **Auto-categorization** — a TF-IDF + Naive Bayes model tags transactions from
  free text description, no manual dropdown needed
- **Anomaly detection** — Isolation Forest flags transactions that don't match
  your usual pattern for that category
- **Spend forecasting** — linear trend model estimates next month's spend,
  overall and per category
- **Subscription detector** — finds recurring monthly charges automatically by
  clustering description + amount + cadence
- **Financial health score** — a single 0–100 score computed from savings
  rate, spending volatility, and anomaly frequency
- **Voice input** — say "spent 200 on lunch" and it parses the amount and
  description for you (Web Speech API, Chrome/Edge)

## Stack

| Layer      | Tech                               |
| ---------- | ---------------------------------- |
| Frontend   | React (Vite) + Tailwind + Recharts |
| Backend    | Node.js + Express + Mongoose       |
| Database   | MongoDB (Atlas recommended)        |
| ML service | Python + FastAPI + scikit-learn    |

## Project structure

```
finsight/
├── backend/          Node/Express REST API
├── ml-service/        Python FastAPI microservice
└── frontend/          React app
```

## Running locally

You need Node 18+, Python 3.10+, and a MongoDB connection string (a free
MongoDB Atlas cluster works fine).

### 1. ML service

```bash
cd ml-service
python -m venv venv
source venv/bin/activate   # venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Runs at `http://localhost:8000`. Check `http://localhost:8000/docs` for the
auto-generated API docs.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env    # then fill in MONGO_URI and JWT_SECRET
npm run dev
```

Runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env    # defaults are fine for local dev
npm run dev
```

Runs at `http://localhost:5173`.

Open that URL, register an account, and start logging transactions.

## Deployment

**Frontend → Vercel**

1. Push this repo to GitHub
2. Import the `frontend/` folder as a new Vercel project
3. Set env var `VITE_API_URL` to your deployed backend URL + `/api`

**Backend → Render**

1. New Web Service, root directory `backend/`
2. Build command `npm install`, start command `npm start`
3. Set env vars: `MONGO_URI`, `JWT_SECRET`, `ML_SERVICE_URL` (your ML service's Render URL), `CLIENT_ORIGIN` (your Vercel URL)

**ML service → Render**

1. New Web Service, root directory `ml-service/`
2. Build command `pip install -r requirements.txt`
3. Start command `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Database → MongoDB Atlas**
Free M0 cluster is enough. Whitelist `0.0.0.0/0` for Render (or your specific
Render IPs) and grab the connection string for `MONGO_URI`.

The backend is written to fail gracefully if the ML service is temporarily
unreachable — categorization falls back to "Other" and anomaly/forecast calls
return empty results instead of crashing the app.

## Extending this for your portfolio

Things you can add to make this even stronger, roughly in order of effort:

1. **Retrain the categorizer on real data** — export your own transactions
   (even fake/sample ones) and expand `SEED_DATA` in `categorizer.py`. More
   examples per category = better accuracy.
2. **RAG-style chat assistant** — add an endpoint that takes a natural
   language question, pulls the relevant MongoDB aggregation, and passes both
   to an LLM API to answer "how much did I spend on food last month?"
3. **CSV import** — let users bulk-upload a bank statement export instead of
   manual entry (Multer + csv-parse on the backend).
4. **Budgets per category** with progress bars and push-style in-app alerts
   when nearing a limit.
5. **Swap the forecast model for Prophet or statsmodels** once you have 12+
   months of data — the current linear model is intentionally lightweight.

## Why this project is a strong portfolio piece

It's not another CRUD app — it demonstrates full-stack fundamentals (auth,
REST API design, MongoDB schema design) _and_ a working ML pipeline talking to
a production backend across three deployed services. That combination is rare
in student portfolios and maps directly to how real fintech/product teams are
structured.
