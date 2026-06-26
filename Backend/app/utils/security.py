"""
Security utilities — password hashing and token generation.
"""

import uuid
import bcrypt


def hash_password(plain: str) -> str:
    """
    Hash a plaintext password using bcrypt.

    Args:
        plain: The plaintext password.

    Returns:
        bcrypt hash string.
    """
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(plain: str, hashed: str) -> bool:
    """
    Verify a plaintext password against a bcrypt hash.

    Args:
        plain:  The plaintext password supplied by the user.
        hashed: The stored bcrypt hash.

    Returns:
        True if the password matches.
    """
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def generate_token() -> str:
    """
    Generate a random UUID-4 session token.

    Returns:
        Hex-encoded UUID string.
    """
    return uuid.uuid4().hex
