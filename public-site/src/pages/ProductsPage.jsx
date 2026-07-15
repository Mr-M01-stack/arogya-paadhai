import { useState, useEffect } from 'react';
import { fetchProducts } from '../api';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

export default function ProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sort, setSort] = useState('default');
  useEffect(() => { fetchProducts().then(setProducts); }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  let filtered = products;

  if (activeCategory !== 'All') {
    filtered = filtered.filter(p => p.category === activeCategory);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  switch (sort) {
    case 'price-asc':
      filtered = [...filtered].sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered = [...filtered].sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }

  return (
    <div className="py-5" style={{ backgroundColor: '#fdf7e6' }}>
      <div className="container">
        <div className="mb-4">
          <h1 className="fw-bold" style={{ color: '#1e3a1e' }}>{t.pages.products.title}</h1>
          <p className="text-muted">{t.pages.products.subtitle}</p>
        </div>

        <div className="row g-3 mb-4 align-items-center">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder={t.pages.products.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderRadius: '30px', padding: '10px 20px', border: '2px solid #e0e0e0' }}
            />
          </div>
          <div className="col-md-4">
            <div className="d-flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="btn btn-sm rounded-pill px-3"
                  style={{
                    backgroundColor: activeCategory === cat ? '#2d7a35' : '#fff',
                    color: activeCategory === cat ? '#fff' : '#2d7a35',
                    border: activeCategory === cat ? 'none' : '1px solid #2d7a35',
                    fontSize: '0.8rem',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="col-md-3 text-md-end">
            <select
              className="form-select d-inline-block"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ width: 'auto', borderRadius: '30px', border: '2px solid #e0e0e0', padding: '8px 20px' }}
            >
              <option value="default">{t.pages.products.sortDefault}</option>
              <option value="price-asc">{t.pages.products.sortPriceAsc}</option>
              <option value="price-desc">{t.pages.products.sortPriceDesc}</option>
              <option value="name-asc">{t.pages.products.sortNameAsc}</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }}>&#128269;</div>
            <h4 className="text-muted">{t.pages.products.noProductsFound}</h4>
            <p className="text-muted small">{t.pages.products.noProductsHint}</p>
            <button
              className="btn rounded-pill px-4"
              style={{ backgroundColor: '#2d7a35', color: '#fff' }}
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
            >
              {t.pages.products.clearFilters}
            </button>
          </div>
        ) : (
          <>
            <p className="text-muted mb-3 small">{t.pages.products.showingXofY.replace('{count}', filtered.length).replace('{total}', products.length)}</p>
            <div className="row g-3">
              {filtered.map((product) => (
                <div key={product.id} className="col-6 col-md-4 col-lg-3">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
