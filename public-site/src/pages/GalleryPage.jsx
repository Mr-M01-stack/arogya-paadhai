import { useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const galleryItems = [
  { id: 1, title: 'Organic Rice Fields', category: 'Farm', label: 'Lush green organic rice paddies in Tamil Nadu' },
  { id: 2, title: 'Millet Harvest', category: 'Farm', label: 'Traditional millet harvest season' },
  { id: 3, title: 'Cold Pressing Unit', category: 'Products', label: 'Traditional wood press oil extraction' },
  { id: 4, title: 'Fresh Coconut Oil', category: 'Products', label: 'Freshly extracted cold pressed coconut oil' },
  { id: 5, title: 'Traditional Kitchen', category: 'Kitchen', label: 'Traditional Tamil kitchen with organic ingredients' },
  { id: 6, title: 'Herbal Juice Making', category: 'Products', label: 'Traditional herbal juice preparation' },
  { id: 7, title: 'Farmers at Work', category: 'Farm', label: 'Our partner farmers in the fields' },
  { id: 8, title: 'Organic Turmeric Farm', category: 'Farm', label: 'Vibrant organic turmeric cultivation' },
  { id: 9, title: 'Ragi Dosa Preparation', category: 'Kitchen', label: 'Making traditional ragi dosa' },
  { id: 10, title: 'Community Event', category: 'Events', label: 'Organic food awareness event' },
  { id: 11, title: 'Pongal Celebration', category: 'Events', label: 'Traditional Pongal harvest festival' },
  { id: 12, title: 'Farmers Training', category: 'Events', label: 'Organic farming training session' },
];

const categories = ['All', 'Farm', 'Products', 'Kitchen', 'Events'];

export default function GalleryPage() {
  const { t } = useLanguage();
  const [activeCat, setActiveCat] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  const filtered = activeCat === 'All' ? galleryItems : galleryItems.filter(item => item.category === activeCat);

  const openLightbox = (item) => setLightbox(item);
  const closeLightbox = () => setLightbox(null);

  const navigateLightbox = (direction) => {
    const currentIndex = filtered.findIndex(item => item.id === lightbox.id);
    const newIndex = (currentIndex + direction + filtered.length) % filtered.length;
    setLightbox(filtered[newIndex]);
  };

  return (
    <div style={{ backgroundColor: '#fdf7e6' }}>
      <section className="py-5 position-relative" style={{ background: 'linear-gradient(135deg, #1e6326, #2d7a35)' }}>
        <div className="container text-center text-white py-3">
          <h1 className="fw-bold display-4 mb-3">{t.pages.gallery.title}</h1>
          <p className="lead" style={{ opacity: 0.9 }}>{t.pages.gallery.subtitle}</p>
        </div>
      </section>

      <div className="container py-5">
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className="btn btn-sm rounded-pill px-4"
              style={{
                backgroundColor: activeCat === cat ? '#2d7a35' : '#fff',
                color: activeCat === cat ? '#fff' : '#2d7a35',
                border: activeCat === cat ? 'none' : '1px solid #2d7a35',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="row g-3">
          {filtered.map((item) => (
            <div key={item.id} className="col-6 col-md-4 col-lg-3">
              <div
                className="position-relative rounded-4 overflow-hidden gallery-item"
                style={{ cursor: 'pointer', height: '220px' }}
                onClick={() => openLightbox(item)}
              >
                <div
                  className="d-flex align-items-center justify-content-center flex-column h-100"
                  style={{ background: 'linear-gradient(135deg, #2d7a35, #56a25d)' }}
                >
                  <span style={{ fontSize: '3rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                    {item.title.charAt(0)}
                  </span>
                  <span className="text-white mt-2 small fw-medium px-3 text-center">{item.title}</span>
                </div>
                <div className="position-absolute bottom-0 start-0 end-0 p-2" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                  <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.65rem' }}>{item.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">{t.pages.gallery.noImages}</p>
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999 }}
          onClick={closeLightbox}
        >
          <button
            className="position-absolute top-0 end-0 btn text-white border-0 m-3"
            onClick={closeLightbox}
            style={{ fontSize: '1.5rem', zIndex: 10 }}
          >
            <FaTimes />
          </button>

          <button
            className="position-absolute start-0 btn text-white border-0 m-3"
            onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
            style={{ fontSize: '1.5rem', zIndex: 10 }}
          >
            <FaChevronLeft />
          </button>

          <div
            className="text-center p-4"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', width: '100%' }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-column mx-auto rounded-4"
              style={{
                width: '100%',
                height: '400px',
                background: 'linear-gradient(135deg, #2d7a35, #56a25d)',
                borderRadius: '16px',
              }}
            >
              <span style={{ fontSize: '8rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                {lightbox.title.charAt(0)}
              </span>
            </div>
            <h5 className="text-white mt-3 fw-bold">{lightbox.title}</h5>
            <p className="text-white-50 small">{lightbox.label}</p>
            <span className="badge" style={{ backgroundColor: '#e8b83e', color: '#1e3a1e' }}>{lightbox.category}</span>
          </div>

          <button
            className="position-absolute end-0 btn text-white border-0 m-3"
            onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
            style={{ fontSize: '1.5rem', zIndex: 10 }}
          >
            <FaChevronRight />
          </button>
        </div>
      )}

      <style>{`
        .gallery-item { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .gallery-item:hover { transform: scale(1.03); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
}
