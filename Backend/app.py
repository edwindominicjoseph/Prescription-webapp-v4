from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from pathlib import Path
import pandas as pd
from auth import auth_router
from model_predict import model_router
from users import user_router
from analytics import analytics_router

app = FastAPI()

PRED_FILE = Path(__file__).parent / "predictions.csv"

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


@app.get("/monthly-metrics")
def get_monthly_metrics():
    if not PRED_FILE.is_file():
        return {"total_fraud": 0, "fraud_increase": 0, "detection_rate": 0}

    df = pd.read_csv(PRED_FILE, parse_dates=["timestamp"])

    now = datetime.now()
    df["month"] = df["timestamp"].dt.month
    df["year"] = df["timestamp"].dt.year
    df_month = df[(df["month"] == now.month) & (df["year"] == now.year)]

    total_fraud = df_month[df_month["fraud"].astype(str).str.lower() == "true"].shape[0]
    total_prescriptions = df_month.shape[0]

    prev_month = now.month - 1 if now.month > 1 else 12
    prev_year = now.year if now.month > 1 else now.year - 1
    df_prev = df[(df["month"] == prev_month) & (df["year"] == prev_year)]
    prev_fraud = df_prev[df_prev["fraud"].astype(str).str.lower() == "true"].shape[0]

    fraud_increase = int(total_fraud - prev_fraud)
    detection_rate = round((total_fraud / total_prescriptions) * 100, 2) if total_prescriptions > 0 else 0

    return {
        "total_fraud": int(total_fraud),
        "fraud_increase": fraud_increase,
        "detection_rate": detection_rate,
    }


app.include_router(auth_router, prefix="/auth")
app.include_router(model_router, prefix="/predict")
app.include_router(user_router, prefix="/user")
app.include_router(analytics_router, prefix="/analytics")


@app.post("/bypass")
def bypass_prescription(entry: dict):
    """Logs a bypassed prescription to bypass_log.csv"""
    import pandas as pd
    from pathlib import Path
    from datetime import datetime

    entry["timestamp"] = datetime.now().isoformat()
    # Ensure bypassed items are logged with status RARE
    entry["status"] = "RARE"

    bypass_file = Path(__file__).parent / "bypass_log.csv"

    df_new = pd.DataFrame([entry])
    if bypass_file.is_file():
        df_new.to_csv(bypass_file, mode="a", header=False, index=False)
    else:
        df_new.to_csv(bypass_file, mode="w", header=True, index=False)

    return {"message": "Bypass logged"}


@app.get("/bypass-logs")
def get_bypass_logs():
    """Return logged bypassed prescriptions sorted by most recent."""
    import pandas as pd
    from pathlib import Path

    bypass_file = Path(__file__).parent / "bypass_log.csv"
    if not bypass_file.is_file():
        return []
    df = pd.read_csv(bypass_file)
    if "timestamp" in df.columns:
        df = df.sort_values("timestamp", ascending=False)
    return df.to_dict(orient="records")
