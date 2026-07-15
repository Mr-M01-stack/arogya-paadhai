import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../api';

export default function StallPage() {
  const { token } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: today, open_time: '', close_time: '', staff_name: '',
    status: 'open', weather: '', temperature: '', rain_status: '',
    notes: '', working_hours: 0,
  });
  const [history, setHistory] = useState([]);

  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  useEffect(() => {
    fetch(`${API}/stalls?date=${today}`)
      .then(r => r.json())
      .then(d => {
        if (d && d.date) {
          setStall(d);
          setForm(prev => ({
            ...prev, ...d,
            temperature: d.temperature || '',
          }));
        }
        setLoading(false);
      });
    fetch(`${API}/stalls`)
      .then(r => r.json())
      .then(d => setHistory(Array.isArray(d) ? d : []));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form };
    payload.temperature = payload.temperature ? parseFloat(payload.temperature) : null;
    payload.working_hours = payload.working_hours ? parseFloat(payload.working_hours) : null;

    try {
      const res = await fetch(`${API}/stalls`, {
        method: 'POST', headers: headers(), body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed'); }
      const data = await res.json();
      setStall(data);
      fetch(`${API}/stalls`).then(r => r.json()).then(d => setHistory(Array.isArray(d) ? d : []));
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save stall. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;

  return (
    <div className="container-fluid">
      <h2 className="mb-4"><span className="text-success">📍</span> Stall Management</h2>

      <div className="row">
        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Today's Stall Log</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" name="date" value={form.date} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="half-day">Half Day</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Open Time</label>
                    <input type="time" className="form-control" name="open_time" value={form.open_time} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Close Time</label>
                    <input type="time" className="form-control" name="close_time" value={form.close_time} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Working Hours</label>
                    <input type="number" step="0.5" className="form-control" name="working_hours" value={form.working_hours} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Staff Name</label>
                    <input type="text" className="form-control" name="staff_name" value={form.staff_name} onChange={handleChange} placeholder="Who is managing?" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Weather</label>
                    <select className="form-select" name="weather" value={form.weather} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="sunny">Sunny</option>
                      <option value="cloudy">Cloudy</option>
                      <option value="rainy">Rainy</option>
                      <option value="humid">Humid</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Temperature (°C)</label>
                    <input type="number" step="0.1" className="form-control" name="temperature" value={form.temperature} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Rain Status</label>
                    <select className="form-select" name="rain_status" value={form.rain_status} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="none">No Rain</option>
                      <option value="light">Light Rain</option>
                      <option value="heavy">Heavy Rain</option>
                      <option value="drizzle">Drizzle</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Notes</label>
                    <textarea className="form-control" name="notes" rows="2" value={form.notes} onChange={handleChange} placeholder="Any observations..." />
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-success w-100" disabled={saving}>
                      {saving ? 'Saving...' : stall ? 'Update Stall Log' : 'Create Stall Log'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Stall History (Last 30 Days)</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Staff</th>
                      <th>Open</th>
                      <th>Close</th>
                      <th>Hours</th>
                      <th>Weather</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(s => (
                      <tr key={s.id}>
                        <td>{s.date}</td>
                        <td><span className={`badge bg-${s.status === 'open' ? 'success' : s.status === 'closed' ? 'danger' : 'warning'}`}>{s.status}</span></td>
                        <td>{s.staff_name || '-'}</td>
                        <td>{s.open_time || '-'}</td>
                        <td>{s.close_time || '-'}</td>
                        <td>{s.working_hours || '-'}</td>
                        <td>{s.weather || '-'}</td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr><td colSpan="7" className="text-center text-muted py-3">No stall records yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
