"""Sprint-226: CORS tightening and JWT secret hardening tests"""
import requests
from pathlib import Path

BASE = "http://localhost:8030"
SRC = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src")

def test_cors_allow_headers_not_wildcard():
    """CORS allow_headers must not be wildcard *."""
    main_src = (SRC / "main.py").read_text()
    assert 'allow_headers=["*"]' not in main_src
    assert 'allow_headers=["*"]' not in main_src

def test_cors_allow_headers_includes_authorization():
    """CORS allow_headers must include Authorization."""
    main_src = (SRC / "main.py").read_text()
    assert '"Authorization"' in main_src

def test_cors_allow_headers_includes_content_type():
    """CORS allow_headers must include Content-Type."""
    main_src = (SRC / "main.py").read_text()
    assert '"Content-Type"' in main_src

def test_cors_production_origins_configured():
    """Production domains must be in CORS allow_origins."""
    main_src = (SRC / "main.py").read_text()
    assert "triangleblack.com" in main_src

def test_jwt_secret_uses_env_var():
    """JWT secret must prefer env var over hardcoded fallback."""
    auth_src = (SRC / "core" / "auth.py").read_text()
    assert 'os.environ.get("TB_SECRET_KEY")' in auth_src

def test_jwt_secret_fallback_is_random():
    """JWT secret fallback must be random, not predictable."""
    auth_src = (SRC / "core" / "auth.py").read_text()
    assert "triangle-black-secret-key-change-in-production" not in auth_src
    assert "token_hex" in auth_src or "secrets" in auth_src

def test_jwt_warning_when_no_env_var():
    """Warning must be logged when TB_SECRET_KEY is not set."""
    auth_src = (SRC / "core" / "auth.py").read_text()
    assert "TB_SECRET_KEY" in auth_src
    assert "warning" in auth_src.lower() or "WARNING" in auth_src

def test_jwt_token_expiry_is_reasonable():
    """Access token expiry must be between 1 and 24 hours."""
    auth_src = (SRC / "core" / "auth.py").read_text()
    import re
    m = re.search(r"ACCESS_TOKEN_EXPIRE_MINUTES\s*=\s*(\d+\s*\*\s*\d+|\d+)", auth_src)
    assert m, "ACCESS_TOKEN_EXPIRE_MINUTES not found"
    val_str = m.group(1).replace(" ", "")
    val = eval(val_str)
    assert 60 <= val <= 60*24, f"Token expiry {val} minutes not in range 60-1440"

def test_valid_login_still_works_after_cors_change():
    """Valid login must still work after CORS headers change."""
    r = requests.post(f"{BASE}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
    assert r.status_code == 200
    assert "access_token" in r.json()
