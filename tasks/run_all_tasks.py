"""
MASTER TASK RUNNER — AI Company OS
=====================================
Runs all portal/hub upgrade tasks in sequence.
Each task is independent — failure of one does not stop others.
Full log saved to /home/amr/AI-COMPANY-OS/tasks/logs/master.log
"""
import os, subprocess, datetime, json

ROOT = "/home/amr/AI-COMPANY-OS/tasks"
LOG  = ROOT + "/logs/master.log"
os.makedirs(ROOT + "/logs", exist_ok=True)

TASKS = [
    ("task_01_typescript_health", ROOT + "/portal/task_01_typescript_health.py"),
    ("task_02_security",          ROOT + "/security/task_02_security.py"),
    ("task_03_data_health",       ROOT + "/data/task_03_data_health.py"),
    ("task_04_missing_files",     ROOT + "/portal/task_04_missing_files.py"),
    ("task_05_hub_wiring",        ROOT + "/hub/task_05_hub_wiring.py"),
]

def log(msg):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = f"[{ts}] {msg}"
    print(out, flush=True)
    with open(LOG, "a") as f:
        f.write(out + "\n")

summary = {}
open(LOG, "w").close()

log("=" * 50)
log("AI COMPANY OS — MASTER UPGRADE RUNNER")
log("=" * 50)
log(f"Tasks to run: {len(TASKS)}")
log(f"Start: {datetime.datetime.now()}")
log("")

for name, path in TASKS:
    log(f"\n{'─'*40}")
    log(f"RUNNING: {name}")
    log(f"File:    {path}")

    if not os.path.exists(path):
        log(f"  ❌ FILE NOT FOUND: {path}")
        summary[name] = "FILE_NOT_FOUND"
        continue

    start = datetime.datetime.now()
    try:
        r = subprocess.run(
            ["python3", path],
            capture_output=False,  # show output live
            timeout=300,
        )
        duration = (datetime.datetime.now() - start).seconds
        if r.returncode == 0:
            log(f"  ✅ {name} — PASSED in {duration}s")
            summary[name] = f"PASSED ({duration}s)"
        else:
            log(f"  ❌ {name} — FAILED (code {r.returncode})")
            summary[name] = f"FAILED (code {r.returncode})"
    except subprocess.TimeoutExpired:
        log(f"  ⏱  {name} — TIMEOUT (300s)")
        summary[name] = "TIMEOUT"
    except Exception as e:
        log(f"  ❌ {name} — ERROR: {e}")
        summary[name] = f"ERROR: {e}"

# ── Final Summary ─────────────────────────────────────────────
log("\n" + "="*50)
log("MASTER RUNNER COMPLETE")
log("="*50)
passed  = sum(1 for v in summary.values() if v.startswith("PASSED"))
failed  = len(summary) - passed
log(f"Passed: {passed}/{len(summary)}")
log(f"Failed: {failed}/{len(summary)}")
log("")
for name, status in summary.items():
    icon = "✅" if status.startswith("PASSED") else "❌"
    log(f"  {icon} {name}: {status}")

# Save summary
with open(ROOT + "/logs/master_summary.json", "w") as f:
    json.dump({
        "date":    str(datetime.datetime.now()),
        "passed":  passed,
        "failed":  failed,
        "tasks":   summary,
    }, f, indent=2)

log(f"\nFull logs: {ROOT}/logs/")
log(f"Summary:   {ROOT}/logs/master_summary.json")
# Tasks 09-11 are appended automatically
