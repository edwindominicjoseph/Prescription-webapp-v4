import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Star, AlertTriangle } from 'lucide-react';

export default function FlaggedTable({ rows, statusFilter, onStatusChange, search, onSearchChange, onReview }) {
  const filtered = useMemo(() => {
    return rows
      .filter(r => (statusFilter === 'All' ? true : r.status === statusFilter))
      .filter(r =>
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.patient.toLowerCase().includes(search.toLowerCase())
      );
  }, [rows, statusFilter, search]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          {['All','Flagged','Cleared'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => onStatusChange(st)}
              className={`px-2 py-1 text-xs rounded ${statusFilter===st ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
            >
              {st}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by ID or patient"
          className="bg-gray-700 p-1 rounded text-sm placeholder-gray-400"
        />
      </div>
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
            {filtered.map(row => (
              <tr key={row.id} className="border-t hover:bg-slate-700 hover:ring cursor-pointer">
                <td className="py-2 font-medium">{row.id}</td>
                <td className="py-2">{row.patient}</td>
                <td className="py-2">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${row.rare ? 'bg-yellow-600 text-white' : row.status==='Flagged' ? 'bg-red-600 text-white' : 'bg-green-500 text-white'}`}
                  >
                    {row.rare ? 'Rare condition' : row.status}
                  </span>
                </td>
                <td className="py-2" title={`${row.risk} out of 5 risk level`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 inline ${i < row.risk ? 'text-yellow-400' : 'text-gray-400'}`} />
                  ))}
                </td>
                <td className="py-2">
                  {row.status==='Flagged' && <AlertTriangle className="text-red-600 w-5 h-5" title="Flagged due to high dose" />}
                </td>
                <td className="py-2">{row.doctor}</td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => onReview(row)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-500"
                  >
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

FlaggedTable.propTypes = {
  rows: PropTypes.array.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onReview: PropTypes.func.isRequired,
};
