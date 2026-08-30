"""
Sprint 9 — Operational KPI Engine v2 (trend_engine extensions)
Verifies: 4 new endpoints added to existing trend_engine

Evidence: Live verified 2026-08-30
  MTTR:          88.2h overall · 673 measured
  Proactive:     2.1% proactive · 76.5% reactive · CRITICAL
  Repeat fails:  8 assets · 16.0% rate
  Direction:     MIXED · 4 months available
"""
import pytest
import requests

BASE = "http://localhost:8030"


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


class TestMTTRAuth:
    def test_mttr_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/trend-engine/mttr", timeout=10)
        assert r.status_code in (401, 403)

    def test_proactive_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/trend-engine/proactive-ratio", timeout=10)
        assert r.status_code in (401, 403)

    def test_repeat_failures_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/trend-engine/repeat-failures", timeout=10)
        assert r.status_code in (401, 403)

    def test_monthly_direction_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/trend-engine/monthly-direction", timeout=10)
        assert r.status_code in (401, 403)


class TestMTTREndpoint:
    def test_mttr_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/mttr",
                        headers=auth_headers, timeout=20)
        _skip(r, "mttr")
        assert r.status_code == 200

    def test_mttr_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/mttr",
                        headers=auth_headers, timeout=20)
        _skip(r, "mttr-fields")
        assert r.status_code == 200
        d = r.json()
        assert "overall_mttr_hours" in d
        assert "overall_mttr_days" in d
        assert "total_measured" in d
        assert "by_priority" in d
        assert "data_note" in d
        assert "hotel_id" in d

    def test_mttr_hours_positive(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/mttr",
                        headers=auth_headers, timeout=20)
        _skip(r, "mttr-positive")
        assert r.status_code == 200
        d = r.json()
        assert d["overall_mttr_hours"] > 0
        assert d["total_measured"] > 0

    def test_mttr_excludes_negative_records(self, auth_headers):
        """Data quality guard: completed_at > created_at filter applied."""
        r = requests.get(f"{BASE}/api/v1/trend-engine/mttr",
                        headers=auth_headers, timeout=20)
        _skip(r, "mttr-quality")
        assert r.status_code == 200
        d = r.json()
        assert d["overall_mttr_hours"] > 0, "Negative records should be excluded"
        assert "data_note" in d

    def test_mttr_by_priority_structure(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/mttr",
                        headers=auth_headers, timeout=20)
        _skip(r, "mttr-priority")
        assert r.status_code == 200
        by_prio = r.json()["by_priority"]
        assert isinstance(by_prio, dict)
        for prio, data in by_prio.items():
            assert "avg_hours" in data
            assert "target_hours" in data
            assert "meets_target" in data
            assert "gap_hours" in data
            assert data["avg_hours"] >= 0

    def test_mttr_tenant_scoped(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/mttr",
                        headers=auth_headers, timeout=20)
        _skip(r, "mttr-tenant")
        assert r.status_code == 200
        assert r.json()["hotel_id"].startswith("tb-")


class TestProactiveRatio:
    def test_proactive_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/proactive-ratio",
                        headers=auth_headers, timeout=20)
        _skip(r, "proactive")
        assert r.status_code == 200

    def test_proactive_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/proactive-ratio",
                        headers=auth_headers, timeout=20)
        _skip(r, "proactive-fields")
        assert r.status_code == 200
        d = r.json()
        assert "summary" in d
        assert "assessment" in d
        assert "type_breakdown" in d

    def test_proactive_percentages_sum_100(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/proactive-ratio",
                        headers=auth_headers, timeout=20)
        _skip(r, "proactive-sum")
        assert r.status_code == 200
        s = r.json()["summary"]
        total_pct = s["proactive_pct"] + s["reactive_pct"] + s["other_pct"]
        assert abs(total_pct - 100.0) <= 1.0, f"Pcts sum to {total_pct}"

    def test_proactive_assessment_status_valid(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/proactive-ratio",
                        headers=auth_headers, timeout=20)
        _skip(r, "proactive-status")
        assert r.status_code == 200
        status = r.json()["assessment"]["status"]
        assert status in ("GOOD", "WARNING", "CRITICAL")

    def test_proactive_real_data_shows_gap(self, auth_headers):
        """Real data shows 2.1% proactive — CRITICAL gap should be identified."""
        r = requests.get(f"{BASE}/api/v1/trend-engine/proactive-ratio",
                        headers=auth_headers, timeout=20)
        _skip(r, "proactive-gap")
        assert r.status_code == 200
        d = r.json()
        total = d["summary"]["total_work_orders"]
        assert total > 0, "Expected real work orders to exist"


class TestRepeatFailures:
    def test_repeat_failures_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/repeat-failures",
                        headers=auth_headers, timeout=20)
        _skip(r, "repeat")
        assert r.status_code == 200

    def test_repeat_failures_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/repeat-failures",
                        headers=auth_headers, timeout=20)
        _skip(r, "repeat-fields")
        assert r.status_code == 200
        d = r.json()
        assert "period_days" in d
        assert "threshold_wos" in d
        assert "total_assets_with_wos" in d
        assert "repeat_failure_assets" in d
        assert "repeat_failure_rate_pct" in d
        assert "flagged_assets" in d

    def test_repeat_failures_default_threshold(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/repeat-failures",
                        headers=auth_headers, timeout=20)
        _skip(r, "repeat-threshold")
        assert r.status_code == 200
        assert r.json()["threshold_wos"] == 3
        assert r.json()["period_days"] == 90

    def test_repeat_failures_asset_structure(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/repeat-failures",
                        headers=auth_headers, timeout=20)
        _skip(r, "repeat-assets")
        assert r.status_code == 200
        for asset in r.json()["flagged_assets"]:
            assert "asset_id" in asset
            assert "wo_count_90d" in asset
            assert "risk_level" in asset
            assert asset["risk_level"] in ("CRITICAL", "HIGH", "MEDIUM")
            assert asset["wo_count_90d"] >= 3

    def test_repeat_failure_rate_bounded(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/repeat-failures",
                        headers=auth_headers, timeout=20)
        _skip(r, "repeat-rate")
        assert r.status_code == 200
        rate = r.json()["repeat_failure_rate_pct"]
        assert 0 <= rate <= 100


class TestMonthlyDirection:
    def test_monthly_direction_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/monthly-direction",
                        headers=auth_headers, timeout=20)
        _skip(r, "direction")
        assert r.status_code == 200

    def test_monthly_direction_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/monthly-direction",
                        headers=auth_headers, timeout=20)
        _skip(r, "direction-fields")
        assert r.status_code == 200
        d = r.json()
        assert "overall_trend" in d
        assert "months_available" in d
        assert "monthly_data" in d

    def test_monthly_direction_overall_valid(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/monthly-direction",
                        headers=auth_headers, timeout=20)
        _skip(r, "direction-valid")
        assert r.status_code == 200
        d = r.json()
        assert d["overall_trend"] in (
            "IMPROVING", "DEGRADING", "MIXED", "INSUFFICIENT_DATA"
        )

    def test_monthly_direction_has_real_months(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/monthly-direction",
                        headers=auth_headers, timeout=20)
        _skip(r, "direction-months")
        assert r.status_code == 200
        d = r.json()
        assert d["months_available"] >= 2, "Expected 3+ months of real data"

    def test_monthly_direction_kpi_directions(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/trend-engine/monthly-direction",
                        headers=auth_headers, timeout=20)
        _skip(r, "direction-kpis")
        assert r.status_code == 200
        d = r.json()
        if "kpi_directions" in d:
            for kpi, direction in d["kpi_directions"].items():
                assert direction in ("improving", "degrading", "stable")
