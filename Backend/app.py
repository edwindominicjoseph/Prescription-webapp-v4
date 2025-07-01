from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import auth_router
from model_predict import model_router
from users import user_router
from analytics import analytics_router

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
def get_bypass_logs(days: int | None = None):
    """Return logged bypassed prescriptions sorted by most recent.

    Parameters
    ----------
    days: int | None
        Optional number of days back to include. If provided, only records
        with a timestamp within the last `days` days will be returned.
    """
    import pandas as pd
    from pathlib import Path

    bypass_file = Path(__file__).parent / "bypass_log.csv"
    if not bypass_file.is_file():
        return []
    df = pd.read_csv(bypass_file)

    # Normalise column names so the frontend has a consistent structure
    column_map = {
        "prescription_id": "rx_id",
        "patient_name": "patient",
        "doctor_name": "doctor",
        "medication_name": "medication",
        "date": "timestamp",
    }
    for src, dest in column_map.items():
        if src in df.columns and dest not in df.columns:
            df[dest] = df[src]

    if "timestamp" not in df.columns and "date" in df.columns:
        df["timestamp"] = df["date"]

    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp", ascending=False)
        if days is not None:
            cutoff = pd.Timestamp.now() - pd.Timedelta(days=days)
            df = df[df["timestamp"] >= cutoff]
    return df.to_dict(orient="records")
