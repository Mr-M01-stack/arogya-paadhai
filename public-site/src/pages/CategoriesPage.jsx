import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import {
  GiGrain, GiOilPump, GiWheat, GiGrainBundle, GiManualJuicer, GiPowderBag, GiChipsBag, GiFarmTractor, GiLeafSwirl,
} from 'react-icons/gi';
import { useLanguage } from '../context/LanguageContext';

const catIcons = {
  'GiGrain': GiGrain, 'GiOilPump': GiOilPump, 'GiWheat': GiWheat, 'GiGrainBundle': GiGrainBundle,
  'GiManualJuicer': GiManualJuicer, 'GiPowderBag': GiPowderBag, 'GiChipsBag': GiChipsBag, 'GiFarmTractor': GiFarmTractor,
};

export default function CategoriesPage() {
  const { t } = useLanguage();
  return (
    <div className="py-5" style={{ backgroundColor: '#fdf7e6' }}>
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="fw-bold" style={{ color: '#1e3a1e' }}>{t.pages.categories.title}</h1>
          <p className="text-muted">{t.pages.categories.subtitle}</p>
        </div>
        <div className="row g-4">
          {categories.map((cat) => {
            const IconComp = catIcons[cat.icon] || GiLeafSwirl;
            return (
              <div key={cat.id} className="col-md-6 col-lg-3">
                <Link to={`/categories/${cat.slug}`} className="text-decoration-none">
                  <div className="card border-0 shadow-sm h-100 category-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ height: '180px', background: 'linear-gradient(135deg, #2d7a35, #56a25d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComp size={64} style={{ color: 'rgba(255,255,255,0.85)' }} />
                    </div>
                    <div className="card-body text-center p-4">
                      <h4 className="fw-bold mb-2" style={{ color: '#1e3a1e' }}>{cat.name}</h4>
                      <p className="small text-muted mb-3">{cat.description}</p>
                      <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35' }}>
                        {cat.productCount} {t.nav.products}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .category-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .category-card:hover { transform: translateY(-6px); box-shadow: 0 16px 32px rgba(0,0,0,0.15) !important; }
      `}</style>
    </div>
  );
}
