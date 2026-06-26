"""
Pytest configuration and shared fixtures.
"""

import pytest
from app import create_app
from app.extensions import db as _db
from app.models.user import User
from app.utils.security import hash_password


@pytest.fixture(scope="session")
def app():
    """Create a Flask application configured for testing."""
    _app = create_app("testing")
    yield _app


@pytest.fixture(scope="function")
def db(app):
    """
    Provide a clean database for each test function.
    Creates all tables before the test and drops them after.
    """
    with app.app_context():
        _db.create_all()
        yield _db
        _db.session.rollback()
        _db.drop_all()


@pytest.fixture(scope="function")
def client(app, db):
    """Flask test client."""
    return app.test_client()


@pytest.fixture(scope="function")
def seed_users(db):
    """Insert a customer and officer into the test database."""
    customer = User(
        email="customer@test.com",
        password_hash=hash_password("customer123"),
        full_name="Alice Customer",
        role="customer",
    )
    officer = User(
        email="officer@test.com",
        password_hash=hash_password("officer123"),
        full_name="Bob Officer",
        role="credit_officer",
    )
    db.session.add_all([customer, officer])
    db.session.commit()
    return {"customer": customer, "officer": officer}


@pytest.fixture(scope="function")
def customer_token(client, seed_users):
    """Log in the customer and return the session token."""
    resp = client.post("/api/v1/auth/login", json={
        "email": "customer@test.com",
        "password": "customer123",
    })
    return resp.get_json()["data"]["token"]


@pytest.fixture(scope="function")
def officer_token(client, seed_users):
    """Log in the officer and return the session token."""
    resp = client.post("/api/v1/auth/login", json={
        "email": "officer@test.com",
        "password": "officer123",
    })
    return resp.get_json()["data"]["token"]
