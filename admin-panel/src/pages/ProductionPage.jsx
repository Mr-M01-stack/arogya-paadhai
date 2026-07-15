import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatIndian } from '../utils/format';

import { API } from '../api';

export default function ProductionPage() {
  const { token } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [products, setProducts] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(today);
  const [form, setForm] = useState({
    product_id: '', date: today, quantity: 1, unit: 'piece',
    raw_material_cost: 0, labour_cost: 0, gas_cost: 0,
    electricity_cost: 0, packaging_cost: 0, transport_cost: 0,
    misc_cost: 0, expected_price: 0,
  });

  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/products`).then(r => r.json()),
      fetch(`${API}/production?date=${date}`).then(r => r.json()),
    ]).then(([prods, data]) => {
      setProducts(Array.isArray(prods) ? prods : (prods.products || []));
      setRecords(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, [date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {};
    Object.keys(form).forEach(k => {
      const numFields = ['quantity', 'raw_material_cost', 'labour_cost', 'gas_cost',
        'electricity_cost', 'packaging_cost', 'transport_cost', 'misc_cost', 'expected_price'];
      payload[k] = numFields.includes(k) ? (parseFloat(form[k]) || 0) : form[k];
    });
    payload.product_id = parseInt(payload.product_id);
    try {
      await fetch(`${API}/production`, {
        method: 'POST', headers: headers(), body: JSON.stringify(payload),
      });
      setForm({
        product_id: '', date, quantity: 1, unit: 'piece',
        raw_material_cost: 0, labour_cost: 0, gas_cost: 0,
        electricity_cost: 0, packaging_cost: 0, transport_cost: 0,
        misc_cost: 0, expected_price: 0,
      });
      const res = await fetch(`${API}/production?date=${date}`);
      setRecords(await res.json());
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save production. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('Delete this production record?')) return;
    await fetch(`${API}/production/${id}`, { method: 'DELETE', headers: headers() });
    const res = await fetch(`${API}/production?date=${date}`);
    setRecords(await res.json());
  };

  const totalCost = (r) => {
    if (r.total_cost) return r.total_cost;
    return ['raw_material_cost', 'labour_cost', 'gas_cost', 'electricity_cost',
      'packaging_cost', 'transport_cost', 'misc_cost']
      .reduce((sum, k) => sum + (parseFloat(r[k]) || 0), 0);
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4"><span className="text-success">⚙</span> Production Tracking</h2>

      <div className="row">
        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Record Production</h5>
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
                  <select className="form-select" name="product_id" value={form.product_id} onChange={handleChange}>
                    <option value="">Select</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label">Quantity</label>
                    <input type="number" step="0.5" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Unit</label>
                    <input type="text" className="form-control" name="unit" value={form.unit} onChange={handleChange} />
                  </div>
                </div>
                <h6 className="text-muted mt-3">Cost Breakdown</h6>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label">Raw Materials</label>
                    <input type="number" className="form-control" name="raw_material_cost" value={form.raw_material_cost} onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Labour</label>
                    <input type="number" className="form-control" name="labour_cost" value={form.labour_cost} onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Gas</label>
                    <input type="number" className="form-control" name="gas_cost" value={form.gas_cost} onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Electricity</label>
                    <input type="number" className="form-control" name="electricity_cost" value={form.electricity_cost} onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Packaging</label>
                    <input type="number" className="form-control" name="packaging_cost" value={form.packaging_cost} onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Transport</label>
                    <input type="number" className="form-control" name="transport_cost" value={form.transport_cost} onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Miscellaneous</label>
                    <input type="number" className="form-control" name="misc_cost" value={form.misc_cost} onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Expected Price</label>
                    <input type="number" className="form-control" name="expected_price" value={form.expected_price} onChange={handleChange} />
                  </div>
                </div>
                <button type="submit" className="btn btn-success w-100" disabled={saving}>
                  {saving ? 'Saving...' : 'Record Production'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7 mb-4">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center bg-dark text-white">
              <h5 className="mb-0">Production Records</h5>
              <input type="date" className="form-control form-control-sm w-auto" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-3"><div className="spinner-border spinner-border-sm" /></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Total Cost</th>
                        <th>Cost/Unit</th>
                        <th>Exp. Price</th>
                        <th>Exp. Profit</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map(r => {
                        const tc = totalCost(r);
                        const cpu = r.cost_per_unit || (r.quantity > 0 ? tc / r.quantity : 0);
                        const profit = (r.expected_price || 0) - cpu;
                        return (
                          <tr key={r.id}>
                            <td>{products.find(p => p.id === r.product_id)?.name || r.product_id}</td>
                            <td>{r.quantity} {r.unit}</td>
                            <td>{formatIndian(tc)}</td>
                            <td>{formatIndian(cpu)}</td>
                            <td>{formatIndian(r.expected_price || 0)}</td>
                            <td className={profit >= 0 ? 'text-success' : 'text-danger'}>
                              {formatIndian(profit)}
                            </td>
                            <td>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteRecord(r.id)}>🗑</button>
                            </td>
                          </tr>
                        );
                      })}
                      {records.length === 0 && (
                        <tr><td colSpan="7" className="text-center text-muted py-3">No production records</td></tr>
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
