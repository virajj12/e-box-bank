"""
Authentication service — business logic for login and registration.
"""

from flask import current_app
from ..models.user import User
from ..extensions import db
from ..utils.security import check_password, generate_token, hash_password


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


def register_user(
    email: str, password: str, full_name: str, role: str
) -> tuple[dict | None, str | None]:
    """
    Register a new user account.

    Args:
        email:     New user's email address.
        password:  Plaintext password (will be hashed).
        full_name: User's full name.
        role:      'customer' or 'credit_officer'.

    Returns:
        (payload_dict, None) on success.
        (None, error_message) on failure.
    """
    # Check if email already exists
    existing = User.query.filter_by(email=email).first()
    if existing:
        return None, "An account with this email already exists."

    user = User(
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        role=role,
    )
    db.session.add(user)
    db.session.commit()

    current_app.logger.info("New user registered: %s (%s)", email, role)

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
    }, None