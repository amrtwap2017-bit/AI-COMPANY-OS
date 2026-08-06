

from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass


# ─── Sprint-055: Soft Delete Mixin ────────────────────────────────────────────
# Usage: class MyModel(SoftDeleteMixin, Base):
# Rule: NEVER use hard delete on tables with this mixin
# Rule: Always filter with .filter(Model.deleted_at == None) in repositories
# ─────────────────────────────────────────────────────────────────────────────
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime

class SoftDeleteMixin:
    """
    Adds deleted_at soft delete support to any SQLAlchemy model.
    is_active is preserved for backward compatibility.
    """
    deleted_at = Column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
        comment='NULL = active. Timestamp = soft deleted. NEVER hard delete P0 records.'
    )

    def soft_delete(self):
        """Mark record as deleted. Call this instead of db.delete()."""
        self.deleted_at = datetime.now(timezone.utc)

    def restore(self):
        """Restore a soft-deleted record."""
        self.deleted_at = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
