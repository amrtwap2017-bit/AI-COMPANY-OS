#!/usr/bin/env python3
import os
import glob

PORTAL = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"

legacy_files = [
    "lib/supply-chain-api.ts",
    "lib/entity-view-api.ts",
    "lib/inbox-api.ts",
    "lib/analytics-api.ts",
    "lib/enterprise-api.ts",
    "lib/safe-api.ts",
]

print("LEGACY API AUDIT")
print("=" * 60)

for rel in legacy_files:
    full = os.path.join(PORTAL, rel)
    if not os.path.exists(full):
        print("MISSING:", rel)
        continue

    with open(full) as f:
        content = f.read()

    uses_safe = ("safe-api" in content) or ("safeFetch" in content)
    uses_tb   = ("tb-client" in content) or ("tbFetch" in content)

    print("")
    print("FILE:", rel)
    print("  uses safe-api :", uses_safe)
    print("  uses tb-client:", uses_tb)

    basename = os.path.basename(rel).replace(".ts", "")
    importers = []

    for tsx in glob.glob(PORTAL + "/app/**/*.tsx", recursive=True):
        if ".next" in tsx:
            continue
        with open(tsx) as f:
            c = f.read()
        if basename in c:
            importers.append(tsx.replace(PORTAL + "/", ""))

    if importers:
        print("  imported by {} page(s):".format(len(importers)))
        for imp in importers[:10]:
            print("   -", imp)
    else:
        print("  imported by 0 pages - candidate for archive")

print("")
print("=" * 60)
print("RECOMMENDATION")
print("1. Keep only structured APIs in lib/api/*")
print("2. Archive legacy lib/*-api.ts files with zero imports")
print("3. Leave safe-api.ts only if notifications page still depends on it")
