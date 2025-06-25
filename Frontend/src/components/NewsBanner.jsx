import React from 'react';

export default function NewsBanner() {
  const items = [
    '💊 New AI update improves detection accuracy',
    '📉 Fraudulent prescriptions down 20% this month',
    '♻️ Recycled packaging initiative expands nationwide',
  ];

  return (
    <div className="bg-gradient-to-r from-pink-500 to-yellow-500 overflow-hidden">
      <div className="flex whitespace-nowrap animate-scroll-left">
        {items.concat(items).map((item, idx) => (
          <span key={idx} className="mx-4 font-bold text-white">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
