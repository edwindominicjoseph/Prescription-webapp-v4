import PropTypes from 'prop-types';
import ReactSpeedometer from 'react-d3-speedometer';

export default function AverageRiskGauge({ value }) {
  return (
    <ReactSpeedometer
      minValue={0}
      maxValue={5}
      value={value}
      segments={3}
      segmentColors={["#10b981", "#facc15", "#ef4444"]}
      needleColor="#e5e7eb"
      ringWidth={20}
      textColor="#ffffff"
      width={140}
      height={100}
      currentValueText=""
    />
  );
}

AverageRiskGauge.propTypes = {
  value: PropTypes.number.isRequired,
};
