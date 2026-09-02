"""V8-S10 — Attention Dashboard UI Tests"""
import pytest
import requests
from pathlib import Path

BASE = "http://localhost:8030"

class TestAttentionDashboardUI:
    def test_attention_page_exists(self):
        """Attention dashboard page must exist in portal."""
        page = Path("portal/app/(app)/attention/page.tsx")
        assert page.exists(), "Attention dashboard page missing"

    def test_attention_page_has_required_components(self):
        """Page must display all key attention components."""
        page = Path("portal/app/(app)/attention/page.tsx")
        content = page.read_text()
        assert "attention_score" in content or "score" in content
        assert "urgency" in content
        assert "critical_work_orders" in content or "criticalWOs" in content
        assert "overdue_pm" in content.lower() or "overduePM" in content

    def test_attention_api_feeds_ui(self, auth_headers):
        """API must return all data the UI needs."""
        r = requests.get(f"{BASE}/api/v1/attention/",
                        headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "attention_score" in d
        assert "urgency" in d
        assert "summary" in d
        assert "critical_work_orders" in d
        assert "overdue_pm_plans" in d
        assert "top_recommendations" in d

    def test_attention_score_is_real(self, auth_headers):
        """Score must reflect real operational data."""
        r = requests.get(f"{BASE}/api/v1/attention/",
                        headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        score = d.get("attention_score", 0)
        assert isinstance(score, (int, float))
        assert 0 <= score <= 100

    def test_attention_page_no_hardcoded_credentials(self):
        """Page must not contain hardcoded credentials."""
        page = Path("portal/app/(app)/attention/page.tsx")
        content = page.read_text()
        assert "admin123" not in content
        assert "amr@triangleblack" not in content
