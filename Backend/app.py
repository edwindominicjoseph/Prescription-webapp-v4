from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import auth_router
from model_predict import model_router
from users import user_router
from analytics import analytics_router
from prescription_api import router as prescription_router
from pathlib import Path
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend is running 🚀"}


app.include_router(auth_router, prefix="/auth")
app.include_router(model_router, prefix="/predict")
app.include_router(user_router, prefix="/user")
app.include_router(analytics_router, prefix="/analytics")
app.include_router(prescription_router, prefix="/api")

PRED_FILE = Path(__file__).parent / "predictions.csv"


@app.get("/prediction-history")
def prediction_history():
    """Return average fraud score scaled 0-1."""
    if not PRED_FILE.is_file():
        return {"avg_fraud_score": 0}
    df = pd.read_csv(PRED_FILE, usecols=["risk_score"]).dropna()
    df["risk_score"] = pd.to_numeric(df["risk_score"], errors="coerce")
    df = df.dropna(subset=["risk_score"])
    if df.empty:
        avg = 0.0
    else:
        avg = df["risk_score"].astype(float).mean() / 100
    return {"avg_fraud_score": round(float(avg), 4)}
