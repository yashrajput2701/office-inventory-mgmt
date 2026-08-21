import type { OrderStatus } from '../types';

const COLORS: Record<OrderStatus, string> = {
  DRAFT: '#8a8a8a',
  SUBMITTED: '#b8860b',
  COMPLETED: '#1e7d32',
  REJECTED: '#c62828',
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className="status-badge" style={{ backgroundColor: COLORS[status] }}>
      {status}
    </span>
  );
}
