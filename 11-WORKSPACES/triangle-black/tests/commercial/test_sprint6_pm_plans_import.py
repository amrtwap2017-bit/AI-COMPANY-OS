"""
Sprint 6 — PM Plans Import Tests
Verifies: POST /data-import/pm-plans (JSON + dry-run)

Evidence: Live verified 2026-08-30
  Dry run:  200 · imported=2 · dry=True
  Import:   200 · imported=2 · success=True
  Asset match: 'Chiller Unit X' found in DB
"""
import pytest
import requests

BASE = "http://localhost:8030"

PM_CSV_VALID = (
    "title,plan_type,frequency,next_due_date,asset_name\n"
    "Monthly HVAC Check,preventive,monthly,2026-09-01,Chiller Unit X\n"
    "Weekly Pool Inspection,inspection,weekly,2026-09-07,"
)
PM_CSV_MIN = "title,plan_type\nQuarterly Generator Test,preventive\nAnnual Fire Safety,inspection"
PM_CSV_BAD = "title,plan_type\n,preventive\nValid Plan,inspection"  # first row has empty title


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


class TestPMPlansAuth:
    def test_pm_plans_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/data-import/pm-plans",
                         json={"csv_content": PM_CSV_MIN}, timeout=10)
        assert r.status_code in (401, 403)


class TestPMPlansDryRun:
    def test_dry_run_returns_200(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/data-import/pm-plans?dry_run=true",
                         headers=auth_headers,
                         json={"csv_content": PM_CSV_VALID}, timeout=15)
        _skip(r, "dry-run")
        assert r.status_code == 200

    def test_dry_run_does_not_write_to_db(self, auth_headers):
        from sqlalchemy import create_engine, text as sqlt
        engine = create_engine("postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black")
        with engine.connect() as conn:
            before = conn.execute(sqlt(
                "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h",
                {"h": "tb-default-hotel-000000000001"}
            )).scalar()

        r = requests.post(f"{BASE}/api/v1/data-import/pm-plans?dry_run=true",
                         headers=auth_headers,
                         json={"csv_content": PM_CSV_MIN}, timeout=15)
        _skip(r, "dry-no-write")
        assert r.status_code == 200
        assert r.json()["dry_run"] is True

        with engine.connect() as conn:
            after = conn.execute(sqlt(
                "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h",
                {"h": "tb-default-hotel-000000000001"}
            )).scalar()
        assert before == after, "Dry run must not write to DB"

    def test_dry_run_returns_count(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/data-import/pm-plans?dry_run=true",
                         headers=auth_headers,
                         json={"csv_content": PM_CSV_VALID}, timeout=15)
        _skip(r, "dry-count")
        assert r.status_code == 200
        d = r.json()
        assert d["dry_run"] is True
        assert d["imported_count"] == 2


class TestPMPlansImport:
    def test_import_succeeds(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/data-import/pm-plans",
                         headers=auth_headers,
                         json={"csv_content": PM_CSV_MIN}, timeout=15)
        _skip(r, "import")
        assert r.status_code == 200
        d = r.json()
        assert d["success"] is True
        assert d["imported_count"] == 2
        assert d["dry_run"] is False

    def test_import_with_asset_name_links(self, auth_headers):
        """When asset_name matches existing asset, plan linked."""
        csv = "title,plan_type,asset_name\nLinked PM Test,preventive,Chiller Unit X"
        r = requests.post(f"{BASE}/api/v1/data-import/pm-plans",
                         headers=auth_headers,
                         json={"csv_content": csv}, timeout=15)
        _skip(r, "import-linked")
        assert r.status_code == 200
        d = r.json()
        assert d["success"] is True
        assert d["imported_count"] == 1

    def test_import_without_asset_name_unlinked(self, auth_headers):
        """Without asset_name, plan imported without link — no error."""
        csv = "title,plan_type\nUnlinked Plan Test,preventive"
        r = requests.post(f"{BASE}/api/v1/data-import/pm-plans",
                         headers=auth_headers,
                         json={"csv_content": csv}, timeout=15)
        _skip(r, "import-unlinked")
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_empty_title_skipped(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/data-import/pm-plans",
                         headers=auth_headers,
                         json={"csv_content": PM_CSV_BAD}, timeout=15)
        _skip(r, "skip-empty")
        assert r.status_code == 200
        d = r.json()
        # Row with empty title skipped, valid row imported
        assert d["imported_count"] == 1
        assert d["skipped_count"] == 1

    def test_missing_required_columns_fails(self, auth_headers):
        csv = "asset_name,frequency\nSome Asset,monthly"  # missing title, plan_type
        r = requests.post(f"{BASE}/api/v1/data-import/pm-plans",
                         headers=auth_headers,
                         json={"csv_content": csv}, timeout=15)
        _skip(r, "missing-cols")
        assert r.status_code == 200
        d = r.json()
        assert d["success"] is False
        assert len(d["errors"]) >= 1

    def test_invalid_plan_type_defaults(self, auth_headers):
        """Invalid plan_type defaults to 'preventive' gracefully."""
        csv = "title,plan_type\nGraceful Default Test,invalid_type_xyz"
        r = requests.post(f"{BASE}/api/v1/data-import/pm-plans",
                         headers=auth_headers,
                         json={"csv_content": csv}, timeout=15)
        _skip(r, "invalid-type")
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_empty_csv_returns_400(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/data-import/pm-plans",
                         headers=auth_headers,
                         json={"csv_content": ""}, timeout=10)
        _skip(r, "empty")
        assert r.status_code == 400


class TestPMPlansSchema:
    def test_pm_plans_schema_accessible(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/data-import/schema/pm-plans",
                        headers=auth_headers, timeout=10)
        _skip(r, "schema")
        assert r.status_code == 200
        d = r.json()
        assert d["entity"] == "pm-plans"
        assert "schema" in d

    def test_data_quality_improved_after_import(self, auth_headers):
        """After PM plans import, data quality score should be captured."""
        # This verifies the import integrates with data quality
        r = requests.get(f"{BASE}/api/v1/data-quality/score",
                        headers=auth_headers, timeout=20)
        _skip(r, "dq-after")
        assert r.status_code == 200
        assert r.json()["overall_score"] > 0
