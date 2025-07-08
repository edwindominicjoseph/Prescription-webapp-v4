import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

export default function AvgFraudGauge() {
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8000/predict/history')
      .then(res => res.json())
      .then(list => {
        const scores = list
          .map(r => Number(r.risk_score))
          .filter(n => !Number.isNaN(n));
        if (!scores.length) return;
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        setAvg(Number((avgScore / 20).toFixed(2)));
      })
      .catch(err => console.error(err));
  }, []);

  const color = avg < 1.5 ? '#16a34a' : avg < 3.5 ? '#eab308' : '#dc2626';

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm font-semibold mb-1" style={{ color: '#2F5597' }}>
        Avg. Fraud Risk
      </p>
      <div className="w-24 h-24">
        <Plot
          data={[{
            type: 'indicator',
            mode: 'gauge+number',
            value: avg,
            number: { suffix: ' / 5', valueformat: '.2f', font: { color: '#ffffff' } },
            gauge: {
              axis: { range: [0, 5] },
              bar: { color },
              steps: [
                { range: [0, 1.5], color: '#064e3b' },
                { range: [1.5, 3.5], color: '#78350f' },
                { range: [3.5, 5], color: '#7f1d1d' },
              ],
            },
          }]}
          layout={{
            width: 100,
            height: 80,
            margin: { t: 10, b: 0, l: 10, r: 10 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: '#ffffff' },
          }}
          config={{ displayModeBar: false }}
        />
      </div>
      <p className="text-xs mt-1">{avg.toFixed(2)} / 5</p>
    </div>
  );
}
