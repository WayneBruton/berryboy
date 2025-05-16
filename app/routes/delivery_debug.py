from flask import Blueprint, jsonify, session, current_app
from app.models.user import User
from bson.objectid import ObjectId
import traceback
import json

# Create a Blueprint for debugging delivery info
delivery_debug = Blueprint('delivery_debug', __name__)

@delivery_debug.route('/api/delivery-debug', methods=['GET'])
def debug_delivery_info():
    """Debug endpoint to diagnose delivery info retrieval issues"""
    debug_info = {
        'step': 'start',
        'authenticated': session.get('authenticated'),
        'user_id': str(session.get('user_id')),
        'success': False
    }
    
    try:
        # Check authentication
        if not session.get('authenticated'):
            debug_info['step'] = 'auth_check'
            debug_info['error'] = 'Not authenticated'
            return jsonify(debug_info)
        
        # Get user ID
        user_id = session.get('user_id')
        if not user_id:
            debug_info['step'] = 'user_id_check'
            debug_info['error'] = 'No user ID in session'
            return jsonify(debug_info)
        
        # Get MongoDB connection
        debug_info['step'] = 'db_connection'
        db = User.get_mongodb_connection()
        debug_info['db_connected'] = db is not None
        
        if db is None:
            debug_info['error'] = 'Failed to get MongoDB connection'
            return jsonify(debug_info)
        
        # Convert user_id if needed
        debug_info['step'] = 'objectid_conversion'
        debug_info['user_id_type'] = type(user_id).__name__
        debug_info['user_id_is_valid'] = ObjectId.is_valid(user_id)
        
        try:
            if ObjectId.is_valid(user_id):
                user_id = ObjectId(user_id)
                debug_info['user_id_converted'] = str(user_id)
            else:
                debug_info['user_id_converted'] = str(user_id)
                
            # Find user
            debug_info['step'] = 'find_user'
            user = db.users.find_one({'_id': user_id})
            debug_info['user_found'] = user is not None
            
            if not user:
                debug_info['error'] = 'User not found'
                return jsonify(debug_info)
            
            # Get delivery info
            debug_info['step'] = 'get_delivery_info'
            delivery_info = user.get('delivery_info', {})
            debug_info['has_delivery_info'] = bool(delivery_info)
            debug_info['delivery_info'] = delivery_info
            debug_info['success'] = True
            
            return jsonify(debug_info)
            
        except Exception as mongo_error:
            debug_info['step'] = 'mongodb_operation'
            debug_info['error'] = str(mongo_error)
            debug_info['traceback'] = traceback.format_exc()
            return jsonify(debug_info)
            
    except Exception as e:
        debug_info['step'] = 'unexpected_error'
        debug_info['error'] = str(e)
        debug_info['traceback'] = traceback.format_exc()
        return jsonify(debug_info)
