import { useState } from 'react';
import PredictionPopup from './PredictionPopup';

export default function PrescriptionForm() {
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      PATIENT_med: 'demo_patient_01',
      DESCRIPTION_med: 'Oxycodone Hydrochloride 10 MG',
      PROVIDER: 'Dr. ABC',
      DISPENSES: 1,
    };

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 text-white rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Patient ID</label>
          <input type="text" className="w-full input-style" defaultValue="demo_patient_01" readOnly />
        </div>
        <div>
          <label className="block mb-1">Medication</label>
          <input type="text" className="w-full input-style" defaultValue="Oxycodone Hydrochloride 10 MG" readOnly />
        </div>
        <button type="submit" className="w-full bg-gray-700 py-2 rounded hover:bg-gray-600">
          AI Fraud Check
        </button>
      </form>
      {result && (
        <PredictionPopup result={result} onClose={() => setResult(null)} />
      )}
    </div>
  );
}
