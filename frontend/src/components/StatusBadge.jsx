export default function StatusBadge({ status = 'Pending' }) {
  const normalized = (status || 'Pending').toLowerCase().replaceAll(' ', '-')
  return <span className={`badge-status status-${normalized}`}>{status}</span>
}

