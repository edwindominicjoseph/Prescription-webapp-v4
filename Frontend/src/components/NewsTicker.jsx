const headlines = [
  '🔔 New study shows rise in prescription fraud post-COVID.',
  '💊 FDA flags 3 new high-risk opioids for misuse.',
  '⚠️ Pharmacy chains warned for suspicious refill patterns.',
  '🧠 AI now detects fraudulent prescriptions with 95% accuracy.',
  '📉 Controlled substances usage down by 10% after policy changes.',
];

export default function NewsTicker() {
  const text = headlines.join(' • ');

  return (
    <div className="bg-gradient-to-r from-orange-500 to-yellow-400 overflow-hidden h-10 flex items-center w-full">
      <div className="ticker whitespace-nowrap text-white font-medium px-4">
        <span className="mx-4">{text}</span>
        <span className="mx-4" aria-hidden="true">
          {text}
        </span>
      </div>
    </div>
  );
}
