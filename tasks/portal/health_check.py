#!/usr/bin/env python3
# Triangle Black Portal — Health Check
# TB-009: Automated architecture validation

import os, glob, json, datetime

PORTAL  = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
REPORT  = "/home/amr/AI-COMPANY-OS/tasks/logs/health_report.json"
results = {"pass":[], "fail":[], "warn":[], "total":0}

def check(name, test, path=""):
    results["total"] += 1
    if test:
        results["pass"].append(name+(": "+path if path else ""))
    else:
        results["fail"].append(name+(": "+path if path else ""))

print("Triangle Black Portal Health Check")
print("="*50)

tsx_files = glob.glob(PORTAL+"/app/**/*.tsx", recursive=True)
tsx_files = [f for f in tsx_files if "node_modules" not in f and ".next" not in f]

old_color_count    = 0
double_sidebar     = 0
breadcrumb_error   = 0
dark_bg_inside     = 0
own_layout_count   = 0
missing_client     = 0

for f in tsx_files:
    try:
        with open(f) as fp: content = fp.read()
        rel = f.replace(PORTAL+"/","")

        if "#1B2B4B" in content:
            old_color_count += 1
            results["fail"].append("OLD_COLOR: "+rel)

        if ("Sidebar" in content and
            'from "@/components/Sidebar"' in content and
            "null shim" not in content):
            double_sidebar += 1
            results["fail"].append("DOUBLE_SIDEBAR: "+rel)

        if "error.tsx" in f and ("Breadcrumb" in content or "usePathname" in content):
            breadcrumb_error += 1
            results["fail"].append("BREADCRUMB_IN_ERROR: "+rel)

        if ("page.tsx" in f and
            any(p in content for p in ["min-h-screen","h-screen"]) and
            "PageWrapper" not in content):
            own_layout_count += 1
            results["warn"].append("OWN_LAYOUT: "+rel)

    except: pass

total_issues = old_color_count + double_sidebar + breadcrumb_error
print(f"Old colors (#1B2B4B):     {old_color_count} files")
print(f"Double sidebar imports:   {double_sidebar} files")
print(f"Breadcrumb in error.tsx:  {breadcrumb_error} files")
print(f"Own layout (warning):     {own_layout_count} files")
print(f"")
print(f"TOTAL ISSUES: {total_issues}")
print(f"TOTAL WARNINGS: {len(results['warn'])}")
print(f"STATUS: {'PASS' if total_issues==0 else 'FAIL'}")

with open(REPORT,"w") as f:
    json.dump({
        "date":       str(datetime.datetime.now()),
        "issues":     total_issues,
        "warnings":   len(results["warn"]),
        "status":     "PASS" if total_issues==0 else "FAIL",
        "details":    results,
    }, f, indent=2)
print(f"Report: {REPORT}")
