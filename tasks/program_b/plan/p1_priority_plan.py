import os, json, datetime, urllib.request

ROOT   = "/home/amr/AI-COMPANY-OS"
OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "qwen2.5-coder:7b"
LOG    = ROOT + "/tasks/program_b/logs/p1.log"

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "[" + ts + "] " + str(m)
    print(out, flush=True)
    open(LOG, "a").write(out + "\n")

def ask(prompt, timeout=180):
    data = json.dumps({
        "model": MODEL, "prompt": prompt, "stream": False,
        "keep_alive": "30m",
        "options": {"num_predict": 2500, "temperature": 0.1},
    }).encode()
    req = urllib.request.Request(
        OLLAMA, data=data,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read()).get("response", "")
    except Exception as e:
        return "Error: " + str(e)

open(LOG, "w").close()
log("=" * 60)
log("P1 — PRIORITY PLAN: AI creates execution roadmap")
log("=" * 60)

log("\n1. Loading discovery results")
gap_report = ""
try:
    with open(ROOT + "/tasks/program_b/logs/d5_gap_report.json") as f:
        d5 = json.load(f)
        gap_report = d5.get("gap_analysis", "")[:3000]
    log("  Gap report loaded")
except: log("  Gap report not found — using defaults")

log("\n2. AI creates prioritized sprint plan")
sprint_plan = ask(
    "You are the Lead Enterprise Architect for Triangle Black hotel engineering SaaS.\n\n"
    "PLATFORM: FastAPI backend + Next.js 16 portal + PostgreSQL 126 tables\n"
    "CURRENT SCORE: 7/10\n"
    "TARGET: 9/10 (ServiceNow/SAP grade)\n\n"
    "GAP SUMMARY:\n" + gap_report + "\n\n"
    "CREATE A SPRINT-BY-SPRINT EXECUTION PLAN.\n\n"
    "Rules:\n"
    "- Never rewrite working code\n"
    "- Reuse existing backend APIs\n"
    "- Reuse existing UI components\n"
    "- Build incrementally\n"
    "- Each sprint delivers working software\n\n"
    "Format each sprint:\n"
    "SPRINT: <number>\n"
    "NAME: <sprint name>\n"
    "DURATION: <hours>\n"
    "GOAL: <business outcome>\n"
    "PRIORITY: <P0/P1/P2>\n\n"
    "TASKS:\n"
    "- TASK-XX: <title> | <file to change> | <what to build>\n\n"
    "APIS_USED:\n"
    "- <existing endpoints this sprint uses>\n\n"
    "NEW_APIS_NEEDED:\n"
    "- <new backend endpoints if any>\n\n"
    "DELIVERABLE: <what the user can do after this sprint>\n"
    "---\n\n"
    "Plan at least 8 sprints. Start with critical infrastructure, end with polish."
)
log("  Sprint plan: " + str(len(sprint_plan.split())) + " words")

log("\n3. AI creates task registry")
task_registry = ask(
    "Based on this sprint plan for Triangle Black:\n\n"
    + sprint_plan[:2000] + "\n\n"
    "Create a numbered task registry with EVERY task.\n\n"
    "Format:\n"
    "TB-XXX | Priority | Sprint | Title | File | Effort | Status\n\n"
    "Use this priority scale:\n"
    "P0 = System broken without this\n"
    "P1 = Major feature missing\n"
    "P2 = UX improvement\n"
    "P3 = Nice to have\n\n"
    "Include tasks for:\n"
    "- Workflow engine\n"
    "- Entity pages (detail pages with tabs)\n"
    "- Placeholder pages\n"
    "- API wiring\n"
    "- Notification system\n"
    "- Approval engine\n"
    "- SLA engine\n"
    "- AI integration\n"
    "- Dashboard suite\n"
    "- Operations: calendar, dispatch, SLA review\n"
    "- Supply chain: RFQs, quotations, spend\n"
    "- Maintenance: schedule, intelligence\n"
    "- Executive: portfolio, reports\n\n"
    "Number all tasks TB-001 through TB-XXX."
)
log("  Task registry: " + str(len(task_registry.split())) + " words")

result = {
    "date":          str(datetime.datetime.now()),
    "sprint_plan":   sprint_plan,
    "task_registry": task_registry,
}

with open(ROOT + "/tasks/program_b/logs/p1_plan.json", "w") as f:
    json.dump(result, f, indent=2)

report = "# P1 — Priority Execution Plan\n"
report += "**Date:** " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M") + "\n\n"
report += "## Sprint Plan\n\n" + sprint_plan + "\n\n"
report += "---\n\n"
report += "## Task Registry\n\n" + task_registry + "\n"

with open(ROOT + "/reports/p1_priority_plan.md", "w") as f:
    f.write(report)

log("\n" + "=" * 60)
log("P1 COMPLETE")
log("  Report: reports/p1_priority_plan.md")
log("  Next: python3 tasks/program_b/plan/p2_workflow_design.py")
