from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from models import db, AdminUser

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

blacklisted_tokens = set()


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    admin = AdminUser.query.filter_by(email=email).first()
    if not admin or not admin.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = create_access_token(
        identity=str(admin.id),
        additional_claims={
            'email': admin.email,
            'name': admin.name or 'Admin'
        }
    )

    return jsonify({
        'token': token,
        'user': admin.to_dict(),
        'message': 'Login successful'
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    blacklisted_tokens.add(jti)
    return jsonify({'message': 'Logged out successfully'}), 200


@auth_bp.route('/password', methods=['PUT'])
@jwt_required()
def change_password():
    admin_id = get_jwt_identity()
    admin = AdminUser.query.get(int(admin_id))
    if not admin:
        return jsonify({'error': 'User not found'}), 404
    data = request.get_json()
    if not data or not data.get('current') or not data.get('new'):
        return jsonify({'error': 'Current and new password required'}), 400
    if not admin.check_password(data['current']):
        return jsonify({'error': 'Current password is incorrect'}), 401
    if len(data['new']) < 4:
        return jsonify({'error': 'New password must be at least 4 characters'}), 400
    admin.set_password(data['new'])
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    admin_id = get_jwt_identity()
    admin = AdminUser.query.get(int(admin_id))
    if not admin:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': admin.to_dict()}), 200
