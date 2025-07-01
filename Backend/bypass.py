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

@bypass_router.post("")
def log_bypass(entry: BypassEntry):
    record = entry.dict()
    record["timestamp"] = datetime.utcnow().isoformat()
    try:
        file_exists = LOG_FILE.is_file()
        with open(LOG_FILE, "a", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
            if not file_exists:
                writer.writeheader()
            writer.writerow(record)
    except OSError:
        raise HTTPException(status_code=500, detail="Could not write to log file")
    return {"detail": "bypass logged"}

@bypass_router.get("/history")
def get_bypass_history():
    if not LOG_FILE.is_file():
        return []
    try:
        with open(LOG_FILE, newline="") as f:
            reader = csv.DictReader(f, fieldnames=FIELDNAMES)
            return list(reader)
    except OSError:
        raise HTTPException(status_code=500, detail="Could not read log file")
