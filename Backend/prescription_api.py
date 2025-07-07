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

    # Gather relevant details for the prescription
    details = {
        "id": rx_id,
        "patient": row.get("PATIENT_med"),
        "doctor": row.get("PROVIDER"),
        "medication": row.get("DESCRIPTION_med"),
        # Combine any doctor provided notes or comments under one field
        "notes": row.get("flags") or "No notes",
    }
    return details
