"""
Loan Application model.
"""

from datetime import datetime, timezone
from ..extensions import db


class LoanApplication(db.Model):
    """Represents a single loan application submitted by a customer."""

    __tablename__ = "loan_applications"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, index=True
    )
    amount = db.Column(db.Float, nullable=False)
    purpose = db.Column(db.String(255), nullable=False)
    monthly_income = db.Column(db.Float, nullable=False)
    credit_score = db.Column(db.Integer, nullable=False)
    status = db.Column(
        db.String(20), nullable=False, default="pending"
    )  # 'pending' | 'approved' | 'rejected'
    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ───────────────────────────────────────────────────
    audit_logs = db.relationship(
        "AuditLog", backref="application", lazy="dynamic"
    )

    def to_dict(self) -> dict:
        """Serialise the application for API responses."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "purpose": self.purpose,
            "monthly_income": self.monthly_income,
            "credit_score": self.credit_score,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self) -> str:
        return f"<LoanApplication #{self.id} – {self.status}>"
