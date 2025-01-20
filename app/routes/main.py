from flask import Blueprint, render_template, request
from app.models.product import Product, Category

main = Blueprint('main', __name__)

@main.route('/')
def index():
    featured_products = Product.query.filter_by(is_active=True).limit(4).all()
    categories = Category.query.all()
    return render_template('main/index.html', 
                         featured_products=featured_products,
                         categories=categories)

@main.route('/about')
def about():
    return render_template('main/about.html')

@main.route('/contact')
def contact():
    return render_template('main/contact.html')
