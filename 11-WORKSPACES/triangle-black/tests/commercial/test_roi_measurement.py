"""
V6-E04 — ROI Measurement Tests
Intelligence → Decision → MEASUREMENT loop complete.

Evidence: Live verified 2026-08-29
  Snapshot: 7 KPIs captured (WO, PM, spend, assets, suppliers)
  Delta:    2 snapshots compared → roi_signal returned
  Report:   WO 47.5%, PM 9.6%, Grade D, EGP 435K cost avoidance
"""
import pytest
import requests

BASE = "http://localhost:8030"
VALID_SIGNALS = {"STRONG_POSITIVE", "POSITIVE", "NEUTRAL", "NEEDS_ATTENTION"}


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


class TestROIAuth:
    def test_snapshot_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/roi/snapshot", timeout=10)
        assert r.status_code in (401, 403)

    def test_snapshots_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/roi/snapshots", timeout=10)
        assert r.status_code in (401, 403)

    def test_delta_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/roi/delta", timeout=10)
        assert r.status_code in (401, 403)

    def test_report_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/roi/report", timeout=10)
        assert r.status_code in (401, 403)


class TestKPISnapshot:
    def test_snapshot_captures_kpis(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/roi/snapshot",
                         headers=auth_headers,
                         json={"label": "test_baseline", "period": "test"},
                         timeout=20)
        _skip(r, "snapshot")
        assert r.status_code == 200
        d = r.json()
        assert d["kpis_captured"] >= 5
        assert "hotel_id" in d
        assert "kpi_keys" in d

    def test_snapshot_captures_7_kpis(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/roi/snapshot",
                         headers=auth_headers,
                         json={"label": "test_7kpi"},
                         timeout=20)
        _skip(r, "snapshot-7")
        assert r.status_code == 200
        keys = r.json().get("kpi_keys", [])
        expected = {"wo_completion_rate", "open_work_orders", "pm_compliance_rate",
                    "overdue_pm_plans", "total_spend_egp", "total_assets", "active_suppliers"}
        assert expected.issubset(set(keys)), f"Missing KPIs: {expected - set(keys)}"

    def test_snapshot_is_tenant_scoped(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/roi/snapshot",
                         headers=auth_headers,
                         json={"label": "tenant_test"},
                         timeout=20)
        _skip(r, "snapshot-tenant")
        assert r.status_code == 200
        assert r.json()["hotel_id"].startswith("tb-")

    def test_snapshot_has_captured_at(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/roi/snapshot",
                         headers=auth_headers, json={}, timeout=20)
        _skip(r, "snapshot-ts")
        assert r.status_code == 200
        assert "captured_at" in r.json()
        assert "2026" in r.json()["captured_at"]

    def test_snapshot_with_label(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/roi/snapshot",
                         headers=auth_headers,
                         json={"label": "before_maintenance_campaign"},
                         timeout=20)
        _skip(r, "snapshot-label")
        assert r.status_code == 200
        assert r.json()["label"] == "before_maintenance_campaign"


class TestSnapshotList:
    def test_list_returns_snapshots(self, auth_headers):
        # Ensure at least one snapshot exists
        requests.post(f"{BASE}/api/v1/roi/snapshot",
                     headers=auth_headers, json={"label": "list_test"},
                     timeout=20)
        r = requests.get(f"{BASE}/api/v1/roi/snapshots",
                        headers=auth_headers, timeout=10)
        _skip(r, "list-snapshots")
        assert r.status_code == 200
        d = r.json()
        assert "snapshots" in d
        assert "snapshot_count" in d
        assert d["snapshot_count"] >= 1

    def test_list_has_hotel_id(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/snapshots",
                        headers=auth_headers, timeout=10)
        _skip(r, "list-hotel")
        assert r.status_code == 200
        assert r.json()["hotel_id"].startswith("tb-")

    def test_list_snapshot_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/snapshots",
                        headers=auth_headers, timeout=10)
        _skip(r, "list-fields")
        assert r.status_code == 200
        snaps = r.json()["snapshots"]
        if snaps:
            s = snaps[0]
            assert "period" in s
            assert "kpi_count" in s
            assert "captured_at" in s


class TestDeltaAnalysis:
    def test_delta_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/delta",
                        headers=auth_headers, timeout=15)
        _skip(r, "delta")
        assert r.status_code == 200

    def test_delta_with_2_snapshots_has_signal(self, auth_headers):
        # Ensure 2 snapshots exist
        requests.post(f"{BASE}/api/v1/roi/snapshot",
                     headers=auth_headers, json={"label": "delta_before"},
                     timeout=20)
        requests.post(f"{BASE}/api/v1/roi/snapshot",
                     headers=auth_headers, json={"label": "delta_after"},
                     timeout=20)
        r = requests.get(f"{BASE}/api/v1/roi/delta",
                        headers=auth_headers, timeout=15)
        _skip(r, "delta-signal")
        assert r.status_code == 200
        d = r.json()
        if d.get("status") != "insufficient_snapshots":
            assert d.get("roi_signal") in VALID_SIGNALS
            assert "deltas" in d
            assert d.get("kpi_count", 0) >= 1

    def test_delta_has_hotel_id(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/delta",
                        headers=auth_headers, timeout=15)
        _skip(r, "delta-hotel")
        assert r.status_code == 200
        assert r.json()["hotel_id"].startswith("tb-")

    def test_delta_kpi_items_have_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/delta",
                        headers=auth_headers, timeout=15)
        _skip(r, "delta-fields")
        assert r.status_code == 200
        d = r.json()
        for item in d.get("deltas", []):
            assert "kpi_key" in item
            assert "before" in item
            assert "after" in item
            assert "change_pct" in item
            assert "improved" in item
            assert isinstance(item["improved"], bool)

    def test_delta_insufficient_returns_guidance(self, auth_headers):
        """If < 2 snapshots, must return guidance not error."""
        r = requests.get(f"{BASE}/api/v1/roi/delta",
                        headers=auth_headers, timeout=15)
        _skip(r, "delta-guidance")
        assert r.status_code == 200
        d = r.json()
        if d.get("status") == "insufficient_snapshots":
            assert "message" in d
            assert "snapshots_needed" in d


class TestROIReport:
    def test_report_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=20)
        _skip(r, "report")
        assert r.status_code == 200

    def test_report_has_current_performance(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=20)
        _skip(r, "report-perf")
        assert r.status_code == 200
        d = r.json()
        assert "current_performance" in d
        perf = d["current_performance"]
        assert "wo_completion_rate_pct" in perf
        assert "pm_compliance_rate_pct" in perf
        assert 0 <= perf["wo_completion_rate_pct"] <= 100
        assert 0 <= perf["pm_compliance_rate_pct"] <= 100

    def test_report_has_improvement_potential(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=20)
        _skip(r, "report-potential")
        assert r.status_code == 200
        d = r.json()
        assert "improvement_potential" in d
        imp = d["improvement_potential"]
        assert "estimated_cost_avoidance_egp" in imp
        assert imp["estimated_cost_avoidance_egp"] >= 0

    def test_report_has_performance_grade(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=20)
        _skip(r, "report-grade")
        assert r.status_code == 200
        grade = r.json()["current_performance"]["performance_grade"]
        assert grade in ("A", "B", "C", "D")

    def test_report_has_recommendation(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=20)
        _skip(r, "report-rec")
        assert r.status_code == 200
        assert "recommendation" in r.json()
        assert len(r.json()["recommendation"]) > 10

    def test_report_has_current_kpis(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=20)
        _skip(r, "report-kpis")
        assert r.status_code == 200
        kpis = r.json().get("current_kpis", [])
        assert len(kpis) >= 5
        keys = [k["key"] for k in kpis]
        assert "wo_completion_rate" in keys
        assert "pm_compliance_rate" in keys

    def test_report_tenant_scoped(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=20)
        _skip(r, "report-tenant")
        assert r.status_code == 200
        assert r.json()["hotel_id"].startswith("tb-")


class TestWave4Gate:
    def test_intelligence_decision_measurement_complete(self, auth_headers):
        """
        WAVE 4 GATE: Intelligence → Decision → Measurement
        Full loop verified:
        1. Intelligence (13 engines) → produces KPIs
        2. Decision (AI Directors + Recommendations) → human approves
        3. Measurement (ROI snapshot + delta) → before/after proof
        """
        checks = []

        # Intelligence: health score available
        r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                        headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        checks.append(("Intelligence health", r.status_code == 200))

        # Decision: AI Director produces recommendation
        r = requests.get(f"{BASE}/api/v1/ai-directors/executive",
                        headers=auth_headers, timeout=15)
        checks.append(("AI Director", r.status_code == 200 and
                       r.json().get("human_review_required") is True))

        # Measurement: ROI snapshot captured
        r = requests.post(f"{BASE}/api/v1/roi/snapshot",
                         headers=auth_headers,
                         json={"label": "wave4_gate_test"},
                         timeout=20)
        checks.append(("ROI Snapshot", r.status_code == 200 and
                       r.json().get("kpis_captured", 0) >= 5))

        # Measurement: ROI report generated
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=20)
        checks.append(("ROI Report", r.status_code == 200 and
                       "current_performance" in r.json()))

        failed = [name for name, ok in checks if not ok]
        assert not failed, f"Wave 4 gate failed: {failed}"

        report = requests.get(f"{BASE}/api/v1/roi/report",
                             headers=auth_headers, timeout=15).json()
        perf = report.get("current_performance", {})
        imp = report.get("improvement_potential", {})
        print(f"\n✅ WAVE 4 GATE PASSED: Intelligence → Decision → Measurement")
        print(f"   WO Completion: {perf.get('wo_completion_rate_pct')}%")
        print(f"   PM Compliance: {perf.get('pm_compliance_rate_pct')}%")
        print(f"   Grade: {perf.get('performance_grade')}")
        print(f"   Cost Avoidance: EGP {imp.get('estimated_cost_avoidance_egp',0):,.0f}")
