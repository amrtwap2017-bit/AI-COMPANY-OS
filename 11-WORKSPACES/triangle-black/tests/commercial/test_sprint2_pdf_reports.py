"""
Sprint 2 — PDF Report Export Tests
Verifies: JSON summary + PDF download

Evidence: Live verified 2026-08-29
  operational-summary: 200 · health=50
  operational-summary/pdf: 200 · 5,201B · %PDF valid
"""
import pytest
import requests

BASE = "http://localhost:8030"


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


class TestReportAuth:
    def test_json_summary_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary", timeout=10)
        assert r.status_code in (401, 403)

    def test_pdf_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary/pdf", timeout=10)
        assert r.status_code in (401, 403)


class TestJSONSummary:
    def test_summary_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary",
                        headers=auth_headers, timeout=15)
        _skip(r, "summary")
        assert r.status_code == 200

    def test_summary_has_health_score(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary",
                        headers=auth_headers, timeout=15)
        _skip(r, "health")
        assert r.status_code == 200
        d = r.json()
        assert "health_score" in d
        assert 0 <= d["health_score"] <= 100
        assert d["health_grade"] in ("EXCELLENT","GOOD","WARNING","CRITICAL")

    def test_summary_has_all_sections(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary",
                        headers=auth_headers, timeout=15)
        _skip(r, "sections")
        assert r.status_code == 200
        d = r.json()
        assert "sections" in d
        sections = d["sections"]
        assert "maintenance" in sections
        assert "procurement" in sections
        assert "assets" in sections
        assert "recommendations" in sections

    def test_summary_maintenance_kpis(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary",
                        headers=auth_headers, timeout=15)
        _skip(r, "maint-kpis")
        assert r.status_code == 200
        m = r.json()["sections"]["maintenance"]
        assert "wo_completion_rate_pct" in m
        assert "pm_compliance_rate_pct" in m
        assert 0 <= m["wo_completion_rate_pct"] <= 100
        assert 0 <= m["pm_compliance_rate_pct"] <= 100

    def test_summary_procurement_kpis(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary",
                        headers=auth_headers, timeout=15)
        _skip(r, "proc-kpis")
        assert r.status_code == 200
        p = r.json()["sections"]["procurement"]
        assert "total_spend_egp" in p
        assert "cost_avoidance_potential_egp" in p
        assert p["cost_avoidance_potential_egp"] >= 0

    def test_summary_has_recommendation(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary",
                        headers=auth_headers, timeout=15)
        _skip(r, "rec")
        assert r.status_code == 200
        d = r.json()
        assert "recommendation" in d
        assert len(d["recommendation"]) > 20

    def test_summary_tenant_scoped(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary",
                        headers=auth_headers, timeout=15)
        _skip(r, "tenant")
        assert r.status_code == 200
        assert r.json()["hotel_id"].startswith("tb-")

    def test_summary_has_generated_at(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary",
                        headers=auth_headers, timeout=15)
        _skip(r, "ts")
        assert r.status_code == 200
        assert "generated_at" in r.json()
        assert "2026" in r.json()["generated_at"]


class TestPDFDownload:
    def test_pdf_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary/pdf",
                        headers=auth_headers, timeout=30)
        _skip(r, "pdf")
        assert r.status_code == 200

    def test_pdf_content_type(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary/pdf",
                        headers=auth_headers, timeout=30)
        _skip(r, "pdf-ct")
        assert r.status_code == 200
        assert "application/pdf" in r.headers.get("Content-Type", "")

    def test_pdf_is_valid_pdf_bytes(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary/pdf",
                        headers=auth_headers, timeout=30)
        _skip(r, "pdf-valid")
        assert r.status_code == 200
        # Valid PDF starts with %PDF
        assert r.content[:4] == b"%PDF", \
            f"Not a valid PDF — starts with: {r.content[:4]}"

    def test_pdf_reasonable_size(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary/pdf",
                        headers=auth_headers, timeout=30)
        _skip(r, "pdf-size")
        assert r.status_code == 200
        size_kb = len(r.content) / 1024
        assert size_kb >= 1, f"PDF too small: {size_kb:.1f} KB"
        assert size_kb < 5000, f"PDF too large: {size_kb:.1f} KB"

    def test_pdf_has_content_disposition(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary/pdf",
                        headers=auth_headers, timeout=30)
        _skip(r, "pdf-cd")
        assert r.status_code == 200
        cd = r.headers.get("Content-Disposition", "")
        assert "attachment" in cd
        assert ".pdf" in cd

    def test_pdf_filename_contains_date(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/reports/operational-summary/pdf",
                        headers=auth_headers, timeout=30)
        _skip(r, "pdf-date")
        assert r.status_code == 200
        cd = r.headers.get("Content-Disposition", "")
        assert "2026" in cd, f"Date not in filename: {cd}"
