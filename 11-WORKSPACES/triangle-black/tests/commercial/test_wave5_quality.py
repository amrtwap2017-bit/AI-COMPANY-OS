"""
WAVE 5 — Product Quality Gate Tests
Verifies: API quality, performance, design system, TypeScript health.
"""
import pytest
import requests
from pathlib import Path

BASE = "http://localhost:8030"


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


class TestAPIQuality:
    def test_no_500_across_core_endpoints(self, auth_headers):
        for ep in [
            "/api/v1/executive-engine/health-score",
            "/api/v1/asset-engine/summary",
            "/api/v1/pm-engine/summary",
            "/api/v1/supplier-engine/summary",
            "/api/v1/recommendations/summary",
            "/api/v1/roi/report",
            "/api/v1/twin/state",
        ]:
            r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=15)
            if r.status_code == 429: pytest.skip("Rate limited")
            assert r.status_code != 500, f"500 on {ep}"

    def test_all_new_endpoints_require_auth(self):
        for ep in [
            "/api/v1/recommendations/summary",
            "/api/v1/roi/report",
            "/api/v1/twin/state",
            "/api/v1/ai-directors/executive",
            "/api/v1/onboarding/status",
        ]:
            r = requests.get(f"{BASE}{ep}", timeout=10)
            assert r.status_code in (401, 403), \
                f"{ep} must require auth, got {r.status_code}"

    def test_all_engines_return_hotel_id(self, auth_headers):
        for ep in [
            "/api/v1/asset-engine/summary",
            "/api/v1/pm-engine/summary",
            "/api/v1/supplier-engine/summary",
            "/api/v1/backlog-engine/summary",
        ]:
            r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=10)
            if r.status_code == 429: pytest.skip("Rate limited")
            assert r.status_code == 200
            assert r.json().get("hotel_id", "").startswith("tb-")


class TestDesignSystem:
    def test_globals_css_has_tb_classes(self):
        css = Path("portal/app/globals.css")
        assert css.exists()
        text = css.read_text()
        required = ["tb-canvas", "tb-kpi", "tb-section", "tb-table",
                    "tb-flex-between", "tb-flex-col", "tb-flex-col-gap-sm"]
        for cls in required:
            assert cls in text, f"Missing class: {cls}"

    def test_no_old_brand_color(self):
        import subprocess
        result = subprocess.run(
            ["grep", "-rn", "#1B2B4B", "portal/app", "--include=*.tsx"],
            capture_output=True, text=True
        )
        assert result.stdout == "", f"Old brand color found: {result.stdout[:200]}"

    def test_portal_pages_ts_nocheck_zero(self):
        pages_with = [
            str(f) for f in Path("portal/app").rglob("page.tsx")
            if "@ts-nocheck" in f.read_text()
        ]
        assert not pages_with, \
            f"Portal pages with @ts-nocheck: {pages_with}"

    def test_inline_styles_below_threshold(self):
        total = sum(
            f.read_text().count("style={{")
            for f in Path("portal/app").rglob("page.tsx")
        )
        assert total < 1300, \
            f"Too many inline styles: {total} (target: < 1300)"


class TestPerformanceBudgets:
    def test_performance_doc_exists(self):
        doc = Path("docs/operations/PERFORMANCE_BUDGETS.md")
        assert doc.exists()
        assert "500ms" in doc.read_text()

    def test_backup_dr_doc_exists(self):
        doc = Path("docs/operations/BACKUP_DR.md")
        assert doc.exists()
        assert "RPO" in doc.read_text()
        assert "RTO" in doc.read_text()


class TestWave5Gate:
    def test_professional_product_gate(self, auth_headers):
        """WAVE 5 GATE: Professional product experience."""
        checks = []

        # API quality: no 500s
        r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                        headers=auth_headers, timeout=15)
        if r.status_code == 429: pytest.skip("Rate limited")
        checks.append(("No 500 errors", r.status_code == 200))

        # Performance: health score under 1s
        import time
        start = time.time()
        r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                        headers=auth_headers, timeout=15)
        ms = (time.time() - start) * 1000
        checks.append(("Performance < 1000ms", ms < 1000))

        # Design system: classes exist
        css = Path("portal/app/globals.css").read_text()
        checks.append(("Design system", "tb-flex-col-gap-sm" in css))

        # No old brand color
        import subprocess
        result = subprocess.run(
            ["grep", "-rn", "#1B2B4B", "portal/app", "--include=*.tsx"],
            capture_output=True, text=True
        )
        checks.append(("No old brand color", result.stdout == ""))

        # Documentation exists
        checks.append(("Performance docs", Path("docs/operations/PERFORMANCE_BUDGETS.md").exists()))
        checks.append(("Backup docs", Path("docs/operations/BACKUP_DR.md").exists()))

        failed = [name for name, ok in checks if not ok]
        assert not failed, f"Wave 5 gate failed: {failed}"
        print(f"\n✅ WAVE 5 GATE PASSED: Professional Product Experience")
        print(f"   Health: {r.json().get('health_score')}/100")
        print(f"   Response: {ms:.0f}ms")
