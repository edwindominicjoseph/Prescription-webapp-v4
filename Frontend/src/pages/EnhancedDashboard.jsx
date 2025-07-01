import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import StatusCard from '../components/StatusCard';
import FraudMedVisualization from '../components/FraudMedVisualization';
import FlaggedTable from '../components/FlaggedTable';
import RiskTrendChart from '../components/RiskTrendChart';
import { prescriptions } from '../data/mockPrescriptions';
import { lastUpdated } from '../utils/format';

export default function EnhancedDashboard() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [selected, setSelected] = useState(null);

  const fraudCount = prescriptions.filter(p => p.status === 'Flagged').length;
  const clearedCount = prescriptions.filter(p => p.status === 'Cleared').length;
  const total = prescriptions.length;


  const medStats = {};
  prescriptions.forEach(p => { medStats[p.medication] = (medStats[p.medication]||0) + 1; });
  const labels = Object.keys(medStats);
  const counts = Object.values(medStats);
  const barData = { labels, datasets: [{ data: counts, backgroundColor: '#dc2626', borderWidth:0 }] };
  const donutMeds = { labels, datasets: [{ data: counts, backgroundColor: ['#f87171','#fb923c','#facc15'], borderWidth:0 }] };

  const trendData = { labels: prescriptions.map(p => new Date(p.timestamp).toLocaleTimeString()), datasets: [{ data: prescriptions.map(p => p.risk*20), borderColor:'#dc2626', backgroundColor:'rgba(220,38,38,0.2)', tension:0.4, fill:true, pointRadius:0 }] };

  return (
    <div className="space-y-6">
      <h1 className="text-center text-3xl font-bold">Enhanced Dashboard</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <StatusCard title="Total Fraud Cases" count={fraudCount} pct={(fraudCount/total)*100} color="#dc2626" />
        <StatusCard title="Cleared Cases" count={clearedCount} pct={(clearedCount/total)*100} color="#0ea5e9" />
        <StatusCard title="Total Prescriptions" count={total} pct={100} color="#2dd4bf" />
      </div>
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Fraud Medications</h3>
        <FraudMedVisualization donutData={donutMeds} barData={barData} />
      </div>
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Risk Trend</h3>
        <RiskTrendChart data={trendData} lastUpdated={lastUpdated()} />
      </div>
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Patient Prescriptions</h3>
        <FlaggedTable rows={prescriptions} statusFilter={statusFilter} onStatusChange={setStatusFilter} search={search} onSearchChange={setSearch} onReview={setSelected} sortField={sortField} onSortChange={setSortField} />
      </div>
      <AnimatePresence>
        {selected && (
          <Motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setSelected(null)}>
            <Motion.div className="bg-gray-800 p-6 rounded-lg w-80" onClick={e => e.stopPropagation()} initial={{scale:0.8}} animate={{scale:1}} exit={{scale:0.8}}>
              <h4 className="font-semibold mb-2">{selected.id}</h4>
              <p className="text-sm mb-2">Patient: {selected.patient}</p>
              <p className="text-sm mb-2">Doctor: {selected.doctor}</p>
              <div className="flex gap-2 mt-4">
                <button type="button" className="bg-yellow-600 text-white px-3 py-1 rounded-md text-xs" onClick={() => setSelected(null)}>Bypass</button>
                <button type="button" className="bg-red-600 text-white px-3 py-1 rounded-md text-xs" onClick={() => setSelected(null)}>Confirm Fraud</button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
