import PropTypes from 'prop-types';

export default function PredictionPopup({ result, onClose }) {
  if (!result) return null;
  const fraudulent = result.fraud === true || result.fraud === 'True' || result.fraud === 'Yes';
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white rounded-lg p-6 w-80 text-gray-900 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">Prediction Result</h2>
        <p className="mb-2">Risk Score: <span className="font-medium">{result.risk_score}</span></p>
        <p className="mb-2">Medication Risk: <span className="font-medium">{result.medication_risk}</span></p>
        <p className={`mb-2 font-medium ${fraudulent ? 'text-red-600' : 'text-black'}`}>Fraudulent: {fraudulent ? 'Yes' : 'No'}</p>
        {Array.isArray(result.flags) && result.flags.length > 0 && (
          <div className="mb-4">
            <p className="font-medium">Flags:</p>
            <ul className="list-disc list-inside text-sm mt-1">
              {result.flags.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          </div>
        )}
        <button onClick={onClose} className="bg-gray-800 text-white w-full py-2 rounded hover:bg-gray-700">Close</button>
      </div>
    </div>
  );
}

PredictionPopup.propTypes = {
  result: PropTypes.shape({
    risk_score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    medication_risk: PropTypes.string,
    fraud: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    flags: PropTypes.arrayOf(PropTypes.string),
  }),
  onClose: PropTypes.func.isRequired,
};
