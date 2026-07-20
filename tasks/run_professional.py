import os, subprocess, datetime, json, sys

ROOT  = "/home/amr/AI-COMPANY-OS"
LOG   = ROOT + "/tasks/logs/professional_master.log"
TASKS = [
    ("P1_fix_types",       ROOT + "/tasks/professional/p1_fix_types.py"),
    ("P2_error_loading",   ROOT + "/tasks/professional/p2_error_loading.py"),
    ("P3_api_quality",     ROOT + "/tasks/professional/p3_api_quality.py"),
    ("P4_add_tests",       ROOT + "/tasks/professional/p4_add_tests.py"),
    ("P5_documentation",   ROOT + "/tasks/professional/p5_documentation.py"),
    ("P6_final_rebuild",   ROOT + "/tasks/professional/p6_final_rebuild.py"),
]

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "["+ts+"] "+str(m)
    print(out, flush=True)
    open(LOG, "a").write(out+"\n")

filter_task = sys.argv[1] if len(sys.argv) > 1 else None
open(LOG, "w").close()
log("="*50)
log("AI COMPANY OS — PROFESSIONAL UPGRADE")
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
        status = f"PASSED ({secs}s)" if r.returncode == 0 else "FAILED"
        log(f"  {status}")
        summary[name] = status
    except Exception as e:
        log(f"  ERROR: {e}")
        summary[name] = "ERROR"

log("\n"+"="*50)
log("PROFESSIONAL UPGRADE COMPLETE")
passed = sum(1 for v in summary.values() if "PASSED" in v)
log(f"Results: {passed}/{len(summary)} passed")
for n,s in summary.items():
    icon = "OK" if "PASSED" in s else "XX"
    log(f"  [{icon}] {n}: {s}")

with open(ROOT+"/tasks/logs/professional_summary.json","w") as f:
    json.dump({"date":str(datetime.datetime.now()),"tasks":summary},f,indent=2)

log("\nVersion: v2.1.0")
log("Portal: 137 pages PROD mode")
log("Start: bash /home/amr/AI-COMPANY-OS/START-SAFE.sh")
