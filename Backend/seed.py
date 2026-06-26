"""
BankLite — Seed Script
Creates sample users for development and testing.

Usage:
    python seed.py
"""

import sys
import os

# Ensure the backend directory is on the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User
from app.utils.security import hash_password


SEED_USERS = [
    {
        "email": "customer@test.com",
        "password": "customer123",
        "full_name": "Alice Customer",
        "role": "customer",
    },
    {
        "email": "officer@test.com",
        "password": "officer123",
        "full_name": "Bob Officer",
        "role": "credit_officer",
    },
]


def seed():
    """Insert sample users into the database."""
    app = create_app()
    with app.app_context():
        db.create_all()

        for user_data in SEED_USERS:
            existing = User.query.filter_by(email=user_data["email"]).first()
            if existing:
                print(f"  [SKIP] User '{user_data['email']}' already exists.")
                continue

            user = User(
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                full_name=user_data["full_name"],
                role=user_data["role"],
            )
            db.session.add(user)
            print(f"  [OK] Created {user_data['role']}: {user_data['email']}")

        db.session.commit()
        print("\nSeed complete.")


if __name__ == "__main__":
    seed()
