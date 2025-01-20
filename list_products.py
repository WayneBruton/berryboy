from app import create_app, db
from app.models import Product

def list_products():
    app = create_app()
    with app.app_context():
        products = Product.query.all()
        for p in products:
            print(f'{p.name}: {p.image_url}')

if __name__ == '__main__':
    list_products()
