#!/usr/bin/env python3
import os, re, json, datetime

ROOT = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"
COMM = ROOT + "/src/commercial"
MAIN = ROOT + "/main.py"
OUT  = "/home/amr/AI-COMPANY-OS/tasks/logs/router_registration_audit.json"

modules = sorted([
    d for d in os.listdir(COMM)
    if os.path.isdir(os.path.join(COMM, d)) and not d.startswith("__")
])

with open(MAIN) as f:
    main = f.read()

registered = []
missing = []

for mod in modules:
    if f"src.commercial.{mod}.router" in main:
        registered.append(mod)
    else:
        missing.append(mod)

report = {
    "timestamp": str(datetime.datetime.now()),
    "total_modules": len(modules),
    "registered": registered,
    "missing": missing,
    "registered_count": len(registered),
    "missing_count": len(missing),
}

with open(OUT, "w") as f:
    json.dump(report, f, indent=2)

print("Router Registration Audit")
print("=" * 40)
print("Total modules:   ", len(modules))
print("Registered:      ", len(registered))
print("Missing:         ", len(missing))
print("\nMissing modules:")
for m in missing:
    print(" -", m)
print("\nSaved:", OUT)
