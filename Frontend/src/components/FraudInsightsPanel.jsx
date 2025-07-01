import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function FraudInsightsPanel() {
  const [data, setData] = useState({ medications: [], doctors: [], providers: [] });
  const [view, setView] = useState('medications');

  useEffect(() => {
    fetch('http://localhost:8000/predict/history')
      .then(res => res.json())
      .then(list => {
        const flagged = list.filter(
          r => r.likely_fraud === 'True' || r.likely_fraud === true
        );
        const countTop = field => {
          const map = {};
          flagged.forEach(r => {
            const key = r[field];
            if (key) map[key] = (map[key] || 0) + 1;
          });
          return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        };
        setData(prev => ({
          ...prev,
          medications: countTop('DESCRIPTION_med'),
          doctors: countTop('PROVIDER'),
        }));
      })
      .catch(err => console.error(err));

    fetch('http://localhost:8000/analytics/top_providers')
      .then(res => res.json())
      .then(items =>
        setData(prev => ({
          ...prev,
          providers: items.map(i => [i.Provider_med, i.count]),
        }))
      )
      .catch(err => console.error(err));
  }, []);

  const current = data[view];

  const COLORS = ['#e74c3c', '#f39c12', '#27ae60', '#2980b9', '#8e44ad'];

  const chartData = {
    labels: current.map(([name]) => name),
    datasets: [
      {
        data: current.map(([, count]) => count),
        backgroundColor: COLORS.slice(0, current.length),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { ticks: { color: '#ffffff' }, beginAtZero: true },
      y: { ticks: { color: '#ffffff' } },
    },
    animation: { duration: 500 },
  };

  const titles = {
    medications: 'Top 5 Fraud-Flagged Medications',
    doctors: 'Top 5 Doctors Prescribing Fraud-Flagged Meds',
    providers: 'Top 5 Providers Dispensing Fraud-Flagged Meds',
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex gap-2 mb-4">
        {['medications', 'doctors', 'providers'].map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`px-2 py-1 text-xs rounded ${view === v ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
      <h3 className="font-semibold mb-4" style={{ color: '#2F5597' }} title="Number of times each item was flagged for fraud">
        {titles[view]}
      </h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}
