import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  AlertTriangle,
  UserCircle,
  FlaskConical,
  TrendingUp,
  CheckCircle,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Plot from 'react-plotly.js';
import dayjs from 'dayjs';
import RadialProgress from '../components/RadialProgress';

export default function Home() {
  const [kpis, setKpis] = useState([
    { label: 'Monthly Fraud Cases', value: 0, percent: 0, color: '#f472b6' },
    { label: 'Monthly Fraud Change', value: 0, percent: 0, color: '#a78bfa' },
    { label: 'Fraud Detection Rate', value: '0%', percent: 0, color: '#34d399' },
  ]);


  const [flagged, setFlagged] = useState([]);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [dateRange, setDateRange] = useState('30');
  const [medication, setMedication] = useState('All');
  const [medOptions, setMedOptions] = useState([]);

  const [fraudChart, setFraudChart] = useState({ dates: [], rolling: [] });

  const kpiIcons = [FlaskConical, TrendingUp, CheckCircle];

  useEffect(() => {
    fetch('http://localhost:8000/predict/history')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setAllData(list);
        setMedOptions(Array.from(new Set(list.map((r) => r.DESCRIPTION_med))).sort());
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!allData.length) return;
    const filtered = allData.filter((r) => {
      const inRange =
        dateRange === 'all' || dayjs().diff(dayjs(r.timestamp), 'day') <= Number(dateRange);
      const medMatch = medication === 'All' || r.DESCRIPTION_med === medication;
      return inRange && medMatch;
    });

    setFlagged(
      filtered.map((r, i) => ({
        id: `RX${String(i + 1).padStart(3, '0')}`,
        patient: r.PATIENT_med,
        status: r.fraud === 'True' || r.fraud === true ? 'Flagged' : 'Cleared',
        risk: Math.min(5, Math.round(Number(r.risk_score) / 20)),
        doctor: r.PROVIDER,
      }))
    );

    const fraud = filtered.filter((r) => r.fraud === 'True' || r.fraud === true);
    const thisMonth = dayjs();
    const prevMonth = dayjs().subtract(1, 'month');
    const monthlyFraud = fraud.filter((r) => dayjs(r.timestamp).isSame(thisMonth, 'month')).length;
    const prevFraud = fraud.filter((r) => dayjs(r.timestamp).isSame(prevMonth, 'month')).length;
    const change = monthlyFraud - prevFraud;
    const changePct = prevFraud ? Math.round((change / prevFraud) * 100) : 0;
    const detection = filtered.length ? Math.round((fraud.length / filtered.length) * 100) : 0;

    setKpis([
      { label: 'Monthly Fraud Cases', value: monthlyFraud, percent: monthlyFraud, color: '#f472b6' },
      { label: 'Monthly Fraud Change', value: change, percent: changePct, color: '#a78bfa' },
      { label: 'Fraud Detection Rate', value: `${detection}%`, percent: detection, color: '#34d399' },
    ]);

    const daily = {};
    filtered.forEach((r) => {
      const d = dayjs(r.timestamp).format('YYYY-MM-DD');
      const score = Number(r.risk_score);
      if (!daily[d]) daily[d] = [];
      daily[d].push(score);
    });
    const dates = Object.keys(daily).sort();
    const rolling = dates.map((_, i) => {
      const win = dates.slice(Math.max(0, i - 6), i + 1);
      const all = win.flatMap((day) => daily[day]);
      const avg = all.reduce((a, b) => a + b, 0) / all.length;
      return Number(avg.toFixed(2));
    });
    setFraudChart({ dates, rolling });
  }, [allData, dateRange, medication]);

  return (
    <div className="space-y-8">
      <section className="max-h-[80vh] py-10 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
        <h1 className="text-3xl md:text-4xl font-bold">
          AI-Powered. Fraud-Safe. Trust-Driven Prescriptions.
        </h1>
        <p className="text-sm md:text-lg">
          Detect, Prevent, and Act on Prescription Anomalies in Real Time.
        </p>
        <div className="flex space-x-4">
          <Link
            to="/signup"
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md"
          >
            Try Demo
          </Link>
          <Link
            to="/mission"
            className="border border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white px-4 py-2 rounded-md"
          >
            Learn More
          </Link>
        </div>
      </section>
      <section className="bg-gradient-to-r from-gray-900 to-black text-white rounded-lg p-6 shadow mb-8">
        <h2 className="text-2xl font-bold" style={{ color: '#2F5597' }}>Fraud Detection Overview</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-gray-700 p-1 rounded text-sm"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="all">All</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Medication Type</label>
            <select
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              className="bg-gray-700 p-1 rounded text-sm"
            >
              <option value="All">All</option>
              {medOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Top KPI Cards */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-700 rounded" />
          ))}
        </div>
      ) : (
      <div className="grid gap-6 md:grid-cols-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpiIcons[idx];
          const up = Number(kpi.percent) >= 0;
          return (
            <div
              key={kpi.label}
              className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-transform hover:scale-105 flex items-center justify-between"
              title={kpi.label}
            >
              <div className="space-y-1">
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Icon className="w-4 h-4" /> {kpi.label}
                </p>
                <p className="text-2xl font-semibold text-white">{kpi.value}</p>
                <p className={`flex items-center text-sm ${up ? 'text-green-500' : 'text-red-500'}`}> 
                  <ArrowUpRight className={`w-4 h-4 ${up ? '' : 'rotate-180'}`} /> {Math.abs(kpi.percent)}%
                </p>
              </div>
              <div className="w-20 h-20" title={`${kpi.percent}%`}>
                <RadialProgress value={Number(kpi.percent)} color={kpi.color} />
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Fraud Trends */}
      <div className="bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-2xl font-semibold text-white text-center mt-6 mb-4">
          Fraud Risk Score Trend
        </h3>

        <Plot
          data={[
            {
              x: fraudChart.dates,
              y: fraudChart.rolling,
              type: 'scatter',
              mode: 'lines+markers',
              line: { color: '#10b981' },
              hovertext: fraudChart.rolling.map((v, i, arr) =>
                i > 0 && i < arr.length - 1 && v === arr[i - 1] && v === arr[i + 1]
                  ? 'No fraud events recorded'
                  : v
              ),
              hoverinfo: 'text+x',
            },
          ]}
          layout={{
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#fff' },
            margin: { t: 30, r: 10, l: 40, b: 40 },
            yaxis: { title: 'Avg Fraud Score' },
          }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Flagged Prescriptions Table */}
      <div className="bg-gray-800 p-6 rounded-lg shadow overflow-x-auto">
        <div className="mb-4 flex justify-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by ID, patient or doctor"
              className="bg-gray-700 pl-8 pr-3 py-1 rounded text-sm placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-gray-800">
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
            {flagged
              .filter((r) =>
                [r.id, r.patient, r.doctor]
                  .join(' ')
                  .toLowerCase()
                  .includes(filter.toLowerCase())
              )
              .map((row) => (
              <>
                <tr
                  key={row.id}
                  className="border-t hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                >
                  <td className="py-2 font-medium">{row.id}</td>
                  <td className="py-2">{row.patient}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${row.status === 'Flagged' ? 'bg-red-600' : 'bg-green-600'}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="w-24 h-2 bg-gray-700 rounded">
                      <div
                        className="h-2 rounded bg-yellow-400"
                        style={{ width: `${(row.risk / 5) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="py-2">
                    {row.status === 'Flagged' && <AlertTriangle className="text-red-600 w-5 h-5" />}
                  </td>
                  <td className="py-2 flex items-center gap-1">
                    <UserCircle className="w-5 h-5 text-gray-400" /> {row.doctor}
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button className="bg-green-600 text-white px-2 py-1 rounded-md text-xs hover:bg-green-500">Resolve</button>
                      <button className="bg-red-600 text-white px-2 py-1 rounded-md text-xs hover:bg-red-500">Escalate</button>
                      <button className="bg-gray-700 text-white px-2 py-1 rounded-md text-xs hover:bg-gray-600">Review</button>
                    </div>
                  </td>
                </tr>
                {expanded === row.id && (
                  <tr className="bg-gray-700 text-gray-200">
                    <td colSpan="7" className="p-3 text-sm">
                      Prescription details and doctor notes for {row.patient}.
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
