"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_COLOR = {
  pending:"#60A5FA", approved:"#34D399", rejected:"#F87171",
  ordered:"#A78BFA", draft:"#94A3B8", cancelled:"#64748B"
};

export default function PurchaseRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: pr, isLoading } = useQuery(
    ["pr-detail", id],
    () => authFetch("/api/v1/purchase-requests-portal" + id).then(r => r.json()),
    { enabled: !!id }
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-secondary text-sm animate-pulse">Loading...</div>
    </div>
  );

  if (!pr || pr.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">📋</div>
        <div className="tb-empty-title">Purchase request not found</div>
        <button onClick={() => router.push("/supply-chain/purchase-requests")} className="tb-btn-primary mt-4">Back</button>
      </div>
    </div>
  );

  const sc = STATUS_COLOR[pr.status] || "#94A3B8";

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0D1A12 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1.5">Supply Chain · Procurement</div>
              <h1 className="tb-hero-title">{pr.title || ("PR-" + (id||"").slice(0,8))}</h1>
              <p className="tb-hero-description">
                <span className="tb-badge mr-2" style={{background:sc+"18",color:sc,border:"1px solid "+sc+"30"}}>{pr.status||"—"}</span>
                {pr.requested_by && <span className="text-secondary">by {pr.requested_by}</span>}
              </p>
            </div>
            <button onClick={() => router.push("/supply-chain/purchase-requests")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Status",      value:(pr.status||"—").toUpperCase(),   color:sc },
              { label:"Total",       value:fmtEGP(pr.total_amount||0),       color:"#34D399" },
              { label:"Requested By",value:pr.requested_by||"—",             color:"#F1F5F9" },
              { label:"Created",     value:fmtDate(pr.created_at),           color:"#94A3B8" },
            ].map((k, i) => (
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-5">
            <div className="tb-section">
              <div className="tb-section-title">Request Details</div>
              <div className="space-y-1">
                {[
                  ["Title",         pr.title || "—"],
                  ["Status",        pr.status || "—"],
                  ["Priority",      pr.priority || "—"],
                  ["Requested By",  pr.requested_by || "—"],
                  ["Department",    pr.department || "—"],
                  ["Supplier",      pr.supplier_name || "—"],
                  ["Total Amount",  fmtEGP(pr.total_amount||0)],
                  ["Required By",   fmtDate(pr.required_date || pr.needed_by)],
                  ["Created",       fmtDate(pr.created_at)],
                  ["Approved By",   pr.approved_by || "—"],
                  ["Approved At",   fmtDate(pr.approved_at)],
                ].map(([l, v], i) => (
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{l}</span>
                    <span className="tb-info-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {pr.notes && (
              <div className="tb-section">
                <div className="tb-section-title">Notes</div>
                <p className="text-sm text-secondary leading-relaxed">{pr.notes}</p>
              </div>
            )}

            {/* Approval timeline */}
            <div className="tb-section">
              <div className="tb-section-title">Approval Status</div>
              <div className="space-y-3">
                {[
                  { label:"Submitted",  date:pr.created_at,  done:true,                               color:"#60A5FA" },
                  { label:"Approved",   date:pr.approved_at, done:pr.status==="approved"||pr.status==="ordered", color:"#34D399" },
                  { label:"Ordered",    date:pr.ordered_at,  done:pr.status==="ordered",              color:"#A78BFA" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div style={{
                      width:20, height:20, borderRadius:"50%", flexShrink:0,
                      background: step.done ? step.color+"30" : "transparent",
                      border: "2px solid " + (step.done ? step.color : "#334155"),
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"0.625rem", color: step.done ? step.color : "#64748B", fontWeight:900,
                    }}>
                      {step.done ? "✓" : ""}
                    </div>
                    <div>
                      <div className="text-xs font-semibold" style={{color:step.done?step.color:"#64748B"}}>{step.label}</div>
                      {step.date && <div className="text-xs text-tertiary">{fmtDate(step.date)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="tb-section">
              <div className="tb-section-title">Status</div>
              <div className="text-center py-4">
                <div className="text-5xl font-black mb-2" style={{color:sc}}>
                  {pr.status === "approved" ? "✓" : pr.status === "rejected" ? "✗" : "○"}
                </div>
                <div className="text-sm font-bold" style={{color:sc}}>{(pr.status||"—").toUpperCase()}</div>
              </div>
            </div>
            <div className="tb-section">
              <div className="tb-section-title">Quick Actions</div>
              <div className="space-y-2">
                {[
                  { label:"All PRs",         icon:"📋", path:"/supply-chain/purchase-requests" },
                  { label:"Purchase Orders",  icon:"📦", path:"/supply-chain/purchase-orders" },
                  { label:"Suppliers",        icon:"🏭", path:"/supply-chain/suppliers" },
                  { label:"Inventory",        icon:"📦", path:"/supply-chain/inventory" },
                ].map((a, i) => (
                  <button key={i} onClick={() => router.push(a.path)} className="tb-action-item w-full justify-start">
                    <span>{a.icon}</span>
                    <span className="text-sm text-secondary">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
