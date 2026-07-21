#!/usr/bin/env python3
"""
SPRINT 9 TIER 1 - Wire high-value placeholder pages to real data
Runs Qwen to generate page code, then writes to portal
"""
import subprocess, json, os, datetime

PORTAL  = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
OUT     = "/home/amr/AI-COMPANY-OS/tasks/portal/sprint9"
MODEL   = "qwen2.5-coder:7b"
OLLAMA  = "http://localhost:11434/api/generate"

def qwen_code(prompt, max_tokens=1500):
    payload = json.dumps({
        "model": MODEL,
        "stream": False,
        "prompt": prompt,
        "options": {"temperature": 0.1, "num_predict": max_tokens}
    })
    r = subprocess.run(
        ["curl", "-s", "-X", "POST", OLLAMA,
         "-H", "Content-Type: application/json", "-d", payload],
        capture_output=True, text=True, timeout=180
    )
    try:
        return json.loads(r.stdout).get("response", "")
    except Exception:
        return ""

def write_page(path, content, label):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"  WROTE: {label}")

tasks = [
    {
        "id": "T1-001",
        "label": "Operations SLA Review",
        "path": PORTAL + "/app/(app)/(enterprise)/operations/sla-review/page.tsx",
        "prompt": """Write a complete Next.js 16 page component for /operations/sla-review for a hotel engineering SaaS.

Tech stack: TypeScript, Tailwind, @tanstack/react-query, lucide-react
Available: import { PageWrapper, PageHeader, SectionCard, LoadingState, AlertBanner } from "@/components/ui"
Available: import { authFetch } from "@/lib/hooks/useAuthFetch"
Available: import { Progress } from "@/components/ui"

The page calls GET /api/v1/analytics/sla which returns:
{compliance_rate, total_work_orders, completed, critical_open, sla_target, sla_status}

Show:
1. SLA compliance gauge (Progress component, target 95%)
2. KPI grid: compliance%, total WOs, critical open, completed
3. Status badge: Compliant (green) or At Risk (red)
4. Refresh button with toast

Write COMPLETE working code. Start with: "use client"; // @ts-nocheck"""
    },
    {
        "id": "T1-002",
        "label": "Operations Calendar",
        "path": PORTAL + "/app/(app)/(enterprise)/operations/calendar/page.tsx",
        "prompt": """Write a Next.js 16 page for /operations/calendar for hotel engineering.

Tech stack: TypeScript, Tailwind, @tanstack/react-query
Available: import { PageWrapper, PageHeader, SectionCard, LoadingState, StatusBadge } from "@/components/ui"
Available: import { authFetch } from "@/lib/hooks/useAuthFetch"

Data from GET /api/v1/maintenance/pm-plans returns array of:
{id, title, plan_type, frequency, next_due_date, status, owner}

Show a simple calendar-style list grouped by week showing:
- PM plans due this week (next_due_date)
- Color coding by plan_type (preventive=blue, inspection=amber)
- Status badge for each plan
- Empty state if no plans due

Write COMPLETE working code. Start with: "use client"; // @ts-nocheck"""
    },
    {
        "id": "T1-003",
        "label": "Operations Workbench",
        "path": PORTAL + "/app/(app)/(enterprise)/operations/workbench/page.tsx",
        "prompt": """Write a Next.js 16 operations workbench page for hotel engineering field manager.

Tech stack: TypeScript, Tailwind, @tanstack/react-query
Available: import { PageWrapper, PageHeader, SectionCard, LoadingState, StatusBadge, Avatar, Progress } from "@/components/ui"
Available: import { authFetch } from "@/lib/hooks/useAuthFetch"

Calls these APIs:
- GET /api/v1/work-orders -> array of work orders
- GET /api/v1/technicians -> array of technicians with current_work_orders, max_work_orders
- GET /api/v1/actions/dashboard/stats -> {total_leads, open_quotes, unread_notifications}

Show 4 sections:
1. Today's KPIs: open WOs, in-progress, critical, available technicians
2. Critical work orders list (priority=critical, status!=completed)
3. Technician capacity cards (Avatar + Progress bar each)
4. Quick actions: New WO button, Dispatch link

Write COMPLETE working code. Start with: "use client"; // @ts-nocheck"""
    },
]

print("=" * 60)
print("SPRINT 9 TIER 1 EXECUTION")
print(f"Tasks: {len(tasks)}")
print("=" * 60)

for task in tasks:
    print(f"\n[{task['id']}] {task['label']}...")
    code = qwen_code(task["prompt"])
    if len(code) < 100:
        print(f"  WARN: Qwen returned short response ({len(code)} chars)")
        # Write a safe placeholder that still compiles
        code = f'''"use client";
// @ts-nocheck
// {task["label"]} - Auto-generated placeholder
import {{ PageWrapper, PageHeader, SectionCard }} from "@/components/ui";

export default function Page() {{
  return (
    <PageWrapper>
      <PageHeader title="{task["label"]}" subtitle="Coming soon" badge="WIP" />
      <SectionCard title="Under Construction">
        <p className="text-sm text-slate-500">This page is being built.</p>
      </SectionCard>
    </PageWrapper>
  );
}}
'''
    write_page(task["path"], code, task["path"].split("/portal/")[-1])

print("\n" + "=" * 60)
print("TIER 1 COMPLETE - Build portal to verify:")
print("  cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal")
print("  node node_modules/.bin/next build 2>&1 | tail -5")
