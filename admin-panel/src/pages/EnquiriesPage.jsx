import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../api';

export default function EnquiriesPage() {
  const { token } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [products, setProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({
    date: today, customer_name: '', phone: '', requested_product: '',
    purpose: '', interested_product_id: '', status: 'pending',
    follow_up_date: '', remarks: '',
  });

  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/products`).then(r => r.json()),
      fetch(`${API}/enquiries-extended?status=${statusFilter}`).then(r => r.json()),
    ]).then(([prods, data]) => {
      setProducts(Array.isArray(prods) ? prods : (prods.products || []));
      setEnquiries(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, [statusFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch(`${API}/enquiries-extended`, {
        method: 'POST', headers: headers(), body: JSON.stringify(form),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Save failed'); }
      setForm({
        date: today, customer_name: '', phone: '', requested_product: '',
        purpose: '', interested_product_id: '', status: 'pending',
        follow_up_date: '', remarks: '',
      });
      const res = await fetch(`${API}/enquiries-extended?status=${statusFilter}`);
      setEnquiries(await res.json());
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save enquiry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const r = await fetch(`${API}/enquiries-extended/${id}`, {
        method: 'PUT', headers: headers(), body: JSON.stringify({ status }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Update failed'); }
      const res = await fetch(`${API}/enquiries-extended?status=${statusFilter}`);
      setEnquiries(await res.json());
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update enquiry. Please try again.');
    }
  };

  const deleteEnquiry = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    const r = await fetch(`${API}/enquiries-extended/${id}`, { method: 'DELETE', headers: headers() });
    if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Delete failed'); }
    const res = await fetch(`${API}/enquiries-extended?status=${statusFilter}`);
    setEnquiries(await res.json());
  };

  const statusBadge = (status) => {
    const colors = { pending: 'warning', contacted: 'info', interested: 'primary', not_interested: 'secondary', converted: 'success', lost: 'danger' };
    return <span className={`badge bg-${colors[status] || 'secondary'}`}>{status}</span>;
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4"><span className="text-success">📋</span> Enquiry Management</h2>

      <div className="row">
        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">New Enquiry</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" name="date" value={form.date} onChange={handleChange} />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label">Customer Name</label>
                    <input type="text" className="form-control" name="customer_name" value={form.customer_name} onChange={handleChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Phone</label>
                    <input type="text" className="form-control" name="phone" value={form.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label">Requested Product</label>
                  <input type="text" className="form-control" name="requested_product" value={form.requested_product} onChange={handleChange} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Interested Product (from catalog)</label>
                  <select className="form-select" name="interested_product_id" value={form.interested_product_id} onChange={handleChange}>
                    <option value="">Select</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Purpose</label>
                  <input type="text" className="form-control" name="purpose" value={form.purpose} onChange={handleChange} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Follow-up Date</label>
                  <input type="date" className="form-control" name="follow_up_date" value={form.follow_up_date} onChange={handleChange} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Remarks</label>
                  <textarea className="form-control" name="remarks" rows="2" value={form.remarks} onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-success w-100" disabled={saving}>
                  {saving ? 'Saving...' : 'Add Enquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7 mb-4">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center bg-dark text-white">
              <h5 className="mb-0">Enquiries</h5>
              <select className="form-select form-select-sm w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="not_interested">Not Interested</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-3"><div className="spinner-border spinner-border-sm" /></div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '500px' }}>
                  <table className="table table-hover mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Product</th>
                        <th>Status</th>
                        <th>Follow-up</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enquiries.map(e => (
                        <tr key={e.id}>
                          <td>{e.date}</td>
                          <td>{e.customer_name}</td>
                          <td>{e.phone || '-'}</td>
                          <td>{e.requested_product || e.interested_product_id || '-'}</td>
                          <td>{statusBadge(e.status)}</td>
                          <td>{e.follow_up_date || '-'}</td>
                          <td>
                            <div className="dropdown">
                              <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Update</button>
                              <ul className="dropdown-menu">
                                <li><button className="dropdown-item" onClick={() => updateStatus(e.id, 'contacted')}>Contacted</button></li>
                                <li><button className="dropdown-item" onClick={() => updateStatus(e.id, 'interested')}>Interested</button></li>
                                <li><button className="dropdown-item" onClick={() => updateStatus(e.id, 'not_interested')}>Not Interested</button></li>
                                <li><button className="dropdown-item" onClick={() => updateStatus(e.id, 'converted')}>Converted</button></li>
                                <li><button className="dropdown-item" onClick={() => updateStatus(e.id, 'lost')}>Lost</button></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item text-danger" onClick={() => deleteEnquiry(e.id)}>Delete</button></li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {enquiries.length === 0 && (
                        <tr><td colSpan="7" className="text-center text-muted py-3">No enquiries</td></tr>
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
