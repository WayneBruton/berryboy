from flask import Flask, session
from dotenv import load_dotenv
import os
from datetime import timedelta
from app.extensions import db, login_manager, mail, migrate, admin, mongo, jwt
from flask_wtf.csrf import CSRFProtect

csrf = CSRFProtect()

def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    
    # Load environment variables
    load_dotenv()
    
    # Get base directory and instance path
    basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    instance_path = os.path.join(basedir, 'instance')
    os.makedirs(instance_path, exist_ok=True)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev')
    
    # Database Configuration
    app.config['MONGO_URI'] = os.getenv('MONGO_DB_URI')
    app.config['MONGO_DBNAME'] = os.getenv('DATABASE', 'theberryboy')
    app.config['MONGO_TLS_ALLOW_INVALID_CERTIFICATES'] = True  # Handle SSL certificate issues
    
    # Keep using SQLAlchemy with SQLite as before
    database_url = os.getenv('DATABASE_URL')
    if database_url and database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    else:
        # Fallback to SQLite - keeping existing functionality
        database_url = f'sqlite:///{os.path.join(instance_path, "berryboy.db")}'
        
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Email configuration
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', True)
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@berryboy.com')
    
    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config['SECRET_KEY'])
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=6)  # 6-hour token lifespan
    app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']
    app.config['JWT_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
    app.config['JWT_COOKIE_CSRF_PROTECT'] = True
    
    # Initialize extensions with app
    # Initialize extensions with app
    db.init_app(app)  # Initialize SQLAlchemy first
    login_manager.init_app(app)  # Make sure login_manager is properly initialized
    login_manager.login_view = 'auth.login'  # Set the login view
    login_manager.refresh_view = 'auth.login'  # Set the refresh view to redirect users
    login_manager.needs_refresh_message = 'Please log in again to confirm your identity'
    login_manager.session_protection = 'strong'  # Provide better session protection
    
    admin.init_app(app)
    # Temporarily disable CSRF protection while we focus on MongoDB integration
    # csrf.init_app(app)
    app.config['WTF_CSRF_ENABLED'] = False  # Temporarily disable CSRF
    mongo.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    mail.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    with app.app_context():
        # Import models
        from app.models import User, Product, Category, Order, OrderItem
        
        # Create tables
        db.create_all()
    
    # Register blueprints
    from app.routes.main import main
    from app.routes.auth import auth
    from app.routes.shop import shop
    from app.routes.admin import admin_blueprint
    from app.routes.blog import blog
    from app.routes.pages import pages
    
    app.register_blueprint(main)
    app.register_blueprint(auth)
    app.register_blueprint(shop)
    app.register_blueprint(admin_blueprint)
    app.register_blueprint(blog)
    app.register_blueprint(pages)
    
    # Add template context processor for current year
    @app.context_processor
    def inject_now():
        from datetime import datetime
        return {'now': datetime.utcnow()}
    
    return app
