from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes.auth import auth_bp, blacklisted_tokens
from routes.products import products_bp
from routes.categories import categories_bp
from routes.enquiries import enquiries_bp
from routes.analytics import analytics_bp
from routes.stall import stall_bp
from routes.settings import settings_bp
from routes.export import export_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

    db.init_app(app)

    jwt = JWTManager(app)

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        return jti in blacklisted_tokens

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has been revoked'}), 401

    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({'error': 'Authorization token is missing'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({'error': 'Invalid token'}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired'}), 401

    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(enquiries_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(stall_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(export_bp)

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'service': 'Arogya Paadhai API'}), 200

    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
