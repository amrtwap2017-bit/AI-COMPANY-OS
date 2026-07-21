#!/usr/bin/env python3
import subprocess
import json
import datetime
import sys

OUT = "/home/amr/AI-COMPANY-OS/tasks/portal/api_stability_smoke_latest.json"

TESTS = [
    ("/api/v1/work-orders",               "array", 1, "Work Orders"),
    ("/api/v1/technicians",               "array", 1, "Technicians"),
    ("/api/v1/assets",                    "array", 1, "Assets"),
    ("/api/v1/projects",                  "array", 1, "Projects"),
    ("/api/v1/agents",                    "array", 1, "Agents"),
    ("/api/v1/customers",                 "dict",  1, "Customers"),
    ("/api/v1/inventory/items",           "array", 1, "Inventory Items"),
    ("/api/v1/inventory/warehouses",      "array", 1, "Warehouses"),
    ("/api/v1/notifications",             "dict",  0, "Notifications"),
    ("/api/v1/approvals",                 "dict",  0, "Approvals Queue"),
    ("/api/v1/approvals/count",           "dict",  0, "Approvals Count"),
    ("/api/v1/maintenance/dashboard",     "dict",  0, "Maintenance Dashboard"),
    ("/api/v1/maintenance/pm-plans",      "array", 1, "PM Plans"),
    ("/api/v1/analytics/kpis",            "dict",  0, "Analytics KPIs"),
    ("/api/v1/analytics/sla",             "dict",  0, "Analytics SLA"),
    ("/api/v1/actions/leads/search",      "any",   1, "Leads Search"),
    ("/api/v1/actions/dashboard/stats",   "dict",  0, "Dashboard Stats"),
    ("/api/v1/actions/executive/dashboard","dict", 0, "Executive Dashboard"),
    ("/api/v1/actions/executive/risks",   "dict",  0, "Executive Risks"),
    ("/api/v1/actions/pipeline/summary",  "dict",  0, "Pipeline Summary"),
]

def get_portal_token():
    r = subprocess.run(
        [
            "curl", "-s", "-X", "POST",
            "http://localhost:3001/api/auth/login",
            "-H", "Content-Type: application/json",
            "-d", '{"email":"admin@triangleblack.com","password":"admin123"}'
        ],
        capture_output=True,
        text=True,
        timeout=15
    )
    try:
        return json.loads(r.stdout).get("token", "")
    except Exception:
        return ""

def parse_payload(text):
    try:
        d = json.loads(text)
    except Exception:
        return "parse_error", 0, text[:120]

    if isinstance(d, list):
        return "array", len(d), None

    if isinstance(d, dict):
        if "detail" in d:
            return "error", 0, str(d.get("detail", ""))[:80]
        count = (
            d.get("total")
            or d.get("count")
            or len(d.get("queue", []))
            or len(d.get("customers", []))
            or len(d.get("leads", []))
            or len(d.get("notifications", []))
            or 0
        )
        return "dict", count, None

    return "unknown", 0, str(d)[:120]

def main():
    token = get_portal_token()
    if not token:
        print("ERROR: could not get portal token")
        sys.exit(1)

    print("Portal token:", token[:20] + "...")
    print("")
    print("{:<48} {:<8} {}".format("ENDPOINT", "SHAPE", "STATUS"))
    print("-" * 80)

    passed = 0
    failed = 0
    results = []

    for ep, expected_shape, min_count, label in TESTS:
        r = subprocess.run(
            ["curl", "-Ls", "-H", "Authorization: Bearer " + token, "http://localhost:3001" + ep],
            capture_output=True,
            text=True,
            timeout=15
        )
        shape, count, err = parse_payload(r.stdout)

        if err:
            status = "FAIL (" + err + ")"
            ok = False
        elif expected_shape in (shape, "any") and (min_count == 0 or count >= min_count):
            status = "PASS (" + str(count) + ")"
            ok = True
        else:
            status = "WARN shape=" + shape + " count=" + str(count)
            ok = False

        if ok:
            passed += 1
        else:
            failed += 1

        icon = "OK" if ok else "XX"
        print("[{}] {:<28} {:<18} {}".format(icon, label, shape, status))
        results.append({
            "label": label,
            "endpoint": ep,
            "shape": shape,
            "status": status,
            "pass": ok
        })

    total = len(TESTS)
    score = round((passed / total) * 100)

    print("")
    print("=" * 80)
    print("SCORE: {}% | {}/{} passed".format(score, passed, total))

    report = {
        "timestamp": str(datetime.datetime.now()),
        "score": score,
        "passed": passed,
        "failed": failed,
        "total": total,
        "results": results
    }
    with open(OUT, "w") as f:
        json.dump(report, f, indent=2)

    print("Saved:", OUT)
    sys.exit(0 if score >= 90 else 1)

if __name__ == "__main__":
    main()
