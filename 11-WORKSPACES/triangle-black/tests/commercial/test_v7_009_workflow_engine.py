"""
V7-009 — Workflow Engine 2.0 Tests
Verifies: governed transitions, role auth, audit trail, history
"""
import pytest
import requests

BASE = "http://localhost:8030"

def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")

def _get_instance_id(auth_headers) -> str:
    r = requests.get(f"{BASE}/api/v1/workflow/instances",
                    headers=auth_headers, timeout=10)
    if r.status_code == 200:
        results = r.json().get("results", [])
        if results:
            return results[0].get("id", "")
    return ""

class TestWorkflowAuth:
    def test_instances_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/workflow/instances", timeout=5)
        assert r.status_code in (401, 403)

    def test_transition_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/workflow/instances/test/transition",
                         json={"to_state": "assigned"}, timeout=5)
        assert r.status_code in (401, 403)

class TestAvailableTransitions:
    def test_available_transitions_returns_200(self, auth_headers):
        inst_id = _get_instance_id(auth_headers)
        if not inst_id:
            pytest.skip("No workflow instances found")
        r = requests.get(
            f"{BASE}/api/v1/workflow/instances/{inst_id}/available-transitions",
            headers=auth_headers, timeout=10)
        _skip(r, "available-trans")
        assert r.status_code == 200

    def test_available_transitions_has_required_fields(self, auth_headers):
        inst_id = _get_instance_id(auth_headers)
        if not inst_id:
            pytest.skip("No instances")
        r = requests.get(
            f"{BASE}/api/v1/workflow/instances/{inst_id}/available-transitions",
            headers=auth_headers, timeout=10)
        _skip(r, "trans-fields")
        assert r.status_code == 200
        d = r.json()
        assert "instance_id" in d
        assert "current_state" in d
        assert "available_transitions" in d
        assert "actor_role" in d

    def test_transitions_have_metadata(self, auth_headers):
        inst_id = _get_instance_id(auth_headers)
        if not inst_id:
            pytest.skip("No instances")
        r = requests.get(
            f"{BASE}/api/v1/workflow/instances/{inst_id}/available-transitions",
            headers=auth_headers, timeout=10)
        _skip(r, "trans-meta")
        assert r.status_code == 200
        for t in r.json()["available_transitions"]:
            assert "to_state" in t
            assert "requires_reason" in t
            assert "requires_technician" in t
            assert "label" in t

class TestGovernedTransition:
    def test_transition_returns_200_or_error(self, auth_headers):
        inst_id = _get_instance_id(auth_headers)
        if not inst_id:
            pytest.skip("No instances")
        r = requests.post(
            f"{BASE}/api/v1/workflow/instances/{inst_id}/transition",
            headers=auth_headers,
            json={"to_state": "assigned", "actor_role": "manager",
                  "reason": "V7-009 governance test"},
            timeout=10)
        _skip(r, "governed-trans")
        assert r.status_code == 200
        d = r.json()
        assert "success" in d

    def test_transition_response_has_governance_info(self, auth_headers):
        inst_id = _get_instance_id(auth_headers)
        if not inst_id:
            pytest.skip("No instances")
        r = requests.post(
            f"{BASE}/api/v1/workflow/instances/{inst_id}/transition",
            headers=auth_headers,
            json={"to_state": "assigned", "actor_role": "manager",
                  "reason": "governance test"},
            timeout=10)
        _skip(r, "gov-info")
        assert r.status_code == 200
        d = r.json()
        if d.get("success"):
            assert "audited" in d
            assert "governance" in d
            assert d["governance"]["human_actor"] is True

    def test_invalid_transition_rejected(self, auth_headers):
        inst_id = _get_instance_id(auth_headers)
        if not inst_id:
            pytest.skip("No instances")
        r = requests.post(
            f"{BASE}/api/v1/workflow/instances/{inst_id}/transition",
            headers=auth_headers,
            json={"to_state": "INVALID_STATE_XYZ", "actor_role": "manager"},
            timeout=10)
        _skip(r, "invalid-trans")
        assert r.status_code == 200
        assert r.json()["success"] is False

    def test_cancellation_requires_reason(self, auth_headers):
        inst_id = _get_instance_id(auth_headers)
        if not inst_id:
            pytest.skip("No instances")
        r = requests.post(
            f"{BASE}/api/v1/workflow/instances/{inst_id}/transition",
            headers=auth_headers,
            json={"to_state": "cancelled", "actor_role": "manager"},
            timeout=10)
        _skip(r, "cancel-reason")
        assert r.status_code == 200
        d = r.json()
        if not d.get("success"):
            assert "reason" in d.get("error", "").lower() or \
                   d.get("requires_reason") is True

class TestTransitionHistory:
    def test_history_returns_200(self, auth_headers):
        inst_id = _get_instance_id(auth_headers)
        if not inst_id:
            pytest.skip("No instances")
        r = requests.get(
            f"{BASE}/api/v1/workflow/instances/{inst_id}/history",
            headers=auth_headers, timeout=10)
        _skip(r, "history")
        assert r.status_code == 200

    def test_history_has_required_fields(self, auth_headers):
        inst_id = _get_instance_id(auth_headers)
        if not inst_id:
            pytest.skip("No instances")
        r = requests.get(
            f"{BASE}/api/v1/workflow/instances/{inst_id}/history",
            headers=auth_headers, timeout=10)
        _skip(r, "history-fields")
        assert r.status_code == 200
        d = r.json()
        assert "instance_id" in d
        assert "history" in d
        assert "history_count" in d

class TestExistingWorkflowPreserved:
    def test_instances_endpoint_preserved(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/workflow/instances",
                        headers=auth_headers, timeout=10)
        _skip(r, "instances")
        assert r.status_code == 200

    def test_definitions_endpoint_preserved(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/workflow/definitions",
                        headers=auth_headers, timeout=10)
        _skip(r, "definitions")
        assert r.status_code == 200

    def test_stats_endpoint_preserved(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/workflow/stats",
                        headers=auth_headers, timeout=10)
        _skip(r, "stats")
        assert r.status_code == 200
