import { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Star, AlertTriangle } from 'lucide-react';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [fraudPct, setFraudPct] = useState(0);
  const [total, setTotal] = useState(0);
  const [medChart, setMedChart] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#fbbf24', '#60a5fa', '#34d399', '#f472b6', '#a78bfa'],
        borderWidth: 0,
      },
    ],
  });
  const [trendChart, setTrendChart] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220,38,38,0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
    ],
  });

  useEffect(() => {
    fetch('http://localhost:8000/predict/history')
      .then((res) => res.json())
      .then((data) => {
        setRows(
          data.map((r, i) => ({
            id: `RX${String(i + 1).padStart(3, '0')}`,
            patient: r.PATIENT_med,
            status: r.fraud === 'True' || r.fraud === true ? 'Flagged' : 'Cleared',
            risk: Math.min(5, Math.round(Number(r.risk_score) / 20)),
            doctor: r.PROVIDER,
          }))
        );
        const totalRecords = data.length;
        const fraudRecords = data.filter(
          (d) => d.fraud === 'True' || d.fraud === true
        ).length;
        setTotal(totalRecords);
        setFraudPct(
          totalRecords ? Math.round((fraudRecords / totalRecords) * 100) : 0
        );

        const medCounts = {};
        data.forEach((d) => {
          const med = d.DESCRIPTION_med;
          if (med) {
            medCounts[med] = (medCounts[med] || 0) + 1;
          }
        });
        const sorted = Object.entries(medCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        const labels = sorted.map(([m]) => m);
        const counts = sorted.map(([, c]) => c);
        setMedChart((prev) => ({
          ...prev,
          labels,
          datasets: [
            {
              ...prev.datasets[0],
              data: counts,
              backgroundColor: prev.datasets[0].backgroundColor.slice(
                0,
                labels.length
              ),
            },
          ],
        }));

        const sortedRows = [...data]
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .slice(-20);
        setTrendChart((prev) => ({
          ...prev,
          labels: sortedRows.map((r) =>
            new Date(r.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          ),
          datasets: [
            {
              ...prev.datasets[0],
              data: sortedRows.map((r) => Number(r.risk_score)),
            },
          ],
        }));
      })
      .catch((err) => console.error(err));
  }, []);

  const donutFraudData = {
    labels: ['Fraud', 'Other'],
    datasets: [
      { data: [fraudPct, 100 - fraudPct], backgroundColor: ['#dc2626', '#e5e7eb'], borderWidth: 0 },
    ],
  };
  const donutMiddleData = {
    labels: ['Risk', 'Other'],
    datasets: [
      { data: [fraudPct, 100 - fraudPct], backgroundColor: ['#0ea5e9', '#e5e7eb'], borderWidth: 0 },
    ],
  };
  const donutTotalData = {
    labels: ['Total'],
    datasets: [
      { data: [100, 0], backgroundColor: ['#2dd4bf', '#e5e7eb'], borderWidth: 0 },
    ],
  };

  return (
    <div className="space-y-6">
      <h1
        className="text-center font-bold text-3xl md:text-4xl"
        style={{ color: '#2F5597' }}
      >
        AI-Powered Prescription Fraud Detection Dashboard
      </h1>
      <div className="md:grid md:grid-cols-[55%_45%] gap-6">
        <div className="space-y-6">
          {/* Row 1 */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#2F5597' }}>
                  Total Fraud Cases
                </p>
                <p className="text-2xl font-bold text-red-500">{fraudPct}</p>
              </div>
              <div className="w-20 h-20">
                <Doughnut data={donutFraudData} options={{ plugins: { legend: { display: false } }, cutout: '70%' }} />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-center">
              <div className="w-20 h-20">
                <Doughnut data={donutMiddleData} options={{ plugins: { legend: { display: false } }, cutout: '70%' }} />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#2F5597' }}>
                  Total Prescriptions
                </p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <div className="w-20 h-20">
                <Doughnut data={donutTotalData} options={{ plugins: { legend: { display: false } }, cutout: '70%' }} />
              </div>
            </div>
          </div>

          {/* Fraud Medications */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-4" style={{ color: '#2F5597' }}>
              Fraud Medications
            </h3>
            <div className="md:flex md:items-start">
              <div className="md:w-1/2 mx-auto">
                <Doughnut data={medChart} options={{ plugins: { legend: { display: false } }, cutout: '60%' }} />
              </div>
              <ul className="md:w-1/2 space-y-2 mt-4 md:mt-0 md:pl-6 text-sm">
                {medChart.labels.map((label, idx) => (
                  <li key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-sm"
                        style={{ backgroundColor: medChart.datasets[0].backgroundColor[idx] }}
                      ></span>
                      <span>{label}</span>
                    </div>
                    <span className="text-gray-400">
                      {total ? Math.round((medChart.datasets[0].data[idx] / total) * 100) : 0}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Risk Trend */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-4" style={{ color: '#2F5597' }}>
              Real Time Risk Score Trend
            </h3>
            <Line
              data={trendChart}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#ffffff' } },
                  y: { ticks: { color: '#ffffff' }, beginAtZero: true },
                },
              }}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-4" style={{ color: '#2F5597' }}>
            Flagged Patients
          </h3>
          <div className="overflow-y-auto max-h-[600px]">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-300">
                <tr>
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
                {rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-2 font-medium">{row.id}</td>
                    <td className="py-2">{row.patient}</td>
                    <td className="py-2">
                      <span className={row.status === 'Flagged' ? 'text-red-500' : 'text-green-500'}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 inline ${i < row.risk ? 'text-yellow-400' : 'text-gray-400'}`}
                        />
                      ))}
                    </td>
                    <td className="py-2">
                      {row.status === 'Flagged' && (
                        <AlertTriangle className="text-red-600 w-5 h-5" />
                      )}
                    </td>
                    <td className="py-2">{row.doctor}</td>
                    <td className="py-2">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-500">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
