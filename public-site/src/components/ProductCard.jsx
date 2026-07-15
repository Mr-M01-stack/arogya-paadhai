import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<FaStar key={i} size={12} color="#e8b83e" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<FaStarHalfAlt key={i} size={12} color="#e8b83e" />);
    } else {
      stars.push(<FaRegStar key={i} size={12} color="#e8b83e" />);
    }
  }
  return <span className="d-inline-flex gap-1 align-items-center">{stars}<small className="ms-1 text-muted">({rating})</small></span>;
}

function getAvailabilityBadge(availability) {
  const map = {
    'in-stock': { label: 'In Stock', class: 'bg-success' },
    'limited': { label: 'Limited Stock', class: 'bg-warning text-dark' },
    'out-of-stock': { label: 'Out of Stock', class: 'bg-secondary' },
    'seasonal': { label: 'Seasonal', class: 'bg-info text-dark' },
  };
  const info = map[availability] || { label: availability, class: 'bg-secondary' };
  return <span className={`badge ${info.class} small`}>{info.label}</span>;
}

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="card h-100 border-0 shadow-sm product-card">
      <div className="position-relative">
        <Link to={`/products/${product.slug}`}>
          {!imgError ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-100"
              style={{ height: '200px', objectFit: 'cover' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                height: '200px',
                background: 'linear-gradient(135deg, #2d7a35, #56a25d)',
                borderRadius: '8px 8px 0 0',
              }}
            >
              <span style={{ fontSize: '4rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                {product.name.charAt(0)}
              </span>
            </div>
          )}
        </Link>
        {product.isProductOfDay && (
          <span className="position-absolute top-0 start-0 m-2 badge" style={{ backgroundColor: '#e8b83e', color: '#1e3a1e', fontSize: '0.7rem' }}>
            Product of the Day
          </span>
        )}
        <div className="position-absolute top-0 end-0 m-2">
          {getAvailabilityBadge(product.availability)}
        </div>
      </div>

      <div className="card-body d-flex flex-column p-3">
        <div className="mb-1">
          <span className="badge" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35', fontSize: '0.7rem' }}>
            {product.category}
          </span>
        </div>

        <h6 className="card-title fw-bold mb-1" style={{ color: '#1e3a1e' }}>
          <Link to={`/products/${product.slug}`} className="text-decoration-none" style={{ color: 'inherit' }}>
            {product.name}
          </Link>
        </h6>

        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="fw-bold" style={{ color: '#2d7a35', fontSize: '1.1rem' }}>
            &#8377;{product.price}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-decoration-line-through text-muted small">
              &#8377;{product.originalPrice}
            </span>
          )}
        </div>

        <p className="card-text small text-muted mb-2 flex-grow-1" style={{ lineHeight: 1.5 }}>
          {product.description.substring(0, 80)}...
        </p>

        <StarRating rating={product.rating} />

        <div className="d-flex gap-2 mt-3">
          <Link to={`/products/${product.slug}`} className="btn btn-sm flex-grow-1 text-white" style={{ backgroundColor: '#2d7a35' }}>
            View Details
          </Link>
          <a
            href={`https://wa.me/919876543210?text=Hi! I'm interested in ${product.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm d-flex align-items-center justify-content-center"
            style={{ backgroundColor: '#25D366', color: '#fff', width: '36px', minWidth: '36px' }}
            aria-label="Enquire on WhatsApp"
          >
            <FaWhatsapp />
          </a>
        </div>
      </div>

      <style>{`
        .product-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border-radius: 12px;
          overflow: hidden;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important;
        }
      `}</style>
    </div>
  );
}
