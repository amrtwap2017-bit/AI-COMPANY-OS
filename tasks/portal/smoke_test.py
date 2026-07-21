#!/usr/bin/env python3
# Triangle Black Portal — Full Smoke Test
# Tests all services + APIs + portal routes

import urllib.request, urllib.parse, json, datetime, sys, ssl

PASS = []
FAIL = []
NOW  = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")

def ok(name, val=""):
    PASS.append(name)
    print("  PASS " + name + (" — " + str(val) if val else ""))

def fail(name, err=""):
    FAIL.append(name)
    print("  FAIL " + name + (" — " + str(err) if err else ""))

def check_http(url, name, auth=None):
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        headers = {}
        if auth: headers["Authorization"] = "Bearer " + auth
        req = urllib.request.Request(url, headers=headers)
        r = urllib.request.urlopen(req, timeout=5,
            context=ctx if url.startswith("https") else None)
        ok(name, r.status)
        return True
    except urllib.error.HTTPError as e:
        if e.code < 500: ok(name, e.code); return True
        fail(name, "HTTP " + str(e.code)); return False
    except Exception as e:
        fail(name, str(e)[:40]); return False

print("=" * 55)
print("Triangle Black Platform — Smoke Test")
print("Date: " + NOW)
print("=" * 55)

# Auth
print("\n[1] Authentication")
token = ""
try:
    form = urllib.parse.urlencode({"username":"admin@triangleblack.com","password":"admin123"}).encode()
    req  = urllib.request.Request("http://localhost:8030/api/v1/auth/login",
        data=form, headers={"Content-Type":"application/x-www-form-urlencoded"}, method="POST")
    with urllib.request.urlopen(req, timeout=5) as r:
        d = json.loads(r.read())
        token = d.get("access_token","")
        ok("Login", "role=" + d.get("role","?"))
except Exception as e:
    fail("Login", str(e)[:50])

# Services
print("\n[2] Services")
for url, name in [
    ("http://localhost:8001/api/v1/ai/health", "AI Engine"),
    ("http://localhost:8030/",                 "TB Admin"),
    ("http://localhost:3000",                  "Hub"),
    ("http://localhost:3001/dashboard",        "Portal"),
    ("https://localhost/nginx-health",         "Nginx HTTPS"),
    ("http://localhost:6333/collections",      "Qdrant"),
    ("http://localhost:11434/api/tags",        "Ollama"),
]:
    check_http(url, name)

# TB Admin APIs
print("\n[3] TB Admin APIs (with auth)")
for path, name in [
    ("/api/v1/work-orders",              "Work Orders"),
    ("/api/v1/technicians",              "Technicians"),
    ("/api/v1/assets",                   "Assets"),
    ("/api/v1/customers",                "Customers"),
    ("/api/v1/inventory/items",          "Inventory"),
    ("/api/v1/projects",                 "Projects"),
    ("/api/v1/contracts",                "Contracts"),
    ("/api/v1/quotes",                   "Quotes"),
    ("/api/v1/notifications",            "Notifications"),
    ("/api/v1/approvals",                "Approvals"),
    ("/api/v1/maintenance/dashboard",    "Maintenance"),
    ("/api/v1/analytics/kpis",           "Analytics"),
    ("/api/v1/actions/dashboard/stats",  "Dashboard Stats"),
    ("/api/v1/actions/leads/search",     "Leads Search"),
    ("/api/v1/actions/executive/dashboard","Executive"),
]:
    check_http("http://localhost:3001" + path, name, token)

# Portal routes
print("\n[4] Portal Routes")
for route in [
    "/", "/dashboard", "/leads", "/leads/new",
    "/work-orders", "/operations/work-orders/new",
    "/quotes", "/quotes/new", "/login",
    "/technicians", "/assets", "/inventory",
    "/reports", "/approvals", "/notifications",
    "/supply-chain/rfqs", "/maintenance/pm-plans",
    "/executive/intelligence", "/operations/command",
    "/commercial/pipeline", "/projects-center",
    "/analytics", "/customers", "/workspace",
]:
    check_http("http://localhost:3001" + route, route)

# Summary
print("\n" + "=" * 55)
print("RESULTS: " + str(len(PASS)) + " PASS / " + str(len(FAIL)) + " FAIL")
score = round(len(PASS) / max(len(PASS)+len(FAIL),1) * 100)
print("SCORE: " + str(score) + "%")
if FAIL:
    print("FAILURES:")
    for f in FAIL: print("  - " + f)
print("=" * 55)
sys.exit(0 if len(FAIL) == 0 else 1)
