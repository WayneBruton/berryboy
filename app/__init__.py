from flask import Flask
from dotenv import load_dotenv
import os
from app.extensions import db, login_manager, mail, migrate, admin

def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    
    # Load environment variables
    load_dotenv()
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///berryboy.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions with app
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    mail.init_app(app)
    migrate.init_app(app, db)
    admin.init_app(app)
    
    with app.app_context():
        # Import models
        from app.models import User, Product, Category, Order, OrderItem
    
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
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app
