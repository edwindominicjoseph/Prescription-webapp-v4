import { ArrowUpRight, AlertTriangle, UserCircle, Star } from 'lucide-react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Home() {
  const kpis = [
    {
      label: 'Total Fraud Cases',
      value: 1234,
      percent: 5,
      data: {
        labels: ['Cases', 'Other'],
        datasets: [{ data: [70, 30], backgroundColor: ['#f472b6', '#e5e7eb'], borderWidth: 0 }],
      },
    },
    {
      label: 'Monthly Fraud Increase',
      value: 123,
      percent: 2.5,
      data: {
        labels: ['Increase', 'Other'],
        datasets: [{ data: [40, 60], backgroundColor: ['#a78bfa', '#e5e7eb'], borderWidth: 0 }],
      },
    },
    {
      label: 'Fraud Detection Rate',
      value: '87%',
      percent: 1.2,
      line: {
        labels: ['W1', 'W2', 'W3', 'W4', 'W5'],
        datasets: [
          {
            data: [70, 75, 72, 80, 87],
            borderColor: '#34d399',
            backgroundColor: 'rgba(52,211,153,0.2)',
            tension: 0.4,
            fill: true,
            pointRadius: 0,
          },
        ],
      },
    },
  ];

  const medsData = {
    labels: ['Medicine A', 'Medicine B', 'Medicine C', 'Medicine D'],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: ['#fbbf24', '#60a5fa', '#34d399', '#f472b6'],
        borderWidth: 0,
      },
    ],
  };

  const flagged = [
    { id: 'RX001', patient: 'John Doe', status: 'Flagged', risk: 5, doctor: 'Dr. Smith' },
    { id: 'RX002', patient: 'Jane Roe', status: 'Flagged', risk: 4, doctor: 'Dr. Lee' },
    { id: 'RX003', patient: 'Bob Ray', status: 'Cleared', risk: 2, doctor: 'Dr. Adams' },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Top KPI Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <p className="text-2xl font-semibold text-gray-800">{kpi.value}</p>
              <p className="flex items-center text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4" /> {kpi.percent}%
              </p>
            </div>
            <div className="w-20 h-20">
              {kpi.line ? (
                <Line data={kpi.line} options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false, min: 0, max: 100 } } }} />
              ) : (
                <Doughnut data={kpi.data} options={{ plugins: { legend: { display: false } }, cutout: '70%' }} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Top Medicines */}
      <div className="bg-white p-6 rounded-lg shadow grid md:grid-cols-2 gap-6 items-center">
        <div className="w-full max-w-sm mx-auto">
          <Doughnut data={medsData} options={{ plugins: { legend: { display: false } }, cutout: '60%' }} />
        </div>
        <ul className="space-y-2 text-sm">
          {medsData.labels.map((label, idx) => (
            <li key={label} className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: medsData.datasets[0].backgroundColor[idx] }}></span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* Flagged Prescriptions Table */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2">Prescription ID</th>
              <th className="py-2">Patient</th>
              <th className="py-2">Status</th>
              <th className="py-2">Fraud Risk</th>
              <th className="py-2">Flag</th>
              <th className="py-2">Doctor</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {flagged.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="py-2 font-medium">{row.id}</td>
                <td className="py-2">{row.patient}</td>
                <td className="py-2">
                  <span className={row.status === 'Flagged' ? 'text-red-600' : 'text-green-600'}>
                    {row.status}
                  </span>
                </td>
                <td className="py-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 inline ${i < row.risk ? 'text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </td>
                <td className="py-2">
                  {row.status === 'Flagged' && <AlertTriangle className="text-red-600 w-5 h-5" />}
                </td>
                <td className="py-2 flex items-center gap-1">
                  <UserCircle className="w-5 h-5 text-gray-500" /> {row.doctor}
                </td>
                <td className="py-2">
                  <button className="bg-violet-600 text-white px-3 py-1 rounded-md text-xs hover:bg-violet-700">
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
