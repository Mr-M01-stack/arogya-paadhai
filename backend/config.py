import os
from datetime import timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'arogya-paadhai-secret-key-2024')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'arogya-paadhai-jwt-secret-2024')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f'sqlite:///{os.path.join(BASE_DIR, "arogya.db")}'
    )
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith('postgresql://'):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace('postgresql://', 'postgresql+psycopg://', 1)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ADMIN_EMAIL = 'admin@arogyapaadhai.com'
    ADMIN_PASSWORD = 'admin123'
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',')
