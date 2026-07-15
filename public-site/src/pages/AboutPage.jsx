import { FaLeaf, FaSeedling, FaHandHoldingHeart, FaRecycle, FaQuoteLeft, FaArrowRight } from 'react-icons/fa';
import { GiGreenhouse, GiThreeLeaves, GiFarmer, GiHeartBeats } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();
  const values = [
    { icon: FaLeaf, title: 'Purity First', desc: 'We never compromise on quality. Every product is tested for purity and authenticity.' },
    { icon: GiThreeLeaves, title: 'Traditional Wisdom', desc: 'Our methods are rooted in centuries-old Tamil agricultural traditions and wisdom.' },
    { icon: FaHandHoldingHeart, title: 'Community Support', desc: 'We work directly with local farmers, ensuring fair prices and sustainable livelihoods.' },
    { icon: FaRecycle, title: 'Eco-Friendly', desc: 'From farm to doorstep, we minimize our environmental footprint at every step.' },
  ];

  return (
    <div>
      <section className="py-5 position-relative" style={{ background: 'linear-gradient(135deg, #1e6326, #2d7a35)' }}>
        <div className="container text-center text-white py-4">
          <h1 className="fw-bold display-4 mb-3">{t.pages.about.title}</h1>
          <p className="lead" style={{ opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            {t.pages.about.subtitle}
          </p>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: '#fdf7e6' }}>
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <img
                src="/images/landing/our-journey.png"
                alt="Our Journey"
                className="w-100 rounded-4"
                style={{ height: '400px', objectFit: 'cover' }}
              />
            </div>
            <div className="col-lg-6">
              <span className="badge rounded-pill px-3 py-2 mb-3" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35' }}>{t.pages.about.journeyBadge}</span>
              <h2 className="fw-bold mb-3" style={{ color: '#1e3a1e' }}>{t.pages.about.journeyTitle}</h2>
              <p style={{ lineHeight: 1.8, color: '#555' }}>
                Arogya Paadhai was born from a simple realization — the food our grandmothers grew up eating was vastly different
                from what we consume today. Founded in 2015, our journey began in the lush farmlands of Tamil Nadu, where we
                witnessed firsthand the rich tradition of organic farming that has sustained communities for generations.
              </p>
              <p style={{ lineHeight: 1.8, color: '#555' }}>
                We saw farmers struggling to sustain traditional practices while consumers searched for genuinely healthy food options.
                Arogya Paadhai became the bridge — connecting traditional farmers with health-conscious families. Today, we work
                with over 50 farming families across Tamil Nadu, bringing you the purest organic foods while preserving ancient
                agricultural wisdom and supporting rural communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: '#f0f8f0' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '50px', height: '50px', backgroundColor: '#e8f5e9' }}>
                      <GiHeartBeats size={24} style={{ color: '#2d7a35' }} />
                    </div>
                    <h3 className="fw-bold mb-0" style={{ color: '#1e3a1e' }}>{t.pages.about.missionTitle}</h3>
                  </div>
                  <p style={{ lineHeight: 1.8, color: '#555' }}>
                    To make traditional, organic, and chemical-free food accessible to every household in India.
                    We are committed to preserving ancient agricultural practices, supporting local farmers,
                    and promoting a healthier lifestyle through natural nutrition.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '50px', height: '50px', backgroundColor: '#e8f5e9' }}>
                      <GiThreeLeaves size={24} style={{ color: '#2d7a35' }} />
                    </div>
                    <h3 className="fw-bold mb-0" style={{ color: '#1e3a1e' }}>{t.pages.about.visionTitle}</h3>
                  </div>
                  <p style={{ lineHeight: 1.8, color: '#555' }}>
                    A world where every meal is a source of health and vitality. We envision creating a
                    self-sustaining ecosystem of traditional organic farming that benefits farmers, consumers,
                    and the planet alike, while reviving the rich culinary heritage of Tamil Nadu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: '#fdf7e6' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge rounded-pill px-3 py-2 mb-2" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35' }}>{t.pages.about.valuesTitle}</span>
            <h2 className="fw-bold" style={{ color: '#1e3a1e' }}>{t.pages.about.valuesTitle}</h2>
          </div>
          <div className="row g-4">
            {values.map((v) => (
              <div key={v.title} className="col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100 text-center" style={{ borderRadius: '16px' }}>
                  <div className="card-body p-4">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '64px', height: '64px', backgroundColor: '#e8f5e9' }}>
                      <v.icon size={28} style={{ color: '#2d7a35' }} />
                    </div>
                    <h5 className="fw-bold mb-2" style={{ color: '#1e3a1e' }}>{v.title}</h5>
                    <p className="small text-muted mb-0">{v.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: '#f0f8f0' }}>
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <span className="badge rounded-pill px-3 py-2 mb-3" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35' }}>{t.pages.about.qualityBadge}</span>
              <h2 className="fw-bold mb-3" style={{ color: '#1e3a1e' }}>{t.pages.about.qualityTitle}</h2>
              <p style={{ lineHeight: 1.8, color: '#555' }}>
                Every product at Arogya Paadhai goes through rigorous quality checks. From soil testing at the farm
                to final packaging, we ensure that what reaches your table is nothing but the best. Our partners follow
                traditional organic farming methods, avoiding synthetic pesticides, chemical fertilizers, and GMOs.
              </p>
              <ul className="list-unstyled">
                {['Soil testing before every cultivation cycle', 'No synthetic pesticides or fertilizers', 'Traditional seed varieties preserved', 'Hand-picked and sun-dried processing', 'Chemical-free storage and packaging'].map((item, i) => (
                  <li key={i} className="d-flex align-items-center gap-2 mb-2">
                    <FaLeaf style={{ color: '#2d7a35' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-lg-6">
              <img
                src="/images/landing/quality-commitment.png"
                alt="Quality Commitment"
                className="w-100 rounded-4"
                style={{ height: '350px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: '#fdf7e6' }}>
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <img
                src="/images/landing/farmer-support.png"
                alt="Farmer Support"
                className="w-100 rounded-4"
                style={{ height: '350px', objectFit: 'cover' }}
              />
            </div>
            <div className="col-lg-6">
              <span className="badge rounded-pill px-3 py-2 mb-3" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35' }}>{t.pages.about.farmerBadge}</span>
              <h2 className="fw-bold mb-3" style={{ color: '#1e3a1e' }}>{t.pages.about.farmerTitle}</h2>
              <p style={{ lineHeight: 1.8, color: '#555' }}>
                Our farmers are at the heart of everything we do. We ensure they receive fair compensation,
                training in sustainable practices, and a reliable market for their produce. By choosing Arogya Paadhai,
                you are directly supporting rural farming families and helping preserve traditional agricultural knowledge.
              </p>
              <div className="row g-3 mt-3">
                {[{ number: '50+', label: 'Farmer Partners' }, { number: '200+', label: 'Acres Organic Farmland' }, { number: '100%', label: 'Fair Trade Practices' }, { number: '2000+', label: 'Families Impacted' }].map((stat) => (
                  <div key={stat.label} className="col-6 col-md-3 text-center">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#e8f5e9' }}>
                      <div className="fw-bold" style={{ color: '#2d7a35', fontSize: '1.5rem' }}>{stat.number}</div>
                      <div className="small" style={{ color: '#1e3a1e' }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>



      <section className="py-5 position-relative" style={{ background: 'linear-gradient(135deg, #1e6326, #2d7a35)' }}>
        <div className="container text-center text-white">
          <h2 className="fw-bold mb-3">{t.pages.about.ctaTitle}</h2>
          <p className="mb-4" style={{ opacity: 0.9 }}>{t.pages.about.ctaSubtitle}</p>
          <Link to="/products" className="btn btn-lg rounded-pill px-4 fw-bold" style={{ backgroundColor: '#e8b83e', color: '#1e3a1e', border: 'none' }}>
            {t.pages.about.ctaButton} <FaArrowRight className="ms-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
