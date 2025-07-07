import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export default function FlagActivitySparkline() {
  const threshold = 5;

  const generate = () => {
    const points = 30;
    const now = new Date();
    const labels = [];
    const counts = [];
    for (let i = points - 1; i >= 0; i -= 1) {
      const t = new Date(now.getTime() - i * 60000);
      labels.push(t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      counts.push(Math.floor(Math.random() * 10));
    }
    return { labels, counts };
  };

  const init = generate();
  const [chartData, setChartData] = useState({
    labels: init.labels,
    datasets: [
      {
        data: init.counts,
        borderColor: '#9ca3af',
        backgroundColor: 'rgba(0,0,0,0)',
        pointRadius: 2,
        pointHoverRadius: 4,
        pointBackgroundColor: init.counts.map((c) => (c > threshold ? '#dc2626' : '#9ca3af')),
        tension: 0.4,
      },
    ],
  });

  useEffect(() => {
    const id = setInterval(() => {
      setChartData((prev) => {
        const next = Math.floor(Math.random() * 10);
        const label = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const data = [...prev.datasets[0].data.slice(1), next];
        const labels = [...prev.labels.slice(1), label];
        return {
          labels,
          datasets: [
            {
              ...prev.datasets[0],
              data,
              pointBackgroundColor: data.map((c) => (c > threshold ? '#dc2626' : '#9ca3af')),
            },
          ],
        };
      });
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} flags at ${ctx.label}`,
        },
      },
    },
    scales: {
      x: { display: false },
      y: { display: false, beginAtZero: true },
    },
  };

  return (
    <div className="h-20">
      <Line data={chartData} options={options} />
    </div>
  );
}
