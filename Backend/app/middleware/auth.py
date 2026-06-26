"""
Authentication middleware — decorators for protecting endpoints.
"""

from functools import wraps
from flask import request, g
from ..models.user import User
from ..utils.response import error_response


def _get_current_user():
    """
    Extract the session token from the Authorization header and load
    the corresponding user from the database.

    Returns:
        User instance or None.
    """
    token = request.headers.get("Authorization", "").strip()
    if not token:
        return None
    return User.query.filter_by(session_token=token).first()


def customer_required(fn):
    """
    Decorator: restrict access to users with role ``customer``.

    Implies ``@login_required``.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = _get_current_user()
        if user is None:
            return error_response("Authentication required.", 401)
        if user.role != "customer":
            return error_response("Access denied. Customers only.", 403)
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper


def officer_required(fn):
    """
    Decorator: restrict access to users with role ``credit_officer``.

    Implies ``@login_required``.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = _get_current_user()
        if user is None:
            return error_response("Authentication required.", 401)
        if user.role != "credit_officer":
            return error_response("Access denied. Credit officers only.", 403)
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper
