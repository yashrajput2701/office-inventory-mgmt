import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../types';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const [txnReference, setTxnReference] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get<Order>(`/orders/${id}`);
      setOrder(data);
    } catch {
      setError('Could not load this request. It may not exist or you may not have access.');
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    setActionError('');
    try {
      await apiClient.post(`/orders/${id}/submit`);
      await load();
    } catch (e: any) {
      setActionError(e.response?.data?.message ?? 'Could not submit this request.');
    } finally {
      setBusy(false);
    }
  };

  const complete = async () => {
    if (!txnReference.trim()) {
      setActionError('Enter a transaction reference before completing.');
      return;
    }
    setBusy(true);
    setActionError('');
    try {
      await apiClient.post(`/orders/${id}/complete`, { txnReference });
      await load();
    } catch (e: any) {
      setActionError(e.response?.data?.message ?? 'Could not complete this request.');
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!rejectNote.trim()) {
      setActionError('Add a note explaining the rejection.');
      return;
    }
    setBusy(true);
    setActionError('');
    try {
      await apiClient.post(`/orders/${id}/reject`, { note: rejectNote });
      await load();
    } catch (e: any) {
      setActionError(e.response?.data?.message ?? 'Could not reject this request.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error || !order) return <p className="error-text">{error}</p>;

  const isOwner = user?.userId === order.createdById;
  const isPurchaser = user?.role === 'PURCHASER';
  const canEdit = isOwner && order.status === 'DRAFT';
  const canSubmit = isOwner && order.status === 'DRAFT';
  const canResolve = isPurchaser && order.status === 'SUBMITTED';

  return (
    <div className="detail-page">
      <Link to="/orders" className="back-link">&larr; Back to list</Link>

      <div className="page-header">
        <h1>Request #{order.id}</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="detail-grid">
        <div><span className="label">Created by</span>{order.createdByFullName} ({order.createdByUsername})</div>
        <div><span className="label">Expiry date</span>{order.expiryDate}</div>
        <div><span className="label">Created at</span>{new Date(order.createdAt).toLocaleString()}</div>
        {order.submittedAt && (
          <div><span className="label">Submitted at</span>{new Date(order.submittedAt).toLocaleString()}</div>
        )}
        {order.resolvedAt && (
          <div><span className="label">Resolved at</span>{new Date(order.resolvedAt).toLocaleString()} by {order.resolvedByUsername}</div>
        )}
        {order.txnReference && (
          <div><span className="label">Txn reference</span>{order.txnReference}</div>
        )}
        {order.purchaserNote && (
          <div className="full-width"><span className="label">Purchaser note</span>{order.purchaserNote}</div>
        )}
      </div>

      <h2>Items</h2>
      <table className="data-table">
        <thead>
          <tr><th>Item</th><th>Qty</th></tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={item.id ?? idx}>
              <td>{item.itemName}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {actionError && <p className="error-text">{actionError}</p>}

      <div className="action-bar">
        {canEdit && (
          <button onClick={() => navigate(`/orders/${order.id}/edit`)} disabled={busy}>Edit Draft</button>
        )}
        {canSubmit && (
          <button className="primary" onClick={submit} disabled={busy}>Submit to Purchaser</button>
        )}

        {canResolve && !showReject && (
          <>
            <input
              placeholder="Transaction reference"
              value={txnReference}
              onChange={(e) => setTxnReference(e.target.value)}
            />
            <button className="primary" onClick={complete} disabled={busy}>Mark Complete</button>
            <button className="danger" onClick={() => setShowReject(true)} disabled={busy}>Reject…</button>
          </>
        )}

        {canResolve && showReject && (
          <div className="reject-box">
            <textarea
              placeholder="Reason for rejection"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
            <div>
              <button className="danger" onClick={reject} disabled={busy}>Confirm Reject</button>
              <button onClick={() => setShowReject(false)} disabled={busy}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
