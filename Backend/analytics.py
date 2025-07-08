from fastapi import APIRouter
import pandas as pd
from pathlib import Path

analytics_router = APIRouter()

PRED_FILE = Path(__file__).parent / "predictions.csv"

@analytics_router.get("/summary")
def summary_data():
    """Return summary metrics for dashboard cards."""
    if not PRED_FILE.is_file():
        return {
            "total_prescriptions": 0,
            "prescriptions_over_time": [],
            "fraud_alerts": 0,
            "alerts_over_time": [],
            "avg_risk_score": 0,
        }

    df = pd.read_csv(PRED_FILE, parse_dates=["timestamp"])
    df = df.dropna(subset=["timestamp"])
    df["risk_score"] = pd.to_numeric(df.get("risk_score"), errors="coerce")
    df["date"] = df["timestamp"].dt.date

    total = len(df)

    fraud_col = "fraud" if "fraud" in df.columns else None
    alt_col = "likely_fraud" if "likely_fraud" in df.columns else None
    if fraud_col:
        fraud_df = df[df[fraud_col].astype(str).str.lower() == "true"]
    elif alt_col:
        fraud_df = df[df[alt_col].astype(str).str.lower() == "true"]
    else:
        fraud_df = df.iloc[0:0]

    fraud_alerts = len(fraud_df)
    avg_risk = round(df["risk_score"].mean(), 2) if not df["risk_score"].empty else 0

    one_week_ago = pd.Timestamp.now().normalize() - pd.Timedelta(days=6)
    recent = df[df["timestamp"] >= one_week_ago]

    presc_daily = (
        recent.groupby("date").size().reset_index(name="count").sort_values("date")
    )
    alerts_daily = (
        recent.loc[fraud_df.index]
        .groupby("date")
        .size()
        .reset_index(name="count")
        .sort_values("date")
    )

    return {
        "total_prescriptions": int(total),
        "prescriptions_over_time": [
            {"date": d.strftime("%Y-%m-%d"), "count": int(c)}
            for d, c in zip(presc_daily["date"], presc_daily["count"])
        ],
        "fraud_alerts": int(fraud_alerts),
        "alerts_over_time": [
            {"date": d.strftime("%Y-%m-%d"), "count": int(c)}
            for d, c in zip(alerts_daily["date"], alerts_daily["count"])
        ],
        "avg_risk_score": float(avg_risk),
    }

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
