from fastapi import APIRouter, HTTPException
import csv
from pathlib import Path

router = APIRouter()

PRED_FILE = Path(__file__).parent / "predictions.csv"

@router.get("/prescription/{rx_id}")
def get_prescription(rx_id: str):
    """Return details for a given prescription ID (e.g., RX001)."""
    idx_part = rx_id.replace("RX", "")
    try:
        idx = int(idx_part) - 1
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid prescription ID")

    if not PRED_FILE.is_file():
        raise HTTPException(status_code=404, detail="Data not available")

    with open(PRED_FILE, newline="") as f:
        reader = list(csv.DictReader(f))
        if idx < 0 or idx >= len(reader):
            raise HTTPException(status_code=404, detail="Prescription not found")
        row = reader[idx]

    # Basic example fields; extend as needed
    details = {
        "id": rx_id,
        "patient": row.get("PATIENT_med"),
        "doctor": row.get("PROVIDER"),
        "notes": "Follow up in 2 weeks.",
        "doctor_comments": row.get("flags") or "No comments",
    }
    return details
