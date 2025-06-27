import { useEffect, useState } from 'react';

const headlines = [
  '🔔 New study shows rise in prescription fraud post-COVID.',
  '💊 FDA flags 3 new high-risk opioids for misuse.',
  '⚠️ Pharmacy chains warned for suspicious refill patterns.',
  '🧠 AI now detects fraudulent prescriptions with 95% accuracy.',
  '📉 Controlled substances usage down by 10% after policy changes.',
];

export default function NewsTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % headlines.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-gradient-to-r from-orange-500 to-yellow-400 overflow-hidden h-10 flex items-center">
      <div key={index} className="whitespace-nowrap text-white font-medium animate-slide px-4">
        {headlines[index]}
      </div>
    </div>
  );
}
