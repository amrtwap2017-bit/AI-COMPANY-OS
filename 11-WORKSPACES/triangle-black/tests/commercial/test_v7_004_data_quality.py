"""
V7-004 — Data Quality 2.0 — Confidence Engine Tests

Verifies: GET /data-quality/confidence-report
Every KPI must expose: value, confidence, coverage, source, gaps, formula

Evidence: Live DB
WO→Asset linkage: 8.2% (VERY_LOW confidence — known critical gap)
PM Compliance: 73.4% (MEDIUM confidence)
Outcome tracking: 2.0% (VERY_LOW confidence)
"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

class TestConfidenceReportAuth:
    def test_confidence_report_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/data-quality/confidence-report", timeout=10)
        assert r.status_code in (401, 403), "Confidence report must require auth"

class TestConfidenceReportStructure:
    def test_confidence_report_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/data-quality/confidence-report",
                        headers=auth_headers, timeout=20)
        _skip(r, "confidence-report")
        assert r.status_code == 200

    def test_confidence_report_top_level_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/data-quality/confidence-report",
                        headers=auth_headers, timeout=20)
        _skip(r, "top-level")
        assert r.status_code == 200
        d = r.json()
        assert "hotel_id" in d
        assert "overall_data_trust_score" in d
        assert "overall_confidence" in d
        assert "kpi_count" in d
        assert "by_confidence" in d
        assert "critical_gaps" in d
        assert "kpis" in d
        assert "platform_data_note" in d

    def test_confidence_report_has_kpis(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/data-quality/confidence-report",
                        headers=auth_headers, timeout=20)
        _skip(r, "kpis")
        assert r.status_code == 200
        kpis = r.json()["kpis"]
        assert len(kpis) >= 4, "Expected at least 4 KPIs"

    def test_each_kpi_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/data-quality/confidence-report",
                        headers=auth_headers, timeout=20)
        _skip(r, "kpi-fields")
        assert r.status_code == 200
        for kpi in r.json()["kpis"]:
            assert "kpi_id" in kpi, f"Missing kpi_id: {kpi}"
            assert "label" in kpi
            assert "confidence" in kpi
            assert "confidence_reason" in kpi
            assert "coverage_pct" in kpi
            assert "records_used" in kpi
            assert "records_available" in kpi
            assert "missing_data" in kpi
            assert "formula" in kpi
            assert "source_tables" in kpi
            assert "recommendation" in kpi

    def test_confidence_levels_valid(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/data-quality/confidence-report",
                        headers=auth_headers, timeout=20)
        _skip(r, "conf-levels")
        assert r.status_code == 200
        valid = {"HIGH", "MEDIUM", "LOW", "VERY_LOW", "UNKNOWN"}
        for kpi in r.json()["kpis"]:
            assert kpi["confidence"] in valid, \
                f"Invalid confidence '{kpi['confidence']}' for {kpi['kpi_id']}"

    def test_coverage_pct_bounded(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/data-quality/confidence-report",
                        headers=auth_headers, timeout=20)
        _skip(r, "coverage-bounded")
        assert r.status_code == 200
        for kpi in r.json()["kpis"]:
            assert 0 <= kpi["coverage_pct"] <= 100, \
                f"{kpi['kpi_id']} coverage {kpi['coverage_pct']} out of bounds"

    def test_records_used_le_available(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/data-quality/confidence-report",
                        headers=auth_headers, timeout=20)
        _skip(r, "records-ratio")
        assert r.status_code == 200
        for kpi in r.json()["kpis"]:
            assert kpi["records_used"] <= kpi["records_available"], \
                f"{kpi['kpi_id']}: used > available"

    def test_tenant_scoped(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/data-quality/confidence-report",
                        headers=auth_headers, timeout=20)
        _skip(r, "tenant")
        assert r.status_code == 200
        assert r.json()["hotel_id"].startswith("tb-")

class TestKnownDataGaps:
    """Real data gaps must be surfaced, not hidden."""

    def test_wo_asset_linkage_identified(self, auth_headers):
        """WO→Asset linkage 8.2% must be identified as LOW/VERY_LOW confidence."""
        r = requests.get(f"{BASE}/api/v1/data-quality/confidence-report",
                        headers=auth_headers, timeout=20)
        _skip(r, "wo-gap")
        assert r.status_code == 200
        kpis = {k["kpi_id"]: k for k in r.json()["kpis"]}
        assert "wo_asset_linkage" in kpis, "WO-asset linkage KPI must exist"
        wo = kpis["wo_asset_linkage"]
        assert wo["coverage_pct"] < 50, \
            f"WO linkage {wo['coverage_pct']}% should be < 50% based on real data"
        assert wo["confidence"] in ("LOW", "VERY_LOW"), \
            f"Low WO linkage must have LOW/VERY_LOW confidence, got {wo['confidence']}"

    def test_mttr_low_confidence_disclosed(self, auth_headers):
        """MTTR confidence must reflect limited WO-asset data."""
        r = requests.get(f"{BASE}/api/v1/data-quality/confidence-report",
                        headers=auth_headers, timeout=20)
        _skip(r, "mttr-conf")
        assert r.status_code == 200
        kpis = {k["kpi_id"]: k for k in r.json()["kpis"]}
        assert "mttr" in kpis
        mttr = kpis["mttr"]
        assert mttr["records_available"] > 0
        # MTTR is limited — should not be HIGH confidence given 8.2% linkage
        assert mttr["confidence"] in ("LOW", "VERY_LOW", "MEDIUM"), \
            "MTTR must not claim HIGH confidence given 8.2% WO-asset linkage"

    def test_pm_compliance_has_formula(self, auth_headers):
        """PM compliance must document its formula."""
        r = requests.get(f"{BASE}/api/v1/data-quality/confidence-report",
                        headers=auth_headers, timeout=20)
        _skip(r, "pm-formula")
        assert r.status_code == 200
        kpis = {k["kpi_id"]: k for k in r.json()["kpis"]}
        assert "pm_compliance" in kpis
        pm = kpis["pm_compliance"]
        assert len(pm["formula"]) > 10, "PM compliance must document its formula"
        assert pm["records_available"] > 0

    def test_critical_gaps_disclosed(self, auth_headers):
        """Platform must disclose critical data gaps."""
        r = requests.get(f"{BASE}/api/v1/data-quality/confidence-report",
                        headers=auth_headers, timeout=20)
        _skip(r, "critical-gaps")
        assert r.status_code == 200
        d = r.json()
        # WO linkage at 8.2% means there should be at least 1 critical gap
        assert d["critical_gaps"] >= 1, \
            "Expected at least 1 critical gap (WO-asset linkage at 8.2%)"

    def test_platform_data_note_present(self, auth_headers):
        """Platform must include transparency note about data limitations."""
        r = requests.get(f"{BASE}/api/v1/data-quality/confidence-report",
                        headers=auth_headers, timeout=20)
        _skip(r, "data-note")
        assert r.status_code == 200
        note = r.json()["platform_data_note"]
        assert len(note) > 20, "Platform data note must be substantive"

class TestExistingEndpointsPreserved:
    """Existing data quality endpoints must still work."""

    def test_score_endpoint_preserved(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/data-quality/score",
                        headers=auth_headers, timeout=20)
        _skip(r, "score-preserved")
        assert r.status_code == 200

    def test_report_endpoint_preserved(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/data-quality/report",
                        headers=auth_headers, timeout=20)
        _skip(r, "report-preserved")
        assert r.status_code == 200
