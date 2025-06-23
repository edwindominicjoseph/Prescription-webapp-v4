import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function NewPrescription({ isOpen, onClose }) {
  const [form, setForm] = useState({
    medication: '',
    dosage: '',
    prescriber: '',
    risk: 'Low',
  });

  useEffect(() => {
    if (!isOpen) {
      setForm({ medication: '', dosage: '', prescriber: '', risk: 'Low' });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow relative w-80 animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X />
        </button>
        <h2 className="text-xl font-semibold mb-4">Add New Prescription</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Medication Name</label>
            <input
              name="medication"
              value={form.medication}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Dosage</label>
            <input
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Prescriber</label>
            <input
              name="prescriber"
              value={form.prescriber}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Risk Category</label>
            <select
              name="risk"
              value={form.risk}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
