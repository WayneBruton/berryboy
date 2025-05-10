from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app
from flask_login import login_user, logout_user, login_required, current_user
from app.models.user import User
from app import db, mongo
import bcrypt
from datetime import datetime
from app.forms.auth import LoginForm, RegisterForm

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data
        
        # Find user using our model method
        user = User.find_by_email(email)
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user.password_hash):
            login_user(user)
            current_app.logger.info(f"User logged in: {email}")
            return redirect(url_for('main.index'))
            
        flash('Please check your login details and try again.', 'danger')
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
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))
