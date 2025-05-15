from flask import Blueprint, request, jsonify, session, current_app
from app import mongo
import traceback

# Create a new Blueprint for direct cart saving
direct_cart = Blueprint('direct_cart', __name__)

@direct_cart.route('/api/direct-cart-save', methods=['POST'])
def save_cart_direct():
    """Direct endpoint to save cart to MongoDB with detailed logging"""
    try:
        # Detailed logging
        current_app.logger.info("=== DIRECT CART SAVE ATTEMPT ===")
        current_app.logger.info(f"Session: {dict(session)}")
        current_app.logger.info(f"Is authenticated: {session.get('authenticated')}")
        current_app.logger.info(f"User ID: {session.get('user_id')}")
        
        # Get cart data from request
        cart_data = request.json
        if not cart_data or 'items' not in cart_data:
            current_app.logger.error("Invalid cart data format")
            return jsonify({'error': 'Invalid cart data', 'success': False}), 400
        
        cart_items = cart_data['items']
        current_app.logger.info(f"Cart items count: {len(cart_items)}")
        
        # For testing, allow saving even without authentication
        user_id = session.get('user_id', 'guest')
        
        # Save to MongoDB with explicit collection name
        result = mongo.db.user_carts.update_one(
            {'user_id': user_id},
            {'$set': {
                'user_id': user_id,
                'items': cart_items,
                'authenticated': session.get('authenticated', False)
            }},
            upsert=True
        )
        
        current_app.logger.info(f"MongoDB result: modified={result.modified_count}, upserted_id={result.upserted_id}")
        
        return jsonify({
            'success': True, 
            'message': 'Cart saved successfully',
            'user_id': user_id,
            'item_count': len(cart_items)
        })
        
    except Exception as e:
        current_app.logger.error(f"Error in direct cart save: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'error': f'An error occurred: {str(e)}',
            'success': False
        }), 500
