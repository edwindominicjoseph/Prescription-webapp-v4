import PropTypes from 'prop-types';
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

export default function FraudMedsBarChart({ data, onSelect }) {
  const options = {
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.x} cases`,
        },
      },
    },
    scales: {
      x: { beginAtZero: true, ticks: { color: '#ffffff' } },
      y: { ticks: { color: '#ffffff' } },
    },
    animation: { duration: 800 },
    onClick: (_evt, elements) => {
      if (!elements.length) return;
      const idx = elements[0].index;
      onSelect(data.labels[idx]);
    },
  };

  return <Bar data={data} options={options} />;
}

FraudMedsBarChart.propTypes = {
  data: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
};

FraudMedsBarChart.defaultProps = {
  onSelect: () => {},
};
