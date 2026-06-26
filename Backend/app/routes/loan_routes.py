"""
Loan routes — application submission, review, and officer actions.
"""

from flask import Blueprint, request, g
from marshmallow import ValidationError

from ..schemas.loan_schema import LoanApplySchema, LoanActionSchema
from ..services.loan_service import (
    create_application,
    get_user_applications,
    get_pending_applications,
    get_application_detail,
    process_action,
)
from ..services.audit_service import get_audit_history
from ..middleware.auth import customer_required, officer_required
from ..utils.response import success_response, error_response

loan_bp = Blueprint("loans", __name__)

apply_schema = LoanApplySchema()
action_schema = LoanActionSchema()


# ── Customer endpoints ──────────────────────────────────────────────────


@loan_bp.route("/loans/apply", methods=["POST"])
@customer_required
def apply_for_loan():
    """
    POST /api/v1/loans/apply

    Submit a new loan application (customer only).

    Request body:
        {
            "amount": 100000,
            "purpose": "Home Loan",
            "monthly_income": 70000
        }
    """
    json_data = request.get_json(silent=True)
    if not json_data:
        return error_response("Request body must be valid JSON.", 400)

    try:
        data = apply_schema.load(json_data)
    except ValidationError as err:
        return error_response(err.messages, 400)

    result = create_application(
        user_id=g.current_user.id,
        amount=data["amount"],
        purpose=data["purpose"],
        monthly_income=data["monthly_income"],
    )
    return success_response(result, 201)


@loan_bp.route("/loans/my-applications", methods=["GET"])
@customer_required
def my_applications():
    """
    GET /api/v1/loans/my-applications

    Return every application belonging to the logged-in customer.
    """
    apps = get_user_applications(g.current_user.id)
    return success_response(apps)


# ── Officer endpoints ───────────────────────────────────────────────────


@loan_bp.route("/loans/pending", methods=["GET"])
@officer_required
def pending_applications():
    """
    GET /api/v1/loans/pending

    Return all applications with status ``pending`` (officer only).
    """
    apps = get_pending_applications()
    return success_response(apps)


@loan_bp.route("/loans/<int:loan_id>", methods=["GET"])
@officer_required
def application_detail(loan_id: int):
    """
    GET /api/v1/loans/<id>

    Return detailed view of a single application (officer only).
    Includes customer name, amount, income, purpose, credit score,
    and created date.
    """
    detail = get_application_detail(loan_id)
    if detail is None:
        return error_response("Application not found.", 404)
    return success_response(detail)


@loan_bp.route("/loans/<int:loan_id>/action", methods=["PUT"])
@officer_required
def take_action(loan_id: int):
    """
    PUT /api/v1/loans/<id>/action

    Approve or reject a loan application (officer only).

    Request body:
        {
            "action": "approved",
            "comments": "Income verified."
        }
    """
    json_data = request.get_json(silent=True)
    if not json_data:
        return error_response("Request body must be valid JSON.", 400)

    try:
        data = action_schema.load(json_data)
    except ValidationError as err:
        return error_response(err.messages, 400)

    result, error = process_action(
        application_id=loan_id,
        officer_id=g.current_user.id,
        action=data["action"],
        comments=data["comments"],
    )
    if error:
        return error_response(error, 400)

    return success_response(result)


@loan_bp.route("/audit/<int:loan_id>", methods=["GET"])
@officer_required
def audit_history(loan_id: int):
    """
    GET /api/v1/audit/<loan_id>

    Return complete audit history for a loan application (officer only).
    """
    logs = get_audit_history(loan_id)
    return success_response(logs)
