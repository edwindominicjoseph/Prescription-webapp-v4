import { useState, useEffect } from 'react';

export default function AlertsCarousel() {
  const alerts = [
    '🔔 2 new flagged prescriptions in last 60 minutes',
    '⚠️ High risk medication detected for patient RX103',
    '✅ All systems operational',
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % alerts.length);
    }, 5000);
    return () => clearInterval(id);
  }, [alerts.length]);

  return (
    <div className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white py-2 text-center overflow-hidden">
      <div className="animate-fadeIn" key={index}>{alerts[index]}</div>
    </div>
  );
}
