import os
from pathlib import Path
import numpy as np
import pandas as pd
import shap
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder


# Load enhanced dataset
DATA_PATH = Path(__file__).parent / "data" / "Fullcover_merged_with_dates_Enhanced_sample.csv"
df3 = pd.read_csv(DATA_PATH)

# Risk classification
high_risk_medications = ["pregabalin", "gabapentin", "tapentadol", "carfentanil", "nitrazepam", "zopiclone", "zolpidem",
    "lorazepam", "temazepam", "hydromorphone", "fentanyl", "methadone", "oxycodone", "morphine",
    "alfentanil", "hydrocodone bitartrate", "medroxyPROGESTERone acetate", "leuprolide acetate",
    "enoxaparin sodium", "docetaxel", "epinephrine", "fluorouracil", "oxaliplatin", "furosemide",
    "doxorubicin hydrochloride", "fulvestrant", "sufentanil", "abuse-deterrent oxycodone hydrochloride",
    "amiodarone hydrochloride", "vancomycin", "tramadol", "Morphine Sulfate",
    "Oxycodone Hydrochloride", "Codeine Phosphate", "Methadone Hydrochloride",
    "Tramadol Hydrochloride", "Meperidine Hydrochloride", "Buprenorphine / Naloxone",
    "Lorazepam", "Diazepam", "Midazolam", "Clonazepam", "Remifentanil",
    "Nicotine Transdermal Patch", "Propofol"]

moderate_risk_medications = ["rivaroxaban", "dabigatran", "azathioprine", "baricitinib", "moxifloxacin", "clarithromycin",
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
    "Leronlimab", "Lenzilumab"]

risk_mapping = {"Low Risk": 0, "Moderate Risk": 1, "High Risk": 2}

def categorize_risk(med_name: str) -> str:
    name = med_name.lower()
    if any(m in name for m in map(str.lower, high_risk_medications)):
        return "High Risk"
    if any(m in name for m in map(str.lower, moderate_risk_medications)):
        return "Moderate Risk"
    return "Low Risk"

df3["MEDICATION_RISK"] = df3["DESCRIPTION_med"].apply(categorize_risk)
df3["MEDICATION_RISK_CODE"] = df3["MEDICATION_RISK"].map(risk_mapping)

# Risk classifier
vectorizer = TfidfVectorizer()
X_vec = vectorizer.fit_transform(df3["DESCRIPTION_med"].str.lower())
risk_classifier = LogisticRegression(max_iter=1000)
risk_classifier.fit(X_vec, df3["MEDICATION_RISK"])

# Label encoders
label_encoders = {}
encoded_df = df3.copy()
for col in [
    "DESCRIPTION_med", "ENCOUNTERCLASS", "PROVIDER", "ORGANIZATION",
    "GENDER", "ETHNICITY", "MARITAL", "STATE"
]:
    le = LabelEncoder()
    encoded_df[col] = le.fit_transform(encoded_df[col])
    label_encoders[col] = le

# Feature columns for general model
feature_cols = [
    "ENCOUNTERCLASS", "DISPENSES", "TOTALCOST", "AGE", "MEDICATION_RISK_CODE",
    "UNIQUE_DOCTOR_COUNT", "TIME_SINCE_LAST", "HIGH_RISK_COUNT"
]

# General model
general_model = IsolationForest(contamination=0.05, random_state=42)
general_model.fit(encoded_df[feature_cols])
general_min, general_max = general_model.decision_function(encoded_df[feature_cols]).min(), general_model.decision_function(encoded_df[feature_cols]).max()

# Delta model
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

def predict_fraud(input: FraudInput):
    entry = input.dict()
    entry["PATIENT_ID"] = entry["PATIENT_med"]
    risk_category = risk_classifier.predict(vectorizer.transform([entry["DESCRIPTION_med"].lower()]))[0]
    entry["MEDICATION_RISK_CODE"] = risk_mapping[risk_category]

    for col in label_encoders:
        if col in entry:
            le = label_encoders[col]
            if entry[col] in le.classes_:
                entry[col] = le.transform([entry[col]])[0]
            else:
                le.classes_ = np.append(le.classes_, entry[col])
                entry[col] = le.transform([entry[col]])[0]

    match = df3[df3["PATIENT_med"] == entry["PATIENT_ID"]]
    if not match.empty:
        latest = match.sort_values("DISPENSE_DATE", ascending=False).iloc[0]
        entry["UNIQUE_DOCTOR_COUNT"] = latest.get("UNIQUE_DOCTOR_COUNT", 1)
        entry["TIME_SINCE_LAST"] = latest.get("TIME_SINCE_LAST", 0)
        entry["HIGH_RISK_COUNT"] = latest.get("HIGH_RISK_COUNT", 0)
    else:
        entry["UNIQUE_DOCTOR_COUNT"] = 1
        entry["TIME_SINCE_LAST"] = 0
        entry["HIGH_RISK_COUNT"] = 0

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

    return jsonable_encoder({
        "fraud": bool(score < 0),
        "risk_score": norm_score,
        "medication_risk": risk_category,
        "used_model": model_type,
        "HIGH_RISK_COUNT": entry["HIGH_RISK_COUNT"],
        "UNIQUE_DOCTOR_COUNT": entry["UNIQUE_DOCTOR_COUNT"],
        "TIME_SINCE_LAST": entry["TIME_SINCE_LAST"]
    })
