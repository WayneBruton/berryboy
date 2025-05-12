from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app, jsonify, make_response, session
from flask_login import login_user, logout_user, login_required, current_user
from flask_jwt_extended import create_access_token, set_access_cookies, unset_jwt_cookies, get_jwt_identity, jwt_required
from app.models.user import User
from app import db, mongo
import bcrypt
from datetime import datetime, timedelta
from app.forms.auth import LoginForm, RegisterForm

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    # If user is already logged in, redirect to home page
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
        
    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data
        
        # Find user using our model method
        user = User.find_by_email(email)
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user.password_hash):
            # Create standard session login for Flask-Login
            # Force remember=True to ensure the user stays logged in
            login_user(user, remember=True)
            
            # Create JWT token with 6-hour expiration
            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={
                    'email': user.email,
                    'name': user.name,
                    'is_admin': user.is_admin
                }
            )
            
            # Log the successful login
            current_app.logger.info(f"User logged in: {email} with ID: {user.id}")
            
            # Store a flag in the session to indicate the user is authenticated
            session['authenticated'] = True
            session['user_id'] = str(user.id)
            session['user_email'] = user.email
            session['user_name'] = user.name
            
            # Redirect to home page with JWT in cookies
            resp = make_response(redirect(url_for('main.index')))
            set_access_cookies(resp, access_token)
            return resp
        else:
            flash('Invalid email or password. Please try again.', 'danger')
    
    return render_template('auth/login.html', form=form)

@auth.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        email = form.email.data
        name = form.name.data
        password = form.password.data
        
        # Check if user already exists (using our model method)
        existing_user = User.find_by_email(email)
        if existing_user:
            flash('Email address already exists', 'danger')
            return redirect(url_for('auth.register'))
        
        # Create user using our User model method
        User.create_mongodb_user(email, name, password)
        
        # Log to console for debugging
        current_app.logger.info(f"Created new user: {email} in MongoDB database: {current_app.config['MONGO_DBNAME']}")
        
        flash('Registration successful!', 'success')
        return redirect(url_for('auth.login'))
    return render_template('auth/register.html', form=form)

@auth.route('/logout')
def logout():
    # Handle Flask-Login logout
    logout_user()
    
    # Clear all session data we've added
    session.pop('authenticated', None)
    session.pop('user_id', None)
    session.pop('user_email', None)
    session.pop('user_name', None)
    session.pop('is_admin', None)
    
    # Create a response and clear JWT cookies
    response = make_response(redirect(url_for('main.index')))
    unset_jwt_cookies(response)
    
    # Add a flash message
    flash('You have been logged out.', 'info')
    
    return response

@auth.route('/api/token', methods=['POST'])
def get_token():
    """Endpoint to get a JWT token without using the web interface"""
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    email = request.json.get('email', None)
    password = request.json.get('password', None)

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    user = User.find_by_email(email)
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash):
        return jsonify({"error": "Invalid credentials"}), 401

    # Create JWT token with 6-hour expiration
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            'email': user.email,
            'name': user.name,
            'is_admin': user.is_admin
        }
    )

    return jsonify(access_token=access_token)

@auth.route('/auth-status')
def auth_status():
    """Debug endpoint to check authentication status"""
    return jsonify({
        'is_authenticated': current_user.is_authenticated,
        'user_id': current_user.id if current_user.is_authenticated else None,
        'user_email': current_user.email if current_user.is_authenticated else None,
        'user_name': current_user.name if current_user.is_authenticated else None
    })

@auth.route('/api/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """Protected endpoint that requires a valid JWT token"""
    # Get the identity from the JWT token
    current_user_id = get_jwt_identity()
    
    # Find the user in the database
    user = User.find_by_id(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Return user profile information
    return jsonify({
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "is_admin": user.is_admin
    })
