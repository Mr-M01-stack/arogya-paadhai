import smtplib
from datetime import datetime, date
from email.mime.text import MIMEText
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from models import db, Order, StoreSetting

orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')


def generate_order_id():
    today = date.today()
    prefix = today.strftime('AP-%Y%m%d-')
    last = Order.query.filter(Order.order_id.like(f'{prefix}%')).order_by(Order.id.desc()).first()
    seq = (int(last.order_id.split('-')[-1]) + 1) if last else 1
    return f'{prefix}{seq:04d}'


def send_order_email(order):
    settings = StoreSetting.query.get(1)
    to_email = settings.email if settings else 'aarokiyapaathai@gmail.com'
    username = current_app.config.get('MAIL_USERNAME')
    password = current_app.config.get('MAIL_PASSWORD')
    if not username or not password:
        return

    items_html = ''.join(
        f'<tr><td>{i.get("name", "Item")}</td><td>{i.get("quantity", 1)}</td><td>Rs.{i.get("price", 0)}</td></tr>'
        for i in (order.items or [])
    )
    body = f"""
    <h2>New Order Received</h2>
    <p><strong>Order ID:</strong> {order.order_id}</p>
    <p><strong>Customer:</strong> {order.customer_name}</p>
    <p><strong>Phone:</strong> {order.phone}</p>
    <p><strong>Address:</strong> {order.address or 'N/A'}</p>
    <p><strong>Notes:</strong> {order.notes or 'N/A'}</p>
    <h3>Items</h3>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse">
    <tr><th>Item</th><th>Qty</th><th>Price</th></tr>{items_html}
    </table>
    <p><strong>Total: Rs.{order.total_amount}</strong></p>
    <p><strong>View in Admin:</strong> <a href="https://arogya-admin-upxl.onrender.com/orders">https://arogya-admin-upxl.onrender.com/orders</a></p>
    """

    msg = MIMEText(body, 'html')
    msg['Subject'] = f'New Order {order.order_id} from {order.customer_name}'
    msg['From'] = username
    msg['To'] = to_email

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(username, password)
            server.send_message(msg)
    except Exception:
        pass


@orders_bp.route('', methods=['POST'])
def create_order():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    customer_name = data.get('customer_name', '').strip()
    phone = data.get('phone', '').strip()
    if not customer_name:
        return jsonify({'error': 'Customer name is required'}), 400
    if not phone:
        return jsonify({'error': 'Phone number is required'}), 400
    items = data.get('items')
    if not items or not isinstance(items, list) or len(items) == 0:
        return jsonify({'error': 'At least one item is required'}), 400
    total_amount = data.get('total_amount', 0)
    if not total_amount or total_amount <= 0:
        total_amount = sum(float(i.get('price', 0)) * float(i.get('quantity', 1)) for i in items)

    order = Order(
        order_id=generate_order_id(),
        customer_name=customer_name,
        phone=phone,
        address=data.get('address', '').strip(),
        items=items,
        total_amount=round(total_amount, 2),
        notes=data.get('notes', '').strip(),
    )
    db.session.add(order)
    db.session.commit()

    send_order_email(order)

    return jsonify(order.to_dict()), 201


@orders_bp.route('', methods=['GET'])
@jwt_required()
def list_orders():
    status = request.args.get('status')
    payment = request.args.get('payment_status')
    q = Order.query
    if status:
        q = q.filter_by(order_status=status)
    if payment:
        q = q.filter_by(payment_status=payment)
    orders = q.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders])


@orders_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_order(id):
    order = Order.query.get_or_404(id)
    return jsonify(order.to_dict())


@orders_bp.route('/<int:id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(id):
    order = Order.query.get_or_404(id)
    data = request.get_json()
    if 'order_status' in data:
        order.order_status = data['order_status']
    if 'payment_status' in data:
        order.payment_status = data['payment_status']
    db.session.commit()
    return jsonify(order.to_dict())


@orders_bp.route('/pending-count', methods=['GET'])
@jwt_required()
def pending_count():
    count = Order.query.filter_by(order_status='pending').count()
    return jsonify({'count': count})
