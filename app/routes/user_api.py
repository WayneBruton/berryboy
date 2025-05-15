from flask import Blueprint, request, jsonify, session, current_app
from app import mongo
from bson.objectid import ObjectId
from app.models.user import User  # Import User model for its MongoDB connection method
from pymongo import MongoClient
import traceback
import json
import datetime
import os

user_api = Blueprint('user_api', __name__)

@user_api.route('/api/user/delivery-info', methods=['GET'])
def get_delivery_info():
    """Get the user's delivery information from MongoDB"""
    try:
        # Check if user is authenticated
        if not session.get('authenticated'):
            current_app.logger.warning("User not authenticated for delivery info request")
            return jsonify({'error': 'User not authenticated'}), 401
        
        # Get user ID from session
        user_id = session.get('user_id')
        if not user_id:
            current_app.logger.warning("User ID not found in session")
            return jsonify({'error': 'User ID not found in session'}), 401
        
        current_app.logger.info(f"Getting delivery info for user: {user_id}")
        
        # Use the proven MongoDB connection from User model
        try:
            # Get MongoDB connection that's known to work
            mongodb = User.get_mongodb_connection()
            if not mongodb:
                current_app.logger.error("Failed to get MongoDB connection")
                return jsonify({'error': 'Database connection error'}), 500
            
            # Convert user_id to ObjectId if it's a string
            if not isinstance(user_id, ObjectId) and ObjectId.is_valid(user_id):
                user_id = ObjectId(user_id)
                current_app.logger.info(f"Converted user_id to ObjectId: {user_id}")
            
            # Find user in MongoDB
            user = mongodb.users.find_one({'_id': user_id})
            if not user:
                current_app.logger.warning(f"User not found with ID: {user_id}")
                return jsonify({'error': 'User not found'}), 404
            
            # Return delivery info if it exists
            delivery_info = user.get('delivery_info', {})
            current_app.logger.info(f"Found delivery info: {delivery_info}")
            return jsonify({'success': True, 'delivery_info': delivery_info})
            
        except Exception as db_error:
            current_app.logger.error(f"MongoDB operation error: {str(db_error)}")
            current_app.logger.error(traceback.format_exc())
            return jsonify({'error': 'Database error getting delivery information'}), 500
    
    except Exception as e:
        current_app.logger.error(f"Error getting delivery info: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': 'An error occurred getting delivery information'}), 500

@user_api.route('/api/user/delivery-info', methods=['POST'])
def update_delivery_info():
    """Update the user's delivery information in MongoDB"""
    try:
        # Check if user is authenticated
        if not session.get('authenticated'):
            return jsonify({'error': 'User not authenticated'}), 401
        
        # Get user ID from session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID not found in session'}), 401
        
        # Get delivery info from request
        delivery_info = request.json
        if not delivery_info:
            return jsonify({'error': 'No delivery information provided'}), 400
        
        # Clean and validate delivery info
        clean_delivery_info = {
            'name': delivery_info.get('name', ''),
            'phone': delivery_info.get('phone', ''),
            'address': delivery_info.get('address', ''),
            'suburb': delivery_info.get('suburb', ''),
            'city': delivery_info.get('city', ''),
            'postalCode': delivery_info.get('postalCode', ''),
            'instructions': delivery_info.get('instructions', ''),
            'updated_at': datetime.datetime.now().isoformat()
        }
        
        current_app.logger.info(f"Updating delivery info for user ID: {user_id}")
        
        # Use the proven MongoDB connection from User model
        # This is the same connection method used in login/registration which works
        try:
            # Get MongoDB connection that's known to work
            mongodb = User.get_mongodb_connection()
            if not mongodb:
                current_app.logger.error("Failed to get MongoDB connection")
                return jsonify({'error': 'Database connection error'}), 500
            
            # Convert user_id to ObjectId if it's a string
            if not isinstance(user_id, ObjectId) and ObjectId.is_valid(user_id):
                user_id = ObjectId(user_id)
                current_app.logger.info(f"Converted user_id to ObjectId: {user_id}")
            
            # Update user document with delivery info using working MongoDB connection
            result = mongodb.users.update_one(
                {'_id': user_id},
                {'$set': {'delivery_info': clean_delivery_info}}
            )
            
            current_app.logger.info(f"MongoDB update result: {result.matched_count} matched, {result.modified_count} modified")
            
            if result.matched_count > 0:
                return jsonify({
                    'success': True,
                    'message': 'Delivery information saved successfully'
                })
            else:
                # If the user wasn't found by ID, log the issue
                current_app.logger.error(f"User not found with ID: {user_id}")
                return jsonify({
                    'error': 'User not found in database'
                }), 404
                
        except Exception as db_error:
            current_app.logger.error(f"MongoDB operation error: {str(db_error)}")
            current_app.logger.error(traceback.format_exc())
            return jsonify({'error': 'Database error'}), 500
    
    except Exception as e:
        current_app.logger.error(f"Error updating delivery info: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': 'An error occurred updating delivery information'}), 500
