from flask import Blueprint, request, jsonify, session, current_app
from app.models.user import User  # Import User model for MongoDB connection
from bson.objectid import ObjectId
import traceback
import datetime
import json

# Create a Blueprint for direct delivery info saving
direct_delivery = Blueprint('direct_delivery', __name__)

def get_delivery_info_helper():
    """Retrieve delivery info from MongoDB using the working User model connection"""
    try:
        # Require authentication
        if not session.get('authenticated'):
            current_app.logger.error("User not authenticated for delivery info retrieval")
            return jsonify({'error': 'Authentication required', 'success': False}), 401
        
        # Get user ID
        user_id = session.get('user_id')
        if not user_id:
            current_app.logger.error("No user ID in session for delivery info retrieval")
            return jsonify({'error': 'User ID not found', 'success': False}), 401
            
        # Get MongoDB connection directly from User model (proven to work)
        db = User.get_mongodb_connection()
        if not db:
            current_app.logger.error("Failed to get MongoDB connection for delivery info retrieval")
            return jsonify({'error': 'Database connection error', 'success': False}), 500
        
        # Convert user_id to ObjectId if it's a string
        if ObjectId.is_valid(user_id):
            user_id = ObjectId(user_id)
            current_app.logger.info(f"Converted user ID to ObjectId: {user_id}")
        
        # Find user in MongoDB
        try:
            user = db.users.find_one({'_id': user_id})
            
            if not user:
                current_app.logger.error(f"User not found with ID: {user_id}")
                return jsonify({'error': 'User not found', 'success': False}), 404
            
            # Return delivery info if it exists
            delivery_info = user.get('delivery_info', {})
            current_app.logger.info(f"Found delivery info for user {user_id}: {json.dumps(delivery_info) if delivery_info else 'None'}")
            
            return jsonify({
                'success': True, 
                'delivery_info': delivery_info
            })
            
        except Exception as mongo_error:
            current_app.logger.error(f"MongoDB operation error during delivery info retrieval: {str(mongo_error)}")
            current_app.logger.error(traceback.format_exc())
            return jsonify({'error': 'Database error', 'success': False}), 500
            
    except Exception as e:
        current_app.logger.error(f"Unexpected error during delivery info retrieval: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': 'Server error', 'success': False}), 500

@direct_delivery.route('/api/direct-delivery-save', methods=['POST', 'GET'])
def save_delivery_direct():
    """Direct endpoint to save or retrieve delivery info from MongoDB using the working User model connection"""
    try:
        # Detailed logging
        if request.method == 'GET':
            current_app.logger.info("=== DIRECT DELIVERY INFO RETRIEVE ATTEMPT ===")
        else:
            current_app.logger.info("=== DIRECT DELIVERY INFO SAVE ATTEMPT ===")
            
        current_app.logger.info(f"Session: {dict(session)}")
        current_app.logger.info(f"Is authenticated: {session.get('authenticated')}")
        current_app.logger.info(f"User ID: {session.get('user_id')}")
        
        # Handle GET request to retrieve delivery info
        if request.method == 'GET':
            return get_delivery_info_helper()
            
        # The rest of this function handles POST requests to save delivery info
        
        # Require authentication
        if not session.get('authenticated'):
            current_app.logger.error("User not authenticated")
            return jsonify({'error': 'Authentication required', 'success': False}), 401
        
        # Get user ID
        user_id = session.get('user_id')
        if not user_id:
            current_app.logger.error("No user ID in session")
            return jsonify({'error': 'User ID not found', 'success': False}), 401
        
        # Get delivery info from request
        delivery_info = request.json
        if not delivery_info:
            current_app.logger.error("No delivery info provided")
            return jsonify({'error': 'No delivery information provided', 'success': False}), 400
        
        # Validate required fields
        required_fields = ['name', 'phone', 'address', 'suburb', 'city', 'postalCode']
        for field in required_fields:
            if not delivery_info.get(field):
                current_app.logger.error(f"Missing required field: {field}")
                return jsonify({
                    'error': f'Missing required field: {field}', 
                    'success': False
                }), 400
        
        # Add timestamp
        delivery_info['updated_at'] = datetime.datetime.now().isoformat()
        
        # Log the info being saved
        current_app.logger.info(f"Delivery info: {json.dumps(delivery_info)}")
        
        # Get MongoDB connection directly from User model (proven to work)
        db = User.get_mongodb_connection()
        if not db:
            current_app.logger.error("Failed to get MongoDB connection")
            return jsonify({'error': 'Database connection error', 'success': False}), 500
        
        # Convert user_id to ObjectId if it's a string
        if ObjectId.is_valid(user_id):
            user_id = ObjectId(user_id)
            current_app.logger.info(f"Converted user ID to ObjectId: {user_id}")
        
        # Update user document with delivery info
        try:
            result = db.users.update_one(
                {'_id': user_id},
                {'$set': {'delivery_info': delivery_info}}
            )
            
            current_app.logger.info(f"MongoDB result: matched={result.matched_count}, modified={result.modified_count}")
            
            if result.matched_count == 0:
                current_app.logger.error(f"No user found with ID: {user_id}")
                return jsonify({'error': 'User not found', 'success': False}), 404
            
            return jsonify({
                'success': True, 
                'message': 'Delivery information saved successfully to MongoDB'
            })
            
        except Exception as mongo_error:
            current_app.logger.error(f"MongoDB operation error: {str(mongo_error)}")
            current_app.logger.error(traceback.format_exc())
            return jsonify({'error': 'Database error', 'success': False}), 500
    
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': 'Server error', 'success': False}), 500
