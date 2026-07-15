import { Link } from 'react-router-dom';
import { FaClock, FaUser, FaArrowRight, FaUtensils } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const recipes = [
  {
    slug: 'ellu-urundai',
    title: 'Ellu Urundai (Sesame Balls)',
    description: 'Traditional Tamil sesame seed balls made with jaggery and cardamom. A nutrient-rich energy snack that is naturally sweet and packed with calcium, iron, and healthy fats.',
    prepTime: '10 mins',
    cookTime: '5 mins',
    difficulty: 'Easy',
    servings: 8,
    category: 'Snacks',
  },
  {
    slug: 'beetroot-juice',
    title: 'Beetroot Juice',
    description: 'A vibrant and refreshing beetroot juice blended with apple, carrot, and ginger. Rich in antioxidants, iron, and essential vitamins for glowing skin and improved stamina.',
    prepTime: '10 mins',
    cookTime: '5 mins',
    difficulty: 'Easy',
    servings: 2,
    category: 'Beverage',
  },
  {
    slug: 'ragi-malt',
    title: 'Sweet & Savoury Ragi Malt',
    description: 'A traditional finger millet drink available in two versions — sweet with jaggery and cardamom, or savoury with buttermilk and spices. Perfect for a nutritious breakfast or cooling summer drink.',
    prepTime: '5 mins',
    cookTime: '10 mins',
    difficulty: 'Easy',
    servings: 2,
    category: 'Beverage',
  },
];

export default function RecipesPage() {
  const { t } = useLanguage();
  return (
    <div style={{ backgroundColor: '#fdf7e6' }}>
      <section className="py-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e6326, #2d7a35)' }}>
        <img src="/images/landing/traditional-recipes.png" alt="" className="position-absolute w-100 h-100" style={{ objectFit: 'cover', opacity: 0.15, top: 0, left: 0 }} />
        <div className="container text-center text-white py-3 position-relative" style={{ zIndex: 1 }}>
          <h1 className="fw-bold display-4 mb-3">{t.pages.recipes.title}</h1>
          <p className="lead" style={{ opacity: 0.9 }}>{t.pages.recipes.subtitle}</p>
        </div>
      </section>

      <div className="container py-5">
        <div className="row g-4">
          {recipes.map((recipe) => (
            <div key={recipe.slug} className="col-md-6 col-lg-6">
              <div className="card border-0 shadow-sm h-100 recipe-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div className="row g-0 h-100">
                  <div className="col-md-5">
                    <div
                      className="d-flex align-items-center justify-content-center h-100"
                      style={{ minHeight: '240px', background: 'linear-gradient(135deg, #2d7a35, #56a25d)' }}
                    >
                      <FaUtensils size={48} style={{ color: 'rgba(255,255,255,0.7)' }} />
                    </div>
                  </div>
                  <div className="col-md-7">
                    <div className="card-body p-4 d-flex flex-column h-100">
                      <span className="badge align-self-start mb-2" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35', fontSize: '0.7rem' }}>{recipe.category}</span>
                      <h4 className="fw-bold mb-2" style={{ color: '#1e3a1e' }}>{recipe.title}</h4>
                      <p className="small text-muted mb-3 flex-grow-1" style={{ lineHeight: 1.6 }}>{recipe.description}</p>
                      <div className="d-flex flex-wrap gap-3 mb-3 small text-muted">
                        <span className="d-flex align-items-center gap-1"><FaClock size={12} style={{ color: '#2d7a35' }} /> {t.pages.recipes.prep}: {recipe.prepTime}</span>
                        <span className="d-flex align-items-center gap-1"><FaClock size={12} style={{ color: '#2d7a35' }} /> {t.pages.recipes.cook}: {recipe.cookTime}</span>
                        <span className="d-flex align-items-center gap-1"><FaUser size={12} style={{ color: '#2d7a35' }} /> {recipe.servings} {t.pages.recipes.servings}</span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="badge rounded-pill px-3" style={{ backgroundColor: '#e8f5e9', color: '#2d7a35' }}>{recipe.difficulty}</span>
                        <Link to={`/recipes/${recipe.slug}`} className="btn btn-sm d-inline-flex align-items-center gap-1 text-white rounded-pill px-3" style={{ backgroundColor: '#2d7a35' }}>
                          {t.pages.recipes.viewRecipe} <FaArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .recipe-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .recipe-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important; }
      `}</style>
    </div>
  );
}
