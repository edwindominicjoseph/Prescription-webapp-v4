import { useState } from 'react';
import PredictionPopup from './PredictionPopup';

export default function PrescriptionForm() {
  const [prediction, setPrediction] = useState(null);

  const handleCheck = async () => {
    const payload = {
      PATIENT_ID: 'demo_patient_01',
      DESCRIPTION_med: 'Oxycodone Hydrochloride 10 MG',
    };

    try {
      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg text-gray-100 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Prescription Fraud Detection</h1>
      <button
        onClick={handleCheck}
        className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600"
      >
        AI Fraud Check
      </button>
      {prediction && (
        <PredictionPopup result={prediction} onClose={() => setPrediction(null)} />
      )}
    </div>
  );
}
