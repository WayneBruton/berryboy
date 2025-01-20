from app import create_app, db
from app.models import Product, Category
from flask_migrate import upgrade
from sqlalchemy import text
import time

def deploy():
    """Run deployment tasks."""
    app = create_app()
    
    with app.app_context():
        # Wait for database to be ready (useful for render.com cold starts)
        max_retries = 5
        for i in range(max_retries):
            try:
                # Try to connect to the database
                db.session.execute(text('SELECT 1'))
                print("Database connection successful!")
                break
            except Exception as e:
                if i == max_retries - 1:
                    print(f"Failed to connect to database after {max_retries} attempts")
                    raise
                print(f"Database connection attempt {i + 1} failed, retrying in 5 seconds...")
                time.sleep(5)
        
        # Create or upgrade database
        db.create_all()
        
        # Run database migrations
        upgrade()
        
        # Check if we need to initialize data
        if Category.query.count() == 0:
            print("Initializing categories...")
            # Create categories
            categories = [
                Category(name='Fresh Berries', description='Fresh, handpicked berries'),
                Category(name='Frozen Berries', description='Flash-frozen berries'),
                Category(name='Berry Products', description='Berry-based products')
            ]
            
            for category in categories:
                db.session.add(category)
            db.session.commit()
            
            # Get category IDs
            fresh_cat = Category.query.filter_by(name='Fresh Berries').first()
            frozen_cat = Category.query.filter_by(name='Frozen Berries').first()
            products_cat = Category.query.filter_by(name='Berry Products').first()
            
            # Create products only if they don't exist
            if Product.query.count() == 0:
                print("Initializing products...")
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
                        name='Mixed Berry Jam',
                        description='Homemade jam made from a blend of fresh berries.',
                        price=7.99,
                        stock=50,
                        image_url='img/products/berry-jam.jpg',
                        category_id=products_cat.id,
                        is_active=True
                    )
                ]
                
                for product in products:
                    db.session.add(product)
                db.session.commit()
                print("Database initialized with categories and products!")
            else:
                print("Products already exist in database.")
        else:
            print("Categories already exist in database.")

if __name__ == '__main__':
    deploy()
