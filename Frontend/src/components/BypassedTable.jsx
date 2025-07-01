import PropTypes from 'prop-types';

export default function BypassedTable({ rows }) {
  if (!rows.length) {
    return (
      <p className="text-center text-sm text-gray-400">No bypassed prescriptions yet.</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left text-gray-300">
          <tr>
            <th className="py-2">PATIENT_NAME</th>
            <th className="py-2">MEDICATION</th>
            <th className="py-2">STATUS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="py-2">{r.PATIENT_NAME}</td>
              <td className="py-2">{r.MEDICATION}</td>
              <td className="py-2">{r.STATUS}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

BypassedTable.propTypes = {
  rows: PropTypes.array.isRequired,
};
