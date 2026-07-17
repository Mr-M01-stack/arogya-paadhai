from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, StoreSetting

settings_bp = Blueprint('settings', __name__, url_prefix='/api/settings')


@settings_bp.route('/store', methods=['GET'])
def get_store_settings():
    setting = StoreSetting.query.first()
    if not setting:
        setting = StoreSetting(store_name='Arogya Paadhai')
        db.session.add(setting)
        db.session.commit()
    return jsonify(setting.to_dict())


@settings_bp.route('/store', methods=['PUT'])
@jwt_required()
def update_store_settings():
    setting = StoreSetting.query.first()
    if not setting:
        setting = StoreSetting(store_name='Arogya Paadhai')
        db.session.add(setting)
        db.session.flush()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    fields = ['store_name', 'email', 'phone', 'whatsapp', 'whatsapp_channel', 'whatsapp_community', 'instagram', 'address', 'business_hours', 'google_review_link']
    for f in fields:
        if f in data:
            setattr(setting, f, data[f])
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    return jsonify(setting.to_dict())
