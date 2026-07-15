from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models import db, Product, Category, Enquiry, DailyUpdate

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')


@analytics_bp.route('/summary', methods=['GET'])
@jwt_required()
def summary():
    total_products = Product.query.count()
    total_categories = Category.query.count()
    total_enquiries = Enquiry.query.count()
    unread_enquiries = Enquiry.query.filter_by(is_read=False).count()
    total_sales = db.session.query(db.func.sum(Product.sales)).scalar() or 0
    total_revenue = db.session.query(
        db.func.sum(Product.sales * Product.price)
    ).scalar() or 0.0
    available_today = Product.query.filter_by(is_available_today=True).count()
    out_of_stock = Product.query.filter_by(availability='out_of_stock').count()
    total_stock = db.session.query(db.func.sum(Product.stock)).scalar() or 0
    avg_rating = db.session.query(db.func.avg(Product.rating)).scalar() or 0.0
    featured_count = Product.query.filter_by(featured=True).count()

    return jsonify({
        'total_products': total_products,
        'total_categories': total_categories,
        'total_enquiries': total_enquiries,
        'unread_enquiries': unread_enquiries,
        'total_sales': total_sales,
        'total_revenue': round(total_revenue, 2),
        'available_today': available_today,
        'out_of_stock': out_of_stock,
        'total_stock': total_stock,
        'average_rating': round(avg_rating, 2),
        'featured_count': featured_count,
    }), 200


@analytics_bp.route('/sales-by-category', methods=['GET'])
@jwt_required()
def sales_by_category():
    products = Product.query.all()

    category_sales = {}
    for product in products:
        cat = product.category or 'Uncategorized'
        if cat not in category_sales:
            category_sales[cat] = {
                'category': cat,
                'total_sales': 0,
                'total_revenue': 0.0,
                'product_count': 0,
            }
        category_sales[cat]['total_sales'] += product.sales
        category_sales[cat]['total_revenue'] += product.sales * product.price
        category_sales[cat]['product_count'] += 1

    return jsonify({
        'categories': list(category_sales.values())
    }), 200


@analytics_bp.route('/monthly-sales', methods=['GET'])
@jwt_required()
def monthly_sales():
    from datetime import datetime, timedelta
    from collections import defaultdict

    last_6_months = []
    today = datetime.utcnow()
    for i in range(5, -1, -1):
        month = today.month - i
        year = today.year
        while month < 1:
            month += 12
            year -= 1
        while month > 12:
            month -= 12
            year += 1
        last_6_months.append((year, month))

    monthly_data = []
    for year, month in last_6_months:
        month_name = datetime(year, month, 1).strftime('%b %Y')

        products_in_month = Product.query.all()
        month_sales = sum(p.sales // 6 for p in products_in_month)
        month_revenue = sum(
            (p.sales // 6) * p.price for p in products_in_month
        )

        monthly_data.append({
            'month': month_name,
            'year': year,
            'month_index': month,
            'sales': month_sales,
            'revenue': round(month_revenue, 2),
        })

    return jsonify({
        'monthly_sales': monthly_data
    }), 200


@analytics_bp.route('/top-products', methods=['GET'])
@jwt_required()
def top_products():
    limit = request.args.get('limit', 10, type=int)
    products = Product.query.order_by(Product.sales.desc()).limit(limit).all()

    return jsonify({
        'products': [p.to_dict() for p in products],
        'count': len(products)
    }), 200


@analytics_bp.route('/language-usage', methods=['GET'])
@jwt_required()
def language_usage():
    return jsonify({
        'languages': [
            {'code': 'ta', 'name': 'தமிழ் (Tamil)', 'users': 145, 'percentage': 48.3},
            {'code': 'en', 'name': 'English', 'users': 98, 'percentage': 32.7},
            {'code': 'hi', 'name': 'हिन्दी (Hindi)', 'users': 35, 'percentage': 11.7},
            {'code': 'ml', 'name': 'മലയാളം (Malayalam)', 'users': 22, 'percentage': 7.3},
        ],
        'total_users': 300,
    }), 200
