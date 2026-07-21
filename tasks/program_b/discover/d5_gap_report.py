import os, json, datetime, urllib.request

ROOT   = "/home/amr/AI-COMPANY-OS"
OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "qwen2.5-coder:7b"
LOG    = ROOT + "/tasks/program_b/logs/d5.log"

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "[" + ts + "] " + str(m)
    print(out, flush=True)
    open(LOG, "a").write(out + "\n")

def ask(prompt, timeout=180):
    data = json.dumps({
        "model": MODEL, "prompt": prompt, "stream": False,
        "keep_alive": "30m",
        "options": {"num_predict": 2000, "temperature": 0.1},
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
log("D5 — GAP REPORT: Comprehensive gap analysis")
log("=" * 60)

log("\n1. Loading discovery data")
d1 = d2 = d3 = d4 = {}
try:
    with open(ROOT + "/tasks/program_b/logs/d1_entities.json") as f: d1 = json.load(f)
    log("  D1 loaded: " + str(d1.get("summary",{})))
except: log("  D1 not found — run d1 first")

try:
    with open(ROOT + "/tasks/program_b/logs/d2_api_audit.json") as f: d2 = json.load(f)
    log("  D2 loaded: " + str(d2.get("summary",{})))
except: log("  D2 not found")

try:
    with open(ROOT + "/tasks/program_b/logs/d3_page_audit.json") as f: d3 = json.load(f)
    log("  D3 loaded: " + str(d3.get("status_counts",{})))
except: log("  D3 not found")

log("\n2. AI Comprehensive Gap Analysis")

context = (
    "Triangle Black Enterprise Platform — Comprehensive Gap Analysis\n\n"
    "CURRENT STATE:\n"
    "- Database: 126 tables in PostgreSQL\n"
    "- API: 105+ endpoints in FastAPI\n"
    "- Portal: 141 pages in Next.js 16\n"
    "- Real data pages: ~33\n"
    "- Placeholder pages: ~95\n"
    "- Backend score: 8/10\n"
    "- Frontend score: 5/10\n"
    "- Overall: 7/10\n\n"
    "TARGET: ServiceNow/SAP Fiori grade (9/10)\n\n"
    "KNOWN GAPS:\n"
    "1. No workflow engine (state machine)\n"
    "2. No universal approval engine\n"
    "3. No SLA engine\n"
    "4. No notification fanout (email/SMS/push)\n"
    "5. No assignment engine\n"
    "6. No event bus\n"
    "7. Hub AI OS not integrated into portal workflows\n"
    "8. 95 placeholder pages need real implementation\n"
    "9. No universal entity detail page structure\n"
    "10. No cross-entity relationship panels\n"
    "11. No audit trail UI\n"
    "12. No timeline on entities\n"
    "13. No real-time updates (no SSE/WebSocket)\n"
    "14. No document management\n"
    "15. TB Admin has no systemd service\n\n"
    "TASK: Create the master gap report.\n\n"
    "Format each gap:\n"
    "GAP-ID: GAP-XXX\n"
    "CATEGORY: Architecture/Workflow/UX/Integration/Operations\n"
    "SEVERITY: Critical/High/Medium/Low\n"
    "TITLE: <short title>\n"
    "DESCRIPTION: <what is missing>\n"
    "IMPACT: <business impact without this>\n"
    "FIX: <what needs to be built>\n"
    "EFFORT: Small(1-2h)/Medium(4-8h)/Large(1-2d)/XLarge(3-5d)\n"
    "BLOCKS: <what this gap is blocking>\n"
    "---\n\n"
    "List ALL gaps by severity. Critical first. Be comprehensive."
)

gap_analysis = ask(context)
log("  Gap analysis: " + str(len(gap_analysis.split())) + " words")

log("\n3. Executive Summary")
exec_summary = ask(
    "Based on this gap analysis for Triangle Black enterprise platform:\n\n"
    + gap_analysis[:2000] + "\n\n"
    "Write a 10-sentence executive summary covering:\n"
    "1. Current state assessment\n"
    "2. Top 3 critical gaps\n"
    "3. Business impact of gaps\n"
    "4. Required investment (time)\n"
    "5. Expected outcome after Program B\n"
    "6. Risk if not addressed\n"
    "Write for a CEO audience. Be specific about Triangle Black business."
)

result = {
    "date":         str(datetime.datetime.now()),
    "gap_analysis": gap_analysis,
    "exec_summary": exec_summary,
    "discovery_summary": {
        "d1": d1.get("summary", {}),
        "d2": d2.get("summary", {}),
        "d3": d3.get("status_counts", {}),
    }
}

with open(ROOT + "/tasks/program_b/logs/d5_gap_report.json", "w") as f:
    json.dump(result, f, indent=2)

report = "# D5 — Enterprise Gap Report\n"
report += "**Date:** " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M") + "\n"
report += "**Platform:** Triangle Black v3.1.0\n\n"
report += "## Executive Summary\n\n" + exec_summary + "\n\n"
report += "---\n\n"
report += "## Complete Gap Analysis\n\n" + gap_analysis + "\n\n"
report += "---\n\n"
report += "## Discovery Metrics\n\n"
report += "| Metric | Value |\n|--------|-------|\n"
for k, v in d1.get("summary", {}).items():
    report += "| " + k + " | " + str(v) + " |\n"
for k, v in d2.get("summary", {}).items():
    report += "| " + k + " | " + str(v) + " |\n"
for k, v in d3.get("status_counts", {}).items():
    report += "| pages_" + k + " | " + str(v) + " |\n"

with open(ROOT + "/reports/d5_gap_report.md", "w") as f:
    f.write(report)

log("\n" + "=" * 60)
log("D5 COMPLETE — DISCOVERY PHASE DONE")
log("  Gap analysis: " + str(len(gap_analysis.split())) + " words")
log("  Report: reports/d5_gap_report.md")
log("")
log("  All discovery reports saved in reports/")
log("  Next: python3 tasks/program_b/plan/p1_priority_plan.py")
