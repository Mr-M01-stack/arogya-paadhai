from flask import Blueprint, request, jsonify
from models import db, Review, Product

reviews_bp = Blueprint('reviews', __name__, url_prefix='/api/products')


@reviews_bp.route('/<int:product_id>/reviews', methods=['POST'])
def create_review(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    name = (data.get('name') or '').strip()
    rating = data.get('rating')
    comment = (data.get('comment') or '').strip()

    if not name:
        return jsonify({'error': 'Name is required'}), 400
    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be an integer between 1 and 5'}), 400

    review = Review(product_id=product_id, name=name, rating=rating, comment=comment)
    db.session.add(review)

    all_ratings = db.session.query(Review.rating).filter(Review.product_id == product_id).all()
    avg = round(sum(r[0] for r in all_ratings) / len(all_ratings), 1)
    product.rating = avg
    product.reviews_count = len(all_ratings)
    db.session.commit()

    return jsonify({'review': review.to_dict()}), 201


@reviews_bp.route('/<int:product_id>/reviews', methods=['GET'])
def list_reviews(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    reviews = Review.query.filter_by(product_id=product_id).order_by(Review.created_at.desc()).all()
    return jsonify({
        'reviews': [r.to_dict() for r in reviews],
        'average_rating': product.rating,
        'total_reviews': product.reviews_count,
    })
