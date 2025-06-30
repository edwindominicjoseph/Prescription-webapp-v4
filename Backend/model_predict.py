from fastapi import APIRouter
from datetime import datetime
from pathlib import Path
import csv

from ml_model_api import FraudInput, predict_fraud

model_router = APIRouter()

PRED_FILE = Path(__file__).parent / "predictions.csv"

# Define the CSV field order for reading history
FIELDNAMES = [
    "PATIENT_med",
    "DESCRIPTION_med",
    "DATE",
    "ENCOUNTERCLASS",
    "DISPENSES",
    "BASE_COST",
    "TOTALCOST",
    "AGE",
    "GENDER",
    "MARITAL",
    "STATE",
    "PROVIDER",
    "ORGANIZATION",
    "fraud",
    "risk_score",
    "medication_risk",
    "MEDICATION_RISK_CODE",
    "used_model",
    "likely_fraud_types",
]

@model_router.post("")
async def predict(input_data: FraudInput):
    result = await predict_fraud(input_data)
    return result


@model_router.get("/history")
def get_prediction_history():
    """Return logged predictions from the CSV file."""
    if not PRED_FILE.is_file():
        return []
    with open(PRED_FILE, newline="") as f:
        reader = csv.DictReader(f)
        return list(reader)

