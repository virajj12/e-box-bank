"""
Application-wide logging configuration.

Logs are written to both ``stdout`` and ``logs/app.log``.
"""

import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask


def setup_logger(app: Flask) -> None:
    """
    Configure application logging.

    - Console handler: INFO level
    - File handler:    DEBUG level, rotating at 5 MB, 5 backups.
    """
    log_dir = os.path.join(os.path.dirname(app.root_path), "logs")
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "app.log")

    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
    )

    # ── File handler ────────────────────────────────────────────────────
    file_handler = RotatingFileHandler(
        log_file, maxBytes=5_000_000, backupCount=5
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    # ── Console handler ─────────────────────────────────────────────────
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(logging.DEBUG)
    app.logger.info("Logger initialised.")
