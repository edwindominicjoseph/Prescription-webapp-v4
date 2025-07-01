export function formatDate(ts) {
  return new Date(ts).toLocaleString();
}

export function lastUpdated() {
  return formatDate(Date.now());
}
