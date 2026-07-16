export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  const data = await res.json();
  return (data.products || []).map(formatProduct);
}

export async function fetchProduct(slug) {
  const res = await fetch(`${API_BASE}/products/${slug}`);
  const data = await res.json();
  return formatProduct(data.product);
}

export async function fetchTodayProducts() {
  const res = await fetch(`${API_BASE}/products/today`);
  const data = await res.json();
  return (data.products || []).map(formatProduct);
}

export async function fetchReviews(productId) {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews`);
  const data = await res.json();
  return data;
}

export async function submitReview(productId, { name, rating, comment }) {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, rating, comment }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit review');
  return data;
}

function formatProduct(p) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.original_price || 0,
    image: p.image,
    category: p.category,
    description: p.description,
    ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
    benefits: Array.isArray(p.benefits) ? p.benefits : [],
    usage: p.usage,
    storage: p.storage,
    shelfLife: p.shelf_life,
    availability: (p.availability || '').replace(/_/g, '-'),
    isAvailableToday: p.is_available_today,
    isProductOfDay: p.is_product_of_day,
    rating: p.rating,
    reviews: p.reviews_count,
    stock: p.stock,
    sales: p.sales,
    featured: p.featured,
    createdAt: p.created_at,
  };
}
