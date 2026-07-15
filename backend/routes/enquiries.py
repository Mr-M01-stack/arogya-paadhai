from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Enquiry

enquiries_bp = Blueprint('enquiries', __name__, url_prefix='/api/enquiries')


@enquiries_bp.route('', methods=['POST'])
def create_enquiry():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    if 'name' not in data or 'email' not in data or 'message' not in data:
        return jsonify({'error': 'name, email, and message are required'}), 400

    if not data['name'].strip() or not data['email'].strip() or not data['message'].strip():
        return jsonify({'error': 'name, email, and message cannot be empty'}), 400

    enquiry = Enquiry(
        name=data['name'].strip(),
        email=data['email'].strip().lower(),
        phone=data.get('phone', '').strip(),
        message=data['message'].strip(),
        product_id=data.get('product_id'),
    )
    db.session.add(enquiry)
    db.session.commit()

    return jsonify({
        'enquiry': enquiry.to_dict(),
        'message': 'Your enquiry has been submitted successfully. We will get back to you soon!'
    }), 201


@enquiries_bp.route('', methods=['GET'])
@jwt_required()
def list_enquiries():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    is_read = request.args.get('is_read')

    query = Enquiry.query.order_by(Enquiry.created_at.desc())

    if is_read is not None:
        query = query.filter_by(is_read=is_read.lower() == 'true')

    enquiries = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'enquiries': [e.to_dict() for e in enquiries.items],
        'count': enquiries.total,
        'page': enquiries.page,
        'pages': enquiries.pages,
        'unread_count': Enquiry.query.filter_by(is_read=False).count()
    }), 200


@enquiries_bp.route('/<int:id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(id):
    enquiry = Enquiry.query.get(id)
    if not enquiry:
        return jsonify({'error': 'Enquiry not found'}), 404

    enquiry.is_read = True
    db.session.commit()

    return jsonify({'enquiry': enquiry.to_dict(), 'message': 'Enquiry marked as read'}), 200


@enquiries_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_enquiry(id):
    enquiry = Enquiry.query.get(id)
    if not enquiry:
        return jsonify({'error': 'Enquiry not found'}), 404

    db.session.delete(enquiry)
    db.session.commit()

    return jsonify({'message': 'Enquiry deleted successfully'}), 200
