from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Category, Product

categories_bp = Blueprint('categories', __name__, url_prefix='/api/categories')


@categories_bp.route('', methods=['GET'])
def list_categories():
    categories = Category.query.order_by(Category.name).all()
    return jsonify({
        'categories': [c.to_dict() for c in categories],
        'count': len(categories)
    }), 200


@categories_bp.route('/<slug>', methods=['GET'])
def get_category(slug):
    category = Category.query.filter_by(slug=slug).first()
    if not category:
        return jsonify({'error': 'Category not found'}), 404

    products = Product.query.filter_by(category=slug).order_by(Product.name).all()

    return jsonify({
        'category': category.to_dict(),
        'products': [p.to_dict() for p in products],
        'product_count': len(products)
    }), 200


@categories_bp.route('', methods=['POST'])
@jwt_required()
def create_category():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    if 'name' not in data or 'slug' not in data:
        return jsonify({'error': 'name and slug are required'}), 400

    if Category.query.filter_by(slug=data['slug']).first():
        return jsonify({'error': 'Category with this slug already exists'}), 409

    category = Category(
        name=data['name'],
        slug=data['slug'],
        description=data.get('description', ''),
        image=data.get('image', ''),
        product_count=int(data.get('product_count', 0)),
        is_active=data.get('is_active', True),
    )
    db.session.add(category)
    db.session.commit()

    return jsonify({'category': category.to_dict(), 'message': 'Category created successfully'}), 201


@categories_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_category(id):
    category = Category.query.get(id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    if 'slug' in data and data['slug'] != category.slug:
        existing = Category.query.filter_by(slug=data['slug']).first()
        if existing:
            return jsonify({'error': 'Slug already in use'}), 409

    updatable_fields = ['name', 'slug', 'description', 'image', 'product_count', 'is_active']
    for field in updatable_fields:
        if field in data:
            setattr(category, field, data[field])

    db.session.commit()
    return jsonify({'category': category.to_dict(), 'message': 'Category updated successfully'}), 200


@categories_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_category(id):
    category = Category.query.get(id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404

    products_count = Product.query.filter_by(category=category.slug).count()
    if products_count > 0:
        return jsonify({
            'error': f'Cannot delete category with {products_count} product(s). Remove or reassign products first.'
        }), 400

    db.session.delete(category)
    db.session.commit()

    return jsonify({'message': 'Category deleted successfully'}), 200
