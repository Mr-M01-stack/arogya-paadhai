import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatIndian, formatIndianInt } from '../utils/format';
import { API } from '../api';

export default function SalesPage() {
  const { token } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(today);
  const [form, setForm] = useState({
    date: today, product_id: '', product_name: '', category: '',
    unit_price: '', selling_unit: 'piece', quantity: 1,
    discount: 0, payment_method: 'cash', customer_type: 'new',
    customer_age_group: '', customer_profession: '', sale_time: '',
  });

  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  const fetchSales = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/products`).then(r => r.json()),
      fetch(`${API}/sales?date=${date}`).then(r => r.json()),
      fetch(`${API}/sales/summary?date=${date}`).then(r => r.json()),
    ]).then(([prods, salesData, summaryData]) => {
      const list = Array.isArray(prods) ? prods : (prods.products || []);
      setProducts(list);
      setSales(Array.isArray(salesData) ? salesData : []);
      setSummary(summaryData);
      setLoading(false);
    });
  };

  useEffect(() => { fetchSales(); }, [date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'product_id') {
      const p = products.find(pr => pr.id === parseInt(value));
      if (p) {
        setForm(prev => ({
          ...prev, product_id: p.id, product_name: p.name,
          category: p.category, unit_price: p.price,
        }));
        return;
      }
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      unit_price: parseFloat(form.unit_price) || 0,
      quantity: parseFloat(form.quantity) || 1,
      discount: parseFloat(form.discount) || 0,
    };
    try {
      await fetch(`${API}/sales`, {
        method: 'POST', headers: headers(), body: JSON.stringify(payload),
      });
      setForm({
        date, product_id: '', product_name: '', category: '',
        unit_price: '', selling_unit: 'piece', quantity: 1,
        discount: 0, payment_method: 'cash', customer_type: 'new',
        customer_age_group: '', customer_profession: '', sale_time: '',
      });
      fetchSales();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save sale. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteSale = async (id) => {
    if (!window.confirm('Delete this sale?')) return;
    await fetch(`${API}/sales/${id}`, {
      method: 'DELETE', headers: headers(),
    });
    fetchSales();
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4"><span className="text-success">💰</span> Sales Entry</h2>

      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Add Sale</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" name="date" value={form.date}
                    onChange={e => { setForm(prev => ({ ...prev, date: e.target.value })); }} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Product</label>
                  <select className="form-select" name="product_id" value={form.product_id} onChange={handleChange}>
                    <option value="">Select product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Product Name (manual)</label>
                  <input type="text" className="form-control" name="product_name" value={form.product_name} onChange={handleChange} />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-4">
                    <label className="form-label">Qty</label>
                    <input type="number" step="0.5" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} />
                  </div>
                  <div className="col-4">
                    <label className="form-label">Unit Price</label>
                    <input type="number" step="0.5" className="form-control" name="unit_price" value={form.unit_price} onChange={handleChange} />
                  </div>
                  <div className="col-4">
                    <label className="form-label">Discount</label>
                    <input type="number" step="0.5" className="form-control" name="discount" value={form.discount} onChange={handleChange} />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label">Payment Method</label>
                  <select className="form-select" name="payment_method" value={form.payment_method} onChange={handleChange}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label">Customer Type</label>
                    <select className="form-select" name="customer_type" value={form.customer_type} onChange={handleChange}>
                      <option value="new">New</option>
                      <option value="returning">Returning</option>
                      <option value="regular">Regular</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label">Sale Time</label>
                    <input type="time" className="form-control" name="sale_time" value={form.sale_time} onChange={handleChange} />
                  </div>
                </div>
                <button type="submit" className="btn btn-success w-100" disabled={saving}>
                  {saving ? 'Saving...' : 'Add Sale Entry'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm mb-3">
            <div className="card-header d-flex justify-content-between align-items-center bg-dark text-white">
              <h5 className="mb-0">Sales Summary</h5>
              <input type="date" className="form-control form-control-sm w-auto" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="card-body">
              {summary ? (
                <div className="row text-center">
                  <div className="col-4 border-end">
                    <h3 className="text-success mb-0">{formatIndian(summary.total_revenue)}</h3>
                    <small className="text-muted">Total Revenue</small>
                  </div>
                  <div className="col-4 border-end">
                    <h3 className="text-primary mb-0">{formatIndianInt(summary.transaction_count)}</h3>
                    <small className="text-muted">Transactions</small>
                  </div>
                  <div className="col-4">
                    <h3 className="text-warning mb-0">{formatIndianInt(summary.total_items)}</h3>
                    <small className="text-muted">Items Sold</small>
                  </div>
                </div>
              ) : <p className="text-muted mb-0">No data for this date</p>}
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Sales History</h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-3"><div className="spinner-border spinner-border-sm" /></div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '500px' }}>
                  <table className="table table-hover mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Time</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((s, i) => (
                        <tr key={s.id}>
                          <td>{i + 1}</td>
                          <td>{s.product_name}</td>
                          <td>{s.quantity}</td>
                          <td>{formatIndian(s.unit_price)}</td>
                          <td><strong>{formatIndian(s.total_price)}</strong></td>
                          <td><span className="badge bg-info">{s.payment_method}</span></td>
                          <td>{s.sale_time || '-'}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteSale(s.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                      {sales.length === 0 && (
                        <tr><td colSpan="8" className="text-center text-muted py-3">No sales recorded</td></tr>
                      )}
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
