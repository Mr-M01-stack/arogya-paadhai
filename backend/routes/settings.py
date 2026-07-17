from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, StoreSetting, AdminUser

settings_bp = Blueprint('settings', __name__, url_prefix='/api/settings')


@settings_bp.route('/store', methods=['GET'])
def get_store_settings():
    setting = StoreSetting.query.first()
    if not setting:
        setting = StoreSetting()
        db.session.add(setting)
        db.session.flush()
    return jsonify(setting.to_dict())


@settings_bp.route('/store', methods=['PUT'])
@jwt_required()
def update_store_settings():
    setting = StoreSetting.query.first()
    if not setting:
        setting = StoreSetting()
        db.session.add(setting)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    fields = ['store_name', 'email', 'phone', 'whatsapp', 'whatsapp_channel', 'whatsapp_community', 'instagram', 'address', 'business_hours', 'google_review_link']
    for f in fields:
        if f in data:
            setattr(setting, f, data[f])
    db.session.commit()
    return jsonify(setting.to_dict())
