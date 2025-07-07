import { useEffect, useMemo, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import FraudInsightsPanel from "../components/FraudInsightsPanel";
import RiskTrendChart from "../components/RiskTrendChart";
import FlaggedTable from "../components/FlaggedTable";
import MiniFraudFeed from "../components/MiniFraudFeed";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [fraudPct, setFraudPct] = useState(0);
  const [fraudCount, setFraudCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ fraud: 0, cleared: 0, rare: 0 });
  const [trendChart, setTrendChart] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        borderColor: "#dc2626",
        backgroundColor: "rgba(220,38,38,0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
    ],
  });
  const [lastUpdated, setLastUpdated] = useState("");
  const [summaryUpdated, setSummaryUpdated] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const handleBypass = async () => {
    if (!selectedRow) return;
    try {
      const res = await fetch("http://localhost:8000/predict/bypass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: selectedRow.patient }),
      });
      if (res.ok) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === selectedRow.id
              ? { ...r, rare: true, status: "Cleared" }
              : r,
          ),
        );
        setSelectedRow(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportCsv = () => {
    const header = "id,patient,doctor,status\n";
    const rowsData = filteredRows
      .filter((r) => r.status === "Flagged")
      .map((r) => `${r.id},${r.patient},${r.doctor},${r.status}`)
      .join("\n");
    const blob = new Blob([header + rowsData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flagged.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetch("http://localhost:8000/predict/history")
      .then((res) => res.json())
      .then((data) => {
        setRows(
          data.map((r, i) => ({
            id: `RX${String(i + 1).padStart(3, "0")}`,
            patient: r.PATIENT_med,
            status:
              r.fraud === "True" || r.fraud === true ? "Flagged" : "Cleared",
            risk: Math.min(5, Math.round(Number(r.risk_score) / 20)),
            doctor: r.PROVIDER,
            medication: r.DESCRIPTION_med,
            rare: Array.isArray(r.flags)
              ? r.flags.includes(
                  "Patient is exempted due to a known rare condition",
                )
              : r.flags?.includes("rare condition"),
          })),
        );
        const totalRecords = data.length;
        const fraudRecords = data.filter(
          (d) => d.fraud === "True" || d.fraud === true,
        ).length;
        setTotal(totalRecords);
        setFraudCount(fraudRecords);
        setFraudPct(
          totalRecords ? Math.round((fraudRecords / totalRecords) * 100) : 0,
        );

        const sortedRows = [...data]
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .slice(-20);
        setTrendChart((prev) => ({
          ...prev,
          labels: sortedRows.map((r) =>
            new Date(r.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          ),
          datasets: [
            {
              ...prev.datasets[0],
              data: sortedRows.map((r) => Number(r.risk_score)),
            },
          ],
        }));
        setLastUpdated(new Date().toLocaleString());
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const fetchSummary = () => {
      fetch("http://localhost:8000/analytics/summary")
        .then((res) => res.json())
        .then((data) => {
          setSummary(data);
          const totalCount = data.fraud + data.cleared + data.rare;
          setTotal(totalCount);
          setFraudCount(data.fraud);
          setFraudPct(
            totalCount ? Math.round((data.fraud / totalCount) * 100) : 0,
          );
          setSummaryUpdated(new Date().toLocaleString());
        })
        .catch((err) => console.error(err));
    };
    fetchSummary();
    const id = setInterval(fetchSummary, 10000);
    return () => clearInterval(id);
  }, []);

  const donutFraudData = {
    labels: ["Fraud", "Other"],
    datasets: [
      {
        data: [fraudPct, 100 - fraudPct],
        backgroundColor: ["#dc2626", "#e5e7eb"],
        borderWidth: 0,
      },
    ],
  };
  const donutMiddleData = {
    labels: ["Risk", "Other"],
    datasets: [
      {
        data: [fraudPct, 100 - fraudPct],
        backgroundColor: ["#0ea5e9", "#e5e7eb"],
        borderWidth: 0,
      },
    ],
  };
  const donutTotalData = {
    labels: ["Fraud", "Cleared", "Rare"],
    datasets: [
      {
        data: [summary.fraud, summary.cleared, summary.rare],
        backgroundColor: ["#dc2626", "#16a34a", "#eab308"],
        borderWidth: 0,
      },
    ],
  };

  const filteredRows = useMemo(() => {
    return rows
      .filter((r) =>
        statusFilter === "All" ? true : r.status === statusFilter,
      )
      .filter(
        (r) =>
          r.id.toLowerCase().includes(search.toLowerCase()) ||
          r.patient.toLowerCase().includes(search.toLowerCase()),
      );
  }, [rows, statusFilter, search]);

  return (
    <div className="space-y-6">
      <h1
        className="text-center font-bold text-3xl md:text-4xl"
        style={{ color: "#2F5597" }}
      >
        AI-Powered Prescription Fraud Detection Dashboard
      </h1>
      <div className="md:grid md:grid-cols-[55%_45%] gap-6">
        <div className="space-y-6">
          {/* Row 1 */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#2F5597" }}
                >
                  Total Fraud Cases
                </p>
                <p className="text-2xl font-bold text-red-500">{fraudCount}</p>
              </div>
              <div className="w-20 h-20">
                <Doughnut
                  data={donutFraudData}
                  options={{
                    plugins: { legend: { display: false } },
                    cutout: "70%",
                  }}
                />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-center">
              <div className="w-20 h-20">
                <Doughnut
                  data={donutMiddleData}
                  options={{
                    plugins: { legend: { display: false } },
                    cutout: "70%",
                  }}
                />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#2F5597" }}
                >
                  Total Prescriptions
                </p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 relative">
                  <Doughnut
                    data={donutTotalData}
                    options={{
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (ctx) => {
                              const total = ctx.dataset.data.reduce(
                                (a, b) => a + b,
                                0,
                              );
                              const val = ctx.parsed;
                              const pct = total
                                ? ((val / total) * 100).toFixed(1)
                                : 0;
                              return `${ctx.label}: ${val} (${pct}%)`;
                            },
                          },
                        },
                      },
                      cutout: "70%",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs">
                    Total: {total}
                  </div>
                </div>
                <div className="text-xs mt-1 flex gap-1">
                  <span className="text-red-400">● Fraud</span>
                  <span className="text-green-400">● Cleared</span>
                  <span className="text-yellow-400">● Rare</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Last updated {summaryUpdated}
                </p>
              </div>
            </div>
          </div>

          {/* Fraud Insights */}
          <FraudInsightsPanel />

          {/* Risk Trend */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-4" style={{ color: "#2F5597" }}>
              Real Time Risk Score Trend
            </h3>
            <RiskTrendChart data={trendChart} lastUpdated={lastUpdated} />
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-gray-800 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold" style={{ color: "#2F5597" }}>
            Patient Prescriptions
          </h3>
          <FlaggedTable
            rows={filteredRows}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            search={search}
            onSearchChange={setSearch}
            onReview={(r) => setSelectedRow(r)}
          />
          <h3 className="font-semibold" style={{ color: "#2F5597" }}>
            Recent Flagged Medicines
          </h3>
          <MiniFraudFeed />
        </div>
      </div>
      <button
        type="button"
        onClick={exportCsv}
        className="fixed bottom-4 left-4 bg-green-600 text-white p-3 rounded-full shadow hover:bg-green-500"
      >
        Export
      </button>
      {selectedRow && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedRow(null)}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-semibold mb-2" style={{ color: "#2F5597" }}>
              Prescription {selectedRow.id}
            </h4>
            <p className="text-sm mb-2">Patient: {selectedRow.patient}</p>
            <p className="text-sm mb-2">Doctor: {selectedRow.doctor}</p>
            <p className="text-sm mb-2">Medication: {selectedRow.medication}</p>
            <p className="text-sm mb-4">Status: {selectedRow.status}</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-500 text-xs"
                onClick={handleBypass}
              >
                Bypass
              </button>
              <button
                type="button"
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-500 text-xs"
                onClick={() => setSelectedRow(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
