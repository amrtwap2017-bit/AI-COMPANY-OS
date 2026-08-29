"""
V6-F02 — Performance Budget Tests
Verifies all endpoints meet documented performance budgets.

Budgets: standard < 500ms, dashboard < 1000ms
Evidence: All 10 endpoints measured 2026-08-29
  Slowest: executive-engine/health-score 253ms
  Fastest: trend-engine/compare 15ms
"""
import pytest
import requests
import time

BASE = "http://localhost:8030"
STANDARD_BUDGET_MS = 500
DASHBOARD_BUDGET_MS = 1000
AI_BUDGET_MS = 5000


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


def _measure(url: str, headers: dict, runs: int = 2) -> float:
    """Measure average response time over N runs."""
    times = []
    for _ in range(runs):
        start = time.time()
        r = requests.get(f"{BASE}{url}", headers=headers, timeout=30)
        ms = (time.time() - start) * 1000
        if r.status_code == 200:
            times.append(ms)
        elif r.status_code == 429:
            pytest.skip("Rate limited")
    return sum(times) / len(times) if times else 9999


class TestIntelligenceEngineBudgets:
    def test_health_score_under_1000ms(self, auth_headers):
        avg = _measure("/api/v1/executive-engine/health-score", auth_headers)
        assert avg < DASHBOARD_BUDGET_MS, \
            f"health-score: {avg:.0f}ms exceeds {DASHBOARD_BUDGET_MS}ms budget"

    def test_asset_engine_under_500ms(self, auth_headers):
        avg = _measure("/api/v1/asset-engine/summary", auth_headers)
        assert avg < STANDARD_BUDGET_MS, \
            f"asset-engine: {avg:.0f}ms exceeds {STANDARD_BUDGET_MS}ms budget"

    def test_pm_engine_under_500ms(self, auth_headers):
        avg = _measure("/api/v1/pm-engine/summary", auth_headers)
        assert avg < STANDARD_BUDGET_MS, \
            f"pm-engine: {avg:.0f}ms exceeds budget"

    def test_supplier_engine_under_500ms(self, auth_headers):
        avg = _measure("/api/v1/supplier-engine/summary", auth_headers)
        assert avg < STANDARD_BUDGET_MS, \
            f"supplier-engine: {avg:.0f}ms exceeds budget"

    def test_backlog_engine_under_500ms(self, auth_headers):
        avg = _measure("/api/v1/backlog-engine/summary", auth_headers)
        assert avg < STANDARD_BUDGET_MS, \
            f"backlog-engine: {avg:.0f}ms exceeds budget"

    def test_predictive_engine_under_500ms(self, auth_headers):
        avg = _measure("/api/v1/predictive-engine/summary", auth_headers)
        assert avg < STANDARD_BUDGET_MS, \
            f"predictive-engine: {avg:.0f}ms exceeds budget"

    def test_trend_engine_under_500ms(self, auth_headers):
        avg = _measure("/api/v1/trend-engine/compare", auth_headers)
        assert avg < STANDARD_BUDGET_MS, \
            f"trend-engine: {avg:.0f}ms exceeds budget"


class TestWave4EndpointBudgets:
    def test_recommendations_summary_under_500ms(self, auth_headers):
        avg = _measure("/api/v1/recommendations/summary", auth_headers)
        assert avg < STANDARD_BUDGET_MS, \
            f"recommendations: {avg:.0f}ms exceeds budget"

    def test_roi_report_under_500ms(self, auth_headers):
        avg = _measure("/api/v1/roi/report", auth_headers)
        assert avg < STANDARD_BUDGET_MS, \
            f"roi/report: {avg:.0f}ms exceeds budget"

    def test_twin_state_under_500ms(self, auth_headers):
        avg = _measure("/api/v1/twin/state", auth_headers)
        assert avg < STANDARD_BUDGET_MS, \
            f"twin/state: {avg:.0f}ms exceeds budget"

    def test_ai_directors_under_5000ms(self, auth_headers):
        """AI Directors run 4 DB queries — budget is relaxed to 5s."""
        avg = _measure("/api/v1/ai-directors/executive", auth_headers, runs=2)
        assert avg < AI_BUDGET_MS, \
            f"ai-directors: {avg:.0f}ms exceeds {AI_BUDGET_MS}ms budget"

    def test_digital_twin_impact_chain_under_1000ms(self, auth_headers):
        from sqlalchemy import create_engine, text as sqlt
        try:
            engine = create_engine(
                "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"
            )
            with engine.connect() as conn:
                asset_id = conn.execute(sqlt(
                    "SELECT id FROM assets WHERE hotel_id='tb-default-hotel-000000000001' LIMIT 1"
                )).fetchone()[0]
        except Exception:
            pytest.skip("Cannot get test asset_id")

        avg = _measure(
            f"/api/v1/twin/impact-chain/{asset_id}", auth_headers, runs=2
        )
        assert avg < DASHBOARD_BUDGET_MS, \
            f"impact-chain: {avg:.0f}ms exceeds {DASHBOARD_BUDGET_MS}ms budget"


class TestPerformanceBudgetDocumentation:
    def test_performance_budget_doc_exists(self):
        from pathlib import Path
        doc = Path("docs/operations/PERFORMANCE_BUDGETS.md")
        assert doc.exists(), "PERFORMANCE_BUDGETS.md must exist"
        content = doc.read_text()
        assert "500ms" in content
        assert "PASS" in content
        assert "executive-engine" in content

    def test_all_engines_return_200(self, auth_headers):
        """All intelligence engines must be reachable."""
        engines = [
            "/api/v1/executive-engine/health-score",
            "/api/v1/asset-engine/summary",
            "/api/v1/pm-engine/summary",
            "/api/v1/supplier-engine/summary",
            "/api/v1/backlog-engine/summary",
        ]
        failed = []
        for ep in engines:
            r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=10)
            if r.status_code == 429:
                pytest.skip("Rate limited")
            if r.status_code != 200:
                failed.append(f"{ep} → {r.status_code}")
        assert not failed, f"Engines not reachable: {failed}"

    def test_platform_health_still_above_75(self, auth_headers):
        """Performance optimizations must not break health score."""
        r = requests.get(f"{BASE}/api/v1/executive-engine/health-score",
                        headers=auth_headers, timeout=15)
        if r.status_code == 429:
            pytest.skip("Rate limited")
        assert r.status_code == 200
        assert r.json()["health_score"] >= 75
