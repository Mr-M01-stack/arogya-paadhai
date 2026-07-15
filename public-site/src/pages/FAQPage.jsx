import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp, FaSearch, FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const faqCategories = [
  {
    name: 'Products',
    icon: '📦',
    questions: [
      { q: 'Are all your products 100% organic?', a: 'Yes, all products at Arogya Paadhai are 100% organic. We work directly with farmers who follow traditional organic farming methods without synthetic pesticides, chemical fertilizers, or GMOs. Our products are regularly tested to ensure they meet organic standards.' },
      { q: 'Do you use any preservatives or additives?', a: 'No, we do not use any artificial preservatives, additives, or chemicals. Our products are naturally preserved through traditional methods like sun-drying, cold pressing, and proper packaging. Some products may contain natural preservatives like citric acid in minimal quantities, which is clearly mentioned on the label.' },
      { q: 'What is the shelf life of your products?', a: 'Shelf life varies by product. Dry goods like rice, millets, and powders typically last 6-12 months. Cold pressed oils last 18-24 months. Herbal juices last 12-15 months (unopened). Each product package has a clearly marked manufacturing date and best-before date.' },
    ],
  },
  {
    name: 'Orders',
    icon: '🛒',
    questions: [
      { q: 'How can I place an order?', a: 'You can browse our products on this website and contact us via WhatsApp or phone to place your order. We are working on adding a full e-commerce shopping cart feature. For now, you can reach us at +91 98765 43210 or hello@arogyapaadhai.com to place orders.' },
      { q: 'What payment methods do you accept?', a: 'We accept UPI (Google Pay, PhonePe, Paytm), bank transfers, and cash on delivery for local deliveries. For bulk orders, we also accept business checks and corporate payments.' },
      { q: 'Can I modify or cancel my order?', a: 'Yes, you can modify or cancel your order within 2 hours of placing it. Please contact us immediately via WhatsApp or phone. Once the order is dispatched, modifications may not be possible.' },
    ],
  },
  {
    name: 'Delivery',
    icon: '🚚',
    questions: [
      { q: 'What areas do you deliver to?', a: 'We currently deliver across Tamil Nadu and major cities in South India including Chennai, Bangalore, Hyderabad, and Cochin. We are expanding our delivery network nationwide. Contact us to check if we deliver to your location.' },
      { q: 'What are the delivery charges?', a: 'Delivery is free for orders above ₹500. For orders below ₹500, a nominal delivery charge of ₹50 applies. Local deliveries within Coimbatore are always free.' },
    ],
  },
  {
    name: 'Organic Certification',
    icon: '🌿',
    questions: [
      { q: 'Are your products certified organic?', a: 'Yes, our partner farms are certified organic. We follow strict organic farming protocols and our products are traceable back to the farm. We believe in transparency and can provide certification details upon request.' },
      { q: 'How is your organic farming different from conventional farming?', a: 'Our partner farmers use traditional methods passed down through generations: natural fertilizers like farmyard manure and compost, biological pest control using neem and other botanical extracts, crop rotation for soil health, and traditional seed varieties. No synthetic chemicals, pesticides, or GMOs are used at any stage.' },
    ],
  },
];

export default function FAQPage() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState('');

  const toggleFAQ = (catIdx, qIdx) => {
    const key = `${catIdx}-${qIdx}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  const allQuestions = faqCategories.flatMap((cat, ci) =>
    cat.questions.map((q, qi) => ({ ...q, category: cat.name, catIdx: ci, qIdx: qi, key: `${ci}-${qi}` }))
  );

  const filtered = search.trim()
    ? allQuestions.filter(item =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      )
    : allQuestions;

  return (
    <div style={{ backgroundColor: '#fdf7e6' }}>
      <section className="py-5 position-relative" style={{ background: 'linear-gradient(135deg, #1e6326, #2d7a35)' }}>
        <div className="container text-center text-white py-3">
          <h1 className="fw-bold display-4 mb-3">{t.pages.faq.title}</h1>
          <p className="lead" style={{ opacity: 0.9 }}>{t.pages.faq.subtitle}</p>
        </div>
      </section>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="position-relative mb-5">
              <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="text"
                className="form-control"
                placeholder={t.pages.faq.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ borderRadius: '30px', padding: '14px 20px 14px 45px', border: '2px solid #e0e0e0' }}
              />
            </div>

            {!search.trim() && (
              <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                {faqCategories.map((cat) => (
                  <span key={cat.name} className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35', fontSize: '0.85rem' }}>
                    {cat.icon} {cat.name}
                  </span>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">{t.pages.faq.noResults}</p>
              </div>
            ) : (
              <div>
                {(!search.trim() ? faqCategories : []).map((cat, ci) => {
                  const catQuestions = filtered.filter(f => f.catIdx === ci);
                  if (catQuestions.length === 0) return null;
                  return (
                    <div key={cat.name} className="mb-4">
                      <h4 className="fw-bold mb-3" style={{ color: '#1e3a1e' }}>
                        {cat.icon} {cat.name}
                      </h4>
                      <div className="d-flex flex-column gap-2">
                        {catQuestions.map((item) => (
                          <div key={item.key} className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                            <button
                              className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center w-100 text-start py-3 px-4"
                              onClick={() => toggleFAQ(item.catIdx, item.qIdx)}
                              style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                            >
                              <span className="fw-medium" style={{ color: '#1e3a1e', fontSize: '0.95rem' }}>{item.q}</span>
                              {openIndex === item.key ? (
                                <FaChevronUp style={{ color: '#2d7a35', flexShrink: 0 }} />
                              ) : (
                                <FaChevronDown style={{ color: '#2d7a35', flexShrink: 0 }} />
                              )}
                            </button>
                            {openIndex === item.key && (
                              <div className="card-body px-4 pb-4 pt-0">
                                <p className="mb-0 small" style={{ lineHeight: 1.7, color: '#666' }}>{item.a}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {search.trim() && (
                  <div className="d-flex flex-column gap-2">
                    {filtered.map((item) => (
                      <div key={item.key} className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                        <button
                          className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center w-100 text-start py-3 px-4"
                          onClick={() => toggleFAQ(item.catIdx, item.qIdx)}
                          style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                        >
                          <div>
                            <span className="badge me-2" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35', fontSize: '0.65rem' }}>{item.category}</span>
                            <span className="fw-medium" style={{ color: '#1e3a1e', fontSize: '0.95rem' }}>{item.q}</span>
                          </div>
                          {openIndex === item.key ? (
                            <FaChevronUp style={{ color: '#2d7a35', flexShrink: 0 }} />
                          ) : (
                            <FaChevronDown style={{ color: '#2d7a35', flexShrink: 0 }} />
                          )}
                        </button>
                        {openIndex === item.key && (
                          <div className="card-body px-4 pb-4 pt-0">
                            <p className="mb-0 small" style={{ lineHeight: 1.7, color: '#666' }}>{item.a}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="card border-0 shadow-sm mt-5" style={{ borderRadius: '16px', backgroundColor: '#e8f5e9' }}>
              <div className="card-body p-4 text-center">
                <h5 className="fw-bold" style={{ color: '#1e3a1e' }}>{t.pages.faq.stillHaveQuestions}</h5>
                <p className="text-muted small mb-3">{t.pages.faq.stillHaveQuestionsDesc}</p>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  <Link to="/contact" className="btn rounded-pill px-4 text-white fw-bold" style={{ backgroundColor: '#2d7a35' }}>
                    {t.pages.faq.contactUs}
                  </Link>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="btn rounded-pill px-4 d-inline-flex align-items-center gap-2 text-white fw-bold" style={{ backgroundColor: '#25D366' }}>
                    <FaWhatsapp /> {t.pages.contact.whatsapp}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
