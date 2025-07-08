import PropTypes from 'prop-types';
import ReactSpeedometer from 'react-d3-speedometer';

export default function AverageRiskGauge({ value }) {
  const stops = [0, 1.5, 3.5, 5];
  return (
    <div
      className="relative flex flex-col items-center justify-center"
      title="Average fraud severity across recent flagged prescriptions."
    >
      <ReactSpeedometer
        minValue={0}
        maxValue={5}
        value={value}
        customSegmentStops={stops}
        segmentColors={["#22c55e", "#eab308", "#ef4444"]}
        ringWidth={12}
        width={160}
        height={120}
        needleColor="#f3f4f6"
        needleTransition="easeQuadInOut"
        needleTransitionDuration={1000}
        currentValueText=""
        textColor="#d1d5db"
        maxSegmentLabels={6}
        labelFontSize="10px"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-xl font-semibold text-white">{value.toFixed(2)}</div>
        <div className="text-sm text-slate-400">out of 5</div>
      </div>
    </div>
  );
}

AverageRiskGauge.propTypes = {
  value: PropTypes.number.isRequired,
};
