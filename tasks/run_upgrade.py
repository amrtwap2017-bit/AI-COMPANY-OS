import os, subprocess, datetime, json, sys

ROOT  = "/home/amr/AI-COMPANY-OS"
LOG   = ROOT + "/tasks/logs/upgrade_master.log"
TASKS = [
    ("U1_git_cleanup",    ROOT + "/tasks/upgrade/u1_git_cleanup.py"),
    ("U2_portal_startup", ROOT + "/tasks/upgrade/u2_portal_startup.py"),
    ("U3_tbadmin_auth",   ROOT + "/tasks/upgrade/u3_tbadmin_auth.py"),
    ("U4_standards_audit",ROOT + "/tasks/upgrade/u4_standards_audit.py"),
    ("U5_final_verify",   ROOT + "/tasks/upgrade/u5_final_verify.py"),
]

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "["+ts+"] "+str(m)
    print(out, flush=True)
    open(LOG, "a").write(out+"\n")

# Allow running single task: python3 run_upgrade.py U2
filter_task = sys.argv[1] if len(sys.argv) > 1 else None

open(LOG, "w").close()
log("="*50)
log("AI COMPANY OS — UPGRADE MASTER RUNNER")
log("="*50)
summary = {}

tasks_to_run = [(n,p) for n,p in TASKS if not filter_task or filter_task in n]
log(f"Running {len(tasks_to_run)} tasks" + (f" (filter: {filter_task})" if filter_task else ""))

for name, path in tasks_to_run:
    log("\n"+"─"*40)
    log(f"RUNNING: {name}")
    if not os.path.exists(path):
        log(f"  SKIP not found")
        summary[name] = "SKIPPED"
        continue
    start = datetime.datetime.now()
    try:
        r = subprocess.run(["python3", path], capture_output=False, timeout=600)
        secs = (datetime.datetime.now() - start).seconds
        status = f"PASSED ({secs}s)" if r.returncode == 0 else f"FAILED"
        log(f"  {status}")
        summary[name] = status
    except subprocess.TimeoutExpired:
        log("  TIMEOUT")
        summary[name] = "TIMEOUT"
    except Exception as e:
        log(f"  ERROR: {e}")
        summary[name] = f"ERROR"

log("\n"+"="*50)
log("UPGRADE COMPLETE")
passed = sum(1 for v in summary.values() if "PASSED" in v)
log(f"Results: {passed}/{len(summary)} passed")
for n,s in summary.items():
    icon = "OK" if "PASSED" in s else "XX"
    log(f"  [{icon}] {n}: {s}")

with open(ROOT+"/tasks/logs/upgrade_summary.json","w") as f:
    json.dump({"date":str(datetime.datetime.now()),"tasks":summary},f,indent=2)

log("\nNext: bash /home/amr/AI-COMPANY-OS/START-SAFE.sh")
log("      bash /home/amr/AI-COMPANY-OS/HEALTH-MONITOR.sh")
