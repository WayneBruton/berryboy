from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_admin import Admin
from flask_pymongo import PyMongo
from pymongo import MongoClient
from flask_jwt_extended import JWTManager
import logging

# Custom PyMongo class to handle SSL certificate verification
class SecurePyMongo(PyMongo):
    def init_app(self, app):
        uri = app.config.get('MONGO_URI')
        if uri:
            app.config['MONGO_URI'] = uri
            # Add logging for debugging connection issues
            app.logger.info(f"Attempting to connect to MongoDB with URI: {uri[:15]}...")
            
            # Explicitly set SSL parameters in config
            app.config['MONGO_TLS_ALLOW_INVALID_CERTIFICATES'] = True
            
        # Call parent init_app method
        super().init_app(app)
        
        # Test connection before returning
        try:
            if hasattr(self, 'db') and self.db is not None:
                self.db.command('ping')
                app.logger.info("MongoDB connection test successful")
            else:
                app.logger.error("MongoDB db attribute is not accessible")
        except Exception as e:
            app.logger.error(f"MongoDB connection test failed: {str(e)}")

db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()
migrate = Migrate()
admin = Admin()
mongo = SecurePyMongo()
jwt = JWTManager()
