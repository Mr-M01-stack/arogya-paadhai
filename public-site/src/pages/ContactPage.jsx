import { useState } from 'react';
import { FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaCheckCircle, FaInstagram } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useStoreSettings } from '../context/StoreSettingsContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const s = useStoreSettings();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitted(false), 4000);
    }, 1500);
  };

  return (
    <div style={{ backgroundColor: '#fdf7e6' }}>
      <section className="py-5 position-relative" style={{ background: 'linear-gradient(135deg, #1e6326, #2d7a35)' }}>
        <div className="container text-center text-white py-3">
          <h1 className="fw-bold display-4 mb-3">{t.pages.contact.title}</h1>
          <p className="lead" style={{ opacity: 0.9 }}>{t.pages.contact.subtitle}</p>
        </div>
      </section>

      <div className="container py-5">
        <div className="row g-5">
          <div className="col-lg-7">
            <h3 className="fw-bold mb-1" style={{ color: '#1e3a1e' }}>{t.pages.contact.formTitle}</h3>
            <p className="text-muted mb-4">{t.pages.contact.formSubtitle}</p>

            {submitted && (
              <div className="alert d-flex align-items-center gap-2" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35', border: 'none', borderRadius: '12px' }}>
                <FaCheckCircle size={20} />
                <span>{t.pages.contact.successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold" style={{ color: '#1e3a1e' }}>{t.pages.contact.nameLabel}</label>
                  <input type="text" name="name" className="form-control" required value={form.name} onChange={handleChange} style={{ borderRadius: '12px', padding: '12px 16px', border: '2px solid #e0e0e0' }} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold" style={{ color: '#1e3a1e' }}>{t.pages.contact.emailLabel}</label>
                  <input type="email" name="email" className="form-control" required value={form.email} onChange={handleChange} style={{ borderRadius: '12px', padding: '12px 16px', border: '2px solid #e0e0e0' }} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold" style={{ color: '#1e3a1e' }}>{t.pages.contact.phoneLabel}</label>
                  <input type="tel" name="phone" className="form-control" value={form.phone} onChange={handleChange} style={{ borderRadius: '12px', padding: '12px 16px', border: '2px solid #e0e0e0' }} />
                </div>
                <div className="col-md-12">
                  <label className="form-label small fw-bold" style={{ color: '#1e3a1e' }}>{t.pages.contact.messageLabel}</label>
                  <textarea name="message" rows={5} className="form-control" required value={form.message} onChange={handleChange} style={{ borderRadius: '12px', padding: '12px 16px', border: '2px solid #e0e0e0' }} />
                </div>
                <div className="col-12">
                  <button type="submit" disabled={sending} className="btn text-white fw-bold px-4 py-2 d-inline-flex align-items-center gap-2" style={{ backgroundColor: '#2d7a35', borderRadius: '30px', border: 'none' }}>
                    {sending ? (
                      <>{t.pages.contact.sending}</>
                    ) : (
                      <><FaPaperPlane /> {t.pages.contact.sendButton}</>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="col-lg-5">
            <h3 className="fw-bold mb-4" style={{ color: '#1e3a1e' }}>{t.pages.contact.infoTitle}</h3>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ backgroundColor: '#f0f8f0' }}>
                <FaPhone style={{ color: '#2d7a35', marginTop: '4px' }} />
                <div>
                  <strong style={{ color: '#1e3a1e' }}>{t.pages.contact.phone}</strong>
                  <p className="mb-0 small text-muted">{s.phone}</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ backgroundColor: '#f0f8f0' }}>
                <FaWhatsapp style={{ color: '#25D366', marginTop: '4px' }} />
                <div>
                  <strong style={{ color: '#1e3a1e' }}>{t.pages.contact.whatsapp}</strong>
                  <p className="mb-0 small text-muted">{s.whatsapp}</p>
                  <a href={`https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm mt-1 text-white d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#25D366', borderRadius: '20px' }}>
                    <FaWhatsapp /> {t.pages.contact.chatNow}
                  </a>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ backgroundColor: '#f0f8f0' }}>
                <FaEnvelope style={{ color: '#2d7a35', marginTop: '4px' }} />
                <div>
                  <strong style={{ color: '#1e3a1e' }}>{t.pages.contact.email}</strong>
                  <p className="mb-0 small text-muted">{s.email}</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ backgroundColor: '#f0f8f0' }}>
                <FaMapMarkerAlt style={{ color: '#2d7a35', marginTop: '4px' }} />
                <div>
                  <strong style={{ color: '#1e3a1e' }}>{t.pages.contact.address}</strong>
                  <p className="mb-0 small text-muted">{s.address}</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ backgroundColor: '#f0f8f0' }}>
                <FaClock style={{ color: '#2d7a35', marginTop: '4px' }} />
                <div>
                  <strong style={{ color: '#1e3a1e' }}>{t.pages.contact.businessHours}</strong>
                  <p className="mb-0 small text-muted">{s.business_hours}</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ backgroundColor: '#f0f8f0' }}>
                <FaWhatsapp style={{ color: '#25D366', marginTop: '4px' }} />
                <div>
                  <strong style={{ color: '#1e3a1e' }}>{t.pages.contact.whatsappChannel}</strong>
                  <p className="mb-0 small text-muted">WhatsApp Channel</p>
                  <a href={s.whatsapp_channel} target="_blank" rel="noopener noreferrer" className="btn btn-sm mt-1 text-white d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#25D366', borderRadius: '20px' }}>
                    <FaWhatsapp /> {t.pages.contact.chatNow}
                  </a>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ backgroundColor: '#f0f8f0' }}>
                <FaWhatsapp style={{ color: '#128C7E', marginTop: '4px' }} />
                <div>
                  <strong style={{ color: '#1e3a1e' }}>{t.pages.contact.whatsappCommunity}</strong>
                  <p className="mb-0 small text-muted">WhatsApp Community</p>
                  <a href={s.whatsapp_community} target="_blank" rel="noopener noreferrer" className="btn btn-sm mt-1 text-white d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#128C7E', borderRadius: '20px' }}>
                    <FaWhatsapp /> {t.pages.contact.chatNow}
                  </a>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ backgroundColor: '#f0f8f0' }}>
                <FaInstagram style={{ color: '#E4405F', marginTop: '4px' }} />
                <div>
                  <strong style={{ color: '#1e3a1e' }}>{t.pages.contact.instagram}</strong>
                  <p className="mb-0 small text-muted">@aarogya_paadhai</p>
                  <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-sm mt-1 text-white d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#E4405F', borderRadius: '20px' }}>
                    <FaInstagram /> {t.pages.contact.followUs}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <a
                href="https://goo.gl/maps/9UAc7qcB4mAPEmaS7?g_st=awb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center flex-column"
                  style={{
                    height: '220px',
                    background: 'linear-gradient(135deg, #2d7a35, #56a25d)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                  }}
                >
                  <FaMapMarkerAlt size={40} style={{ color: 'rgba(255,255,255,0.85)' }} />
                  <span className="text-white mt-2 fw-bold">{t.pages.contact.findOnMap}</span>
                  <span className="text-white-50 small">Krishnagiri, Tamil Nadu</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
