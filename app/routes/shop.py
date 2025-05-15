from flask import Blueprint, render_template, jsonify, request, flash, redirect, url_for, current_app, session
from flask_login import login_required, current_user
from app.models.product import Product, Order, OrderItem
from app import db
from sqlalchemy import text
import stripe
import os
import traceback

shop = Blueprint('shop', __name__)

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Payment status routes
@shop.route('/payment/successful')
def payment_successful():
    return render_template('shop/payment_successful.html')

@shop.route('/payment/cancelled')
def payment_cancelled():
    return render_template('shop/payment_cancelled.html')

@shop.route('/payment/failed')
def payment_failed():
    return render_template('shop/payment_failed.html')

@shop.route('/payment/notification', methods=['POST'])
def payment_notification():
    """Handle server-to-server notifications from PayFast"""
    try:
        # Log the payment notification
        notification_data = request.form.to_dict()
        current_app.logger.info(f"Payment notification received: {notification_data}")
        
        # Verify the payment notification (basic validation)
        payment_status = notification_data.get('payment_status')
        m_payment_id = notification_data.get('m_payment_id')
        amount_gross = notification_data.get('amount_gross')
        
        current_app.logger.info(f"Payment status: {payment_status}, ID: {m_payment_id}, Amount: {amount_gross}")
        
        # Here you would typically:
        # 1. Verify the notification is from PayFast
        # 2. Update your database with order status
        # 3. Process inventory or trigger other business logic
        
        # PayFast expects a 200 response with empty body
        return '', 200
        
    except Exception as e:
        current_app.logger.error(f"Error processing payment notification: {str(e)}")
        # Still return 200 to acknowledge receipt
        return '', 200

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
        # Check if user is authenticated via session
        if not session.get('authenticated'):
            flash('Please log in to view your cart', 'warning')
            return redirect(url_for('auth.login'))
            
        return render_template('shop/cart.html')
    except Exception as e:
        current_app.logger.error(f"Error in cart route: {str(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return render_template('error.html', error="An error occurred accessing your cart")

@shop.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """API endpoint to get product details"""
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
            
        return jsonify(product.to_dict())
    except Exception as e:
        current_app.logger.error(f"Error fetching product: {str(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'An error occurred fetching product details'}), 500

@shop.route('/api/cart/get', methods=['GET'])
def get_cart():
    """Get the current cart items with product details"""
    try:
        # Client-side cart management with server validation
        # Return cart data from session if available, or empty cart if not
        cart_items = session.get('cart_items', [])
        
        # If user is authenticated, we can also check for any saved cart in their profile
        if current_user.is_authenticated or session.get('authenticated'):
            # Add logic here if you want to restore a saved cart from database
            pass
            
        # Get product details for each item in cart
        cart_with_details = []
        for item in cart_items:
            product = Product.query.get(item.get('id'))
            if product and product.is_active:
                cart_with_details.append({
                    'id': product.id,
                    'name': product.name,
                    'price': float(product.price),
                    'quantity': item.get('quantity', 1),
                    'image': product.image_url,
                    'stock': product.stock
                })
        
        return jsonify({
            'items': cart_with_details,
            'count': len(cart_with_details)
        })
    except Exception as e:
        current_app.logger.error(f"Error getting cart data: {str(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'An error occurred fetching cart data', 'items': []}), 500

@shop.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    """Add a product to the cart - requires authentication"""
    try:
        # Check if user is authenticated
        if not current_user.is_authenticated and not session.get('authenticated'):
            current_app.logger.info("Unauthenticated user attempted to add item to cart")
            return jsonify({'error': 'Please log in to add items to cart'}), 401
            
        # Log the request data for debugging
        current_app.logger.info(f"Add to cart request: {request.json}")
        
        # Get product ID and quantity from request
        product_id = request.json.get('product_id')
        quantity = request.json.get('quantity', 1)
        is_update = request.json.get('is_update', False)
        
        if not product_id:
            current_app.logger.error("No product_id provided in request")
            return jsonify({'error': 'Product ID is required'}), 400
            
        # Get product from database
        product = Product.query.get(product_id)
        if not product:
            current_app.logger.error(f"Product with ID {product_id} not found")
            return jsonify({'error': 'Product not found'}), 404
            
        # Check stock
        if product.stock < quantity:
            current_app.logger.info(f"Not enough stock for product {product_id}: {product.stock} < {quantity}")
            return jsonify({'error': 'Not enough stock available'}), 400
        
        # Store in session for server-side tracking
        cart_items = session.get('cart_items', [])
        
        # Check if product already in cart
        found = False
        for item in cart_items:
            if item.get('id') == product_id:
                # If it's an update, replace the quantity. Otherwise, add to it.
                if is_update:
                    item['quantity'] = quantity
                else:
                    item['quantity'] = item.get('quantity', 0) + quantity
                found = True
                break
                
        # If not found, add it
        if not found:
            cart_items.append({
                'id': product_id,
                'quantity': quantity
            })
            
        # Update session
        session['cart_items'] = cart_items
        
        # Successfully validated and added product
        current_app.logger.info(f"Product {product_id} added to cart: {product.name}")
        return jsonify({
            'message': 'Product added to cart',
            'product': product.to_dict(),
            'cart_count': sum(item.get('quantity', 0) for item in cart_items)
        })
    except Exception as e:
        current_app.logger.error(f"Error in add to cart route: {str(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'An error occurred adding product to cart'}), 500
        
@shop.route('/api/cart/remove', methods=['POST'])
def remove_from_cart():
    """Remove a product from the cart"""
    try:
        # Get product ID from request
        product_id = request.json.get('product_id')
        
        if not product_id:
            current_app.logger.error("No product_id provided in request")
            return jsonify({'error': 'Product ID is required'}), 400
            
        # Get cart items from session
        cart_items = session.get('cart_items', [])
        
        # Remove the item with matching product_id
        updated_cart = [item for item in cart_items if item.get('id') != product_id]
        
        # Update session
        session['cart_items'] = updated_cart
        
        # Return updated cart count
        current_app.logger.info(f"Product {product_id} removed from cart")
        return jsonify({
            'message': 'Product removed from cart',
            'cart_count': sum(item.get('quantity', 0) for item in updated_cart)
        })
    except Exception as e:
        current_app.logger.error(f"Error removing from cart: {str(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'An error occurred removing product from cart'}), 500

@shop.route('/checkout', methods=['GET', 'POST'])
def checkout():
    # Check if user is authenticated via session
    if not session.get('authenticated'):
        flash('Please log in to proceed to checkout', 'warning')
        return redirect(url_for('auth.login'))
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
