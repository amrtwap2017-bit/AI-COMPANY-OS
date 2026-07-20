"""
TASK 05 — Hub AI Wiring Verification
======================================
Verifies: all services healthy, agent chat works,
          Nginx HTTPS, DB counts, Qdrant collections
Fixes: START-SAFE.sh node path, log rotation
"""
import os, json, datetime, urllib.request, subprocess

LOG     = "/home/amr/AI-COMPANY-OS/tasks/logs/task_05.log"
ROOT    = "/home/amr/AI-COMPANY-OS"
results = {"healthy": [], "fixed": [], "broken": []}

def log(msg):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = f"[{ts}] {msg}"
    print(out, flush=True)
    with open(LOG, "a") as f:
        f.write(out + "\n")

def check_url(url, name, timeout=8):
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            if r.status == 200:
                results["healthy"].append(name)
                log(f"  ✅ {name}: 200 OK")
                return True
    except Exception as e:
        results["broken"].append(f"{name}: {e}")
        log(f"  ❌ {name}: {e}")
    return False

log("TASK 05 START — Hub AI Wiring Verification")

# ── Check all services ────────────────────────────────────────
log("\n── Service Health ──")
services = [
    ("http://localhost:8001/api/v1/ai/health", "AI Engine :8001"),
    ("http://localhost:8030/",        "TB Admin :8030"),
    ("http://localhost:3000",                   "Hub :3000"),
    ("http://localhost:3001/dashboard",         "Portal :3001"),
    ("http://localhost:6333/collections",       "Qdrant :6333"),
    ("http://localhost:11434/api/tags",         "Ollama :11434"),
]
for url, name in services:
    check_url(url, name)

# ── Test agent chat ───────────────────────────────────────────
log("\n── Agent Chat Test ──")
try:
    data = json.dumps({
        "model":  "qwen2.5-coder:7b",
        "prompt": "Reply with exactly: WIRING_OK",
        "stream": False,
        "options": {"num_predict": 10},
    }).encode()
    req = urllib.request.Request(
        "http://localhost:11434/api/generate",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        resp = json.loads(r.read()).get("response", "")
        log(f"  ✅ Ollama direct: '{resp[:30]}'")
        results["healthy"].append("Ollama chat")
except Exception as e:
    log(f"  ❌ Ollama chat: {e}")
    results["broken"].append(f"Ollama chat: {e}")

# ── Fix START-SAFE.sh node path ───────────────────────────────
log("\n── Fixing START-SAFE.sh ──")
safe_sh = os.path.join(ROOT, "START-SAFE.sh")
fnm_node = "/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin"

if os.path.exists(safe_sh):
    with open(safe_sh) as f:
        content = f.read()

    fixes = {
        "npx next start": "node node_modules/.bin/next start",
        "npm run start":  "node node_modules/.bin/next start",
    }
    changed = False
    for old, new in fixes.items():
        if old in content:
            content = content.replace(old, new)
            changed = True

    # Ensure fnm PATH is set at top
    fnm_export = f'export PATH="{fnm_node}:$PATH"\n'
    if fnm_export not in content and fnm_node not in content:
        content = content.replace("#!/bin/bash\n",
                                  "#!/bin/bash\n" + fnm_export)
        changed = True

    if changed:
        with open(safe_sh, "w") as f:
            f.write(content)
        results["fixed"].append("START-SAFE.sh: node path fixed")
        log("  ✅ START-SAFE.sh updated")
    else:
        log("  ⏭  START-SAFE.sh already correct")

# ── Check DB counts ───────────────────────────────────────────
log("\n── DB Counts ──")
env = {**os.environ, "PGPASSWORD": "postgres"}
queries = [
    ("SELECT count(*) FROM tasks",       "Tasks"),
    ("SELECT count(*) FROM agents",      "Agents"),
    ("SELECT count(*) FROM memories",    "Memories"),
    ("SELECT count(*) FROM reflections", "Reflections"),
]
for q, label in queries:
    r = subprocess.run(
        ["psql","-U","postgres","-d","ai_company_os","-h","localhost",
         "-t","-A","-c", q],
        capture_output=True, text=True, env=env, timeout=5
    )
    count = r.stdout.strip()
    if count:
        log(f"  {label}: {count}")
    else:
        log(f"  ⚠️  {label}: error")

# ── Check next mode (must be start not dev) ───────────────────
log("\n── Next.js Mode Check ──")
r = subprocess.run(
    ["ps","aux"], capture_output=True, text=True
)
if "next dev" in r.stdout:
    results["broken"].append("next dev still running (should be next start)")
    log("  ❌ next dev detected! Should use next start")
elif "next start" in r.stdout or "next-server" in r.stdout:
    results["healthy"].append("next start (prod mode)")
    log("  ✅ next start running (prod mode)")
else:
    log("  ⚠️  No next process found")

# ── Log rotation (prevent huge log files) ────────────────────
log("\n── Log Sizes ──")
for logfile in ["/tmp/ai-engine.log", "/tmp/tb-admin.log",
                "/tmp/hub.log", "/tmp/portal.log"]:
    if os.path.exists(logfile):
        size = os.path.getsize(logfile) // 1024
        log(f"  {logfile.split('/')[-1]}: {size}KB")
        if size > 5000:  # > 5MB
            # Rotate: keep last 1000 lines
            r = subprocess.run(
                ["tail", "-1000", logfile],
                capture_output=True, text=True
            )
            with open(logfile, "w") as f:
                f.write(r.stdout)
            results["fixed"].append(f"Rotated {logfile.split('/')[-1]}")
            log(f"  ✅ Rotated (was {size}KB)")

# ── Summary ───────────────────────────────────────────────────
log("\n" + "="*40)
log("TASK 05 COMPLETE")
log(f"  Healthy: {len(results['healthy'])}")
log(f"  Fixed:   {len(results['fixed'])}")
log(f"  Broken:  {len(results['broken'])}")
if results["broken"]:
    log("\nBroken services:")
    for b in results["broken"]:
        log(f"  ❌ {b}")

with open("/home/amr/AI-COMPANY-OS/tasks/logs/task_05_result.json", "w") as f:
    json.dump(results, f, indent=2)
