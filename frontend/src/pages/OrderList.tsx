import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Order, OrderStatus } from '../types';
import StatusBadge from '../components/StatusBadge';

const FILTERS: Array<OrderStatus | 'ALL'> = ['ALL', 'DRAFT', 'SUBMITTED', 'COMPLETED', 'REJECTED'];

export default function OrderList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get<Order[]>('/orders');
      setOrders(data);
    } catch {
      setError('Could not load requests.');
    } finally {
      setLoading(false);
    }
  };

  const visible = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="page-header">
        <h1>{user?.role === 'CREATOR' ? 'My Requests' : 'Purchase Requests'}</h1>
        <div className="filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={filter === f ? 'chip chip-active' : 'chip'}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Items</th>
              <th>Expiry</th>
              <th>Created By</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => (
              <tr key={o.id}>
                <td><Link to={`/orders/${o.id}`}>#{o.id}</Link></td>
                <td><StatusBadge status={o.status} /></td>
                <td>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                <td>{o.expiryDate}</td>
                <td>{o.createdByFullName}</td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">No requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
