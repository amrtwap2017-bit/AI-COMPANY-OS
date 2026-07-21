import os, glob, json, datetime, urllib.request

ROOT   = "/home/amr/AI-COMPANY-OS"
PORTAL = ROOT + "/11-WORKSPACES/triangle-black/portal"
OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "qwen2.5-coder:7b"
LOG    = ROOT + "/tasks/program_b/logs/d3.log"

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "[" + ts + "] " + str(m)
    print(out, flush=True)
    open(LOG, "a").write(out + "\n")

def ask(prompt, timeout=150):
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
log("D3 — PAGE AUDIT: Classify every portal page")
log("=" * 60)

pages_status = {
    "real_data":   [],
    "placeholder": [],
    "broken":      [],
    "missing":     [],
}

PAGE_PATTERNS = {
    "real":        ["useQuery", "tbFetch", "authFetch", "leadsApi", "maintenanceApi", "executiveApi"],
    "placeholder": ["being built", "coming soon", "placeholder", "under construction", "TODO"],
    "mock":        ["Promise.resolve", "MOCK_DATA", "mockData", "Math.random"],
}

log("\n1. Scanning all page.tsx files")
page_files = glob.glob(PORTAL + "/app/**/page.tsx", recursive=True)
page_files  = [p for p in page_files if "node_modules" not in p and ".next" not in p]
log("  Total pages: " + str(len(page_files)))

page_details = []
for pf in sorted(page_files):
    rel = pf.replace(PORTAL + "/app/", "").replace("/page.tsx", "")
    try:
        with open(pf) as f:
            content = f.read()
        size = len(content)

        is_real        = any(p in content for p in PAGE_PATTERNS["real"])
        is_placeholder = any(p in content for p in PAGE_PATTERNS["placeholder"])
        is_mock        = any(p in content for p in PAGE_PATTERNS["mock"])
        has_pagewrapper= "PageWrapper" in content
        has_breadcrumb = "Breadcrumb" in content
        has_loading    = "isLoading" in content or "LoadingState" in content
        has_error      = "isError" in content or "AlertBanner" in content
        has_empty      = "EmptyState" in content

        if is_placeholder:
            status = "PLACEHOLDER"
            pages_status["placeholder"].append(rel)
        elif is_real:
            if is_mock:
                status = "MIXED_MOCK"
            else:
                status = "REAL_DATA"
            pages_status["real_data"].append(rel)
        elif size < 500:
            status = "STUB"
            pages_status["placeholder"].append(rel)
        else:
            status = "UNKNOWN"

        page_details.append({
            "route":          "/" + rel.replace("(app)/","").replace("(enterprise)/",""),
            "file":           rel,
            "status":         status,
            "size":           size,
            "has_pagewrapper": has_pagewrapper,
            "has_breadcrumb":  has_breadcrumb,
            "has_loading":     has_loading,
            "has_error_state": has_error,
            "has_empty_state": has_empty,
            "uses_real_api":   is_real,
            "has_mock":        is_mock,
        })
    except Exception as e:
        page_details.append({"file": rel, "status": "ERROR", "error": str(e)})

log("  Real data pages: " + str(len(pages_status["real_data"])))
log("  Placeholder pages: " + str(len(pages_status["placeholder"])))

log("\n2. Testing portal routes (HTTP 200 check)")
import urllib.error, ssl
route_results = {}
for pd in page_details[:50]:
    route = pd.get("route", "")
    if not route or route == "/":
        continue
    try:
        urllib.request.urlopen("http://localhost:3001" + route, timeout=3)
        route_results[route] = 200
    except urllib.error.HTTPError as e:
        route_results[route] = e.code
    except Exception:
        route_results[route] = 0

broken_routes = [r for r, c in route_results.items() if c >= 500]
ok_routes     = [r for r, c in route_results.items() if c < 400]
log("  Routes OK: " + str(len(ok_routes)))
log("  Routes broken (500+): " + str(len(broken_routes)))

log("\n3. AI Page Quality Analysis")
real_list        = "\n".join(pages_status["real_data"][:20])
placeholder_list = "\n".join(pages_status["placeholder"][:30])

analysis = ask(
    "You are auditing Triangle Black portal pages for enterprise readiness.\n\n"
    "PAGES WITH REAL DATA (" + str(len(pages_status["real_data"])) + "):\n" + real_list + "\n\n"
    "PLACEHOLDER PAGES (" + str(len(pages_status["placeholder"])) + "):\n" + placeholder_list + "\n\n"
    "ENTERPRISE UX REQUIREMENTS:\n"
    "Every entity page must have:\n"
    "  - Overview tab\n"
    "  - Timeline tab (history of all state changes)\n"
    "  - Activities tab (comments, notes)\n"
    "  - Documents tab\n"
    "  - Approvals tab\n"
    "  - Related Records section\n"
    "  - AI Assistant button\n"
    "  - Audit trail\n\n"
    "Every list page must have:\n"
    "  - KPI summary cards\n"
    "  - Status filter tabs\n"
    "  - Search + export\n"
    "  - Pagination\n"
    "  - Empty state\n"
    "  - Loading state\n"
    "  - Error state\n\n"
    "TASK:\n"
    "1. For each placeholder page: what data/API it needs\n"
    "2. For real data pages: what enterprise features are missing\n"
    "3. Which pages need a detail page (entity page) created\n"
    "4. Priority order to implement placeholder pages\n\n"
    "Be specific with page routes and what each needs."
)
log("  AI analysis: " + str(len(analysis.split())) + " words")

result = {
    "date":         str(datetime.datetime.now()),
    "page_details": page_details,
    "status_counts": {k: len(v) for k, v in pages_status.items()},
    "route_results": route_results,
    "ai_analysis":  analysis,
}

with open(ROOT + "/tasks/program_b/logs/d3_page_audit.json", "w") as f:
    json.dump(result, f, indent=2)

report = "# D3 Page Audit Report\n"
report += "**Date:** " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M") + "\n\n"
report += "## Page Status\n"
for k, v in result["status_counts"].items():
    report += "- " + k + ": " + str(v) + "\n"
report += "\n## Real Data Pages\n\n"
for p in pages_status["real_data"]:
    report += "- /" + p.replace("(app)/","").replace("(enterprise)/","") + "\n"
report += "\n## Placeholder Pages (need implementation)\n\n"
for p in pages_status["placeholder"][:40]:
    report += "- /" + p.replace("(app)/","").replace("(enterprise)/","") + "\n"
report += "\n## AI Analysis\n\n" + analysis + "\n"

with open(ROOT + "/reports/d3_page_audit.md", "w") as f:
    f.write(report)

log("\n" + "=" * 60)
log("D3 COMPLETE")
log("  Real data: " + str(len(pages_status["real_data"])))
log("  Placeholder: " + str(len(pages_status["placeholder"])))
log("  Broken routes: " + str(len(broken_routes)))
log("  Report: reports/d3_page_audit.md")
