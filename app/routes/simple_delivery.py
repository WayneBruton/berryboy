from flask import Blueprint, request, jsonify, session, current_app
from bson.objectid import ObjectId
from pymongo import MongoClient
import os
import traceback
import datetime

# Create a Blueprint for direct delivery API
simple_delivery = Blueprint('simple_delivery', __name__)

@simple_delivery.route('/api/save-delivery', methods=['POST'])
def save_delivery():
    """Save delivery information directly to MongoDB user document"""
    try:
        # Check if user is authenticated
        if not session.get('authenticated'):
            return jsonify({'success': False, 'error': 'User not authenticated'}), 401
            
        # Get user ID
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID not found'}), 401
            
        # Get delivery info from request
        data = request.json
        
        # Create delivery info object
        delivery_info = {
            'name': data.get('name', ''),
            'phone': data.get('phone', ''),
            'address': data.get('address', ''),
            'suburb': data.get('suburb', ''),
            'city': data.get('city', ''),
            'postalCode': data.get('postalCode', ''),
            'instructions': data.get('instructions', ''),
            'updated_at': datetime.datetime.now().isoformat()
        }
        
        # Direct MongoDB connection
        mongo_uri = current_app.config.get('MONGO_URI') or os.environ.get('MONGO_DB_URI')
        client = MongoClient(mongo_uri, tlsAllowInvalidCertificates=True)
        db = client['theberryboy']
        
        # Convert user_id to ObjectId if needed
        if ObjectId.is_valid(user_id):
            user_id = ObjectId(user_id)
        
        # Update user document
        result = db.users.update_one(
            {'_id': user_id},
            {'$set': {'delivery_info': delivery_info}}
        )
        
        if result.matched_count > 0:
            return jsonify({'success': True, 'message': 'Delivery info saved successfully'})
        else:
            return jsonify({'success': False, 'error': 'User not found in database'}), 404
            
    except Exception as e:
        print(f"Error saving delivery info: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': 'Server error'}), 500
