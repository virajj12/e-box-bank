"""
User model — customers and credit officers.
"""

from ..extensions import db


class User(db.Model):
    """Represents an authenticated user of the system."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    role = db.Column(
        db.String(20),
        nullable=False,
        default="customer",
    )  # 'customer' | 'credit_officer'
    session_token = db.Column(db.String(128), nullable=True)

    # ── Relationships ───────────────────────────────────────────────────
    loan_applications = db.relationship(
        "LoanApplication", backref="applicant", lazy="dynamic"
    )
    audit_actions = db.relationship(
        "AuditLog", backref="officer", lazy="dynamic"
    )

    def to_dict(self) -> dict:
        """Public-safe serialisation — never exposes password hash."""
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
        }

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"
