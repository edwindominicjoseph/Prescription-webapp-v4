import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';

export default function StatusCard({ title, count, pct, color }) {
  const data = {
    labels: ['value', 'rest'],
    datasets: [
      {
        data: [pct, 100 - pct],
        backgroundColor: [color, '#374151'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-300">{title}</p>
        <p className="text-2xl font-bold">{count}</p>
      </div>
      <div className="w-16 h-16">
        <Doughnut data={data} options={{ cutout: '70%', plugins: { legend: { display: false } }, animation: { duration: 500 } }} />
      </div>
    </div>
  );
}

StatusCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  pct: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};
