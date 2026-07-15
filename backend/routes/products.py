from datetime import date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Product, DailyUpdate

products_bp = Blueprint('products', __name__, url_prefix='/api/products')


@products_bp.route('', methods=['GET'])
def list_products():
    products = Product.query.order_by(Product.created_at.desc()).all()
    return jsonify({
        'products': [p.to_dict() for p in products],
        'count': len(products)
    }), 200


@products_bp.route('/<slug>', methods=['GET'])
def get_product(slug):
    product = Product.query.filter_by(slug=slug).first()
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'product': product.to_dict(include_timestamps=True)}), 200


@products_bp.route('/today', methods=['GET'])
def todays_products():
    today = date.today()
    products = Product.query.filter_by(is_available_today=True).all()

    result = []
    for product in products:
        daily_update = DailyUpdate.query.filter_by(
            product_id=product.id,
            date=today
        ).first()

        product_data = product.to_dict()
        if daily_update:
            product_data['daily_update'] = daily_update.to_dict()
        result.append(product_data)

    return jsonify({
        'products': result,
        'count': len(result),
        'date': today.isoformat()
    }), 200


@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    required_fields = ['name', 'slug', 'price', 'category']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    if Product.query.filter_by(slug=data['slug']).first():
        return jsonify({'error': 'Product with this slug already exists'}), 409

    product = Product(
        name=data['name'],
        slug=data['slug'],
        description=data.get('description', ''),
        price=float(data['price']),
        original_price=float(data['original_price']) if data.get('original_price') else None,
        category=data['category'],
        image=data.get('image', ''),
        ingredients=data.get('ingredients'),
        benefits=data.get('benefits'),
        usage=data.get('usage', ''),
        storage=data.get('storage', ''),
        shelf_life=data.get('shelf_life', ''),
        availability=data.get('availability', 'in_stock'),
        is_available_today=data.get('is_available_today', True),
        is_product_of_day=data.get('is_product_of_day', False),
        rating=float(data.get('rating', 0)),
        reviews_count=int(data.get('reviews_count', 0)),
        sales=int(data.get('sales', 0)),
        stock=int(data.get('stock', 0)),
        featured=data.get('featured', False),
    )
    db.session.add(product)
    db.session.commit()

    return jsonify({'product': product.to_dict(), 'message': 'Product created successfully'}), 201


@products_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    if 'slug' in data and data['slug'] != product.slug:
        existing = Product.query.filter_by(slug=data['slug']).first()
        if existing:
            return jsonify({'error': 'Slug already in use'}), 409

    updatable_fields = [
        'name', 'slug', 'description', 'price', 'original_price', 'category',
        'image', 'ingredients', 'benefits', 'usage', 'storage', 'shelf_life',
        'availability', 'is_available_today', 'is_product_of_day', 'rating',
        'reviews_count', 'sales', 'stock', 'featured'
    ]
    for field in updatable_fields:
        if field in data:
            setattr(product, field, data[field])

    db.session.commit()
    return jsonify({'product': product.to_dict(), 'message': 'Product updated successfully'}), 200


@products_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    DailyUpdate.query.filter_by(product_id=id).delete()
    db.session.delete(product)
    db.session.commit()

    return jsonify({'message': 'Product deleted successfully'}), 200


@products_bp.route('/<int:id>/daily-update', methods=['PUT'])
@jwt_required()
def update_daily_availability(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    update_date = date.today()
    if data.get('date'):
        try:
            update_date = date.fromisoformat(data['date'])
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    daily = DailyUpdate.query.filter_by(
        product_id=id,
        date=update_date
    ).first()

    if not daily:
        daily = DailyUpdate(
            product_id=id,
            date=update_date,
            is_available=True,
            stock_label='Full Stock'
        )
        db.session.add(daily)

    if 'is_available' in data:
        daily.is_available = bool(data['is_available'])
        product.is_available_today = daily.is_available
    if 'stock_label' in data:
        daily.stock_label = data['stock_label']
    if 'is_product_of_day' in data:
        if bool(data['is_product_of_day']):
            Product.query.filter(Product.id != id).update({'is_product_of_day': False})
            db.session.flush()
        product.is_product_of_day = bool(data['is_product_of_day'])

    db.session.commit()
    return jsonify({
        'daily_update': daily.to_dict(),
        'message': 'Daily availability updated successfully'
    }), 200
