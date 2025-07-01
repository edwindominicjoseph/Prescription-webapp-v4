import { useState, useEffect } from 'react';
import Papa from 'papaparse';
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
    fetch('/Backend/predictions.csv')
      .then(res => res.text())
      .then(text => {
        const parsed = Papa.parse(text, { header: true }).data;
        const flagged = parsed.filter(r => r.fraud === 'True' || r.fraud === true);
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
        setData({
          medications: countTop('DESCRIPTION_med'),
          doctors: countTop('PROVIDER'),
          providers: countTop('ORGANIZATION'),
        });
      })
      .catch(err => console.error(err));
  }, []);

  const current = data[view];
  const chartData = {
    labels: current.map(([name]) => name),
    datasets: [
      {
        data: current.map(([, count]) => count),
        backgroundColor: '#dc2626',
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
