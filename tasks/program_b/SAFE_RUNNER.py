#!/usr/bin/env python3
# SAFE Program B Runner
# Uses short focused prompts, respects CPU, adds cooling breaks

import os, subprocess, json, datetime, urllib.request, time, sys

ROOT   = "/home/amr/AI-COMPANY-OS"
OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "llama3.2:3b"       # FAST model for analysis
MODEL2 = "qwen2.5-coder:7b"  # SMART model for code only
LOG    = ROOT + "/tasks/program_b/logs/safe_run.log"
os.makedirs(ROOT + "/tasks/program_b/logs", exist_ok=True)

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "[" + ts + "] " + str(m)
    print(out, flush=True)
    open(LOG, "a").write(out + "\n")

def ask_short(prompt, model=MODEL, timeout=60, max_tokens=400):
    """Short focused ask — 60s max, 400 tokens"""
    data = json.dumps({
        "model":      model,
        "prompt":     prompt,
        "stream":     False,
        "keep_alive": "5m",
        "options":    {"num_predict": max_tokens, "temperature": 0.1},
    }).encode()
    req = urllib.request.Request(
        OLLAMA, data=data,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read()).get("response", "")
    except Exception as e:
        return "timeout"

def cool_down(seconds=10):
    """Brief CPU cooldown between AI calls"""
    log("  Cooling CPU " + str(seconds) + "s...")
    time.sleep(seconds)

def check_cpu():
    """Return top CPU usage"""
    r = subprocess.run(["ps","aux","--sort=-%cpu"], capture_output=True, text=True)
    lines = r.stdout.strip().split("\n")
    if len(lines) > 1:
        parts = lines[1].split()
        if len(parts) > 2:
            return float(parts[2]) if parts[2].replace(".","").isdigit() else 0
    return 0

def wait_for_cpu(max_pct=60, timeout=60):
    """Wait until CPU drops below threshold"""
    start = time.time()
    while time.time() - start < timeout:
        cpu = check_cpu()
        if cpu < max_pct:
            return True
        log("  CPU " + str(cpu) + "% — waiting...")
        time.sleep(5)
    return False

open(LOG, "w").close()
log("=" * 60)
log("SAFE PROGRAM B — CPU-Aware Enterprise Analysis")
log("=" * 60)
log("Using: llama3.2:3b for analysis (fast)")
log("Using: qwen2.5-coder:7b for code only (slower)")
log("")

# ── LOAD DISCOVERY DATA ───────────────────────────────────────
log("\nLoading discovery data...")
d1 = d2 = d3 = {}
try:
    with open(ROOT + "/tasks/program_b/logs/d1_entities.json") as f: d1 = json.load(f)
    with open(ROOT + "/tasks/program_b/logs/d2_api_audit.json") as f: d2 = json.load(f)
    with open(ROOT + "/tasks/program_b/logs/d3_page_audit.json") as f: d3 = json.load(f)
    log("  D1: " + str(d1.get("summary",{})))
    log("  D2: " + str(d2.get("summary",{})))
    log("  D3: " + str(d3.get("status_counts",{})))
except Exception as e:
    log("  Load error: " + str(e))

# ── PHASE 1: QUICK GAP SUMMARY (short prompt, fast model) ─────
log("\n--- PHASE 1: Gap Summary ---")
wait_for_cpu(60)

gaps = ask_short(
    "Triangle Black portal: 141 pages, 121 placeholder, 18 real data.\n"
    "APIs: 72 working, 67 with data. 126 DB tables.\n"
    "List top 10 missing features needed for enterprise ops platform.\n"
    "One line each. Be specific.",
    model=MODEL, timeout=45, max_tokens=300
)
log("  Gaps identified: " + str(len(gaps.split("\n"))) + " items")
cool_down(8)

# ── PHASE 2: PAGE WIRING PLAN (short prompt per module) ───────
log("\n--- PHASE 2: Page Wiring Plan ---")

MODULES = {
    "Supply Chain": {
        "pages": ["rfqs", "purchase-orders", "purchase-requests", "stock-balances", "spend"],
        "apis":  ["/api/v1/inventory/purchase-orders/", "/api/v1/actions/procurement/dashboard"],
    },
    "Maintenance": {
        "pages": ["schedule", "intelligence", "costs/review", "downtime/review"],
        "apis":  ["/api/v1/maintenance/schedule", "/api/v1/maintenance/intelligence"],
    },
    "Operations": {
        "pages": ["calendar", "sla-review", "command", "workbench"],
        "apis":  ["/api/v1/work-orders/", "/api/v1/analytics/sla"],
    },
    "Executive": {
        "pages": ["portfolio", "reports", "command", "daily-review"],
        "apis":  ["/api/v1/actions/executive/portfolio", "/api/v1/actions/executive/daily-review"],
    },
    "Commercial": {
        "pages": ["pipeline", "review", "command", "workbench"],
        "apis":  ["/api/v1/actions/pipeline/summary", "/api/v1/actions/reports/dashboard"],
    },
}

module_plans = {}
for module_name, config in MODULES.items():
    wait_for_cpu(50)
    log("  Planning: " + module_name)

    plan = ask_short(
        "Triangle Black " + module_name + " module.\n"
        "Pages to wire: " + ", ".join(config["pages"]) + "\n"
        "Available APIs: " + ", ".join(config["apis"]) + "\n"
        "For each page give: route | API endpoint | key data to show\n"
        "Format: /route | /api/endpoint | title: field1, field2\n"
        "Be concise.",
        model=MODEL, timeout=45, max_tokens=300
    )
    module_plans[module_name] = plan
    log("    " + str(len(plan.split("\n"))) + " lines")
    cool_down(6)

# ── PHASE 3: PRIORITY ORDER ────────────────────────────────────
log("\n--- PHASE 3: Priority Order ---")
wait_for_cpu(50)

priority = ask_short(
    "121 placeholder pages in Triangle Black portal.\n"
    "Rank these 10 modules by business impact (most important first):\n"
    "Supply Chain, Maintenance, Operations, Executive,\n"
    "Commercial, Engineering, Projects, Analytics, Customers, Workflows\n"
    "One line per module: rank. name - reason (10 words max)",
    model=MODEL, timeout=30, max_tokens=200
)
log("  Priority list: " + str(len(priority.split("\n"))) + " modules")
cool_down(5)

# ── SAVE SAFE PLAN ────────────────────────────────────────────
log("\nSaving safe execution plan...")
plan = {
    "date":         str(datetime.datetime.now()),
    "discovery":    {
        "tables":    d1.get("summary", {}).get("table_count", 126),
        "apis_ok":   d2.get("summary", {}).get("ok", 72),
        "apis_data": d2.get("summary", {}).get("with_data", 67),
        "pages_real": d3.get("status_counts", {}).get("real_data", 18),
        "pages_placeholder": d3.get("status_counts", {}).get("placeholder", 121),
    },
    "gaps":         gaps,
    "module_plans": module_plans,
    "priority":     priority,
}

with open(ROOT + "/tasks/program_b/logs/safe_plan.json", "w") as f:
    json.dump(plan, f, indent=2)

report = "# Program B Safe Plan\n"
report += "**Date:** " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M") + "\n\n"
report += "## Discovery Summary\n\n"
for k, v in plan["discovery"].items(): report += "- " + k + ": " + str(v) + "\n"
report += "\n## Top Gaps\n\n" + gaps + "\n\n"
report += "## Module Plans\n\n"
for mod, p in module_plans.items():
    report += "### " + mod + "\n\n" + p + "\n\n"
report += "## Priority Order\n\n" + priority + "\n"

os.makedirs(ROOT + "/reports", exist_ok=True)
with open(ROOT + "/reports/program_b_safe_plan.md", "w") as f:
    f.write(report)

log("\n" + "=" * 60)
log("SAFE PLAN COMPLETE")
log("  Report: reports/program_b_safe_plan.md")
log("  Run next: python3 tasks/program_b/EXECUTE_SAFE.py")
