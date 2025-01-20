from flask import Blueprint, render_template, jsonify, request, flash, redirect, url_for
from flask_login import login_required, current_user
from app.models.product import Product, Order, OrderItem
from app import db
import stripe
import os

shop = Blueprint('shop', __name__)

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@shop.route('/products')
def products():
    category_id = request.args.get('category', type=int)
    if category_id:
        products = Product.query.filter_by(category_id=category_id, is_active=True).all()
    else:
        products = Product.query.filter_by(is_active=True).all()
    return render_template('shop/products.html', products=products)

@shop.route('/product/<int:product_id>')
def product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    return render_template('shop/product_detail.html', product=product)

@shop.route('/cart')
def cart():
    return render_template('shop/cart.html')

@shop.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    product_id = request.json.get('product_id')
    quantity = request.json.get('quantity', 1)
    
    product = Product.query.get_or_404(product_id)
    if product.stock < quantity:
        return jsonify({'error': 'Not enough stock available'}), 400
    
    return jsonify({
        'message': 'Product added to cart',
        'product': product.to_dict()
    })

@shop.route('/checkout', methods=['GET', 'POST'])
@login_required
def checkout():
    if request.method == 'POST':
        # Create Stripe checkout session
        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[],  # Add items from cart
                mode='payment',
                success_url=url_for('shop.order_success', _external=True),
                cancel_url=url_for('shop.cart', _external=True),
            )
            return jsonify({'sessionId': checkout_session.id})
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    return render_template('shop/checkout.html')

@shop.route('/order/success')
@login_required
def order_success():
    flash('Your order has been placed successfully!', 'success')
    return redirect(url_for('shop.orders'))

@shop.route('/orders')
@login_required
def orders():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
    return render_template('shop/orders.html', orders=orders)
