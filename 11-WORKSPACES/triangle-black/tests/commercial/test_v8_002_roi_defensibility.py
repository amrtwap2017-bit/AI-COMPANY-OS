"""
V8-002 — ROI Report Defensibility Tests
The ROI report must be defensible to a skeptical CFO/COO.

Every financial claim must have:
  - formula (how was it calculated)
  - assumptions (what benchmarks were used)
  - confidence (is this reliable?)
  - source_data (which records)
  - disclaimer (this is an estimate)
"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

class TestROIDefensibility:
    def test_roi_report_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/roi/report", timeout=5)
        assert r.status_code in (401, 403)

    def test_roi_report_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=15)
        _skip(r, "roi")
        assert r.status_code == 200

    def test_roi_has_defensibility_section(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=15)
        _skip(r, "defensibility")
        assert r.status_code == 200
        assert "defensibility" in r.json(), \
            "ROI report must have 'defensibility' section — V8-002"

    def test_defensibility_has_formula(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=15)
        _skip(r, "formula")
        d = r.json().get("defensibility", {})
        assert "formula" in d, "ROI must document its formula"
        assert len(d["formula"]) > 10

    def test_defensibility_has_assumptions(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=15)
        _skip(r, "assumptions")
        d = r.json().get("defensibility", {})
        assert "assumptions" in d
        assert isinstance(d["assumptions"], list)
        assert len(d["assumptions"]) >= 3, "Must state at least 3 assumptions"

    def test_defensibility_has_confidence(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=15)
        _skip(r, "confidence")
        d = r.json().get("defensibility", {})
        assert "confidence" in d
        assert d["confidence"] in ("HIGH", "MEDIUM", "LOW", "VERY_LOW")

    def test_confidence_is_low_or_very_low(self, auth_headers):
        """Cost avoidance is an estimate — must be rated LOW or VERY_LOW."""
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=15)
        _skip(r, "conf-level")
        d = r.json().get("defensibility", {})
        assert d.get("confidence") in ("LOW", "VERY_LOW"), \
            f"Cost avoidance estimate must be LOW/VERY_LOW confidence, got {d.get('confidence')}"

    def test_defensibility_has_source_data(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=15)
        _skip(r, "source")
        d = r.json().get("defensibility", {})
        assert "source_data" in d
        sd = d["source_data"]
        assert "hotel_id" in sd

    def test_defensibility_has_disclaimer(self, auth_headers):
        """ROI must clearly state it is an estimate, not a guarantee."""
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=15)
        _skip(r, "disclaimer")
        d = r.json().get("defensibility", {})
        assert "important_disclaimer" in d
        disclaimer = d["important_disclaimer"].lower()
        assert "potential" in disclaimer or "estimate" in disclaimer, \
            "Disclaimer must use 'potential' or 'estimate' language"
        assert "guarantee" in disclaimer or "actual" in disclaimer, \
            "Disclaimer must clarify this is not a guarantee"

    def test_existing_roi_fields_preserved(self, auth_headers):
        """Defensibility addition must not break existing report structure."""
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=15)
        _skip(r, "preserved")
        roi = r.json()
        assert "current_performance" in roi
        assert "improvement_potential" in roi
        assert "hotel_id" in roi
        assert "report_type" in roi

    def test_improvement_potential_still_has_avoidance_egp(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=15)
        _skip(r, "avoidance")
        ip = r.json().get("improvement_potential", {})
        assert "estimated_cost_avoidance_egp" in ip
        assert ip["estimated_cost_avoidance_egp"] > 0

    def test_how_to_improve_confidence_present(self, auth_headers):
        """Customer must know how to get more reliable numbers."""
        r = requests.get(f"{BASE}/api/v1/roi/report",
                        headers=auth_headers, timeout=15)
        _skip(r, "improve")
        d = r.json().get("defensibility", {})
        assert "how_to_improve_confidence" in d
        assert len(d["how_to_improve_confidence"]) >= 2
