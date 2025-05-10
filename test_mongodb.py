#!/usr/bin/env python
"""Test script to verify MongoDB connection and PyMongo installation"""
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import datetime

print("Testing MongoDB connection...")

# Load environment variables
load_dotenv()

# Get MongoDB URI from environment
mongo_uri = os.getenv('MONGO_DB_URI')
db_name = os.getenv('DATABASE', 'theberryboy')

if not mongo_uri:
    print("ERROR: MONGO_DB_URI environment variable not found")
    exit(1)

try:
    # Connect to MongoDB
    print(f"Attempting to connect to MongoDB with URI: {mongo_uri}")
    # Add SSL configuration to bypass certificate verification
    client = MongoClient(mongo_uri, tlsAllowInvalidCertificates=True)
    
    # Access database
    db = client[db_name]
    print(f"Successfully connected to database: {db_name}")
    
    # Insert a test document
    test_data = {
        "name": "Test User",
        "email": "test@example.com",
        "created_at": datetime.datetime.utcnow(),
        "test": True
    }
    
    # Create or access test collection
    test_collection = db.test_collection
    result = test_collection.insert_one(test_data)
    
    print(f"Successfully inserted test document with ID: {result.inserted_id}")
    
    # Query to verify insertion
    found = test_collection.find_one({"_id": result.inserted_id})
    if found:
        print(f"Retrieved test document: {found['name']} / {found['email']}")
    
    # Clean up test document
    test_collection.delete_one({"_id": result.inserted_id})
    print("Test document deleted - test completed successfully!")
    
except Exception as e:
    print(f"ERROR: {str(e)}")
    exit(1)
