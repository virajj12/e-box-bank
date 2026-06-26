"""
Marshmallow schemas for loan-related request validation.
"""

from marshmallow import Schema, fields, validate


class LoanApplySchema(Schema):
    """Validates POST /api/v1/loans/apply body."""

    amount = fields.Float(
        required=True,
        validate=validate.Range(min=1, error="Loan amount must be positive."),
        error_messages={"required": "Loan amount is required."},
    )
    purpose = fields.String(
        required=True,
        validate=validate.Length(min=1, error="Purpose is required."),
        error_messages={"required": "Loan purpose is required."},
    )
    monthly_income = fields.Float(
        required=True,
        validate=validate.Range(min=1, error="Monthly income must be greater than 0."),
        error_messages={"required": "Monthly income is required."},
    )


class LoanActionSchema(Schema):
    """Validates PUT /api/v1/loans/<id>/action body."""

    action = fields.String(
        required=True,
        validate=validate.OneOf(
            ["approved", "rejected"],
            error="Action must be 'approved' or 'rejected'.",
        ),
        error_messages={"required": "Action is required."},
    )
    comments = fields.String(
        required=False,
        load_default="",
    )
