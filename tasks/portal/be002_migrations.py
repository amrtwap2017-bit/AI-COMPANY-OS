#!/usr/bin/env python3
# BE-002: Run Alembic migrations
import os, subprocess, datetime

TB  = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"
LOG = "/home/amr/AI-COMPANY-OS/tasks/logs/be002.log"

def log(m):
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    msg = f"[{ts}] {m}"
    print(msg, flush=True)
    open(LOG, "a").write(msg + "\n")

open(LOG, "w").close()
log("BE-002: Alembic Migrations")

env = {**os.environ,
    "DATABASE_URL": "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black",
    "TRIANGLE_BLACK_DB_URL": "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black",
}

venv = TB + "/.venv/bin"
alembic = venv + "/alembic" if os.path.exists(venv + "/alembic") else "alembic"

log("Step 1: Check current alembic state")
r = subprocess.run([alembic, "current"], cwd=TB, capture_output=True, text=True, env=env)
log("  " + (r.stdout or r.stderr)[:200].strip())

log("Step 2: Generate migration from models")
r2 = subprocess.run(
    [alembic, "revision", "--autogenerate", "-m", "full_schema_v2"],
    cwd=TB, capture_output=True, text=True, env=env
)
log("  " + (r2.stdout or r2.stderr)[:300].strip())

log("Step 3: Apply migration")
r3 = subprocess.run(
    [alembic, "upgrade", "head"],
    cwd=TB, capture_output=True, text=True, env=env
)
log("  " + (r3.stdout or r3.stderr)[:300].strip())

log("Step 4: List tables in PostgreSQL")
env2 = {**env, "PGPASSWORD": "ai123"}
r4 = subprocess.run(
    ["psql", "-U", "ai", "-h", "localhost", "-d", "triangle_black",
     "-c", "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"],
    capture_output=True, text=True, env=env2
)
log("  Tables:\n" + r4.stdout[:500])

log("BE-002 COMPLETE")
log("Next: python3 tasks/portal/be015_seed_data.py")
