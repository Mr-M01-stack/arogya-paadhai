import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GiGreenhouse } from 'react-icons/gi';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const { t, lang, setLang } = useLanguage();

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

  return (
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
  );
}
