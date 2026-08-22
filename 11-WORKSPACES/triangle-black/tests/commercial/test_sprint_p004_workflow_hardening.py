"""
Sprint P-004: Workflow & Approval Hardening Test Suite
Validates policy evaluation engine, threshold tiers, and role approval permissions.
"""
import pytest
import requests

BASE = "http://localhost:8030"

_C = {}
def _auth():
    if "h" not in _C:
        r = requests.post(
            f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        assert r.status_code == 200
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_policy_engine_unit():
    from src.commercial.workflow_engine.policy import WorkflowPolicyEngine

    # Tier 0: Auto-approval
    p0 = WorkflowPolicyEngine.evaluate_approval_policy("hotel_1", "work_order", amount=500.0)
    assert p0["requires_approval"] is False
    assert p0["tier"] == "auto"

    # Tier 1: Manager
    p1 = WorkflowPolicyEngine.evaluate_approval_policy("hotel_1", "work_order", amount=2500.0)
    assert p1["requires_approval"] is True
    assert p1["required_role"] == "manager"

    # Tier 2: Executive / Finance Director
    p2 = WorkflowPolicyEngine.evaluate_approval_policy("hotel_1", "work_order", amount=15000.0)
    assert p2["requires_approval"] is True
    assert p2["required_role"] == "finance_director"

    # Hierarchy verification
    assert WorkflowPolicyEngine.can_user_approve("admin", "finance_director") is True
    assert WorkflowPolicyEngine.can_user_approve("manager", "finance_director") is False
    assert WorkflowPolicyEngine.can_user_approve("manager", "manager") is True

def test_evaluate_policy_api_endpoint():
    h = _auth()
    payload = {
        "entity_type": "purchase_request",
        "amount": 7500.0,
        "current_state": "draft"
    }
    r = requests.post(f"{BASE}/api/v1/workflow/evaluate-policy", json=payload, headers=h, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data["requires_approval"] is True
    assert data["required_role"] == "finance_director"
    assert data["tier"] == "tier_2_executive"
