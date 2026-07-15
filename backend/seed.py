import json
import random
from datetime import date, timedelta
from app import create_app
from models import db, Product, Category, DailyUpdate, AdminUser, Stall, Sale, ProductStock, Production, Investment, Customer, EnquiryExtended, ProductRequest, Climate, StoreSetting


def seed():
    app = create_app()
    with app.app_context():
        db.create_all()

        if AdminUser.query.first():
            print('Database already seeded. Skipping.')
            return

        admin = AdminUser(
            email='admin@arogyapaadhai.com',
            name='Admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)

        categories_data = [
            {'name': 'Traditional Porridges', 'slug': 'traditional-porridges', 'description': 'Nutritious traditional porridges made from organic millets and rice', 'image': '/images/landing/black-gram-porridge.png', 'product_count': 5, 'is_active': True},
            {'name': 'Herbal Juices', 'slug': 'herbal-juices', 'description': 'Freshly prepared herbal juices with authentic traditional recipes', 'image': '/images/landing/amla-juice.png', 'product_count': 4, 'is_active': True},
            {'name': 'Cold-Pressed Oils', 'slug': 'cold-pressed-oils', 'description': 'Wood-pressed oils retaining natural nutrients and flavor', 'image': '/images/landing/coconut-oil.png', 'product_count': 3, 'is_active': True},
            {'name': 'Traditional Snacks', 'slug': 'traditional-snacks', 'description': 'Authentic Tamil snacks made from pure organic ingredients', 'image': '/images/landing/sesame-balls.png', 'product_count': 2, 'is_active': True},
        ]

        categories = {}
        for cat_data in categories_data:
            cat = Category(**cat_data)
            db.session.add(cat)
            db.session.flush()
            categories[cat.slug] = cat

        products_data = [
            {
                'name': 'Black Gram Porridge',
                'slug': 'black-gram-porridge',
                'description': 'Traditional protein-rich porridge made from organic black gram. A wholesome breakfast that provides sustained energy throughout the day.',
                'price': 120.00,
                'original_price': 0,
                'category': 'traditional-porridges',
                'image': '/images/landing/black-gram-porridge.png',
                'ingredients': json.dumps(['Organic Black Gram', 'Spices', 'Salt']),
                'benefits': json.dumps(['High protein', 'Good for digestion', 'Boosts energy', 'Rich in iron']),
                'usage': 'Mix with water and cook until thick. Serve hot with ghee.',
                'storage': 'Store in an airtight container in a cool, dry place.',
                'shelf_life': '6 months',
                'availability': 'in_stock',
                'is_available_today': True,
                'is_product_of_day': False,
                'rating': 4.5,
                'reviews_count': 45,
                'sales': 120,
                'stock': 50,
                'featured': True,
            },
            {
                'name': 'Kavuni Rice Porridge',
                'slug': 'kavuni-rice-porridge',
                'description': 'Nutritious purple rice porridge with natural antioxidants. Made from traditional kavuni rice variety known for its rich color and health benefits.',
                'price': 150.00,
                'original_price': 0,
                'category': 'traditional-porridges',
                'image': '/images/landing/kavuni-rice-porridge.png',
                'ingredients': json.dumps(['Organic Kavuni Rice', 'Jaggery', 'Cardamom']),
                'benefits': json.dumps(['Rich in antioxidants', 'Natural energy source', 'Gluten-free', 'Good for heart']),
                'usage': 'Cook with water and jaggery until soft. Garnish with nuts.',
                'storage': 'Store in a cool, dry place away from moisture.',
                'shelf_life': '6 months',
                'availability': 'in_stock',
                'is_available_today': True,
                'is_product_of_day': False,
                'rating': 4.7,
                'reviews_count': 38,
                'sales': 90,
                'stock': 40,
                'featured': True,
            },
            {
                'name': 'Pearl Millet Porridge',
                'slug': 'pearl-millet-porridge',
                'description': 'Classic kambu koozh - cool, energizing summer drink. A traditional Tamil Nadu staple that keeps you cool during hot summers.',
                'price': 100.00,
                'original_price': 0,
                'category': 'traditional-porridges',
                'image': '/images/landing/pearl-millet-porridge.png',
                'ingredients': json.dumps(['Organic Pearl Millet', 'Buttermilk', 'Onion', 'Green Chili']),
                'benefits': json.dumps(['Cooling effect', 'Rich in fiber', 'Good for diabetes', 'Boosts immunity']),
                'usage': 'Soak overnight, grind, and cook. Serve chilled with buttermilk.',
                'storage': 'Best consumed fresh. Store batter in refrigerator for up to 2 days.',
                'shelf_life': '2 days refrigerated',
                'availability': 'in_stock',
                'is_available_today': True,
                'is_product_of_day': False,
                'rating': 4.6,
                'reviews_count': 52,
                'sales': 150,
                'stock': 60,
                'featured': True,
            },
            {
                'name': 'Sorghum Porridge',
                'slug': 'sorghum-porridge',
                'description': 'Traditional sorghum porridge - wholesome and nutritious. A hearty breakfast option enjoyed for generations in rural Tamil Nadu.',
                'price': 100.00,
                'original_price': 0,
                'category': 'traditional-porridges',
                'image': '/images/landing/sorghum-porridge.png',
                'ingredients': json.dumps(['Organic Sorghum', 'Spices', 'Coconut']),
                'benefits': json.dumps(['Gluten-free', 'High in fiber', 'Good for digestion', 'Nutrient-rich']),
                'usage': 'Cook with water until thick. Add seasonings and serve hot.',
                'storage': 'Store in airtight container. Keep in cool, dry place.',
                'shelf_life': '6 months',
                'availability': 'in_stock',
                'is_available_today': False,
                'is_product_of_day': False,
                'rating': 4.4,
                'reviews_count': 28,
                'sales': 70,
                'stock': 35,
                'featured': False,
            },
            {
                'name': 'Foxtail Millet Porridge',
                'slug': 'foxtail-millet-porridge',
                'description': 'Healthy foxtail millet porridge rich in fiber and nutrients. Thinai is one of the oldest cultivated millets in Tamil culture.',
                'price': 100.00,
                'original_price': 0,
                'category': 'traditional-porridges',
                'image': '/images/landing/foxtail-millet-porridge.png',
                'ingredients': json.dumps(['Organic Foxtail Millet', 'Jaggery', 'Milk']),
                'benefits': json.dumps(['Rich in fiber', 'Controls blood sugar', 'Gluten-free', 'Weight management']),
                'usage': 'Roast lightly, cook with water and milk. Sweeten with jaggery.',
                'storage': 'Store in an airtight container away from moisture.',
                'shelf_life': '6 months',
                'availability': 'in_stock',
                'is_available_today': False,
                'is_product_of_day': False,
                'rating': 4.5,
                'reviews_count': 33,
                'sales': 85,
                'stock': 45,
                'featured': False,
            },
            {
                'name': 'Amla Juice',
                'slug': 'amla-juice',
                'description': 'Fresh organic amla juice rich in Vitamin C and immunity boosters. Made from handpicked Indian gooseberries grown in organic farms.',
                'price': 180.00,
                'original_price': 0,
                'category': 'herbal-juices',
                'image': '/images/landing/amla-juice.png',
                'ingredients': json.dumps(['Organic Amla', 'Purified Water', 'Natural Preservative']),
                'benefits': json.dumps(['Rich in Vitamin C', 'Boosts immunity', 'Good for skin', 'Improves digestion']),
                'usage': 'Take 30 ml on empty stomach daily. Mix with water if desired.',
                'storage': 'Refrigerate after opening. Consume within 30 days.',
                'shelf_life': '12 months',
                'availability': 'in_stock',
                'is_available_today': True,
                'is_product_of_day': False,
                'rating': 4.8,
                'reviews_count': 67,
                'sales': 200,
                'stock': 80,
                'featured': True,
            },
            {
                'name': 'Beetroot Juice',
                'slug': 'beetroot-juice',
                'description': 'Vibrant beetroot juice packed with iron and antioxidants. Made from fresh, organically grown beetroots for maximum nutrition.',
                'price': 120.00,
                'original_price': 0,
                'category': 'herbal-juices',
                'image': '/images/landing/beetroot-juice.png',
                'ingredients': json.dumps(['Organic Beetroot', 'Purified Water', 'Lemon']),
                'benefits': json.dumps(['Rich in iron', 'Improves blood circulation', 'Boosts stamina', 'Good for skin']),
                'usage': 'Take 30 ml daily. Shake well before use. Best consumed fresh.',
                'storage': 'Refrigerate after opening. Consume within 15 days.',
                'shelf_life': '6 months',
                'availability': 'in_stock',
                'is_available_today': True,
                'is_product_of_day': False,
                'rating': 4.6,
                'reviews_count': 41,
                'sales': 130,
                'stock': 55,
                'featured': True,
            },
            {
                'name': 'Black Nightshade Juice',
                'slug': 'black-nightshade-juice',
                'description': 'Traditional medicinal juice known for its health benefits. Made from Manathakkali leaves following ancient Siddha recipes.',
                'price': 140.00,
                'original_price': 0,
                'category': 'herbal-juices',
                'image': '/images/landing/black-nightshade-juice.png',
                'ingredients': json.dumps(['Organic Black Nightshade Leaves', 'Purified Water', 'Natural Preservative']),
                'benefits': json.dumps(['Liver tonic', 'Good for digestion', 'Anti-inflammatory', 'Rich in nutrients']),
                'usage': 'Take 20 ml twice daily before meals. Shake well before use.',
                'storage': 'Refrigerate after opening. Consume within 30 days.',
                'shelf_life': '12 months',
                'availability': 'in_stock',
                'is_available_today': True,
                'is_product_of_day': False,
                'rating': 4.5,
                'reviews_count': 36,
                'sales': 110,
                'stock': 45,
                'featured': False,
            },
            {
                'name': "Tanner's Cassia Flower Juice",
                'slug': 'tanner-cassia-juice',
                'description': 'Traditional herbal juice made from avaram flower. Known for its cooling properties and used in Siddha medicine for various ailments.',
                'price': 130.00,
                'original_price': 0,
                'category': 'herbal-juices',
                'image': '/images/landing/tanner-cassia-juice.png',
                'ingredients': json.dumps(['Organic Tanner Cassia Flowers', 'Purified Water', 'Natural Preservative']),
                'benefits': json.dumps(['Cooling effect', 'Good for skin', 'Aids digestion', 'Detoxifies body']),
                'usage': 'Take 20 ml twice daily. Can be diluted with water if needed.',
                'storage': 'Refrigerate after opening. Consume within 30 days.',
                'shelf_life': '12 months',
                'availability': 'in_stock',
                'is_available_today': False,
                'is_product_of_day': False,
                'rating': 4.4,
                'reviews_count': 24,
                'sales': 65,
                'stock': 30,
                'featured': False,
            },
            {
                'name': 'Coconut Oil',
                'slug': 'coconut-oil',
                'description': 'Wood-pressed virgin coconut oil with authentic aroma. Made from fresh coconuts using traditional wooden churn method.',
                'price': 350.00,
                'original_price': 0,
                'category': 'cold-pressed-oils',
                'image': '/images/landing/coconut-oil.png',
                'ingredients': json.dumps(['100% Organic Coconut']),
                'benefits': json.dumps(['Boosts metabolism', 'Good for skin and hair', 'Enhances immunity', 'Antimicrobial']),
                'usage': 'Ideal for cooking, skin care, and hair care.',
                'storage': 'Store in a cool, dry place. Natural solidification is normal.',
                'shelf_life': '18 months',
                'availability': 'in_stock',
                'is_available_today': True,
                'is_product_of_day': True,
                'rating': 4.9,
                'reviews_count': 89,
                'sales': 350,
                'stock': 100,
                'featured': True,
            },
            {
                'name': 'Coconut Oil with Curry Leaves',
                'slug': 'coconut-oil-curry-leaves',
                'description': 'Wood-pressed coconut oil infused with aromatic curry leaves. Combines the goodness of coconut oil with the medicinal properties of curry leaves.',
                'price': 380.00,
                'original_price': 0,
                'category': 'cold-pressed-oils',
                'image': '/images/landing/coconut-oil-curry-leaves.png',
                'ingredients': json.dumps(['Organic Coconut', 'Fresh Curry Leaves']),
                'benefits': json.dumps(['Hair growth promoter', 'Rich in antioxidants', 'Good for skin', 'Digestive aid']),
                'usage': 'Ideal for cooking and hair care.',
                'storage': 'Store in a cool, dry place away from direct sunlight.',
                'shelf_life': '18 months',
                'availability': 'in_stock',
                'is_available_today': True,
                'is_product_of_day': False,
                'rating': 4.7,
                'reviews_count': 52,
                'sales': 180,
                'stock': 60,
                'featured': True,
            },
            {
                'name': 'Coconut Oil with Hibiscus',
                'slug': 'coconut-oil-hibiscus',
                'description': 'Wood-pressed coconut oil with curry leaves and hibiscus. A traditional hair care oil made using time-honored recipes.',
                'price': 380.00,
                'original_price': 0,
                'category': 'cold-pressed-oils',
                'image': '/images/landing/coconut-oil-hibiscus.png',
                'ingredients': json.dumps(['Organic Coconut', 'Fresh Curry Leaves', 'Hibiscus Flowers']),
                'benefits': json.dumps(['Promotes hair growth', 'Prevents graying', 'Strengthens roots', 'Nourishes scalp']),
                'usage': 'Apply to scalp and hair. Leave for 1 hour before washing.',
                'storage': 'Store in a cool, dry place away from sunlight.',
                'shelf_life': '18 months',
                'availability': 'in_stock',
                'is_available_today': False,
                'is_product_of_day': False,
                'rating': 4.6,
                'reviews_count': 44,
                'sales': 140,
                'stock': 50,
                'featured': False,
            },
            {
                'name': 'Sesame Balls',
                'slug': 'sesame-balls',
                'description': 'Traditional ellu urundai made with jaggery and sesame. A classic Tamil Nadu snack that is both nutritious and delicious.',
                'price': 80.00,
                'original_price': 0,
                'category': 'traditional-snacks',
                'image': '/images/landing/sesame-balls.png',
                'ingredients': json.dumps(['Organic Sesame Seeds', 'Jaggery', 'Cardamom']),
                'benefits': json.dumps(['Rich in calcium', 'Good for bones', 'Natural energy booster', 'Warms the body']),
                'usage': 'Ready to eat. Perfect as an evening snack.',
                'storage': 'Store in an airtight container at room temperature.',
                'shelf_life': '30 days',
                'availability': 'in_stock',
                'is_available_today': True,
                'is_product_of_day': False,
                'rating': 4.8,
                'reviews_count': 73,
                'sales': 300,
                'stock': 120,
                'featured': True,
            },
            {
                'name': 'Black Chickpea',
                'slug': 'black-chickpea',
                'description': 'Organic black chickpea - protein-rich traditional snack. A favorite protein source in Tamil cuisine, perfect for salads and curries.',
                'price': 60.00,
                'original_price': 0,
                'category': 'traditional-snacks',
                'image': '/images/landing/black-chickpea.png',
                'ingredients': json.dumps(['Organic Black Chickpea']),
                'benefits': json.dumps(['High protein', 'Rich in fiber', 'Good for heart', 'Controls blood sugar']),
                'usage': 'Soak overnight, cook until soft. Use in salads or as curry.',
                'storage': 'Store in an airtight container in a cool, dry place.',
                'shelf_life': '12 months',
                'availability': 'in_stock',
                'is_available_today': True,
                'is_product_of_day': False,
                'rating': 4.4,
                'reviews_count': 31,
                'sales': 90,
                'stock': 80,
                'featured': False,
            },
        ]

        for prod_data in products_data:
            slug = prod_data['slug']
            category_slug = prod_data.pop('category')
            product = Product(**prod_data)
            product.category = category_slug
            db.session.add(product)
            db.session.flush()

            if category_slug in categories:
                categories[category_slug].product_count += 1

        today = date.today()
        products = Product.query.all()
        product_map = {p.slug: p for p in products}

        # --- Daily Updates ---
        available_products = Product.query.filter_by(is_available_today=True).all()
        for product in available_products:
            for day_offset in range(7):
                update_date = today - timedelta(days=day_offset)
                stock_labels = ['Full Stock', 'Limited Stock', 'Full Stock', 'Full Stock', 'Out of Stock', 'Limited Stock', 'Full Stock']
                update = DailyUpdate(
                    product_id=product.id,
                    date=update_date,
                    is_available=day_offset not in [4],
                    stock_label=stock_labels[day_offset],
                )
                db.session.add(update)

        # --- Stall entries ---
        stall_today = Stall(
            date=today,
            open_time='07:15',
            close_time='20:00',
            staff_name='Lakshmi',
            status='open',
            weather='Sunny',
            temperature=34.0,
            rain_status='No Rain',
            notes='Good crowd today. Sesame balls sold out early.',
            working_hours=12.75,
        )
        db.session.add(stall_today)
        for days_ago in range(1, 7):
            d = today - timedelta(days=days_ago)
            weather_opts = [('Sunny', 35), ('Partly Cloudy', 32), ('Sunny', 34), ('Cloudy', 30), ('Rainy', 28), ('Sunny', 33)]
            w, t = weather_opts[days_ago % len(weather_opts)]
            stall = Stall(
                date=d,
                open_time='07:00',
                close_time='19:30' if days_ago < 5 else '18:00',
                staff_name='Lakshmi' if days_ago % 2 == 0 else 'Murugan',
                status='closed',
                weather=w,
                temperature=t,
                rain_status='Light Rain' if w == 'Rainy' else 'No Rain',
                notes='',
                working_hours=random.uniform(10, 13),
            )
            db.session.add(stall)

        # --- Sales data (today + last 7 days) ---
        payment_methods = ['cash', 'phone_pe', 'google_pay', 'cash', 'phone_pe', 'cash']
        customer_types = ['new', 'returning', 'returning', 'new', 'returning']
        product_ids_for_sale = [p.id for p in products]
        sale_prices = {p.id: p.price for p in products}
        sale_times_today = [
            '07:30', '08:15', '09:00', '09:45', '10:30', '11:00', '11:30', '12:00',
            '12:30', '13:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
            '17:00', '17:30', '18:00', '18:30',
        ]
        for day_offset in range(7):
            d = today - timedelta(days=day_offset)
            num_sales = random.randint(10, 25) if day_offset == 0 else random.randint(5, 20)
            for _ in range(num_sales):
                pid = random.choice(product_ids_for_sale)
                qty = random.randint(1, 5)
                unit_price = sale_prices[pid]
                discount = round(random.uniform(0, 20), 2) if random.random() < 0.2 else 0
                total = round(unit_price * qty - discount, 2)
                pm = random.choice(payment_methods)
                ct = random.choice(customer_types)
                sale = Sale(
                    date=d,
                    product_id=pid,
                    product_name=product_map.get(pid, Product.query.get(pid)).name if Product.query.get(pid) else 'Unknown',
                    category=Product.query.get(pid).category if Product.query.get(pid) else None,
                    unit_price=unit_price,
                    quantity=qty,
                    total_price=max(total, 0),
                    discount=discount,
                    payment_method=pm,
                    customer_type=ct,
                    sale_time=random.choice(sale_times_today),
                )
                db.session.add(sale)

        # --- ProductStock (today + 7 days) ---
        for pid in product_ids_for_sale:
            for day_offset in range(7):
                d = today - timedelta(days=day_offset)
                base_open = random.randint(30, 150)
                base_prod = random.randint(10, 40)
                base_sold = random.randint(20, min(base_open + base_prod, 80))
                base_damaged = random.randint(0, 5)
                base_close = base_open + base_prod - base_sold - base_damaged
                stock = ProductStock(
                    product_id=pid,
                    date=d,
                    opening_stock=base_open,
                    todays_production=base_prod,
                    purchase_quantity=random.randint(0, 20),
                    available_stock=base_open + base_prod,
                    sold_quantity=base_sold,
                    damaged_quantity=base_damaged,
                    closing_stock=max(base_close, 0),
                    min_stock_alert=10 if random.random() < 0.3 else 25,
                    unit='piece',
                    supplier='Local Organic Farm' if random.random() < 0.5 else None,
                )
                db.session.add(stock)

        # --- Production entries ---
        for pid in random.sample(product_ids_for_sale, min(5, len(product_ids_for_sale))):
            for day_offset in range(3):
                d = today - timedelta(days=day_offset)
                qty = random.randint(30, 100)
                rm_cost = round(random.uniform(200, 800), 2)
                lb_cost = round(random.uniform(100, 400), 2)
                gas_cost = round(random.uniform(30, 100), 2)
                elec_cost = round(random.uniform(20, 80), 2)
                pkg_cost = round(random.uniform(30, 120), 2)
                tr_cost = round(random.uniform(20, 60), 2)
                misc = round(random.uniform(10, 50), 2)
                total_cost = round(rm_cost + lb_cost + gas_cost + elec_cost + pkg_cost + tr_cost + misc, 2)
                cost_per_unit = round(total_cost / qty, 2) if qty > 0 else 0
                exp_price = round(cost_per_unit * random.uniform(1.3, 2.0), 2)
                exp_profit = round((exp_price - cost_per_unit) * qty, 2)
                prod_entry = Production(
                    product_id=pid,
                    date=d,
                    quantity=qty,
                    unit='piece',
                    raw_material_cost=rm_cost,
                    labour_cost=lb_cost,
                    gas_cost=gas_cost,
                    electricity_cost=elec_cost,
                    packaging_cost=pkg_cost,
                    transport_cost=tr_cost,
                    misc_cost=misc,
                    total_cost=total_cost,
                    cost_per_unit=cost_per_unit,
                    expected_price=exp_price,
                    expected_profit=exp_profit,
                )
                db.session.add(prod_entry)

        # --- Investments ---
        for day_offset in range(7):
            d = today - timedelta(days=day_offset)
            inv = Investment(
                date=d,
                milk_cost=round(random.uniform(200, 600), 2),
                rice_cost=round(random.uniform(100, 300), 2),
                vegetables_cost=round(random.uniform(150, 400), 2),
                oil_cost=round(random.uniform(100, 350), 2),
                spices_cost=round(random.uniform(50, 200), 2),
                packaging_cost=round(random.uniform(80, 250), 2),
                gas_cost=round(random.uniform(40, 120), 2),
                electricity_cost=round(random.uniform(30, 100), 2),
                transport_cost=round(random.uniform(50, 150), 2),
                labour_cost=round(random.uniform(200, 500), 2),
                other_expenses=round(random.uniform(30, 100), 2),
            )
            inv.total_investment = round(sum([
                inv.milk_cost, inv.rice_cost, inv.vegetables_cost, inv.oil_cost,
                inv.spices_cost, inv.packaging_cost, inv.gas_cost, inv.electricity_cost,
                inv.transport_cost, inv.labour_cost, inv.other_expenses
            ]), 2)
            db.session.add(inv)

        # --- Customers ---
        customer_names_pool = ['Rajesh', 'Priya', 'Karthik', 'Anandhi', 'Murugan', 'Selvi', 'Venkatesh', 'Lakshmi', 'Suresh', 'Geetha']
        for day_offset in range(7):
            d = today - timedelta(days=day_offset)
            for _ in range(random.randint(3, 10)):
                c = Customer(
                    date=d,
                    age=random.randint(18, 70),
                    gender=random.choice(['Male', 'Female']),
                    profession=random.choice(['Teacher', 'Engineer', 'Farmer', 'Homemaker', 'Student', 'Business', 'Retired']),
                    location=random.choice(['Krishnagiri', 'Bargur', 'Kaveripattinam', 'Denkanikottai']),
                    customer_type=random.choice(['new', 'returning']),
                    purchase_amount=round(random.uniform(30, 400), 2),
                    favourite_product=random.choice(['Sesame Balls', 'Amla Juice', 'Coconut Oil', 'Pearl Millet Porridge']),
                    purpose_of_visit=random.choice(['Daily purchase', 'Weekend stock', 'First time', 'Gift', 'Health need']),
                )
                db.session.add(c)

        # --- EnquiriesExtended ---
        enq_names = ['Sundar', 'Revathi', 'Mohan', 'Jayanthi', 'Prakash']
        for i, name in enumerate(enq_names):
            e = EnquiryExtended(
                date=today - timedelta(days=i),
                customer_name=name,
                phone=f'+91 98765 {40000 + i}',
                requested_product=random.choice(['Almond Oil', 'Garlic Oil', 'Moringa Powder', 'Neem Oil']),
                purpose='New product inquiry',
                status='pending' if i < 3 else 'contacted',
                follow_up_date=today + timedelta(days=3),
                remarks='Customer interested in bulk order' if i == 0 else '',
            )
            db.session.add(e)

        # --- ProductRequests ---
        req_items = ['Almond Oil', 'Garlic Oil', 'Moringa Powder', 'Neem Oil', 'Figs']
        for i, item in enumerate(req_items):
            r = ProductRequest(
                date=today - timedelta(days=i),
                requested_item=item,
                requested_by=random.choice(['Anand', 'Kavitha', 'Senthil', 'Uma']),
                age=random.randint(25, 55),
                profession=random.choice(['Engineer', 'Nurse', 'Business', 'Teacher']),
                reason=f'Looking for organic {item.lower()}',
                priority=random.choice(['high', 'medium', 'low']),
                status='pending' if i < 3 else 'reviewed',
                votes=random.randint(1, 10),
            )
            db.session.add(r)

        # --- Climate ---
        for day_offset in range(7):
            d = today - timedelta(days=day_offset)
            climate = Climate(
                date=d,
                temperature=round(random.uniform(28, 38), 1),
                weather=random.choice(['Sunny', 'Partly Cloudy', 'Cloudy', 'Clear']),
                humidity=round(random.uniform(40, 80), 1),
                rain=round(random.uniform(0, 5), 1) if random.random() < 0.3 else 0,
                wind=round(random.uniform(5, 25), 1),
                remarks='',
            )
            db.session.add(climate)

        # --- StoreSetting ---
        existing = StoreSetting.query.first()
        if not existing:
            setting = StoreSetting()
            db.session.add(setting)

        db.session.commit()
        print('Database seeded successfully with sample data!')
        print(f'  - Admin: admin@arogyapaadhai.com / admin123')
        print(f'  - {Category.query.count()} categories')
        print(f'  - {Product.query.count()} products')
        print(f'  - {DailyUpdate.query.count()} daily updates')
        print(f'  - {Stall.query.count()} stalls')
        print(f'  - {Sale.query.count()} sales')
        print(f'  - {ProductStock.query.count()} stock records')
        print(f'  - {Production.query.count()} productions')
        print(f'  - {Investment.query.count()} investments')
        print(f'  - {Customer.query.count()} customers')
        print(f'  - {EnquiryExtended.query.count()} enquiries')
        print(f'  - {ProductRequest.query.count()} product requests')
        print(f'  - {Climate.query.count()} climate records')


if __name__ == '__main__':
    seed()
