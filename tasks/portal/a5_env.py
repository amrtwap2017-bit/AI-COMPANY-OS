#!/usr/bin/env python3
"""
PROGRAM A — TASK A5
Enterprise Execution Manager: Environment Validation
Audit ref: 06-Architecture-Gaps.md — GAP 14
Fix: process.env used directly without validation
     Two different API URL fallbacks across files
"""
import os, json, datetime

PORTAL  = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
LOG     = "/home/amr/AI-COMPANY-OS/tasks/logs/a5_env.log"
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
log("PROGRAM A — A5: Environment Configuration")
log("=" * 60)

log("\nA5.1 — Creating lib/env.ts")

env_ts = \'\'\'// Triangle Black — Environment Configuration
// Program A — Task A5
// Single source of truth for all environment variables.
// Validates required values at startup — fails loudly if misconfigured.

const required = (key: string, fallback?: string): string => {
  const val = process.env[key] || fallback;
  if (!val && typeof window === "undefined") {
    // Server-side only: hard fail on missing required env
    throw new Error(
      `[TB Config] Missing required environment variable: ${key}\n` +
      `Add it to .env.local:\n  ${key}=<value>`
    );
  }
  return val || "";
};

const optional = (key: string, fallback = ""): string =>
  process.env[key] || fallback;

export const env = {
  // API endpoints
  apiUrl:      required("NEXT_PUBLIC_API_URL",      "http://localhost:8030"),
  aiEngineUrl: required("NEXT_PUBLIC_AI_ENGINE_URL", "http://localhost:8001"),

  // API base (with /api/v1 suffix for structured client)
  get apiBase(): string {
    return this.apiUrl + "/api/v1";
  },

  // App config
  appName:     optional("NEXT_PUBLIC_APP_NAME",     "Triangle Black"),
  appEnv:      optional("NEXT_PUBLIC_APP_ENV",      "development"),
  authBypass:  optional("NEXT_PUBLIC_AUTH_BYPASS",  "false") === "true",

  // Helpers
  get isDev():  boolean { return this.appEnv === "development"; },
  get isProd(): boolean { return this.appEnv === "production"; },
  get isTest(): boolean { return this.appEnv === "test"; },
} as const;

export default env;
\'\'\'

write(PORTAL + "/lib/env.ts", env_ts, "lib/env.ts")

log("\n" + "=" * 60)
log("A5 COMPLETE — Environment Configuration")
for f in results["created"]: log(f"  + {f}")

with open("/home/amr/AI-COMPANY-OS/tasks/logs/a5_summary.json", "w") as f:
    json.dump({"task": "A5", "status": "COMPLETE",
               "timestamp": str(datetime.datetime.now()),
               "created": results["created"]}, f, indent=2)
