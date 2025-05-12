from app.extensions import db, login_manager, mongo
from flask_login import UserMixin
from datetime import datetime
import bcrypt
from bson.objectid import ObjectId
from flask import current_app, session
from pymongo import MongoClient

@login_manager.user_loader
def load_user(user_id):
    current_app.logger.info(f"Loading user: {user_id}")
    
    # Try to load from MongoDB first
    try:
        # First try to interpret user_id as ObjectId (MongoDB)
        if ObjectId.is_valid(user_id):
            user_data = mongo.db.users.find_one({'_id': ObjectId(user_id)})
            if user_data:
                current_app.logger.info(f"Found MongoDB user: {user_data['email']}")
                user = MongoDBUser(user_data)
                return user
    except Exception as e:
        current_app.logger.error(f"Error loading MongoDB user: {str(e)}")
    
    # Fallback to SQLAlchemy if MongoDB lookup fails
    try:
        if user_id.isdigit():
            user = User.query.get(int(user_id))
            if user:
                current_app.logger.info(f"Found SQLAlchemy user: {user.email}")
                return user
    except Exception as e:
        current_app.logger.error(f"Error loading SQLAlchemy user: {str(e)}")
    
    return None

# Dedicated class for MongoDB users
class MongoDBUser(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data['_id'])
        self.email = user_data['email']
        self.name = user_data['name']
        self.password_hash = user_data['password_hash']
        self.is_admin = user_data.get('is_admin', False)
        
    def get_id(self):
        return str(self.id)
    
    def __repr__(self):
        return f'<MongoDBUser {self.email}>'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.LargeBinary, nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    orders = db.relationship('Order', backref='user', lazy=True)
    
    def get_id(self):
        return str(self.id)
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        self._id = None  # MongoDB ObjectId
    
    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
        
    @staticmethod
    def get_mongodb_connection():
        """Helper method to get MongoDB connection to avoid code duplication"""
        # Get MongoDB connection details from app config
        mongo_uri = current_app.config.get('MONGO_URI')
        db_name = current_app.config.get('MONGO_DBNAME')
        
        # Connect to MongoDB with SSL certificate verification disabled
        client = MongoClient(mongo_uri, tlsAllowInvalidCertificates=True)
        return client[db_name]
        
    @classmethod
    def create_mongodb_user(cls, email, name, password, is_admin=False):
        """Create a new user in MongoDB"""
        # Encrypt password with bcrypt
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create user document
        user_data = {
            'email': email,
            'name': name,
            'password_hash': password_hash,
            'is_admin': is_admin,
            'created_at': datetime.utcnow()
        }
        
        # Get MongoDB connection and insert user
        db = cls.get_mongodb_connection()
        result = db.users.insert_one(user_data)
        
        # Create a User object for Flask-Login
        user = cls()
        user.id = str(result.inserted_id)
        user.email = email
        user.name = name
        user.is_admin = is_admin
        
        return user
        
    @classmethod
    def find_by_email(cls, email):
        """Find a user by email in MongoDB"""
        # Get MongoDB connection and query user
        db = cls.get_mongodb_connection()
        user_data = db.users.find_one({'email': email})
        if user_data:
            user = cls()
            user.id = str(user_data['_id'])
            user.email = user_data['email']
            user.name = user_data['name']
            user.is_admin = user_data.get('is_admin', False)
            user.password_hash = user_data['password_hash']
            return user
        return None
        
    @classmethod
    def find_by_id(cls, user_id):
        """Find a user by ID in MongoDB"""
        try:
            # Get MongoDB connection and query user
            db = cls.get_mongodb_connection()
            user_data = db.users.find_one({'_id': ObjectId(user_id)})
            if user_data:
                user = cls()
                user.id = str(user_data['_id'])
                user.email = user_data['email']
                user.name = user_data['name']
                user.is_admin = user_data.get('is_admin', False)
                user.password_hash = user_data['password_hash']
                return user
        except Exception as e:
            current_app.logger.error(f"Error finding user by ID: {str(e)}")
        return None
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash)
