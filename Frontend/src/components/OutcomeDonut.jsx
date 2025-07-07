import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';

export default function OutcomeDonut() {
  const [counts, setCounts] = useState({ fraud: 0, cleared: 0, rare: 0 });
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const fetchData = () => {
      fetch('http://localhost:8000/predict/summary')
        .then((res) => res.json())
        .then((data) => {
          setCounts(data);
          setLastUpdated(new Date().toLocaleTimeString());
        })
        .catch((err) => console.error(err));
    };

    fetchData();
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, []);

  const total = counts.fraud + counts.cleared + counts.rare;

  const chartData = {
    labels: ['Fraud', 'Cleared', 'Rare'],
    datasets: [
      {
        data: [counts.fraud, counts.cleared, counts.rare],
        backgroundColor: ['#dc2626', '#16a34a', '#eab308'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    cutout: '70%',
    animation: { duration: 500 },
  };

  const pct = (val) => (total ? Math.round((val / total) * 100) : 0);

  return (
    <div className="text-white text-center">
      <div className="relative w-20 h-20 mx-auto">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center text-xs">
          Total: {total}
        </div>
      </div>
      <ul className="mt-2 space-y-1 text-xs">
        <li className="flex items-center justify-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#dc2626' }}></span>
          Fraud: {counts.fraud} ({pct(counts.fraud)}%)
        </li>
        <li className="flex items-center justify-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#16a34a' }}></span>
          Cleared: {counts.cleared} ({pct(counts.cleared)}%)
        </li>
        <li className="flex items-center justify-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#eab308' }}></span>
          Rare: {counts.rare} ({pct(counts.rare)}%)
        </li>
      </ul>
      {lastUpdated && (
        <p className="text-gray-400 text-xs mt-1">Last Updated: {lastUpdated}</p>
      )}
    </div>
  );
}
