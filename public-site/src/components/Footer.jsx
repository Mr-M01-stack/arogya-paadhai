import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { GiGreenhouse } from 'react-icons/gi';
import { useLanguage } from '../context/LanguageContext';
import { useStoreSettings } from '../context/StoreSettingsContext';

export default function Footer() {
  const { t } = useLanguage();
  const s = useStoreSettings();

  const quickLinks = [
    { to: '/', label: t.nav.home },
    { to: '/products', label: t.nav.products },
    { to: '/about', label: t.nav.about },
    { to: '/recipes', label: t.nav.recipes },
    { to: '/contact', label: t.nav.contact },
  ];

  return (
    <footer style={{ backgroundColor: '#1e3a1e', color: '#f8f9fa' }}>
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <GiGreenhouse size={32} color="#56a25d" />
              <h5 className="mb-0 fw-bold text-white">{t.nav.brand}</h5>
            </div>
            <p className="small" style={{ color: '#c8e6c9', lineHeight: 1.8 }}>
              {t.footer.about}
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href={s.whatsapp_channel || '#'} target="_blank" rel="noopener noreferrer" className="text-decoration-none" style={{ color: '#c8e6c9', fontSize: '1.3rem' }} aria-label="WhatsApp Channel">
                <FaWhatsapp />
              </a>
              <a href={s.instagram || '#'} target="_blank" rel="noopener noreferrer" className="text-decoration-none" style={{ color: '#c8e6c9', fontSize: '1.3rem' }} aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3" style={{ color: '#56a25d' }}>{t.footer.quickLinks}</h6>
            <ul className="list-unstyled">
              {quickLinks.map((link) => (
                <li key={link.to} className="mb-2">
                  <Link to={link.to} className="text-decoration-none small" style={{ color: '#c8e6c9' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3" style={{ color: '#56a25d' }}>{t.footer.products}</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/products" className="text-decoration-none small" style={{ color: '#c8e6c9' }}>
                  {t.categories.items[0].name}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-decoration-none small" style={{ color: '#c8e6c9' }}>
                  {t.categories.items[1].name}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-decoration-none small" style={{ color: '#c8e6c9' }}>
                  {t.categories.items[2].name}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-decoration-none small" style={{ color: '#c8e6c9' }}>
                  {t.categories.items[3].name}
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3" style={{ color: '#56a25d' }}>{t.footer.contact}</h6>
            <ul className="list-unstyled small">
              <li className="mb-3 d-flex align-items-start gap-2">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0" style={{ color: '#56a25d' }} />
                <span style={{ color: '#c8e6c9' }}>{s.address}</span>
              </li>
              <li className="mb-3 d-flex align-items-center gap-2">
                <FaPhone style={{ color: '#56a25d' }} />
                <span style={{ color: '#c8e6c9' }}>{s.phone}</span>
              </li>
              <li className="mb-3 d-flex align-items-center gap-2">
                <FaEnvelope style={{ color: '#56a25d' }} />
                <span style={{ color: '#c8e6c9' }}>{s.email}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#152915', borderTop: '1px solid #2d5a2d' }}>
        <div className="container py-3">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <p className="mb-0 small" style={{ color: '#a5d6a7' }}>
                &copy; {new Date().getFullYear()} {t.nav.brand}. {t.common.allRights}.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end mt-2 mt-md-0">
              <p className="mb-0 small" style={{ color: '#a5d6a7' }}>
                {t.hero.badge} <span style={{ color: '#56a25d' }}>&#10003;</span> Organic &amp; Traditional
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
