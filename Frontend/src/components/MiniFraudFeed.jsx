import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { motion as Motion } from 'framer-motion';
import { User2, Clock } from 'lucide-react';

export default function MiniFraudFeed({ limit = 5 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    axios
      .get('http://localhost:8000/predict/history')
      .then(res => {
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : [];
        const sorted = data
          .sort(
            (a, b) =>
              new Date(b.prediction_time || b.timestamp) -
              new Date(a.prediction_time || a.timestamp)
          )
          .slice(0, limit);
        setItems(sorted);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load feed');
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [limit]);

  const typeColor = type => {
    if (type === 'Duplicate Dispensing') return 'bg-red-600';
    if (type === 'Rare Pattern') return 'bg-yellow-500 text-black';
    return 'bg-orange-500';
  };

  const scoreColor = score => {
    if (Number(score) > 90) return 'bg-red-600';
    if (Number(score) > 75) return 'bg-orange-500';
    return 'bg-green-600';
  };

  if (loading) return <div className="text-center text-gray-300">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="bg-[#1f2937] text-white p-4 rounded-lg shadow max-h-80 overflow-y-auto space-y-3">
      {items.map((item, idx) => (
        <Motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          className="p-3 rounded-lg hover:bg-[#374151]"
        >
          <p className="font-bold text-lg mb-1">{item.DESCRIPTION_med}</p>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor(item.FRAUD_TYPE)}`}>{item.FRAUD_TYPE}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${scoreColor(item.risk_score)}`}>{item.risk_score}</span>
          </div>
          <p className="text-xs flex items-center gap-1">
            <User2 className="w-4 h-4" />
            {item.DOCTOR_med} - {item.ORG_med}
          </p>
          <p className="text-xs flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {new Date(item.prediction_time || item.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })}
          </p>
        </Motion.div>
      ))}
    </div>
  );
}

MiniFraudFeed.propTypes = {
  limit: PropTypes.number,
};
