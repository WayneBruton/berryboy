from app import create_app
from app.models import Product, Category

def check_db():
    app = create_app()
    with app.app_context():
        print("\nChecking Categories:")
        categories = Category.query.all()
        print(f"Found {len(categories)} categories:")
        for cat in categories:
            print(f"- {cat.name}")
            
        print("\nChecking Products:")
        products = Product.query.all()
        print(f"Found {len(products)} products:")
        for prod in products:
            print(f"- {prod.name} (Category: {prod.category.name})")

if __name__ == '__main__':
    check_db()
