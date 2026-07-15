import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { fetchProducts } from '../api';
import { categories } from '../data/categories';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

export default function CategoryPage() {
  const { t } = useLanguage();
  const { slug } = useParams();
  const [catProducts, setCatProducts] = useState([]);
  const category = categories.find(c => c.slug === slug);
  useEffect(() => {
    fetchProducts().then(all => setCatProducts(all.filter(p => p.category === (category ? category.name : slug))));
  }, [slug]);

  if (!category) {
    return (
      <div className="py-5" style={{ backgroundColor: '#fdf7e6', minHeight: '60vh' }}>
        <div className="container text-center py-5">
          <div style={{ fontSize: '5rem', opacity: 0.3, marginBottom: '1rem' }}>&#128533;</div>
          <h3 className="fw-bold" style={{ color: '#1e3a1e' }}>{t.pages.categories.categoryNotFound}</h3>
          <p className="text-muted">{t.pages.categories.categoryNotFoundHint}</p>
          <Link to="/categories" className="btn rounded-pill px-4" style={{ backgroundColor: '#2d7a35', color: '#fff' }}>
            <FaArrowLeft className="me-2" />{t.pages.categories.allCategories}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5" style={{ backgroundColor: '#fdf7e6' }}>
      <div className="container">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none" style={{ color: '#2d7a35' }}>{t.nav.home}</Link></li>
            <li className="breadcrumb-item"><Link to="/categories" className="text-decoration-none" style={{ color: '#2d7a35' }}>{t.pages.categories.title}</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{category.name}</li>
          </ol>
        </nav>

        <div className="d-flex align-items-center gap-3 mb-2">
          <h1 className="fw-bold mb-0" style={{ color: '#1e3a1e' }}>{category.name}</h1>
          <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35' }}>
            {catProducts.length} {t.nav.products}
          </span>
        </div>
        <p className="text-muted mb-4">{category.description}</p>

        {catProducts.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">{t.pages.categories.noProducts}</p>
          </div>
        ) : (
          <div className="row g-3">
            {catProducts.map((product) => (
              <div key={product.id} className="col-6 col-md-4 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
