import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api';
import { categories } from '../data/categories';
import {
  GiGrain, GiWheat, GiGrainBundle, GiManualJuicer, GiPowderBag, GiChipsBag, GiFarmTractor, GiOilPump,
  GiLeafSwirl, GiHeartBeats, GiStarfighter, GiFruitBowl, GiPlantRoots, GiWaterDrop,
  GiCheckMark, GiThreeLeaves, GiGreenhouse, GiArrowDunk
} from 'react-icons/gi';
import { FaStar, FaStarHalfAlt, FaRegStar, FaLeaf, FaShieldAlt, FaTruck, FaSeedling, FaAppleAlt, FaRecycle, FaQuoteLeft, FaGoogle } from 'react-icons/fa';
import { useStoreSettings } from '../context/StoreSettingsContext';

const categoryIcons = {
  'GiGrain': GiGrain, 'GiOilPump': GiOilPump, 'GiWheat': GiWheat, 'GiGrainBundle': GiGrainBundle,
  'GiManualJuicer': GiManualJuicer, 'GiPowderBag': GiPowderBag, 'GiChipsBag': GiChipsBag, 'GiFarmTractor': GiFarmTractor,
};

function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push(<FaStar key={i} size={14} color="#e8b83e" />);
    else if (i - 0.5 <= rating) stars.push(<FaStarHalfAlt key={i} size={14} color="#e8b83e" />);
    else stars.push(<FaRegStar key={i} size={14} color="#e8b83e" />);
  }
  return <span className="d-inline-flex gap-1">{stars}</span>;
}

export default function HomePage() {
  const settings = useStoreSettings();
  const [activeTab, setActiveTab] = useState('All');
  const [products, setProducts] = useState([]);
  useEffect(() => { fetchProducts().then(setProducts); }, []);
  const todayAvailable = products.filter(p => p.isAvailableToday);
  const featured = products.filter(p => p.featured).length >= 4 ? products.filter(p => p.featured) : products.slice(0, 8);
  const filteredProducts = activeTab === 'All' ? featured : featured.filter(p => p.category === activeTab);

  const tabs = ['All', 'Cold Pressed Oils', 'Rice', 'Millets', 'Juices'];

  const benefits = [
    { icon: FaLeaf, title: '100% Pure', desc: 'No additives, preservatives, or chemicals in any product.' },
    { icon: FaShieldAlt, title: 'Chemical Free', desc: 'Grown without synthetic pesticides, fertilizers, or GMOs.' },
    { icon: GiThreeLeaves, title: 'Traditional Wisdom', desc: 'Following age-old farming methods passed down generations.' },
    { icon: FaTruck, title: 'Farm Fresh', desc: 'Directly sourced from farms, delivered fresh to your doorstep.' },
    { icon: FaAppleAlt, title: 'Nutrient Rich', desc: 'Packed with natural vitamins, minerals, and antioxidants.' },
    { icon: FaRecycle, title: 'Eco Friendly', desc: 'Sustainable farming that nurtures the earth for future generations.' },
  ];

  const testimonials = [
    { name: 'Priya S.', location: 'Chennai', text: 'The cold pressed coconut oil is amazing! I can feel the difference in taste and my skin has never been better. Truly authentic products!', rating: 5 },
    { name: 'Ramesh K.', location: 'Coimbatore', text: 'Finally found a place that sells real Karuppu Kavuni rice. The aroma while cooking takes me back to my grandmother\'s kitchen.', rating: 5 },
    { name: 'Lakshmi M.', location: 'Bangalore', text: 'Their health mix powder is a blessing for my kids. They love the taste and I love that it\'s completely natural and nutritious.', rating: 5 },
    { name: 'Venkat R.', location: 'Madurai', text: 'Being a diabetic, I was looking for organic millets. The foxtail millet quality is excellent and the price is very reasonable.', rating: 5 },
    { name: 'Anitha P.', location: 'Trichy', text: 'The neem juice has done wonders for my skin. Pure, potent, and works exactly as promised. Highly recommend Arogya Paadhai!', rating: 5 },
  ];

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = today.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <section className="position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #1e6326 0%, #2d7a35 30%, #56a25d 70%, #7aae7a 100%)',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center text-white">
              <div className="mb-4 animate-fade-in">
                <span className="badge rounded-pill px-4 py-2 mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)', fontSize: '0.9rem', backdropFilter: 'blur(4px)' }}>
                  <FaLeaf className="me-2" />Welcome to Arogya Paadhai
                </span>
              </div>
              <h1 className="display-3 fw-bold mb-3 animate-fade-up" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                Nature's Goodness,<br />Delivered to Your Doorstep
              </h1>
              <p className="lead mb-4 animate-fade-up" style={{ opacity: 0.9, fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                Discover the finest organic foods from the heart of Tamil Nadu. Pure, traditional, and
                naturally nutritious — because you deserve the best nature has to offer.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3 mb-5 animate-fade-up">
                <Link to="/products" className="btn btn-lg rounded-pill px-4 fw-bold" style={{ backgroundColor: '#e8b83e', color: '#1e3a1e', border: 'none' }}>
                  Explore Products <GiArrowDunk className="ms-2" />
                </Link>
                <Link to="/contact" className="btn btn-lg rounded-pill px-4 fw-bold" style={{ backgroundColor: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.6)' }}>
                  Contact Us
                </Link>
              </div>
              <div className="row g-3 justify-content-center animate-fade-up">
                {[{ label: '100% Organic', icon: GiLeafSwirl }, { label: 'Farm Fresh', icon: GiGreenhouse }, { label: 'Traditional Methods', icon: GiPlantRoots }, { label: 'Chemical Free', icon: GiCheckMark }].map((item) => (
                  <div key={item.label} className="col-6 col-md-3">
                    <div className="d-flex align-items-center justify-content-center gap-2 rounded-3 py-2 px-3" style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)' }}>
                      <item.icon size={18} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
          background: 'linear-gradient(to top, #fdf7e6, transparent)',
        }} />
      </section>

      {todayAvailable.length > 0 && (
        <section className="py-5" style={{ backgroundColor: '#f0f8f0' }}>
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
              <div>
                <h2 className="fw-bold mb-1" style={{ color: '#1e3a1e' }}>
                  <FaLeaf className="me-2" style={{ color: '#2d7a35' }} />
                  Available Today
                </h2>
                <p className="text-muted small mb-0">Last updated: {dateStr} at {timeStr}</p>
              </div>
            </div>
            <div className="d-flex overflow-auto pb-2 gap-3" style={{ scrollbarWidth: 'thin' }}>
              {todayAvailable.map((product) => (
                <div key={product.id} className="flex-shrink-0" style={{ width: '260px' }}>
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                    <ProductImage product={product} height="140px" fontSize="3rem" />
                    <div className="card-body p-3">
                      <h6 className="fw-bold mb-1" style={{ color: '#1e3a1e' }}>{product.name}</h6>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="fw-bold" style={{ color: '#2d7a35' }}>&#8377;{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-decoration-line-through text-muted small">&#8377;{product.originalPrice}</span>
                        )}
                      </div>
                      <Link to={`/products/${product.slug}`} className="btn btn-sm w-100 text-white" style={{ backgroundColor: '#2d7a35' }}>
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge rounded-pill px-3 py-2 mb-2" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35' }}>Categories</span>
            <h2 className="fw-bold" style={{ color: '#1e3a1e' }}>Explore Our Collection</h2>
            <p className="text-muted">Handpicked organic products across traditional categories</p>
          </div>
          <div className="row g-3">
            {categories.map((cat) => {
              const IconComp = categoryIcons[cat.icon] || GiLeafSwirl;
              return (
                <div key={cat.id} className="col-6 col-md-3 col-lg-3">
                  <Link to={`/categories/${cat.slug}`} className="text-decoration-none">
                    <div className="card border-0 shadow-sm text-center h-100 category-card" style={{ borderRadius: '16px', transition: 'all 0.3s ease' }}>
                      <div className="card-body p-3">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2" style={{ width: '60px', height: '60px', backgroundColor: '#e8f5e9' }}>
                          <IconComp size={28} style={{ color: '#2d7a35' }} />
                        </div>
                        <h6 className="fw-bold mb-1" style={{ color: '#1e3a1e', fontSize: '0.9rem' }}>{cat.name}</h6>
                        <span className="small" style={{ color: '#2d7a35' }}>{cat.productCount} Products</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: '#f8fcf8' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge rounded-pill px-3 py-2 mb-2" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35' }}>Our Range</span>
            <h2 className="fw-bold" style={{ color: '#1e3a1e' }}>Featured Products</h2>
            <p className="text-muted">Most loved products from our organic collection</p>
          </div>
          <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="btn btn-sm rounded-pill px-3"
                style={{
                  backgroundColor: activeTab === tab ? '#2d7a35' : '#fff',
                  color: activeTab === tab ? '#fff' : '#2d7a35',
                  border: activeTab === tab ? 'none' : '1px solid #2d7a35',
                  transition: 'all 0.3s ease',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="row g-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="col-6 col-md-4 col-lg-3">
                <div className="card border-0 shadow-sm h-100 product-card">
                  <Link to={`/products/${product.slug}`}>
                    <ProductImage product={product} height="160px" fontSize="3rem" />
                  </Link>
                  <div className="card-body p-3">
                    <span className="badge mb-1" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35', fontSize: '0.65rem' }}>{product.category}</span>
                    <h6 className="fw-bold mb-1" style={{ color: '#1e3a1e', fontSize: '0.9rem' }}>{product.name}</h6>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="fw-bold" style={{ color: '#2d7a35' }}>&#8377;{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-decoration-line-through text-muted small">&#8377;{product.originalPrice}</span>
                      )}
                    </div>
                    <Link to={`/products/${product.slug}`} className="btn btn-sm w-100 text-white" style={{ backgroundColor: '#2d7a35' }}>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/products" className="btn rounded-pill px-4" style={{ border: '2px solid #2d7a35', color: '#2d7a35' }}>
              View All Products <GiArrowDunk className="ms-2" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge rounded-pill px-3 py-2 mb-2" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35' }}>Why Choose Us</span>
            <h2 className="fw-bold" style={{ color: '#1e3a1e' }}>Health Benefits</h2>
            <p className="text-muted">What makes Arogya Paadhai your trusted organic partner</p>
          </div>
          <div className="row g-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="col-6 col-md-4 col-lg-4">
                <div className="text-center p-4 benefit-card" style={{ borderRadius: '16px', backgroundColor: '#fff', height: '100%' }}>
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '64px', height: '64px', backgroundColor: '#e8f5e9' }}>
                    <benefit.icon size={28} style={{ color: '#2d7a35' }} />
                  </div>
                  <h6 className="fw-bold mb-2" style={{ color: '#1e3a1e' }}>{benefit.title}</h6>
                  <p className="small text-muted mb-0">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: '#f0f8f0' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge rounded-pill px-3 py-2 mb-2" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35' }}>Testimonials</span>
            <h2 className="fw-bold" style={{ color: '#1e3a1e' }}>What Our Customers Say</h2>
            <p className="text-muted">Real stories from real people who love our products</p>
          </div>
          <div className="row g-4">
            {testimonials.map((t, i) => (
              <div key={i} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                  <div className="card-body p-4">
                    <FaQuoteLeft size={20} style={{ color: '#2d7a35', opacity: 0.3 }} />
                    <p className="mt-2 mb-3 small" style={{ lineHeight: 1.7, fontStyle: 'italic' }}>"{t.text}"</p>
                    <StarRating rating={t.rating} />
                    <div className="mt-2">
                      <strong className="small" style={{ color: '#1e3a1e' }}>{t.name}</strong>
                      <span className="text-muted small"> - {t.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: '#fff' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm text-center p-4" style={{ borderRadius: '16px' }}>
                <div className="d-flex justify-content-center mb-3">
                  <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#f0f8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaGoogle size={32} style={{ color: '#4285F4' }} />
                  </div>
                </div>
                <h4 className="fw-bold mb-2" style={{ color: '#1e3a1e' }}>Love Our Products?</h4>
                <p className="text-muted mb-3">Share your experience on Google and help others discover Arogya Paadhai!</p>
                <div className="mb-3">
                  {[1,2,3,4,5].map(i => <FaStar key={i} size={20} color="#e8b83e" className="me-1" />)}
                </div>
                <a href={settings.google_review_link || 'https://share.google/qkgLx7V3hzFcefKf8'}
                  target="_blank" rel="noopener noreferrer"
                  className="btn d-inline-flex align-items-center gap-2 fw-bold text-white px-4 py-2 rounded-pill"
                  style={{ backgroundColor: '#4285F4' }}>
                  <FaGoogle /> Write a Review
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 position-relative" style={{
        background: 'linear-gradient(135deg, #1e6326, #2d7a35)',
      }}>
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center text-white">
              <h2 className="fw-bold mb-3">Stay Connected with Arogya Paadhai</h2>
              <p className="mb-4" style={{ opacity: 0.9 }}>
                Subscribe to our newsletter for organic living tips, new product announcements, and
                exclusive offers delivered straight to your inbox.
              </p>
              <form className="d-flex flex-wrap justify-content-center gap-2" onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!'); }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email address"
                  required
                  style={{ maxWidth: '380px', borderRadius: '30px', padding: '12px 20px', border: 'none' }}
                />
                <button type="submit" className="btn rounded-pill px-4 fw-bold" style={{ backgroundColor: '#e8b83e', color: '#1e3a1e', border: 'none' }}>
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .category-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important; }
        .product-card { border-radius: 12px; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important; }
        .benefit-card { transition: transform 0.3s ease; }
        .benefit-card:hover { transform: translateY(-4px); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 1s ease forwards; }
        .animate-fade-up { animation: fadeUp 0.8s ease forwards; }
        .animate-fade-up:nth-child(2) { animation-delay: 0.2s; }
        .animate-fade-up:nth-child(3) { animation-delay: 0.4s; }
        .animate-fade-up:nth-child(4) { animation-delay: 0.6s; }
        .img-fade-in { opacity: 0; transition: opacity 0.4s ease; }
        .img-fade-in.loaded { opacity: 1; }
      `}</style>
    </div>
  );
}

function ProductImage({ product, height, fontSize }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="position-relative">
      {!imgError ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-100"
          style={{ height, objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
          onError={() => setImgError(true)}
        />
      ) : null}
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          height,
          background: 'linear-gradient(135deg, #2d7a35, #56a25d)',
          borderRadius: '12px 12px 0 0',
          display: imgError ? 'flex' : 'none',
        }}
      >
        <span style={{ fontSize, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
          {product.name.charAt(0)}
        </span>
      </div>
      {product.isProductOfDay && (
        <span className="position-absolute top-0 start-0 m-2 badge" style={{ backgroundColor: '#e8b83e', color: '#1e3a1e', fontSize: '0.65rem' }}>
          POTD
        </span>
      )}
      <div className="position-absolute top-0 end-0 m-2 d-flex gap-1">
        {product.availability === 'limited' && <span className="badge bg-warning text-dark">Limited</span>}
        {product.availability === 'seasonal' && <span className="badge bg-info text-dark">Seasonal</span>}
        {product.availability === 'in-stock' && <span className="badge bg-success">Today</span>}
      </div>
    </div>
  );
}
