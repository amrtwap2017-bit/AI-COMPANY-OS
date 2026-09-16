"""Evidence Ledger — ROI Hierarchy Tests"""
import pytest, requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

class TestEvidenceLedgerAuth:
    def test_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/evidence/", json={"metric_name": "test"}, timeout=5)
        assert r.status_code in (401, 403)

    def test_summary_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/evidence/summary", timeout=5)
        assert r.status_code in (401, 403)

    def test_verified_roi_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/evidence/verified-roi", timeout=5)
        assert r.status_code in (401, 403)

class TestEvidenceLedgerCore:
    def test_record_internal_evidence(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/evidence/", headers=auth_headers, json={
            "metric_name": "pm_compliance_rate",
            "evidence_level": 0,
            "baseline_value": 65.0,
            "observed_value": 78.0,
            "financial_value": 5000.0,
            "notes": "Internal system measurement",
        }, timeout=10)
        _skip(r, "record-evidence")
        assert r.status_code == 200
        d = r.json()
        assert d["success"] is True
        assert d["level"] == 0
        assert d["label"] == "INTERNAL"
        assert "warning" in d and d["warning"] is not None

    def test_record_customer_verified_evidence(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/evidence/", headers=auth_headers, json={
            "metric_name": "chiller_failure_avoided",
            "evidence_level": 3,
            "baseline_value": 0,
            "observed_value": 1,
            "financial_value": 180000.0,
            "notes": "Customer confirmed chiller failure avoided — Chief Engineer Ahmed",
        }, timeout=10)
        _skip(r, "customer-evidence")
        assert r.status_code == 200
        d = r.json()
        assert d["success"] is True
        assert d["level"] == 3
        assert d["label"] == "CUSTOMER_VERIFIED"
        assert d.get("warning") is None

    def test_summary_shows_internal_vs_verified(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/evidence/summary", headers=auth_headers, timeout=10)
        _skip(r, "summary")
        assert r.status_code == 200
        d = r.json()
        assert "summary" in d
        assert "internal_roi_egp" in d["summary"]
        assert "customer_verified_roi_egp" in d["summary"]
        assert "critical_rule" in d

    def test_verified_roi_only_shows_l3_plus(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/evidence/verified-roi", headers=auth_headers, timeout=10)
        _skip(r, "verified-roi")
        assert r.status_code == 200
        d = r.json()
        assert "verified_roi_egp" in d
        assert "minimum_level" in d
        assert d["minimum_level"] == 3
        assert "honest_label" in d
        for record in d.get("records", []):
            assert record["evidence_level"] >= 3

    def test_upgrade_evidence_level(self, auth_headers):
        # First create L0 evidence
        r1 = requests.post(f"{BASE}/api/v1/evidence/", headers=auth_headers, json={
            "metric_name": "test_upgrade_metric",
            "evidence_level": 0,
            "financial_value": 1000.0,
        }, timeout=10)
        _skip(r1, "create-for-upgrade")
        if r1.status_code != 200 or not r1.json().get("success"):
            pytest.skip("Could not create evidence for upgrade test")

        evidence_id = r1.json()["evidence_id"]

        # Upgrade to L2
        r2 = requests.patch(
            f"{BASE}/api/v1/evidence/{evidence_id}/verify",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"new_level": 2, "notes": "Engineer confirmed action taken"},
            timeout=10
        )
        _skip(r2, "upgrade-evidence")
        assert r2.status_code == 200
        d = r2.json()
        assert d["success"] is True
        assert d["new_level"] == 2
        assert d["new_label"] == "OPERATOR_CONFIRMED"
