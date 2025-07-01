from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime
import csv

bypass_router = APIRouter()

LOG_FILE = Path(__file__).parent / "bypass_log.csv"
FIELDNAMES = ["rx_id", "patient", "doctor", "medication", "status", "timestamp"]


class BypassEntry(BaseModel):
    rx_id: str
    patient: str
    doctor: str
    medication: str
    status: str


@bypass_router.post("/")
def log_bypass(entry: BypassEntry):
    """Log a bypass action for audit purposes."""
    record = entry.dict()
    record["timestamp"] = datetime.utcnow().isoformat()

    try:
        file_exists = LOG_FILE.is_file()
        with open(LOG_FILE, "a", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
            if not file_exists or LOG_FILE.stat().st_size == 0:
                writer.writeheader()
            writer.writerow(record)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log bypass: {e}")

    return {"message": "Bypass logged"}
