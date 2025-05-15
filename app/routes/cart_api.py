from flask import Blueprint, request, jsonify, session, current_app
from bson.objectid import ObjectId
from app import mongo
import traceback

cart_api = Blueprint('cart_api', __name__)

@cart_api.route('/api/cart', methods=['GET'])
def get_cart():
    """Get the user's cart from MongoDB"""
    try:
        # Check if user is authenticated
        if not session.get('authenticated'):
            return jsonify({'error': 'User not authenticated', 'cart': []}), 401
        
        # Get user ID from session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID not found in session', 'cart': []}), 401
        
        # Lookup cart in MongoDB
        cart_data = mongo.db.carts.find_one({'user_id': user_id})
        
        if not cart_data:
            # If no cart exists yet, return empty cart
            return jsonify({'cart': []})
        
        # Return cart items
        return jsonify({'cart': cart_data.get('items', [])})
    
    except Exception as e:
        current_app.logger.error(f"Error getting cart: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': 'An error occurred getting cart data', 'cart': []}), 500

@cart_api.route('/api/cart', methods=['POST'])
def update_cart():
    """Update the user's cart in MongoDB"""
    try:
        # Check if user is authenticated
        if not session.get('authenticated'):
            return jsonify({'error': 'User not authenticated'}), 401
        
        # Get user ID from session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID not found in session'}), 401
        
        # Get cart data from request
        cart_data = request.json
        if not cart_data or 'items' not in cart_data:
            return jsonify({'error': 'Invalid cart data'}), 400
        
        # Get cart items
        cart_items = cart_data['items']
        
        # Update or create cart in MongoDB
        mongo.db.carts.update_one(
            {'user_id': user_id},
            {'$set': {'items': cart_items}},
            upsert=True
        )
        
        return jsonify({'success': True, 'message': 'Cart updated successfully'})
    
    except Exception as e:
        current_app.logger.error(f"Error updating cart: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': 'An error occurred updating cart data'}), 500

@cart_api.route('/api/cart/merge', methods=['POST'])
def merge_cart():
    """Merge local cart with server cart after login"""
    try:
        # Check if user is authenticated
        if not session.get('authenticated'):
            return jsonify({'error': 'User not authenticated'}), 401
        
        # Get user ID from session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID not found in session'}), 401
        
        # Get local cart data from request
        local_cart_data = request.json
        if not local_cart_data or 'items' not in local_cart_data:
            return jsonify({'error': 'Invalid cart data'}), 400
        
        local_cart_items = local_cart_data['items']
        
        # Get existing server cart
        server_cart = mongo.db.carts.find_one({'user_id': user_id})
        server_cart_items = server_cart.get('items', []) if server_cart else []
        
        # Create a dictionary of product IDs to merged items
        merged_items = {}
        
        # Add server items first
        for item in server_cart_items:
            product_id = item.get('product_id')
            if product_id:
                merged_items[product_id] = item
        
        # Merge with local items, preferring local quantities if they exist
        for item in local_cart_items:
            product_id = item.get('product_id')
            if product_id:
                if product_id in merged_items:
                    # Item exists in both carts, update quantity
                    existing_item = merged_items[product_id]
                    existing_qty = int(existing_item.get('quantity', 0))
                    local_qty = int(item.get('quantity', 0))
                    
                    # Keep the higher quantity
                    if local_qty > existing_qty:
                        merged_items[product_id] = item
                else:
                    # Item only in local cart, add it
                    merged_items[product_id] = item
        
        # Convert dictionary back to list
        final_items = list(merged_items.values())
        
        # Update cart in MongoDB
        mongo.db.carts.update_one(
            {'user_id': user_id},
            {'$set': {'items': final_items}},
            upsert=True
        )
        
        return jsonify({
            'success': True, 
            'message': 'Cart merged successfully',
            'cart': final_items
        })
    
    except Exception as e:
        current_app.logger.error(f"Error merging cart: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': 'An error occurred merging cart data'}), 500
