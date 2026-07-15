import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../api';

export default function StockPage() {
  const { token } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(today);
  const [form, setForm] = useState({
    date: today, product_id: '', opening_stock: 0, todays_production: 0,
    purchase_quantity: 0, available_stock: 0, sold_quantity: 0,
    damaged_quantity: 0, min_stock_alert: 0, unit: 'piece',
    supplier: '', expiry_date: '',
  });

  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/products`).then(r => r.json()),
      fetch(`${API}/stock?date=${date}`).then(r => r.json()),
      fetch(`${API}/stock/low`).then(r => r.json()),
    ]).then(([prods, stockData, lowData]) => {
      const list = Array.isArray(prods) ? prods : (prods.products || []);
      setProducts(list);
      setStocks(Array.isArray(stockData) ? stockData : []);
      setLowStock(Array.isArray(lowData) ? lowData : []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, [date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (e) => {
    const pid = parseInt(e.target.value);
    const p = products.find(pr => pr.id === pid);
    if (!p) return;
    const existing = stocks.find(s => s.product_id === pid);
    setForm(prev => ({
      ...prev,
      product_id: pid,
      opening_stock: existing?.closing_stock || 0,
      unit: p.category === 'Cold-Pressed Oils' ? 'litre' : 'piece',
      min_stock_alert: p.category === 'Cold-Pressed Oils' ? 2 : 10,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {};
    Object.keys(form).forEach(k => {
      const val = form[k];
      if (['opening_stock', 'todays_production', 'purchase_quantity', 'available_stock', 'sold_quantity', 'damaged_quantity', 'min_stock_alert'].includes(k)) {
        payload[k] = parseFloat(val) || 0;
      } else {
        payload[k] = val;
      }
    });
    payload.product_id = parseInt(payload.product_id);
    try {
      const res = await fetch(`${API}/stock`, {
        method: 'POST', headers: headers(), body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed'); }
      setForm({
        date, product_id: '', opening_stock: 0, todays_production: 0,
        purchase_quantity: 0, available_stock: 0, sold_quantity: 0,
        damaged_quantity: 0, min_stock_alert: 0, unit: 'piece',
        supplier: '', expiry_date: '',
      });
      fetchData();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save stock. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4"><span className="text-success">📦</span> Stock Management</h2>

      {lowStock.length > 0 && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <strong>⚠ Low Stock Alert:</strong>
          {lowStock.map(l => (
            <span key={l.product_id} className="badge bg-danger me-1">{l.product_name} ({l.available} left)</span>
          ))}
        </div>
      )}

      <div className="row">
        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Update Stock</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" name="date" value={form.date}
                    onChange={e => { setDate(e.target.value); setForm(prev => ({ ...prev, date: e.target.value })); }} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Product</label>
                  <select className="form-select" value={form.product_id} onChange={handleProductSelect}>
                    <option value="">Select product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock || 0})</option>
                    ))}
                  </select>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-4">
                    <label className="form-label">Opening</label>
                    <input type="number" className="form-control" name="opening_stock" value={form.opening_stock} onChange={handleChange} />
                  </div>
                  <div className="col-4">
                    <label className="form-label">Produced</label>
                    <input type="number" className="form-control" name="todays_production" value={form.todays_production} onChange={handleChange} />
                  </div>
                  <div className="col-4">
                    <label className="form-label">Purchased</label>
                    <input type="number" className="form-control" name="purchase_quantity" value={form.purchase_quantity} onChange={handleChange} />
                  </div>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-4">
                    <label className="form-label">Sold</label>
                    <input type="number" className="form-control" name="sold_quantity" value={form.sold_quantity} onChange={handleChange} />
                  </div>
                  <div className="col-4">
                    <label className="form-label">Damaged</label>
                    <input type="number" className="form-control" name="damaged_quantity" value={form.damaged_quantity} onChange={handleChange} />
                  </div>
                  <div className="col-4">
                    <label className="form-label">Min Alert</label>
                    <input type="number" className="form-control" name="min_stock_alert" value={form.min_stock_alert} onChange={handleChange} />
                  </div>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label">Unit</label>
                    <input type="text" className="form-control" name="unit" value={form.unit} onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Supplier</label>
                    <input type="text" className="form-control" name="supplier" value={form.supplier} onChange={handleChange} />
                  </div>
                </div>
                <button type="submit" className="btn btn-success w-100" disabled={saving}>
                  {saving ? 'Saving...' : 'Update Stock'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7 mb-4">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center bg-dark text-white">
              <h5 className="mb-0">Stock Status</h5>
              <input type="date" className="form-control form-control-sm w-auto" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-3"><div className="spinner-border spinner-border-sm" /></div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '500px' }}>
                  <table className="table table-hover mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>Product</th>
                        <th>Opening</th>
                        <th>Produced</th>
                        <th>Sold</th>
                        <th>Damaged</th>
                        <th>Available</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => {
                        const s = stocks.find(st => st.product_id === p.id);
                        const avail = s?.available_stock ?? p.stock ?? 0;
                        const minAlert = s?.min_stock_alert ?? 10;
                        const status = avail <= 0 ? 'out-of-stock' : avail <= minAlert ? 'low' : 'in-stock';
                        return (
                          <tr key={p.id} className={status === 'out-of-stock' ? 'table-danger' : status === 'low' ? 'table-warning' : ''}>
                            <td>{p.name}</td>
                            <td>{s?.opening_stock ?? '-'}</td>
                            <td>{s?.todays_production ?? '-'}</td>
                            <td>{s?.sold_quantity ?? '-'}</td>
                            <td>{s?.damaged_quantity ?? '-'}</td>
                            <td><strong>{avail}</strong></td>
                            <td>
                              <span className={`badge bg-${status === 'in-stock' ? 'success' : status === 'low' ? 'warning' : 'danger'}`}>
                                {status === 'in-stock' ? 'In Stock' : status === 'low' ? 'Low' : 'Out of Stock'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
