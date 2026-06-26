"""
Application configuration classes.
Reads values from environment variables with sensible defaults.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class BaseConfig:
    """Shared configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False


class DevelopmentConfig(BaseConfig):
    """Development / local configuration."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", "sqlite:///banklite.db"
    )


class TestingConfig(BaseConfig):
    """Testing configuration — uses in-memory SQLite."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


class ProductionConfig(BaseConfig):
    """Production configuration — expects PostgreSQL."""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")


config_by_name: dict[str, type] = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
