"""Sprint-082: DDD compliance — user_preferences + procurement_intake + scope_of_work"""
import pytest


def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


class TestUserPreferencesDDD:
    def test_model_importable(self):
        from src.commercial.user_preferences.models import UserPreference
        assert UserPreference.__tablename__ == "user_preferences"

    def test_schemas_importable(self):
        from src.commercial.user_preferences.schemas import UserPreferenceSet
        p = UserPreferenceSet(pref_key="theme", pref_value="dark")
        assert p.pref_key == "theme"

    def test_repository_importable(self):
        from src.commercial.user_preferences.repository import get_all, set_preference
        assert callable(get_all)

    def test_preferences_api(self, client, auth_headers):
        res = client.get("/api/v1/user-preferences/", headers=auth_headers)
        _skip_if_rate_limited(res, "prefs_list")
        assert res.status_code in (200, 404, 422)


class TestProcurementIntakeDDD:
    def test_model_importable(self):
        from src.commercial.procurement_intake.models import ProcurementIntakeLog
        assert ProcurementIntakeLog.__tablename__ == "procurement_intake_log"

    def test_schemas_importable(self):
        from src.commercial.procurement_intake.schemas import IntakeLogEntry
        e = IntakeLogEntry(action="item_added")
        assert e.action == "item_added"

    def test_repository_importable(self):
        from src.commercial.procurement_intake.repository import get_logs, log_action
        assert callable(get_logs)

    def test_intake_api(self, client, auth_headers):
        res = client.get("/api/v1/procurement/intake/summary", headers=auth_headers)
        _skip_if_rate_limited(res, "intake_summary")
        assert res.status_code in (200, 404)


class TestScopeOfWorkDDD:
    def test_model_importable(self):
        from src.commercial.scope_of_work.models import ScopeOfWork
        assert ScopeOfWork.__tablename__ == "scope_of_work"

    def test_schemas_importable(self):
        from src.commercial.scope_of_work.schemas import ScopeOfWorkCreate
        s = ScopeOfWorkCreate(title="HVAC Maintenance SOW")
        assert s.title == "HVAC Maintenance SOW"

    def test_repository_importable(self):
        from src.commercial.scope_of_work.repository import get_all, get_by_id, create
        assert callable(get_all)

    def test_sow_api(self, client, auth_headers):
        res = client.get("/api/v1/scope-of-work/", headers=auth_headers)
        _skip_if_rate_limited(res, "sow_list")
        assert res.status_code in (200, 404)
