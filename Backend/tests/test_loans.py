"""
Unit tests for the loan application and officer review workflow.
"""


class TestLoanApply:
    """Tests for POST /api/v1/loans/apply."""

    def test_apply_success(self, client, customer_token):
        """A customer can successfully submit a loan application."""
        resp = client.post(
            "/api/v1/loans/apply",
            json={"amount": 50000, "purpose": "Car Loan", "monthly_income": 30000},
            headers={"Authorization": customer_token},
        )
        assert resp.status_code == 201
        data = resp.get_json()["data"]
        assert data["amount"] == 50000.0
        assert data["purpose"] == "Car Loan"
        assert data["status"] == "pending"
        assert 300 <= data["credit_score"] <= 850

    def test_apply_missing_amount(self, client, customer_token):
        """Missing amount returns 400."""
        resp = client.post(
            "/api/v1/loans/apply",
            json={"purpose": "Test", "monthly_income": 5000},
            headers={"Authorization": customer_token},
        )
        assert resp.status_code == 400

    def test_apply_negative_amount(self, client, customer_token):
        """Negative loan amount returns 400."""
        resp = client.post(
            "/api/v1/loans/apply",
            json={"amount": -100, "purpose": "Test", "monthly_income": 5000},
            headers={"Authorization": customer_token},
        )
        assert resp.status_code == 400

    def test_apply_zero_income(self, client, customer_token):
        """Zero monthly income returns 400."""
        resp = client.post(
            "/api/v1/loans/apply",
            json={"amount": 1000, "purpose": "Test", "monthly_income": 0},
            headers={"Authorization": customer_token},
        )
        assert resp.status_code == 400

    def test_apply_missing_purpose(self, client, customer_token):
        """Missing purpose returns 400."""
        resp = client.post(
            "/api/v1/loans/apply",
            json={"amount": 1000, "monthly_income": 5000},
            headers={"Authorization": customer_token},
        )
        assert resp.status_code == 400

    def test_apply_empty_purpose(self, client, customer_token):
        """Empty string purpose returns 400."""
        resp = client.post(
            "/api/v1/loans/apply",
            json={"amount": 1000, "purpose": "", "monthly_income": 5000},
            headers={"Authorization": customer_token},
        )
        assert resp.status_code == 400


class TestMyApplications:
    """Tests for GET /api/v1/loans/my-applications."""

    def test_empty_applications(self, client, customer_token):
        """A customer with no applications gets an empty list."""
        resp = client.get(
            "/api/v1/loans/my-applications",
            headers={"Authorization": customer_token},
        )
        assert resp.status_code == 200
        assert resp.get_json()["data"] == []

    def test_list_own_applications(self, client, customer_token):
        """Customer sees only their own applications."""
        # Create two applications
        client.post(
            "/api/v1/loans/apply",
            json={"amount": 10000, "purpose": "Loan A", "monthly_income": 5000},
            headers={"Authorization": customer_token},
        )
        client.post(
            "/api/v1/loans/apply",
            json={"amount": 20000, "purpose": "Loan B", "monthly_income": 6000},
            headers={"Authorization": customer_token},
        )
        resp = client.get(
            "/api/v1/loans/my-applications",
            headers={"Authorization": customer_token},
        )
        assert resp.status_code == 200
        assert len(resp.get_json()["data"]) == 2


class TestOfficerEndpoints:
    """Tests for officer-only endpoints."""

    def _create_loan(self, client, customer_token):
        """Helper to create a loan and return its ID."""
        resp = client.post(
            "/api/v1/loans/apply",
            json={"amount": 75000, "purpose": "Home Loan", "monthly_income": 40000},
            headers={"Authorization": customer_token},
        )
        return resp.get_json()["data"]["id"]

    def test_pending_applications(self, client, customer_token, officer_token):
        """Officer can retrieve pending applications."""
        self._create_loan(client, customer_token)
        resp = client.get(
            "/api/v1/loans/pending",
            headers={"Authorization": officer_token},
        )
        assert resp.status_code == 200
        assert len(resp.get_json()["data"]) >= 1

    def test_application_detail(self, client, customer_token, officer_token):
        """Officer can view a single application's detail."""
        loan_id = self._create_loan(client, customer_token)
        resp = client.get(
            f"/api/v1/loans/{loan_id}",
            headers={"Authorization": officer_token},
        )
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert data["id"] == loan_id
        assert "customer_name" in data

    def test_application_detail_not_found(self, client, officer_token):
        """Requesting a non-existent application returns 404."""
        resp = client.get(
            "/api/v1/loans/9999",
            headers={"Authorization": officer_token},
        )
        assert resp.status_code == 404

    def test_approve_application(self, client, customer_token, officer_token):
        """Officer can approve a pending loan."""
        loan_id = self._create_loan(client, customer_token)
        resp = client.put(
            f"/api/v1/loans/{loan_id}/action",
            json={"action": "approved", "comments": "Looks good."},
            headers={"Authorization": officer_token},
        )
        assert resp.status_code == 200
        assert resp.get_json()["data"]["status"] == "approved"

    def test_reject_application(self, client, customer_token, officer_token):
        """Officer can reject a pending loan."""
        loan_id = self._create_loan(client, customer_token)
        resp = client.put(
            f"/api/v1/loans/{loan_id}/action",
            json={"action": "rejected", "comments": "Low capacity."},
            headers={"Authorization": officer_token},
        )
        assert resp.status_code == 200
        assert resp.get_json()["data"]["status"] == "rejected"

    def test_cannot_act_twice(self, client, customer_token, officer_token):
        """Acting on an already-processed application returns 400."""
        loan_id = self._create_loan(client, customer_token)
        client.put(
            f"/api/v1/loans/{loan_id}/action",
            json={"action": "approved", "comments": "OK."},
            headers={"Authorization": officer_token},
        )
        resp = client.put(
            f"/api/v1/loans/{loan_id}/action",
            json={"action": "rejected", "comments": "Changed mind."},
            headers={"Authorization": officer_token},
        )
        assert resp.status_code == 400

    def test_invalid_action(self, client, customer_token, officer_token):
        """An invalid action value returns 400."""
        loan_id = self._create_loan(client, customer_token)
        resp = client.put(
            f"/api/v1/loans/{loan_id}/action",
            json={"action": "maybe", "comments": "Not sure."},
            headers={"Authorization": officer_token},
        )
        assert resp.status_code == 400

    def test_action_on_nonexistent_loan(self, client, officer_token):
        """Acting on a non-existent loan returns 400."""
        resp = client.put(
            "/api/v1/loans/9999/action",
            json={"action": "approved", "comments": "Test."},
            headers={"Authorization": officer_token},
        )
        assert resp.status_code == 400


class TestAuditTrail:
    """Tests for GET /api/v1/audit/<loan_id>."""

    def test_audit_log_created_on_action(self, client, customer_token, officer_token):
        """An audit log entry is created when an officer takes action."""
        # Create and approve a loan
        resp = client.post(
            "/api/v1/loans/apply",
            json={"amount": 50000, "purpose": "Test", "monthly_income": 25000},
            headers={"Authorization": customer_token},
        )
        loan_id = resp.get_json()["data"]["id"]

        client.put(
            f"/api/v1/loans/{loan_id}/action",
            json={"action": "approved", "comments": "All checks passed."},
            headers={"Authorization": officer_token},
        )

        # Fetch audit trail
        resp = client.get(
            f"/api/v1/audit/{loan_id}",
            headers={"Authorization": officer_token},
        )
        assert resp.status_code == 200
        logs = resp.get_json()["data"]
        assert len(logs) == 1
        assert logs[0]["action"] == "approved"
        assert logs[0]["comments"] == "All checks passed."

    def test_audit_empty_for_new_loan(self, client, customer_token, officer_token):
        """A new loan has no audit entries."""
        resp = client.post(
            "/api/v1/loans/apply",
            json={"amount": 10000, "purpose": "Test", "monthly_income": 5000},
            headers={"Authorization": customer_token},
        )
        loan_id = resp.get_json()["data"]["id"]

        resp = client.get(
            f"/api/v1/audit/{loan_id}",
            headers={"Authorization": officer_token},
        )
        assert resp.status_code == 200
        assert resp.get_json()["data"] == []
