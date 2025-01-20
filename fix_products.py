from app import create_app, db
from app.models import Product

def fix_products():
    app = create_app()
    with app.app_context():
        # Fix image paths
        products = Product.query.all()
        for product in products:
            if product.name == 'Fresh Strawberries':
                product.image_url = 'img/products/strawberries.jpg'
            elif product.name == 'Fresh Blueberries':
                product.image_url = 'img/products/blueberries.jpg'
            elif product.name == 'Frozen Raspberry Mix':
                product.image_url = 'img/products/frozen-berries.jpg'
            elif product.name == 'Mixed Berry Collection':
                product.image_url = 'img/products/mixed-berries.jpg'
            elif product.name == 'Berry Jam Collection':
                product.image_url = 'img/products/berry-jam.jpg'
        db.session.commit()
        print("Product image paths updated successfully!")

if __name__ == '__main__':
    fix_products()
