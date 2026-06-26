from werkzeug.security import generate_password_hash, check_password_hash
import secrets

def hash_password(password: str) -> str:
    """Hashes a plaintext password."""
    return generate_password_hash(password)

def check_password(password: str, hashed: str) -> bool:
    """Verifies a plaintext password against a hash."""
    return check_password_hash(hashed, password)

def generate_token() -> str:
    """Generates a secure random session token."""
    return secrets.token_hex(32)