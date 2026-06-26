"""
Unit tests for the authentication workflow.
"""


class TestLogin:
    """Tests for POST /api/v1/auth/login."""

    def test_login_success_customer(self, client, seed_users):
        """A valid customer can log in and receives a token."""
        resp = client.post("/api/v1/auth/login", json={
            "email": "customer@test.com",
            "password": "customer123",
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert "token" in data["data"]
        assert data["data"]["role"] == "customer"
        assert data["data"]["full_name"] == "Alice Customer"

    def test_login_success_officer(self, client, seed_users):
        """A valid credit officer can log in and receives a token."""
        resp = client.post("/api/v1/auth/login", json={
            "email": "officer@test.com",
            "password": "officer123",
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert data["data"]["role"] == "credit_officer"

    def test_login_wrong_password(self, client, seed_users):
        """Incorrect password returns 401."""
        resp = client.post("/api/v1/auth/login", json={
            "email": "customer@test.com",
            "password": "wrong",
        })
        assert resp.status_code == 401
        assert resp.get_json()["success"] is False

    def test_login_unknown_email(self, client, seed_users):
        """Non-existent email returns 401."""
        resp = client.post("/api/v1/auth/login", json={
            "email": "nobody@test.com",
            "password": "irrelevant",
        })
        assert resp.status_code == 401

    def test_login_missing_email(self, client, seed_users):
        """Missing email field returns 400."""
        resp = client.post("/api/v1/auth/login", json={
            "password": "customer123",
        })
        assert resp.status_code == 400

    def test_login_missing_password(self, client, seed_users):
        """Missing password field returns 400."""
        resp = client.post("/api/v1/auth/login", json={
            "email": "customer@test.com",
        })
        assert resp.status_code == 400

    def test_login_invalid_email_format(self, client, seed_users):
        """Malformed email returns 400."""
        resp = client.post("/api/v1/auth/login", json={
            "email": "not-an-email",
            "password": "customer123",
        })
        assert resp.status_code == 400

    def test_login_empty_body(self, client, seed_users):
        """Empty request body returns 400."""
        resp = client.post(
            "/api/v1/auth/login",
            data="",
            content_type="application/json",
        )
        assert resp.status_code == 400

    def test_login_returns_new_token_each_time(self, client, seed_users):
        """Each login generates a fresh token."""
        payload = {"email": "customer@test.com", "password": "customer123"}
        t1 = client.post("/api/v1/auth/login", json=payload).get_json()["data"]["token"]
        t2 = client.post("/api/v1/auth/login", json=payload).get_json()["data"]["token"]
        assert t1 != t2


class TestAuthMiddleware:
    """Tests for authentication decorator behaviour."""

    def test_protected_route_without_token(self, client, seed_users):
        """Accessing a protected route without a token returns 401."""
        resp = client.get("/api/v1/loans/my-applications")
        assert resp.status_code == 401

    def test_protected_route_with_invalid_token(self, client, seed_users):
        """Accessing a protected route with a bad token returns 401."""
        resp = client.get(
            "/api/v1/loans/my-applications",
            headers={"Authorization": "invalid-token"},
        )
        assert resp.status_code == 401

    def test_customer_cannot_access_officer_route(self, client, customer_token):
        """A customer token must not grant access to officer endpoints."""
        resp = client.get(
            "/api/v1/loans/pending",
            headers={"Authorization": customer_token},
        )
        assert resp.status_code == 403

    def test_officer_cannot_access_customer_route(self, client, officer_token):
        """An officer token must not grant access to customer endpoints."""
        resp = client.post(
            "/api/v1/loans/apply",
            json={"amount": 1000, "purpose": "Test", "monthly_income": 5000},
            headers={"Authorization": officer_token},
        )
        assert resp.status_code == 403
