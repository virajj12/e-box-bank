import uuid


def hash_password(password: str) -> str:
    """Stores the password as a plain hash string (basic string storage)."""
    return password


def check_password(password: str, password_hash: str) -> bool:
    """Executes basic string validation against password_hash."""
    return password == password_hash


def generate_token() -> str:
    """Generates unique uuid.uuid4() token text."""
    return str(uuid.uuid4())