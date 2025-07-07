from fastapi import APIRouter
from datetime import datetime
from pathlib import Path
import csv
import json
from pydantic import BaseModel
from ml_model_api import FraudInput, predict_fraud

model_router = APIRouter()

PRED_FILE = Path(__file__).parent / "predictions.csv"

# Whitelist file containing exempt patient IDs
WHITELIST_FILE = Path(__file__).parent / "whitelist_patients.json"

# List of exempt patients (rare conditions) loaded from JSON
if WHITELIST_FILE.is_file():
    with open(WHITELIST_FILE) as f:
        RARE_CASE_PATIENTS = set(json.load(f))
else:
    RARE_CASE_PATIENTS = set()

FIELDNAMES = [
    "DESCRIPTION_med", "ENCOUNTERCLASS", "PROVIDER", "ORGANIZATION", "GENDER",
    "ETHNICITY", "MARITAL", "STATE", "AGE", "DISPENSES", "BASE_COST", "TOTALCOST",
    "PATIENT_med", "fraud", "risk_score", "medication_risk", "used_model",
    "HIGH_RISK_COUNT", "UNIQUE_DOCTOR_COUNT", "TIME_SINCE_LAST",
    "flags", "likely_fraud", "timestamp"
]

@model_router.post("/")
def predict(input_data: FraudInput):
    result = predict_fraud(input_data)
    record = input_data.dict()
    record.update(result)

    # Remove complex fields if they accidentally appear
    record.pop("shap_features", None)
    record.pop("shap_values", None)
    result.pop("shap_features", None)
    result.pop("shap_values", None)

    # Keep only serializable primitives in the record
    for key, value in list(record.items()):
        if isinstance(value, datetime):
            record[key] = value.isoformat()
        elif not isinstance(value, (str, int, float, bool)):
            record.pop(key)

    history_df = []
    if PRED_FILE.is_file():
        with open(PRED_FILE, newline="") as f:
            reader = csv.DictReader(f)
            history_df = list(reader)

    now = datetime.utcnow()
    flags = []

    # --- Rare Condition Bypass ---
    if record["PATIENT_med"] in RARE_CASE_PATIENTS:
        flags = ["Patient is exempted due to a known rare condition"]
        record["likely_fraud"] = False
        result["fraud"] = False
        record["fraud"] = False
    else:

        # --- 1. Duplicate Dispensing ---
        duplicate_flag = None
        for r in history_df:
            if not (
                "PATIENT_med" in r and
                "DESCRIPTION_med" in r and
                ("DATE" in r or "timestamp" in r)
            ):
                print(f"Skipping malformed row: {r}")
                continue

            if (
                r["PATIENT_med"] == record["PATIENT_med"] and
                r["DESCRIPTION_med"].lower() == record["DESCRIPTION_med"].lower()
            ):
                date_str = r.get("DATE") or r.get("timestamp")
                try:
                    past_time = datetime.fromisoformat(date_str)
                except Exception:
                    print(f"Invalid date in row: {r}")
                    continue

                if (now - past_time).days <= 7:
                    duplicate_flag = (
                        f"Duplicate Dispensing detected: patient received {r['DESCRIPTION_med']} on {past_time.date()}"
                    )
                    break
        if duplicate_flag:
            flags.append(duplicate_flag)
            # mark as fraudulent when duplicate dispensing is found
            result["fraud"] = True
            record["fraud"] = True

        # --- 2. Doctor Shopping ---
        provider_set = set()
        for r in history_df:
            if not (
                "PATIENT_med" in r and
                "DESCRIPTION_med" in r and
                "PROVIDER" in r and
                ("DATE" in r or "timestamp" in r)
            ):
                print(f"Skipping malformed row: {r}")
                continue

            if (
                r["PATIENT_med"] == record["PATIENT_med"] and
                r["DESCRIPTION_med"].lower() == record["DESCRIPTION_med"].lower()
            ):
                date_str = r.get("DATE") or r.get("timestamp")
                try:
                    past_time = datetime.fromisoformat(date_str)
                except Exception:
                    print(f"Invalid date in row: {r}")
                    continue

                if (now - past_time).days <= 30:
                    provider_set.add(r["PROVIDER"])

        if len(provider_set) >= 3:
            flags.append(
                f"Doctor Shopping detected: {len(provider_set)} unique providers prescribed {record['DESCRIPTION_med']} in the last 30 days"
            )

        # --- 3. Inappropriate Long-Term Prescribing ---
        try:
            high_risk_count = int(record.get("HIGH_RISK_COUNT", 0))
            if record.get("medication_risk") == "High Risk" and high_risk_count >= 5:
                flags.append(
                    f"Inappropriate Long-Term Prescribing: {record['DESCRIPTION_med']} dispensed {high_risk_count} times recently"
                )
        except Exception:
            pass


    record["likely_fraud"] = bool(flags)

    record["flags"] = "; ".join(flags)
    record["timestamp"] = now.isoformat()

    # Write log
    file_exists = PRED_FILE.is_file()
    with open(PRED_FILE, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        if not file_exists or PRED_FILE.stat().st_size == 0:
            writer.writeheader()
        writer.writerow(record)

    result["flags"] = flags
    result["likely_fraud"] = record["likely_fraud"]
    return result

@model_router.get("/history")
def get_prediction_history():
    if not PRED_FILE.is_file():
        return []
    with open(PRED_FILE, newline="") as f:
        reader = csv.DictReader(f)
        return list(reader)


class BypassInput(BaseModel):
    patient_id: str


@model_router.post("/bypass")
def bypass_patient(data: BypassInput):
    """Add a patient ID to the rare-condition whitelist."""
    pid = data.patient_id
    RARE_CASE_PATIENTS.add(pid)
    with open(WHITELIST_FILE, "w") as f:
        json.dump(sorted(RARE_CASE_PATIENTS), f)
    return {"message": f"{pid} added to whitelist"}


@model_router.get("/summary")
def get_outcome_summary():
    """Return counts of fraud, cleared, and rare prescriptions."""
    fraud = 0
    cleared = 0
    rare = 0
    if PRED_FILE.is_file():
        with open(PRED_FILE, newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                is_fraud = str(row.get("fraud", "")).lower() == "true"
                flags = str(row.get("flags", "")).lower()
                if is_fraud:
                    fraud += 1
                else:
                    cleared += 1
                if "rare condition" in flags:
                    rare += 1
    return {"fraud": fraud, "cleared": cleared, "rare": rare}
