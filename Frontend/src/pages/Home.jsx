import { useEffect, useState } from 'react';
import { ArrowUpRight, AlertTriangle, UserCircle, Star } from 'lucide-react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Home() {
  const [recentMeds, setRecentMeds] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/predict/history')
      .then((res) => res.json())
      .then((data) => {
        const meds = data
          .map((d) => d.DESCRIPTION_med)
          .slice(-5)
          .reverse();
        setRecentMeds(meds);
      })
      .catch((err) => console.error(err));
  }, []);
  const [kpis, setKpis] = useState([
    {
      label: 'Total Fraud Cases',
      value: 0,
      percent: 0,
      data: {
        labels: ['Cases', 'Other'],
        datasets: [{ data: [0, 100], backgroundColor: ['#f472b6', '#e5e7eb'], borderWidth: 0 }],
      },
    },
    {
      label: 'Monthly Fraud Increase',
      value: 0,
      percent: 0,
      data: {
        labels: ['Increase', 'Other'],
        datasets: [{ data: [0, 100], backgroundColor: ['#a78bfa', '#e5e7eb'], borderWidth: 0 }],
      },
    },
    {
      label: 'Fraud Detection Rate',
      value: '0%',
      percent: 0,
      line: {
        labels: ['W1', 'W2', 'W3', 'W4', 'W5'],
        datasets: [
          {
            data: [0, 0, 0, 0, 0],
            borderColor: '#34d399',
            backgroundColor: 'rgba(52,211,153,0.2)',
            tension: 0.4,
            fill: true,
            pointRadius: 0,
          },
        ],
      },
    },
  ]);

  const [medsData, setMedsData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#fbbf24', '#60a5fa', '#34d399', '#f472b6', '#a78bfa'],
        borderWidth: 0,
      },
    ],
  });

  const [flagged, setFlagged] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/predict/history')
      .then((res) => res.json())
      .then((data) => {
        setFlagged(
          data.map((r, i) => ({
            id: `RX${String(i + 1).padStart(3, '0')}`,
            patient: r.PATIENT_med,
            status: r.fraud === 'True' ? 'Flagged' : 'Cleared',
            risk: Math.min(5, Math.round(Number(r.risk_score) / 20)),
            doctor: r.PROVIDER,
          }))
        );

        const fraudCount = data.filter((r) => r.fraud === 'True' || r.fraud === true).length;
        const month = new Date().getMonth();
        const monthlyFraud = data.filter(
          (r) => new Date(r.timestamp).getMonth() === month && (r.fraud === 'True' || r.fraud === true)
        ).length;
        const total = data.length;
        const detection = total ? Math.round((fraudCount / total) * 100) : 0;

        setKpis((prev) => [
          { ...prev[0], value: fraudCount },
          { ...prev[1], value: monthlyFraud },
          { ...prev[2], value: `${detection}%` },
        ]);

        const medCounts = {};
        data.forEach((r) => {
          const name = r.DESCRIPTION_med;
          if (name) {
            medCounts[name] = (medCounts[name] || 0) + 1;
          }
        });
        const topMeds = Object.entries(medCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4);
        const labels = topMeds.map(([n]) => n);
        const counts = topMeds.map(([, c]) => c);
        setMedsData((prev) => ({
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
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-gray-900 to-black text-white rounded-lg p-6 shadow mb-8">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <p className="text-sm text-white/80">Latest fraud prediction statistics</p>
      </section>

      {/* Top KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{kpi.label}</p>
              <p className="text-2xl font-semibold text-white">{kpi.value}</p>
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
      <div className="bg-gray-800 p-6 rounded-lg shadow grid md:grid-cols-2 gap-6 items-center">
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

      {/* Recent Predictions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Recent Predictions</h2>
        {recentMeds.length ? (
          <ul className="list-disc list-inside space-y-1 text-sm">
            {recentMeds.map((med, idx) => (
              <li key={idx}>{med}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No predictions yet.</p>
        )}
      </div>

      {/* Flagged Prescriptions Table */}
      <div className="bg-gray-800 p-6 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-300">
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
                  <UserCircle className="w-5 h-5 text-gray-400" /> {row.doctor}
                </td>
                <td className="py-2">
                  <button className="bg-gray-700 text-white px-3 py-1 rounded-md text-xs hover:bg-gray-600">
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
