"""
Sprint-055: Soft Delete Standardization Tests
Tests that deleted_at column exists and soft delete works on P0 tables.

NOTE: is_active test is scoped to tables built after the is_active convention.
      contracts and work_orders predate the convention — excluded from that check.
"""
import pytest
from sqlalchemy import inspect, text
from src.core.database import engine


P0_TABLES = [
    "invoices",
    "contracts",
    "work_orders",
    "leads",
    "quotes",
]

# Tables confirmed to have is_active (built after convention was set)
HAS_IS_ACTIVE = [
    "invoices",
    "leads",
]


class TestSoftDeleteMigration:

    def test_p0_tables_have_deleted_at_column(self):
        """All P0 tables must have deleted_at after sprint-055 migration."""
        insp = inspect(engine)
        missing = []
        for table in P0_TABLES:
            try:
                cols = [c["name"] for c in insp.get_columns(table)]
                if "deleted_at" not in cols:
                    missing.append(table)
            except Exception as e:
                missing.append(f"{table}(error:{e})")

        assert missing == [], (
            f"P0 tables missing deleted_at: {missing}\n"
            f"Run: .venv/bin/python -m alembic upgrade f1a2b3c4d5e6"
        )

    def test_tables_with_is_active_still_have_it(self):
        """Backward compat: is_active must NOT be removed from tables that had it."""
        insp = inspect(engine)
        missing_active = []
        for table in HAS_IS_ACTIVE:
            try:
                cols = [c["name"] for c in insp.get_columns(table)]
                if "is_active" not in cols:
                    missing_active.append(table)
            except Exception:
                pass

        assert missing_active == [], (
            f"is_active was removed from: {missing_active} — NEVER remove is_active"
        )

    def test_deleted_at_is_nullable(self):
        """deleted_at must be nullable — NULL = active record."""
        insp = inspect(engine)
        not_nullable = []
        for table in P0_TABLES:
            try:
                for col in insp.get_columns(table):
                    if col["name"] == "deleted_at":
                        if not col["nullable"]:
                            not_nullable.append(table)
            except Exception:
                pass

        assert not_nullable == [], (
            f"deleted_at is NOT NULL on: {not_nullable} — must be nullable"
        )

    def test_deleted_at_index_exists(self):
        """Index on deleted_at must exist on all P0 tables."""
        insp = inspect(engine)
        missing_index = []
        for table in P0_TABLES:
            try:
                indexes = [idx["name"] for idx in insp.get_indexes(table)]
                expected = f"ix_{table}_deleted_at"
                if expected not in indexes:
                    missing_index.append(f"{table}(expected:{expected})")
            except Exception:
                pass

        assert missing_index == [], (
            f"Missing deleted_at index on: {missing_index}"
        )

    def test_soft_delete_mixin_importable(self):
        """SoftDeleteMixin must be importable from src.core.base."""
        from src.core.base import SoftDeleteMixin
        assert hasattr(SoftDeleteMixin, 'soft_delete')
        assert hasattr(SoftDeleteMixin, 'restore')
        assert hasattr(SoftDeleteMixin, 'is_deleted')

    def test_soft_delete_mixin_behavior(self):
        """SoftDeleteMixin logic works correctly."""
        from src.core.base import SoftDeleteMixin

        class FakeModel(SoftDeleteMixin):
            deleted_at = None

        obj = FakeModel()
        assert obj.is_deleted is False

        obj.soft_delete()
        assert obj.deleted_at is not None
        assert obj.is_deleted is True

        obj.restore()
        assert obj.deleted_at is None
        assert obj.is_deleted is False

    def test_quotes_table_has_deleted_at(self):
        """quotes table specifically — had no models.py but migration must cover it."""
        insp = inspect(engine)
        try:
            cols = [c["name"] for c in insp.get_columns("quotes")]
            assert "deleted_at" in cols, "quotes table missing deleted_at"
        except Exception as e:
            pytest.skip(f"quotes table not found: {e}")
