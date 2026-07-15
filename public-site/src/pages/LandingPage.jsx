import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { fetchProducts, fetchTodayProducts } from '../api';
import { GiGreenhouse, GiWheat, GiDroplets, GiOilPump, GiCandyCanes, GiHealthPotion } from 'react-icons/gi';
import {
  FaLeaf, FaBook, FaTimes, FaTruck, FaRecycle, FaHeart,
  FaShieldAlt, FaSun, FaCheck, FaGraduationCap, FaHeartbeat,
  FaBolt, FaStar, FaQuoteLeft, FaArrowRight, FaPaperPlane
} from 'react-icons/fa';

const whyChooseUsIconMap = {
  leaf: FaLeaf, book: FaBook, x: FaTimes, truck: FaTruck, recycle: FaRecycle, heart: FaHeart,
};

const healthBenefitIconMap = {
  shield: FaShieldAlt, sun: FaSun, check: FaCheck, 'book-open': FaGraduationCap, activity: FaHeartbeat, zap: FaBolt,
};

const categoryIcons = [GiGreenhouse, GiWheat, GiDroplets, GiOilPump, GiCandyCanes, GiHealthPotion];

const productImageMap = {
  'black-gram-porridge': '/images/landing/black-gram-porridge.png',
  'kavuni-rice-porridge': '/images/landing/kavuni-rice-porridge.png',
  'pearl-millet-porridge': '/images/landing/pearl-millet-porridge.png',
  'sorghum-porridge': '/images/landing/sorghum-porridge.png',
  'foxtail-millet-porridge': '/images/landing/foxtail-millet-porridge.png',
  'amla-juice': '/images/landing/amla-juice.png',
  'beetroot-juice': '/images/landing/beetroot-juice.png',
  'black-nightshade-juice': '/images/landing/black-nightshade-juice.png',
  'tanner-cassia-juice': '/images/landing/tanner-cassia-juice.png',
  'coconut-oil': '/images/landing/coconut-oil.png',
  'coconut-oil-curry-leaves': '/images/landing/coconut-oil-curry-leaves.png',
  'coconut-oil-hibiscus': '/images/landing/coconut-oil-hibiscus.png',
  'sesame-balls': '/images/landing/sesame-balls.png',
  'black-chickpea': '/images/landing/black-chickpea.png',
};

const categoryImageMap = {
  'porridge': '/images/landing/black-gram-porridge.png',
  'juices': '/images/landing/amla-juice.png',
  'oils': '/images/landing/coconut-oil.png',
  'snacks': '/images/landing/sesame-balls.png',
};

const galleryImages = [
  '/images/landing/black-gram-porridge.png',
  '/images/landing/sorghum-porridge.png',
  '/images/landing/foxtail-millet-porridge.png',
  '/images/landing/beetroot-juice.png',
  '/images/landing/black-nightshade-juice.png',
  '/images/landing/tanner-cassia-juice.png',
  '/images/landing/coconut-oil-curry-leaves.png',
  '/images/landing/amla-juice.png',
  '/images/landing/coconut-oil.png',
];

function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<FaStar key={i} size={14} color="var(--gold)" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<FaStar key={i} size={14} color="var(--gold)" style={{ opacity: 0.5 }} />);
    } else {
      stars.push(<FaStar key={i} size={14} color="var(--gold)" style={{ opacity: 0.25 }} />);
    }
  }
  return <span className="d-inline-flex gap-1">{stars}</span>;
}

function SectionHeader({ badge, title, subtitle, light }) {
  return (
    <div className="text-center mb-5">
      {badge && (
        <span
          className="badge rounded-pill px-3 py-2 mb-2 fw-normal d-inline-flex align-items-center gap-2"
          style={{
            backgroundColor: light ? 'rgba(255,255,255,0.12)' : 'var(--border-light)',
            color: light ? '#fff' : 'var(--primary)',
            fontSize: '0.8rem',
            letterSpacing: '0.5px',
          }}
        >
          {badge}
        </span>
      )}
      <h2
        className="fw-bold mb-2 section-heading"
        style={{
          color: light ? '#fff' : 'var(--text-dark)',
          fontSize: 'calc(1.5rem + 0.6vw)',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mb-0 section-subtitle"
          style={{
            color: light ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
            maxWidth: '600px',
            margin: '0 auto',
            fontSize: '0.95rem',
          }}
        >
          {subtitle}
        </p>
      )}
      <div
        className="section-divider mx-auto mt-3"
        style={{ backgroundColor: light ? 'var(--gold)' : 'var(--primary)' }}
      />
    </div>
  );
}

export default function LandingPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [todayProducts, setTodayProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchTodayProducts().then(setTodayProducts).catch(() => {});
    fetchProducts().then(all => setFeaturedProducts(all.filter(p => p.featured)));
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <div>
      <section
        className="position-relative d-flex align-items-center overflow-hidden"
        style={{
          minHeight: '100vh',
          backgroundImage: 'url(\'/images/landing/Hero Banner.png\')',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: 'linear-gradient(135deg, rgba(30,30,30,0.7) 0%, rgba(30,99,38,0.55) 40%, rgba(45,122,53,0.45) 100%)',
          }}
        />
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: 'linear-gradient(to top, var(--bg-light) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.2) 100%)',
          }}
        />
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row">
            <div className="col-lg-9 mx-auto text-center text-white">
              <div className="animate-fade-in">
                <span
                  className="badge rounded-pill px-4 py-2 mb-4 d-inline-flex align-items-center gap-2"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <FaLeaf size={12} />
                  {t.hero.badge}
                </span>
              </div>
              <h2
                className="fw-bold mb-2 animate-fade-up"
                style={{
                  color: '#fff',
                  textShadow: '0 2px 25px rgba(0,0,0,0.3)',
                  fontSize: '1.8rem',
                  letterSpacing: '1px',
                  opacity: 0.9,
                }}
              >
                ஆரோக்கியப் பாதை
              </h2>
              <h1
                className="display-3 fw-bold mb-3 animate-fade-up"
                style={{
                  color: '#fff',
                  textShadow: '0 2px 25px rgba(0,0,0,0.3)',
                  lineHeight: 1.12,
                  letterSpacing: '-0.5px',
                }}
              >
                {t.hero.headline}
              </h1>
              <p
                className="lead mb-4 animate-fade-up mx-auto"
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  maxWidth: '650px',
                  fontSize: '1.15rem',
                  lineHeight: 1.7,
                }}
              >
                {t.hero.subheadline}
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3 mb-5 animate-fade-up">
                <Link
                  to="/products"
                  className="btn btn-lg rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2"
                  style={{
                    backgroundColor: 'var(--gold)',
                    color: 'var(--text-dark)',
                    border: 'none',
                    padding: '14px 36px',
                    boxShadow: '0 4px 20px rgba(232,184,62,0.4)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(232,184,62,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(232,184,62,0.4)';
                  }}
                >
                  {t.hero.cta1}
                  <FaArrowRight size={14} />
                </Link>
                <Link
                  to="/about"
                  className="btn btn-lg rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#fff',
                    border: '2px solid rgba(255,255,255,0.5)',
                    padding: '14px 36px',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                  }}
                >
                  {t.hero.cta2}
                </Link>
              </div>
              <div className="row g-2 justify-content-center animate-fade-up">
                {[
                  { label: '100% Organic', icon: FaLeaf },
                  { label: 'Farm Fresh', icon: GiGreenhouse },
                  { label: 'Chemical Free', icon: FaCheck },
                  { label: 'Traditional', icon: FaBook },
                ].map((item) => (
                  <div key={item.label} className="col-6 col-md-3 col-lg-auto">
                    <div
                      className="d-flex align-items-center justify-content-center gap-2 rounded-3 py-2 px-3"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <item.icon size={14} style={{ color: 'var(--gold)' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#fff' }}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div
          className="position-absolute animate-float d-none d-lg-block"
          style={{ right: '5%', bottom: '12%', zIndex: 3 }}
        >
          <div
            className="rounded-4 p-3 text-center shadow-lg"
            style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(232,184,62,0.25)',
              minWidth: '140px',
            }}
          >
            <GiGreenhouse size={28} style={{ color: 'var(--primary)' }} />
            <div className="mt-1">
              <span
                className="fw-bold d-block"
                style={{ color: 'var(--text-dark)', fontSize: '0.7rem', lineHeight: 1.2 }}
              >
                {t.hero.floatingBadge}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4" style={{ backgroundColor: 'var(--bg-green-light)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card border-0 shadow-custom-lg overflow-hidden" style={{ borderRadius: 'var(--radius-xl)' }}>
                <div className="row g-0">
                  <div className="col-md-4 d-flex align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))' }}>
                    <div className="text-center text-white py-3">
                      <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '70px', height: '70px', backgroundColor: 'rgba(255,255,255,0.15)' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>{new Date().getDate()}</span>
                      </div>
                      <h5 className="fw-bold mb-1 text-white">Today's Menu</h5>
                      <p className="small mb-0" style={{ opacity: 0.8 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="p-3 p-md-4">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="badge rounded-pill" style={{ backgroundColor: 'var(--primary)', color: '#fff', fontSize: '0.7rem' }}>Available Today</span>
                        <span className="badge rounded-pill" style={{ backgroundColor: 'var(--gold)', color: 'var(--text-dark)', fontSize: '0.7rem' }}>Freshly Prepared</span>
                      </div>
                      <div className="row g-2" id="today-menu-items">
                        {todayProducts.length === 0 ? (
                          <p className="small text-muted mb-0">Loading today's menu...</p>
                        ) : (
                          todayProducts.map((item) => (
                            <div key={item.id} className="col-6 col-md-4">
                              <div className="d-flex align-items-center gap-2 p-2 rounded-3" style={{ backgroundColor: 'var(--bg-green-light)' }}>
                                <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 overflow-hidden" style={{ width: '40px', height: '40px' }}>
                                  <img
                                    src={item.image || '/images/landing/black-gram-porridge.png'}
                                    alt={item.name}
                                    className="w-100 h-100"
                                    style={{ objectFit: 'cover' }}
                                  />
                                </div>
                                <div>
                                  <span className="d-block fw-bold small" style={{ color: 'var(--text-dark)', fontSize: '0.75rem', lineHeight: 1.2 }}>{item.name}</span>
                                  <span className="small" style={{ color: 'var(--primary)', fontSize: '0.7rem' }}>₹{item.price}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="mt-2 text-end">
                        <span className="small" style={{ color: 'var(--text-muted)' }}>✨ Daily menu updates from farm to table</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: 'var(--bg-light)' }}>
        <div className="container">
          <SectionHeader
            badge={t.categories.title}
            title={t.categories.title}
            subtitle={t.categories.subtitle}
          />
          <div className="row g-4">
            {t.categories.items.map((cat, idx) => {
              const catImg = categoryImageMap[cat.image] || productImageMap['black-gram-porridge'];
              return (
                <div key={idx} className="col-6 col-md-3">
                  <Link to="/products" className="text-decoration-none">
                    <div
                      className="card border-0 text-center h-100 overflow-hidden card-hover"
                      style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}
                    >
                      <div style={{ height: '160px', overflow: 'hidden' }}>
                        <img
                          src={catImg}
                          alt={cat.name}
                          className="w-100 h-100"
                          style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        />
                      </div>
                      <div className="card-body p-3">
                        <h6 className="fw-bold mb-1" style={{ color: 'var(--text-dark)', fontSize: '0.85rem' }}>
                          {cat.name}
                        </h6>
                        <p className="small mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4 }}>
                          {cat.desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: 'var(--bg-green-light)' }}>
        <div className="container">
          <SectionHeader
            badge={t.whyChooseUs.title}
            title={t.whyChooseUs.title}
            subtitle={t.whyChooseUs.subtitle}
          />
          <div className="row g-4">
            {t.whyChooseUs.items.map((item, idx) => {
              const IconComp = whyChooseUsIconMap[item.icon] || FaLeaf;
              return (
                <div key={idx} className="col-6 col-md-4">
                  <div
                    className="d-flex flex-column flex-md-row align-items-start gap-3 p-3 p-md-4 h-100"
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-circle"
                      style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: 'var(--border-light)',
                      }}
                    >
                      <IconComp size={22} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div className="text-center text-md-start">
                      <h6 className="fw-bold mb-1" style={{ color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                        {item.title}
                      </h6>
                      <p className="small mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-5 position-relative overflow-hidden" style={{ backgroundColor: 'var(--bg-light)' }}>
        <div
          className="position-absolute"
          style={{
            top: '-80px',
            left: '-80px',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(45,122,53,0.06) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          className="position-absolute"
          style={{
            bottom: '-100px',
            right: '-100px',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(232,184,62,0.05) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div style={{ animation: 'fadeLeft 0.8s ease forwards' }}>
                <span
                  className="badge rounded-pill px-3 py-2 mb-3 fw-normal d-inline-flex align-items-center gap-2"
                  style={{
                    backgroundColor: 'var(--border-light)',
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                  }}
                >
                  <FaLeaf size={10} />
                  {t.brandStory.title}
                </span>
                <h2 className="fw-bold mb-3" style={{ color: 'var(--text-dark)', fontSize: 'calc(1.4rem + 0.5vw)' }}>
                  {t.brandStory.title}
                </h2>
                <p className="mb-4" style={{ color: '#555', lineHeight: 1.8, fontSize: '0.95rem' }}>
                  {t.brandStory.content}
                </p>
                <Link
                  to="/about"
                  className="btn rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 32px',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {t.brandStory.cta}
                  <FaArrowRight size={12} />
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative" style={{ animation: 'fadeRight 0.8s ease forwards' }}>
                <div className="rounded-4 overflow-hidden shadow-custom-lg" style={{ border: '5px solid #fff' }}>
                  <img
                    src="/images/landing/our-story.png"
                    alt={t.brandStory.title}
                    className="w-100"
                    style={{ aspectRatio: '4/3', objectFit: 'cover', display: 'block', width: '100%' }}
                  />
                </div>
                <div
                  className="position-absolute d-none d-lg-flex align-items-center justify-content-center rounded-circle shadow"
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'var(--primary)',
                    bottom: '-20px',
                    left: '-20px',
                    border: '4px solid #fff',
                  }}
                >
                  <FaLeaf size={30} color="#fff" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: 'var(--bg-green-light)' }}>
        <div className="container">
          <SectionHeader
            badge={t.featuredProducts.title}
            title={t.featuredProducts.title}
            subtitle={t.featuredProducts.subtitle}
          />
          <div className="row g-4">
            {(featuredProducts.length > 0 ? featuredProducts : t.featuredProducts.items.map(i => ({ ...i, price: i.price.replace('₹', '') }))).map((item, idx) => {
              const imgSrc = productImageMap[item.slug] || productImageMap[item.image];
              return (
                <div key={idx} className="col-6 col-lg-4">
                  <div
                    className="card border-0 h-100 overflow-hidden card-hover"
                    style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}
                  >
                    <Link to={`/products/${item.slug}`}>
                      <div style={{ height: '200px', overflow: 'hidden' }}>
                        <img
                          src={imgSrc}
                          alt={item.name}
                          className="w-100 h-100"
                          style={{
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        />
                      </div>
                    </Link>
                    <div className="card-body p-3 d-flex flex-column">
                      <Link to={`/products/${item.slug}`} className="text-decoration-none">
                        <h6 className="fw-bold mb-1" style={{ color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                          {item.name}
                        </h6>
                      </Link>
                      <p className="small mb-2 flex-grow-1" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {item.description || item.desc}
                      </p>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="fw-bold" style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>
                          ₹{item.price}
                        </span>
                        <Link
                          to={`/products/${item.slug}`}
                          className="btn btn-sm rounded-pill text-white d-inline-flex align-items-center gap-1"
                          style={{
                            backgroundColor: 'var(--primary)',
                            border: 'none',
                            padding: '6px 16px',
                            fontSize: '0.78rem',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--primary)';
                          }}
                        >
                          {t.common.addToCart}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-4">
            <Link
              to="/products"
              className="btn rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--primary)',
                border: '2px solid var(--primary)',
                padding: '10px 28px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--primary)';
              }}
            >
              {t.common.viewAll}
              <FaArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: 'var(--bg-light)' }}>
        <div className="container">
          <SectionHeader
            badge={t.testimonials.title}
            title={t.testimonials.title}
            subtitle="Real stories from people who trust Arogya Paadhai"
          />
          <div className="row g-4">
            {t.testimonials.items.map((testimonial, idx) => (
              <div key={idx} className="col-md-6 col-lg-3">
                <div
                  className="card border-0 h-100 card-hover"
                  style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}
                >
                  <div className="card-body p-4 d-flex flex-column">
                    <FaQuoteLeft size={24} style={{ color: 'var(--primary)', opacity: 0.15 }} />
                    <p
                      className="mt-2 mb-3 flex-grow-1"
                      style={{
                        color: '#555',
                        fontSize: '0.85rem',
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                      }}
                    >
                      &ldquo;{testimonial.review}&rdquo;
                    </p>
                    <div className="mb-2">
                      <StarRating rating={testimonial.rating} />
                    </div>
                    <div className="d-flex align-items-center gap-3 pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{
                          width: '44px',
                          height: '44px',
                          backgroundColor: 'var(--border-light)',
                          color: 'var(--primary)',
                          fontWeight: 700,
                          fontSize: '1rem',
                        }}
                      >
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <strong className="d-block small" style={{ color: 'var(--text-dark)', fontSize: '0.82rem' }}>
                          {testimonial.name}
                        </strong>
                        <span className="small" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {testimonial.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: 'var(--bg-green-light)' }}>
        <div className="container">
          <SectionHeader
            badge={t.healthBenefits.title}
            title={t.healthBenefits.title}
            subtitle={t.healthBenefits.subtitle}
          />
          <div className="row g-4">
            {t.healthBenefits.items.map((item, idx) => {
              const IconComp = healthBenefitIconMap[item.icon] || FaShieldAlt;
              return (
                <div key={idx} className="col-6 col-md-4">
                  <div
                    className="text-center p-4 h-100"
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      const circle = e.currentTarget.querySelector('.benefit-icon-circle');
                      if (circle) {
                        circle.style.backgroundColor = 'var(--primary)';
                      }
                      const icon = e.currentTarget.querySelector('.benefit-icon');
                      if (icon) {
                        icon.style.color = '#fff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      const circle = e.currentTarget.querySelector('.benefit-icon-circle');
                      if (circle) {
                        circle.style.backgroundColor = 'var(--border-light)';
                      }
                      const icon = e.currentTarget.querySelector('.benefit-icon');
                      if (icon) {
                        icon.style.color = 'var(--primary)';
                      }
                    }}
                  >
                    <div
                      className="benefit-icon-circle d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                      style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'var(--border-light)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <IconComp
                        className="benefit-icon"
                        size={28}
                        style={{ color: 'var(--primary)', transition: 'color 0.3s ease' }}
                      />
                    </div>
                    <h6 className="fw-bold mb-2" style={{ color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                      {item.title}
                    </h6>
                    <p className="small mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: 'var(--bg-light)' }}>
        <div className="container">
          <SectionHeader
            badge={t.gallery.title}
            title={t.gallery.title}
            subtitle={t.gallery.subtitle}
          />
          <div className="row g-3">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                className={idx === 0 ? 'col-12 col-md-6' : 'col-6 col-md-3'}
              >
                <div
                  className="position-relative overflow-hidden rounded-4 shadow-sm"
                  style={{
                    height: idx === 0 ? '360px' : '220px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget.querySelector('img');
                    if (el) el.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget.querySelector('img');
                    if (el) el.style.transform = 'scale(1)';
                  }}
                >
                  <img
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  />
                  <div
                    className="position-absolute bottom-0 start-0 w-100 p-3"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link
              to="/gallery"
              className="btn rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--primary)',
                border: '2px solid var(--primary)',
                padding: '10px 28px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--primary)';
              }}
            >
              {t.common.viewAll}
              <FaArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="py-5 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--primary-light) 100%)',
        }}
      >
        <div
          className="position-absolute rounded-circle"
          style={{
            width: '350px',
            height: '350px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            top: '-120px',
            right: '-60px',
          }}
        />
        <div
          className="position-absolute rounded-circle"
          style={{
            width: '250px',
            height: '250px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            bottom: '-80px',
            left: '-60px',
          }}
        />
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row justify-content-center">
            <div className="col-lg-7 text-center text-white">
              <div className="mb-4">
                <FaPaperPlane size={28} style={{ opacity: 0.6 }} />
              </div>
              <h2 className="fw-bold mb-3" style={{ color: '#fff', fontSize: 'calc(1.3rem + 0.5vw)' }}>
                {t.newsletter.title}
              </h2>
              <p
                className="mb-4 mx-auto"
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  maxWidth: '550px',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                }}
              >
                {t.newsletter.subtitle}
              </p>
              {subscribed ? (
                <div
                  className="d-inline-flex align-items-center gap-2 rounded-pill px-4 py-2 mx-auto"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <FaCheck size={14} />
                  Thank you for subscribing!
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="d-flex flex-wrap justify-content-center gap-2 mx-auto"
                  style={{ maxWidth: '520px' }}
                >
                  <div className="flex-grow-1" style={{ minWidth: '220px' }}>
                    <input
                      type="email"
                      className="form-control form-control-lg rounded-pill border-0"
                      placeholder={t.newsletter.placeholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        padding: '14px 22px',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-lg rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2"
                    style={{
                      backgroundColor: 'var(--gold)',
                      color: 'var(--text-dark)',
                      border: 'none',
                      padding: '14px 32px',
                      boxShadow: '0 4px 15px rgba(232,184,62,0.3)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(232,184,62,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(232,184,62,0.3)';
                    }}
                  >
                    {t.newsletter.button}
                    <FaPaperPlane size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
