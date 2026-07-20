#!/usr/bin/env python3
# BE-001: Fix database configuration
# Switches triangle-black from SQLite to PostgreSQL
import os, subprocess, datetime, urllib.request, json

TB   = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"
LOG  = "/home/amr/AI-COMPANY-OS/tasks/logs/be001.log"

def log(m):
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    msg = f"[{ts}] {m}"
    print(msg, flush=True)
    open(LOG, "a").write(msg + "\n")

open(LOG, "w").close()
log("BE-001: Fix Database Configuration")
log("=" * 50)

# Step 1: Update .env
log("Step 1: Update .env to use PostgreSQL")
env_content = (
    "# Triangle Black — Database Configuration\n"
    "# BE-001: Fixed to use PostgreSQL (ai-postgres container)\n"
    "DATABASE_URL=postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black\n"
    "TRIANGLE_BLACK_DB_URL=postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black\n"
    "AI_ENGINE_URL=http://localhost:8001\n"
    "ENVIRONMENT=development\n"
    "SECRET_KEY=tb-dev-secret-key-2026\n"
    "POSTGRES_URL=postgresql://ai:ai123@localhost:5432/triangle_black\n"
    "JWT_SECRET_KEY=tb-jwt-secret-2026\n"
    "JWT_ALGORITHM=HS256\n"
    "JWT_EXPIRE_MINUTES=1440\n"
)
with open(TB + "/.env", "w") as f:
    f.write(env_content)
log("  OK: .env updated to PostgreSQL")

# Step 2: Create triangle_black database in PostgreSQL
log("Step 2: Create triangle_black database")
env = {**os.environ, "PGPASSWORD": "ai123"}
r = subprocess.run(
    ["psql", "-U", "ai", "-h", "localhost", "-d", "postgres",
     "-c", "CREATE DATABASE triangle_black;"],
    capture_output=True, text=True, env=env
)
if "already exists" in r.stderr or r.returncode == 0:
    log("  OK: triangle_black database ready")
else:
    log(f"  WARN: {r.stderr[:100]}")

# Step 3: Verify connection
log("Step 3: Verify database connection")
r2 = subprocess.run(
    ["psql", "-U", "ai", "-h", "localhost", "-d", "triangle_black",
     "-c", "SELECT current_database(), current_user;"],
    capture_output=True, text=True, env=env
)
if r2.returncode == 0:
    log("  OK: Connected to triangle_black")
    log("  " + r2.stdout.strip().replace("\n", " "))
else:
    log(f"  ERR: {r2.stderr[:100]}")

# Step 4: Restart TB Admin
log("Step 4: Restart TB Admin to pick up new DB config")
subprocess.run(["pkill", "-f", "uvicorn.*8030"], capture_output=True)
subprocess.run(["pkill", "-f", "main.*8030"],   capture_output=True)
import time; time.sleep(2)

venv_python = TB + "/.venv/bin/python"
if not os.path.exists(venv_python):
    venv_python = "/usr/bin/python3"

env2 = {**env,
    "DATABASE_URL": "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black",
    "TRIANGLE_BLACK_DB_URL": "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black",
}
proc = subprocess.Popen(
    [venv_python, "-m", "uvicorn", "main:app",
     "--host", "0.0.0.0", "--port", "8030", "--reload"],
    cwd=TB, stdout=open("/tmp/tbadmin.log","w"),
    stderr=subprocess.STDOUT, env=env2
)
log(f"  TB Admin PID: {proc.pid}")
time.sleep(6)

# Step 5: Verify health
log("Step 5: Verify health endpoint")
try:
    with urllib.request.urlopen("http://localhost:8030/health", timeout=5) as r:
        data = json.loads(r.read())
        log(f"  Health: {data}")
        if data.get("db") == "connected":
            log("  OK: Database connected")
        else:
            log("  WARN: DB status: " + str(data.get("db")))
except Exception as e:
    log(f"  ERR: {e}")
    log("  Check: tail -20 /tmp/tbadmin.log")

log("\n" + "=" * 50)
log("BE-001 COMPLETE")
log("Next: python3 tasks/portal/be002_migrations.py")
