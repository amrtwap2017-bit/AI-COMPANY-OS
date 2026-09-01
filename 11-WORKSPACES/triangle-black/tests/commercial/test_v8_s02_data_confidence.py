"""V8-S02 — Data Confidence Display Tests"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

INTELLIGENCE_ENDPOINTS = [
    "/api/v1/roi/report",
    "/api/v1/data-quality/confidence-report",
]

class TestConfidenceModule:
    def test_confidence_calculation_high(self):
        from src.core.intelligence_confidence import calculate_confidence
        level, pct = calculate_confidence(record_count=500, total_possible=600)
        assert level == "HIGH"
        assert pct >= 80

    def test_confidence_calculation_low(self):
        from src.core.intelligence_confidence import calculate_confidence
        level, pct = calculate_confidence(record_count=10, total_possible=1804)
        assert level in ("LOW", "VERY_LOW")

    def test_add_confidence_wrapper(self):
        from src.core.intelligence_confidence import add_confidence
        data = {"mttr": 88.2}
        result = add_confidence(data, record_count=139, total_possible=1804, metric_name="MTTR")
        assert "_intelligence_confidence" in result
        assert result["_intelligence_confidence"]["level"] in ("LOW", "VERY_LOW", "MEDIUM", "HIGH")
        assert "coverage_pct" in result["_intelligence_confidence"]

    def test_roi_report_has_defensibility(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/roi/report", headers=auth_headers, timeout=15)
        _skip(r, "roi")
        assert r.status_code == 200
        assert "defensibility" in r.json()
        assert r.json()["defensibility"]["confidence"] in ("LOW", "MEDIUM", "HIGH", "VERY_LOW")
