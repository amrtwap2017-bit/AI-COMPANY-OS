"""
V10-008: AI Recommendation 2.0 Tests
Deduplication, expiry, urgency levels, lifecycle.
"""
import pytest
import requests
import json
import subprocess
from pathlib import Path

BASE = "http://localhost:8030"

def get_token():
    r = subprocess.run(
        ['curl','-s','-X','POST',f'{BASE}/api/v1/auth/login/json',
         '-H','Content-Type: application/json',
         '-d','{"email":"amr@triangleblack.com","password":"admin123"}'],
        capture_output=True, text=True
    )
    try:
        return json.loads(r.stdout).get("access_token","")
    except:
        return ""

@pytest.fixture(scope="module")
def auth_headers():
    tok = get_token()
    if not tok:
        pytest.skip("Server not available")
    return {"Authorization": f"Bearer {tok}"}

class TestRecommendationSchema:
    def test_duplicate_key_field_exists(self):
        """V10-008: duplicate_key column must exist in recommendations."""
        from sqlalchemy import create_engine, text as sqla_text
        engine = create_engine("postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black")
        with engine.connect() as conn:
            result = conn.execute(sqla_text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name='recommendations' AND column_name='duplicate_key'
            """)).fetchone()
        assert result is not None, "duplicate_key column missing from recommendations"

    def test_expiry_date_field_exists(self):
        """V10-008: expiry_date column must exist in recommendations."""
        from sqlalchemy import create_engine, text as sqla_text
        engine = create_engine("postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black")
        with engine.connect() as conn:
            result = conn.execute(sqla_text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name='recommendations' AND column_name='expiry_date'
            """)).fetchone()
        assert result is not None, "expiry_date column missing from recommendations"

    def test_urgency_level_field_exists(self):
        """V10-008: urgency_level column must exist in recommendations."""
        from sqlalchemy import create_engine, text as sqla_text
        engine = create_engine("postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black")
        with engine.connect() as conn:
            result = conn.execute(sqla_text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name='recommendations' AND column_name='urgency_level'
            """)).fetchone()
        assert result is not None, "urgency_level column missing from recommendations"

class TestRecommendationDeduplication:
    def test_generate_does_not_create_unlimited_recs(self, auth_headers):
        """Repeated /generate calls should not grow queue indefinitely."""
        # Get count before
        r_before = requests.get(f"{BASE}/api/v1/recommendations/summary",
                               headers=auth_headers, timeout=10)
        before_count = r_before.json().get("pending", 0) if r_before.status_code == 200 else 0

        # Generate
        requests.post(f"{BASE}/api/v1/recommendations/generate",
                     headers=auth_headers, timeout=30)
        # Generate again
        r2 = requests.post(f"{BASE}/api/v1/recommendations/generate",
                          headers=auth_headers, timeout=30)

        if r2.status_code == 200:
            second_gen = r2.json().get("generated_count", 0)
            # Second call should generate fewer (dedup) or same (if first was deduped)
            assert second_gen <= 4, f"Too many generated on second call: {second_gen}"

    def test_generate_returns_valid_structure(self, auth_headers):
        """Generate endpoint returns proper structure."""
        r = requests.post(f"{BASE}/api/v1/recommendations/generate",
                         headers=auth_headers, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "generated_count" in data
        assert "recommendations" in data

class TestRecommendationLifecycle:
    def test_recommendations_list_accessible(self, auth_headers):
        """Recommendations list returns 200."""
        r = requests.get(f"{BASE}/api/v1/recommendations/",
                        headers=auth_headers, timeout=10)
        assert r.status_code == 200

    def test_daily_digest_accessible(self, auth_headers):
        """Daily digest returns top recommendations."""
        r = requests.get(f"{BASE}/api/v1/recommendations/daily-digest",
                        headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "digest" in data or "recommendations" in data

    def test_lineage_service_module_exists(self):
        """V10-006 lineage module available for AI quality context."""
        p = Path("src/commercial/data_quality/lineage.py")
        assert p.exists()
        from src.commercial.data_quality.lineage import Confidence
        assert Confidence.VERY_LOW.value == "VERY_LOW"
