import { useState, useEffect, useMemo, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUpload } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

import { API } from '../api';

const emptyForm = {
  name: '', slug: '', price: '', originalPrice: '', category: '', description: '',
  image: '', ingredients: '', benefits: '', usage: '', storage: '', shelfLife: '',
  availability: 'in_stock', stock: '', isAvailableToday: false, isProductOfDay: false,
  featured: false, sales: 0, rating: '', reviewsCount: '',
};

const categories = ['Traditional Porridges', 'Herbal Juices', 'Cold-Pressed Oils', 'Traditional Snacks'];

const toCamel = (p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  price: p.price,
  originalPrice: p.original_price,
  category: p.category,
  description: p.description,
  image: p.image,
  ingredients: p.ingredients,
  benefits: p.benefits,
  usage: p.usage,
  storage: p.storage,
  shelfLife: p.shelf_life,
  availability: p.availability,
  stock: p.stock,
  isAvailableToday: p.is_available_today,
  isProductOfDay: p.is_product_of_day,
  featured: p.featured,
  sales: p.sales,
  rating: p.rating,
  reviewsCount: p.reviews_count,
});

export default function ProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showDelete, setShowDelete] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProducts(data.products.map(toCamel));
    } catch {
      setError('Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, search]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      ...emptyForm,
      ...product,
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      stock: product.stock?.toString() || '',
      sales: product.sales?.toString() || '',
      rating: product.rating?.toString() || '',
      reviewsCount: product.reviewsCount?.toString() || '',
      ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : (product.ingredients || ''),
      benefits: Array.isArray(product.benefits) ? product.benefits.join(', ') : (product.benefits || ''),
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.price || isNaN(form.price)) e.price = 'Valid price required';
    if (!form.category) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setForm({ ...form, image: data.url });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        price: parseFloat(form.price),
        original_price: parseFloat(form.originalPrice) || null,
        category: form.category,
        description: form.description,
        image: form.image,
        ingredients: form.ingredients ? form.ingredients.split(',').map((s) => s.trim()).filter(Boolean).join(',') : '',
        benefits: form.benefits ? form.benefits.split(',').map((s) => s.trim()).filter(Boolean).join(',') : '',
        usage: form.usage,
        storage: form.storage,
        shelf_life: form.shelfLife,
        availability: form.availability || 'in_stock',
        stock: parseInt(form.stock) || 0,
        is_available_today: !!form.isAvailableToday,
        is_product_of_day: !!form.isProductOfDay,
        featured: !!form.featured,
        sales: parseInt(form.sales) || 0,
        rating: parseFloat(form.rating) || 0,
        reviews_count: parseInt(form.reviewsCount) || 0,
      };
      const url = editing ? `${API}/products/${editing.id}` : `${API}/products`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      await fetchProducts();
      setShowModal(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/products/${showDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Delete failed'); }
      await fetchProducts();
      setShowDelete(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStockBadge = (stock) => {
    if (stock > 200) return <span className="badge bg-success">In Stock</span>;
    if (stock > 50) return <span className="badge bg-warning text-dark">Limited</span>;
    return <span className="badge bg-danger">Out of Stock</span>;
  };

  function ProductThumb({ product }) {
    const [imgError, setImgError] = useState(false);
    const initial = product.name?.charAt(0)?.toUpperCase() || '?';

    return (
      <div className="product-thumb d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2d7a35', flexShrink: 0 }}>
        {!imgError && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
            {initial}
          </span>
        )}
      </div>
    );
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success" role="status" /></div>;

  return (
    <div>
      {error && (
        <div className="alert alert-danger alert-dismissible fade show py-2" role="alert">
          {error}
          <button type="button" className="btn-close py-2" onClick={() => setError('')} />
        </div>
      )}
      {saved && (
        <div className="alert alert-success alert-dismissible fade show py-2" role="alert">
          Changes saved successfully!
          <button type="button" className="btn-close py-2" onClick={() => setSaved(false)} />
        </div>
      )}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-success" onClick={openAdd}>
          <FiPlus className="me-1" /> Add New Product
        </button>
      </div>

      <div className="admin-card">
        <div className="table-responsive">
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <ProductThumb product={p} />
                      <div>
                        <span className="fw-medium d-block">{p.name}</span>
                        <small className="text-muted">{p.slug}</small>
                      </div>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>₹{p.price}</td>
                  <td>{p.stock}</td>
                  <td>{getStockBadge(p.stock)}</td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(p)}>
                      <FiEdit2 />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setShowDelete(p)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="text-center text-muted py-4">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} />
      )}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editing ? 'Edit Product' : 'Add New Product'}</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Product Name <span className="text-danger">*</span></label>
                  <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Slug</label>
                  <input className="form-control" value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Price (₹) <span className="text-danger">*</span></label>
                  <input type="number" className={`form-control ${errors.price ? 'is-invalid' : ''}`} value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Original Price</label>
                  <input type="number" className="form-control" value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Category <span className="text-danger">*</span></label>
                  <select className={`form-select ${errors.category ? 'is-invalid' : ''}`} value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="2" value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Availability</label>
                  <select className="form-select" value={form.availability}
                    onChange={(e) => setForm({ ...form, availability: e.target.value })}>
                    <option value="in_stock">In Stock</option>
                    <option value="limited">Limited</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Stock <span className="text-danger">*</span></label>
                  <input type="number" className={`form-control ${errors.stock ? 'is-invalid' : ''}`} value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                  {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Image</label>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <input type="file" accept="image/*" className="form-control form-control-sm" ref={fileInputRef}
                      onChange={handleFileUpload} disabled={uploading} style={{ fontSize: '0.85rem' }} />
                    {uploading && <span className="spinner-border spinner-border-sm text-success" />}
                  </div>
                  {form.image && (
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <img src={form.image} alt="preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }}
                        onError={(e) => { e.target.style.display = 'none' }} />
                      <small className="text-muted" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{form.image}</small>
                    </div>
                  )}
                  <small className="text-muted">Pick a file or paste a URL below:</small>
                  <input className="form-control form-control-sm mt-1" placeholder="Or paste image URL" value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })} style={{ fontSize: '0.85rem' }} />
                </div>
                <div className="col-12">
                  <label className="form-label">Ingredients (comma separated)</label>
                  <textarea className="form-control" rows="2" value={form.ingredients}
                    onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label">Health Benefits (comma separated)</label>
                  <textarea className="form-control" rows="2" value={form.benefits}
                    onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Usage Instructions</label>
                  <textarea className="form-control" rows="2" value={form.usage}
                    onChange={(e) => setForm({ ...form, usage: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Storage Instructions</label>
                  <textarea className="form-control" rows="2" value={form.storage}
                    onChange={(e) => setForm({ ...form, storage: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Shelf Life</label>
                  <input className="form-control" value={form.shelfLife}
                    onChange={(e) => setForm({ ...form, shelfLife: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Rating</label>
                  <input type="number" step="0.1" className="form-control" value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Reviews</label>
                  <input type="number" className="form-control" value={form.reviewsCount}
                    onChange={(e) => setForm({ ...form, reviewsCount: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Sales</label>
                  <input type="number" className="form-control" value={form.sales}
                    onChange={(e) => setForm({ ...form, sales: e.target.value })} />
                </div>
                <div className="col-12">
                  <div className="d-flex gap-4 flex-wrap">
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" id="availToday" checked={form.isAvailableToday}
                        onChange={(e) => setForm({ ...form, isAvailableToday: e.target.checked })} />
                      <label className="form-check-label" htmlFor="availToday">Available Today</label>
                    </div>
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" id="productDay" checked={form.isProductOfDay}
                        onChange={(e) => setForm({ ...form, isProductOfDay: e.target.checked })} />
                      <label className="form-check-label" htmlFor="productDay">Product of the Day</label>
                    </div>
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" id="featured" checked={form.featured}
                        onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                      <label className="form-check-label" htmlFor="featured">Featured</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
              <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (editing ? 'Update Product' : 'Save Product')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDelete && (
        <div className="modal-backdrop fade show" onClick={() => setShowDelete(null)} />
      )}
      <div className={`modal fade ${showDelete ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-sm modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title">Confirm Delete</h6>
              <button type="button" className="btn-close" onClick={() => setShowDelete(null)} />
            </div>
            <div className="modal-body">
              <p className="mb-0">Are you sure you want to delete <strong>{showDelete?.name}</strong>?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowDelete(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
