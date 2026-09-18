"""Import Batch Tracking Tests — V15 P1."""
import requests
import pytest

BASE = "http://localhost:8030"


class TestImportBatchAuth:
    def test_history_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/import-tracking/history", timeout=5)
        assert r.status_code in (401, 403)

    def test_check_duplicate_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/import-tracking/check-duplicate",
                         json={"csv_content": "name\ntest", "entity_type": "assets"},
                         timeout=5)
        assert r.status_code in (401, 403)


class TestImportBatchFlow:
    def test_list_batches_returns(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/import-tracking/history",
                        headers=auth_headers, timeout=10)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
        d = r.json()
        assert "batches" in d
        assert "count" in d

    def test_check_duplicate_no_duplicate(self, auth_headers):
        import uuid
        unique_csv = f"name,category\nUNIQUE-{uuid.uuid4().hex[:8]},HVAC\n"
        r = requests.post(f"{BASE}/api/v1/import-tracking/check-duplicate",
                         headers={"Authorization": auth_headers["Authorization"],
                                  "Content-Type": "application/json"},
                         json={"csv_content": unique_csv, "entity_type": "assets"},
                         timeout=10)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
        d = r.json()
        assert d.get("duplicate") is False

    def test_batch_service_creates_table(self, auth_headers):
        """Calling any endpoint ensures table exists."""
        r = requests.get(f"{BASE}/api/v1/import-tracking/history?limit=1",
                        headers=auth_headers, timeout=10)
        if r.status_code == 429: pytest.skip("Rate limited")
        assert r.status_code == 200
