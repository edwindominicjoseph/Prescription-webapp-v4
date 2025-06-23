# ml_model_api.py

import os
import random
from pathlib import Path

import numpy as np
import pandas as pd
import shap
import matplotlib.pyplot as plt

from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder

# --- Initialize FastAPI app ---
app = FastAPI()

# --- Load Dataset ---
env_data_path = os.environ.get("DATA_PATH")
if env_data_path:
    DATA_PATH = Path(env_data_path)
else:
    DATA_PATH = Path(__file__).parent / "data" / "merged_Fullcover.csv"

if not DATA_PATH.is_file():
    raise FileNotFoundError(
        f"Data file not found at {DATA_PATH}. Set DATA_PATH environment variable to override."
    )

df3 = pd.read_csv(DATA_PATH)

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
vectorizer = TfidfVectorizer()
X_vec = vectorizer.fit_transform(df3["DESCRIPTION_med"].str.lower())
risk_classifier = LogisticRegression(max_iter=1000)
risk_classifier.fit(X_vec, df3["MEDICATION_RISK"])

# --- Label Encoders ---
label_encoders = {}
encoded_df = df3.copy()
for col in [
    "DESCRIPTION_med", "ENCOUNTERCLASS", "PROVIDER", "ORGANIZATION",
    "GENDER", "ETHNICITY", "MARITAL", "STATE"
]:
    le = LabelEncoder()
    encoded_df[col] = le.fit_transform(encoded_df[col])
    label_encoders[col] = le

# --- General Model ---
feature_cols = ["ENCOUNTERCLASS", "DISPENSES", "TOTALCOST", "AGE", "MEDICATION_RISK_CODE"]
general_model = IsolationForest(contamination=0.05, random_state=42)
general_model.fit(encoded_df[feature_cols])
general_min, general_max = general_model.decision_function(encoded_df[feature_cols]).min(), general_model.decision_function(encoded_df[feature_cols]).max()

# --- Patient History Model ---
patient_history = (
    df3.groupby("PATIENT_med")
    .agg({"BASE_COST": "mean", "TOTALCOST": "mean", "DISPENSES": "mean", "AGE": "first"})
    .reset_index()
    .rename(columns={"PATIENT_med": "PATIENT_ID"})
)
delta_data = df3[["PATIENT_med", "BASE_COST", "TOTALCOST", "DISPENSES"]].merge(
    patient_history, left_on="PATIENT_med", right_on="PATIENT_ID", suffixes=("", "_avg")
)
delta_data["delta_base"] = delta_data["BASE_COST"] - delta_data["BASE_COST_avg"]
delta_data["delta_cost"] = delta_data["TOTALCOST"] - delta_data["TOTALCOST_avg"]
delta_data["delta_disp"] = delta_data["DISPENSES"] - delta_data["DISPENSES_avg"]
delta_features = delta_data[["delta_base", "delta_cost", "delta_disp"]]

delta_model = IsolationForest(contamination=0.05, random_state=42)
delta_model.fit(delta_features)
delta_min, delta_max = delta_model.decision_function(delta_features).min(), delta_model.decision_function(delta_features).max()

explainer_general = shap.Explainer(general_model, encoded_df[feature_cols])
explainer_delta = shap.Explainer(delta_model, delta_features)

# --- Input Schema ---
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

# --- API Endpoint ---
@app.post("/predict")
def predict_fraud(input: FraudInput):
    entry = input.dict()
    med_vec = vectorizer.transform([entry["DESCRIPTION_med"].lower()])
    risk_category = risk_classifier.predict(med_vec)[0]
    entry["MEDICATION_RISK_CODE"] = risk_mapping[risk_category]

    for col in label_encoders:
        if col in entry:
            le = label_encoders[col]
            if entry[col] in le.classes_:
                entry[col] = le.transform([entry[col]])[0]
            else:
                le.classes_ = np.append(le.classes_, entry[col])
                entry[col] = le.transform([entry[col]])[0]

    entry["PATIENT_ID"] = entry.get("PATIENT_med", entry.get("PATIENT_ID"))
    shap_input = None

    matched = patient_history[patient_history["PATIENT_ID"] == entry["PATIENT_ID"]]
    if not matched.empty:
        avg = matched.iloc[0]
        delta_df = pd.DataFrame([{
            "delta_base": entry["BASE_COST"] - avg["BASE_COST"],
            "delta_cost": entry["TOTALCOST"] - avg["TOTALCOST"],
            "delta_disp": entry["DISPENSES"] - avg["DISPENSES"]
        }])
        score = delta_model.decision_function(delta_df)[0]
        norm_score = int(np.clip((delta_max - score) / (delta_max - delta_min) * 100, 0, 100))
        model_type = "patient history"
        shap_values = explainer_delta(delta_df)
        shap_input = delta_df
    else:
        entry_df = pd.DataFrame([entry])
        score = general_model.decision_function(entry_df[feature_cols])[0]
        norm_score = int(np.clip((general_max - score) / (general_max - general_min) * 100, 0, 100))
        model_type = "general population"
        shap_values = explainer_general(entry_df[feature_cols])
        shap_input = entry_df[feature_cols]

    return {
        "fraud": score < 0,
        "risk_score": norm_score,
        "medication_risk": risk_category,
        "used_model": model_type,
        "shap_features": shap_input.to_dict(orient="records")[0],
        "shap_values": shap_values.values[0].tolist()
    }