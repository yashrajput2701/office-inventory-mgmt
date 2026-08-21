import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { Order, OrderItem } from '../types';

const emptyItem = (): OrderItem => ({ id: null, itemName: '', quantity: 1 });

export default function OrderForm() {
  const { id } = useParams(); // present only in edit mode
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [expiryDate, setExpiryDate] = useState('');
  const [items, setItems] = useState<OrderItem[]>([emptyItem()]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) loadExisting();
  }, [id]);

  const loadExisting = async () => {
    try {
      const { data } = await apiClient.get<Order>(`/orders/${id}`);
      if (data.status !== 'DRAFT') {
        setError('This request is no longer a draft and cannot be edited.');
        return;
      }
      setExpiryDate(data.expiryDate);
      setItems(data.items.length ? data.items : [emptyItem()]);
    } catch {
      setError('Could not load this request.');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (idx: number, patch: Partial<OrderItem>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const validate = (): string | null => {
    if (!expiryDate) return 'Expiry date is required.';
    if (items.length === 0) return 'Add at least one item.';
    for (const it of items) {
      if (!it.itemName.trim()) return 'Every item needs a name.';
      if (!it.quantity || it.quantity < 1) return 'Quantity must be at least 1.';
    }
    const names = items.map((i) => i.itemName.trim().toLowerCase());
    if (new Set(names).size !== names.length) return 'Duplicate item names in this order.';
    return null;
  };

  const buildPayload = () => ({
    expiryDate,
    items: items.map((i) => ({ itemName: i.itemName.trim(), quantity: Number(i.quantity) })),
  });

  const saveDraft = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await apiClient.put(`/orders/${id}`, buildPayload());
        navigate(`/orders/${id}`);
      } else {
        const { data } = await apiClient.post<Order>('/orders', buildPayload());
        navigate(`/orders/${data.id}`);
      }
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Could not save this request.');
    } finally {
      setSaving(false);
    }
  };

  const saveAndSubmit = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setSaving(true);
    setError('');
    try {
      let orderId = id;
      if (isEdit) {
        await apiClient.put(`/orders/${id}`, buildPayload());
      } else {
        const { data } = await apiClient.post<Order>('/orders', buildPayload());
        orderId = String(data.id);
      }
      await apiClient.post(`/orders/${orderId}/submit`);
      navigate(`/orders/${orderId}`);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Could not submit this request.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="form-page">
      <h1>{isEdit ? `Edit Draft #${id}` : 'New Purchase Request'}</h1>

      <label>Expiry Date</label>
      <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />

      <h2>Items</h2>
      {items.map((item, idx) => (
        <div className="item-row" key={idx}>
          <input
            placeholder="Item name"
            value={item.itemName}
            onChange={(e) => updateItem(idx, { itemName: e.target.value })}
          />
          <input
            type="number"
            min={1}
            placeholder="Qty"
            value={item.quantity}
            onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
          />
          <button type="button" onClick={() => removeItem(idx)} disabled={items.length === 1}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addItem}>+ Add Item</button>

      {error && <p className="error-text">{error}</p>}

      <div className="action-bar">
        <button onClick={saveDraft} disabled={saving}>Save as Draft</button>
        <button className="primary" onClick={saveAndSubmit} disabled={saving}>Save &amp; Submit to Purchaser</button>
      </div>
    </div>
  );
}
