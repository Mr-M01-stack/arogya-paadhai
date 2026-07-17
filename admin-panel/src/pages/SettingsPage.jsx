import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

import { API } from '../api';

export default function SettingsPage() {
  const { token } = useAuth();
  const [store, setStore] = useState({
    store_name: 'Arogya Paadhai', email: 'aarokiyapaathai@gmail.com',
    phone: '+91 82201 28785', whatsapp: '+91 82201 28785',
    whatsapp_channel: 'https://whatsapp.com/channel/0029Vb81pg04IBhIymkvd53h',
    whatsapp_community: 'https://chat.whatsapp.com/D0KEeEUAWiG5FAiS76yST7',
    instagram: 'https://www.instagram.com/aarogya_paadhai?igsh=MWUxaWdpbnJqMTZlcw==',
    address: 'Krishnagiri, Tamil Nadu, India', business_hours: 'Mon - Sat: 7:00 AM - 8:00 PM',
    google_review_link: 'https://maps.app.goo.gl/gKjrZUMHv4RZhiA98',
  });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [savedSection, setSavedSection] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  useEffect(() => {
    fetch(`${API}/settings/store`)
      .then(r => r.json())
      .then(data => { if (data.store_name) setStore(data); })
      .finally(() => setLoading(false));
  }, []);

  const handleStoreSave = async () => {
    setError('');
    try {
      const res = await fetch(`${API}/settings/store`, {
        method: 'PUT', headers: headers(), body: JSON.stringify(store),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setStore({ ...store, ...data });
      setSavedSection('store');
      setTimeout(() => setSavedSection(''), 2000);
    } catch (e) {
      setError(e.message);
    }
  };

  const handlePasswordSave = async () => {
    setError('');
    if (!password.current || !password.new || !password.confirm) return;
    if (password.new !== password.confirm) { setError('Passwords do not match'); return; }
    if (password.new.length < 4) { setError('Password must be at least 4 characters'); return; }
    try {
      const res = await fetch(`${API}/auth/password`, {
        method: 'PUT', headers: headers(), body: JSON.stringify({ current: password.current, new: password.new }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSavedSection('password');
      setPassword({ current: '', new: '', confirm: '' });
      setTimeout(() => setSavedSection(''), 2000);
    } catch (e) {
      setError(e.message);
    }
  };

  const activeLanguages = [
    { code: 'en', name: 'English', active: true },
    { code: 'ta', name: 'Tamil (தமிழ்)', active: true },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', active: true },
    { code: 'te', name: 'Telugu (తెలుగు)', active: true },
  ];

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;

  return (
    <div>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="admin-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="card-title mb-0">Store Information</h6>
              {savedSection === 'store' && <span className="badge bg-success">Saved!</span>}
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Store Name</label>
                <input className="form-control" value={store.store_name}
                  onChange={(e) => setStore({ ...store, store_name: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input className="form-control" value={store.email}
                  onChange={(e) => setStore({ ...store, email: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input className="form-control" value={store.phone}
                  onChange={(e) => setStore({ ...store, phone: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">WhatsApp Number</label>
                <input className="form-control" value={store.whatsapp}
                  onChange={(e) => setStore({ ...store, whatsapp: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">WhatsApp Channel Link</label>
                <input className="form-control" value={store.whatsapp_channel || ''}
                  onChange={(e) => setStore({ ...store, whatsapp_channel: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">WhatsApp Community Link</label>
                <input className="form-control" value={store.whatsapp_community || ''}
                  onChange={(e) => setStore({ ...store, whatsapp_community: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Instagram Link</label>
                <input className="form-control" value={store.instagram || ''}
                  onChange={(e) => setStore({ ...store, instagram: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label">Address</label>
                <textarea className="form-control" rows="2" value={store.address}
                  onChange={(e) => setStore({ ...store, address: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label">Business Hours</label>
                <input className="form-control" value={store.business_hours}
                  onChange={(e) => setStore({ ...store, business_hours: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label">Google Review Link</label>
                <input className="form-control" value={store.google_review_link || ''}
                  onChange={(e) => setStore({ ...store, google_review_link: e.target.value })} />
              </div>
              <div className="col-12">
                <button className="btn btn-success" onClick={handleStoreSave}>
                  <FiSave className="me-1" /> Save Store Info
                </button>
              </div>
            </div>
          </div>

          <div className="admin-card mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="card-title mb-0">Change Password</h6>
              {savedSection === 'password' && <span className="badge bg-success">Password Updated!</span>}
            </div>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-control" value={password.current}
                  onChange={(e) => setPassword({ ...password, current: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" value={password.new}
                  onChange={(e) => setPassword({ ...password, new: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className={`form-control ${password.confirm && password.new !== password.confirm ? 'is-invalid' : ''}`} value={password.confirm}
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })} />
                {password.confirm && password.new !== password.confirm && (
                  <div className="invalid-feedback">Passwords do not match</div>
                )}
              </div>
              <div className="col-12">
                <button className="btn btn-success" onClick={handlePasswordSave}>
                  <FiSave className="me-1" /> Update Password
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="admin-card">
            <h6 className="card-title mb-3">Language Settings</h6>
            <p className="small text-muted">Languages active on the public site:</p>
            {activeLanguages.map((lang) => (
              <div key={lang.code} className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                <span>{lang.name}</span>
                <span className="badge bg-success">Active</span>
              </div>
            ))}
          </div>

          <div className="admin-card mt-4">
            <h6 className="card-title mb-3">Account Info</h6>
            <div className="mb-2">
              <small className="text-muted d-block">Account Type</small>
              <span className="fw-medium">Owner</span>
            </div>
            <div className="mb-2">
              <small className="text-muted d-block">Email</small>
              <span className="fw-medium">aarokiyapaathai@gmail.com</span>
            </div>
            <div className="mb-2">
              <small className="text-muted d-block">Member Since</small>
              <span className="fw-medium">January 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
