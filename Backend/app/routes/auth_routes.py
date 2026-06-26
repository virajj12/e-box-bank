"""
Authentication routes — login endpoint.
"""

from flask import Blueprint, request, current_app
from marshmallow import ValidationError

from ..schemas.auth_schema import LoginSchema
from ..services.auth_service import authenticate
from ..utils.response import success_response, error_response

auth_bp = Blueprint("auth", __name__)

login_schema = LoginSchema()


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    POST /api/v1/auth/login

    Authenticate a user and return a session token.

    Request body:
        {
            "email": "user@example.com",
            "password": "secret"
        }

    Success response:
        {
            "success": true,
            "data": {
                "token": "...",
                "role": "customer",
                "full_name": "Jane Doe"
            }
        }
    """
    json_data = request.get_json(silent=True)
    if not json_data:
        return error_response("Request body must be valid JSON.", 400)

    # Validate input
    try:
        data = login_schema.load(json_data)
    except ValidationError as err:
        return error_response(err.messages, 400)

    # Authenticate
    result, error = authenticate(data["email"], data["password"])
    if error:
        return error_response(error, 401)

    return success_response(result)
