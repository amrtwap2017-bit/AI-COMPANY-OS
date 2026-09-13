"""
Browser E2E Configuration — Triangle Black
Requires: portal running on localhost:3000 + API on localhost:8030
Run: npx next dev (in portal/) before running these tests
"""
import pytest
import subprocess
import json


def pytest_configure(config):
    config.addinivalue_line(
        "markers",
        "browser_e2e: marks tests requiring browser + running portal"
    )


@pytest.fixture(scope="session")
def api_token():
    """Get API token for test user."""
    r = subprocess.run(
        ['curl', '-s', '-X', 'POST',
         'http://localhost:8030/api/v1/auth/login/json',
         '-H', 'Content-Type: application/json',
         '-d', '{"email":"amr@triangleblack.com","password":"admin123"}'],
        capture_output=True, text=True
    )
    try:
        return json.loads(r.stdout).get("access_token", "")
    except Exception:
        return ""


@pytest.fixture(scope="session")
def base_url():
    return "http://localhost:3000"


@pytest.fixture(scope="session")
def api_base():
    return "http://localhost:8030"
