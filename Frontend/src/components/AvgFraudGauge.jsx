import { useEffect, useState } from 'react';

import ReactSpeedometer, { CustomSegmentLabelPosition } from 'react-d3-speedometer';


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


  const segments = [0, 1.5, 3.5, 5];
  const colors = ['#00e396', '#feb019', '#ff4560'];
  const labels = [
    { text: 'Low', position: CustomSegmentLabelPosition.Inside, color: '#00e396' },
    { text: 'Moderate', position: CustomSegmentLabelPosition.Inside, color: '#feb019' },
    { text: 'High', position: CustomSegmentLabelPosition.Inside, color: '#ff4560' },
  ];


  return (
    <div className="flex flex-col items-center">
      <p className="text-sm font-semibold mb-1" style={{ color: '#2F5597' }}>
        Avg. Fraud Risk
      </p>

      <div className="relative w-full max-w-[200px] drop-shadow-lg">
        <ReactSpeedometer
          maxValue={5}
          value={avg}
          minValue={0}
          customSegmentStops={segments}
          segmentColors={colors}
          customSegmentLabels={labels}
          maxSegmentLabels={0}
          needleColor="#e2e8f0"
          needleTransition="easeElastic"
          needleTransitionDuration={1500}
          ringWidth={20}
          textColor="#ffffff"
          valueTextFontSize="0px"
          fluidWidth
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold text-white drop-shadow-sm">{avg.toFixed(2)}</span>
          <span className="text-xs text-gray-300">out of 5</span>
        </div>
      </div>


    </div>
  );
}
