from fastapi import APIRouter
import pandas as pd
from pathlib import Path

analytics_router = APIRouter()

PRED_FILE = Path(__file__).parent / "predictions.csv"

@analytics_router.get("/top_providers")
def top_providers():
    """Return top 5 providers dispensing fraud-flagged meds."""
    if not PRED_FILE.is_file():
        return []
    df = pd.read_csv(PRED_FILE)
    if "likely_fraud" not in df.columns:
        return []
    flagged = df[df["likely_fraud"].astype(str).str.lower() == "true"]
    if flagged.empty:
        return []
    counts = (
        flagged.groupby("ORGANIZATION")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .head(5)
    )
    return [
        {"Provider_med": row["ORGANIZATION"], "count": int(row["count"])}
        for _, row in counts.iterrows()
    ]


@analytics_router.get("/fraud-data")
def fraud_data():
    """Return timestamp and risk_score for all predictions."""
    if not PRED_FILE.is_file():
        return []
    df = pd.read_csv(PRED_FILE, usecols=["timestamp", "risk_score"]).dropna()
    df["risk_score"] = pd.to_numeric(df["risk_score"], errors="coerce")
    df = df.dropna(subset=["risk_score"])
    return df.to_dict(orient="records")


@analytics_router.get("/summary")
def prescription_summary():
    """Return counts of fraud, cleared, and rare prescriptions."""
    if not PRED_FILE.is_file():
        return {"fraud": 0, "cleared": 0, "rare": 0}
    df = pd.read_csv(PRED_FILE, usecols=["fraud", "flags"]).fillna("")
    fraud_mask = df["fraud"].astype(str).str.lower() == "true"
    fraud_count = int(fraud_mask.sum())
    rare_mask = df["flags"].str.contains("rare condition", case=False, na=False)
    rare_count = int(rare_mask.sum())
    cleared_count = int(len(df) - fraud_count)
    return {"fraud": fraud_count, "cleared": cleared_count, "rare": rare_count}
