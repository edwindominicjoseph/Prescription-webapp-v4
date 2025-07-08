import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
);

export default function SummaryCards() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    fetch('http://localhost:8000/analytics/summary')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load metrics');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const prescLine = {
    labels: data.prescriptions_over_time.map((p) => p.date),
    datasets: [
      {
        data: data.prescriptions_over_time.map((p) => p.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const alertsBar = {
    labels: data.alerts_over_time.map((a) => a.date),
    datasets: [
      {
        data: data.alerts_over_time.map((a) => a.count),
        backgroundColor: '#dc2626',
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
  };

  const stars = [];
  const rating = Math.round(data.avg_risk_score);
  for (let i = 1; i <= 5; i += 1) {
    stars.push(
      <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-500'}>
        ★
      </span>,
    );
  }

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Prescriptions Scanned</h3>
        <p className="text-2xl font-bold mb-2">{data.total_prescriptions}</p>
        <Line data={prescLine} options={chartOptions} />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Fraud Alerts Triggered</h3>
        <p className="text-2xl font-bold mb-2 text-red-500">{data.fraud_alerts}</p>
        <Bar data={alertsBar} options={chartOptions} />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Avg. Fraud Risk Score</h3>
        <div className="flex justify-center mb-1 text-lg">{stars}</div>
        <div className="w-full bg-gray-700 rounded h-2 mb-1">
          <div
            className="bg-yellow-500 h-2 rounded"
            style={{ width: `${(data.avg_risk_score / 5) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-400">{data.avg_risk_score.toFixed(1)} / 5</p>
      </div>
    </div>
  );
}
