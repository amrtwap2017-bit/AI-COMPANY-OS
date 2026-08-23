"""
Sprint D-001: Enterprise SSO & SCIM 2.0 Identity Federation Verification Test
"""
import pytest
import requests
import uuid

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

def test_sso_configuration_lifecycle():
    h = _auth()
    payload = {
        "idp_type": "saml",
        "idp_issuer": "https://sts.windows.net/marriott-corp-id/",
        "sso_url": "https://login.microsoftonline.com/saml2",
        "is_enabled": True
    }
    r_set = requests.post(f"{BASE}/api/v1/sso/config", json=payload, headers=h, timeout=10)
    assert r_set.status_code == 200
    assert r_set.json()["success"] is True

    r_get = requests.get(f"{BASE}/api/v1/sso/config", headers=h, timeout=10)
    assert r_get.status_code == 200
    assert r_get.json()["idp_type"] == "saml"
    assert r_get.json()["is_enabled"] is True

def test_scim_2_user_provisioning():
    h = _auth()
    uid = str(uuid.uuid4())[:6]
    scim_payload = {
        "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
        "userName": f"scim-tech-{uid}@hotelgroup.com",
        "name": {"formatted": f"SCIM Engineer {uid}"},
        "emails": [{"value": f"scim-tech-{uid}@hotelgroup.com", "primary": True}]
    }

    # 1. Provision via SCIM
    r_post = requests.post(f"{BASE}/api/v1/scim/v2/Users", json=scim_payload, headers=h, timeout=10)
    assert r_post.status_code == 201
    created_user = r_post.json()
    assert "id" in created_user
    assert created_user["userName"] == scim_payload["userName"]

    # 2. Query SCIM List
    r_list = requests.get(f"{BASE}/api/v1/scim/v2/Users", headers=h, timeout=10)
    assert r_list.status_code == 200
    list_resp = r_list.json()
    assert "urn:ietf:params:scim:api:messages:2.0:ListResponse" in list_resp["schemas"]
    assert list_resp["totalResults"] >= 1
