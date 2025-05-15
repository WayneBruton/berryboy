from app import create_app
from app.extensions import db
from app.models.product import Category, Product
from app.models.user import User

def seed_data():
    app = create_app()
    with app.app_context():
        # Create categories
        categories = [
            Category(name='Fresh Berries', description='Freshly picked, seasonal berries'),
            Category(name='Fresh Fruit', description='Freshly picked, seasonal fruit'),
            Category(name='Frozen Berries', description='Flash-frozen berries, perfect for smoothies'),
            Category(name='Berry Products', description='Jams, juices, and other berry-based products')
        ]
        
        for category in categories:
            db.session.add(category)
        db.session.commit()
        
        # Create products
        products = [
            Product(
                name='Fresh Strawberries',
                description='Sweet and juicy strawberries, freshly picked from local farms.',
                price=4.99,
                stock=100,
                category_id=1,
                image_url='/static/img/products/strawberries.jpg'
            ),
            Product(
                name='Fresh Blueberries',
                description='Plump and sweet blueberries, rich in antioxidants.',
                price=6.99,
                stock=80,
                category_id=1,
                image_url='/static/img/products/blueberries.jpg'
            ),
            Product(
                name='Frozen Raspberry Mix',
                description='A mix of premium raspberries, flash-frozen to preserve flavor.',
                price=5.99,
                stock=150,
                category_id=2,
                image_url='/static/img/products/frozen-raspberries.jpg'
            ),
            Product(
                name='Berry Jam Collection',
                description='Set of three artisanal berry jams: strawberry, raspberry, and blackberry.',
                price=12.99,
                stock=50,
                category_id=3,
                image_url='/static/img/products/berry-jam.jpg'
            )
        ]
        
        for product in products:
            db.session.add(product)
        
        # Create admin user
        admin = User(
            email='admin@berryboy.com',
            name='Admin User',
            is_admin=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
        
        db.session.commit()
        print("Sample data has been added to the database!")

if __name__ == '__main__':
    seed_data()
