import PropTypes from 'prop-types';
import ReactSpeedometer, { CustomSegmentLabelPosition } from 'react-d3-speedometer';

function mapScoreToGauge(value) {
  if (value <= 1.5) {
    return (value / 1.5) * 1.25;
  }
  if (value <= 3.5) {
    return value - 0.25;
  }
  return 3.25 + ((value - 3.5) * 1.75) / 1.5;
}

export default function AverageRiskGauge({ value }) {
  const stops = [0, 1.25, 3.25, 5];
  const gaugeValue = mapScoreToGauge(value);
  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[200px] group" title="Average fraud severity across recent flagged prescriptions.">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-gray-700 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100">
        This reflects the average fraud severity across all flagged prescriptions.
      </div>
      <ReactSpeedometer
        minValue={0}
        maxValue={5}
        value={gaugeValue}
        customSegmentStops={stops}
        segmentColors={["#22c55e", "#eab308", "#ef4444"]}
        ringWidth={12}
        fluidWidth
        height={120}
        needleColor="#f3f4f6"
        needleTransition="easeQuadInOut"
        needleTransitionDuration={300}
        currentValueText=""
        textColor="#d1d5db"
        customSegmentLabels={[
          { text: 'Low', position: CustomSegmentLabelPosition.Outside, fontSize: '11px' },
          { text: 'Medium', position: CustomSegmentLabelPosition.Outside, fontSize: '11px' },
          { text: 'High', position: CustomSegmentLabelPosition.Outside, fontSize: '11px' },
        ]}
        labelFontSize="11px"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 pointer-events-none">
        <p className="text-white text-2xl font-semibold mt-2">{value.toFixed(2)}</p>
        <p className="text-slate-400 text-sm">out of 5</p>
      </div>
    </div>
  );
}

AverageRiskGauge.propTypes = {
  value: PropTypes.number.isRequired,
};
