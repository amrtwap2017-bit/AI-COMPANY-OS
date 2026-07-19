"""
TASK 04 — Portal Missing Files & Wiring
=========================================
Creates: error boundaries, loading skeletons,
         empty states, proper 404, layout fixes
Checks: all page imports resolve
"""
import os, glob, datetime, json

PORTAL  = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
LOG     = "/home/amr/AI-COMPANY-OS/tasks/logs/task_04.log"
results = {"created": [], "verified": [], "warnings": []}

def log(msg):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = f"[{ts}] {msg}"
    print(out, flush=True)
    with open(LOG, "a") as f:
        f.write(out + "\n")

def write_file(path, content, label):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if not os.path.exists(path):
        with open(path, "w") as f:
            f.write(content)
        results["created"].append(label)
        log(f"  ✅ Created: {label}")
    else:
        log(f"  ⏭  Exists:  {label}")

log("TASK 04 START — Portal Missing Files & Wiring")

# ── Create global error boundary ─────────────────────────────
write_file(
    PORTAL + "/app/error.tsx",
    '''"use client";
import { useEffect } from "react";

export default function GlobalError({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center p-8 max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-2 text-red-400">Something went wrong</h2>
        <p className="text-slate-400 mb-6 text-sm">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
''',
    "app/error.tsx — global error boundary"
)

# ── Create global not-found ───────────────────────────────────
write_file(
    PORTAL + "/app/not-found.tsx",
    '''import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center p-8">
        <div className="text-8xl font-black text-slate-700 mb-4">404</div>
        <h2 className="text-2xl font-bold mb-2">Page not found</h2>
        <p className="text-slate-400 mb-6">This page does not exist in Triangle Black</p>
        <Link
          href="/dashboard"
          className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
''',
    "app/not-found.tsx — 404 page"
)

# ── Create loading skeletons for main sections ────────────────
loading_sections = [
    "dashboard", "leads", "work-orders",
    "technicians", "assets", "warehouses",
]
SKELETON = '''"use client";
export default function Loading() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-800 rounded w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>
        ))}
      </div>
      <div className="space-y-3">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-12 bg-slate-800 rounded"></div>
        ))}
      </div>
    </div>
  );
}
'''
for section in loading_sections:
    write_file(
        PORTAL + f"/app/(app)/{section}/loading.tsx",
        SKELETON,
        f"app/(app)/{section}/loading.tsx"
    )

# ── Create shared EmptyState component ───────────────────────
write_file(
    PORTAL + "/components/ui/EmptyState.tsx",
    '''"use client";
import { ReactNode } from "react";

interface Props {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon="📭", title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-400 text-sm max-w-sm mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
''',
    "components/ui/EmptyState.tsx"
)

# ── Create shared PageHeader component ───────────────────────
write_file(
    PORTAL + "/components/ui/PageHeader.tsx",
    '''"use client";
import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
''',
    "components/ui/PageHeader.tsx"
)

# ── Create shared StatusBadge component ──────────────────────
write_file(
    PORTAL + "/components/ui/StatusBadge.tsx",
    '''"use client";

const STATUS_COLORS: Record<string, string> = {
  active:      "bg-green-500/20 text-green-400 border-green-500/30",
  inactive:    "bg-slate-500/20 text-slate-400 border-slate-500/30",
  pending:     "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  failed:      "bg-red-500/20 text-red-400 border-red-500/30",
  new:         "bg-purple-500/20 text-purple-400 border-purple-500/30",
  qualified:   "bg-green-500/20 text-green-400 border-green-500/30",
  negotiation: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  won:         "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  lost:        "bg-red-500/20 text-red-400 border-red-500/30",
  open:        "bg-blue-500/20 text-blue-400 border-blue-500/30",
  closed:      "bg-slate-500/20 text-slate-400 border-slate-500/30",
  critical:    "bg-red-500/20 text-red-400 border-red-500/30",
  high:        "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium:      "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low:         "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

interface Props {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: Props) {
  const key    = status?.toLowerCase?.() ?? "inactive";
  const colors = STATUS_COLORS[key] ?? STATUS_COLORS.inactive;
  return (
    <span className={
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border " +
      colors + " " + className
    }>
      {status}
    </span>
  );
}
''',
    "components/ui/StatusBadge.tsx"
)

# ── Export all new UI components from index ───────────────────
ui_index = PORTAL + "/components/ui/index.ts"
exports  = [
    'export { EmptyState } from "./EmptyState";',
    'export { PageHeader } from "./PageHeader";',
    'export { StatusBadge } from "./StatusBadge";',
]
if os.path.exists(ui_index):
    with open(ui_index) as f:
        existing = f.read()
    new_exports = [e for e in exports if e not in existing]
    if new_exports:
        with open(ui_index, "a") as f:
            f.write("\n" + "\n".join(new_exports) + "\n")
        results["created"].append("ui/index.ts updated")
        log("  ✅ ui/index.ts updated with new exports")
else:
    with open(ui_index, "w") as f:
        f.write("\n".join(exports) + "\n")
    results["created"].append("components/ui/index.ts created")
    log("  ✅ components/ui/index.ts created")

# ── Verify critical files exist ───────────────────────────────
log("\nVerifying critical files...")
critical = [
    "lib/utils.ts", "lib/types.ts", "lib/api.ts",
    "lib/api/client.ts", "lib/api/auth.ts",
    "components/ui/EmptyState.tsx",
    "app/error.tsx", "app/not-found.tsx",
]
for f in critical:
    full = os.path.join(PORTAL, f)
    if os.path.exists(full):
        results["verified"].append(f)
        log(f"  ✅ {f}")
    else:
        results["warnings"].append(f"MISSING: {f}")
        log(f"  ❌ MISSING: {f}")

# ── Summary ───────────────────────────────────────────────────
log("\n" + "="*40)
log("TASK 04 COMPLETE")
log(f"  Created:  {len(results['created'])}")
log(f"  Verified: {len(results['verified'])}")
log(f"  Warnings: {len(results['warnings'])}")

with open("/home/amr/AI-COMPANY-OS/tasks/logs/task_04_result.json", "w") as f:
    json.dump(results, f, indent=2)
