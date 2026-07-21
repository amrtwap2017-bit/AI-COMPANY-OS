import os, json, datetime, urllib.request

ROOT   = "/home/amr/AI-COMPANY-OS"
PORTAL = ROOT + "/11-WORKSPACES/triangle-black/portal"
TB     = ROOT + "/11-WORKSPACES/triangle-black"
OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "qwen2.5-coder:7b"
LOG    = ROOT + "/tasks/program_b/logs/p2.log"

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
log("P2 — WORKFLOW DESIGN: Design every engine")
log("=" * 60)

ENGINES = {
    "WorkflowEngine": {
        "purpose": "State machine for every entity lifecycle",
        "entities": ["ServiceRequest", "WorkOrder", "PurchaseRequest", "PurchaseOrder", "Quote", "Contract", "MaintenancePlan"],
        "operations": ["transition", "validate", "trigger_events", "update_timeline"],
    },
    "ApprovalEngine": {
        "purpose": "Universal approval flow for all entities",
        "types": ["single", "sequential", "parallel", "conditional"],
        "features": ["delegation", "escalation", "timeout", "digital_signature"],
    },
    "SLAEngine": {
        "purpose": "SLA tracking and breach detection",
        "priorities": ["critical", "high", "medium", "low"],
        "metrics": ["response_time", "resolution_time", "breach_risk"],
    },
    "NotificationEngine": {
        "purpose": "Multi-channel notification fanout",
        "channels": ["portal", "email", "SMS", "push"],
        "triggers": ["status_change", "assignment", "deadline", "approval"],
    },
    "AssignmentEngine": {
        "purpose": "Smart assignment for technicians and agents",
        "logic": ["workload", "skills", "territory", "availability"],
    },
    "AuditEngine": {
        "purpose": "Immutable audit trail for all operations",
        "events": ["create", "update", "status_change", "approval", "assignment"],
    },
    "AIEngine": {
        "purpose": "AI assistance surfaced in every workflow",
        "features": ["summarize", "predict", "recommend", "classify", "detect_anomaly"],
    },
}

designs = {}
for engine_name, config in ENGINES.items():
    log("  Designing: " + engine_name)
    design = ask(
        "Design the " + engine_name + " for Triangle Black hotel engineering SaaS.\n\n"
        "PURPOSE: " + config.get("purpose", "") + "\n"
        "CONFIG: " + json.dumps(config) + "\n\n"
        "BACKEND: FastAPI + PostgreSQL + SQLAlchemy\n"
        "FRONTEND: Next.js 16 + TypeScript + TanStack Query\n\n"
        "Provide:\n"
        "1. Database schema (new tables or columns needed)\n"
        "2. Backend API endpoints (FastAPI)\n"
        "3. Frontend hook (useXxxEngine)\n"
        "4. Integration with existing entities\n"
        "5. Usage example in a page component\n\n"
        "Use existing patterns:\n"
        "Backend: src/commercial/<module>/router.py pattern\n"
        "Frontend: authFetch from lib/hooks/useAuthFetch.ts\n"
        "UI: import from @/components/ui\n\n"
        "Keep it simple but production-ready.\n"
        "Output TypeScript and Python code."
    )
    designs[engine_name] = design
    log("    " + str(len(design.split())) + " words")

result = {
    "date":    str(datetime.datetime.now()),
    "designs": designs,
}

with open(ROOT + "/tasks/program_b/logs/p2_workflow_design.json", "w") as f:
    json.dump(result, f, indent=2)

report = "# P2 — Workflow Engine Designs\n"
report += "**Date:** " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M") + "\n\n"
for name, design in designs.items():
    report += "## " + name + "\n\n" + design + "\n\n---\n\n"

with open(ROOT + "/reports/p2_workflow_design.md", "w") as f:
    f.write(report)

log("\n" + "=" * 60)
log("P2 COMPLETE")
log("  Engines designed: " + str(len(designs)))
log("  Report: reports/p2_workflow_design.md")
