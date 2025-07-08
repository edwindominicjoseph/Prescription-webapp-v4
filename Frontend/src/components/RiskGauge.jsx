import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';

export default function RiskGauge({ value }) {
  const maxValue = 100;
  const customSegmentLabels = [
    { text: 'Low', position: 'INSIDE', color: '#22c55e' },
    { text: 'Medium', position: 'INSIDE', color: '#eab308' },
    { text: 'High', position: 'INSIDE', color: '#ef4444' },
  ];
  const segments = customSegmentLabels.length;

  return (
    <ReactSpeedometer
      maxValue={maxValue}
      value={value}
      segments={segments}
      customSegmentLabels={customSegmentLabels}
      ringWidth={30}
      needleHeightRatio={0.7}
      needleTransitionDuration={1000}
      needleColor="#374151"
      textColor="#ffffff"
      forceRender
    />
  );
}
