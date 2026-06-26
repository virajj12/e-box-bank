"""
Standardised JSON response helpers.
"""

from flask import jsonify
from typing import Any


def success_response(data: Any, status_code: int = 200):
    """
    Return a successful JSON response.

    Args:
        data:        Payload to include in the response.
        status_code: HTTP status code (default 200).
    """
    return jsonify({"success": True, "data": data}), status_code


def error_response(message: str, status_code: int = 400):
    """
    Return an error JSON response.

    Args:
        message:     Human-readable error description.
        status_code: HTTP status code (default 400).
    """
    return jsonify({"success": False, "message": message}), status_code
