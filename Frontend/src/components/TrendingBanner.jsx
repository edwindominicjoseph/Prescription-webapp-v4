export default function TrendingBanner() {
  const items = [
    '💊 Pregabalin misuse spikes in urban clinics',
    '♻️ Pharma companies adopt sustainable packaging',
    '📈 Opioid prescriptions flagged for anomaly',
  ];

  return (
    <div className="bg-gradient-to-r from-pink-500 to-yellow-500 overflow-hidden">
      <div className="whitespace-nowrap flex animate-marquee py-2">
        {items.concat(items).map((item, idx) => (
          <span key={idx} className="text-white font-bold mx-4">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
