import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MiniFraudFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('/api/recent-fraud-predictions')
      .then(res => {
        setItems(res.data.slice(0, 5));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load fraud feed');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const formatDate = ts => {
    const date = new Date(ts);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const fraudColor = type => {
    if (type.includes('Duplicate')) return 'bg-red-600';
    if (type.includes('Rare')) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const scoreColor = score => {
    if (score > 90) return 'bg-red-600';
    if (score > 75) return 'bg-orange-500';
    return 'bg-green-600';
  };

  return (
    <div className="max-h-[380px] overflow-y-auto">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-[#374151] text-white rounded p-3 hover:bg-[#4b5563] mb-3"
        >
          <div className="font-bold mb-1">{item.DESCRIPTION_med}</div>
          <span
            className={`text-xs px-2 py-1 rounded ${fraudColor(
              item.FRAUD_TYPE,
            )}`}
          >
            {item.FRAUD_TYPE}
          </span>
          <div className="mt-2 text-sm">
            <span className="mr-1">👨‍⚕️</span>
            {item.DOCTOR_med} - {item.ORG_med}
          </div>
          <div className="text-xs mt-1">
            🕒 {formatDate(item.prediction_time)}
          </div>
          <span
            className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${scoreColor(
              item.risk_score,
            )}`}
          >
            {item.risk_score}
          </span>
        </div>
      ))}
    </div>
  );
}
