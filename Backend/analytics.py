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
