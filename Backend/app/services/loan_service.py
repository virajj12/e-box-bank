"""
Loan service — business logic for loan applications and officer actions.
"""

import random
from flask import current_app
from ..models.loan import LoanApplication
from ..models.audit import AuditLog
from ..models.user import User
from ..extensions import db
from .audit_service import create_audit_entry


def create_application(
    user_id: int, amount: float, purpose: str, monthly_income: float
) -> dict:
    """
    Submit a new loan application with a simulated credit score.

    Args:
        user_id:        The applicant's user ID.
        amount:         Requested loan amount.
        purpose:        Stated purpose for the loan.
        monthly_income: Applicant's reported monthly income.

    Returns:
        Serialised loan application dict.
    """
    credit_score = random.randint(300, 850)

    application = LoanApplication(
        user_id=user_id,
        amount=amount,
        purpose=purpose,
        monthly_income=monthly_income,
        credit_score=credit_score,
        status="pending",
    )
    db.session.add(application)
    db.session.commit()

    current_app.logger.info(
        "Loan application #%d created by user #%d (credit score %d)",
        application.id,
        user_id,
        credit_score,
    )

    return application.to_dict()


def get_user_applications(user_id: int) -> list[dict]:
    """Return all applications belonging to a specific user, with audit data."""
    apps = (
        LoanApplication.query
        .filter_by(user_id=user_id)
        .order_by(LoanApplication.created_at.desc())
        .all()
    )
    results = []
    for app in apps:
        data = app.to_dict()
        # Attach the latest audit entry (officer decision) if any
        audit = (
            AuditLog.query
            .filter_by(application_id=app.id)
            .order_by(AuditLog.timestamp.desc())
            .first()
        )
        if audit:
            officer = db.session.get(User, audit.officer_id)
            data["audit"] = {
                "officer_name": officer.full_name if officer else "Unknown",
                "action": audit.action,
                "comments": audit.comments,
                "timestamp": audit.timestamp.isoformat(),
            }
        results.append(data)
    return results


def get_pending_applications() -> list[dict]:
    """Return all applications with status ``pending``."""
    apps = (
        LoanApplication.query
        .filter_by(status="pending")
        .order_by(LoanApplication.created_at.asc())
        .all()
    )
    return [a.to_dict() for a in apps]


def get_processed_applications() -> list[dict]:
    """Return all applications that have been approved or rejected, with audit data."""
    apps = (
        LoanApplication.query
        .filter(LoanApplication.status.in_(["approved", "rejected"]))
        .order_by(LoanApplication.created_at.desc())
        .all()
    )
    results = []
    for app in apps:
        data = app.to_dict()
        applicant = db.session.get(User, app.user_id)
        data["customer_name"] = applicant.full_name if applicant else "Unknown"
        # Attach the latest audit entry
        audit = (
            AuditLog.query
            .filter_by(application_id=app.id)
            .order_by(AuditLog.timestamp.desc())
            .first()
        )
        if audit:
            officer = db.session.get(User, audit.officer_id)
            data["audit"] = {
                "officer_name": officer.full_name if officer else "Unknown",
                "action": audit.action,
                "comments": audit.comments,
                "timestamp": audit.timestamp.isoformat(),
            }
        results.append(data)
    return results


def get_application_detail(application_id: int) -> dict | None:
    """
    Return a detailed view of a single application, including the
    applicant's name.

    Returns:
        dict or None if not found.
    """
    app = db.session.get(LoanApplication, application_id)
    if app is None:
        return None

    applicant = db.session.get(User, app.user_id)
    data = app.to_dict()
    data["customer_name"] = applicant.full_name if applicant else "Unknown"
    return data


def process_action(
    application_id: int, officer_id: int, action: str, comments: str
) -> tuple[dict | None, str | None]:
    """
    Approve or reject a loan application and write an audit log.

    Args:
        application_id: Target application ID.
        officer_id:     Credit officer performing the action.
        action:         'approved' or 'rejected'.
        comments:       Officer's remarks.

    Returns:
        (application_dict, None) on success.
        (None, error_message) on failure.
    """
    app = db.session.get(LoanApplication, application_id)
    if app is None:
        return None, "Application not found."

    if app.status != "pending":
        return None, f"Application has already been {app.status}."

    app.status = action
    db.session.flush()

    # Create immutable audit record
    create_audit_entry(
        application_id=application_id,
        officer_id=officer_id,
        action=action,
        comments=comments,
    )

    db.session.commit()

    current_app.logger.info(
        "Loan #%d %s by officer #%d", application_id, action, officer_id
    )

    return app.to_dict(), None
