import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db, AdminUser, Category, Product, StoreSetting
from routes.auth import auth_bp, blacklisted_tokens
from routes.products import products_bp
from routes.categories import categories_bp
from routes.enquiries import enquiries_bp
from routes.analytics import analytics_bp
from routes.stall import stall_bp
from routes.settings import settings_bp
from routes.export import export_bp
from routes.orders import orders_bp


def seed_essentials():
    products_data = [
        {'name': 'Black Gram Porridge', 'slug': 'black-gram-porridge', 'description': 'Traditional protein-rich porridge made from organic black gram.', 'price': 120.00, 'category': 'traditional-porridges', 'image': '/images/landing/black-gram-porridge.png', 'ingredients': json.dumps(['Organic Black Gram', 'Spices', 'Salt']), 'benefits': json.dumps(['High protein', 'Good for digestion', 'Boosts energy', 'Rich in iron']), 'usage': 'Mix with water and cook until thick. Serve hot with ghee.', 'storage': 'Store in an airtight container in a cool, dry place.', 'shelf_life': '6 months', 'availability': 'in_stock', 'is_available_today': True, 'stock': 50},
        {'name': 'Kavuni Rice Porridge', 'slug': 'kavuni-rice-porridge', 'description': 'Nutritious purple rice porridge with natural antioxidants.', 'price': 150.00, 'category': 'traditional-porridges', 'image': '/images/landing/kavuni-rice-porridge.png', 'ingredients': json.dumps(['Organic Kavuni Rice', 'Jaggery', 'Cardamom']), 'benefits': json.dumps(['Rich in antioxidants', 'Natural energy source', 'Gluten-free', 'Good for heart']), 'usage': 'Cook with water and jaggery until soft. Garnish with nuts.', 'storage': 'Store in a cool, dry place away from moisture.', 'shelf_life': '6 months', 'availability': 'in_stock', 'is_available_today': True, 'stock': 40},
        {'name': 'Pearl Millet Porridge', 'slug': 'pearl-millet-porridge', 'description': 'Classic kambu koozh - cool, energizing summer drink.', 'price': 100.00, 'category': 'traditional-porridges', 'image': '/images/landing/pearl-millet-porridge.png', 'ingredients': json.dumps(['Organic Pearl Millet', 'Buttermilk', 'Onion', 'Green Chili']), 'benefits': json.dumps(['Cooling effect', 'Rich in fiber', 'Good for diabetes', 'Boosts immunity']), 'usage': 'Soak overnight, grind, and cook. Serve chilled with buttermilk.', 'storage': 'Best consumed fresh. Store batter in refrigerator for up to 2 days.', 'shelf_life': '2 days refrigerated', 'availability': 'in_stock', 'is_available_today': True, 'stock': 60},
        {'name': 'Sorghum Porridge', 'slug': 'sorghum-porridge', 'description': 'Traditional sorghum porridge - wholesome and nutritious.', 'price': 100.00, 'category': 'traditional-porridges', 'image': '/images/landing/sorghum-porridge.png', 'ingredients': json.dumps(['Organic Sorghum', 'Spices', 'Coconut']), 'benefits': json.dumps(['Gluten-free', 'High in fiber', 'Good for digestion', 'Nutrient-rich']), 'usage': 'Cook with water until thick. Add seasonings and serve hot.', 'storage': 'Store in airtight container. Keep in cool, dry place.', 'shelf_life': '6 months', 'availability': 'in_stock', 'is_available_today': False, 'stock': 35},
        {'name': 'Foxtail Millet Porridge', 'slug': 'foxtail-millet-porridge', 'description': 'Healthy foxtail millet porridge rich in fiber and nutrients.', 'price': 100.00, 'category': 'traditional-porridges', 'image': '/images/landing/foxtail-millet-porridge.png', 'ingredients': json.dumps(['Organic Foxtail Millet', 'Jaggery', 'Milk']), 'benefits': json.dumps(['Rich in fiber', 'Controls blood sugar', 'Gluten-free', 'Weight management']), 'usage': 'Roast lightly, cook with water and milk. Sweeten with jaggery.', 'storage': 'Store in an airtight container away from moisture.', 'shelf_life': '6 months', 'availability': 'in_stock', 'is_available_today': False, 'stock': 45},
        {'name': 'Amla Juice', 'slug': 'amla-juice', 'description': 'Fresh organic amla juice rich in Vitamin C and immunity boosters.', 'price': 180.00, 'category': 'herbal-juices', 'image': '/images/landing/amla-juice.png', 'ingredients': json.dumps(['Organic Amla', 'Purified Water', 'Natural Preservative']), 'benefits': json.dumps(['Rich in Vitamin C', 'Boosts immunity', 'Good for skin', 'Improves digestion']), 'usage': 'Take 30 ml on empty stomach daily. Mix with water if desired.', 'storage': 'Refrigerate after opening. Consume within 30 days.', 'shelf_life': '12 months', 'availability': 'in_stock', 'is_available_today': True, 'stock': 80},
        {'name': 'Beetroot Juice', 'slug': 'beetroot-juice', 'description': 'Vibrant beetroot juice packed with iron and antioxidants.', 'price': 120.00, 'category': 'herbal-juices', 'image': '/images/landing/beetroot-juice.png', 'ingredients': json.dumps(['Organic Beetroot', 'Purified Water', 'Lemon']), 'benefits': json.dumps(['Rich in iron', 'Improves blood circulation', 'Boosts stamina', 'Good for skin']), 'usage': 'Take 30 ml daily. Shake well before use. Best consumed fresh.', 'storage': 'Refrigerate after opening. Consume within 15 days.', 'shelf_life': '6 months', 'availability': 'in_stock', 'is_available_today': True, 'stock': 55},
        {'name': 'Black Nightshade Juice', 'slug': 'black-nightshade-juice', 'description': 'Traditional medicinal juice known for its health benefits.', 'price': 140.00, 'category': 'herbal-juices', 'image': '/images/landing/black-nightshade-juice.png', 'ingredients': json.dumps(['Organic Black Nightshade Leaves', 'Purified Water', 'Natural Preservative']), 'benefits': json.dumps(['Liver tonic', 'Good for digestion', 'Anti-inflammatory', 'Rich in nutrients']), 'usage': 'Take 20 ml twice daily before meals. Shake well before use.', 'storage': 'Refrigerate after opening. Consume within 30 days.', 'shelf_life': '12 months', 'availability': 'in_stock', 'is_available_today': True, 'stock': 45},
        {'name': "Tanner's Cassia Flower Juice", 'slug': 'tanner-cassia-juice', 'description': 'Traditional herbal juice made from avaram flower. Known for its cooling properties.', 'price': 130.00, 'category': 'herbal-juices', 'image': '/images/landing/tanner-cassia-juice.png', 'ingredients': json.dumps(['Organic Tanner Cassia Flowers', 'Purified Water', 'Natural Preservative']), 'benefits': json.dumps(['Cooling effect', 'Good for skin', 'Aids digestion', 'Detoxifies body']), 'usage': 'Take 20 ml twice daily. Can be diluted with water if needed.', 'storage': 'Refrigerate after opening. Consume within 30 days.', 'shelf_life': '12 months', 'availability': 'in_stock', 'is_available_today': False, 'stock': 30},
        {'name': 'Coconut Oil', 'slug': 'coconut-oil', 'description': 'Wood-pressed virgin coconut oil with authentic aroma.', 'price': 350.00, 'category': 'cold-pressed-oils', 'image': '/images/landing/coconut-oil.png', 'ingredients': json.dumps(['100% Organic Coconut']), 'benefits': json.dumps(['Boosts metabolism', 'Good for skin and hair', 'Enhances immunity', 'Antimicrobial']), 'usage': 'Ideal for cooking, skin care, and hair care.', 'storage': 'Store in a cool, dry place. Natural solidification is normal.', 'shelf_life': '18 months', 'availability': 'in_stock', 'is_available_today': True, 'stock': 100},
        {'name': 'Coconut Oil with Curry Leaves', 'slug': 'coconut-oil-curry-leaves', 'description': 'Wood-pressed coconut oil infused with aromatic curry leaves.', 'price': 380.00, 'category': 'cold-pressed-oils', 'image': '/images/landing/coconut-oil-curry-leaves.png', 'ingredients': json.dumps(['Organic Coconut', 'Fresh Curry Leaves']), 'benefits': json.dumps(['Hair growth promoter', 'Rich in antioxidants', 'Good for skin', 'Digestive aid']), 'usage': 'Ideal for cooking and hair care.', 'storage': 'Store in a cool, dry place away from direct sunlight.', 'shelf_life': '18 months', 'availability': 'in_stock', 'is_available_today': True, 'stock': 60},
        {'name': 'Coconut Oil with Hibiscus', 'slug': 'coconut-oil-hibiscus', 'description': 'Wood-pressed coconut oil with curry leaves and hibiscus.', 'price': 380.00, 'category': 'cold-pressed-oils', 'image': '/images/landing/coconut-oil-hibiscus.png', 'ingredients': json.dumps(['Organic Coconut', 'Fresh Curry Leaves', 'Hibiscus Flowers']), 'benefits': json.dumps(['Promotes hair growth', 'Prevents graying', 'Strengthens roots', 'Nourishes scalp']), 'usage': 'Apply to scalp and hair. Leave for 1 hour before washing.', 'storage': 'Store in a cool, dry place away from sunlight.', 'shelf_life': '18 months', 'availability': 'in_stock', 'is_available_today': False, 'stock': 50},
        {'name': 'Sesame Balls', 'slug': 'sesame-balls', 'description': 'Traditional ellu urundai made with jaggery and sesame.', 'price': 80.00, 'category': 'traditional-snacks', 'image': '/images/landing/sesame-balls.png', 'ingredients': json.dumps(['Organic Sesame Seeds', 'Jaggery', 'Cardamom']), 'benefits': json.dumps(['Rich in calcium', 'Good for bones', 'Natural energy booster', 'Warms the body']), 'usage': 'Ready to eat. Perfect as an evening snack.', 'storage': 'Store in an airtight container at room temperature.', 'shelf_life': '30 days', 'availability': 'in_stock', 'is_available_today': True, 'stock': 120},
        {'name': 'Black Chickpea', 'slug': 'black-chickpea', 'description': 'Organic black chickpea - protein-rich traditional snack.', 'price': 60.00, 'category': 'traditional-snacks', 'image': '/images/landing/black-chickpea.png', 'ingredients': json.dumps(['Organic Black Chickpea']), 'benefits': json.dumps(['High protein', 'Rich in fiber', 'Good for heart', 'Controls blood sugar']), 'usage': 'Soak overnight, cook until soft. Use in salads or as curry.', 'storage': 'Store in an airtight container in a cool, dry place.', 'shelf_life': '12 months', 'availability': 'in_stock', 'is_available_today': True, 'stock': 80},
    ]
    if not AdminUser.query.first():
        admin = AdminUser(email='aarokiyapaathai@gmail.com', name='Admin')
        admin.set_password('Admin@123')
        db.session.add(admin)
        categories_data = [
            {'name': 'Traditional Porridges', 'slug': 'traditional-porridges', 'description': 'Nutritious traditional porridges made from organic millets and rice', 'image': '/images/landing/black-gram-porridge.png', 'product_count': 5, 'is_active': True},
            {'name': 'Herbal Juices', 'slug': 'herbal-juices', 'description': 'Freshly prepared herbal juices with authentic traditional recipes', 'image': '/images/landing/amla-juice.png', 'product_count': 4, 'is_active': True},
            {'name': 'Cold-Pressed Oils', 'slug': 'cold-pressed-oils', 'description': 'Wood-pressed oils retaining natural nutrients and flavor', 'image': '/images/landing/coconut-oil.png', 'product_count': 3, 'is_active': True},
            {'name': 'Traditional Snacks', 'slug': 'traditional-snacks', 'description': 'Authentic Tamil snacks made from pure organic ingredients', 'image': '/images/landing/sesame-balls.png', 'product_count': 2, 'is_active': True},
        ]
        for cd in categories_data:
            c = Category(**cd)
            db.session.add(c)
            db.session.flush()
        for pd in products_data:
            slug = pd.pop('category')
            p = Product(**pd)
            p.category = slug
            p.sales = 0
            p.reviews_count = 0
            p.rating = 0
            p.is_product_of_day = False
            p.featured = False
            db.session.add(p)
        if not StoreSetting.query.first():
            db.session.add(StoreSetting())
        print('Essential data seeded (admin, categories, products, settings)')
    else:
        for p in Product.query.all():
            p.sales = 0
            p.reviews_count = 0
            p.rating = 0
            p.is_available_today = False
            p.is_product_of_day = False
            p.featured = False
        print('Reset product analytics fields to zero')
    db.session.commit()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True, vary_header=False)

    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get('Origin', '')
        if origin:
            allowed = Config.CORS_ORIGINS
            if '*' in allowed or origin in allowed:
                response.headers['Access-Control-Allow-Origin'] = origin
                response.headers['Access-Control-Allow-Credentials'] = 'true'
                response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
                response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, X-Requested-With'
        return response

    db.init_app(app)

    jwt = JWTManager(app)

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        return jti in blacklisted_tokens

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has been revoked'}), 401

    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({'error': 'Authorization token is missing'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({'error': 'Invalid token'}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired'}), 401

    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(enquiries_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(stall_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(export_bp)
    app.register_blueprint(orders_bp)

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'service': 'Arogya Paadhai API'}), 200

    with app.app_context():
        db.create_all()
        seed_essentials()

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
