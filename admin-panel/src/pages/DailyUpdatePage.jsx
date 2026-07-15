import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

import { API } from '../api';

export default function DailyUpdatePage() {
  const { token } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProducts(
        (data.products || []).map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          isAvailableToday: p.is_available_today,
          isProductOfDay: p.is_product_of_day,
          stock: p.stock,
        }))
      );
    } catch {
      setError('Failed to fetch products. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (id, field) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (field === 'isProductOfDay') {
          return { ...p, isProductOfDay: true };
        }
        return { ...p, [field]: !p[field] };
      })
    );
  };

  const handleProductOfDay = (id) => {
    setProducts((prev) =>
      prev.map((p) => ({ ...p, isProductOfDay: p.id === id }))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updates = products.map(p => {
        const body = {
          is_available: p.isAvailableToday,
          date: date,
          is_product_of_day: p.isProductOfDay,
        };
        return fetch(`${API}/products/${p.id}/daily-update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      });
      const results = await Promise.all(updates);
      for (const r of results) {
        if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Save failed'); }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = useMemo(() => products.filter((p) => p.isAvailableToday).length, [products]);
  const productOfDay = useMemo(() => products.find((p) => p.isProductOfDay), [products]);

  const getInitials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return `#${'00000'.slice(c.length)}${c}`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border" style={{ color: '#2d7a35' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {saved && (
        <div className="alert alert-success alert-dismissible fade show py-2" role="alert">
          Daily update saved successfully for {date}!
          <button type="button" className="btn-close py-2" onClick={() => setSaved(false)} />
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show py-2" role="alert">
          {error}
          <button type="button" className="btn-close py-2" onClick={() => setError('')} />
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="admin-card text-center">
            <h6 className="card-title">Selected Date</h6>
            <input type="date" className="form-control text-center" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="col-md-4">
          <div className="admin-card text-center">
            <h6 className="card-title">Today's Products</h6>
            <h2 className="mb-0" style={{ color: '#10b981' }}>{selectedCount}</h2>
            <small className="text-muted">out of {products.length} total</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="admin-card">
            <h6 className="card-title">Product of the Day</h6>
            {productOfDay ? (
              <div className="d-flex align-items-center gap-2">
                <div className="product-thumb" style={{ backgroundColor: '#f59e0b' }}>
                  {getInitials(productOfDay.name)}
                </div>
                <span className="fw-medium">{productOfDay.name}</span>
              </div>
            ) : (
              <small className="text-muted">None selected</small>
            )}
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="card-title mb-0">All Products</h6>
          <button className="btn btn-success px-4" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Updates'}
          </button>
        </div>
        <div className="table-responsive">
          <table className="table admin-table daily-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th className="text-center">Available Today</th>
                <th className="text-center">Product of Day</th>
                <th className="text-center">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="product-thumb" style={{ backgroundColor: stringToColor(p.name) }}>
                        {getInitials(p.name)}
                      </div>
                      <span className="fw-medium">{p.name}</span>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td className="text-center">
                    <label className="toggle-switch">
                      <input type="checkbox" checked={p.isAvailableToday}
                        onChange={() => toggleField(p.id, 'isAvailableToday')} />
                      <span className="toggle-slider green"></span>
                    </label>
                  </td>
                  <td className="text-center">
                    <label className="toggle-switch">
                      <input type="radio" name="productOfDay" checked={p.isProductOfDay}
                        onChange={() => handleProductOfDay(p.id)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${p.stock > 0 ? 'bg-success' : 'bg-secondary'}`}>
                      {p.stock > 0 ? `${p.stock} units` : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-success px-4" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Updates'}
          </button>
        </div>
      </div>
    </div>
  );
}
