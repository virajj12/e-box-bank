"""Models package — import all models so Alembic can detect them."""

from .user import User          # noqa: F401
from .loan import LoanApplication  # noqa: F401
from .audit import AuditLog      # noqa: F401
