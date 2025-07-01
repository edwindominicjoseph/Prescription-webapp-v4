import { useEffect, useState } from 'react';

export default function BypassTimelineLog() {
  const [entries, setEntries] = useState([]);
  const [range, setRange] = useState('30');

  useEffect(() => {
    const url = range === 'all' ? 'http://localhost:8000/bypass-logs' : `http://localhost:8000/bypass-logs?days=${range}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setEntries(sorted);
      })
      .catch(err => console.error(err));
  }, [range]);

  const ranges = [
    { label: 'Last 7 days', value: '7' },
    { label: 'Last 30 days', value: '30' },
    { label: 'Last 90 days', value: '90' },
    { label: 'All time', value: 'all' },
  ];

  return (
    <div className="bg-gray-700 p-4 rounded-lg space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold" style={{ color: '#2F5597' }}>
          Bypass Timeline
        </h4>
        <select
          value={range}
          onChange={e => setRange(e.target.value)}
          className="bg-gray-800 text-sm p-1 rounded"
        >
          {ranges.map(r => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <ul className="space-y-1 max-h-60 overflow-y-auto">
        {entries.map((e, i) => (
          <li key={i} className="flex items-center text-sm">
            <span className="w-24 text-gray-300">
              {new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="mx-2">●</span>
            <span className="flex-1">
              {`${e.rx_id} - Bypassed by ${e.doctor} for ${e.patient} - ${e.medication}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
