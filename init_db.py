from app import create_app, db
from app.models import Product, Category

def init_db():
    app = create_app()
    with app.app_context():
        # Create categories
        categories = [
            Category(name='Fresh Berries', description='Fresh, handpicked berries'),
            Category(name='Frozen Berries', description='Flash-frozen berries'),
            Category(name='Berry Products', description='Berry-based products')
        ]
        
        for category in categories:
            existing = Category.query.filter_by(name=category.name).first()
            if not existing:
                db.session.add(category)
        
        db.session.commit()
        
        # Get category IDs
        fresh_cat = Category.query.filter_by(name='Fresh Berries').first()
        frozen_cat = Category.query.filter_by(name='Frozen Berries').first()
        products_cat = Category.query.filter_by(name='Berry Products').first()
        
        # Create products
        products = [
            Product(
                name='Fresh Strawberries',
                description='Sweet and juicy strawberries, freshly picked from local farms.',
                price=4.99,
                stock=100,
                image_url='img/products/strawberries.jpg',
                category_id=fresh_cat.id,
                is_active=True
            ),
            Product(
                name='Fresh Blueberries',
                description='Plump and sweet blueberries, rich in antioxidants.',
                price=6.99,
                stock=100,
                image_url='img/products/blueberries.jpg',
                category_id=fresh_cat.id,
                is_active=True
            ),
            Product(
                name='Frozen Raspberry Mix',
                description='Premium raspberries, flash-frozen to preserve flavor.',
                price=5.99,
                stock=100,
                image_url='img/products/frozen-berries.jpg',
                category_id=frozen_cat.id,
                is_active=True
            ),
            Product(
                name='Mixed Berry Collection',
                description='A delightful mix of fresh seasonal berries.',
                price=12.99,
                stock=50,
                image_url='img/products/mixed-berries.jpg',
                category_id=products_cat.id,
                is_active=True
            )
        ]
        
        for product in products:
            existing = Product.query.filter_by(name=product.name).first()
            if not existing:
                db.session.add(product)
        
        db.session.commit()
        print("Database initialized with categories and products!")

if __name__ == '__main__':
    init_db()
