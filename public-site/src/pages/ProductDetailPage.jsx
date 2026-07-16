import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaWhatsapp, FaStar, FaStarHalfAlt, FaRegStar, FaCheckCircle, FaShippingFast, FaLeaf, FaArrowLeft, FaHome, FaShoppingBag, FaCopy, FaCheck } from 'react-icons/fa';
import { fetchProducts, fetchProduct, API_BASE } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { useStoreSettings } from '../context/StoreSettingsContext';

function StarRating({ rating, size = 14 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push(<FaStar key={i} size={size} color="#e8b83e" />);
    else if (i - 0.5 <= rating) stars.push(<FaStarHalfAlt key={i} size={size} color="#e8b83e" />);
    else stars.push(<FaRegStar key={i} size={size} color="#e8b83e" />);
  }
  return <span className="d-inline-flex gap-1 align-items-center">{stars}<small className="ms-2 text-muted">({rating} / 5)</small></span>;
}

function ProductImage({ product, height, fontSize, rounded }) {
  const [imgError, setImgError] = useState(false);

  return (
    <>
      {!imgError ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-100"
          style={{ height, objectFit: 'cover', borderRadius: rounded || '8px' }}
          onError={() => setImgError(true)}
        />
      ) : null}
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          height,
          background: 'linear-gradient(135deg, #2d7a35, #56a25d)',
          borderRadius: rounded || '8px',
          display: imgError ? 'flex' : 'none',
        }}
      >
        <span style={{ fontSize, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {product.name.charAt(0)}
        </span>
      </div>
    </>
  );
}

export default function ProductDetailPage() {
  const { t } = useLanguage();
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState('description');
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderStep, setOrderStep] = useState(1);
  const [orderResult, setOrderResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderForm, setOrderForm] = useState({ customer_name: '', phone: '', address: '', quantity: 1, notes: '' });
  const settings = useStoreSettings();

  const waNumber = (settings.whatsapp || '+91 82201 28785').replace(/[^0-9]/g, '');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    Promise.all([fetchProduct(slug), fetchProducts()]).then(([p, all]) => {
      setProduct(p);
      if (p) setRelated(all.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.customer_name.trim() || !orderForm.phone.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: orderForm.customer_name.trim(),
          phone: orderForm.phone.trim(),
          address: orderForm.address.trim(),
          notes: orderForm.notes.trim(),
          items: [{ name: product.name, quantity: parseInt(orderForm.quantity) || 1, price: product.price }],
          total_amount: (parseInt(orderForm.quantity) || 1) * product.price,
        }),
      });
      if (!res.ok) throw new Error('Order failed');
      const data = await res.json();
      setOrderResult(data);
      setOrderStep(2);
    } catch (err) {
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyOrderId = () => {
    if (orderResult) {
      navigator.clipboard.writeText(orderResult.order_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetOrderModal = () => {
    setShowOrderModal(false);
    setOrderStep(1);
    setOrderResult(null);
    setOrderForm({ customer_name: '', phone: '', address: '', quantity: 1, notes: '' });
    setCopied(false);
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;

  if (!product) {
    return (
      <div className="py-5" style={{ backgroundColor: '#fdf7e6', minHeight: '60vh' }}>
        <div className="container text-center py-5">
          <div style={{ fontSize: '5rem', opacity: 0.3, marginBottom: '1rem' }}>&#128533;</div>
          <h3 className="fw-bold" style={{ color: '#1e3a1e' }}>{t.pages.productDetail.notFound}</h3>
          <p className="text-muted">{t.pages.productDetail.notFoundHint}</p>
          <Link to="/products" className="btn rounded-pill px-4" style={{ backgroundColor: '#2d7a35', color: '#fff' }}>
            <FaArrowLeft className="me-2" />{t.pages.productDetail.backToProducts}
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'description', label: t.pages.productDetail.tabDescription },
    { id: 'ingredients', label: t.pages.productDetail.tabIngredients },
    { id: 'benefits', label: t.pages.productDetail.tabBenefits },
    { id: 'usage', label: t.pages.productDetail.tabUsage },
  ];

  const availabilityBadge = {
    'in-stock': { label: t.pages.productDetail.inStock, class: 'bg-success' },
    'limited': { label: t.pages.productDetail.limitedStock, class: 'bg-warning text-dark' },
    'out-of-stock': { label: t.pages.productDetail.outOfStock, class: 'bg-secondary' },
    'seasonal': { label: t.pages.productDetail.seasonal, class: 'bg-info text-dark' },
  }[product.availability] || { label: product.availability, class: 'bg-secondary' };

  return (
    <div style={{ backgroundColor: '#fdf7e6' }}>
      <div className="container py-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none" style={{ color: '#2d7a35' }}><FaHome className="me-1" />{t.pages.productDetail.home}</Link></li>
            <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none" style={{ color: '#2d7a35' }}>{t.pages.productDetail.products}</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
          </ol>
        </nav>
      </div>

      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="rounded-4 overflow-hidden">
              <ProductImage product={product} height="400px" fontSize="8rem" rounded="16px" />
            </div>
            {product.isProductOfDay && (
              <div className="d-flex align-items-center gap-2 mt-3 p-3 rounded-3" style={{ backgroundColor: '#fff3cd' }}>
                <FaLeaf style={{ color: '#2d7a35' }} />
                  <span className="fw-bold small" style={{ color: '#1e3a1e' }}>{t.pages.productDetail.productOfDay}</span>
              </div>
            )}
          </div>

          <div className="col-lg-7">
            <div className="mb-2">
              <span className="badge me-2" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35' }}>{product.category}</span>
              <span className={`badge ${availabilityBadge.class}`}>{availabilityBadge.label}</span>
            </div>

            <h1 className="fw-bold mb-2" style={{ color: '#1e3a1e', fontSize: '2rem' }}>{product.name}</h1>

            <StarRating rating={product.rating} size={16} />
            <span className="ms-2 text-muted small">{t.pages.productDetail.reviewsCount.replace('{count}', product.reviews)}</span>

            <div className="d-flex align-items-center gap-3 my-3">
              <span className="fw-bold" style={{ color: '#2d7a35', fontSize: '2rem' }}>&#8377;{product.price}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-decoration-line-through text-muted" style={{ fontSize: '1.3rem' }}>&#8377;{product.originalPrice}</span>
                  <span className="badge rounded-pill" style={{ backgroundColor: '#ff4444', color: '#fff' }}>
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="mb-4" style={{ lineHeight: 1.8, color: '#555' }}>{product.description}</p>

            <div className="d-flex flex-wrap gap-2 mb-4">
              <button
                className="btn d-flex align-items-center gap-2 px-4 fw-bold text-white"
                style={{ backgroundColor: '#2d7a35', borderRadius: '30px', border: 'none' }}
                onClick={() => setShowOrderModal(true)}
              >
                <FaShoppingBag size={18} /> Pre-Order Now
              </button>
              <a
                href={`https://wa.me/${waNumber}?text=Hi! I want to order ${product.name} (&#8377;${product.price})`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn d-flex align-items-center gap-2 px-4 text-white fw-bold"
                style={{ backgroundColor: '#25D366', borderRadius: '30px' }}
              >
                <FaWhatsapp size={20} /> Enquire on WhatsApp
              </a>
            </div>

            <div className="d-flex flex-wrap gap-3 small" style={{ color: '#666' }}>
              <span className="d-flex align-items-center gap-1"><FaLeaf style={{ color: '#2d7a35' }} /> {t.pages.productDetail.organic}</span>
              <span className="d-flex align-items-center gap-1"><FaShippingFast style={{ color: '#2d7a35' }} /> {t.pages.productDetail.freeDelivery}</span>
              <span className="d-flex align-items-center gap-1"><FaCheckCircle style={{ color: '#2d7a35' }} /> {t.pages.productDetail.qualityGuaranteed}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-header bg-transparent border-bottom-0 pt-3 px-4">
                <ul className="nav nav-tabs border-0">
                  {tabs.map(tab => (
                    <li key={tab.id} className="nav-item">
                      <button
                        className={`nav-link border-0 fw-bold ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          color: activeTab === tab.id ? '#2d7a35' : '#888',
                          borderBottom: activeTab === tab.id ? '3px solid #2d7a35' : '3px solid transparent',
                        }}
                      >
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-body p-4">
                {activeTab === 'description' && (
                  <div>
                    <p style={{ lineHeight: 1.8, color: '#555' }}>{product.description}</p>
                    <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: '#f0f8f0' }}>
                      <strong style={{ color: '#2d7a35' }}>{t.pages.productDetail.shelfLife}</strong>
                      <span className="ms-2 text-muted">{product.shelfLife}</span>
                    </div>
                  </div>
                )}
                {activeTab === 'ingredients' && (
                  <ul className="list-unstyled">
                    {product.ingredients.map((ing, i) => (
                      <li key={i} className="d-flex align-items-center gap-2 mb-2">
                        <FaCheckCircle style={{ color: '#2d7a35' }} size={14} />
                        <span>{ing}</span>
                      </li>
                    ))}
                    <li className="mt-3 small text-muted">{t.pages.productDetail.noPreservatives}</li>
                  </ul>
                )}
                {activeTab === 'benefits' && (
                  <div className="row g-2">
                    {product.benefits.map((benefit, i) => (
                      <div key={i} className="col-md-6">
                        <div className="d-flex align-items-center gap-2 p-2 rounded-3" style={{ backgroundColor: '#f0f8f0' }}>
                          <FaLeaf style={{ color: '#2d7a35' }} />
                          <span className="small">{benefit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'usage' && (
                  <div>
                    <div className="mb-3">
                      <h6 className="fw-bold" style={{ color: '#2d7a35' }}>{t.pages.productDetail.howToUse}</h6>
                      <p style={{ lineHeight: 1.8, color: '#555' }}>{product.usage}</p>
                    </div>
                    <div>
                      <h6 className="fw-bold" style={{ color: '#2d7a35' }}>{t.pages.productDetail.storageInstructions}</h6>
                      <p style={{ lineHeight: 1.8, color: '#555' }}>{product.storage}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3" style={{ color: '#1e3a1e' }}>{t.pages.productDetail.productInfo}</h6>
                <ul className="list-unstyled small">
                  <li className="d-flex justify-content-between py-2 border-bottom"><span className="text-muted">{t.pages.productDetail.category}</span><span style={{ color: '#2d7a35' }}>{product.category}</span></li>
                  <li className="d-flex justify-content-between py-2 border-bottom"><span className="text-muted">{t.pages.productDetail.availability}</span><span className={`badge ${availabilityBadge.class}`}>{availabilityBadge.label}</span></li>
                  <li className="d-flex justify-content-between py-2 border-bottom"><span className="text-muted">{t.pages.productDetail.shelfLife.replace(':', '')}</span><span>{product.shelfLife}</span></li>
                  <li className="d-flex justify-content-between py-2 border-bottom"><span className="text-muted">{t.pages.productDetail.rating}</span><span><StarRating rating={product.rating} size={12} /></span></li>
                  <li className="d-flex justify-content-between py-2"><span className="text-muted">{t.pages.productDetail.reviewsLabel}</span><span>{product.reviews}</span></li>
                </ul>
              </div>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#e8f5e9' }}>
              <div className="card-body p-4 text-center">
                <FaWhatsapp size={32} style={{ color: '#25D366' }} />
                <h6 className="fw-bold mt-2" style={{ color: '#1e3a1e' }}>{t.pages.productDetail.haveQuestion}</h6>
                <p className="small text-muted">{t.pages.productDetail.chatDesc}</p>
                <a
                  href={`https://wa.me/${waNumber}?text=Hi! I have a question about ${product.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn d-inline-flex align-items-center gap-2 text-white fw-bold"
                  style={{ backgroundColor: '#25D366', borderRadius: '30px' }}
                >
                    <FaWhatsapp /> {t.pages.productDetail.chatNow}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="container pb-5">
          <h4 className="fw-bold mb-4" style={{ color: '#1e3a1e' }}>{t.pages.productDetail.relatedProducts}</h4>
          <div className="row g-3">
            {related.map((r) => (
              <div key={r.id} className="col-6 col-md-3">
                <div className="card border-0 shadow-sm product-card h-100">
                  <Link to={`/products/${r.slug}`}>
                    <ProductImage product={r} height="130px" fontSize="2.5rem" rounded="12px 12px 0 0" />
                  </Link>
                  <div className="card-body p-3">
                    <h6 className="fw-bold small mb-1" style={{ color: '#1e3a1e' }}>{r.name}</h6>
                    <span className="fw-bold" style={{ color: '#2d7a35' }}>&#8377;{r.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showOrderModal && (
        <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}
          onClick={orderStep === 2 ? resetOrderModal : undefined} />
      )}
      {showOrderModal && (
        <div className="modal fade show d-block" style={{ zIndex: 1055 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '16px', border: 'none' }}>
              <div className="modal-header border-0" style={{ backgroundColor: '#fdf7e6' }}>
                <h5 className="modal-title fw-bold" style={{ color: '#1e3a1e' }}>
                  {orderStep === 1 ? <><FaShoppingBag className="me-2 text-success" />Pre-Order</> : <><FaCheckCircle className="me-2 text-success" />Order Placed!</>}
                </h5>
                <button type="button" className="btn-close" onClick={resetOrderModal} />
              </div>

              {orderStep === 1 && (
                <form onSubmit={placeOrder}>
                  <div className="modal-body">
                    <div className="d-flex align-items-center gap-3 mb-3 p-3 rounded-3" style={{ backgroundColor: '#e8f5e9' }}>
                      <div style={{ width: 50, height: 50, borderRadius: 8, background: '#2d7a35', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
                        {product.name.charAt(0)}
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0" style={{ color: '#1e3a1e' }}>{product.name}</h6>
                        <span className="fw-bold" style={{ color: '#2d7a35' }}>Rs.{product.price} × {orderForm.quantity}</span>
                        <div className="fw-bold mt-1">Total: Rs.{(parseInt(orderForm.quantity) || 1) * product.price}</div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <label className="form-label small fw-bold">Quantity</label>
                      <input type="number" className="form-control" name="quantity" min="1" value={orderForm.quantity}
                        onChange={handleOrderChange} style={{ borderRadius: '10px' }} />
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
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={resetOrderModal}>Cancel</button>
                    <button type="submit" className="btn rounded-pill px-4 text-white fw-bold"
                      style={{ backgroundColor: '#2d7a35' }} disabled={submitting}>
                      {submitting ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </form>
              )}

              {orderStep === 2 && orderResult && (
                <div className="modal-body text-center py-4">
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

                  <a href={`https://wa.me/${waNumber}?text=I have placed order ${orderResult.order_id} for ${product.name}. Please find the payment screenshot attached.`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn d-inline-flex align-items-center gap-2 text-white fw-bold w-100 justify-content-center rounded-pill"
                    style={{ backgroundColor: '#25D366' }}>
                    <FaWhatsapp size={18} /> Send Payment Screenshot via WhatsApp
                  </a>

                  <button className="btn btn-outline-success rounded-pill w-100 mt-2" onClick={resetOrderModal}>
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .product-card { border-radius: 12px; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important; }
        .nav-link.active { background: transparent !important; }
      `}</style>
    </div>
  );
}
