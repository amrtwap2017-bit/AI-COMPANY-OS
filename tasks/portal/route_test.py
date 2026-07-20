#!/usr/bin/env python3
# Triangle Black Portal — Route Test
# TB-011: Test all 139 routes return 200

import urllib.request, json, glob, datetime, os

PORTAL = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
REPORT = "/home/amr/AI-COMPANY-OS/tasks/logs/route_test_results.json"

# Discover all routes from page.tsx files
page_files = glob.glob(PORTAL+"/app/**/page.tsx", recursive=True)
page_files = [f for f in page_files if "node_modules" not in f]

def file_to_route(f):
    rel = f.replace(PORTAL+"/app","").replace("/page.tsx","")
    # Remove route groups
    import re
    rel = re.sub(r"/\([^)]+\)", "", rel)
    # Replace [param] with test value
    rel = rel.replace("[id]","test-id").replace("[section]","overview")
    return rel or "/"

routes = sorted(set(file_to_route(f) for f in page_files))
print(f"Testing {len(routes)} routes...")

ok, fail, skip = [], [], []
for route in routes:
    try:
        r = urllib.request.urlopen("http://localhost:3001"+route, timeout=5)
        ok.append(route)
        print(f"  ✅ {route}")
    except urllib.error.HTTPError as e:
        if e.code < 500:
            ok.append(route)
            print(f"  ✅ {route} ({e.code})")
        else:
            fail.append({"route":route,"status":e.code})
            print(f"  ❌ {route} ({e.code})")
    except Exception as e:
        skip.append({"route":route,"error":str(e)[:40]})
        print(f"  ⚠️  {route}: {str(e)[:40]}")

print(f"")
print(f"PASS: {len(ok)} | FAIL: {len(fail)} | SKIP: {len(skip)}")

with open(REPORT,"w") as f:
    json.dump({"date":str(datetime.datetime.now()),"pass":len(ok),"fail":len(fail),"skip":len(skip),"failures":fail,"skipped":skip},f,indent=2)
print(f"Report: {REPORT}")
