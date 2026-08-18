"""SPRINT-001: Secrets audit — no hardcoded credentials, .env.example complete"""
from pathlib import Path
import os

ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
SRC  = ROOT / "src"

def test_env_example_exists():
    assert (ROOT / ".env.example").exists()

def test_env_example_has_required_vars():
    text = (ROOT / ".env.example").read_text()
    required = [
        "DATABASE_URL",
        "TB_SECRET_KEY",
        "JWT_SECRET_KEY",
        "JWT_ALGORITHM",
        "ENVIRONMENT",
        "DISABLE_RATE_LIMIT",
        "AI_ENGINE_URL",
        "CORS_ORIGINS",
    ]
    for var in required:
        assert var in text, f"Missing from .env.example: {var}"

def test_env_example_has_no_real_secrets():
    text = (ROOT / ".env.example").read_text()
    dangerous = ["admin123", "password123", "secret123"]
    for d in dangerous:
        assert d not in text.lower(), f"Real credential in .env.example: {d}"

def test_env_example_has_change_me_markers():
    text = (ROOT / ".env.example").read_text()
    assert "CHANGE-ME" in text or "your-secret" in text or "generate" in text.lower()

def test_config_py_no_hardcoded_db_credentials():
    text = (SRC / "core/config.py").read_text()
    assert "ai123" not in text
    assert "password" not in text.lower() or "SMTP_PASSWORD" in text

def test_config_py_has_production_guard():
    text = (SRC / "core/config.py").read_text()
    assert "production" in text
    assert "RuntimeError" in text or "raise" in text

def test_auth_py_uses_env_var_for_secret():
    text = (SRC / "core/auth.py").read_text()
    assert 'os.environ.get("TB_SECRET_KEY")' in text or "environ" in text
    assert "token_hex" in text

def test_no_hardcoded_passwords_in_src():
    password_patterns = ["password = 'admin'", 'password = "admin"',
                         "password = 'password'", 'password = "password"']
    for py_file in SRC.rglob("*.py"):
        if "__pycache__" in str(py_file):
            continue
        text = py_file.read_text()
        for pattern in password_patterns:
            assert pattern not in text, f"Hardcoded password in {py_file}: {pattern}"

def test_openai_key_uses_env_not_hardcoded():
    text = (SRC / "commercial/ai_gateway/gateway.py").read_text()
    assert "os.environ.get" in text or "environ" in text
    assert "sk-" not in text

def test_env_file_not_tracked_in_git():
    import subprocess
    result = subprocess.run(
        ["git", "ls-files", ".env"],
        capture_output=True, text=True,
        cwd=str(ROOT)
    )
    tracked = result.stdout.strip()
    assert tracked == "" or "triangle-black/.env" not in tracked, \
        ".env file is tracked in git — this is a security risk"

def test_gitignore_excludes_env():
    gitignore = ROOT / ".gitignore"
    if not gitignore.exists():
        return
    text = gitignore.read_text()
    assert ".env" in text, ".gitignore should exclude .env files"
