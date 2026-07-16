from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from datetime import datetime, date
from models import db, Stall, Sale, ProductStock, Production, Investment, Customer, EnquiryExtended, ProductRequest, Climate, DailyUpdate, Product, Order

export_bp = Blueprint('export', __name__, url_prefix='/api')

TABLES = {
    'stall': (Stall, ['date']),
    'sales': (Sale, ['date']),
    'stock': (ProductStock, ['date']),
    'production': (Production, ['date']),
    'investment': (Investment, ['date']),
    'customers': (Customer, ['date']),
    'enquiries': (EnquiryExtended, ['date', 'follow_up_date']),
    'requests': (ProductRequest, ['date']),
    'climate': (Climate, ['date']),
    'daily_updates': (DailyUpdate, ['date']),
    'orders': (Order, []),
    'products': (Product, []),
}


@export_bp.route('/export', methods=['GET'])
@jwt_required()
def export_data():
    from_str = request.args.get('from', date.today().isoformat())
    to_str = request.args.get('to', date.today().isoformat())
    tables_param = request.args.get('tables', 'all')

    try:
        from_date = datetime.strptime(from_str, '%Y-%m-%d').date()
        to_date = datetime.strptime(to_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    selected = list(TABLES.keys()) if tables_param == 'all' else tables_param.split(',')
    result = {}

    for key in selected:
        entry = TABLES.get(key)
        if not entry:
            continue
        model, date_fields = entry
        q = model.query
        if date_fields:
            for df in date_fields:
                col = getattr(model, df, None)
                if col is not None:
                    q = q.filter(col >= from_date, col <= to_date)
            records = q.order_by(getattr(model, date_fields[0]).desc()).all()
        else:
            records = q.all()
        result[key] = [r.to_dict() for r in records]

    return jsonify({
        'from': from_str,
        'to': to_str,
        'data': result,
    })
