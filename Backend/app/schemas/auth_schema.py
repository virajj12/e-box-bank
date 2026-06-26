"""
Marshmallow schemas for authentication request validation.
"""

from marshmallow import Schema, fields, validate, ValidationError  # noqa: F401


class LoginSchema(Schema):
    """Validates POST /api/v1/auth/login body."""

    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required.", "invalid": "Invalid email format."},
    )
    password = fields.String(
        required=True,
        validate=validate.Length(min=1),
        error_messages={"required": "Password is required."},
    )
