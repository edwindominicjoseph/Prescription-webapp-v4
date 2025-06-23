import { useState } from 'react';

export default function NewPrescription() {
  const [dispenses, setDispenses] = useState(1);
  const [baseCost, setBaseCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [age, setAge] = useState(45);

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

  return (
    <div className="px-4 py-8 bg-gray-50 min-h-screen">
      <form className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="grid md:grid-cols-2 gap-6">

          {/* Left column */}
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700">Patient ID</label>
              <input type="text" defaultValue="demo_patient_01" className="w-full input-style" />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Medication Name</label>
              <input type="text" defaultValue="Oxycodone Hydrochloride 10 MG" className="w-full input-style" />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Encounter Type</label>
              <select className="w-full input-style">
                <option value="inpatient">inpatient</option>
                <option value="outpatient">outpatient</option>
                <option value="emergency">emergency</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700">Dispenses</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => handleDispenseChange(-1)} className="btn-gray">−</button>
                <input type="number" readOnly value={dispenses} className="input-style text-center w-20" />
                <button type="button" onClick={() => handleDispenseChange(1)} className="btn-gray">+</button>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700">Base Cost (€)</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => handleCostChange(baseCost - 1)} className="btn-gray">−</button>
                <input
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
              <input type="text" readOnly value={totalCost} className="w-full input-style bg-gray-100" />
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
                className="w-full accent-red-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Gender</label>
              <select className="w-full input-style">
                <option>M</option>
                <option>F</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700">Marital Status</label>
              <select className="w-full input-style">
                <option>M</option>
                <option>S</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700">State</label>
              <input type="text" defaultValue="Massachusetts" className="w-full input-style" />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Provider</label>
              <input type="text" defaultValue="Dr.ABC" className="w-full input-style" />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Organization</label>
              <input type="text" defaultValue="City Health" className="w-full input-style" />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button type="submit" className="w-full bg-violet-600 text-white py-2 rounded-md hover:bg-violet-700">
            ✓ AI Fraud Check
          </button>
        </div>
      </form>
    </div>
  );
}
