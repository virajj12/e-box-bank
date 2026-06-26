"""
Audit service — business logic for the immutable audit trail.
"""

from flask import current_app
from ..models.audit import AuditLog
from ..extensions import db


def create_audit_entry(
    application_id: int,
    officer_id: int,
    action: str,
    comments: str,
) -> AuditLog:
    """
    Insert an immutable audit record for an underwriting decision.

    Args:
        application_id: The loan application that was acted upon.
        officer_id:     The credit officer who performed the action.
        action:         'approved' or 'rejected'.
        comments:       Officer's remarks.

    Returns:
        The created AuditLog instance.
    """
    entry = AuditLog(
        application_id=application_id,
        officer_id=officer_id,
        action=action,
        comments=comments,
    )
    db.session.add(entry)

    current_app.logger.info(
        "Audit entry created — loan #%d %s by officer #%d",
        application_id,
        action,
        officer_id,
    )

    return entry


def get_audit_history(application_id: int) -> list[dict]:
    """
    Retrieve the complete audit trail for a loan application.

    Args:
        application_id: The target loan application ID.

    Returns:
        List of serialised audit entries, ordered by timestamp.
    """
    logs = (
        AuditLog.query
        .filter_by(application_id=application_id)
        .order_by(AuditLog.timestamp.asc())
        .all()
    )
    return [log.to_dict() for log in logs]
