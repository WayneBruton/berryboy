from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_admin import Admin
from flask_pymongo import PyMongo
from pymongo import MongoClient
from flask_jwt_extended import JWTManager

# Custom PyMongo class to handle SSL certificate verification
class SecurePyMongo(PyMongo):
    def init_app(self, app):
        uri = app.config.get('MONGO_URI')
        if uri:
            app.config['MONGO_URI'] = uri
        super().init_app(app)
        
        # Update the pymongo_client_factory to include SSL certificate settings
        self.original_factory = self.cx
        def secure_factory(*args, **kwargs):
            # Force SSL certificate verification to be disabled for Atlas connections
            kwargs['tlsAllowInvalidCertificates'] = True
            return MongoClient(*args, **kwargs)
        self.cx = secure_factory

db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()
migrate = Migrate()
admin = Admin()
mongo = SecurePyMongo()
jwt = JWTManager()
