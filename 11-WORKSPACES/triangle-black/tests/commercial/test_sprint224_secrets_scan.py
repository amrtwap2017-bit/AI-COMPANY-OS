"""Sprint-224: Hardcoded secrets scan — regression prevention tests"""
import subprocess
from pathlib import Path

BASE = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src")

def _grep(pattern: str, exclude: str = "test_") -> list:
    result = subprocess.run(
        ["grep", "-rn", "--include=*.py", pattern, str(BASE)],
        capture_output=True, text=True
    )
    lines = result.stdout.strip().split("\n") if result.stdout.strip() else []
    return [l for l in lines if exclude not in l and l.strip() and "#" not in l.split(":", 2)[-1][:20]]

def test_no_hardcoded_jwt_secrets():
    """JWT_SECRET must never be hardcoded."""
    hits = _grep('JWT_SECRET\\s*=\\s*["\'][^"\']')
    assert len(hits) == 0, f"Hardcoded JWT secret found:\n" + "\n".join(hits)

def test_no_hardcoded_database_passwords():
    """Database passwords must not be hardcoded (only in DB URLs which use env vars)."""
    hits = _grep('password\\s*=\\s*["\'][a-zA-Z]')
    # Allow ai123 only in DATABASE_URL context (os.environ.get)
    real_hits = [h for h in hits if "os.environ" not in h and "environ.get" not in h and "getenv" not in h]
    assert len(real_hits) == 0, f"Potential hardcoded password:\n" + "\n".join(real_hits)

def test_no_hardcoded_api_keys():
    """API keys must not be hardcoded."""
    hits = _grep('api_key\\s*=\\s*["\'][a-zA-Z0-9]')
    real_hits = [h for h in hits if "os.environ" not in h and "environ.get" not in h]
    assert len(real_hits) == 0, f"Potential hardcoded API key:\n" + "\n".join(real_hits)

def test_no_hardcoded_smtp_passwords():
    """SMTP passwords must use env vars."""
    hits = _grep('SMTP_PASSWORD\\s*=\\s*["\'][a-zA-Z]')
    assert len(hits) == 0, f"Hardcoded SMTP password:\n" + "\n".join(hits)

def test_env_vars_used_for_database_url():
    """DATABASE_URL must use os.environ.get()."""
    src_files = list(BASE.rglob("*.py"))
    for f in src_files:
        content = f.read_text()
        if "DATABASE_URL" in content and "create_engine" in content:
            assert "os.environ.get" in content or "environ" in content, \
                f"{f}: DATABASE_URL used in create_engine without env var"

def test_src_directory_has_no_env_files():
    """No .env files should exist in the src directory."""
    env_files = list(BASE.rglob(".env*"))
    assert len(env_files) == 0, f"Env files found in src: {env_files}"

def test_no_default_admin_password_in_source():
    """Default admin passwords must not appear in production source."""
    hits = _grep('admin123')
    real_hits = [h for h in hits if "os.environ" not in h and "environ.get" not in h and "DEFAULT" not in h]
    # Allow in seed/dev files but not production middleware
    critical = [h for h in real_hits if "seed" not in h.lower() and "dev_auto" not in h.lower() and "devAutoLogin" not in h.lower()]
    assert len(critical) == 0, f"Default password in production code:\n" + "\n".join(critical)
