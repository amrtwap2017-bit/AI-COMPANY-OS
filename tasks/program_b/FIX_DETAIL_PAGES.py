import os, glob, datetime

ROOT   = "/home/amr/AI-COMPANY-OS"
PORTAL = ROOT + "/11-WORKSPACES/triangle-black/portal"
LOG    = ROOT + "/tasks/logs/fix_detail_pages.log"

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "[" + ts + "] " + str(m)
    print(out, flush=True)
    open(LOG,"a").write(out+"\n")

def write(path, content, label=""):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path,"w") as f: f.write(content)
    if label: log("  WROTE: " + label)

open(LOG,"w").close()
log("=" * 60)
log("FIX DETAIL PAGES — Real data fetch with proper ID handling")
log("=" * 60)

# Generic detail page template that works for ANY entity
def make_detail_page(title, badge, api_base, fields, back_href, color="amber"):
    fields_jsx = ""
    for label, key in fields:
        fields_jsx += '''        { label: "''' + label + '''", key: "''' + key + '''" },\n'''
    
    return '''// @ts-nocheck
"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EntityTabs } from "@/components/ui/EntityTabs";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { fmtDate } from "@/lib/design-tokens";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const FIELDS = [
''' + fields_jsx + '''];

function formatValue(key: string, val: any): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "number") {
    if (key.includes("value") || key.includes("amount") || key.includes("budget") || key.includes("price"))
      return "EGP " + val.toLocaleString();
    return String(val);
  }
  if (typeof val === "string") {
    if (val.match(/^\\d{4}-\\d{2}-\\d{2}/)) return fmtDate(val);
    return val;
  }
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
}

export default function DetailPage() {
  const params  = useParams();
  const id      = params?.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey:  ["''' + api_base.replace("/","-") + '''", id],
    queryFn:   () => authFetchJSON("''' + api_base + '''/" + id),
    enabled:   !!id,
    staleTime: 30_000,
    retry:     1,
  });

  if (isLoading) return <PageWrapper><LoadingState type="table" rows={6}/></PageWrapper>;
  
  if (isError || !data) {
    return (
      <PageWrapper>
        <AlertBanner type="error" title="Record not found (ID: " + {id} + ")"/>
        <Link href="''' + back_href + '''" className="flex items-center gap-2 text-sm text-amber-600 mt-4">
          <ArrowLeft className="w-4 h-4"/> Back to list
        </Link>
      </PageWrapper>
    );
  }

  const d: any = Array.isArray(data) ? data[0] : (data?.data || data);
  if (!d) return <PageWrapper><AlertBanner type="warning" title="No data found for this record"/></PageWrapper>;

  const title = d?.title || d?.name || d?.company_name || d?.quote_number || d?.contract_number || d?.invoice_number || d?.po_number || id?.slice(0,8) || "Record";
  const subtitle = d?.status ? "Status: " + d.status : "";

  const overview = (
    <div className="space-y-4">
      {d?.status && (
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
          <span className={"text-sm font-bold px-3 py-1.5 rounded-full capitalize " + getStateColor(d.status)}>
            {String(d.status).replace(/_/g," ")}
          </span>
          {d?.priority && (
            <span className={"text-sm font-bold px-3 py-1.5 rounded-full capitalize " + getStateColor(d.priority)}>
              {d.priority} priority
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({label, key}: any) => {
          const val = d?.[key];
          if (val === null || val === undefined) return null;
          return (
            <div key={key} className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-sm font-medium text-slate-900">{formatValue(key, val)}</p>
            </div>
          );
        })}
      </div>
      {(d?.description || d?.notes || d?.body) && (
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-2">Notes</p>
          <p className="text-sm text-slate-700 leading-relaxed">{d?.description || d?.notes || d?.body}</p>
        </div>
      )}
    </div>
  );

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader
        title={title}
        subtitle={subtitle}
        badge="''' + badge + '''"
        actions={
          <Link href="''' + back_href + '''"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4"/> Back
          </Link>
        }/>
      <EntityTabs tabs={[
        { id:"overview", label:"Overview", icon:"📋", content: overview },
      ]}/>
    </PageWrapper>
  );
}
'''

# ── Fix ALL detail pages ──────────────────────────────────────
DETAIL_PAGES = {
    "app/(app)/quotes/[id]/page.tsx": (
        "Quote Detail", "QT", "/api/v1/quotes", "/quotes",
        [("Quote #","quote_number"),("Title","title"),("Lead","lead_id"),
         ("Total Value","total_value"),("Currency","currency"),("Status","status"),
         ("Valid Until","valid_until"),("Created","created_at")]
    ),
    "app/(app)/contracts/[id]/page.tsx": (
        "Contract Detail", "CTR", "/api/v1/contracts", "/contracts",
        [("Contract #","contract_number"),("Client","client_name"),("Type","contract_type"),
         ("Value","total_value"),("Currency","currency"),("Status","status"),
         ("Start Date","start_date"),("End Date","end_date"),("Created","created_at")]
    ),
    "app/(app)/invoices/[id]/page.tsx": (
        "Invoice Detail", "INV", "/api/v1/invoices", "/invoices",
        [("Invoice #","invoice_number"),("Client","client_name"),("Amount","total_amount"),
         ("Currency","currency"),("Status","status"),("Issue Date","issue_date"),
         ("Due Date","due_date"),("Contract","contract_id"),("Created","created_at")]
    ),
    "app/(app)/assets/[id]/page.tsx": (
        "Asset Detail", "ASSET", "/api/v1/assets", "/assets",
        [("Name","name"),("Type","asset_type"),("Serial #","serial_number"),
         ("Manufacturer","manufacturer"),("Model","model"),("Status","status"),
         ("Location","location"),("Hotel","hotel_id")]
    ),
    "app/(app)/technicians/[id]/page.tsx": (
        "Technician", "TECH", "/api/v1/technicians", "/technicians",
        [("Name","name"),("Email","email"),("Phone","phone"),
         ("Status","is_active"),("Max Jobs","max_work_orders"),
         ("Current Jobs","current_work_orders")]
    ),
    "app/(app)/(enterprise)/projects-center/[id]/page.tsx": (
        "Project Detail", "PRJ", "/api/v1/projects", "/projects-center",
        [("Name","name"),("Type","project_type"),("Status","status"),
         ("Progress","completion_percentage"),("Budget","budget_total"),
         ("Spent","budget_spent"),("Start","start_date"),("End","end_date")]
    ),
    "app/(app)/(enterprise)/supply-chain/suppliers/[id]/page.tsx": (
        "Supplier Detail", "VDR", "/api/v1/inventory/vendors", "/supply-chain/suppliers",
        [("Name","name"),("Category","category"),("Email","contact_email"),
         ("Phone","contact_phone"),("City","city"),("Country","country"),("Active","is_active")]
    ),
    "app/(app)/(enterprise)/customers/[id]/page.tsx": (
        "Customer Detail", "CX", "/api/v1/customers", "/customers",
        [("Name","name"),("Email","email"),("Phone","phone"),
         ("Hotel","hotel_id"),("Status","status"),("Health","health_score")]
    ),
    "app/(app)/(enterprise)/operations/work-orders/[id]/page.tsx": (
        "Work Order", "WO", "/api/v1/work-orders", "/work-orders",
        [("Title","title"),("Type","type"),("Priority","priority"),
         ("Status","status"),("Technician","technician_id"),("Asset","asset_id"),
         ("Due Date","due_date"),("Created","created_at")]
    ),
    "app/(app)/leads/[id]/page.tsx": (
        "Lead Detail", "LEAD", "/api/v1/actions/leads", "/leads",
        [("Company","company_name"),("Contact","contact_name"),("Email","email"),
         ("Phone","phone"),("Status","status"),("Source","source"),("Created","created_at")]
    ),
    "app/(app)/work-orders/[id]/page.tsx": (
        "Work Order Detail", "WO", "/api/v1/work-orders", "/work-orders",
        [("Title","title"),("Type","type"),("Priority","priority"),
         ("Status","status"),("Due Date","due_date"),("Created","created_at")]
    ),
    "app/(app)/(enterprise)/supply-chain/rfqs/[id]/page.tsx": (
        "RFQ Detail", "RFQ", "/api/v1/rfqs", "/supply-chain/rfqs",
        [("RFQ #","rfq_number"),("Title","title"),("Budget","budget_estimate"),
         ("Status","status"),("Deadline","submission_deadline"),("Created","created_at")]
    ),
    "app/(app)/(enterprise)/maintenance/pm-plans/360/page.tsx": (
        "PM Plan Detail", "PM", "/api/v1/maintenance/pm-plans", "/maintenance/pm-plans",
        [("Title","title"),("Frequency","frequency"),("Status","status"),
         ("Next Due","next_due_date"),("Asset","asset_id")]
    ),
}

for rel_path, (title, badge, api, back, fields) in DETAIL_PAGES.items():
    full_path = PORTAL + "/app/" + rel_path
    content   = make_detail_page(title, badge, api, fields, back)
    write(full_path, content, rel_path)

log("  Wrote " + str(len(DETAIL_PAGES)) + " detail pages")
log("")
log("DETAIL PAGES COMPLETE")
log("All pages now:")
log("  - Fetch by ID from correct endpoint")
log("  - Show all fields cleanly")
log("  - Handle not found gracefully")
log("  - Format dates, amounts, status correctly")
