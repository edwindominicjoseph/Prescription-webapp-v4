from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from pathlib import Path
import csv

bypass_router = APIRouter()

FILE = Path(__file__).parent / "bypass_log.csv"

class BypassEntry(BaseModel):
    patient_name: str
    medication: str
    status: str

@bypass_router.post("/log-bypass")
def log_bypass(entry: BypassEntry):
    file_exists = FILE.is_file()
    write_header = not file_exists or FILE.stat().st_size == 0
    with open(FILE, "a", newline="") as f:
        writer = csv.writer(f)
        if write_header:
            writer.writerow(["PATIENT_NAME", "MEDICATION", "STATUS", "TIMESTAMP"])
        writer.writerow([
            entry.patient_name,
            entry.medication,
            entry.status,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        ])
    return {"message": "Bypass logged successfully"}

@bypass_router.get("/get-bypassed")
def get_bypassed():
    if not FILE.is_file():
        return []
    with open(FILE, newline="") as f:
        reader = csv.DictReader(f)
        return [
            {
                "PATIENT_NAME": row["PATIENT_NAME"],
                "MEDICATION": row["MEDICATION"],
                "STATUS": row["STATUS"],
            }
            for row in reader
        ]
