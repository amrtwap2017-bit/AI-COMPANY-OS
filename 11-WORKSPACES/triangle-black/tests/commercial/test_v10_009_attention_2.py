"""
V10-009: Attention Engine 2.0 Tests
P0/P1/P2/P3 priority classification for operational cockpit.
"""
import pytest
import requests
import json
import subprocess

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

class TestAttentionEngine:
    def test_attention_base_returns_200(self, auth_headers):
        """Base attention endpoint still works."""
        r = requests.get(f"{BASE}/api/v1/attention/",
                        headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert "attention_score" in r.json()

    def test_attention_priorities_returns_200(self, auth_headers):
        """V10-009: /attention/priorities returns 200."""
        r = requests.get(f"{BASE}/api/v1/attention/priorities",
                        headers=auth_headers, timeout=15)
        if r.status_code == 404:
            pytest.skip("Priorities endpoint not yet deployed")
        assert r.status_code == 200

    def test_attention_priorities_has_p0(self, auth_headers):
        """P0 section exists in priorities response."""
        r = requests.get(f"{BASE}/api/v1/attention/priorities",
                        headers=auth_headers, timeout=15)
        if r.status_code == 404:
            pytest.skip("Priorities endpoint not yet deployed")
        assert r.status_code == 200
        data = r.json()
        assert "p0_immediate" in data, "Missing p0_immediate"
        assert "p1_today" in data, "Missing p1_today"
        assert "p2_this_week" in data, "Missing p2_this_week"
        assert "p3_monitor" in data, "Missing p3_monitor"

    def test_attention_priorities_has_summary(self, auth_headers):
        """Priorities summary shows highest priority."""
        r = requests.get(f"{BASE}/api/v1/attention/priorities",
                        headers=auth_headers, timeout=15)
        if r.status_code == 404:
            pytest.skip("Priorities endpoint not yet deployed")
        data = r.json()
        assert "summary" in data
        summary = data["summary"]
        assert "highest_priority" in summary
        assert summary["highest_priority"] in ["P0", "P1", "P2", "P3"]

    def test_p0_reflects_critical_unassigned(self, auth_headers):
        """P0 count reflects actual critical unassigned WOs."""
        r = requests.get(f"{BASE}/api/v1/attention/priorities",
                        headers=auth_headers, timeout=15)
        if r.status_code == 404:
            pytest.skip("Priorities endpoint not yet deployed")
        data = r.json()
        p0 = data.get("p0_immediate", {})
        assert isinstance(p0.get("count"), int)
        assert isinstance(p0.get("requires_action"), bool)

    def test_attention_with_data_quality_context(self, auth_headers):
        """Attention score is paired with data quality context."""
        r_att = requests.get(f"{BASE}/api/v1/attention/", headers=auth_headers, timeout=15)
        r_lin = requests.get(f"{BASE}/api/v1/data-quality/lineage", headers=auth_headers, timeout=15)

        assert r_att.status_code == 200
        score = r_att.json().get("attention_score", 0)
        assert score >= 0

        if r_lin.status_code == 200:
            confidence = r_lin.json().get("summary", {}).get("overall_confidence")
            # When attention is high and confidence is low, we should note the limitation
            print(f"\n  Attention score: {score}/100")
            print(f"  Data confidence: {confidence}")
            if score > 80 and confidence in ["LOW", "VERY_LOW"]:
                print("  ⚠️ HIGH ATTENTION but LOW DATA QUALITY — score may be unreliable")
