"""Sprint D-025: SSO Identity Management Portal + SCIM Provisioning"""
import requests
import uuid

BASE = "http://localhost:8030"
_C = {}

def _auth():
    if "h" not in _C:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        assert r.status_code == 200
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_sso_config_save_and_retrieve():
    h = _auth()
    r = requests.post(f"{BASE}/api/v1/sso/config",
        json={"idp_type": "saml", "idp_issuer": "https://sts.windows.net/corp/", "sso_url": "https://login.microsoft.com/saml2", "is_enabled": True},
        headers=h, timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert d["success"] is True
    assert d["idp_type"] == "saml"

    r2 = requests.get(f"{BASE}/api/v1/sso/config", headers=h, timeout=10)
    assert r2.status_code == 200
    d2 = r2.json()
    assert d2["idp_type"] == "saml"
    assert d2["is_enabled"] is True

def test_scim_user_provision_and_list():
    h = _auth()
    uid = str(uuid.uuid4())[:6]
    scim_user = {
        "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
        "userName": f"engineer-{uid}@hotel.com",
        "name": {"formatted": f"Engineer {uid}"},
        "emails": [{"value": f"engineer-{uid}@hotel.com", "primary": True}]
    }
    r = requests.post(f"{BASE}/api/v1/scim/v2/Users", json=scim_user, headers=h, timeout=10)
    assert r.status_code == 201
    d = r.json()
    assert "id" in d
    assert d["userName"] == scim_user["userName"]
    assert "urn:ietf:params:scim:schemas:core:2.0:User" in d["schemas"]

    r2 = requests.get(f"{BASE}/api/v1/scim/v2/Users", headers=h, timeout=10)
    assert r2.status_code == 200
    d2 = r2.json()
    assert "urn:ietf:params:scim:api:messages:2.0:ListResponse" in d2["schemas"]
    assert d2["totalResults"] >= 1

def test_full_identity_flow():
    h = _auth()
    # 1. Configure SSO
    r1 = requests.post(f"{BASE}/api/v1/sso/config",
        json={"idp_type": "oidc", "idp_issuer": "https://accounts.google.com", "sso_url": "https://accounts.google.com/o/oauth2/auth", "is_enabled": True},
        headers=h, timeout=10)
    assert r1.status_code == 200

    # 2. Provision user
    uid = str(uuid.uuid4())[:6]
    r2 = requests.post(f"{BASE}/api/v1/scim/v2/Users",
        json={"schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"], "userName": f"sso-{uid}@corp.com", "name": {"formatted": f"SSO User {uid}"}},
        headers=h, timeout=10)
    assert r2.status_code == 201

    # 3. List shows new user
    r3 = requests.get(f"{BASE}/api/v1/scim/v2/Users", headers=h, timeout=10)
    assert r3.status_code == 200
    assert r3.json()["totalResults"] >= 1
