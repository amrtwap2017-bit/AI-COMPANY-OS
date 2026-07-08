#!/usr/bin/env python3
"""
Triangle Black AI Manager
Usage:
  .venv/bin/python3 tb-manager.py status
  .venv/bin/python3 tb-manager.py do T001
  .venv/bin/python3 tb-manager.py do all
  .venv/bin/python3 tb-manager.py add "name" "description"
"""
import json, os, sys, subprocess, re
from datetime import datetime
from pathlib import Path

try:
    import httpx
except ImportError:
    print("Run: .venv/bin/pip install httpx")
    sys.exit(1)

TB_ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
STATE_FILE = TB_ROOT / ".tb-manager-state.json"
OLLAMA_URL = "http://localhost:11434/api/chat"
API_BASE = "http://127.0.0.1:8020"

PROJECT_CONTEXT = (
    "You are the Triangle Black AI Engineering Manager.\n"
    "BUSINESS: Hotel engineering services Egypt. Annual maintenance contracts.\n"
    "SERVICES: HVAC, Electrical, Plumbing, Fire Fighting, Procurement, Pool, Kitchen, Laundry.\n"
    "STACK: FastAPI + SQLAlchemy + PostgreSQL + Next.js 16 + TypeScript + Tailwind + JWT + bcrypt + reportlab.\n"
    "DB: PostgreSQL port 5432, db=triangle_black, user=ai, pass=ai123.\n"
    "TB_ROOT: /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black\n"
    "KEY FILES:\n"
    "  src/main.py           - FastAPI app, register routers here\n"
    "  src/core/actions.py   - all business endpoints\n"
    "  src/core/auth.py      - JWT, require_agent/manager/admin\n"
    "  src/core/database.py  - get_db() dependency\n"
    "  src/core/base.py      - SQLAlchemy Base\n"
    "  src/core/pdf/generator.py - enterprise PDF\n"
    "  portal/               - Ops Portal port 3200\n"
    "  client-portal/        - Client Portal port 3201\n"
    "  admin-portal/         - Admin Portal port 3202\n"
    "API: http://127.0.0.1:8020/api/v1\n"
    "REVENUE LOOP: lead -> qualify -> assign -> quote -> submit -> send -> approve -> contract -> activate -> renew\n"
    "ROLES: admin > manager > agent > client\n"
    "RULES:\n"
    "  1. New endpoints go in src/core/actions.py\n"
    "  2. New models import Base from src.core.base\n"
    "  3. Use get_db() from src.core.database\n"
    "  4. JWT required on all endpoints\n"
    "  5. Write COMPLETE runnable code, never stubs\n"
    "  6. File paths relative to TB_ROOT\n"
)

DEFAULT_TASKS = [
    {
        "id": "T001",
        "name": "PDF download button in Ops Portal",
        "description": "Add download PDF button to portal/app/(app)/quotes/[id]/page.tsx. Button calls GET /api/v1/actions/quotes/{id}/pdf with Authorization Bearer token from localStorage tb_token. Use fetch() to get blob, create object URL, trigger download.",
        "status": "pending",
        "priority": "high",
        "files": ["portal/app/(app)/quotes/[id]/page.tsx"],
    },
    {
        "id": "T002",
        "name": "PDF download button in Client Portal",
        "description": "Add download PDF button to client-portal/app/(client)/quotes/[id]/page.tsx. Token stored in localStorage as client_token.",
        "status": "pending",
        "priority": "high",
        "files": ["client-portal/app/(client)/quotes/[id]/page.tsx"],
    },
    {
        "id": "T003",
        "name": "Lead search UI in Ops Portal",
        "description": "Add search input and status/source/priority filter dropdowns to portal/app/(app)/leads/page.tsx. Call GET /api/v1/actions/leads/search?q=&status=&source=&priority= and show results in same kanban/list view.",
        "status": "pending",
        "priority": "high",
        "files": ["portal/app/(app)/leads/page.tsx"],
    },
    {
        "id": "T004",
        "name": "Client Portal contracts pages",
        "description": "Create /contracts and /contracts/[id] pages in client-portal showing hotel their active contracts. Data from GET /api/v1/contracts/. Show title, status, total_value, monthly_value, start_date, end_date, services list.",
        "status": "pending",
        "priority": "medium",
        "files": [
            "client-portal/app/(client)/contracts/page.tsx",
            "client-portal/app/(client)/contracts/[id]/page.tsx",
        ],
    },
    {
        "id": "T005",
        "name": "Notifications system backend",
        "description": "Create src/commercial/notifications/models.py with Notification model (id, user_id, title, message, type, is_read, created_at). Create router with GET /notifications/ and POST /notifications/{id}/read endpoints.",
        "status": "pending",
        "priority": "medium",
        "files": [
            "src/commercial/notifications/models.py",
            "src/commercial/notifications/__init__.py",
            "src/commercial/notifications/router.py",
        ],
    },
    {
        "id": "T006",
        "name": "Production Docker Compose",
        "description": "Create docker-compose.production.yml with TB API + nginx reverse proxy + PostgreSQL. API on internal network, nginx exposes ports 80/443. Include .env.production template.",
        "status": "pending",
        "priority": "low",
        "files": ["docker-compose.production.yml", "nginx.conf", ".env.production.example"],
    },
]


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    state = {"tasks": DEFAULT_TASKS, "created_at": datetime.now().isoformat()}
    save_state(state)
    return state


def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))


def call_ai(prompt, model="qwen2.5-coder:7b"):
    print("  [AI] Calling", model, "...")
    try:
        resp = httpx.post(
            OLLAMA_URL,
            json={
                "model": model,
                "stream": False,
                "options": {"temperature": 0.1, "num_predict": 4096},
                "messages": [
                    {"role": "system", "content": PROJECT_CONTEXT},
                    {"role": "user", "content": prompt},
                ],
            },
            timeout=300,
        )
        resp.raise_for_status()
        return resp.json()["message"]["content"]
    except Exception as e:
        return "ERROR: " + str(e)


def run_cmd(cmd, cwd=None):
    result = subprocess.run(
        cmd, shell=True, capture_output=True, text=True,
        cwd=cwd or str(TB_ROOT)
    )
    return result.returncode, result.stdout, result.stderr


def api_health():
    try:
        r = httpx.get(API_BASE + "/health", timeout=3)
        return r.status_code == 200
    except Exception:
        return False


def execute_task(task):
    print()
    print("=" * 60)
    print("EXECUTING: [" + task["id"] + "] " + task["name"])
    print("=" * 60)

    file_list = "
".join("  - " + f for f in task.get("files", []))
    prompt = (
        "TASK: " + task["name"] + "
"
        "DESCRIPTION: " + task["description"] + "

"
        "FILES TO CREATE OR MODIFY:
" + file_list + "

"
        "Write complete production-ready code.
"
        "Return ONLY a JSON object:
"
        "{
"
        '  "files": [
'
        '    {"path": "relative/path/file.tsx", "content": "full content"}
'
        "  ],
"
        '  "summary": "what was built"
'
        "}

"
        "Rules:
"
        "- Paths relative to /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/
"
        "- Write COMPLETE files, never truncate
"
        "- TypeScript: valid TSX. Python: valid 3.12
"
        "- No markdown, no explanation, ONLY the JSON
"
    )

    raw = call_ai(prompt)
    if raw.startswith("ERROR:"):
        print("  [ERROR]", raw)
        return False

    # Extract JSON
    parsed = None
    for pattern in [
        r'\{"files".*\}',
        r'```json\s*(\{.*?\})\s*```',
        r'```\s*(\{.*?\})\s*```',
    ]:
        m = re.search(pattern, raw, re.DOTALL)
        if m:
            try:
                candidate = m.group(1) if m.lastindex else m.group(0)
                parsed = json.loads(candidate)
                break
            except Exception:
                continue

    if not parsed:
        print("  [ERROR] Could not parse JSON from AI response")
        print("  Raw preview:", raw[:300])
        return False

    files = parsed.get("files", [])
    if not files:
        print("  [ERROR] No files in response")
        return False

    written = []
    for f in files:
        rel = f.get("path", "").lstrip("/")
        content = f.get("content", "")
        if not rel or not content:
            continue
        full = TB_ROOT / rel
        full.parent.mkdir(parents=True, exist_ok=True)
        full.write_text(content, encoding="utf-8")
        written.append(rel)
        print("  [WRITE]", rel, "(" + str(len(content)) + " chars)")

    if not written:
        print("  [ERROR] No files written")
        return False

    print("  [OK]", len(written), "files written")
    print("  [SUMMARY]", parsed.get("summary", ""))

    run_cmd("git add " + " ".join(written))
    msg = "feat: [" + task["id"] + "] " + task["name"]
    rc, out, err = run_cmd("git commit -m " + repr(msg))
    if rc == 0:
        print("  [GIT] Committed")
    else:
        print("  [GIT]", err[:80] if err else "nothing new")

    return True


def cmd_status():
    state = load_state()
    tasks = state["tasks"]
    pending = [t for t in tasks if t["status"] == "pending"]
    done = [t for t in tasks if t["status"] == "done"]
    failed = [t for t in tasks if t["status"] == "failed"]

    print()
    print("=== TRIANGLE BLACK AI MANAGER ===")
    print("API Health:", "UP" if api_health() else "DOWN")
    print()
    print("TASKS:", len(pending), "pending |", len(done), "done |", len(failed), "failed")
    print()

    if pending:
        print("PENDING:")
        for t in pending:
            p = "[HIGH]" if t["priority"] == "high" else "[MED] " if t["priority"] == "medium" else "[LOW] "
            print(" ", p, "[" + t["id"] + "]", t["name"])

    if done:
        print()
        print("COMPLETED:")
        for t in done:
            print("  [DONE]", "[" + t["id"] + "]", t["name"])

    if failed:
        print()
        print("FAILED:")
        for t in failed:
            print("  [FAIL]", "[" + t["id"] + "]", t["name"])

    print()
    print("COMMANDS:")
    print("  .venv/bin/python3 tb-manager.py do T001   - execute task")
    print("  .venv/bin/python3 tb-manager.py do all    - execute all pending")
    print("  .venv/bin/python3 tb-manager.py add 'name' 'desc' - add task")
    print("  .venv/bin/python3 tb-manager.py reset T001 - reset failed task")


def cmd_do(task_id):
    state = load_state()
    if task_id.lower() == "all":
        pending = [t for t in state["tasks"] if t["status"] == "pending"]
        print("Executing", len(pending), "pending tasks...")
        for task in pending:
            ok = execute_task(task)
            task["status"] = "done" if ok else "failed"
            save_state(state)
        return
    task = next((t for t in state["tasks"] if t["id"] == task_id), None)
    if not task:
        print("Task", task_id, "not found")
        return
    ok = execute_task(task)
    task["status"] = "done" if ok else "failed"
    save_state(state)
    print()
    print("DONE" if ok else "FAILED", ":", task["name"])


def cmd_add(name, description):
    state = load_state()
    new_id = "T" + str(len(state["tasks"]) + 1).zfill(3)
    state["tasks"].append({
        "id": new_id, "name": name, "description": description,
        "status": "pending", "priority": "medium", "files": [],
    })
    save_state(state)
    print("Added", new_id, ":", name)


def cmd_reset(task_id):
    state = load_state()
    task = next((t for t in state["tasks"] if t["id"] == task_id), None)
    if task:
        task["status"] = "pending"
        save_state(state)
        print("Reset", task_id, "to pending")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0] == "status":
        cmd_status()
    elif args[0] == "do" and len(args) >= 2:
        cmd_do(args[1])
    elif args[0] == "add" and len(args) >= 3:
        cmd_add(args[1], args[2])
    elif args[0] == "reset" and len(args) >= 2:
        cmd_reset(args[1])
    elif args[0] == "context":
        print(PROJECT_CONTEXT)
    else:
        print("Usage: .venv/bin/python3 tb-manager.py [status|do <id>|do all|add <name> <desc>|reset <id>]")
