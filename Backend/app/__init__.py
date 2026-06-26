"""
BankLite — Smart Loan Origination System
Application factory module.
"""

import os
from flask import Flask, jsonify
from .config import config_by_name
from .extensions import db, migrate, cors
from .utils.logger import setup_logger


def create_app(config_name: str | None = None) -> Flask:
    """
    Application factory.

    Args:
        config_name: One of 'development', 'testing', 'production'.
                     Falls back to FLASK_ENV env-var, then 'development'.

    Returns:
        Configured Flask application instance.
    """
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # ── Initialise extensions ───────────────────────────────────────────
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    # ── Logging ─────────────────────────────────────────────────────────
    setup_logger(app)

    # ── Register blueprints ─────────────────────────────────────────────
    from .routes.auth_routes import auth_bp
    from .routes.loan_routes import loan_bp

    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(loan_bp, url_prefix="/api/v1")

    # ── Centralised error handlers ──────────────────────────────────────
    _register_error_handlers(app)

    return app


def _register_error_handlers(app: Flask) -> None:
    """Attach JSON error handlers for common HTTP status codes."""

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"success": False, "message": str(error.description)}), 400

    @app.errorhandler(401)
    def unauthorised(error):
        return jsonify({"success": False, "message": "Authentication required."}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"success": False, "message": "Access denied."}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": "Resource not found."}), 404

    @app.errorhandler(409)
    def conflict(error):
        return jsonify({"success": False, "message": str(error.description)}), 409

    @app.errorhandler(422)
    def unprocessable(error):
        return jsonify({"success": False, "message": str(error.description)}), 422

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.exception("Unhandled server error")
        return jsonify({"success": False, "message": "Internal server error."}), 500
