import { useEffect, useRef } from 'react';

export default function TrendingBanner() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let frameId;
    const step = () => {
      container.scrollLeft += 1;
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        container.scrollLeft = 0;
      }
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const items = [
    '💊 Pregabalin misuse spikes in urban clinics',
    '♻️ Pharma companies adopt sustainable packaging',
    '📈 Opioid prescriptions flagged for anomaly',
  ];

  return (
    <div className="bg-gradient-to-r from-pink-500 to-yellow-500 overflow-hidden">
      <div
        ref={scrollRef}
        className="whitespace-nowrap overflow-x-scroll no-scrollbar py-2"
      >
        {items.map((item, idx) => (
          <span key={idx} className="text-white font-bold mx-4">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
