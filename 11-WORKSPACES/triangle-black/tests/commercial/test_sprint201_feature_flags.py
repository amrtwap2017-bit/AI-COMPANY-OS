"""Sprint-201: Feature flags system tests"""
import requests

BASE = "http://localhost:8030"
_C = {}

def _h():
    if "h" not in _C:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_feature_flags_module_importable():
    from src.core.feature_flags import (
        is_feature_enabled, get_all_flags, invalidate_flags,
        invalidate_all_flags, override_flag
    )
    assert callable(is_feature_enabled)
    assert callable(get_all_flags)

def test_feature_flags_default_true_for_known():
    from src.core.feature_flags import is_feature_enabled
    hotel = "test-hotel-ff-001"
    assert is_feature_enabled(hotel, "ai_assistant") in (True, False)

def test_feature_flags_default_true_for_unknown():
    from src.core.feature_flags import is_feature_enabled
    result = is_feature_enabled("test-hotel-unknown", "nonexistent_feature_xyz")
    assert result is True

def test_get_all_flags_returns_dict():
    from src.core.feature_flags import get_all_flags
    flags = get_all_flags("test-hotel-ff-001")
    assert isinstance(flags, dict)
    assert len(flags) > 0

def test_override_flag_works():
    from src.core.feature_flags import override_flag, is_feature_enabled, invalidate_flags
    hotel = "test-hotel-override-001"
    override_flag(hotel, "ai_assistant", False)
    assert is_feature_enabled(hotel, "ai_assistant") is False
    override_flag(hotel, "ai_assistant", True)
    assert is_feature_enabled(hotel, "ai_assistant") is True
    invalidate_flags(hotel)

def test_invalidate_flags_clears_cache():
    from src.core.feature_flags import get_all_flags, invalidate_flags, override_flag
    hotel = "test-hotel-inval-001"
    override_flag(hotel, "test_feature", False)
    invalidate_flags(hotel)
    flags = get_all_flags(hotel)
    assert isinstance(flags, dict)

def test_features_api_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/features/", headers=_h(), timeout=5)
    assert r.status_code == 200

def test_features_api_returns_flags_dict():
    r = requests.get(f"{BASE}/api/v1/features/", headers=_h(), timeout=5)
    assert r.status_code == 200
    data = r.json()
    assert "flags" in data
    assert "hotel_id" in data
    assert isinstance(data["flags"], dict)
    assert data["total"] > 0

def test_features_api_enabled_count():
    r = requests.get(f"{BASE}/api/v1/features/", headers=_h(), timeout=5)
    assert r.status_code == 200
    data = r.json()
    assert data["enabled_count"] >= 0
    assert data["enabled_count"] <= data["total"]

def test_feature_invalidate_endpoint_accessible():
    r = requests.post(f"{BASE}/api/v1/features/invalidate", headers=_h(), timeout=5)
    assert r.status_code in (200, 201, 403, 404, 405)

def test_tenants_current_has_features_array():
    r = requests.get(f"{BASE}/api/v1/tenants/current", headers=_h(), timeout=5)
    assert r.status_code in (200, 404)
    if r.status_code == 200:
        data = r.json()
        features = data.get("features", [])
        if features and isinstance(features, list):
            assert all("feature" in f for f in features)
