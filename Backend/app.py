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
