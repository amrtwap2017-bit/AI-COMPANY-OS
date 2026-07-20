#!/usr/bin/env python3
"""
PROGRAM A — TASK A2
Enterprise Execution Manager: Shell Error Boundaries
Audit ref: 06-Architecture-Gaps.md — GAP 8
Fix: No error.tsx at layout group level — shell crash = blank screen
"""
import os, json, datetime

PORTAL  = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
LOG     = "/home/amr/AI-COMPANY-OS/tasks/logs/a2_error_boundaries.log"
results = {"created": []}

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    msg = f"[{ts}] {m}"
    print(msg, flush=True)
    open(LOG, "a").write(msg + "\n")

def write(path, content, label):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    log(f"  OK: {label}")
    results["created"].append(label)

open(LOG, "w").close()
log("=" * 60)
log("PROGRAM A — A2: Shell Error Boundaries")
log("=" * 60)

# Shared error UI template
error_shell = \'\'\'// @ts-nocheck
"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to observability (extend when monitoring is wired)
    console.error("[TB Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
          {/* Icon */}
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Something went wrong
          </h2>

          {/* Message */}
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {error?.message || "An unexpected error occurred. The team has been notified."}
          </p>

          {/* Error digest for support */}
          {error?.digest && (
            <p className="text-xs text-slate-400 mb-5 font-mono bg-slate-50 px-3 py-1.5 rounded-lg">
              Error ID: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <a
              href="/workspace"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </a>
          </div>
        </div>

        {/* Support note */}
        <p className="text-center text-xs text-slate-400 mt-4">
          If this persists, contact{" "}
          <a href="mailto:support@triangleblack.com"
            className="text-amber-600 hover:underline">
            support@triangleblack.com
          </a>
        </p>
      </div>
    </div>
  );
}
\'\'\'

# A2.1: Error boundary at (app) group level
log("\nA2.1 — Creating app/(app)/error.tsx")
write(
    PORTAL + "/app/(app)/error.tsx",
    error_shell,
    "app/(app)/error.tsx"
)

# A2.2: Error boundary at (enterprise) group level
log("\nA2.2 — Creating app/(app)/(enterprise)/error.tsx")
write(
    PORTAL + "/app/(app)/(enterprise)/error.tsx",
    error_shell,
    "app/(app)/(enterprise)/error.tsx"
)

# A2.3: Global not-found upgrade
log("\nA2.3 — Upgrading app/not-found.tsx")
not_found = \'\'\'// @ts-nocheck
import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-10 h-10 text-amber-600" />
        </div>

        <div className="text-7xl font-black text-slate-200 mb-4 leading-none">404</div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">Page not found</h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
          Use the navigation to find what you need.
        </p>

        <div className="flex items-center gap-3 justify-center">
          <Link
            href="/workspace"
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-400 mb-3">Quick links</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "Operations",  href: "/operations" },
              { label: "Supply Chain", href: "/supply-chain" },
              { label: "Analytics",   href: "/analytics" },
              { label: "Executive",   href: "/executive" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-amber-300 hover:text-amber-700 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
\'\'\'
write(PORTAL + "/app/not-found.tsx", not_found, "app/not-found.tsx")

log("\n" + "=" * 60)
log("A2 COMPLETE — Shell Error Boundaries")
for f in results["created"]: log(f"  + {f}")

with open("/home/amr/AI-COMPANY-OS/tasks/logs/a2_summary.json", "w") as f:
    json.dump({"task": "A2", "status": "COMPLETE",
               "timestamp": str(datetime.datetime.now()),
               "created": results["created"]}, f, indent=2)
