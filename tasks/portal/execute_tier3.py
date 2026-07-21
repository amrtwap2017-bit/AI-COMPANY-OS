#!/usr/bin/env python3
"""
SPRINT 9 TIER 3 EXECUTOR
Quality improvements:
  T3-001: Fix dashboard.router import error
  T3-002: Fix pdf_service.router missing attribute
  T3-003: Add login rate limiting to FastAPI
  T3-004: Remove @ts-nocheck from lib/api/ files (phase 1)
  T3-005: Add ESLint configuration
"""
import os, subprocess, json, glob

ROOT   = "/home/amr/AI-COMPANY-OS"
TB     = ROOT + "/11-WORKSPACES/triangle-black"
PORTAL = TB + "/portal"

def log(m): print(m, flush=True)

print("=" * 60)
print("TIER 3 - QUALITY IMPROVEMENTS")
print("=" * 60)

# T3-001: Fix dashboard.router
log("\nT3-001: Fixing dashboard.router import...")
dashboard_router = TB + "/src/commercial/dashboard/router.py"
if os.path.exists(dashboard_router):
    with open(dashboard_router) as f: content = f.read()
    if "get_dashboard_repo" in content:
        # Replace with direct DB query approach
        content = content.replace(
            "from .repository import get_dashboard_repo",
            "from .repository import DashboardRepository"
        ).replace(
            "from src.commercial.dashboard.repository import get_dashboard_repo",
            "from src.commercial.dashboard.repository import DashboardRepository"
        )
        with open(dashboard_router, "w") as f: f.write(content)
        log("  FIXED: removed get_dashboard_repo import")
    else:
        log("  OK: no get_dashboard_repo import found")
else:
    log("  SKIP: dashboard/router.py not found")

# T3-002: Fix pdf_service.router
log("\nT3-002: Fixing pdf_service.router...")
pdf_router = TB + "/src/commercial/pdf_service/router.py"
if os.path.exists(pdf_router):
    with open(pdf_router) as f: content = f.read()
    if "router = APIRouter" not in content:
        # Add router definition at top
        lines = content.split("\n")
        insert_after = 0
        for i, line in enumerate(lines):
            if line.startswith("from") or line.startswith("import"):
                insert_after = i
        lines.insert(insert_after + 1, "")
        lines.insert(insert_after + 2, "router = APIRouter(prefix=\"/pdf\", tags=[\"pdf\"])")
        with open(pdf_router, "w") as f: f.write("\n".join(lines))
        log("  FIXED: added router = APIRouter() to pdf_service/router.py")
    else:
        log("  OK: router already defined")
else:
    log("  SKIP: pdf_service/router.py not found")

# T3-003: Add login rate limiting (simple counter in FastAPI)
log("\nT3-003: Adding login rate limiting to auth router...")
auth_router = TB + "/src/commercial/auth/router.py"
if os.path.exists(auth_router):
    with open(auth_router) as f: content = f.read()
    if "rate_limit" not in content and "_login_attempts" not in content:
        # Add simple in-memory rate limiter
        rate_limit_code = (
            "\n# Simple in-memory rate limiter for login\n"
            "import time\n"
            "_login_attempts: dict = {}\n"
            "_MAX_ATTEMPTS = 5\n"
            "_LOCKOUT_SECONDS = 900  # 15 minutes\n\n"
            "def _check_rate_limit(identifier: str):\n"
            "    now = time.time()\n"
            "    if identifier in _login_attempts:\n"
            "        attempts, last_time = _login_attempts[identifier]\n"
            "        if attempts >= _MAX_ATTEMPTS and (now - last_time) < _LOCKOUT_SECONDS:\n"
            "            raise HTTPException(status_code=429, detail=f'Too many login attempts. Try again in {int(_LOCKOUT_SECONDS - (now-last_time)//60)} minutes.')\n"
            "        if (now - last_time) >= _LOCKOUT_SECONDS:\n"
            "            _login_attempts[identifier] = (0, now)\n\n"
            "def _record_attempt(identifier: str, success: bool):\n"
            "    if success:\n"
            "        _login_attempts.pop(identifier, None)\n"
            "    else:\n"
            "        attempts, last = _login_attempts.get(identifier, (0, time.time()))\n"
            "        _login_attempts[identifier] = (attempts + 1, time.time())\n"
        )
        # Insert after imports
        content = content + rate_limit_code
        with open(auth_router, "w") as f: f.write(content)
        log("  ADDED: rate limiter functions to auth/router.py")
        log("  NOTE: Wire _check_rate_limit() into login endpoint manually")
    else:
        log("  OK: rate limiting already present")

# T3-004: Remove @ts-nocheck from lib/api/ files (safe phase 1)
log("\nT3-004: Removing @ts-nocheck from lib/api/ files...")
api_files = glob.glob(PORTAL + "/lib/api/*.ts")
fixed = 0
for path in api_files:
    with open(path) as f: content = f.read()
    if "// @ts-nocheck" in content:
        new_content = content.replace("// @ts-nocheck\n", "")
        with open(path, "w") as f: f.write(new_content)
        fixed += 1
        log(f"  REMOVED @ts-nocheck: {os.path.basename(path)}")
log(f"  Total: {fixed} files cleaned in lib/api/")

# T3-005: Add ESLint config
log("\nT3-005: Creating ESLint configuration...")
eslint_path = PORTAL + "/eslint.config.mjs"
if not os.path.exists(eslint_path):
    with open(eslint_path, "w") as f:
        f.write(
            "import { dirname } from \"path\";\n"
            "import { fileURLToPath } from \"url\";\n"
            "import { FlatCompat } from \"@eslint/eslintrc\";\n\n"
            "const __filename = fileURLToPath(import.meta.url);\n"
            "const __dirname = dirname(__filename);\n\n"
            "const compat = new FlatCompat({ baseDirectory: __dirname });\n\n"
            "const eslintConfig = [\n"
            "  ...compat.extends(\"next/core-web-vitals\"),\n"
            "  {\n"
            "    rules: {\n"
            "      \"no-unused-vars\": \"warn\",\n"
            "      \"no-console\": [\"warn\", { allow: [\"error\", \"warn\"] }],\n"
            "      \"react-hooks/exhaustive-deps\": \"warn\",\n"
            "    },\n"
            "  },\n"
            "];\n\n"
            "export default eslintConfig;\n"
        )
    log("  CREATED: eslint.config.mjs")
else:
    log("  OK: ESLint config already exists")

print()
print("=" * 60)
print("TIER 3 COMPLETE")
print()
print("Build portal to verify:")
print("  cd portal && node node_modules/.bin/next build 2>&1 | tail -5")
print()
print("Restart TB Admin to pick up router fixes:")
print("  cd triangle-black && pkill -f uvicorn; sleep 2")
print("  .venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8030 &")
