import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';

export default function RiskTrendChart({ data, lastUpdated }) {
  const options = {
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#ffffff' } },
      y: { ticks: { color: '#ffffff' }, beginAtZero: true },
    },
    animation: { duration: 500 },
  };

  return (
    <div>
      <Line data={data} options={options} />
      <p className="text-xs text-gray-400 mt-2">Last Updated: {lastUpdated}</p>
    </div>
  );
}

RiskTrendChart.propTypes = {
  data: PropTypes.object.isRequired,
  lastUpdated: PropTypes.string.isRequired,
};
