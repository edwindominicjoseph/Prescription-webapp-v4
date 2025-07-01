import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import PillBadge from './PillBadge';
import RiskStars from './RiskStars';

export default function FlaggedTable({ rows, statusFilter, onStatusChange, search, onSearchChange, onReview, sortField, onSortChange }) {
  const filtered = useMemo(() => {
    const base = rows
      .filter(r => (statusFilter === 'All' ? true : r.status === statusFilter))
      .filter(r =>
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.patient.toLowerCase().includes(search.toLowerCase())
      );
    if (!sortField) return base;
    const sorted = [...base].sort((a, b) => {
      if (sortField === 'risk') return b.risk - a.risk;
      if (sortField === 'doctor') return a.doctor.localeCompare(b.doctor);
      if (sortField === 'time') return new Date(b.timestamp) - new Date(a.timestamp);
      return 0;
    });
    return sorted;
  }, [rows, statusFilter, search, sortField]);

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
              <th className="py-2">
                <button type="button" onClick={() => onSortChange('risk')}>Fraud Risk</button>
              </th>
              <th className="py-2">Flag</th>
              <th className="py-2">
                <button type="button" onClick={() => onSortChange('doctor')}>Doctor</button>
              </th>
              <th className="py-2">
                <button type="button" onClick={() => onSortChange('time')}>Time</button>
              </th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id} className="border-t hover:bg-slate-700 hover:ring cursor-pointer">
                <td className="py-2 font-medium">{row.id}</td>
                <td className="py-2">{row.patient}</td>
                <td className="py-2">
                  <PillBadge label={row.status} />
                </td>
                <td className="py-2" title={`${row.risk} out of 5 risk level`}>
                  <RiskStars score={row.risk} />
                </td>
                <td className="py-2">
                  {row.status==='Flagged' && <AlertTriangle className="text-red-600 w-5 h-5" title="Flagged due to high dose" />}
                </td>
                <td className="py-2">{row.doctor}</td>
                <td className="py-2">{new Date(row.timestamp).toLocaleString()}</td>
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
  sortField: PropTypes.string,
  onSortChange: PropTypes.func,
};

FlaggedTable.defaultProps = {
  sortField: null,
  onSortChange: () => {},
};
