import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaWhatsapp, FaStar, FaStarHalfAlt, FaRegStar, FaCheckCircle, FaShippingFast, FaLeaf, FaArrowLeft, FaHome, FaShoppingCart } from 'react-icons/fa';
import { fetchProducts, fetchProduct, fetchReviews, submitReview } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { useCart } from '../context/CartContext';

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
  const [addedQty, setAddedQty] = useState(1);
  const [showAddedMsg, setShowAddedMsg] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [submitReviewLoading, setSubmitReviewLoading] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const settings = useStoreSettings();
  const { addToCart } = useCart();

  const waNumber = (settings.whatsapp || '+91 82201 28785').replace(/[^0-9]/g, '');

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image }, addedQty);
    setShowAddedMsg(true);
    setTimeout(() => setShowAddedMsg(false), 2000);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    Promise.all([fetchProduct(slug), fetchProducts()]).then(([p, all]) => {
      setProduct(p);
      if (p) setRelated(all.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (product) {
      fetchReviews(product.id).then(data => {
        setReviews(data.reviews || []);
        setProduct(prev => prev ? { ...prev, rating: data.average_rating, reviews: data.total_reviews } : prev);
      }).catch(() => {});
    }
  }, [product?.id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.rating) return;
    setSubmitReviewLoading(true);
    try {
      await submitReview(product.id, reviewForm);
      setReviewSubmitted(true);
      setReviewForm({ name: '', rating: 5, comment: '' });
      const data = await fetchReviews(product.id);
      setReviews(data.reviews || []);
      setProduct(prev => prev ? { ...prev, rating: data.average_rating, reviews: data.total_reviews } : prev);
      setTimeout(() => setReviewSubmitted(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitReviewLoading(false);
    }
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
    { id: 'reviews', label: `Reviews (${product?.reviews || 0})` },
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

            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="d-flex align-items-center border rounded-pill overflow-hidden" style={{ borderColor: '#2d7a35 !important' }}>
                <button className="btn btn-sm px-3 py-2 border-0" style={{ color: '#2d7a35' }}
                  onClick={() => setAddedQty(q => Math.max(1, q - 1))}>−</button>
                <span className="fw-bold px-2" style={{ color: '#1e3a1e' }}>{addedQty}</span>
                <button className="btn btn-sm px-3 py-2 border-0" style={{ color: '#2d7a35' }}
                  onClick={() => setAddedQty(q => q + 1)}>+</button>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2 mb-4">
              <button
                className="btn d-flex align-items-center gap-2 px-4 fw-bold text-white"
                style={{ backgroundColor: '#2d7a35', borderRadius: '30px', border: 'none' }}
                onClick={handleAddToCart}
              >
                <FaShoppingCart size={18} /> {showAddedMsg ? 'Added!' : 'Add to Cart'}
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
                {activeTab === 'reviews' && (
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="text-center">
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2d7a35' }}>{product.rating || 0}</div>
                        <StarRating rating={product.rating} size={14} />
                        <div className="small text-muted mt-1">{product.reviews} reviews</div>
                      </div>
                    </div>

                    {reviews.length > 0 ? (
                      <div className="mb-4">
                        <h6 className="fw-bold mb-3" style={{ color: '#1e3a1e' }}>Customer Reviews</h6>
                        {reviews.map((r, i) => (
                          <div key={r.id} className="p-3 rounded-3 mb-2" style={{ backgroundColor: '#f8fcf8' }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <strong style={{ color: '#1e3a1e' }}>{r.name}</strong>
                              <small className="text-muted">{new Date(r.created_at).toLocaleDateString('en-IN')}</small>
                            </div>
                            <div className="mb-1">
                              {[1,2,3,4,5].map(s => (
                                <FaStar key={s} size={12} color={s <= r.rating ? '#e8b83e' : '#ddd'} className="me-1" />
                              ))}
                            </div>
                            {r.comment && <p className="small mb-0" style={{ color: '#555' }}>{r.comment}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted small mb-4">No reviews yet. Be the first to review!</p>
                    )}

                    <hr />
                    <h6 className="fw-bold mb-3" style={{ color: '#1e3a1e' }}>Write a Review</h6>
                    {reviewSubmitted && (
                      <div className="alert alert-success py-2 small">Thank you for your review!</div>
                    )}
                    <form onSubmit={handleSubmitReview}>
                      <div className="mb-2">
                        <label className="form-label small fw-bold">Your Name *</label>
                        <input type="text" className="form-control" value={reviewForm.name}
                          onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Enter your name" required style={{ borderRadius: '10px' }} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-bold">Rating *</label>
                        <div className="d-flex gap-1">
                          {[1,2,3,4,5].map(s => (
                            <FaStar key={s} size={24}
                              style={{ cursor: 'pointer', color: s <= reviewForm.rating ? '#e8b83e' : '#ddd' }}
                              onClick={() => setReviewForm(f => ({ ...f, rating: s }))} />
                          ))}
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-bold">Comment</label>
                        <textarea className="form-control" rows="2" value={reviewForm.comment}
                          onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                          placeholder="Share your experience (optional)" style={{ borderRadius: '10px' }} />
                      </div>
                      <button type="submit" className="btn text-white fw-bold rounded-pill px-4"
                        style={{ backgroundColor: '#2d7a35' }} disabled={submitReviewLoading}>
                        {submitReviewLoading ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
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

      <style>{`
        .product-card { border-radius: 12px; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important; }
        .nav-link.active { background: transparent !important; }
      `}</style>
    </div>
  );
}
