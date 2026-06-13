
// © 2026 Vincent Ochieng. All rights reserved.
// Unauthorized copying or distribution prohibited.

"""
Configuration for AI-Powered Vehicle Ecosystem Backend
Supports SQLite, PostgreSQL, and MongoDB
"""

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'ai-vehicle-ecosystem-secret-key-2024')
    
    # Database Configuration
    DATABASE_TYPE = os.getenv('DATABASE_TYPE', 'sqlite')  # sqlite, postgresql, mongodb
    
    # SQLite (Default - No setup required)
    SQLITE_DATABASE_URI = 'sqlite:///vehicle_ecosystem.db'
    
    # PostgreSQL
    POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
    POSTGRES_PORT = os.getenv('POSTGRES_PORT', '5432')
    POSTGRES_USER = os.getenv('POSTGRES_USER', 'postgres')
    POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'password')
    POSTGRES_DB = os.getenv('POSTGRES_DB', 'vehicle_ecosystem')
    POSTGRESQL_DATABASE_URI = f'postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}'
    
    # MongoDB
    MONGO_HOST = os.getenv('MONGO_HOST', 'localhost')
    MONGO_PORT = os.getenv('MONGO_PORT', '27017')
    MONGO_DB = os.getenv('MONGO_DB', 'vehicle_ecosystem')
    MONGO_USER = os.getenv('MONGO_USER', '')
    MONGO_PASSWORD = os.getenv('MONGO_PASSWORD', '')
    
    @property
    def MONGODB_URI(self):
        if self.MONGO_USER and self.MONGO_PASSWORD:
            return f'mongodb://{self.MONGO_USER}:{self.MONGO_PASSWORD}@{self.MONGO_HOST}:{self.MONGO_PORT}/{self.MONGO_DB}'
        return f'mongodb://{self.MONGO_HOST}:{self.MONGO_PORT}/{self.MONGO_DB}'
    
    @property
    def SQLALCHEMY_DATABASE_URI(self):
        if self.DATABASE_TYPE == 'postgresql':
            return self.POSTGRESQL_DATABASE_URI
        return self.SQLITE_DATABASE_URI
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # WebSocket Configuration
    SOCKETIO_ASYNC_MODE = 'eventlet'
    SOCKETIO_CORS_ALLOWED_ORIGINS = '*'
    
    # Simulation Configuration
    SIMULATION_TICK_RATE = 1.0  # seconds between simulation steps
    MAX_VEHICLES = 20
    MAX_ROAD_SEGMENTS = 30
    MAX_FUEL_STATIONS = 10
    
    # AI Configuration
    AI_LEARNING_RATE = 0.01
    AI_PREDICTION_HORIZON = 30  # minutes
    HAZARD_THRESHOLD = 70  # risk score threshold
    FUEL_CRITICAL_THRESHOLD = 15  # percentage
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on environment"""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])()
