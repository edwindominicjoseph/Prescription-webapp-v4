from fastapi import APIRouter
from datetime import datetime
from pathlib import Path
import csv

from ml_model_api import FraudInput, predict_fraud

model_router = APIRouter()

PRED_FILE = Path(__file__).parent / "predictions.csv"

@model_router.post("")
def predict(input_data: FraudInput):
    result = predict_fraud(input_data)
    record = input_data.dict()
    record.update(result)
    record["timestamp"] = datetime.utcnow().isoformat()
    file_exists = PRED_FILE.is_file()
    with open(PRED_FILE, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=record.keys())
        if not file_exists:
            writer.writeheader()
        writer.writerow(record)
    return result


@model_router.get("/history")
def get_prediction_history():
    """Return all stored predictions as a list of dicts."""
    if not PRED_FILE.is_file():
        return []
    with open(PRED_FILE, "r", newline="") as f:
        reader = csv.DictReader(f)
        return list(reader)

