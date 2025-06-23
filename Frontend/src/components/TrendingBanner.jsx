import { useEffect, useRef } from 'react';

export default function TrendingBanner() {
  const containerRef = useRef(null);
  const headlines = [
    '💊 Spike in pregabalin misuse reported in urban clinics',
    '🌿 WHO launches green initiative in pharma supply chains',
    '📈 12% rise in synthetic opioid prescriptions flagged',
    '🔬 New AI tool predicts medication interactions with high accuracy',
    '🚑 Overuse of antibiotics in emergency departments under review',
  ];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      el.scrollLeft += 1;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
        el.scrollLeft = 0;
      }
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-pink-500 to-yellow-500 py-1">
      <div
        ref={containerRef}
        className="flex overflow-x-scroll whitespace-nowrap no-scrollbar text-white text-sm"
      >
        {headlines.map((h, i) => (
          <span key={i} className="px-4 flex-shrink-0">
            {h}
          </span>
        ))}
      </div>
    </div>
  );
}
