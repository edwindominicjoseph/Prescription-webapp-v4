🚀 Prescription Fraud Detection – Fullstack App
An AI-powered end-to-end platform for detecting prescription fraud using ML & SHAP explainability. Built with:

🧠 FastAPI for backend (model + API)

💻 Vite + React + Tailwind CSS for frontend

🔐 Auth, risk scoring, SHAP-based insights, and UI dashboards

🗂️ Project Structure
Prescription-webapp-v4/
├── Backend/
│   ├── app.py                  # Main FastAPI entrypoint
│   ├── auth.py                 # Login logic
│   ├── ml_model_api.py         # ML model code
│   ├── data/
│   │   └── merged_Fullcover.csv
│   └── requirements.txt
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── NewPrescription.jsx
│   │   │   ├── FlaggedPrescriptions.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── UserPage.jsx
│   │   │   └── login.jsx
│   │   ├── App.jsx
│   │   ├── router.jsx          # Route config
│   │   ├── main.jsx            # App entrypoint
│   │   ├── App.css
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── README.md
└── .gitignore

⚙️ How to Run
1. 🔌 Backend (FastAPI)
```bash
cd Backend
pip install -r requirements.txt
uvicorn app:app --reload
```
✅ API is now live at: http://localhost:8000

2. 💻 Frontend (Vite + React)
```bash
cd Frontend
npm install
npm run dev
```
✅ Frontend runs at: http://localhost:5173

📌 API Routes
Route                     Description
POST /auth/login          Login (email + password)
POST /predict             Fraud prediction via ML model
GET /user/...             (Optional) User routes

💡 Features
✅ Rule-based + ML medication risk classification
✅ Dual Isolation Forests (general + patient-specific)
✅ SHAP-based feature importance visualization
✅ Streamlined UI with TailwindCSS and React Router
✅ Secure CORS connection between frontend-backend
✅ Predictions logged to `Backend/predictions.csv`

🔐 Default Login (for testing)
```json
{
  "email": "edwin@gmail.com",
  "password": "password123"
}
```
