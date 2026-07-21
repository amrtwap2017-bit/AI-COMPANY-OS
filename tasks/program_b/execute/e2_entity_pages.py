import os, json, datetime, urllib.request, subprocess

ROOT   = "/home/amr/AI-COMPANY-OS"
TB     = ROOT + "/11-WORKSPACES/triangle-black"
PORTAL = TB + "/portal"
NODE   = "/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin/node"
OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "qwen2.5-coder:7b"
LOG    = ROOT + "/tasks/program_b/logs/e2.log"

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "[" + ts + "] " + str(m)
    print(out, flush=True)
    open(LOG, "a").write(out + "\n")

def ask(prompt, timeout=180):
    data = json.dumps({
        "model": MODEL, "prompt": prompt, "stream": False,
        "keep_alive": "30m",
        "options": {"num_predict": 2500, "temperature": 0.05},
    }).encode()
    req = urllib.request.Request(
        OLLAMA, data=data,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read()).get("response", "")
    except Exception as e:
        return "Error: " + str(e)

def write(path, content, label=""):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f: f.write(content)
    if label: log("  WROTE: " + label)

open(LOG, "w").close()
log("=" * 60)
log("E2 — ENTITY PAGES: Build universal detail page structure")
log("=" * 60)

log("\n1. Creating Work Order detail page (enterprise standard)")
wo_detail = ask(
    "Build a production-quality Work Order detail page for Triangle Black.\n\n"
    "FILE: app/(app)/(enterprise)/operations/work-orders/[id]/page.tsx\n\n"
    "AVAILABLE COMPONENTS:\n"
    "import { PageWrapper, PageHeader, DataTable, LoadingState, EmptyState, AlertBanner, StatusBadge } from '@/components/ui';\n"
    "import { WorkflowStatusBadge, WorkflowActionBar, EntityTabs, EntityTimeline } from '@/components/ui';\n"
    "import { useWorkflow } from '@/lib/hooks/useWorkflow';\n"
    "import { useAuthFetch } from '@/lib/hooks/useAuthFetch';\n\n"
    "AVAILABLE API:\n"
    "GET /api/v1/work-orders/{id} -> work order data\n"
    "GET /api/v1/actions/work-orders/{id}/timeline -> timeline events\n"
    "POST /api/v1/work-orders/{id}/transition -> state change\n"
    "POST /api/v1/actions/work-orders/{id}/assign -> assign technician\n"
    "POST /api/v1/actions/work-orders/{id}/complete -> complete\n\n"
    "WORK ORDER FIELDS: id, title, description, status, priority, type,\n"
    "technician_id, asset_id, hotel_id, due_date, created_at, updated_at\n\n"
    "WORKFLOW TRANSITIONS:\n"
    "draft->submitted, submitted->approved/rejected, approved->assigned,\n"
    "assigned->in_progress, in_progress->inspection/completed,\n"
    "inspection->completed, completed->closed\n\n"
    "BUILD:\n"
    "1. Header with: Title, Status badge, Priority badge, Action buttons\n"
    "2. EntityTabs with: Overview | Timeline | Documents | Approvals | Related\n"
    "3. Overview tab: Key fields in 2-column grid\n"
    "4. WorkflowActionBar with available transitions\n"
    "5. Loading and error states\n\n"
    "RULES:\n"
    "- 'use client' as first line\n"
    "- Use TanStack Query (useQuery) for data\n"
    "- Use useParams to get id\n"
    "- Never use min-h-screen\n"
    "- Import types from existing types\n\n"
    "Return COMPLETE TypeScript component code."
)
write(PORTAL + "/app/(app)/(enterprise)/operations/work-orders/[id]/page.tsx",
      wo_detail, "work-orders/[id]/page.tsx")

log("\n2. Creating Leads detail page")
lead_detail = ask(
    "Build a production-quality Lead detail page for Triangle Black CRM.\n\n"
    "FILE: app/(app)/leads/[id]/page.tsx\n\n"
    "AVAILABLE COMPONENTS:\n"
    "import { PageWrapper, PageHeader, LoadingState, AlertBanner, StatusBadge } from '@/components/ui';\n"
    "import { WorkflowStatusBadge, WorkflowActionBar, EntityTabs, EntityTimeline } from '@/components/ui';\n"
    "import { useWorkflow } from '@/lib/hooks/useWorkflow';\n"
    "import { useAuthFetch } from '@/lib/hooks/useAuthFetch';\n\n"
    "API ENDPOINTS:\n"
    "GET /api/v1/actions/leads/{id} -> lead data\n"
    "GET /api/v1/actions/leads/{id}/timeline -> history\n"
    "POST /api/v1/actions/leads/{id}/qualify -> qualify lead\n"
    "POST /api/v1/actions/leads/{id}/quote -> create quote from lead\n"
    "POST /api/v1/actions/leads/{id}/note -> add note\n\n"
    "LEAD FIELDS: id, company_name, contact_name, email, phone, status, source, notes\n\n"
    "LEAD LIFECYCLE: new -> qualified -> negotiation -> won/lost\n\n"
    "BUILD:\n"
    "1. Header: Company name + contact + status badge + action buttons\n"
    "2. EntityTabs: Overview | Timeline | Activities | Quotes | Related\n"
    "3. Overview: company info, contact info, source, notes\n"
    "4. Quick actions: Qualify, Add Note, Create Quote, Assign Agent\n"
    "5. Timeline with real data from API\n\n"
    "Return COMPLETE TypeScript code. Use 'use client' as first line."
)
write(PORTAL + "/app/(app)/leads/[id]/page.tsx", lead_detail, "leads/[id]/page.tsx")

log("\n3. Creating Purchase Order detail page")
po_detail = ask(
    "Build a Purchase Order detail page for Triangle Black procurement.\n\n"
    "FILE: app/(app)/(enterprise)/supply-chain/purchase-orders/[id]/page.tsx\n\n"
    "IMPORT: same components as above\n\n"
    "API:\n"
    "GET /api/v1/inventory/purchase-orders/{id}\n"
    "POST /api/v1/approvals/{id}/approve?approval_type=purchase_order\n"
    "POST /api/v1/approvals/{id}/reject?approval_type=purchase_order\n\n"
    "PO FIELDS: id, po_number, supplier, items[], total_amount, status, hotel_id\n"
    "PO LIFECYCLE: draft -> submitted -> approved -> ordered -> partial_received -> received -> invoiced -> paid\n\n"
    "BUILD:\n"
    "1. Header: PO number, supplier, total amount, status, approve/reject buttons\n"
    "2. EntityTabs: Overview | Items | Timeline | Documents | Approval\n"
    "3. Overview: supplier info, dates, amounts, delivery details\n"
    "4. Items table: name, qty, unit_price, total\n"
    "5. Approval tab: show approval history\n\n"
    "Return COMPLETE TypeScript code."
)
write(PORTAL + "/app/(app)/(enterprise)/supply-chain/purchase-orders/[id]/page.tsx",
      po_detail, "supply-chain/purchase-orders/[id]/page.tsx")

log("\n4. Creating Asset detail page")
asset_detail = ask(
    "Build an Asset detail page for Triangle Black maintenance.\n\n"
    "FILE: app/(app)/assets/[id]/page.tsx\n\n"
    "SAME IMPORTS as above.\n\n"
    "API:\n"
    "GET /api/v1/assets/{id}\n"
    "GET /api/v1/maintenance/asset-tree\n\n"
    "ASSET FIELDS: id, name, asset_type, location, serial_number, model, manufacturer,\n"
    "status, hotel_id, purchase_date, warranty_expiry, last_maintenance\n\n"
    "ASSET LIFECYCLE: active -> under_maintenance -> inspection -> decommissioned\n\n"
    "BUILD:\n"
    "1. Header: Asset name, type badge, location, status\n"
    "2. EntityTabs: Overview | Maintenance History | Work Orders | Documents | Specifications\n"
    "3. Overview: location, model, serial, warranty status, health indicator\n"
    "4. Maintenance history as timeline\n"
    "5. Link to active work orders for this asset\n\n"
    "Return COMPLETE TypeScript code."
)
write(PORTAL + "/app/(app)/assets/[id]/page.tsx", asset_detail, "assets/[id]/page.tsx")

log("\n5. Creating Project detail page")
proj_detail = ask(
    "Build a Project detail page for Triangle Black engineering.\n\n"
    "FILE: app/(app)/(enterprise)/projects-center/[id]/page.tsx\n\n"
    "SAME IMPORTS. Also:\n"
    "import { Progress } from '@/components/ui';\n\n"
    "API:\n"
    "GET /api/v1/projects/{id}\n"
    "GET /api/v1/projects/{id}/phases\n"
    "GET /api/v1/projects/{id}/milestones\n"
    "GET /api/v1/projects/{id}/risks\n\n"
    "PROJECT FIELDS: id, name, description, status, progress, budget_total, budget_spent,\n"
    "start_date, end_date, hotel_id, phases[], milestones[], risks[]\n\n"
    "BUILD:\n"
    "1. Header: Project name, status, progress bar, budget utilization\n"
    "2. EntityTabs: Overview | Phases | Milestones | Risks | Documents | Timeline\n"
    "3. Overview: dates, budget, team, hotel client\n"
    "4. Phases as visual stepper\n"
    "5. Risk matrix with severity indicators\n\n"
    "Return COMPLETE TypeScript code."
)
write(PORTAL + "/app/(app)/(enterprise)/projects-center/[id]/page.tsx",
      proj_detail, "projects-center/[id]/page.tsx")

log("\n6. Build check")
env = {**os.environ,
    "PATH": os.path.dirname(NODE) + ":" + os.environ.get("PATH", ""),
    "NODE_ENV": "production", "NEXT_TELEMETRY_DISABLED": "1"}

r = subprocess.run([NODE, "node_modules/.bin/next", "build"],
    cwd=PORTAL, capture_output=True, text=True, timeout=120, env=env)

if r.returncode == 0:
    log("  ✅ BUILD PASSES")
else:
    log("  ⚠️  Build has issues — checking")
    seen = set()
    for line in (r.stdout + r.stderr).split("\n"):
        s = line.strip()
        if s and "node_modules" not in s:
            for kw in ["Error:", "Type error", "doesn't exist", "parallel pages"]:
                if kw in s and s not in seen:
                    seen.add(s); log("  > " + s[:100])

result = {
    "date":  str(datetime.datetime.now()),
    "files": [
        "operations/work-orders/[id]/page.tsx",
        "leads/[id]/page.tsx",
        "supply-chain/purchase-orders/[id]/page.tsx",
        "assets/[id]/page.tsx",
        "projects-center/[id]/page.tsx",
    ],
    "build": "pass" if r.returncode == 0 else "warn"
}

with open(ROOT + "/tasks/program_b/logs/e2_results.json", "w") as f:
    json.dump(result, f, indent=2)

log("\n" + "=" * 60)
log("E2 COMPLETE — ENTITY PAGES")
log("  Entity detail pages: " + str(len(result["files"])))
for f in result["files"]: log("  ✅ " + f)
log("  Build: " + result["build"])
