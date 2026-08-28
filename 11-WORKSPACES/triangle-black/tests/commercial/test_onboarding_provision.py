"""
V6-C01 — Customer Onboarding Provisioning Tests
Verifies: real self-service provisioning without developer intervention.
Evidence: Live test 2026-08-28 — full provision + status verified.
"""
import pytest
import requests
import uuid

BASE = "http://localhost:8030"


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


class TestOnboardingValidation:
    def test_validate_endpoint_exists(self, auth_headers):
        r = requests.post(
            f"{BASE}/api/v1/onboarding/validate",
            headers=auth_headers,
            json={"admin_email": "fresh_unique_test@example.com"},
            timeout=10
        )
        _skip(r, "validate")
        assert r.status_code == 200

    def test_validate_returns_valid_for_new_email(self, auth_headers):
        unique = f"unique_{uuid.uuid4().hex[:8]}@testdomain.com"
        r = requests.post(
            f"{BASE}/api/v1/onboarding/validate",
            headers=auth_headers,
            json={"admin_email": unique},
            timeout=10
        )
        _skip(r, "validate-new")
        assert r.status_code == 200
        d = r.json()
        assert d["valid"] is True
        assert d["issues"] == []
        assert d["email"] == unique

    def test_validate_rejects_duplicate_email(self, auth_headers):
        """Email already in DB must return valid=False."""
        r = requests.post(
            f"{BASE}/api/v1/onboarding/validate",
            headers=auth_headers,
            json={"admin_email": "amr@triangleblack.com"},
            timeout=10
        )
        _skip(r, "validate-dup")
        assert r.status_code == 200
        d = r.json()
        assert d["valid"] is False
        assert len(d["issues"]) >= 1

    def test_validate_normalizes_email_to_lowercase(self, auth_headers):
        unique = f"UPPER_{uuid.uuid4().hex[:6]}@test.com"
        r = requests.post(
            f"{BASE}/api/v1/onboarding/validate",
            headers=auth_headers,
            json={"admin_email": unique},
            timeout=10
        )
        _skip(r, "validate-lower")
        assert r.status_code == 200
        assert r.json()["email"] == unique.lower()


class TestOnboardingProvisioning:
    def test_provision_creates_new_org(self, auth_headers):
        """Full provision cycle — creates hotel + user + returns credentials."""
        unique = f"provtest_{uuid.uuid4().hex[:6]}@newcustomer.com"
        r = requests.post(
            f"{BASE}/api/v1/onboarding/provision",
            headers=auth_headers,
            json={
                "org_name": "Test Engineering Ltd",
                "property_name": "Test Grand Hotel",
                "admin_email": unique,
                "admin_name": "Test Admin User",
                "city": "Cairo",
            },
            timeout=20
        )
        _skip(r, "provision")
        assert r.status_code == 200, f"Provision failed: {r.text[:200]}"
        d = r.json()
        assert d["status"] == "provisioned"
        assert d["hotel_id"].startswith("tb-hotel-")
        assert d["admin"]["email"] == unique
        assert d["admin"]["temp_password"].startswith("TB-")
        assert d["admin"]["role"] == "admin"

    def test_provision_hotel_id_format(self, auth_headers):
        unique = f"hotelid_{uuid.uuid4().hex[:6]}@test.com"
        r = requests.post(
            f"{BASE}/api/v1/onboarding/provision",
            headers=auth_headers,
            json={
                "org_name": "Hotel ID Test Org",
                "property_name": "Hotel ID Test Property",
                "admin_email": unique,
                "admin_name": "Test Admin",
            },
            timeout=20
        )
        _skip(r, "hotel-id-format")
        assert r.status_code == 200
        hotel_id = r.json()["hotel_id"]
        parts = hotel_id.split("-")
        assert parts[0] == "tb"
        assert parts[1] == "hotel"
        assert len(hotel_id) > 15

    def test_provision_returns_temp_password(self, auth_headers):
        unique = f"pass_{uuid.uuid4().hex[:6]}@test.com"
        r = requests.post(
            f"{BASE}/api/v1/onboarding/provision",
            headers=auth_headers,
            json={
                "org_name": "Password Test Org",
                "property_name": "Password Test Hotel",
                "admin_email": unique,
                "admin_name": "Pass Admin",
            },
            timeout=20
        )
        _skip(r, "temp-pass")
        assert r.status_code == 200
        pwd = r.json()["admin"]["temp_password"]
        assert len(pwd) >= 10
        assert pwd.startswith("TB-")

    def test_provision_rejects_duplicate_email(self, auth_headers):
        """Second provision with same email must return 409."""
        unique = f"dup_{uuid.uuid4().hex[:6]}@test.com"
        payload = {
            "org_name": "Dup Test Org",
            "property_name": "Dup Test Hotel",
            "admin_email": unique,
            "admin_name": "Dup Admin",
        }
        # First provision
        r1 = requests.post(f"{BASE}/api/v1/onboarding/provision",
                          headers=auth_headers, json=payload, timeout=20)
        _skip(r1, "dup-first")
        assert r1.status_code == 200
        # Second provision — must fail
        r2 = requests.post(f"{BASE}/api/v1/onboarding/provision",
                          headers=auth_headers, json=payload, timeout=20)
        _skip(r2, "dup-second")
        assert r2.status_code == 409, f"Expected 409, got {r2.status_code}"

    def test_provision_input_validation_short_name(self, auth_headers):
        """Org name too short must return 422."""
        r = requests.post(
            f"{BASE}/api/v1/onboarding/provision",
            headers=auth_headers,
            json={
                "org_name": "X",
                "property_name": "Valid Hotel Name",
                "admin_email": "valid@email.com",
                "admin_name": "Valid Admin",
            },
            timeout=10
        )
        _skip(r, "input-short")
        assert r.status_code == 422

    def test_provision_input_validation_bad_email(self, auth_headers):
        """Invalid email must return 422."""
        r = requests.post(
            f"{BASE}/api/v1/onboarding/provision",
            headers=auth_headers,
            json={
                "org_name": "Valid Org Name",
                "property_name": "Valid Hotel",
                "admin_email": "not-an-email",
                "admin_name": "Valid Admin",
            },
            timeout=10
        )
        _skip(r, "input-email")
        assert r.status_code == 422

    def test_provision_response_has_next_steps(self, auth_headers):
        unique = f"nextstep_{uuid.uuid4().hex[:6]}@test.com"
        r = requests.post(
            f"{BASE}/api/v1/onboarding/provision",
            headers=auth_headers,
            json={
                "org_name": "Next Steps Org",
                "property_name": "Next Steps Hotel",
                "admin_email": unique,
                "admin_name": "Next Admin",
            },
            timeout=20
        )
        _skip(r, "next-steps")
        assert r.status_code == 200
        d = r.json()
        assert "next_steps" in d
        assert len(d["next_steps"]) >= 1
        assert "provisioned_at" in d


class TestOnboardingStatus:
    def test_status_endpoint_requires_auth(self):
        r = requests.get(f"{BASE}/api/v1/onboarding/status", timeout=10)
        assert r.status_code in (401, 403), \
            f"Status endpoint must require auth: {r.status_code}"

    def test_status_returns_completion_pct(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/onboarding/status",
                        headers=auth_headers, timeout=15)
        _skip(r, "status-pct")
        assert r.status_code == 200
        d = r.json()
        assert "completion_pct" in d
        assert 0 <= d["completion_pct"] <= 100

    def test_status_has_5_steps(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/onboarding/status",
                        headers=auth_headers, timeout=15)
        _skip(r, "status-5steps")
        assert r.status_code == 200
        d = r.json()
        assert d["steps_total"] == 5
        assert len(d["steps"]) == 5

    def test_status_main_hotel_is_100pct(self, auth_headers):
        """Default hotel with full data should be 100% complete."""
        r = requests.get(f"{BASE}/api/v1/onboarding/status",
                        headers=auth_headers, timeout=15)
        _skip(r, "status-100")
        assert r.status_code == 200
        d = r.json()
        assert d["completion_pct"] == 100
        assert d["is_complete"] is True

    def test_status_steps_have_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/onboarding/status",
                        headers=auth_headers, timeout=15)
        _skip(r, "status-fields")
        assert r.status_code == 200
        for step in r.json()["steps"]:
            assert "step" in step
            assert "name" in step
            assert "done" in step
            assert "detail" in step
            assert isinstance(step["done"], bool)
