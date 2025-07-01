import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(LinearScale, PointElement, Tooltip, TimeScale);

export default function BypassTimeline({ data }) {
  const [range, setRange] = useState('30');

  const filtered = useMemo(() => {
    if (range === 'all') return data;
    const days = Number(range);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return data.filter((d) => new Date(d.timestamp) >= cutoff);
  }, [data, range]);

  const chartData = useMemo(
    () => ({
      datasets: [
        {
          label: 'Bypassed',
          data: filtered.map((d) => ({ x: d.timestamp, y: 1 })),
          pointBackgroundColor: '#f1c40f',
          pointBorderColor: '#f1c40f',
          pointRadius: 6,
        },
      ],
    }),
    [filtered]
  );

  const options = {
    scales: {
      x: {
        type: 'time',
        ticks: { color: '#ffffff' },
        grid: { color: '#333' },
      },
      y: { display: false },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(ctx) {
            const item = filtered[ctx.dataIndex];
            return `${item.DESCRIPTION_med} (Patient ${item.PATIENT_med}) - ${item.PROVIDER} [RARE]`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold" style={{ color: '#2F5597' }}>
          Recent Bypassed Fraud Records
        </h3>
        <select
          className="bg-gray-700 text-sm p-1 rounded"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="text-center text-gray-400">No recent bypass activity</p>
      ) : (
        <div className="h-64">
          <Scatter data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}

BypassTimeline.propTypes = {
  data: PropTypes.array.isRequired,
};
