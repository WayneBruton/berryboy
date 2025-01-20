from flask import Blueprint, render_template, jsonify, request, flash, redirect, url_for, current_app
from flask_login import login_required, current_user
from app.models.product import Product, Order, OrderItem
from app import db
from sqlalchemy import text
import stripe
import os
import traceback

shop = Blueprint('shop', __name__)

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@shop.route('/products')
def products():
    category_id = request.args.get('category', type=int)
    try:
        # Log database configuration
        current_app.logger.info(f"Database URI: {current_app.config['SQLALCHEMY_DATABASE_URI']}")
        
        # Try to connect to database
        try:
            db.session.execute(text('SELECT 1'))
            current_app.logger.info("Database connection successful")
        except Exception as db_err:
            current_app.logger.error(f"Database connection error: {str(db_err)}")
            return render_template('shop/products.html', products=[], error="Database connection error")
        
        # Query products
        if category_id:
            products = Product.query.filter_by(category_id=category_id, is_active=True).all()
        else:
            products = Product.query.filter_by(is_active=True).all()
        
        current_app.logger.info(f"Found {len(products)} products")
        for product in products:
            current_app.logger.info(f"Product: {product.name}, Category: {product.category.name}")
        
        return render_template('shop/products.html', products=products)
    except Exception as e:
        current_app.logger.error(f"Error in products route: {str(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return render_template('shop/products.html', products=[], error="An error occurred")

@shop.route('/product/<int:product_id>')
def product_detail(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        return render_template('shop/product_detail.html', product=product)
    except Exception as e:
        current_app.logger.error(f"Error in product detail route: {str(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return render_template('shop/product_detail.html', product=None, error="An error occurred")

@shop.route('/cart')
def cart():
    try:
        return render_template('shop/cart.html')
    except Exception as e:
        current_app.logger.error(f"Error in cart route: {str(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return render_template('shop/cart.html', error="An error occurred")

@shop.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    try:
        product_id = request.json.get('product_id')
        quantity = request.json.get('quantity', 1)
        
        product = Product.query.get_or_404(product_id)
        if product.stock < quantity:
            return jsonify({'error': 'Not enough stock available'}), 400
        
        return jsonify({
            'message': 'Product added to cart',
            'product': product.to_dict()
        })
    except Exception as e:
        current_app.logger.error(f"Error in add to cart route: {str(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'An error occurred'}), 500

@shop.route('/checkout', methods=['GET', 'POST'])
@login_required
def checkout():
    try:
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
                current_app.logger.error(f"Error creating Stripe checkout session: {str(e)}")
                current_app.logger.error(f"Traceback: {traceback.format_exc()}")
                return jsonify({'error': str(e)}), 400
        
        return render_template('shop/checkout.html')
    except Exception as e:
        current_app.logger.error(f"Error in checkout route: {str(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return render_template('shop/checkout.html', error="An error occurred")

@shop.route('/order/success')
@login_required
def order_success():
    try:
        flash('Your order has been placed successfully!', 'success')
        return redirect(url_for('shop.orders'))
    except Exception as e:
        current_app.logger.error(f"Error in order success route: {str(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return redirect(url_for('shop.orders'), error="An error occurred")

@shop.route('/orders')
@login_required
def orders():
    try:
        orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
        return render_template('shop/orders.html', orders=orders)
    except Exception as e:
        current_app.logger.error(f"Error in orders route: {str(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return render_template('shop/orders.html', orders=[], error="An error occurred")
