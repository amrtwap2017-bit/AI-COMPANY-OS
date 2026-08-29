"""
WAVE 6 — Commercial Readiness Gate Tests
Verifies: marketing presence, pilot toolkit, demo environment, CTA functionality.
"""
import pytest
import requests
from pathlib import Path

BASE = "http://localhost:8030"


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


class TestMarketingPages:
    def test_landing_page_exists(self):
        assert Path("portal/app/page.tsx").exists()
        text = Path("portal/app/page.tsx").read_text()
        assert len(text) > 100
        assert "use client" in text

    def test_landing_page_has_assessment_cta(self):
        text = Path("portal/app/page.tsx").read_text()
        assert any(kw in text.lower() for kw in
                  ["assessment", "request", "contact", "cta", "modal"]), \
            "Landing page must have assessment CTA"

    def test_solutions_page_exists(self):
        assert Path("portal/app/solutions/page.tsx").exists()

    def test_pricing_page_exists(self):
        assert Path("portal/app/pricing/page.tsx").exists()

    def test_how_it_works_page_exists(self):
        assert Path("portal/app/how-it-works/page.tsx").exists()

    def test_case_studies_page_exists(self):
        assert Path("portal/app/case-studies/page.tsx").exists()


class TestPilotToolkit:
    def test_pilot_program_doc_exists(self):
        doc = Path("docs/commercial/PILOT_PROGRAM.md")
        assert doc.exists(), "PILOT_PROGRAM.md must exist"
        content = doc.read_text()
        assert "30" in content and "Day" in content
        assert "ROI" in content
        assert "Deliverables" in content

    def test_pilot_doc_has_timeline(self):
        content = Path("docs/commercial/PILOT_PROGRAM.md").read_text()
        assert "Week 1" in content
        assert "Week 2" in content
        assert "Week 3" in content
        assert "Week 4" in content

    def test_pilot_doc_has_success_metrics(self):
        content = Path("docs/commercial/PILOT_PROGRAM.md").read_text()
        assert "Success Metrics" in content or "KPI" in content

    def test_customer_success_doc_exists(self):
        doc = Path("docs/commercial/CUSTOMER_SUCCESS.md")
        assert doc.exists()
        content = doc.read_text()
        assert "P0" in content
        assert "P1" in content


class TestDemoEnvironment:
    def test_demo_roi_summary_accessible(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/demo/roi-summary",
                        headers=auth_headers, timeout=10)
        _skip(r, "demo-roi")
        assert r.status_code == 200

    def test_baseline_report_accessible(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/baseline/report",
                        headers=auth_headers, timeout=10)
        _skip(r, "baseline-report")
        assert r.status_code == 200
        d = r.json()
        assert "hotel_id" in d
        assert "report_type" in d

    def test_intelligence_snapshot_accessible(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/intelligence/snapshot",
                        headers=auth_headers, timeout=10)
        _skip(r, "intel-snapshot")
        assert r.status_code == 200
        d = r.json()
        assert "pillar_1_operations" in d
        assert "pillar_3_assets" in d

    def test_pilot_dashboard_endpoint(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/executive-engine/daily-briefing",
                        headers=auth_headers, timeout=15)
        _skip(r, "pilot-dashboard")
        assert r.status_code == 200
        d = r.json()
        assert "kpis" in d


class TestROIPilotWorkflow:
    def test_pilot_snapshot_workflow(self, auth_headers):
        """Prove the 30-day pilot can be executed: snapshot → report → ROI."""
        # Step 1: Capture baseline snapshot
        r1 = requests.post(f"{BASE}/api/v1/roi/snapshot",
                          headers=auth_headers,
                          json={"label": "pilot_baseline", "period": "week1"},
                          timeout=20)
        _skip(r1, "pilot-snapshot")
        assert r1.status_code == 200
        assert r1.json()["kpis_captured"] >= 5

        # Step 2: Get ROI report
        r2 = requests.get(f"{BASE}/api/v1/roi/report",
                         headers=auth_headers, timeout=15)
        assert r2.status_code == 200
        d = r2.json()
        assert "current_performance" in d
        assert "improvement_potential" in d
        assert "recommendation" in d

    def test_ai_director_pilot_advisory(self, auth_headers):
        """AI Director provides evidence-backed recommendation for pilot."""
        r = requests.get(f"{BASE}/api/v1/ai-directors/executive",
                        headers=auth_headers, timeout=15)
        _skip(r, "pilot-advisory")
        assert r.status_code == 200
        d = r.json()
        assert d["human_review_required"] is True
        assert len(d["evidence"]) >= 1


class TestWave6Gate:
    def test_commercial_readiness_gate(self, auth_headers):
        """
        WAVE 6 GATE: Commercial Ready
        Proves the platform can support a real pilot customer.
        """
        checks = []

        # Marketing: landing page exists with CTA
        lp = Path("portal/app/page.tsx")
        checks.append(("Landing page", lp.exists() and "assessment" in lp.read_text().lower()))

        # Pilot toolkit: documentation exists
        pilot_doc = Path("docs/commercial/PILOT_PROGRAM.md")
        checks.append(("Pilot program doc", pilot_doc.exists()))

        # Demo: intelligence accessible
        r = requests.get(f"{BASE}/api/v1/intelligence/snapshot",
                        headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        checks.append(("Intelligence demo", r.status_code == 200))

        # ROI: measurement workflow works
        r = requests.post(f"{BASE}/api/v1/roi/snapshot",
                         headers=auth_headers,
                         json={"label": "commercial_gate"},
                         timeout=20)
        checks.append(("ROI measurement", r.status_code == 200))

        # Onboarding: self-service works
        r = requests.get(f"{BASE}/api/v1/onboarding/status",
                        headers=auth_headers, timeout=10)
        checks.append(("Self-service onboarding", r.status_code == 200))

        failed = [name for name, ok in checks if not ok]
        assert not failed, f"Wave 6 gate failed: {failed}"

        roi_r = requests.get(f"{BASE}/api/v1/roi/report",
                            headers=auth_headers, timeout=15).json()
        perf = roi_r.get("current_performance", {})
        imp = roi_r.get("improvement_potential", {})

        print(f"\n✅ WAVE 6 GATE PASSED: Commercial Ready")
        print(f"   Platform grade: {perf.get('performance_grade')}")
        print(f"   Cost avoidance potential: EGP {imp.get('estimated_cost_avoidance_egp',0):,.0f}")
        print(f"   Marketing: {len(list(Path('portal/app').glob('*/page.tsx')))} pages")
        print(f"   Pilot toolkit: {pilot_doc.exists()}")
