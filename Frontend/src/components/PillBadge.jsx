import PropTypes from 'prop-types';

const styles = {
  Flagged: 'bg-red-600 text-white',
  Cleared: 'bg-green-600 text-white',
  RARE: 'bg-yellow-500 text-black',
};

export default function PillBadge({ label }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[label] || 'bg-gray-600 text-white'}`}>{label}</span>
  );
}

PillBadge.propTypes = {
  label: PropTypes.string.isRequired,
};
