"""
Authentication routes — login and registration endpoints.
"""

from flask import Blueprint, request
from marshmallow import ValidationError

from ..schemas.auth_schema import LoginSchema, RegisterSchema
from ..services.auth_service import authenticate, register_user
from ..utils.response import success_response, error_response

auth_bp = Blueprint("auth", __name__)

login_schema = LoginSchema()
register_schema = RegisterSchema()


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


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    POST /api/v1/auth/register

    Create a new user account.

    Request body:
        {
            "email": "newuser@example.com",
            "password": "securepass",
            "full_name": "Jane Doe",
            "role": "customer"
        }
    """
    json_data = request.get_json(silent=True)
    if not json_data:
        return error_response("Request body must be valid JSON.", 400)

    # Validate input
    try:
        data = register_schema.load(json_data)
    except ValidationError as err:
        return error_response(err.messages, 400)

    # Register the user
    result, error = register_user(
        email=data["email"],
        password=data["password"],
        full_name=data["full_name"],
        role=data["role"],
    )

    if error:
        return error_response(error, 400)

    return success_response(result, 201)