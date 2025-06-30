import os
import csv
import numpy as np
import pandas as pd
from pathlib import Path
from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder

# --- Initialize FastAPI ---
app = FastAPI()

# --- Load Enriched Dataset ---
DATA_PATH = Path(__file__).parent / "data" / "Fullcover_merged_with_dates_Enhanced.csv"
df3 = pd.read_csv(DATA_PATH)
df3["DATE"] = pd.to_datetime(df3["DATE"])

# --- Risk Lists ---
high_risk_medications = [  "pregabalin", "gabapentin", "tapentadol", "carfentanil", "nitrazepam", "zopiclone", "zolpidem",
    "lorazepam", "temazepam", "hydromorphone", "fentanyl", "methadone", "oxycodone", "morphine",
    "alfentanil", "hydrocodone bitartrate", "medroxyPROGESTERone acetate", "leuprolide acetate",
    "enoxaparin sodium", "docetaxel", "epinephrine", "fluorouracil", "oxaliplatin", "furosemide",
    "doxorubicin hydrochloride", "fulvestrant", "sufentanil", "abuse-deterrent oxycodone hydrochloride",
    "amiodarone hydrochloride", "vancomycin", "tramadol", "Morphine Sulfate",
    "Oxycodone Hydrochloride", "Codeine Phosphate", "Methadone Hydrochloride",
    "Tramadol Hydrochloride", "Meperidine Hydrochloride", "Buprenorphine / Naloxone",
    "Lorazepam", "Diazepam", "Midazolam", "Clonazepam", "Remifentanil",
    "Nicotine Transdermal Patch", "Propofol"]  # ⬅️ Your full high risk list


moderate_risk_medications = [ "rivaroxaban", "dabigatran", "azathioprine", "baricitinib", "moxifloxacin", "clarithromycin",
    "erythromycin", "ondansetron", "donepezil hydrochloride", "memantine hydrochloride",
    "metformin hydrochloride", "nicotine transdermal patch", "ethinyl estradiol", "norelgestromin",
    "fluticasone propionate", "liraglutide", "norepinephrine", "alendronic acid", "amoxicillin clavulanate",
    "alprazolam", "salmeterol fluticasone", "piperacillin tazobactam",
    "fentanyl transdermal system", "warfarin", "acetaminophen hydrocodone", "cimetidine",
    "DOCEtaxel", "Epirubicin Hydrochloride", "Cyclophosphamide", "Cisplatin", "Methotrexate",
    "PACLitaxel", "Carboplatin", "Leuprolide Acetate", "Letrozole", "Anastrozole", "Exemestane",
    "Tamoxifen", "Palbociclib", "Ribociclib", "Neratinib", "Lapatinib",
    "Ethinyl Estradiol / Norelgestromin", "Mirena", "Kyleena", "Liletta", "NuvaRing", "Yaz",
    "Levora", "Natazia", "Trinessa", "Camila", "Jolivette", "Errin", "Remdesivir",
    "Heparin sodium porcine", "Alteplase", "Atropine Sulfate", "Desflurane", "Isoflurane",
    "Sevoflurane", "Rocuronium bromide", "Epoetin Alfa", "Glycopyrrolate", "Aviptadil",
    "Leronlimab", "Lenzilumab" ]  # ⬅️ Your full moderate risk list



risk_mapping = {"Low Risk": 0, "Moderate Risk": 1, "High Risk": 2}

def categorize_risk(med_name: str) -> str:
    name = med_name.lower()
    if any(k in name for k in [m.lower() for m in high_risk_medications]):
        return "High Risk"
    if any(k in name for k in [m.lower() for m in moderate_risk_medications]):
        return "Moderate Risk"
    return "Low Risk"

df3["MEDICATION_RISK"] = df3["DESCRIPTION_med"].apply(categorize_risk)
df3["MEDICATION_RISK_CODE"] = df3["MEDICATION_RISK"].map(risk_mapping)

# --- Risk Classifier ---
risk_mapping = {"Low Risk": 0, "Moderate Risk": 1, "High Risk": 2}
vectorizer = TfidfVectorizer()
X_vec = vectorizer.fit_transform(df3["DESCRIPTION_med"].str.lower())
risk_classifier = LogisticRegression(max_iter=1000)
risk_classifier.fit(X_vec, df3["MEDICATION_RISK"])

# --- Label Encoding ---
label_encoders = {}
encoded_df = df3.copy()
for col in ["DESCRIPTION_med", "ENCOUNTERCLASS", "PROVIDER", "ORGANIZATION", "GENDER", "ETHNICITY", "MARITAL", "STATE"]:
    le = LabelEncoder()
    encoded_df[col] = le.fit_transform(encoded_df[col])
    label_encoders[col] = le

# --- General Model Training ---
feature_cols = [
    "ENCOUNTERCLASS", "DISPENSES", "TOTALCOST", "AGE", "MEDICATION_RISK_CODE",
    "UNIQUE_DOCTOR_COUNT", "TIME_SINCE_LAST", "HIGH_RISK_COUNT"
]
general_model = IsolationForest(contamination=0.05, random_state=42)
general_model.fit(encoded_df[feature_cols])
general_min = general_model.decision_function(encoded_df[feature_cols]).min()
general_max = general_model.decision_function(encoded_df[feature_cols]).max()

# --- Delta Model Training ---
patient_history = (
    df3.groupby("PATIENT_med")
    .agg({"BASE_COST": "mean", "TOTALCOST": "mean", "DISPENSES": "mean", "AGE": "first"})
    .reset_index()
    .rename(columns={"PATIENT_med": "PATIENT_ID"})
)
delta_data = df3.merge(patient_history, left_on="PATIENT_med", right_on="PATIENT_ID")
delta_data["delta_base"] = delta_data["BASE_COST"] - delta_data["BASE_COST_avg"]
delta_data["delta_cost"] = delta_data["TOTALCOST"] - delta_data["TOTALCOST_avg"]
delta_data["delta_disp"] = delta_data["DISPENSES"] - delta_data["DISPENSES_avg"]
delta_data = delta_data[
    ["delta_base", "delta_cost", "delta_disp", "UNIQUE_DOCTOR_COUNT", "HIGH_RISK_COUNT", "TIME_SINCE_LAST"]
]
delta_model = IsolationForest(contamination=0.05, random_state=42)
delta_model.fit(delta_data)
delta_min = delta_model.decision_function(delta_data).min()
delta_max = delta_model.decision_function(delta_data).max()

# --- Fraud Type Inference ---
def infer_fraud_type(entry):
    types = []
    if entry.get("UNIQUE_DOCTOR_COUNT", 0) > 3:
        types.append("Doctor Shopping")
    if entry.get("TIME_SINCE_LAST", 999) < 7:
        types.append("Duplicate Dispensing")
    if entry.get("HIGH_RISK_COUNT", 0) > 5:
        types.append("Long-term Prescribing")
    return ", ".join(types) if types else "Unclassified"

# --- Input Schema (NO engineered features included) ---
class FraudInput(BaseModel):
    DESCRIPTION_med: str
    ENCOUNTERCLASS: str
    PROVIDER: str
    ORGANIZATION: str
    GENDER: str
    ETHNICITY: str
    MARITAL: str
    STATE: str
    AGE: int
    DISPENSES: float
    BASE_COST: float
    TOTALCOST: float
    PATIENT_med: str
    DATE: str

# --- Predict Endpoint ---
@app.post("/predict")
async def predict_fraud(input: FraudInput):
    entry = input.dict()
    entry["DATE"] = pd.to_datetime(entry["DATE"])
    entry_date = entry["DATE"].date()

    # --- Check for duplicate dispensing via prediction log ---
    log_path = Path("data/prediction_logs.csv")
    duplicate_exists = False
    if log_path.exists():
        with open(log_path, mode="r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if (
                    row["PATIENT_med"] == entry["PATIENT_med"]
                    and row["DESCRIPTION_med"].lower() == entry["DESCRIPTION_med"].lower()
                    and abs((pd.to_datetime(row["DATE"]).date() - entry_date).days) <= 7
                ):
                    duplicate_exists = True
                    break

    # --- Risk classification ---
    med_vec = vectorizer.transform([entry["DESCRIPTION_med"].lower()])
    risk_category = risk_classifier.predict(med_vec)[0]
    entry["MEDICATION_RISK_CODE"] = risk_mapping[risk_category]
    entry["PATIENT_ID"] = entry["PATIENT_med"]

    # --- Enrich with behavioral features from known history ---
    history = df3[df3["PATIENT_med"] == entry["PATIENT_med"]]
    if not history.empty:
        entry["UNIQUE_DOCTOR_COUNT"] = history["PROVIDER"].nunique()
        entry["HIGH_RISK_COUNT"] = history["IS_HIGH_RISK"].sum()
        patient_dates = history[history["DESCRIPTION_med"] == entry["DESCRIPTION_med"]]["DATE"]
        entry["TIME_SINCE_LAST"] = (entry["DATE"] - patient_dates.max()).days if not patient_dates.empty else 999
    else:
        # Defaults for new patients
        entry["UNIQUE_DOCTOR_COUNT"] = 0
        entry["HIGH_RISK_COUNT"] = 0
        entry["TIME_SINCE_LAST"] = 999

    # --- Label encoding ---
    for col in label_encoders:
        if col in entry:
            le = label_encoders[col]
            if entry[col] in le.classes_:
                entry[col] = le.transform([entry[col]])[0]
            else:
                le.classes_ = np.append(le.classes_, entry[col])
                entry[col] = le.transform([entry[col]])[0]

    # --- Predict using delta or general model ---
    matched = patient_history[patient_history["PATIENT_ID"] == entry["PATIENT_ID"]]
    if not matched.empty:
        avg = matched.iloc[0]
        delta_df = pd.DataFrame([{"delta_base": entry["BASE_COST"] - avg["BASE_COST"],
                                 "delta_cost": entry["TOTALCOST"] - avg["TOTALCOST"],
                                 "delta_disp": entry["DISPENSES"] - avg["DISPENSES"],
                                 "UNIQUE_DOCTOR_COUNT": entry["UNIQUE_DOCTOR_COUNT"],
                                 "HIGH_RISK_COUNT": entry["HIGH_RISK_COUNT"],
                                 "TIME_SINCE_LAST": entry["TIME_SINCE_LAST"]}])
        score = delta_model.decision_function(delta_df)[0]
        norm_score = int(np.clip((delta_max - score) / (delta_max - delta_min) * 100, 0, 100))
        model_type = "patient history"
        shap_features = delta_df.to_dict(orient="records")[0]
    else:
        entry_df = pd.DataFrame([entry])
        score = general_model.decision_function(entry_df[feature_cols])[0]
        norm_score = int(np.clip((general_max - score) / (general_max - general_min) * 100, 0, 100))
        model_type = "general population"
        shap_features = entry_df[feature_cols].to_dict(orient="records")[0]

    # --- Final fraud decision ---
    is_fraud = bool(score < 0) or duplicate_exists
    likely_types = infer_fraud_type(entry)
    if duplicate_exists and "Duplicate Dispensing" not in likely_types:
        likely_types += ", Duplicate Dispensing" if likely_types else "Duplicate Dispensing"

    # --- Log prediction (only general model cases need it for future duplicate detection) ---
    log_row = {
        "PATIENT_med": entry["PATIENT_med"],
        "DESCRIPTION_med": input.DESCRIPTION_med,
        "DATE": entry["DATE"].strftime("%Y-%m-%d"),
        "fraud": is_fraud,
        "risk_score": norm_score,
        "medication_risk": risk_category,
        "used_model": model_type,
        "likely_fraud_types": likely_types
    }
    log_fields = list(log_row.keys())
    log_path.parent.mkdir(parents=True, exist_ok=True)
    write_header = not log_path.exists()
    with open(log_path, mode="a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=log_fields)
        if write_header:
            writer.writeheader()
        writer.writerow(log_row)

    return jsonable_encoder({
        "fraud": is_fraud,
        "risk_score": norm_score,
        "medication_risk": risk_category,
        "used_model": model_type,
        "shap_features": shap_features,
        "likely_fraud_types": likely_types,
    })
