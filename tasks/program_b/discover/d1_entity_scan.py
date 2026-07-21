import os, glob, json, datetime, subprocess, urllib.request

ROOT   = "/home/amr/AI-COMPANY-OS"
TB     = ROOT + "/11-WORKSPACES/triangle-black"
PORTAL = TB + "/portal"
OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "qwen2.5-coder:7b"
LOG    = ROOT + "/tasks/program_b/logs/d1.log"

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "[" + ts + "] " + str(m)
    print(out, flush=True)
    open(LOG, "a").write(out + "\n")

def ask(prompt, timeout=120):
    data = json.dumps({
        "model": MODEL, "prompt": prompt, "stream": False,
        "keep_alive": "30m",
        "options": {"num_predict": 1500, "temperature": 0.1},
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
log("D1 — ENTITY SCAN: Discover every business entity")
log("=" * 60)

entities = {}

log("\n1. Scanning database tables")
try:
    env = {**os.environ, "PGPASSWORD": "ai123"}
    r = subprocess.run(
        ["psql", "-U", "ai", "-h", "localhost", "-d", "triangle_black",
         "-P", "pager=off", "-t", "-A",
         "-c", "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"],
        capture_output=True, text=True, env=env, timeout=10
    )
    tables = [t.strip() for t in r.stdout.strip().split("\n") if t.strip()]
    log("  Tables found: " + str(len(tables)))
    for t in tables:
        log("    " + t)
    entities["db_tables"] = tables
except Exception as e:
    log("  DB error: " + str(e))
    entities["db_tables"] = []

log("\n2. Scanning TB Admin router files")
router_files = glob.glob(TB + "/src/**/*.py", recursive=True)
router_files = [f for f in router_files if "router.py" in f]
log("  Router files: " + str(len(router_files)))

api_routes = {}
for rf in router_files:
    module = rf.replace(TB + "/src/commercial/", "").replace("/router.py", "")
    try:
        with open(rf) as f:
            content = f.read()
        import re
        routes = re.findall(r'@router\.(get|post|put|patch|delete)\(["\']([^"\']+)', content)
        if routes:
            api_routes[module] = [m + " " + p for m, p in routes]
            log("  [" + module + "] " + str(len(routes)) + " endpoints")
    except Exception:
        pass

entities["api_modules"] = api_routes

log("\n3. Scanning portal pages")
pages = glob.glob(PORTAL + "/app/**/page.tsx", recursive=True)
pages = [p.replace(PORTAL + "/app/", "").replace("/page.tsx", "") for p in pages
         if "node_modules" not in p]
log("  Portal pages: " + str(len(pages)))
entities["portal_pages"] = sorted(pages)

log("\n4. AI Entity Analysis")
table_list = "\n".join(entities["db_tables"][:60])
module_list = "\n".join(entities["api_modules"].keys())

analysis = ask(
    "You are analyzing Triangle Black, a hotel engineering SaaS for Egypt.\n\n"
    "DATABASE TABLES:\n" + table_list + "\n\n"
    "API MODULES:\n" + module_list + "\n\n"
    "TASK: List every business entity with:\n"
    "1. Entity name\n"
    "2. Current lifecycle states\n"
    "3. Missing lifecycle states\n"
    "4. Business domain (Commercial/Operations/Maintenance/Supply Chain/Executive)\n"
    "5. Priority (Critical/High/Medium)\n\n"
    "Format each entity as:\n"
    "ENTITY: <name>\n"
    "DOMAIN: <domain>\n"
    "STATES: <current states>\n"
    "MISSING: <missing states>\n"
    "PRIORITY: <priority>\n"
    "---\n\n"
    "Be comprehensive. Cover ALL entities in the tables."
)
log("  AI analysis: " + str(len(analysis.split())) + " words")

result = {
    "date":         str(datetime.datetime.now()),
    "tables":       entities["db_tables"],
    "api_modules":  entities["api_modules"],
    "portal_pages": entities["portal_pages"],
    "ai_analysis":  analysis,
    "summary": {
        "table_count":  len(entities["db_tables"]),
        "module_count": len(entities["api_modules"]),
        "page_count":   len(entities["portal_pages"]),
    }
}

os.makedirs(ROOT + "/tasks/program_b/logs", exist_ok=True)
with open(ROOT + "/tasks/program_b/logs/d1_entities.json", "w") as f:
    json.dump(result, f, indent=2)

report = "# D1 Entity Scan Report\n"
report += "**Date:** " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M") + "\n\n"
report += "## Summary\n"
report += "- Tables: " + str(result["summary"]["table_count"]) + "\n"
report += "- API Modules: " + str(result["summary"]["module_count"]) + "\n"
report += "- Portal Pages: " + str(result["summary"]["page_count"]) + "\n\n"
report += "## AI Entity Analysis\n\n" + analysis + "\n"

os.makedirs(ROOT + "/reports", exist_ok=True)
with open(ROOT + "/reports/d1_entity_scan.md", "w") as f:
    f.write(report)

log("\n" + "=" * 60)
log("D1 COMPLETE")
log("  Tables: " + str(result["summary"]["table_count"]))
log("  API Modules: " + str(result["summary"]["module_count"]))
log("  Portal Pages: " + str(result["summary"]["page_count"]))
log("  Report: reports/d1_entity_scan.md")
