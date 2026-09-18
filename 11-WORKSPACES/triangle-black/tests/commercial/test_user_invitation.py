"""
User Invitation System Tests — V15 P0
Tests the multi-user onboarding flow.
"""
import requests
import pytest

BASE = "http://localhost:8030"


class TestInvitationAuth:
    def test_invite_requires_auth(self):
        """Unauthenticated invite attempt must be blocked."""
        r = requests.post(f"{BASE}/api/v1/users/invite",
                         json={"email": "test@test.com"}, timeout=5)
        assert r.status_code in (401, 403)

    def test_invitations_list_requires_auth(self):
        """Listing invitations requires authentication."""
        r = requests.get(f"{BASE}/api/v1/users/invitations", timeout=5)
        assert r.status_code in (401, 403)


class TestInvitationFlow:
    def test_send_invitation(self, auth_headers):
        """Admin can invite a new engineer."""
        r = requests.post(f"{BASE}/api/v1/users/invite",
                         headers=auth_headers,
                         json={"email": "newengineer@hotel.com", "role": "engineer",
                               "name": "New Engineer"},
                         timeout=10)
        if r.status_code == 429:
            pytest.skip("Rate limited")
        assert r.status_code == 200
        d = r.json()
        assert d.get("success") is True
        assert "token" in d
        assert "email" in d
        assert d["role"] == "engineer"
        assert "expires_at" in d

    def test_validate_invalid_token(self):
        """Invalid token returns not valid."""
        r = requests.get(f"{BASE}/api/v1/users/invite/invalid-token-xyz/validate",
                        timeout=8)
        if r.status_code == 429:
            pytest.skip("Rate limited")
        assert r.status_code == 200
        d = r.json()
        assert d.get("valid") is False

    def test_accept_invalid_token(self):
        """Accepting invalid token returns error."""
        r = requests.post(f"{BASE}/api/v1/users/invite/invalid-token-xyz/accept",
                         json={"password": "securepassword123"}, timeout=8)
        if r.status_code == 429:
            pytest.skip("Rate limited")
        assert r.status_code in (400, 422)

    def test_full_invitation_flow(self, auth_headers):
        """Full flow: invite → validate → accept → can login."""
        import uuid
        unique_email = f"invitetest_{uuid.uuid4().hex[:8]}@hotel.com"

        # Step 1: Send invitation
        r1 = requests.post(f"{BASE}/api/v1/users/invite",
                          headers=auth_headers,
                          json={"email": unique_email, "role": "technician",
                                "name": "Test Technician"},
                          timeout=10)
        if r1.status_code == 429:
            pytest.skip("Rate limited")
        assert r1.status_code == 200
        token = r1.json().get("token")
        assert token, "Token must be returned"

        # Step 2: Validate token
        r2 = requests.get(f"{BASE}/api/v1/users/invite/{token}/validate", timeout=8)
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2.get("valid") is True
        assert d2.get("email") == unique_email
        assert d2.get("role") == "technician"

        # Step 3: Accept invitation
        r3 = requests.post(f"{BASE}/api/v1/users/invite/{token}/accept",
                          json={"password": "SecurePass123!", "name": "Test Technician"},
                          timeout=10)
        assert r3.status_code == 200
        d3 = r3.json()
        assert d3.get("success") is True
        assert "access_token" in d3
        assert d3.get("role") == "technician"
        assert d3.get("email") == unique_email
