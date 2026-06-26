"""
Authentication service — business logic for login.
"""

from flask import current_app
from ..models.user import User
from ..extensions import db
from ..utils.security import check_password, generate_token


def authenticate(email: str, password: str) -> tuple[dict | None, str | None]:
    """
    Authenticate a user by email and password.

    Args:
        email:    User-supplied email address.
        password: User-supplied plaintext password.

    Returns:
        (payload_dict, None) on success.
        (None, error_message) on failure.
    """
    user = User.query.filter_by(email=email).first()

    if user is None:
        return None, "Invalid email or password."

    if not check_password(password, user.password_hash):
        return None, "Invalid email or password."

    # Generate and persist a new session token
    token = generate_token()
    user.session_token = token
    db.session.commit()

    current_app.logger.info("User logged in: %s", user.email)

    return {
        "token": token,
        "role": user.role,
        "full_name": user.full_name,
    }, None
