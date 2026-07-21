import os, json, datetime, urllib.request

ROOT   = "/home/amr/AI-COMPANY-OS"
OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "qwen2.5-coder:7b"
LOG    = ROOT + "/tasks/program_b/logs/d4.log"

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
log("D4 — WORKFLOW MAP: Design enterprise value streams")
log("=" * 60)

VALUE_STREAMS = [
    "Customer Service",
    "Maintenance Operations",
    "Engineering Projects",
    "Procurement & Supply Chain",
    "Commercial & Sales",
    "Executive Intelligence",
    "Asset Lifecycle",
    "Vendor Management",
    "Contract Lifecycle",
    "Finance & Invoicing",
    "Human Resources (Technicians)",
    "Quality & Inspection",
]

log("\n1. Mapping " + str(len(VALUE_STREAMS)) + " value streams")

all_workflows = {}

for stream in VALUE_STREAMS:
    log("  Mapping: " + stream)
    workflow = ask(
        "You are designing enterprise workflow for Triangle Black hotel engineering SaaS.\n\n"
        "VALUE STREAM: " + stream + "\n\n"
        "AVAILABLE BACKEND:\n"
        "FastAPI + PostgreSQL with tables for:\n"
        "leads, work_orders, technicians, assets, contracts, quotes, invoices,\n"
        "inventory_items, warehouses, purchase_orders, purchase_requests, rfqs,\n"
        "maintenance_plans, maintenance_work_items, projects, project_phases,\n"
        "notifications, activities, hotels, users, goods_receipts, supplier_invoices\n\n"
        "TASK: Design the complete workflow for this value stream.\n\n"
        "Output format:\n"
        "GOAL: <business goal>\n"
        "ACTORS: <who is involved>\n"
        "ENTRY: <how does it start>\n"
        "EXIT: <what is the outcome>\n\n"
        "STEPS:\n"
        "1. <Step name> | <Actor> | <API endpoint> | <Portal page> | <Auto/Manual>\n"
        "2. ...\n\n"
        "APPROVAL_RULES:\n"
        "- <what needs approval and by whom>\n\n"
        "AUTOMATION:\n"
        "- <what should be automatic>\n\n"
        "NOTIFICATIONS:\n"
        "- <what triggers notifications and to whom>\n\n"
        "AI_OPPORTUNITIES:\n"
        "- <where AI can help>\n\n"
        "KPIS:\n"
        "- <how to measure success>\n\n"
        "MISSING_IN_CURRENT_SYSTEM:\n"
        "- <what is not built yet>\n\n"
        "Be specific about API endpoints and portal pages."
    )
    all_workflows[stream] = workflow
    log("    " + str(len(workflow.split())) + " words")

log("\n2. Cross-stream integration analysis")
stream_names = "\n".join(VALUE_STREAMS)

integration = ask(
    "You are designing cross-module integration for Triangle Black.\n\n"
    "VALUE STREAMS:\n" + stream_names + "\n\n"
    "TASK: Identify every point where value streams connect.\n\n"
    "For each connection:\n"
    "TRIGGER: <what event in stream A>\n"
    "CREATES: <what happens in stream B>\n"
    "DATA_SHARED: <what data passes between them>\n"
    "API_CALL: <what API endpoint is called>\n"
    "AUTOMATION: <should this be automatic?>\n"
    "---\n\n"
    "Focus on the most critical integrations that make the platform feel like ONE system."
)

result = {
    "date":       str(datetime.datetime.now()),
    "workflows":  all_workflows,
    "integration": integration,
    "streams":    VALUE_STREAMS,
}

with open(ROOT + "/tasks/program_b/logs/d4_workflows.json", "w") as f:
    json.dump(result, f, indent=2)

report = "# D4 Workflow Map Report\n"
report += "**Date:** " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M") + "\n\n"
report += "## Value Streams Designed: " + str(len(VALUE_STREAMS)) + "\n\n"
for stream, workflow in all_workflows.items():
    report += "## " + stream + "\n\n" + workflow + "\n\n---\n\n"
report += "## Cross-Stream Integration\n\n" + integration + "\n"

with open(ROOT + "/reports/d4_workflow_map.md", "w") as f:
    f.write(report)

log("\n" + "=" * 60)
log("D4 COMPLETE")
log("  Value streams mapped: " + str(len(VALUE_STREAMS)))
log("  Report: reports/d4_workflow_map.md")
