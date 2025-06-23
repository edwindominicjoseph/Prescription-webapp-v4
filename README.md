# 💊 Prescription Fraud Detection Platform (Fullstack)

This is a modern fullstack web application for detecting fraudulent prescriptions using AI. Built with **Vite + React** on the frontend and **FastAPI + Python** on the backend, it provides an intuitive interface for doctors, pharmacists, and healthcare staff to review prescriptions and flag potential fraud.

---

## 📊 Features

### 🔍 Fraud Detection (AI)
- Medication Risk Classification (TF-IDF + Logistic Regression)
- Fraud Risk Scoring (Isolation Forest with SHAP explainability)
- Real-time prediction based on prescription input

### 🖥️ Frontend (Vite + React + Tailwind CSS)
- 🏠 Home Dashboard: Overview metrics, fraud stats, donut/pie charts
- ➕ New Prescription: Input form for real-time fraud checking
- 🚩 Flagged Prescriptions: Review, notify doctors, update statuses
- ⚙️ Settings: Profile, notification preferences, account controls
- 👤 User Page: Activity log, preferences, and profile management

### ⚙️ Backend (FastAPI + scikit-learn)
- Model loading and prediction API
- SHAP explainability output
- Scalable endpoints for prediction and history logging

---

## 📁 Folder Structure

```bash
fraud-detection-fullstack/
│
├── client/                         # Frontend (Vite + React)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/             # Sidebar, TopNav, Graphs, Tables
│   │   ├── pages/                  # Home, NewPrescription, etc.
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── router.jsx
│   ├── index.css
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                         # Backend (FastAPI + ML)
│   ├── data/                       # CSV dataset (merged_Fullcover.csv)
│   ├── saved_models/              # Pickle model files
│   ├── app.py                     # FastAPI entry point
│   ├── model_components.py        # Model logic, feature engineering
│   └── requirements.txt
│
├── .gitignore
└── README.md

🚀 Getting Started
📦 1. Install Backend

cd server
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app:app --reload

By default, the backend runs at:
http://127.0.0.1:8000


🌐 2. Install Frontend
bash
Copy
Edit
cd client
npm install
npm run dev
By default, the frontend runs at:
http://localhost:5173

⚙️ API Endpoints
Method	Endpoint	Description
POST	/predict	Predict fraud risk
GET	/shap/{id}	Get SHAP explainability
GET	/models/status	Health check of model pipeline

🔐 Authentication (Future Scope)
JWT-based secure login

Role-based access: Doctor, Admin, Analyst

📈 Deployment Ideas
Dockerize with NGINX reverse proxy

Deploy on Render, Railway, or AWS EC2

CI/CD using GitHub Actions

📌 Credits
Developed by Group 20
University Business Analytics Project | 2025
UI/UX inspired by Group 20

🧠 AI Model Pipeline
Logistic Regression → Risk Classifier

Isolation Forest → Anomaly Detector

SHAP → Feature contribution explainer

Built using Python, scikit-learn, pandas

