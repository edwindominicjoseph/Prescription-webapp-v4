import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

export default function RiskStars({ score }) {
  return (
    <span className="inline-flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < score ? 'text-yellow-400' : 'text-gray-500'}`} />
      ))}
    </span>
  );
}

RiskStars.propTypes = {
  score: PropTypes.number.isRequired,
};
