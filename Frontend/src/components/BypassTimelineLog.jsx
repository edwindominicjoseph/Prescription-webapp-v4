import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';

export default function BypassTimelineLog() {
  const [range, setRange] = useState('30');
  const [data, setData] = useState([]);

  useEffect(() => {
    const url =
      range === 'all'
        ? 'http://localhost:8000/bypass-logs'
        : `http://localhost:8000/bypass-logs?days=${range}`;
    console.log('Fetching bypass logs from', url);
    fetch(url)
      .then((res) => res.json())
      .then((items) => {
        console.log('Fetched bypass logs:', items);
        setData(items);
      })
      .catch((err) => console.error('Failed to fetch bypass logs', err));
  }, [range]);

  const filtered = useMemo(() => {
    let records = data.filter((d) => {
      const status = (d.status || '').toLowerCase();
      return status.includes('bypass') || status === 'rare';
    });
    console.log('Filtered bypass records:', records);
    records = records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return records;
  }, [data]);

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
              const rxId = item.rx_id ?? `RX${String(idx + 1).padStart(3, '0')}`;
              const provider = item.doctor ?? item.PROVIDER;
              const patient = item.patient ?? item.PATIENT_med;
              const medication = item.medication ?? item.DESCRIPTION_med;
              const details = provider
                ? `Bypassed by ${provider} for ${patient}`
                : 'Bypassed (RARE)';
              return (
                <li key={idx} className="relative">
                  <span className="absolute -left-2 top-1 text-yellow-400">&#9679;</span>
                  <span className="mr-2">{date}</span>
                  <span className="text-yellow-400">&#9679;</span>{' '}
                  <span className="font-semibold">{rxId}</span> - {details}
                  {medication ? ` - ${medication}` : ''}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

