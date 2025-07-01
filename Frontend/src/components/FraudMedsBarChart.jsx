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
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

export default function FraudMedsBarChart({ data, onSelect }) {
  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: (ctx) => {
            const { parsed, dataset } = ctx;
            const avg = dataset.avgRisk?.[ctx.dataIndex];
            const doc = dataset.doctor?.[ctx.dataIndex];
            const parts = [`${parsed.x} flags`];
            if (avg) parts.push(`Avg Risk: ${avg}`);
            if (doc) parts.push(`Doctor: ${doc}`);
            return parts.join(' | ');
          },
        },
      },
      datalabels: {
        color: '#fff',
        anchor: 'end',
        align: 'right',
        formatter: (val) => val,
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

  return <Bar data={data} options={options} style={{ backgroundColor: 'transparent' }} />;
}

FraudMedsBarChart.propTypes = {
  data: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
};

FraudMedsBarChart.defaultProps = {
  onSelect: () => {},
};
