import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiEdit2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

import { API } from '../api';

export default function CategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image: '' });
  const [showDelete, setShowDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', image: '' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image: cat.image || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const res = await fetch(`${API}/categories/${editing.id}`, {
          method: 'PUT', headers: headers(), body: JSON.stringify(form),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      } else {
        const res = await fetch(`${API}/categories`, {
          method: 'POST', headers: headers(), body: JSON.stringify({ ...form, is_active: true }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (cat) => {
    try {
      const res = await fetch(`${API}/categories/${cat.id}`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({ is_active: !cat.is_active }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/categories/${showDelete.id}`, {
        method: 'DELETE', headers: headers(),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowDelete(null);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;

  return (
    <div>
      {error && <div className="alert alert-danger py-2">{error}<button className="btn-close float-end" onClick={() => setError('')} /></div>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted">{categories.length} categories</span>
        <button className="btn btn-success" onClick={openAdd}>
          <FiPlus className="me-1" /> Add Category
        </button>
      </div>

      <div className="admin-card">
        <div className="table-responsive">
          <table className="table admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr key={cat.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="product-thumb" style={{ backgroundColor: cat.is_active ? '#10b981' : '#9ca3af' }}>
                        {cat.name.charAt(0)}
                      </div>
                      <span className="fw-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td><code>{cat.slug}</code></td>
                  <td>{cat.product_count || 0}</td>
                  <td>
                    <span className={`badge ${cat.is_active ? 'bg-success' : 'bg-secondary'}`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(cat)}>
                      <FiEdit2 />
                    </button>
                    <button className="btn btn-sm btn-outline-warning me-1" onClick={() => toggleActive(cat)}>
                      {cat.is_active ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setShowDelete(cat)}>
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan="6" className="text-center text-muted py-4">No categories yet. Add one!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} />}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editing ? 'Edit Category' : 'Add Category'}</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Category Name</label>
                <input className="form-control" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Slug</label>
                <input className="form-control" value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="3" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Image URL</label>
                <input className="form-control" value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (editing ? 'Update' : 'Add Category')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDelete && <div className="modal-backdrop fade show" onClick={() => setShowDelete(null)} />}
      <div className={`modal fade ${showDelete ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-sm modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title">Delete Category</h6>
              <button type="button" className="btn-close" onClick={() => setShowDelete(null)} />
            </div>
            <div className="modal-body">
              <p className="mb-0">Delete <strong>{showDelete?.name}</strong>? This action cannot be undone.</p>
              {showDelete?.product_count > 0 && (
                <p className="text-danger mt-2 mb-0 small">Warning: {showDelete.product_count} product(s) in this category.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowDelete(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={saving}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
