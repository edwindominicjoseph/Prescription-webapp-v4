import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';

export default function BypassTimelineLog({ data }) {
  const [range, setRange] = useState('30');

  const filtered = useMemo(() => {
    let records = data.filter((d) => d.status === 'RARE');
    records = records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (range !== 'all') {
      const days = Number(range);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      records = records.filter((d) => new Date(d.timestamp) >= cutoff);
    }
    return records;
  }, [data, range]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold" style={{ color: '#2F5597' }}>
          Recent Bypassed Fraud Records
        </h3>
        <select
          className="bg-gray-700 text-sm p-1 rounded"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="text-center text-gray-400">No recent bypass activity</p>
      ) : (
        <div className="h-64 overflow-y-auto">
          <ul className="relative border-l border-gray-600 ml-2 pl-4 space-y-2">
            {filtered.map((item, idx) => {
              const date = format(new Date(item.timestamp), 'MMM d');
              const rxId = `RX${String(idx + 1).padStart(3, '0')}`;
              const details = item.PROVIDER
                ? `Bypassed by ${item.PROVIDER} for ${item.PATIENT_med}`
                : 'Bypassed (RARE)';
              return (
                <li key={idx} className="relative">
                  <span className="absolute -left-2 top-1 text-yellow-400">&#9679;</span>
                  <span className="mr-2">{date}</span>
                  <span className="text-yellow-400">&#9679;</span>{' '}
                  <span className="font-semibold">{rxId}</span> - {details}
                  {item.DESCRIPTION_med ? ` - ${item.DESCRIPTION_med}` : ''}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

BypassTimelineLog.propTypes = {
  data: PropTypes.array.isRequired,
};
