import os, subprocess, datetime, json, sys
ROOT  = "/home/amr/AI-COMPANY-OS"
LOG   = ROOT + "/tasks/logs/polish_master.log"
TASKS = [
    ("V1_audit",      ROOT + "/tasks/polish/v1_audit.py"),
    ("V2_components", ROOT + "/tasks/polish/v2_upgrade_components.py"),
    ("V3_centers",    ROOT + "/tasks/polish/v3_module_centers.py"),
    ("V4_final",      ROOT + "/tasks/polish/v4_final.py"),
]
def log(m):
    ts=datetime.datetime.now().strftime("%H:%M:%S")
    out="["+ts+"] "+str(m)
    print(out,flush=True)
    open(LOG,"a").write(out+"\n")
filter_task = sys.argv[1] if len(sys.argv)>1 else None
open(LOG,"w").close()
log("="*55)
log("AI COMPANY OS — FULL PORTAL POLISH v3.1.0")
log("="*55)
summary={}
tasks_to_run=[(n,p) for n,p in TASKS if not filter_task or filter_task in n]
log(f"Running {len(tasks_to_run)} tasks")
for name,path in tasks_to_run:
    log("\n"+"─"*40)
    log(f"RUNNING: {name}")
    if not os.path.exists(path):
        log("  SKIP"); summary[name]="SKIPPED"; continue
    start=datetime.datetime.now()
    try:
        r=subprocess.run(["python3",path],capture_output=False,timeout=600)
        secs=(datetime.datetime.now()-start).seconds
        status=f"PASSED ({secs}s)" if r.returncode==0 else "FAILED"
        log(f"  {status}"); summary[name]=status
    except Exception as e:
        log(f"  ERROR: {e}"); summary[name]="ERROR"
log("\n"+"="*55)
log("PORTAL POLISH COMPLETE")
passed=sum(1 for v in summary.values() if "PASSED" in v)
log(f"Results: {passed}/{len(summary)} passed")
for n,s in summary.items():
    log(f"  [{'OK' if 'PASSED' in s else 'XX'}] {n}: {s}")
with open(ROOT+"/tasks/logs/polish_summary.json","w") as f:
    json.dump({"date":str(datetime.datetime.now()),"tasks":summary},f,indent=2)
log("\nVersion: v3.1.0 — One Ecosystem Platform")
log("All enterprise modules unified in one design system")
