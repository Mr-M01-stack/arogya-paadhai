import json
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False, default=0.0)
    original_price = db.Column(db.Float, nullable=True, default=0.0)
    category = db.Column(db.String(100), nullable=False)
    image = db.Column(db.String(500), nullable=True)
    ingredients = db.Column(db.Text, nullable=True)
    benefits = db.Column(db.Text, nullable=True)
    usage = db.Column(db.Text, nullable=True)
    storage = db.Column(db.String(200), nullable=True)
    shelf_life = db.Column(db.String(100), nullable=True)
    availability = db.Column(db.String(50), nullable=True, default='in_stock')
    is_available_today = db.Column(db.Boolean, default=True)
    is_product_of_day = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, default=0.0)
    reviews_count = db.Column(db.Integer, default=0)
    sales = db.Column(db.Integer, default=0)
    stock = db.Column(db.Integer, default=0)
    featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_timestamps=False):
        data = {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'price': self.price,
            'original_price': self.original_price,
            'category': self.category,
            'image': self.image,
            'ingredients': self._parse_json_field(self.ingredients),
            'benefits': self._parse_json_field(self.benefits),
            'usage': self.usage,
            'storage': self.storage,
            'shelf_life': self.shelf_life,
            'availability': self.availability,
            'is_available_today': self.is_available_today,
            'is_product_of_day': self.is_product_of_day,
            'rating': self.rating,
            'reviews_count': self.reviews_count,
            'sales': self.sales,
            'stock': self.stock,
            'featured': self.featured,
        }
        if include_timestamps:
            data['created_at'] = self.created_at.isoformat() if self.created_at else None
            data['updated_at'] = self.updated_at.isoformat() if self.updated_at else None
        return data

    @staticmethod
    def _parse_json_field(value):
        if value is None:
            return []
        if isinstance(value, list):
            return value
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return []


class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(500), nullable=True)
    product_count = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'image': self.image,
            'product_count': self.product_count,
            'is_active': self.is_active,
        }


class DailyUpdate(db.Model):
    __tablename__ = 'daily_updates'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    stock_label = db.Column(db.String(50), nullable=True)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', backref=db.backref('daily_updates', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'date': self.date.isoformat() if self.date else None,
            'is_available': self.is_available,
            'stock_label': self.stock_label,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None,
        }


class Enquiry(db.Model):
    __tablename__ = 'enquiries'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    message = db.Column(db.Text, nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

    product = db.relationship('Product', backref=db.backref('enquiries', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'message': self.message,
            'product_id': self.product_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_read': self.is_read,
        }


class Stall(db.Model):
    __tablename__ = 'stalls'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    open_time = db.Column(db.String(10), nullable=True)
    close_time = db.Column(db.String(10), nullable=True)
    staff_name = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(20), default='open')
    weather = db.Column(db.String(50), nullable=True)
    temperature = db.Column(db.Float, nullable=True)
    rain_status = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    working_hours = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'open_time': self.open_time,
            'close_time': self.close_time,
            'staff_name': self.staff_name,
            'status': self.status,
            'weather': self.weather,
            'temperature': self.temperature,
            'rain_status': self.rain_status,
            'notes': self.notes,
            'working_hours': self.working_hours,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Sale(db.Model):
    __tablename__ = 'sales'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product_name = db.Column(db.String(200), nullable=True)
    category = db.Column(db.String(100), nullable=True)
    unit_price = db.Column(db.Float, default=0)
    selling_unit = db.Column(db.String(20), default='piece')
    quantity = db.Column(db.Float, default=1)
    total_price = db.Column(db.Float, default=0)
    discount = db.Column(db.Float, default=0)
    payment_method = db.Column(db.String(50), default='cash')
    customer_type = db.Column(db.String(50), default='new')
    customer_age_group = db.Column(db.String(20), nullable=True)
    customer_profession = db.Column(db.String(100), nullable=True)
    sale_time = db.Column(db.String(10), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', backref=db.backref('sale_records', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'product_id': self.product_id,
            'product_name': self.product_name,
            'category': self.category,
            'unit_price': self.unit_price,
            'selling_unit': self.selling_unit,
            'quantity': self.quantity,
            'total_price': self.total_price,
            'discount': self.discount,
            'payment_method': self.payment_method,
            'customer_type': self.customer_type,
            'customer_age_group': self.customer_age_group,
            'customer_profession': self.customer_profession,
            'sale_time': self.sale_time,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class ProductStock(db.Model):
    __tablename__ = 'product_stocks'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    opening_stock = db.Column(db.Float, default=0)
    todays_production = db.Column(db.Float, default=0)
    purchase_quantity = db.Column(db.Float, default=0)
    available_stock = db.Column(db.Float, default=0)
    sold_quantity = db.Column(db.Float, default=0)
    damaged_quantity = db.Column(db.Float, default=0)
    closing_stock = db.Column(db.Float, default=0)
    min_stock_alert = db.Column(db.Float, default=0)
    unit = db.Column(db.String(20), default='piece')
    supplier = db.Column(db.String(200), nullable=True)
    expiry_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', backref=db.backref('stocks', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'date': self.date.isoformat() if self.date else None,
            'opening_stock': self.opening_stock,
            'todays_production': self.todays_production,
            'purchase_quantity': self.purchase_quantity,
            'available_stock': self.available_stock,
            'sold_quantity': self.sold_quantity,
            'damaged_quantity': self.damaged_quantity,
            'closing_stock': self.closing_stock,
            'min_stock_alert': self.min_stock_alert,
            'unit': self.unit,
            'supplier': self.supplier,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Production(db.Model):
    __tablename__ = 'productions'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    quantity = db.Column(db.Float, default=0)
    unit = db.Column(db.String(20), default='piece')
    raw_material_cost = db.Column(db.Float, default=0)
    labour_cost = db.Column(db.Float, default=0)
    gas_cost = db.Column(db.Float, default=0)
    electricity_cost = db.Column(db.Float, default=0)
    packaging_cost = db.Column(db.Float, default=0)
    transport_cost = db.Column(db.Float, default=0)
    misc_cost = db.Column(db.Float, default=0)
    total_cost = db.Column(db.Float, default=0)
    cost_per_unit = db.Column(db.Float, default=0)
    expected_price = db.Column(db.Float, default=0)
    expected_profit = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', backref=db.backref('productions', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'date': self.date.isoformat() if self.date else None,
            'quantity': self.quantity,
            'unit': self.unit,
            'raw_material_cost': self.raw_material_cost,
            'labour_cost': self.labour_cost,
            'gas_cost': self.gas_cost,
            'electricity_cost': self.electricity_cost,
            'packaging_cost': self.packaging_cost,
            'transport_cost': self.transport_cost,
            'misc_cost': self.misc_cost,
            'total_cost': self.total_cost,
            'cost_per_unit': self.cost_per_unit,
            'expected_price': self.expected_price,
            'expected_profit': self.expected_profit,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Investment(db.Model):
    __tablename__ = 'investments'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    milk_cost = db.Column(db.Float, default=0)
    rice_cost = db.Column(db.Float, default=0)
    vegetables_cost = db.Column(db.Float, default=0)
    oil_cost = db.Column(db.Float, default=0)
    spices_cost = db.Column(db.Float, default=0)
    packaging_cost = db.Column(db.Float, default=0)
    gas_cost = db.Column(db.Float, default=0)
    electricity_cost = db.Column(db.Float, default=0)
    transport_cost = db.Column(db.Float, default=0)
    labour_cost = db.Column(db.Float, default=0)
    other_expenses = db.Column(db.Float, default=0)
    total_investment = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', backref=db.backref('investments', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'product_id': self.product_id,
            'milk_cost': self.milk_cost,
            'rice_cost': self.rice_cost,
            'vegetables_cost': self.vegetables_cost,
            'oil_cost': self.oil_cost,
            'spices_cost': self.spices_cost,
            'packaging_cost': self.packaging_cost,
            'gas_cost': self.gas_cost,
            'electricity_cost': self.electricity_cost,
            'transport_cost': self.transport_cost,
            'labour_cost': self.labour_cost,
            'other_expenses': self.other_expenses,
            'total_investment': self.total_investment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class ProductPrice(db.Model):
    __tablename__ = 'product_prices'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    selling_price = db.Column(db.Float, default=0)
    cost_price = db.Column(db.Float, default=0)
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.String(200), nullable=True)

    product = db.relationship('Product', backref=db.backref('price_history', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'selling_price': self.selling_price,
            'cost_price': self.cost_price,
            'changed_at': self.changed_at.isoformat() if self.changed_at else None,
            'notes': self.notes,
        }


class Customer(db.Model):
    __tablename__ = 'customers'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    age = db.Column(db.Integer, nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    profession = db.Column(db.String(100), nullable=True)
    location = db.Column(db.String(200), nullable=True)
    customer_type = db.Column(db.String(50), default='new')
    purchase_amount = db.Column(db.Float, default=0)
    favourite_product = db.Column(db.String(200), nullable=True)
    purchase_time = db.Column(db.String(10), nullable=True)
    payment_method = db.Column(db.String(50), default='cash')
    purpose_of_visit = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'age': self.age,
            'gender': self.gender,
            'profession': self.profession,
            'location': self.location,
            'customer_type': self.customer_type,
            'purchase_amount': self.purchase_amount,
            'favourite_product': self.favourite_product,
            'purchase_time': self.purchase_time,
            'payment_method': self.payment_method,
            'purpose_of_visit': self.purpose_of_visit,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class EnquiryExtended(db.Model):
    __tablename__ = 'enquiries_extended'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    customer_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    requested_product = db.Column(db.String(200), nullable=True)
    purpose = db.Column(db.String(200), nullable=True)
    interested_product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    status = db.Column(db.String(20), default='pending')
    follow_up_date = db.Column(db.Date, nullable=True)
    remarks = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'customer_name': self.customer_name,
            'phone': self.phone,
            'requested_product': self.requested_product,
            'purpose': self.purpose,
            'interested_product_id': self.interested_product_id,
            'status': self.status,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'remarks': self.remarks,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class ProductRequest(db.Model):
    __tablename__ = 'product_requests'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    requested_item = db.Column(db.String(200), nullable=False)
    requested_by = db.Column(db.String(100), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    profession = db.Column(db.String(100), nullable=True)
    reason = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(20), default='medium')
    status = db.Column(db.String(20), default='pending')
    votes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'requested_item': self.requested_item,
            'requested_by': self.requested_by,
            'age': self.age,
            'profession': self.profession,
            'reason': self.reason,
            'priority': self.priority,
            'status': self.status,
            'votes': self.votes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Climate(db.Model):
    __tablename__ = 'climates'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    temperature = db.Column(db.Float, nullable=True)
    weather = db.Column(db.String(50), nullable=True)
    humidity = db.Column(db.Float, nullable=True)
    rain = db.Column(db.Float, nullable=True)
    wind = db.Column(db.Float, nullable=True)
    remarks = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'temperature': self.temperature,
            'weather': self.weather,
            'humidity': self.humidity,
            'rain': self.rain,
            'wind': self.wind,
            'remarks': self.remarks,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class StoreSetting(db.Model):
    __tablename__ = 'store_settings'

    id = db.Column(db.Integer, primary_key=True, default=1)
    store_name = db.Column(db.String(200), default='Arogya Paadhai')
    email = db.Column(db.String(100), default='aarokiyapaathai@gmail.com')
    phone = db.Column(db.String(50), default='+91 82201 28785')
    whatsapp = db.Column(db.String(50), default='+91 82201 28785')
    whatsapp_channel = db.Column(db.String(500), default='https://whatsapp.com/channel/0029Vb81pg04IBhIymkvd53h')
    whatsapp_community = db.Column(db.String(500), default='https://chat.whatsapp.com/D0KEeEUAWiG5FAiS76yST7')
    instagram = db.Column(db.String(500), default='https://www.instagram.com/aarogya_paadhai?igsh=MWUxaWdpbnJqMTZlcw==')
    address = db.Column(db.Text, default='Krishnagiri, Tamil Nadu, India')
    business_hours = db.Column(db.Text, default='Mon - Sat: 7:00 AM - 8:00 PM')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'store_name': self.store_name,
            'email': self.email,
            'phone': self.phone,
            'whatsapp': self.whatsapp,
            'whatsapp_channel': self.whatsapp_channel,
            'whatsapp_community': self.whatsapp_community,
            'instagram': self.instagram,
            'address': self.address,
            'business_hours': self.business_hours,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(20), unique=True, nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.Text, nullable=True)
    items = db.Column(db.JSON, nullable=False)
    total_amount = db.Column(db.Float, nullable=False, default=0)
    payment_status = db.Column(db.String(20), default='pending')
    order_status = db.Column(db.String(20), default='pending')
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'customer_name': self.customer_name,
            'phone': self.phone,
            'address': self.address,
            'items': self.items,
            'total_amount': self.total_amount,
            'payment_status': self.payment_status,
            'order_status': self.order_status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class AdminUser(db.Model):
    __tablename__ = 'admin_users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
