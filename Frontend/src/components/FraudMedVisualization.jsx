import PropTypes from 'prop-types';
import { useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';

export default function FraudMedVisualization({ donutData, barData }) {
  const [mode, setMode] = useState('donut');

  const donutOptions = { cutout: '60%', plugins: { legend: { display: false } } };
  const barOptions = {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } },
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button type="button" onClick={() => setMode('donut')} className={`px-2 py-1 text-xs rounded ${mode==='donut' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>Donut</button>
        <button type="button" onClick={() => setMode('bar')} className={`px-2 py-1 text-xs rounded ${mode==='bar' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>Bar</button>
      </div>
      <div className="h-64">
        {mode === 'donut' ? (
          <Doughnut data={donutData} options={donutOptions} />
        ) : (
          <Bar data={barData} options={barOptions} />
        )}
      </div>
    </div>
  );
}

FraudMedVisualization.propTypes = {
  donutData: PropTypes.object.isRequired,
  barData: PropTypes.object.isRequired,
};
