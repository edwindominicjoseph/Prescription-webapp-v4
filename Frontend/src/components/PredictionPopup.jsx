export default function PredictionPopup({ result, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white text-gray-900 rounded-lg p-6 w-80 max-w-full">
        <h2 className="text-xl font-semibold mb-4">Prediction Result</h2>
        <p className="mb-1"><span className="font-medium">Risk Score:</span> {result.risk_score}</p>
        <p className="mb-1"><span className="font-medium">Medication Risk:</span> {result.medication_risk}</p>
        <p>
          <span className="font-medium">Fraudulent:</span>
          <span className={result.fraud || result.fraudulent ? 'text-red-600 font-semibold ml-1' : 'text-black ml-1'}>
            {result.fraud || result.fraudulent ? 'Yes' : 'No'}
          </span>
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
