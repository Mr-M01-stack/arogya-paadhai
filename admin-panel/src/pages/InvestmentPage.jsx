import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatIndian } from '../utils/format';

import { API } from '../api';

export default function InvestmentPage() {
  const { token } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(today);
  const [form, setForm] = useState({
    date: today, product_id: '',
    milk_cost: 0, rice_cost: 0, vegetables_cost: 0, oil_cost: 0,
    spices_cost: 0, packaging_cost: 0, gas_cost: 0,
    electricity_cost: 0, transport_cost: 0, labour_cost: 0,
    other_expenses: 0,
  });

  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/investment?date=${date}`)
      .then(r => r.json())
      .then(data => {
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
      const numFields = ['milk_cost', 'rice_cost', 'vegetables_cost', 'oil_cost',
        'spices_cost', 'packaging_cost', 'gas_cost', 'electricity_cost',
        'transport_cost', 'labour_cost', 'other_expenses'];
      payload[k] = numFields.includes(k) ? (parseFloat(form[k]) || 0) : form[k];
    });
    try {
      await fetch(`${API}/investment`, {
        method: 'POST', headers: headers(), body: JSON.stringify(payload),
      });
      const empty = Object.fromEntries(Object.keys(form).map(k => [k, k === 'date' ? date : 0]));
      empty.date = date;
      empty.product_id = '';
      setForm(empty);
      const res = await fetch(`${API}/investment?date=${date}`);
      setRecords(await res.json());
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save investment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    await fetch(`${API}/investment/${id}`, { method: 'DELETE', headers: headers() });
    const res = await fetch(`${API}/investment?date=${date}`);
    setRecords(await res.json());
  };

  const costFields = [
    { key: 'milk_cost', label: 'Milk' },
    { key: 'rice_cost', label: 'Rice' },
    { key: 'vegetables_cost', label: 'Vegetables' },
    { key: 'oil_cost', label: 'Oil' },
    { key: 'spices_cost', label: 'Spices' },
    { key: 'packaging_cost', label: 'Packaging' },
    { key: 'gas_cost', label: 'Gas' },
    { key: 'electricity_cost', label: 'Electricity' },
    { key: 'transport_cost', label: 'Transport' },
    { key: 'labour_cost', label: 'Labour' },
    { key: 'other_expenses', label: 'Other' },
  ];

  return (
    <div className="container-fluid">
      <h2 className="mb-4"><span className="text-success">📊</span> Daily Investment</h2>

      <div className="row">
        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Add Investment</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" name="date" value={form.date}
                    onChange={e => { setDate(e.target.value); setForm(prev => ({ ...prev, date: e.target.value })); }} />
                </div>
                <h6 className="text-muted mt-2">Expense Breakdown</h6>
                <div className="row g-2 mb-2">
                  {costFields.map(f => (
                    <div className="col-6" key={f.key}>
                      <label className="form-label">{f.label}</label>
                      <input type="number" className="form-control form-control-sm" name={f.key} value={form[f.key]} onChange={handleChange} />
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn btn-success w-100" disabled={saving}>
                  {saving ? 'Saving...' : 'Record Investment'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7 mb-4">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center bg-dark text-white">
              <h5 className="mb-0">Investment Records</h5>
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
                        <th>#</th>
                        {costFields.map(f => <th key={f.key}>{f.label}</th>)}
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r, i) => (
                        <tr key={r.id}>
                          <td>{i + 1}</td>
                          {costFields.map(f => <td key={f.key}>{formatIndian(r[f.key] || 0)}</td>)}
                          <td><strong>{formatIndian(r.total_investment || 0)}</strong></td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteRecord(r.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                      {records.length === 0 && (
                        <tr><td colSpan={costFields.length + 3} className="text-center text-muted py-3">No records</td></tr>
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
