import { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Star } from 'lucide-react';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Dashboard() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/predict/history')
      .then((res) => res.json())
      .then((data) => setRecords(data))
      .catch((err) => console.error(err));
  }, []);

  const totalPrescriptions = records.length;
  const flaggedRecords = records.filter((r) => r.fraud === true || r.fraud === 'True' || r.Status === 'Flagged');
  const totalFraudCases = flaggedRecords.length;

  const fraudByMedication = {};
  flaggedRecords.forEach((r) => {
    const med = r.DESCRIPTION_med || r.Medication_Name || 'Unknown';
    fraudByMedication[med] = (fraudByMedication[med] || 0) + 1;
  });
  const medsLabels = Object.keys(fraudByMedication);
  const medsCounts = Object.values(fraudByMedication);
  const colorPalette = ['#fbbf24', '#60a5fa', '#34d399', '#f472b6', '#c084fc', '#f87171'];

  const medsChartData = {
    labels: medsLabels,
    datasets: [
      {
        data: medsCounts,
        backgroundColor: medsLabels.map((_, i) => colorPalette[i % colorPalette.length]),
        borderWidth: 0,
      },
    ],
  };

  const trendMap = {};
  records.forEach((r) => {
    const ts = r.timestamp || r.TimeStamp || r.created_at;
    if (!ts) return;
    const d = new Date(ts);
    const label = d.getHours();
    if (!trendMap[label]) trendMap[label] = { sum: 0, count: 0 };
    trendMap[label].sum += Number(r.risk_score || r.Risk_Score || 0);
    trendMap[label].count += 1;
  });
  const trendLabels = Object.keys(trendMap).sort((a, b) => Number(a) - Number(b));
  const trendData = trendLabels.map((l) => trendMap[l].sum / trendMap[l].count);
  const lineData = {
    labels: trendLabels,
    datasets: [
      {
        data: trendData,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
      },
    ],
  };

  return (
    <div className="p-6 space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Fraud Cases</p>
            <p className="text-2xl font-semibold text-gray-800">{totalFraudCases}</p>
          </div>
          <div className="w-24 h-24">
            <Doughnut
              data={{
                labels: ['Fraud', 'Other'],
                datasets: [
                  { data: [totalFraudCases, totalPrescriptions - totalFraudCases], backgroundColor: ['#f87171', '#e5e7eb'], borderWidth: 0 },
                ],
              }}
              options={{ plugins: { legend: { display: false } }, cutout: '70%' }}
            />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Prescriptions</p>
            <p className="text-2xl font-semibold text-gray-800">{totalPrescriptions}</p>
          </div>
          <div className="w-24 h-24">
            <Doughnut
              data={{
                labels: ['Prescriptions'],
                datasets: [
                  { data: [totalPrescriptions, 0], backgroundColor: ['#60a5fa', '#e5e7eb'], borderWidth: 0 },
                ],
              }}
              options={{ plugins: { legend: { display: false } }, cutout: '70%' }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow grid md:grid-cols-2 gap-6 items-center">
        <div className="w-full max-w-sm mx-auto">
          <Doughnut data={medsChartData} options={{ plugins: { legend: { display: false } }, cutout: '60%' }} />
        </div>
        <ul className="space-y-2 text-sm">
          {medsLabels.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: colorPalette[i % colorPalette.length] }}></span>
              {label} - {((medsCounts[i] / totalFraudCases) * 100).toFixed(1)}%
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Line
          data={lineData}
          options={{
            plugins: { legend: { display: false } },
            scales: {
              x: { title: { display: true, text: 'Hour' } },
              y: { title: { display: true, text: 'Avg Risk Score' }, beginAtZero: true },
            },
          }}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2">PATIENT_ID</th>
              <th className="py-2">Status</th>
              <th className="py-2">Fraud Risk</th>
              <th className="py-2">Flag Severity</th>
              <th className="py-2">Doctor</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {flaggedRecords.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2 font-medium">{row.PATIENT_ID || row.PATIENT_med}</td>
                <td className="py-2 text-red-600">Flagged</td>
                <td className="py-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 inline ${i < Math.round((row.risk_score || 0) / 20) ? 'text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </td>
                <td className="py-2">
                  <span
                    className={
                      row.medication_risk === 'High Risk'
                        ? 'text-red-600'
                        : row.medication_risk === 'Moderate Risk'
                        ? 'text-yellow-500'
                        : 'text-green-600'
                    }
                  >
                    {row.medication_risk}
                  </span>
                </td>
                <td className="py-2">{row.PROVIDER || row.Doctor || 'N/A'}</td>
                <td className="py-2">
                  <button className="bg-violet-600 text-white px-3 py-1 rounded-md text-xs hover:bg-violet-700">Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
