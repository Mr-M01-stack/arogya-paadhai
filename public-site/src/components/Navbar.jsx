import { useState, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GiGreenhouse } from 'react-icons/gi';
import { FaShoppingCart, FaWhatsapp, FaCheckCircle, FaCopy, FaCheck, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { API_BASE } from '../api';

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const { t, lang, setLang } = useLanguage();
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount } = useCart();
  const settings = useStoreSettings();
  const waNumber = (settings.whatsapp || '+91 82201 28785').replace(/[^0-9]/g, '');
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderForm, setOrderForm] = useState({ customer_name: '', phone: '', address: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const cartToggleRef = useRef(null);

  const links = [
    { to: '/', label: t.nav.home },
    { to: '/products', label: t.nav.products },
    { to: '/about', label: t.nav.about },
    { to: '/recipes', label: t.nav.recipes },
    { to: '/contact', label: t.nav.contact },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
  ];

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
  };

  const openCheckout = () => {
    if (cart.length === 0) return;
    if (cartToggleRef.current) cartToggleRef.current.click();
    setShowCheckout(true);
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.customer_name.trim() || !orderForm.phone.trim()) return;
    setSubmitting(true);
    try {
      const items = cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price }));
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: orderForm.customer_name.trim(),
          phone: orderForm.phone.trim(),
          address: orderForm.address.trim(),
          notes: orderForm.notes.trim(),
          items,
          total_amount: totalAmount,
        }),
      });
      if (!res.ok) throw new Error('Order failed');
      const data = await res.json();
      setOrderResult(data);
    } catch (err) {
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetCheckout = () => {
    setShowCheckout(false);
    setOrderResult(null);
    setOrderForm({ customer_name: '', phone: '', address: '', notes: '' });
    setCopied(false);
    if (orderResult) clearCart();
  };

  const copyOrderId = () => {
    if (orderResult) {
      navigator.clipboard.writeText(orderResult.order_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top bg-white shadow-sm" style={{ borderBottom: '3px solid #2d7a35' }}>
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/" style={{ color: '#2d7a35' }}>
            <GiGreenhouse size={28} />
            {t.nav.brand}
          </Link>
          <div className="d-flex align-items-center gap-2 order-lg-last ms-lg-2">
            <div className="dropdown">
              <button
                className="btn btn-sm rounded-pill dropdown-toggle d-flex align-items-center gap-1"
                style={{ backgroundColor: '#f0f8f0', border: '1px solid #c8e6c9', color: '#2d7a35' }}
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span style={{ fontSize: '0.85rem' }}>{languages.find(l => l.code === lang)?.label || 'English'}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0" style={{ minWidth: 'auto' }}>
                {languages.map(l => (
                  <li key={l.code}>
                    <button
                      className={`dropdown-item ${lang === l.code ? 'active' : ''}`}
                      style={lang === l.code ? { backgroundColor: '#2d7a35', color: '#fff' } : { color: '#1e3a1e' }}
                      onClick={() => { setLang(l.code); setExpanded(false); }}
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="dropdown">
              <button
                ref={cartToggleRef}
                className="btn btn-sm rounded-pill position-relative d-flex align-items-center gap-1"
                style={{ backgroundColor: '#f0f8f0', border: '1px solid #c8e6c9', color: '#2d7a35' }}
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <FaShoppingCart size={16} />
                {itemCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                    {itemCount}
                  </span>
                )}
              </button>
              <div className="dropdown-menu dropdown-menu-end shadow border-0 p-0" style={{ width: '360px', maxHeight: '480px', overflow: 'auto', borderRadius: '12px' }}>
                {cart.length === 0 ? (
                  <div className="text-center py-4 px-3">
                    <FaShoppingCart size={32} style={{ color: '#ccc' }} />
                    <p className="text-muted small mt-2 mb-0">Your cart is empty</p>
                  </div>
                ) : (
                  <div>
                    <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                      <span className="fw-bold small" style={{ color: '#1e3a1e' }}>Cart ({itemCount} items)</span>
                      <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => { clearCart(); }} style={{ fontSize: '0.75rem' }}>
                        <FaTrash size={10} className="me-1" />Clear
                      </button>
                    </div>
                    {cart.map(item => (
                      <div key={item.id} className="d-flex align-items-center gap-2 px-3 py-2 border-bottom">
                        <div className="flex-grow-1">
                          <span className="d-block small fw-bold" style={{ color: '#1e3a1e' }}>{item.name}</span>
                          <span className="small" style={{ color: '#2d7a35' }}>Rs. {item.price}</span>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <button className="btn btn-sm btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center"
                            style={{ width: 24, height: 24, fontSize: '0.6rem' }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <FaMinus size={8} />
                          </button>
                          <span className="fw-bold small px-1" style={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                          <button className="btn btn-sm btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center"
                            style={{ width: 24, height: 24, fontSize: '0.6rem' }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <FaPlus size={8} />
                          </button>
                        </div>
                        <button className="btn btn-sm text-danger p-0" onClick={() => removeFromCart(item.id)} style={{ fontSize: '0.7rem' }}>
                          <FaTrash size={10} />
                        </button>
                      </div>
                    ))}
                    <div className="px-3 py-2 border-top">
                      <div className="d-flex justify-content-between fw-bold mb-2" style={{ color: '#1e3a1e' }}>
                        <span>Total:</span>
                        <span>Rs. {totalAmount.toFixed(2)}</span>
                      </div>
                      <button className="btn w-100 text-white fw-bold rounded-pill" style={{ backgroundColor: '#2d7a35' }}
                        onClick={openCheckout}>
                        Place Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-controls="navbarNav"
            aria-expanded={expanded}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-1">
              {links.map((link) => (
                <li className="nav-item" key={link.to}>
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link px-3 py-2 rounded-pill ${isActive ? 'text-white' : 'text-dark'}`}
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? '#2d7a35' : 'transparent',
                      fontWeight: isActive ? 600 : 400,
                      transition: 'all 0.3s ease',
                    })}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setExpanded(false)}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {showCheckout && (
        <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}
          onClick={orderResult ? resetCheckout : undefined} />
      )}
      {showCheckout && (
        <div className="modal fade show d-block" style={{ zIndex: 1055 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content" style={{ borderRadius: '16px', border: 'none', maxHeight: '90vh' }}>
              <div className="modal-header border-0" style={{ backgroundColor: '#fdf7e6' }}>
                <h5 className="modal-title fw-bold" style={{ color: '#1e3a1e' }}>
                  {!orderResult ? <><FaShoppingCart className="me-2 text-success" />Checkout</> : <><FaCheckCircle className="me-2 text-success" />Order Placed!</>}
                </h5>
                <button type="button" className="btn-close" onClick={resetCheckout} />
              </div>

              {!orderResult ? (
                <form onSubmit={placeOrder}>
                  <div className="modal-body" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                    <div className="mb-3 p-3 rounded-3" style={{ backgroundColor: '#e8f5e9', maxHeight: '200px', overflow: 'auto' }}>
                      {cart.map((item, i) => (
                        <div key={item.id} className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small"><strong>{item.name}</strong> × {item.quantity}</span>
                          <span className="small fw-bold" style={{ color: '#2d7a35' }}>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <hr className="my-2" />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total</span>
                        <span style={{ color: '#2d7a35' }}>Rs. {totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <label className="form-label small fw-bold">Your Name *</label>
                      <input type="text" className="form-control" name="customer_name" required
                        value={orderForm.customer_name} onChange={handleOrderChange} placeholder="Enter your name"
                        style={{ borderRadius: '10px' }} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label small fw-bold">Phone Number *</label>
                      <input type="tel" className="form-control" name="phone" required
                        value={orderForm.phone} onChange={handleOrderChange} placeholder="Enter your phone"
                        style={{ borderRadius: '10px' }} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label small fw-bold">Address</label>
                      <textarea className="form-control" name="address" rows="2"
                        value={orderForm.address} onChange={handleOrderChange} placeholder="Delivery address (optional)"
                        style={{ borderRadius: '10px' }} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label small fw-bold">Notes</label>
                      <textarea className="form-control" name="notes" rows="2"
                        value={orderForm.notes} onChange={handleOrderChange} placeholder="Any special instructions"
                        style={{ borderRadius: '10px' }} />
                    </div>
                  </div>
                  <div className="modal-footer border-0">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={resetCheckout}>Cancel</button>
                    <button type="submit" className="btn rounded-pill px-4 text-white fw-bold"
                      style={{ backgroundColor: '#2d7a35' }} disabled={submitting}>
                      {submitting ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="modal-body text-center py-4" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                  <FaCheckCircle size={48} style={{ color: '#2d7a35' }} />
                  <h5 className="fw-bold mt-3" style={{ color: '#1e3a1e' }}>Order Confirmed!</h5>
                  <p className="text-muted small">Your order has been placed successfully.</p>

                  <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: '#e8f5e9' }}>
                    <div className="small text-muted">Order ID</div>
                    <div className="fw-bold" style={{ fontSize: '1.1rem', color: '#1e3a1e' }}>{orderResult.order_id}</div>
                    <button className="btn btn-sm btn-outline-success mt-2 rounded-pill" onClick={copyOrderId}>
                      {copied ? <><FaCheck className="me-1" />Copied!</> : <><FaCopy className="me-1" />Copy Order ID</>}
                    </button>
                  </div>

                  <div className="mb-3">
                    <p className="small fw-bold mb-2" style={{ color: '#1e3a1e' }}>Pay via Google Pay</p>
                    <div className="d-flex justify-content-center">
                      <div style={{ width: 180, height: 180, background: '#f0f0f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #ccc' }}>
                        <img src="/qr.png" alt="GPay QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }}
                          onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class=\'text-muted small\'>QR code not set yet</span>'; }} />
                      </div>
                    </div>
                  </div>

                  <a href={`https://wa.me/${waNumber}?text=I have placed order ${orderResult.order_id}. Please find the payment screenshot attached.`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn d-inline-flex align-items-center gap-2 text-white fw-bold w-100 justify-content-center rounded-pill"
                    style={{ backgroundColor: '#25D366' }}>
                    <FaWhatsapp size={18} /> Send Payment Screenshot via WhatsApp
                  </a>

                  <button className="btn btn-outline-success rounded-pill w-100 mt-2" onClick={resetCheckout}>
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
