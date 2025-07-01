from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from pathlib import Path
from pydantic import BaseModel
import csv

bypass_router = APIRouter()

LOG_FILE = Path(__file__).parent / "bypass_log.csv"
FIELDNAMES = ["rx_id", "patient", "doctor", "medication", "status", "timestamp"]

class BypassRecord(BaseModel):
    rx_id: str
    patient: str
    doctor: str
    medication: str
    status: str

@bypass_router.post("/bypass")
def log_bypass(record: BypassRecord):
    """Log a bypassed prescription."""
    rows = []
    if LOG_FILE.is_file():
        with open(LOG_FILE, newline="") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            for row in rows:
                if row.get("rx_id") == record.rx_id:
                    return {"message": "Bypass already logged"}

    entry = record.dict()
    entry["timestamp"] = datetime.utcnow().isoformat()

    file_exists = LOG_FILE.is_file()
    with open(LOG_FILE, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        if not file_exists or LOG_FILE.stat().st_size == 0:
            writer.writeheader()
        writer.writerow(entry)

    return {"message": "Bypass logged successfully"}

@bypass_router.get("/bypass-logs")
def get_bypass_logs(days: int = Query(None, gt=0)):
    """Return bypass log entries, optionally filtered by recent days."""
    if not LOG_FILE.is_file():
        return []
    with open(LOG_FILE, newline="") as f:
        reader = csv.DictReader(f)
        records = list(reader)
    if days:
        cutoff = datetime.utcnow() - timedelta(days=days)
        records = [r for r in records if r.get("timestamp") and datetime.fromisoformat(r["timestamp"]) >= cutoff]
    records.sort(key=lambda r: r.get("timestamp", ""), reverse=True)
    return records
