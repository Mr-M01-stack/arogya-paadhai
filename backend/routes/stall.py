from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, extract
from models import db, Stall, Sale, ProductStock, Production, Investment, ProductPrice, Customer, EnquiryExtended, ProductRequest, Climate, Product, Order

stall_bp = Blueprint('stall', __name__, url_prefix='/api')


@stall_bp.route('/stalls', methods=['GET'])
def get_stalls():
    date_param = request.args.get('date')
    if date_param:
        try:
            d = datetime.strptime(date_param, '%Y-%m-%d').date()
            stall = Stall.query.filter_by(date=d).first()
            return jsonify(stall.to_dict() if stall else {})
        except ValueError:
            pass
    stalls = Stall.query.order_by(Stall.date.desc()).limit(30).all()
    return jsonify([s.to_dict() for s in stalls])


INTERNAL = {'id', 'created_at', 'updated_at'}

@stall_bp.route('/stalls', methods=['POST'])
@jwt_required()
def create_stall():
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    for numeric_key in ('temperature', 'working_hours'):
        if numeric_key in data and data[numeric_key] == '':
            data[numeric_key] = None
    d = datetime.strptime(data.get('date', date.today().isoformat()), '%Y-%m-%d').date()
    data['date'] = d
    existing = Stall.query.filter_by(date=d).first()
    if existing:
        for k, v in data.items():
            if k != 'date' and hasattr(existing, k):
                setattr(existing, k, v)
        db.session.commit()
        return jsonify(existing.to_dict())
    stall = Stall(**{k: v for k, v in data.items() if hasattr(Stall, k)})
    db.session.add(stall)
    db.session.commit()
    return jsonify(stall.to_dict()), 201


@stall_bp.route('/stalls/<int:id>', methods=['PUT'])
@jwt_required()
def update_stall(id):
    stall = Stall.query.get_or_404(id)
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    for numeric_key in ('temperature', 'working_hours'):
        if numeric_key in data and data[numeric_key] == '':
            data[numeric_key] = None
    for k, v in data.items():
        if k == 'date' and isinstance(v, str):
            v = datetime.strptime(v, '%Y-%m-%d').date()
        if hasattr(stall, k):
            setattr(stall, k, v)
    db.session.commit()
    return jsonify(stall.to_dict())


@stall_bp.route('/stalls/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_stall(id):
    stall = Stall.query.get_or_404(id)
    db.session.delete(stall)
    db.session.commit()
    return jsonify({'message': 'Stall deleted'})


@stall_bp.route('/sales', methods=['GET'])
def get_sales():
    date_param = request.args.get('date')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    product_id = request.args.get('product_id')
    category = request.args.get('category')
    limit = int(request.args.get('limit', 100))

    q = Sale.query
    if date_param:
        d = datetime.strptime(date_param, '%Y-%m-%d').date()
        q = q.filter_by(date=d)
    if start_date:
        q = q.filter(Sale.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        q = q.filter(Sale.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    if product_id:
        q = q.filter_by(product_id=int(product_id))
    if category:
        q = q.filter_by(category=category)

    sales = q.order_by(Sale.created_at.desc()).limit(limit).all()
    return jsonify([s.to_dict() for s in sales])


@stall_bp.route('/sales/summary', methods=['GET'])
def sales_summary():
    date_param = request.args.get('date', date.today().isoformat())
    d = datetime.strptime(date_param, '%Y-%m-%d').date()

    sales = Sale.query.filter_by(date=d).all()
    total_revenue = sum(s.total_price - s.discount for s in sales)
    total_items = sum(s.quantity for s in sales)
    transaction_count = len(sales)

    category_breakdown = {}
    for s in sales:
        cat = s.category or 'other'
        if cat not in category_breakdown:
            category_breakdown[cat] = {'count': 0, 'revenue': 0}
        category_breakdown[cat]['count'] += s.quantity
        category_breakdown[cat]['revenue'] += s.total_price - s.discount

    payment_methods = {}
    for s in sales:
        pm = s.payment_method or 'cash'
        if pm not in payment_methods:
            payment_methods[pm] = 0
        payment_methods[pm] += s.total_price - s.discount

    return jsonify({
        'total_revenue': round(total_revenue, 2),
        'total_items': total_items,
        'transaction_count': transaction_count,
        'category_breakdown': category_breakdown,
        'payment_methods': payment_methods,
    })


@stall_bp.route('/sales', methods=['POST'])
@jwt_required()
def create_sale():
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    if data.get('date'):
        data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
    product_id = data.get('product_id')
    product = Product.query.get(product_id) if product_id else None
    if product and not data.get('unit_price'):
        data['unit_price'] = product.price
    if product and not data.get('product_name'):
        data['product_name'] = product.name
    if product and not data.get('category'):
        data['category'] = product.category
    qty = float(data.get('quantity', 1))
    price = float(data.get('unit_price', 0))
    disc = float(data.get('discount', 0))
    data['total_price'] = round(price * qty - disc, 2)
    sale = Sale(**{k: v for k, v in data.items() if hasattr(Sale, k)})
    db.session.add(sale)
    db.session.commit()
    return jsonify(sale.to_dict()), 201


@stall_bp.route('/sales/<int:id>', methods=['PUT'])
@jwt_required()
def update_sale(id):
    sale = Sale.query.get_or_404(id)
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    if 'quantity' in data or 'unit_price' in data or 'discount' in data:
        qty = float(data.get('quantity', sale.quantity))
        price = float(data.get('unit_price', sale.unit_price))
        disc = float(data.get('discount', sale.discount))
        data['total_price'] = round(price * qty - disc, 2)
    for k, v in data.items():
        if k == 'date' and isinstance(v, str):
            v = datetime.strptime(v, '%Y-%m-%d').date()
        if hasattr(sale, k):
            setattr(sale, k, v)
    db.session.commit()
    return jsonify(sale.to_dict())


@stall_bp.route('/sales/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_sale(id):
    sale = Sale.query.get_or_404(id)
    db.session.delete(sale)
    db.session.commit()
    return jsonify({'message': 'Sale deleted'})


@stall_bp.route('/stock', methods=['GET'])
def get_stock():
    date_param = request.args.get('date')
    product_id = request.args.get('product_id')

    q = ProductStock.query
    if date_param:
        d = datetime.strptime(date_param, '%Y-%m-%d').date()
        q = q.filter_by(date=d)
    if product_id:
        q = q.filter_by(product_id=int(product_id))
    if not date_param:
        sub = db.session.query(func.max(ProductStock.date)).scalar()
        if sub:
            q = q.filter_by(date=sub)

    stocks = q.order_by(ProductStock.date.desc()).all()
    return jsonify([s.to_dict() for s in stocks])


@stall_bp.route('/stock', methods=['POST'])
@jwt_required()
def create_stock():
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    d = datetime.strptime(data.get('date', date.today().isoformat()), '%Y-%m-%d').date()
    data['date'] = d
    if data.get('expiry_date'):
        data['expiry_date'] = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
    elif 'expiry_date' in data:
        data['expiry_date'] = None
    pid = data.get('product_id')
    existing = ProductStock.query.filter_by(date=d, product_id=pid).first()
    if existing:
        for k, v in data.items():
            if k not in ('date', 'product_id') and hasattr(existing, k):
                setattr(existing, k, v)
        opening = float(data.get('opening_stock', existing.opening_stock))
        prod = float(data.get('todays_production', existing.todays_production))
        purchase = float(data.get('purchase_quantity', existing.purchase_quantity))
        sold = float(data.get('sold_quantity', existing.sold_quantity))
        damaged = float(data.get('damaged_quantity', existing.damaged_quantity))
        existing.available_stock = round(opening + prod + purchase - sold - damaged, 2)
        existing.closing_stock = existing.available_stock
        db.session.commit()
        return jsonify(existing.to_dict())
    stock = ProductStock(**{k: v for k, v in data.items() if hasattr(ProductStock, k)})
    opening = float(stock.opening_stock or 0)
    prod = float(stock.todays_production or 0)
    purchase = float(stock.purchase_quantity or 0)
    sold = float(stock.sold_quantity or 0)
    damaged = float(stock.damaged_quantity or 0)
    stock.available_stock = round(opening + prod + purchase - sold - damaged, 2)
    stock.closing_stock = stock.available_stock
    db.session.add(stock)
    db.session.commit()
    return jsonify(stock.to_dict()), 201


@stall_bp.route('/stock/<int:id>', methods=['PUT'])
@jwt_required()
def update_stock(id):
    stock = ProductStock.query.get_or_404(id)
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    if data.get('expiry_date'):
        data['expiry_date'] = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
    elif 'expiry_date' in data:
        data['expiry_date'] = None
    if data.get('date') and isinstance(data['date'], str):
        data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
    for k, v in data.items():
        if hasattr(stock, k):
            setattr(stock, k, v)
    opening = float(stock.opening_stock or 0)
    prod = float(stock.todays_production or 0)
    purchase = float(stock.purchase_quantity or 0)
    sold = float(stock.sold_quantity or 0)
    damaged = float(stock.damaged_quantity or 0)
    stock.available_stock = round(opening + prod + purchase - sold - damaged, 2)
    stock.closing_stock = stock.available_stock
    db.session.commit()
    return jsonify(stock.to_dict())


@stall_bp.route('/stock/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_stock(id):
    stock = ProductStock.query.get_or_404(id)
    db.session.delete(stock)
    db.session.commit()
    return jsonify({'message': 'Stock deleted'})


@stall_bp.route('/stock/low', methods=['GET'])
def low_stock():
    today_stocks = ProductStock.query.filter_by(date=date.today()).all()
    low = []
    for s in today_stocks:
        if s.available_stock <= s.min_stock_alert:
            product = Product.query.get(s.product_id)
            low.append({
                'product_id': s.product_id,
                'product_name': product.name if product else 'Unknown',
                'available': s.available_stock,
                'min_alert': s.min_stock_alert,
                'unit': s.unit,
            })
    return jsonify(low)


@stall_bp.route('/production', methods=['GET'])
def get_production():
    date_param = request.args.get('date')
    product_id = request.args.get('product_id')
    q = Production.query
    if date_param:
        q = q.filter_by(date=datetime.strptime(date_param, '%Y-%m-%d').date())
    if product_id:
        q = q.filter_by(product_id=int(product_id))
    prods = q.order_by(Production.date.desc()).limit(50).all()
    return jsonify([p.to_dict() for p in prods])


@stall_bp.route('/production', methods=['POST'])
@jwt_required()
def create_production():
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    if data.get('date'):
        data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
    elif 'date' in data:
        data['date'] = None
    rm = float(data.get('raw_material_cost', 0))
    lc = float(data.get('labour_cost', 0))
    gc = float(data.get('gas_cost', 0))
    ec = float(data.get('electricity_cost', 0))
    pc = float(data.get('packaging_cost', 0))
    tc = float(data.get('transport_cost', 0))
    mc = float(data.get('misc_cost', 0))
    data['total_cost'] = round(rm + lc + gc + ec + pc + tc + mc, 2)
    qty = float(data.get('quantity', 1))
    data['cost_per_unit'] = round(data['total_cost'] / qty, 2) if qty > 0 else 0
    price = float(data.get('expected_price', 0))
    data['expected_profit'] = round((price - data['cost_per_unit']) * qty, 2)
    prod = Production(**{k: v for k, v in data.items() if hasattr(Production, k)})
    db.session.add(prod)
    db.session.commit()
    return jsonify(prod.to_dict()), 201


@stall_bp.route('/production/<int:id>', methods=['PUT'])
@jwt_required()
def update_production(id):
    prod = Production.query.get_or_404(id)
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    for k, v in data.items():
        if k == 'date' and isinstance(v, str):
            try:
                v = datetime.strptime(v, '%Y-%m-%d').date()
            except ValueError:
                v = None
        if hasattr(prod, k):
            setattr(prod, k, v)
    rm = prod.raw_material_cost
    lc = prod.labour_cost
    gc = prod.gas_cost
    ec = prod.electricity_cost
    pc = prod.packaging_cost
    tc = prod.transport_cost
    mc = prod.misc_cost
    prod.total_cost = round(rm + lc + gc + ec + pc + tc + mc, 2)
    qty = prod.quantity
    prod.cost_per_unit = round(prod.total_cost / qty, 2) if qty > 0 else 0
    prod.expected_profit = round((prod.expected_price - prod.cost_per_unit) * qty, 2)
    db.session.commit()
    return jsonify(prod.to_dict())


@stall_bp.route('/production/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_production(id):
    prod = Production.query.get_or_404(id)
    db.session.delete(prod)
    db.session.commit()
    return jsonify({'message': 'Production deleted'})


@stall_bp.route('/investment', methods=['GET'])
def get_investment():
    date_param = request.args.get('date')
    q = Investment.query
    if date_param:
        q = q.filter_by(date=datetime.strptime(date_param, '%Y-%m-%d').date())
    investments = q.order_by(Investment.date.desc()).limit(50).all()
    return jsonify([i.to_dict() for i in investments])


@stall_bp.route('/investment', methods=['POST'])
@jwt_required()
def create_investment():
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    if 'product_id' in data and data['product_id'] == '':
        data['product_id'] = None
    if data.get('date'):
        data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
    elif 'date' in data:
        data['date'] = None
    fields = ['milk_cost', 'rice_cost', 'vegetables_cost', 'oil_cost', 'spices_cost',
              'packaging_cost', 'gas_cost', 'electricity_cost', 'transport_cost',
              'labour_cost', 'other_expenses']
    total = sum(float(data.get(f, 0)) for f in fields)
    data['total_investment'] = round(total, 2)
    inv = Investment(**{k: v for k, v in data.items() if hasattr(Investment, k)})
    db.session.add(inv)
    db.session.commit()
    return jsonify(inv.to_dict()), 201


@stall_bp.route('/investment/<int:id>', methods=['PUT'])
@jwt_required()
def update_investment(id):
    inv = Investment.query.get_or_404(id)
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    if 'product_id' in data and data['product_id'] == '':
        data['product_id'] = None
    for k, v in data.items():
        if k == 'date' and isinstance(v, str):
            try:
                v = datetime.strptime(v, '%Y-%m-%d').date()
            except ValueError:
                v = None
        if hasattr(inv, k):
            setattr(inv, k, v)
    fields = ['milk_cost', 'rice_cost', 'vegetables_cost', 'oil_cost', 'spices_cost',
              'packaging_cost', 'gas_cost', 'electricity_cost', 'transport_cost',
              'labour_cost', 'other_expenses']
    total = sum(getattr(inv, f, 0) or 0 for f in fields)
    inv.total_investment = round(total, 2)
    db.session.commit()
    return jsonify(inv.to_dict())


@stall_bp.route('/investment/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_investment(id):
    inv = Investment.query.get_or_404(id)
    db.session.delete(inv)
    db.session.commit()
    return jsonify({'message': 'Investment deleted'})


@stall_bp.route('/customers', methods=['GET'])
def get_customers():
    date_param = request.args.get('date')
    q = Customer.query
    if date_param:
        q = q.filter_by(date=datetime.strptime(date_param, '%Y-%m-%d').date())
    customers = q.order_by(Customer.created_at.desc()).limit(100).all()
    return jsonify([c.to_dict() for c in customers])


@stall_bp.route('/customers', methods=['POST'])
@jwt_required()
def create_customer():
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    if data.get('date'):
        data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
    elif 'date' in data:
        data['date'] = None
    c = Customer(**{k: v for k, v in data.items() if hasattr(Customer, k)})
    db.session.add(c)
    db.session.commit()
    return jsonify(c.to_dict()), 201


@stall_bp.route('/customers/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_customer(id):
    c = Customer.query.get_or_404(id)
    db.session.delete(c)
    db.session.commit()
    return jsonify({'message': 'Customer deleted'})


@stall_bp.route('/enquiries-extended', methods=['GET'])
def get_enquiries_extended():
    status = request.args.get('status')
    q = EnquiryExtended.query
    if status:
        q = q.filter_by(status=status)
    items = q.order_by(EnquiryExtended.created_at.desc()).all()
    return jsonify([e.to_dict() for e in items])


@stall_bp.route('/enquiries-extended', methods=['POST'])
@jwt_required()
def create_enquiry_extended():
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    for f in ('date', 'follow_up_date'):
        if data.get(f):
            data[f] = datetime.strptime(data[f], '%Y-%m-%d').date()
        elif f in data:
            data[f] = None
    e = EnquiryExtended(**{k: v for k, v in data.items() if hasattr(EnquiryExtended, k)})
    db.session.add(e)
    db.session.commit()
    return jsonify(e.to_dict()), 201


@stall_bp.route('/enquiries-extended/<int:id>', methods=['PUT'])
@jwt_required()
def update_enquiry_extended(id):
    e = EnquiryExtended.query.get_or_404(id)
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    for k, v in data.items():
        if k in ('date', 'follow_up_date') and isinstance(v, str):
            try:
                v = datetime.strptime(v, '%Y-%m-%d').date()
            except ValueError:
                v = None
        if hasattr(e, k):
            setattr(e, k, v)
    db.session.commit()
    return jsonify(e.to_dict())


@stall_bp.route('/enquiries-extended/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_enquiry_extended(id):
    e = EnquiryExtended.query.get_or_404(id)
    db.session.delete(e)
    db.session.commit()
    return jsonify({'message': 'Enquiry deleted'})


@stall_bp.route('/product-requests', methods=['GET'])
def get_product_requests():
    status = request.args.get('status')
    q = ProductRequest.query
    if status:
        q = q.filter_by(status=status)
    items = q.order_by(ProductRequest.created_at.desc()).all()
    return jsonify([r.to_dict() for r in items])


@stall_bp.route('/product-requests', methods=['POST'])
@jwt_required()
def create_product_request():
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    if data.get('date'):
        data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
    elif 'date' in data:
        data['date'] = None
    r = ProductRequest(**{k: v for k, v in data.items() if hasattr(ProductRequest, k)})
    db.session.add(r)
    db.session.commit()
    return jsonify(r.to_dict()), 201


@stall_bp.route('/product-requests/<int:id>', methods=['PUT'])
@jwt_required()
def update_product_request(id):
    r = ProductRequest.query.get_or_404(id)
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    for k, v in data.items():
        if k == 'date' and isinstance(v, str):
            try:
                v = datetime.strptime(v, '%Y-%m-%d').date()
            except ValueError:
                v = None
        if hasattr(r, k):
            setattr(r, k, v)
    db.session.commit()
    return jsonify(r.to_dict())


@stall_bp.route('/product-requests/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_product_request(id):
    r = ProductRequest.query.get_or_404(id)
    db.session.delete(r)
    db.session.commit()
    return jsonify({'message': 'Request deleted'})


@stall_bp.route('/climate', methods=['GET'])
def get_climate():
    date_param = request.args.get('date')
    if date_param:
        c = Climate.query.filter_by(date=datetime.strptime(date_param, '%Y-%m-%d').date()).first()
        return jsonify(c.to_dict() if c else {})
    records = Climate.query.order_by(Climate.date.desc()).limit(30).all()
    return jsonify([c.to_dict() for c in records])


@stall_bp.route('/climate', methods=['POST'])
@jwt_required()
def create_climate():
    data = {k: v for k, v in request.get_json().items() if k not in INTERNAL}
    d = datetime.strptime(data.get('date', date.today().isoformat()), '%Y-%m-%d').date()
    data['date'] = d
    existing = Climate.query.filter_by(date=d).first()
    if existing:
        for k, v in data.items():
            if k != 'date' and hasattr(existing, k):
                setattr(existing, k, v)
        db.session.commit()
        return jsonify(existing.to_dict())
    c = Climate(**{k: v for k, v in data.items() if hasattr(Climate, k)})
    db.session.add(c)
    db.session.commit()
    return jsonify(c.to_dict()), 201


@stall_bp.route('/dashboard', methods=['GET'])
def dashboard():
    today = date.today()
    periods = {
        'today': (today, today),
        'week': (today - timedelta(days=6), today),
        'month': (today - timedelta(days=29), today),
        'year': (today.replace(month=1, day=1), today),
    }
    from_str = request.args.get('from')
    to_str = request.args.get('to')
    if from_str and to_str:
        try:
            periods['custom'] = (datetime.strptime(from_str, '%Y-%m-%d').date(), datetime.strptime(to_str, '%Y-%m-%d').date())
        except ValueError:
            pass

    result = {}
    for pname, (start, end) in periods.items():
        sales = Sale.query.filter(Sale.date >= start, Sale.date <= end).all()
        revenue = round(sum(s.total_price - s.discount for s in sales), 2)
        transactions = len(sales)
        items_sold = sum(s.quantity for s in sales)

        investment_total = 0
        inv_records = Investment.query.filter(Investment.date >= start, Investment.date <= end).all()
        investment_breakdown = {}
        for inv in inv_records:
            investment_total += inv.total_investment or 0
            for f in ['milk_cost','rice_cost','vegetables_cost','oil_cost','spices_cost',
                      'packaging_cost','gas_cost','electricity_cost','transport_cost','labour_cost','other_expenses']:
                val = getattr(inv, f, 0) or 0
                lbl = f.replace('_cost','').replace('_',' ')
                investment_breakdown[lbl] = round(investment_breakdown.get(lbl, 0) + val, 2)

        customers = Customer.query.filter(Customer.date >= start, Customer.date <= end).count()
        customer_trend = db.session.query(
            Customer.date, func.count(Customer.id)
        ).filter(Customer.date >= start, Customer.date <= end).group_by(Customer.date).order_by(Customer.date).all()

        profit = round(revenue - investment_total, 2)

        top = db.session.query(
            Sale.product_name, func.sum(Sale.quantity).label('total_qty'),
            func.sum(Sale.total_price - Sale.discount).label('total_rev')
        ).filter(Sale.date >= start, Sale.date <= end).group_by(Sale.product_name).order_by(
            func.sum(Sale.quantity).desc()
        ).limit(5).all()

        payment_breakdown = {}
        for s in sales:
            pm = s.payment_method or 'cash'
            payment_breakdown[pm] = round(payment_breakdown.get(pm, 0) + s.total_price - s.discount, 2)

        latest_stock_date = db.session.query(func.max(ProductStock.date)).filter(
            ProductStock.date >= start, ProductStock.date <= end
        ).scalar()
        stock_levels = []
        if latest_stock_date:
            stocks = ProductStock.query.filter_by(date=latest_stock_date).all()
            for s in stocks:
                product = Product.query.get(s.product_id)
                stock_levels.append({'product': product.name if product else 'Unknown', 'available': s.available_stock or 0})

        prod_data = db.session.query(
            Production.product_id, func.sum(Production.quantity)
        ).filter(Production.date >= start, Production.date <= end).group_by(Production.product_id).all()
        sale_data = db.session.query(
            Sale.product_id, func.sum(Sale.quantity)
        ).filter(Sale.date >= start, Sale.date <= end).group_by(Sale.product_id).all()
        prod_map = {}
        for pid, qty in prod_data:
            p = Product.query.get(pid)
            name = p.name if p else f'Product {pid}'
            prod_map[name] = float(qty)
        sale_map = {}
        for pid, qty in sale_data:
            p = Product.query.get(pid)
            name = p.name if p else f'Product {pid}'
            sale_map[name] = sale_map.get(name, 0) + float(qty)
        all_names = set(list(prod_map.keys()) + list(sale_map.keys()))
        prod_vs_sales = [{'name': n, 'produced': prod_map.get(n, 0), 'sold': sale_map.get(n, 0)} for n in all_names]

        result[pname] = {
            'revenue': revenue,
            'transactions': transactions,
            'items_sold': items_sold,
            'profit': profit,
            'investment': round(investment_total, 2),
            'customers': customers,
            'top_products': [{'name': p[0], 'quantity': int(p[1]), 'revenue': round(p[2], 2)} for p in top],
            'payment_breakdown': payment_breakdown,
            'investment_breakdown': investment_breakdown,
            'customer_trend': [{'date': r[0].isoformat(), 'count': r[1]} for r in customer_trend],
            'stock_levels': stock_levels,
            'prod_vs_sales': prod_vs_sales,
        }

    low_stock_count = ProductStock.query.filter(
        ProductStock.date == today,
        ProductStock.available_stock <= ProductStock.min_stock_alert
    ).count()

    total_products = Product.query.count()
    pending_enquiries = EnquiryExtended.query.filter_by(status='pending').count()
    pending_requests = ProductRequest.query.filter_by(status='pending').count()
    pending_orders = Order.query.filter_by(order_status='pending').count()
    active_stall = Stall.query.filter_by(date=today, status='open').first()

    return jsonify({
        'periods': result,
        'stall': active_stall.to_dict() if active_stall else None,
        'low_stock_count': low_stock_count,
        'total_products': total_products,
        'pending_enquiries': pending_enquiries,
        'pending_requests': pending_requests,
        'pending_orders': pending_orders,
    })


@stall_bp.route('/dashboard/revenue-chart', methods=['GET'])
def revenue_chart():
    period = request.args.get('period', 'week')
    today_d = date.today()
    if period == 'today':
        start = today_d
        days = 1
    elif period == 'week':
        start = today_d - timedelta(days=6)
        days = 7
    elif period == 'month':
        start = today_d - timedelta(days=29)
        days = 30
    elif period == 'year':
        start = today_d.replace(month=1, day=1)
        days = (today_d - start).days + 1
    else:
        start = today_d - timedelta(days=6)
        days = 7
    results = db.session.query(
        Sale.date, func.sum(Sale.total_price - Sale.discount)
    ).filter(Sale.date >= start).group_by(Sale.date).order_by(Sale.date).all()
    data = {r[0].isoformat(): round(r[1], 2) for r in results}
    labels = [(start + timedelta(days=i)).isoformat() for i in range(days)]
    values = [data.get(d, 0) for d in labels]
    return jsonify({'labels': labels, 'values': values})


@stall_bp.route('/notifications', methods=['GET'])
def get_notifications():
    today = date.today()
    warnings = []

    # Low stock items
    low_stocks = ProductStock.query.filter(
        ProductStock.date == today,
        ProductStock.available_stock <= ProductStock.min_stock_alert
    ).all()
    for s in low_stocks:
        product = Product.query.get(s.product_id)
        warnings.append({
            'type': 'low_stock',
            'icon': 'alert-triangle',
            'severity': 'danger',
            'message': f"{product.name if product else 'Item'} — only {s.available_stock} left",
            'link': '/stock',
            'time': s.created_at.isoformat() if s.created_at else None,
        })

    # Pending enquiries
    pending_enq = EnquiryExtended.query.filter_by(status='pending').all()
    for e in pending_enq:
        warnings.append({
            'type': 'enquiry',
            'icon': 'message-square',
            'severity': 'warning',
            'message': f"Enquiry from {e.customer_name} — {e.requested_product or 'General'}",
            'link': '/enquiries',
            'time': e.created_at.isoformat() if e.created_at else None,
        })

    # Pending product requests
    pending_req = ProductRequest.query.filter_by(status='pending').all()
    for r in pending_req:
        warnings.append({
            'type': 'product_request',
            'icon': 'file-text',
            'severity': 'info',
            'message': f"Request for \"{r.requested_item}\" by {r.requested_by or 'Unknown'}",
            'link': '/daily-update',
            'time': r.created_at.isoformat() if r.created_at else None,
        })

    # Stall not logged today
    stall_today = Stall.query.filter_by(date=today).first()
    if not stall_today:
        warnings.append({
            'type': 'stall_missing',
            'icon': 'map-pin',
            'severity': 'warning',
            'message': 'Stall not logged for today yet',
            'link': '/stall',
            'time': None,
        })

    # Sort by severity: danger first, then warning, then info
    severity_order = {'danger': 0, 'warning': 1, 'info': 2}
    warnings.sort(key=lambda w: severity_order.get(w['severity'], 3))

    return jsonify({
        'count': len(warnings),
        'notifications': warnings,
    })
