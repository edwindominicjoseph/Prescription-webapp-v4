export default function StatusBadge({ flag_status }) {
  if (!flag_status) return null;
  const status = flag_status.trim();
  const classes = {
    Flagged: 'bg-red-600',
    Cleared: 'bg-green-600',
    RARE: 'bg-yellow-400 text-black',
  };
  if (!classes[status]) return null;
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${classes[status]}`}>{status}</span>
  );
}
