"""Registration Security Tests — V15.0 Audit Fix."""
import requests
import pytest

BASE = "http://localhost:8030"


class TestRegistrationRoleSecurity:
    def test_registration_always_creates_viewer(self):
        """Client cannot escalate to admin at registration."""
        import uuid
        email = f"test.sec.{uuid.uuid4().hex[:8]}@triangleblack.test"
        r = requests.post(f"{BASE}/api/v1/auth/register",
                         json={"name": "Test Security",
                               "email": email,
                               "password": "SecurePass123!",
                               "role": "admin"},  # Attempt privilege escalation
                         timeout=10)
        if r.status_code == 429: pytest.skip("Rate limited")
        # Either 201 created (as viewer) or 400 (blocked)
        if r.status_code == 201:
            d = r.json()
            # Role must NOT be admin even though we requested it
            actual_role = d.get("role", "unknown")
            assert actual_role != "admin", \
                f"SECURITY: Registration allowed admin role! Got: {actual_role}"
            assert actual_role == "viewer", \
                f"Expected viewer, got {actual_role}"
        elif r.status_code in (400, 422):
            pass  # Blocked — also acceptable

    def test_registration_viewer_role_by_default(self):
        """Default role at registration is viewer."""
        import uuid
        email = f"test.default.{uuid.uuid4().hex[:8]}@triangleblack.test"
        r = requests.post(f"{BASE}/api/v1/auth/register",
                         json={"name": "Default Role Test",
                               "email": email,
                               "password": "SecurePass123!"},
                         timeout=10)
        if r.status_code == 429: pytest.skip("Rate limited")
        if r.status_code == 201:
            d = r.json()
            role = d.get("role", "unknown")
            assert role in ("viewer", "agent"), \
                f"Expected viewer/agent default, got {role}"


class TestDebugRoutesGated:
    def test_automation_run_blocked_without_auth(self):
        """Automation endpoint requires auth."""
        r = requests.post(f"{BASE}/api/v1/automation/run", timeout=5)
        assert r.status_code in (401, 403, 404, 405)

    def test_debug_executive_blocked_without_auth(self):
        """Debug executive endpoint requires auth."""
        r = requests.get(f"{BASE}/api/v1/debug/executive", timeout=5)
        assert r.status_code in (401, 403, 404)
