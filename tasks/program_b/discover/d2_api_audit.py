import os, json, datetime, urllib.request, urllib.parse

ROOT   = "/home/amr/AI-COMPANY-OS"
OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "qwen2.5-coder:7b"
LOG    = ROOT + "/tasks/program_b/logs/d2.log"

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
log("D2 — API AUDIT: Test every endpoint, classify gaps")
log("=" * 60)

log("\n1. Getting auth token")
token = ""
try:
    form = urllib.parse.urlencode({
        "username": "admin@triangleblack.com",
        "password": "admin123"
    }).encode()
    req = urllib.request.Request(
        "http://localhost:8030/api/v1/auth/login",
        data=form,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=8) as r:
        d = json.loads(r.read())
        token = d.get("access_token", "")
        log("  Token: " + token[:20] + "... role=" + d.get("role", "?"))
except Exception as e:
    log("  Auth failed: " + str(e)[:60])

log("\n2. Fetching openapi.json")
all_paths = {}
try:
    req = urllib.request.Request("http://localhost:8030/openapi.json")
    with urllib.request.urlopen(req, timeout=8) as r:
        openapi = json.loads(r.read())
    all_paths = openapi.get("paths", {})
    log("  Total routes: " + str(len(all_paths)))
except Exception as e:
    log("  OpenAPI failed: " + str(e)[:60])

log("\n3. Testing every GET endpoint")
headers = {"Authorization": "Bearer " + token} if token else {}
results = {"ok": [], "fail_auth": [], "fail_404": [], "fail_405": [], "fail_other": [], "has_data": [], "empty": []}

for path, methods in all_paths.items():
    if "get" not in methods and "GET" not in methods:
        continue
    if "{" in path:
        continue
    try:
        req = urllib.request.Request("http://localhost:8030" + path, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
            if isinstance(data, list):
                count = len(data)
                if count > 0:
                    results["has_data"].append(path + " [" + str(count) + "]")
                    results["ok"].append(path)
                else:
                    results["empty"].append(path)
                    results["ok"].append(path)
            elif isinstance(data, dict) and "detail" in data:
                results["fail_auth"].append(path + " -> " + str(data["detail"])[:40])
            else:
                results["has_data"].append(path + " " + str(list(data.keys())[:3]))
                results["ok"].append(path)
    except urllib.error.HTTPError as e:
        if e.code == 401 or e.code == 403:
            results["fail_auth"].append(path + " (" + str(e.code) + ")")
        elif e.code == 404:
            results["fail_404"].append(path)
        elif e.code == 405:
            results["fail_405"].append(path)
        elif e.code == 307:
            results["ok"].append(path + " [307->OK]")
        else:
            results["fail_other"].append(path + " (" + str(e.code) + ")")
    except Exception:
        results["fail_other"].append(path + " [network]")

log("  OK: " + str(len(results["ok"])))
log("  Has data: " + str(len(results["has_data"])))
log("  Auth fail: " + str(len(results["fail_auth"])))
log("  404: " + str(len(results["fail_404"])))
log("  405: " + str(len(results["fail_405"])))

log("\n4. AI API Gap Analysis")
working   = "\n".join(results["has_data"][:30])
failing   = "\n".join(results["fail_auth"][:20] + results["fail_404"][:10])

analysis = ask(
    "You are auditing Triangle Black API for enterprise completeness.\n\n"
    "WORKING ENDPOINTS WITH DATA:\n" + working + "\n\n"
    "FAILING ENDPOINTS:\n" + failing + "\n\n"
    "ENTERPRISE PLATFORM REQUIREMENTS:\n"
    "- Service Request full lifecycle (create/assign/execute/complete/invoice)\n"
    "- Work Order state machine (draft/submitted/approved/assigned/in_progress/waiting_parts/inspection/completed/closed)\n"
    "- Procurement cycle (PR->approval->RFQ->PO->GRN->invoice->payment)\n"
    "- Asset lifecycle (register/maintain/inspect/repair/decommission)\n"
    "- SLA tracking on all operational entities\n"
    "- Universal approval engine\n"
    "- Notification fanout\n"
    "- Assignment engine\n"
    "- Audit trail on every entity\n\n"
    "TASK:\n"
    "1. List every MISSING API endpoint needed for enterprise operations\n"
    "2. Classify each: Critical/High/Medium\n"
    "3. Identify which value stream each belongs to\n"
    "4. List the exact endpoint path and HTTP method needed\n\n"
    "Format:\n"
    "MISSING: POST /api/v1/work-orders/{id}/transition\n"
    "STREAM: Operations\n"
    "PRIORITY: Critical\n"
    "PURPOSE: State machine transition for work order lifecycle\n"
    "---"
)
log("  AI analysis: " + str(len(analysis.split())) + " words")

result = {
    "date":     str(datetime.datetime.now()),
    "results":  results,
    "analysis": analysis,
    "summary": {
        "total_tested":  len(results["ok"]) + len(results["fail_auth"]) + len(results["fail_404"]) + len(results["fail_405"]),
        "ok":            len(results["ok"]),
        "with_data":     len(results["has_data"]),
        "auth_failures": len(results["fail_auth"]),
        "not_found":     len(results["fail_404"]),
        "method_error":  len(results["fail_405"]),
    }
}

with open(ROOT + "/tasks/program_b/logs/d2_api_audit.json", "w") as f:
    json.dump(result, f, indent=2)

report = "# D2 API Audit Report\n"
report += "**Date:** " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M") + "\n\n"
report += "## Endpoint Results\n"
for k, v in result["summary"].items():
    report += "- " + k + ": " + str(v) + "\n"
report += "\n## Endpoints With Real Data\n\n"
for ep in results["has_data"]:
    report += "- " + ep + "\n"
report += "\n## Auth Failures (need fix)\n\n"
for ep in results["fail_auth"][:20]:
    report += "- " + ep + "\n"
report += "\n## AI Gap Analysis\n\n" + analysis + "\n"

with open(ROOT + "/reports/d2_api_audit.md", "w") as f:
    f.write(report)

log("\n" + "=" * 60)
log("D2 COMPLETE")
log("  OK endpoints: " + str(result["summary"]["ok"]))
log("  With data: " + str(result["summary"]["with_data"]))
log("  Auth failures: " + str(result["summary"]["auth_failures"]))
log("  Report: reports/d2_api_audit.md")
