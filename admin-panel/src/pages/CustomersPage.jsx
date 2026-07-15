import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import { API } from '../api';

export default function CustomersPage() {
  const { token } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(today);
  const [form, setForm] = useState({
    date: today, age: '', gender: '', profession: '', location: '',
    customer_type: 'new', purchase_amount: '', favourite_product: '',
    purchase_time: '', payment_method: 'cash', purpose_of_visit: '',
  });

  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/customers?date=${date}`).then(r => r.json()),
    ]).then(([data]) => {
      setCustomers(Array.isArray(data) ? data : []);
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
      if (['age', 'purchase_amount'].includes(k)) {
        payload[k] = parseFloat(form[k]) || 0;
      } else {
        payload[k] = form[k];
      }
    });
    try {
      await fetch(`${API}/customers`, {
        method: 'POST', headers: headers(), body: JSON.stringify(payload),
      });
      setForm({
        date, age: '', gender: '', profession: '', location: '',
        customer_type: 'new', purchase_amount: '', favourite_product: '',
        purchase_time: '', payment_method: 'cash', purpose_of_visit: '',
      });
      const res = await fetch(`${API}/customers?date=${date}`);
      setCustomers(await res.json());
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm('Delete this customer record?')) return;
    await fetch(`${API}/customers/${id}`, { method: 'DELETE', headers: headers() });
    const res = await fetch(`${API}/customers?date=${date}`);
    setCustomers(await res.json());
  };

  const ageGroups = {
    '0-18': customers.filter(c => c.age && c.age <= 18).length,
    '19-30': customers.filter(c => c.age && c.age >= 19 && c.age <= 30).length,
    '31-45': customers.filter(c => c.age && c.age >= 31 && c.age <= 45).length,
    '46-60': customers.filter(c => c.age && c.age >= 46 && c.age <= 60).length,
    '60+': customers.filter(c => c.age && c.age > 60).length,
  };

  const paymentStats = {};
  customers.forEach(c => {
    const pm = c.payment_method || 'cash';
    paymentStats[pm] = (paymentStats[pm] || 0) + 1;
  });

  return (
    <div className="container-fluid">
      <h2 className="mb-4"><span className="text-success">👥</span> Customer Analytics</h2>

      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Add Customer</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" name="date" value={form.date}
                    onChange={e => { setDate(e.target.value); setForm(prev => ({ ...prev, date: e.target.value })); }} />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label">Age</label>
                    <input type="number" className="form-control" name="age" value={form.age} onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Gender</label>
                    <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label">Profession</label>
                  <input type="text" className="form-control" name="profession" value={form.profession} onChange={handleChange} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-control" name="location" value={form.location} onChange={handleChange} />
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
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" name="payment_method" value={form.payment_method} onChange={handleChange}>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                    </select>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label">Purpose of Visit</label>
                  <input type="text" className="form-control" name="purpose_of_visit" value={form.purpose_of_visit} onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-success w-100" disabled={saving}>
                  {saving ? 'Saving...' : 'Add Customer'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8 mb-4">
          <div className="row mb-3">
            <div className="col-md-3 mb-2">
              <div className="card bg-primary text-white text-center shadow-sm">
                <div className="card-body py-3">
                  <h3 className="mb-0">{customers.length}</h3>
                  <small>Total Today</small>
                </div>
              </div>
            </div>
            {Object.entries(ageGroups).map(([group, count]) => (
              <div className="col-md-3 mb-2" key={group}>
                <div className="card text-center shadow-sm">
                  <div className="card-body py-3">
                    <h3 className="mb-0">{count}</h3>
                    <small className="text-muted">Age {group}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center bg-dark text-white">
              <h5 className="mb-0">Customer Records</h5>
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
                        <th>#</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Profession</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th>Payment</th>
                        <th>Purpose</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c, i) => (
                        <tr key={c.id}>
                          <td>{i + 1}</td>
                          <td>{c.age || '-'}</td>
                          <td>{c.gender || '-'}</td>
                          <td>{c.profession || '-'}</td>
                          <td>{c.location || '-'}</td>
                          <td><span className={`badge bg-${c.customer_type === 'new' ? 'info' : c.customer_type === 'regular' ? 'success' : 'warning'}`}>{c.customer_type}</span></td>
                          <td>{c.payment_method}</td>
                          <td>{c.purpose_of_visit || '-'}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCustomer(c.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                      {customers.length === 0 && (
                        <tr><td colSpan="9" className="text-center text-muted py-3">No customers recorded</td></tr>
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
