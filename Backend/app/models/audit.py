"""
Audit Log model — immutable record of every underwriting decision.
"""

from datetime import datetime, timezone
from ..extensions import db


class AuditLog(db.Model):
    """Records every approve / reject action taken by a credit officer."""

    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    application_id = db.Column(
        db.Integer,
        db.ForeignKey("loan_applications.id"),
        nullable=False,
        index=True,
    )
    officer_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, index=True
    )
    action = db.Column(
        db.String(20), nullable=False
    )  # 'approved' | 'rejected'
    comments = db.Column(db.Text, nullable=True)
    timestamp = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def to_dict(self) -> dict:
        """Serialise the audit entry for API responses."""
        return {
            "id": self.id,
            "application_id": self.application_id,
            "officer_id": self.officer_id,
            "action": self.action,
            "comments": self.comments,
            "timestamp": self.timestamp.isoformat(),
        }

    def __repr__(self) -> str:
        return f"<AuditLog #{self.id} – {self.action}>"
