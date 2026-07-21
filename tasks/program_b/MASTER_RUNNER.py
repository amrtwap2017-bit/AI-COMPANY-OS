import os, subprocess, sys, datetime, json

ROOT = "/home/amr/AI-COMPANY-OS"
LOG  = ROOT + "/tasks/program_b/logs/master.log"
os.makedirs(ROOT + "/tasks/program_b/logs", exist_ok=True)

PHASES = [
    ("D1_ENTITY_SCAN",       ROOT + "/tasks/program_b/discover/d1_entity_scan.py"),
    ("D2_API_AUDIT",         ROOT + "/tasks/program_b/discover/d2_api_audit.py"),
    ("D3_PAGE_AUDIT",        ROOT + "/tasks/program_b/discover/d3_page_audit.py"),
    ("D4_WORKFLOW_MAP",      ROOT + "/tasks/program_b/discover/d4_workflow_map.py"),
    ("D5_GAP_REPORT",        ROOT + "/tasks/program_b/discover/d5_gap_report.py"),
    ("P1_PRIORITY_PLAN",     ROOT + "/tasks/program_b/plan/p1_priority_plan.py"),
    ("P2_WORKFLOW_DESIGN",   ROOT + "/tasks/program_b/plan/p2_workflow_design.py"),
    ("P3_EXECUTION_ROADMAP", ROOT + "/tasks/program_b/plan/p3_execution_roadmap.py"),
    ("E1_WORKFLOW_ENGINE",   ROOT + "/tasks/program_b/execute/e1_workflow_engine.py"),
    ("E2_ENTITY_PAGES",      ROOT + "/tasks/program_b/execute/e2_entity_pages.py"),
    ("E3_VALUE_STREAMS",     ROOT + "/tasks/program_b/execute/e3_value_streams.py"),
    ("E4_APPROVAL_ENGINE",   ROOT + "/tasks/program_b/execute/e4_approval_engine.py"),
    ("E5_NOTIFICATION_ENGINE",ROOT + "/tasks/program_b/execute/e5_notification_engine.py"),
    ("E6_SLA_ENGINE",        ROOT + "/tasks/program_b/execute/e6_sla_engine.py"),
    ("E7_AI_INTEGRATION",    ROOT + "/tasks/program_b/execute/e7_ai_integration.py"),
    ("E8_DASHBOARD_SUITE",   ROOT + "/tasks/program_b/execute/e8_dashboard_suite.py"),
    ("B1_BUILD_VERIFY",      ROOT + "/tasks/program_b/build/b1_build_verify.py"),
    ("B2_INTEGRATION_TEST",  ROOT + "/tasks/program_b/build/b2_integration_test.py"),
    ("B3_FINAL_REPORT",      ROOT + "/tasks/program_b/build/b3_final_report.py"),
]

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "["+ts+"] "+str(m)
    print(out, flush=True)
    open(LOG,"a").write(out+"\n")

filter_phase = sys.argv[1] if len(sys.argv) > 1 else None
open(LOG,"w").close()
log("=" * 60)
log("PROGRAM B — ENTERPRISE OPERATIONS EXPERIENCE")
log("Triangle Black -> ServiceNow-grade Platform")
log("=" * 60)

summary = {}
to_run  = [(n,p) for n,p in PHASES if not filter_phase or filter_phase in n]
log("Phases: " + str(len(to_run)))

for name, path in to_run:
    log("\n" + "─" * 50)
    log("PHASE: " + name)
    if not os.path.exists(path):
        log("  SKIP — not found: " + path)
        summary[name] = "SKIPPED"
        continue
    start = datetime.datetime.now()
    try:
        r = subprocess.run(["python3", path], capture_output=False, timeout=900)
        secs   = (datetime.datetime.now() - start).seconds
        status = "PASSED (" + str(secs) + "s)" if r.returncode == 0 else "FAILED"
        log("  " + status)
        summary[name] = status
    except subprocess.TimeoutExpired:
        log("  TIMEOUT (900s)")
        summary[name] = "TIMEOUT"
    except Exception as e:
        log("  ERROR: " + str(e))
        summary[name] = "ERROR"

log("\n" + "=" * 60)
log("PROGRAM B COMPLETE")
passed = sum(1 for v in summary.values() if "PASSED" in v)
log("Results: " + str(passed) + "/" + str(len(summary)) + " passed")
for n, s in summary.items():
    log("  [" + ("OK" if "PASSED" in s else "XX") + "] " + n + ": " + s)

with open(ROOT + "/tasks/program_b/logs/summary.json", "w") as f:
    json.dump({"date": str(datetime.datetime.now()), "summary": summary}, f, indent=2)
