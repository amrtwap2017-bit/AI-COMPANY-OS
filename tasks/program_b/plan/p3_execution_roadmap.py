import os, json, datetime, urllib.request

ROOT   = "/home/amr/AI-COMPANY-OS"
OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "qwen2.5-coder:7b"
LOG    = ROOT + "/tasks/program_b/logs/p3.log"

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
log("P3 — EXECUTION ROADMAP: Final plan before build")
log("=" * 60)

log("\n1. Loading all planning data")
sprint_plan  = ""
engine_designs = ""

try:
    with open(ROOT + "/tasks/program_b/logs/p1_plan.json") as f:
        p1 = json.load(f)
        sprint_plan = p1.get("sprint_plan", "")[:2000]
    log("  P1 loaded")
except: log("  P1 not found")

try:
    with open(ROOT + "/tasks/program_b/logs/p2_workflow_design.json") as f:
        p2 = json.load(f)
        engine_designs = str(list(p2.get("designs", {}).keys()))
    log("  P2 loaded: engines = " + engine_designs)
except: log("  P2 not found")

log("\n2. Creating final implementation roadmap")
roadmap = ask(
    "You are the Lead Architect finalizing the implementation roadmap for Triangle Black.\n\n"
    "SPRINT PLAN SUMMARY:\n" + sprint_plan + "\n\n"
    "ENGINES DESIGNED: " + engine_designs + "\n\n"
    "Create the FINAL IMPLEMENTATION ROADMAP.\n\n"
    "This roadmap must answer:\n"
    "1. What gets built first and why\n"
    "2. What code files get created/modified\n"
    "3. How long each piece takes\n"
    "4. What the user can DO after each milestone\n"
    "5. How to verify each piece works\n\n"
    "RULES:\n"
    "- Never build without verified analysis\n"
    "- Always reuse existing APIs\n"
    "- Always use existing UI components\n"
    "- Build smallest working increment first\n"
    "- Every task must have a test/verify step\n\n"
    "Output format:\n\n"
    "MILESTONE 1: <name>\n"
    "HOURS: <estimate>\n"
    "GOAL: <what changes for the user>\n"
    "FILES:\n"
    "  CREATE: <file paths>\n"
    "  MODIFY: <file paths>\n"
    "VERIFY: <how to confirm it works>\n"
    "---\n\n"
    "List all milestones in execution order."
)
log("  Roadmap: " + str(len(roadmap.split())) + " words")

log("\n3. Creating script execution plan")
script_plan = ask(
    "Based on this roadmap:\n\n" + roadmap[:2000] + "\n\n"
    "Create the exact list of Python task scripts to build.\n\n"
    "Each script will:\n"
    "1. Create portal pages (write TypeScript files)\n"
    "2. Create backend routes (write Python files)\n"
    "3. Build without breaking existing code\n"
    "4. Verify the build passes\n\n"
    "Format:\n"
    "SCRIPT: tasks/program_b/execute/e1_workflow_engine.py\n"
    "CREATES: <what files this script generates>\n"
    "MODIFIES: <what existing files it touches>\n"
    "VERIFY: <test command>\n"
    "DEPENDS_ON: <other scripts that must run first>\n"
    "---\n\n"
    "List scripts in execution order. 8-12 scripts total."
)
log("  Script plan: " + str(len(script_plan.split())) + " words")

result = {
    "date":        str(datetime.datetime.now()),
    "roadmap":     roadmap,
    "script_plan": script_plan,
}

with open(ROOT + "/tasks/program_b/logs/p3_roadmap.json", "w") as f:
    json.dump(result, f, indent=2)

report = "# P3 — Execution Roadmap\n"
report += "**Date:** " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M") + "\n\n"
report += "## Implementation Roadmap\n\n" + roadmap + "\n\n"
report += "---\n\n"
report += "## Script Execution Plan\n\n" + script_plan + "\n"

with open(ROOT + "/reports/p3_execution_roadmap.md", "w") as f:
    f.write(report)

log("\n" + "=" * 60)
log("P3 COMPLETE — PLANNING PHASE DONE")
log("  Report: reports/p3_execution_roadmap.md")
log("")
log("PLANNING COMPLETE. Begin execution:")
log("  python3 tasks/program_b/execute/e1_workflow_engine.py")
