#!/usr/bin/env python3
# BUILD GUARD — Prevents recurring build errors BEFORE they happen
# Run before every build: python3 tasks/program_b/BUILD_GUARD.py
# Or auto-runs via git pre-commit hook

import os, glob, re, sys, json, datetime

PORTAL = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
ROOT   = "/home/amr/AI-COMPANY-OS"
LOG    = ROOT + "/tasks/logs/build_guard.log"

issues  = []
fixed   = []
PASS_COLOR = "\033[32m"
FAIL_COLOR = "\033[31m"
WARN_COLOR = "\033[33m"
RESET      = "\033[0m"

def log(m, level="INFO"):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "["+ts+"] "+m
    print(out, flush=True)
    open(LOG,"a").write(out+"\n")

def issue(msg, filepath="", fix=None):
    issues.append({"msg":msg,"file":filepath,"fix":fix})
    rel = filepath.replace(PORTAL+"/","") if filepath else ""
    print(FAIL_COLOR+"  ISSUE: "+msg+(": "+rel if rel else "")+RESET)

def fixed_msg(msg):
    fixed.append(msg)
    print(PASS_COLOR+"  FIXED: "+msg+RESET)

open(LOG,"w").close()
log("="*60)
log("BUILD GUARD v1.0 — Pre-build validation")
log("="*60)

tsx_files = glob.glob(PORTAL+"/app/**/*.tsx", recursive=True)
tsx_files += glob.glob(PORTAL+"/components/**/*.tsx", recursive=True)
tsx_files  = [f for f in tsx_files if "node_modules" not in f and ".next" not in f]

# ── CHECK 1: CSV literal newline ──────────────────────────────
log("\nCheck 1: CSV literal newline (unicode escape)")
csv_fixed = 0
for f in tsx_files:
    try:
        with open(f) as fp: content = fp.read()
        original = content
        # Pattern: .join("\n") or .join("\\n") in CSV context
        if 'exportCSV' in content or 'export CSV' in content.lower():
            if '.join("\\n")' in content or ".join('\\n')" in content:
                content = content.replace('.join("\\n")', '.join(String.fromCharCode(10))')
                content = content.replace(".join('\\n')", '.join(String.fromCharCode(10))')
                with open(f,"w") as fp: fp.write(content)
                csv_fixed += 1
                fixed_msg("CSV newline: "+f.replace(PORTAL+"/",""))
    except: pass
if csv_fixed == 0:
    print(PASS_COLOR+"  OK: No CSV newline issues"+RESET)

# ── CHECK 2: Missing "use client" on hook-using files ─────────
log("\nCheck 2: Missing 'use client' on pages using hooks")
missing_client = 0
CLIENT_HOOKS = ["useState","useEffect","useRouter","usePathname",
                "useQuery","useMutation","useCallback","useRef","useParams"]
for f in tsx_files:
    if "node_modules" in f or "layout.tsx" in f: continue
    try:
        with open(f) as fp: content = fp.read()
        stripped = content.strip()
        has_client = stripped.startswith('"use client"') or stripped.startswith("'use client'")
        has_hooks  = any(h in content for h in CLIENT_HOOKS)
        if has_hooks and not has_client and "page.tsx" in f:
            # Auto-fix: add use client
            with open(f,"w") as fp: fp.write('"use client";\n'+content)
            missing_client += 1
            fixed_msg("use client: "+f.replace(PORTAL+"/",""))
    except: pass
if missing_client == 0:
    print(PASS_COLOR+"  OK: All hook-using pages have 'use client'"+RESET)

# ── CHECK 3: error.tsx files with hooks ───────────────────────
log("\nCheck 3: error.tsx files with illegal hook imports")
error_template = '''// @ts-nocheck
"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-red-100 p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-500 mb-6">{error?.message || "Unexpected error"}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700">
            <RefreshCw className="w-4 h-4"/> Try Again
          </button>
          <a href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200">
            <Home className="w-4 h-4"/> Home
          </a>
        </div>
      </div>
    </div>
  );
}
'''
error_files = glob.glob(PORTAL+"/app/**/error.tsx", recursive=True)
err_fixed = 0
for ef in error_files:
    try:
        with open(ef) as f: content = f.read()
        bad = any(p in content for p in [
            "usePathname","Breadcrumb","useRouter","useState","useQuery"
        ])
        if bad:
            with open(ef,"w") as f: f.write(error_template)
            err_fixed += 1
            fixed_msg("error.tsx: "+ef.replace(PORTAL+"/",""))
    except: pass
if err_fixed == 0:
    print(PASS_COLOR+"  OK: All error.tsx files are hook-free"+RESET)

# ── CHECK 4: Duplicate page routes ───────────────────────────
log("\nCheck 4: Duplicate page routes (parallel pages)")
page_files = glob.glob(PORTAL+"/app/**/page.tsx", recursive=True)
page_files  = [p for p in page_files if "node_modules" not in p]
seen_routes = {}
duplicates  = 0
for pf in page_files:
    # Normalize route (remove route groups)
    route = re.sub(r'/\([^)]+\)', '', pf.replace(PORTAL+"/app","").replace("/page.tsx",""))
    if route in seen_routes:
        issue("Duplicate route: "+route, pf,
              fix="Remove one of: "+pf+" or "+seen_routes[route])
        duplicates += 1
    else:
        seen_routes[route] = pf
if duplicates == 0:
    print(PASS_COLOR+"  OK: No duplicate routes"+RESET)

# ── CHECK 5: SSR-unsafe in ui/index.ts ───────────────────────
log("\nCheck 5: SSR-unsafe exports in ui/index.ts")
idx_path = PORTAL+"/components/ui/index.ts"
UNSAFE   = ["ExportButton","ActionBar","MobileNav","GlobalSearch"]
if os.path.exists(idx_path):
    with open(idx_path) as f: idx = f.read()
    idx_lines = idx.split("\n")
    safe_lines = []
    removed_unsafe = 0
    for line in idx_lines:
        is_unsafe = any(u in line and "export" in line for u in UNSAFE)
        if is_unsafe:
            safe_lines.append("// SSR-SAFE REMOVED: "+line)
            removed_unsafe += 1
        else:
            safe_lines.append(line)
    if removed_unsafe > 0:
        with open(idx_path,"w") as f: f.write("\n".join(safe_lines))
        fixed_msg("ui/index.ts: removed "+str(removed_unsafe)+" SSR-unsafe exports")
    else:
        print(PASS_COLOR+"  OK: ui/index.ts has no SSR-unsafe exports"+RESET)

# ── CHECK 6: Placeholder pages ───────────────────────────────
log("\nCheck 6: Placeholder pages remaining")
# Must match the ACTUAL placeholder template text exactly
PLACEHOLDER_PATTERNS = [
    "This section is being built",
    "coming soon — check back",
    "This page is under construction",
    "return null; // placeholder",
    "🚧 Coming Soon",
    ">Coming Soon<",
    ">Under Construction<",
]
still_placeholder = []
for pf in page_files:
    try:
        with open(pf) as f: content = f.read()
        if any(p in content for p in PLACEHOLDER_PATTERNS):
            still_placeholder.append(pf.replace(PORTAL+"/",""))
    except: pass
if still_placeholder:
    for p in still_placeholder:
        issue("Still placeholder",p)
else:
    print(PASS_COLOR+"  OK: Zero placeholder pages"+RESET)

# ── CHECK 7: Old color scheme ─────────────────────────────────
log("\nCheck 7: Old brand color #1B2B4B")
old_color_files = []
color_fixed7 = 0
for f in tsx_files:
    try:
        with open(f) as fp: content = fp.read()
        if "#1B2B4B" in content:
            old_color_files.append(f.replace(PORTAL+"/",""))
            content = content.replace("bg-[#1B2B4B]","bg-amber-600")
            content = content.replace("text-[#1B2B4B]","text-amber-700")
            content = content.replace("border-[#1B2B4B]","border-amber-600")
            with open(f,"w") as fp: fp.write(content)
            color_fixed7 += 1
    except: pass
if color_fixed7 > 0:
    fixed_msg("Old color: fixed in "+str(color_fixed7)+" files")
else:
    print(PASS_COLOR+"  OK: No old #1B2B4B colors"+RESET)

# ── SUMMARY ───────────────────────────────────────────────────
log("\n"+"="*60)
log("BUILD GUARD COMPLETE")
log("  Issues found: "+str(len(issues)))
log("  Auto-fixed:   "+str(len(fixed)))

result = {
    "date":   str(datetime.datetime.now()),
    "issues": len(issues),
    "fixed":  len(fixed),
    "details": {
        "csv_fixed":      csv_fixed,
        "client_fixed":   missing_client,
        "error_fixed":    err_fixed,
        "duplicates":     duplicates,
        "placeholder":    len(still_placeholder),
        "color_fixed":    color_fixed7,
    }
}

with open(ROOT+"/tasks/logs/build_guard_result.json","w") as f:
    json.dump(result,f,indent=2)

if len(issues) == 0:
    print(PASS_COLOR+"\n  ✅ BUILD GUARD PASSED — Safe to build"+RESET)
    sys.exit(0)
else:
    print(FAIL_COLOR+"\n  ❌ BUILD GUARD FAILED — "+str(len(issues))+" issues found"+RESET)
    for i in issues:
        print("  ISSUE: "+i["msg"]+(": "+i["file"] if i["file"] else ""))
    sys.exit(1)
