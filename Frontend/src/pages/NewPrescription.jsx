import { useState } from 'react';

export default function NewPrescription() {
  const [dispenses, setDispenses] = useState(1);
  const [baseCost, setBaseCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [age, setAge] = useState(45);
  const [result, setResult] = useState(null);

  // Recalculate total cost
  const updateTotal = (disp, cost) => setTotalCost((disp * cost).toFixed(2));

  const handleDispenseChange = (delta) => {
    const newVal = Math.max(0, dispenses + delta);
    setDispenses(newVal);
    updateTotal(newVal, baseCost);
  };

  const handleCostChange = (val) => {
    const newCost = parseFloat(val) || 0;
    setBaseCost(newCost);
    updateTotal(dispenses, newCost);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      DESCRIPTION_med: formData.get('medication'),
      ENCOUNTERCLASS: formData.get('encounter'),
      PROVIDER: formData.get('provider'),
      ORGANIZATION: formData.get('organization'),
      GENDER: formData.get('gender'),
      ETHNICITY: 'unknown',
      MARITAL: formData.get('marital'),
      STATE: formData.get('state'),
      AGE: parseInt(age),
      DISPENSES: parseFloat(dispenses),
      BASE_COST: parseFloat(baseCost),
      TOTALCOST: parseFloat(totalCost),
      PATIENT_med: formData.get('patient'),
    };

    try {
      const res = await fetch('http://localhost:8000/predict', {
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
    <div className="px-4 py-8 bg-gradient-to-br from-indigo-100 to-violet-200 min-h-screen">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="grid md:grid-cols-2 gap-6">

          {/* Left column */}
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700">Patient ID</label>
              <input name="patient" type="text" defaultValue="demo_patient_01" className="w-full input-style" />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Medication Name</label>
              <input name="medication" type="text" defaultValue="Oxycodone Hydrochloride 10 MG" className="w-full input-style" />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Encounter Type</label>
              <select name="encounter" className="w-full input-style">
                <option value="inpatient">inpatient</option>
                <option value="outpatient">outpatient</option>
                <option value="emergency">emergency</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700">Dispenses</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => handleDispenseChange(-1)} className="btn-gray">−</button>
                <input name="dispenses" type="number" readOnly value={dispenses} className="input-style text-center w-20" />
                <button type="button" onClick={() => handleDispenseChange(1)} className="btn-gray">+</button>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700">Base Cost (€)</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => handleCostChange(baseCost - 1)} className="btn-gray">−</button>
                <input
                  name="basecost"
                  type="number"
                  value={baseCost}
                  onChange={(e) => handleCostChange(e.target.value)}
                  className="input-style text-center w-24"
                />
                <button type="button" onClick={() => handleCostChange(baseCost + 1)} className="btn-gray">+</button>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700">Total Cost (€)</label>
              <input name="totalcost" type="text" readOnly value={totalCost} className="w-full input-style bg-gray-100" />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700">Age: {age}</label>
              <input
                type="range"
                min={0}
                max={100}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Gender</label>
              <select name="gender" className="w-full input-style">
                <option>M</option>
                <option>F</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700">Marital Status</label>
              <select name="marital" className="w-full input-style">
                <option>M</option>
                <option>S</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700">State</label>
              <input name="state" type="text" defaultValue="Massachusetts" className="w-full input-style" />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Provider</label>
              <input name="provider" type="text" defaultValue="Dr.ABC" className="w-full input-style" />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Organization</label>
              <input name="organization" type="text" defaultValue="City Health" className="w-full input-style" />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button type="submit" className="w-full bg-violet-600 text-white py-2 rounded-md hover:bg-violet-700">
            ✓ AI Fraud Check
          </button>
        </div>
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="font-medium">Risk Score: {result.risk_score}</p>
            <p>Medication Risk: {result.medication_risk}</p>
            <p>Fraudulent: {result.fraud ? 'Yes' : 'No'}</p>
          </div>
        )}
      </form>
    </div>
  );
}
