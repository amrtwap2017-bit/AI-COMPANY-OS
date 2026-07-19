"""
TASK 01 — Portal TypeScript Health
===================================
Goal: Remove ignoreBuildErrors, fix real TS errors properly
Safe: backs up every file before touching it
"""
import os, glob, shutil, json, datetime

PORTAL  = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
LOG     = "/home/amr/AI-COMPANY-OS/tasks/logs/task_01.log"
BACKUP  = "/home/amr/AI-COMPANY-OS/tasks/logs/task_01_backups"

os.makedirs(BACKUP, exist_ok=True)

def log(msg):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = f"[{ts}] {msg}"
    print(out, flush=True)
    with open(LOG, "a") as f:
        f.write(out + "\n")

def backup(filepath):
    rel  = filepath.replace(PORTAL + "/", "")
    dest = os.path.join(BACKUP, rel.replace("/", "__"))
    shutil.copy2(filepath, dest)

results = {"fixed": [], "skipped": [], "errors": []}

log("TASK 01 START — Portal TypeScript Health Fix")
log(f"Portal: {PORTAL}")

# ── Fix 1: Remove ignoreBuildErrors from next.config.ts ──────
config = os.path.join(PORTAL, "next.config.ts")
if os.path.exists(config):
    backup(config)
    with open(config) as f:
        content = f.read()
    if "ignoreBuildErrors" in content:
        import re
        fixed = re.sub(r'\s*typescript:\s*\{[^}]+\},?', '', content)
        with open(config, "w") as f:
            f.write(fixed)
        results["fixed"].append("next.config.ts — removed ignoreBuildErrors")
        log("  ✅ next.config.ts — ignoreBuildErrors removed")
    else:
        log("  ⏭  next.config.ts — already clean")

# ── Fix 2: Ensure all client components have "use client" ─────
log("\nScanning for hook usage without use-client...")
CLIENT_HOOKS = [
    "useState","useEffect","useRef","useCallback",
    "useMemo","useContext","useReducer",
    "useQuery","useMutation","useQueryClient",
    "useForm","useRouter","usePathname",
    "useSearchParams","useParams",
]

files = glob.glob(f"{PORTAL}/app/**/*.tsx", recursive=True) + \
        glob.glob(f"{PORTAL}/components/**/*.tsx", recursive=True)

for f in files:
    if "node_modules" in f or ".next" in f:
        continue
    try:
        with open(f) as fp:
            content = fp.read()

        stripped = content.strip()
        is_client = stripped.startswith('"use client"') or \
                    stripped.startswith("'use client'")
        has_hook  = any(f"({h}" in content or f" {h}(" in content
                        for h in CLIENT_HOOKS)

        if has_hook and not is_client:
            backup(f)
            # Remove force-dynamic if present (conflicts)
            new = content.replace('export const dynamic = "force-dynamic";\n', '')
            new = '"use client";\n' + new
            with open(f, "w") as fp:
                fp.write(new)
            rel = f.replace(PORTAL + "/", "")
            results["fixed"].append(rel)
            log(f"  ✅ Added use-client: {rel}")

    except Exception as e:
        results["errors"].append(f"{f}: {e}")

# ── Fix 3: Remove force-dynamic from client components ────────
log("\nCleaning force-dynamic conflicts...")
for f in files:
    if "node_modules" in f or ".next" in f:
        continue
    try:
        with open(f) as fp:
            content = fp.read()
        stripped = content.strip()
        is_client = stripped.startswith('"use client"') or \
                    stripped.startswith("'use client'")
        has_fd = 'export const dynamic = "force-dynamic"' in content

        if is_client and has_fd:
            backup(f)
            fixed = content.replace(
                'export const dynamic = "force-dynamic";\n', ''
            )
            with open(f, "w") as fp:
                fp.write(fixed)
            rel = f.replace(PORTAL + "/", "")
            results["fixed"].append(f"force-dynamic removed: {rel}")
            log(f"  ✅ Removed force-dynamic: {rel}")

    except Exception as e:
        results["errors"].append(f"{f}: {e}")

# ── Fix 4: Deduplicate all imports ────────────────────────────
log("\nDeduplicating imports...")
import re
for f in files:
    if "node_modules" in f or ".next" in f:
        continue
    try:
        with open(f) as fp:
            content = fp.read()
        original = content
        lines = content.split("\n")
        new_lines = []
        for line in lines:
            if not line.strip().startswith("import"):
                new_lines.append(line)
                continue
            m = re.search(r'\{([^}]+)\}', line)
            if not m:
                new_lines.append(line)
                continue
            names = [n.strip() for n in m.group(1).split(",") if n.strip()]
            seen  = list(dict.fromkeys(names))  # dedup preserve order
            if len(seen) != len(names):
                new_line = line[:m.start(1)] + ", ".join(seen) + line[m.end(1):]
                new_lines.append(new_line)
            else:
                new_lines.append(line)
        content = "\n".join(new_lines)
        if content != original:
            backup(f)
            with open(f, "w") as fp:
                fp.write(content)
            rel = f.replace(PORTAL + "/", "")
            results["fixed"].append(f"dedup imports: {rel}")
            log(f"  ✅ Dedup imports: {rel}")
    except Exception as e:
        results["errors"].append(str(e))

# ── Summary ───────────────────────────────────────────────────
log("\n" + "="*40)
log(f"TASK 01 COMPLETE")
log(f"  Fixed:   {len(results['fixed'])}")
log(f"  Skipped: {len(results['skipped'])}")
log(f"  Errors:  {len(results['errors'])}")
if results["errors"]:
    for e in results["errors"][:5]:
        log(f"  ERR: {e}")

result_file = "/home/amr/AI-COMPANY-OS/tasks/logs/task_01_result.json"
with open(result_file, "w") as f:
    json.dump(results, f, indent=2)
log(f"Results: {result_file}")
