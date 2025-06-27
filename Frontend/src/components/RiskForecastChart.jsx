import {useState} from 'react';
import {Line} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function RiskForecastChart() {
  const [showForecast, setShowForecast] = useState(true);

  const labels = [
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
  ];

  const actualData = [20, 28, 25, 30, 32, 35, 33];
  const forecastData = [34, 36, 38, 40, 42];

  const data = {
    labels,
    datasets: [
      {
        label: 'Actual Risk',
        data: actualData,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
      showForecast && {
        label: 'Forecast',
        data: Array(7).fill(null).concat(forecastData),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.2)',
        tension: 0.4,
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
      },
    ].filter(Boolean),
  };

  const options = {
    plugins: {
      legend: { labels: { color: '#ffffff' } },
      tooltip: {
        callbacks: {
          label(context) {
            const label = context.dataset.label || '';
            if (label === 'Forecast') {
              return `Predicted risk score: ${context.parsed.y}`;
            }
            return `${label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: { ticks: { color: '#ffffff' } },
      y: { ticks: { color: '#ffffff' }, beginAtZero: true, max: 100 },
    },
  };

  return (
    <div className="bg-slate-900 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" style={{ color: '#2F5597' }}>
          Risk Score Forecasting
        </h3>
        <label className="text-sm text-gray-300 flex items-center gap-1">
          <input
            type="checkbox"
            checked={showForecast}
            onChange={() => setShowForecast(!showForecast)}
            className="accent-green-600" />
          Show forecast
        </label>
      </div>
      <Line data={data} options={options} />
    </div>
  );
}
