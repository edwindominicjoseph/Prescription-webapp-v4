import PropTypes from 'prop-types';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function RadialProgress({ value, color }) {
  return (
    <CircularProgressbar
      value={value}
      text={`${value}%`}
      strokeWidth={12}
      styles={buildStyles({
        textColor: '#ffffff',
        pathColor: color,
        trailColor: '#374151',
      })}
    />
  );
}

RadialProgress.propTypes = {
  value: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};
