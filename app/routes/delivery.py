from flask import Blueprint, request, jsonify, session, redirect, url_for, flash, current_app, render_template
from app.models.user import User
from pymongo import MongoClient
import os
import traceback
import json
from bson.objectid import ObjectId
import datetime

# Create a Blueprint for delivery features
delivery = Blueprint('delivery', __name__)

@delivery.route('/delivery/save', methods=['POST'])
def save_delivery_info():
    """Save delivery information directly to MongoDB"""
    try:
        # Check authentication - redirect to login if not authenticated
        if not session.get('authenticated'):
            flash('Please log in to save delivery information', 'warning')
            return redirect(url_for('auth.login'))
        
        # Get user ID from session
        user_id = session.get('user_id')
        if not user_id:
            flash('User ID not found in session', 'danger')
            return redirect(url_for('main.index'))
        
        # Get delivery info from form
        name = request.form.get('name', '')
        phone = request.form.get('phone', '')
        address = request.form.get('address', '')
        suburb = request.form.get('suburb', '')
        city = request.form.get('city', '')
        postal_code = request.form.get('postal_code', '')
        instructions = request.form.get('instructions', '')
        
       
        
        # Validate required fields
        if not all([name, phone, address, suburb, city, postal_code]):
            flash('All required fields must be filled in', 'danger')
            return redirect(url_for('shop.cart'))
        
        # Prepare delivery info
        delivery_info = {
            'name': name,
            'phone': phone,
            'address': address,
            'suburb': suburb,
            'city': city,
            'postalCode': postal_code,
            'instructions': instructions,
            'updated_at': datetime.datetime.now().isoformat()
        }
        
        # Log what we're trying to save
        current_app.logger.info(f"Saving delivery info for user {user_id}")
        
        # Get direct MongoDB connection
        try:
            # First try to get DB through User class
            mongodb = User.get_mongodb_connection()
            
            # If that failed, try direct connection
            if not mongodb:
                mongo_uri = current_app.config.get('MONGO_URI', os.environ.get('MONGO_DB_URI'))
                db_name = current_app.config.get('MONGO_DBNAME', 'theberryboy')
                
                if not mongo_uri:
                    flash('Database connection error', 'danger')
                    return redirect(url_for('shop.cart'))
                
                client = MongoClient(mongo_uri, tlsAllowInvalidCertificates=True)
                mongodb = client[db_name]
            
            # Convert user_id to ObjectId if needed
            object_id = None
            if ObjectId.is_valid(user_id):
                object_id = ObjectId(user_id)
            
            # Try both user_id formats
            user = mongodb.users.find_one({'_id': object_id}) if object_id else None
            if not user and object_id:
                user = mongodb.users.find_one({'_id': user_id})
            
            if not user:
                flash('User not found in database', 'danger')
                return redirect(url_for('shop.cart'))
            
                # Direct console output for debugging
            print("\n\n================ DELIVERY INFO DEBUG =================")
            print(f"USER ID: {user['_id']}")
            print(f"DELIVERY INFO: {delivery_info}")
            print("====================================================\n\n")
            
            # Update user document
            result = mongodb.users.update_one(
                {'_id': user['_id']},
                {'$set': {'delivery_info': delivery_info}}
            )
            
            if result.modified_count > 0 or result.matched_count > 0:
                flash('Delivery information saved successfully', 'success')
            else:
                flash('Failed to save delivery information', 'danger')
            
            return redirect(url_for('shop.cart'))
            
        except Exception as db_error:
            current_app.logger.error(f"MongoDB error: {str(db_error)}")
            current_app.logger.error(traceback.format_exc())
            flash('Database error', 'danger')
            return redirect(url_for('shop.cart'))
    
    except Exception as e:
        current_app.logger.error(f"Error saving delivery info: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        flash('An error occurred saving delivery information', 'danger')
        return redirect(url_for('shop.cart'))
