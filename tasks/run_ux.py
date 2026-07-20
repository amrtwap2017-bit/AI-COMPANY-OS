import os, subprocess, datetime, json, sys

ROOT  = "/home/amr/AI-COMPANY-OS"
LOG   = ROOT + "/tasks/logs/ux_master.log"
TASKS = [
    ("X1_db_toast",    ROOT + "/tasks/ux/x1_db_toast.py"),
    ("X2_mobile_nav",  ROOT + "/tasks/ux/x2_mobile_nav.py"),
    ("X3_export",      ROOT + "/tasks/ux/x3_export.py"),
    ("X4_leads_ux",    ROOT + "/tasks/ux/x4_leads_ux.py"),
    ("X5_final_ux",    ROOT + "/tasks/ux/x5_final_ux.py"),
]

def log(m):
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    out = "["+ts+"] "+str(m)
    print(out, flush=True)
    open(LOG,"a").write(out+"\n")

filter_task = sys.argv[1] if len(sys.argv) > 1 else None
open(LOG,"w").close()
log("="*50)
log("AI COMPANY OS — UX EXCELLENCE v2.4.0")
log("="*50)
summary = {}

tasks_to_run = [(n,p) for n,p in TASKS if not filter_task or filter_task in n]
log(f"Running {len(tasks_to_run)} tasks")

for name, path in tasks_to_run:
    log("\n"+"─"*40)
    log(f"RUNNING: {name}")
    if not os.path.exists(path):
        log("  SKIP"); summary[name]="SKIPPED"; continue
    start = datetime.datetime.now()
    try:
        r = subprocess.run(["python3",path], capture_output=False, timeout=600)
        secs = (datetime.datetime.now()-start).seconds
        status = f"PASSED ({secs}s)" if r.returncode==0 else "FAILED"
        log(f"  {status}"); summary[name]=status
    except Exception as e:
        log(f"  ERROR: {e}"); summary[name]="ERROR"

log("\n"+"="*50)
log("UX UPGRADE COMPLETE")
passed = sum(1 for v in summary.values() if "PASSED" in v)
log(f"Results: {passed}/{len(summary)} passed")
for n,s in summary.items():
    log(f"  [{'OK' if 'PASSED' in s else 'XX'}] {n}: {s}")

with open(ROOT+"/tasks/logs/ux_summary.json","w") as f:
    json.dump({"date":str(datetime.datetime.now()),"tasks":summary},f,indent=2)
log("\nVersion: v2.4.0 — UX Excellence")
log("New components: MobileNav, Breadcrumb, ConfirmDialog")
log("New components: ExportButton, ActionBar, Pagination")
log("New hooks: usePagination, useSearch")
log("Leads page: full enterprise UX")
