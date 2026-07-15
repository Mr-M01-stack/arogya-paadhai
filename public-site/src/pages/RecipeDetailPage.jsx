import { useParams, Link } from 'react-router-dom';
import { FaClock, FaUser, FaArrowLeft, FaCheckCircle, FaUtensils } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const recipesData = {
  'ellu-urundai': {
    slug: 'ellu-urundai',
    title: 'Ellu Urundai (Sesame Balls)',
    description: 'Traditional Tamil sesame seed balls made with jaggery and cardamom. A nutrient-rich energy snack that is naturally sweet and packed with calcium, iron, and healthy fats.',
    prepTime: '10 mins',
    cookTime: '5 mins',
    difficulty: 'Easy',
    servings: 8,
    category: 'Snacks',
    ingredients: [
      'Sesame seeds (Black or white): 1 cup',
      'Jaggery (Powdered or grated): \u2153 cup',
      'Cardamom powder: A pinch',
      'Ghee: 1 teaspoon (optional)',
    ],
    instructions: [
      'Roast the seeds: Heat a heavy pan on low flame. Add the sesame seeds. Stir constantly for 3 to 4 minutes until they pop and smell nutty. Do not burn them.',
      'Cool them: Transfer the roasted seeds to a plate. Let them cool down completely.',
      'Pulse the seeds: Put the cooled seeds and cardamom powder into a mixer. Pulse 2 or 3 times to crush them coarsely. Do not grind continuously.',
      'Mix the jaggery: Add the jaggery to the mixer. Pulse a few more times until everything combines. The mix should look damp from the natural oils of the seeds.',
      'Shape the balls: Pour the mixture into a bowl. Grease your hands with ghee if needed. Take small portions and squeeze them firmly to roll them into tight, smooth balls.',
    ],
    tips: 'Store ellu urundai in an airtight container at room temperature for up to 2 weeks. For a variation, add finely chopped dry coconut or crushed peanuts.',
  },
  'beetroot-juice': {
    slug: 'beetroot-juice',
    title: 'Beetroot Juice',
    description: 'A vibrant and refreshing beetroot juice blended with apple, carrot, and ginger. Rich in antioxidants, iron, and essential vitamins for glowing skin and improved stamina.',
    prepTime: '10 mins',
    cookTime: '5 mins',
    difficulty: 'Easy',
    servings: 2,
    category: 'Beverage',
    ingredients: [
      'Beetroot: 1 small (peeled and chopped)',
      'Apple: 1 large (cored and chopped)',
      'Carrot: 1 medium (peeled and chopped)',
      'Ginger: \u00bd inch piece (peeled)',
      'Lemon: \u00bd (juiced)',
      'Water or Coconut Water: \u00bd cup (only if using a blender)',
      'Black salt or honey: A pinch (optional, for taste)',
    ],
    instructions: [
      'Option A: Using a Blender — Prep the produce: Wash, peel, and roughly chop your beetroot, carrot, apple, and ginger.',
      'Blend: Add the chopped ingredients into a blender jar along with \u00bd cup of water or coconut water. Blend on high speed until completely smooth.',
      'Strain: Place a fine-mesh strainer or cheesecloth over a large bowl. Pour the blended puree through it, using the back of a spoon to press down and extract all the vibrant liquid.',
      'Season & serve: Squeeze in the fresh lemon juice. Add a pinch of black salt or honey if desired, stir well, and serve cold over ice.',
      'Option B: Using a Juicer — Feed the machine: Turn on your juicer. Alternatively feed the prepped beetroot, apple, carrot, and ginger pieces straight into the chute.',
      'Finish: Stir the freshly collected juice, mix in the lemon juice, and enjoy immediately.',
    ],
    tips: 'For optimal health benefits and lower sugar intake, aim for 80% vegetables and 20% fruits. Toss 1 cup of pomegranate seeds into the blender for a skin elixir, or add a pinch of turmeric for anti-inflammatory benefits. Raw juice tastes best immediately but can be stored in an airtight glass jar in the refrigerator for up to 24\u201348 hours.',
  },
  'ragi-malt': {
    slug: 'ragi-malt',
    title: 'Sweet & Savoury Ragi Malt',
    description: 'A traditional finger millet drink available in two versions \u2014 sweet with jaggery and cardamom, or savoury with buttermilk and spices. Perfect for a nutritious breakfast or cooling summer drink.',
    prepTime: '5 mins',
    cookTime: '10 mins',
    difficulty: 'Easy',
    servings: 2,
    category: 'Beverage',
    ingredients: [
      'Ragi flour (Finger millet): 2 tablespoons',
      'Water: 1\u00bd cups',
      'Milk: \u00bd cup (warmed, for sweet version)',
      'Jaggery powder (or organic sugar): 1 to 2 tablespoons',
      'Cardamom powder: A small pinch',
      'Buttermilk: \u00bd cup (for savoury version)',
      'Salt: To taste (for savoury version)',
      'Optional toppings: Coriander leaves, roasted cumin powder, lemon juice',
    ],
    instructions: [
      'Method 1: Sweet Ragi Malt — Make a slurry: In a small bowl, mix 2 tablespoons of ragi flour with \u00bc cup of room-temperature water. Stir well to ensure there are no lumps.',
      'Boil water: Heat 1 cup of water in a small saucepan over medium heat until it begins to simmer.',
      'Cook the ragi: Turn the heat to low. Pour the ragi slurry slowly into the simmering water while stirring continuously to prevent lumps.',
      'Thicken: Cook for 3 to 4 minutes on low heat, stirring constantly. The mixture will turn glossy, darken slightly, and thicken.',
      'Add sweet flavourings: Add the jaggery powder and cardamom powder. Stir well for 1 minute until the jaggery dissolves completely. Turn off the heat.',
      'Finish with milk: Pour in the warm milk and mix thoroughly. Pour into a glass and serve warm.',
      'Method 2: Savoury Ragi Malt — Mix flour: Whisk 2 tablespoons of ragi flour into 1\u00bd cups of water until entirely smooth.',
      'Cook the mixture: Pour this into a pan and turn the heat to medium-low. Cook for 4 to 5 minutes, stirring non-stop. It will transform into a smooth, thick, glossy porridge.',
      'Cool it down: Turn off the heat. Let the cooked ragi cool down completely to room temperature. (Crucial step: Adding buttermilk to hot ragi will cause it to curdle.)',
      'Blend in buttermilk: Once cool, whisk in the \u00bd cup of buttermilk and salt until smooth and drinkable.',
      'Garnish & serve: Stir in roasted cumin powder and fresh coriander leaves. Enjoy cold or at room temperature.',
    ],
    tips: 'For the sweet version, adjust jaggery to your taste. You can also add a pinch of nutmeg or cinnamon. For the savoury version, ensure the ragi is completely cool before adding buttermilk to prevent curdling. Both versions can be made ahead and refrigerated.',
  },
};

export default function RecipeDetailPage() {
  const { t } = useLanguage();
  const { slug } = useParams();
  const recipe = recipesData[slug];

  if (!recipe) {
    return (
      <div className="py-5" style={{ backgroundColor: '#fdf7e6', minHeight: '60vh' }}>
        <div className="container text-center py-5">
          <div style={{ fontSize: '5rem', opacity: 0.3, marginBottom: '1rem' }}>&#128533;</div>
          <h3 className="fw-bold" style={{ color: '#1e3a1e' }}>{t.pages.recipes.recipeNotFound}</h3>
          <p className="text-muted">{t.pages.recipes.recipeNotFoundHint}</p>
          <Link to="/recipes" className="btn rounded-pill px-4" style={{ backgroundColor: '#2d7a35', color: '#fff' }}>
            <FaArrowLeft className="me-2" />{t.pages.recipes.backToRecipes}
          </Link>
        </div>
      </div>
    );
  }

  const otherRecipes = Object.values(recipesData).filter(r => r.slug !== slug);

  return (
    <div style={{ backgroundColor: '#fdf7e6' }}>
      <section className="py-4" style={{ background: 'linear-gradient(135deg, #1e6326, #2d7a35)' }}>
        <div className="container text-white py-2">
          <Link to="/recipes" className="text-white text-decoration-none small d-inline-flex align-items-center gap-1 mb-2">
            <FaArrowLeft /> {t.pages.recipes.backToRecipes}
          </Link>
          <span className="badge me-2" style={{ backgroundColor: '#e8b83e', color: '#1e3a1e' }}>{recipe.category}</span>
          <h1 className="fw-bold mt-2">{recipe.title}</h1>
        </div>
      </section>

      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="d-flex align-items-center justify-content-center rounded-4 mb-4" style={{ height: '350px', background: 'linear-gradient(135deg, #2d7a35, #56a25d)' }}>
              <FaUtensils size={80} style={{ color: 'rgba(255,255,255,0.7)' }} />
            </div>

            <div className="d-flex flex-wrap gap-3 mb-4">
              <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ backgroundColor: '#e8f5e9' }}>
                <FaClock style={{ color: '#2d7a35' }} />
                <div><small className="text-muted">{t.pages.recipes.prep}</small><br /><strong style={{ color: '#1e3a1e' }}>{recipe.prepTime}</strong></div>
              </div>
              <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ backgroundColor: '#e8f5e9' }}>
                <FaClock style={{ color: '#2d7a35' }} />
                <div><small className="text-muted">{t.pages.recipes.cook}</small><br /><strong style={{ color: '#1e3a1e' }}>{recipe.cookTime}</strong></div>
              </div>
              <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ backgroundColor: '#e8f5e9' }}>
                <FaUser style={{ color: '#2d7a35' }} />
                <div><small className="text-muted">{t.pages.recipes.servings}</small><br /><strong style={{ color: '#1e3a1e' }}>{recipe.servings}</strong></div>
              </div>
              <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ backgroundColor: '#e8f5e9' }}>
                <FaCheckCircle style={{ color: '#2d7a35' }} />
                <div><small className="text-muted">{t.pages.recipes.difficulty}</small><br /><strong style={{ color: '#1e3a1e' }}>{recipe.difficulty}</strong></div>
              </div>
            </div>

            <p className="mb-4" style={{ lineHeight: 1.8, color: '#555' }}>{recipe.description}</p>

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3" style={{ color: '#1e3a1e' }}>{t.pages.recipes.ingredients}</h4>
                <ul className="list-unstyled">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="d-flex align-items-center gap-2 py-1 border-bottom border-light">
                      <FaCheckCircle size={14} style={{ color: '#2d7a35', flexShrink: 0 }} />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3" style={{ color: '#1e3a1e' }}>{t.pages.recipes.instructions}</h4>
                <ol className="list-unstyled" style={{ counterReset: 'step' }}>
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="d-flex gap-3 mb-3">
                      <span className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-bold text-white" style={{ width: '30px', height: '30px', backgroundColor: '#2d7a35', fontSize: '0.85rem' }}>
                        {i + 1}
                      </span>
                      <span style={{ lineHeight: 1.7, color: '#555', paddingTop: '4px' }}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {recipe.tips && (
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#fff8e1' }}>
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-2" style={{ color: '#e8b83e' }}>{t.pages.recipes.proTips}</h6>
                  <p className="small mb-0" style={{ lineHeight: 1.7, color: '#666' }}>{recipe.tips}</p>
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', backgroundColor: '#e8f5e9' }}>
              <div className="card-body p-4 text-center">
                <FaCheckCircle size={48} style={{ color: '#2d7a35' }} />
                <h6 className="fw-bold mt-2" style={{ color: '#1e3a1e' }}>{t.pages.recipes.organicIngredients}</h6>
                <p className="small text-muted">{t.pages.recipes.organicIngredientsDesc}</p>
                <Link to="/products" className="btn btn-sm rounded-pill text-white px-3" style={{ backgroundColor: '#2d7a35' }}>
                  {t.pages.recipes.shopIngredients}
                </Link>
              </div>
            </div>

            {otherRecipes.length > 0 && (
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-3" style={{ color: '#1e3a1e' }}>{t.pages.recipes.moreRecipes}</h6>
                  <div className="d-flex flex-column gap-3">
                    {otherRecipes.map((r) => (
                      <Link key={r.slug} to={`/recipes/${r.slug}`} className="text-decoration-none">
                        <div className="d-flex gap-3 align-items-center">
                          <div className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3" style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #2d7a35, #56a25d)' }}>
                            <FaUtensils style={{ color: 'rgba(255,255,255,0.85)' }} />
                          </div>
                          <div>
                            <h6 className="small fw-bold mb-1" style={{ color: '#1e3a1e', lineHeight: 1.3 }}>{r.title}</h6>
                            <span className="small text-muted">{r.difficulty} | {r.cookTime}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
