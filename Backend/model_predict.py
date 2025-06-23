from fastapi import APIRouter
from datetime import datetime
from pathlib import Path
import csv

from ml_model_api import FraudInput, predict_fraud

model_router = APIRouter()

PRED_FILE = Path(__file__).parent / "predictions.csv"

# Define the CSV field order for reading history
FIELDNAMES = [
    "DESCRIPTION_med",
    "ENCOUNTERCLASS",
    "PROVIDER",
    "ORGANIZATION",
    "GENDER",
    "ETHNICITY",
    "MARITAL",
    "STATE",
    "AGE",
    "DISPENSES",
    "BASE_COST",
    "TOTALCOST",
    "PATIENT_med",
    "fraud",
    "risk_score",
    "medication_risk",
    "used_model",
    "shap_features",
    "shap_values",
    "timestamp",
]

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
    """Return logged predictions from the CSV file."""
    if not PRED_FILE.is_file():
        return []
    with open(PRED_FILE, newline="") as f:
        reader = csv.DictReader(f, fieldnames=FIELDNAMES)
        return list(reader)

