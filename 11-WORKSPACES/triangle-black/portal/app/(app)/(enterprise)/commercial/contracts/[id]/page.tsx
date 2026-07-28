"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_COLOR = {
  active:"#34D399", expired:"#F87171", pending:"#FBBF24",
  draft:"#94A3B8", cancelled:"#64748B", renewed:"#A78BFA"
};
const INV_STATUS_COLOR = {
  paid:"#34D399", pending:"#FBBF24", overdue:"#F87171", cancelled:"#94A3B8"
};

export default function ContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: ct, isLoading } = useQuery(
    ["ct-detail", id],
    () => authFetch(`/api/v1/contracts-portal${id}`).then(r => r.json()),
    { enabled: !!id }
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-secondary text-sm animate-pulse">Loading contract...</div>
    </div>
  );

  if (!ct || ct.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">📄</div>
        <div className="tb-empty-title">Contract not found</div>
        <button onClick={() => router.push("/commercial/contracts")} className="tb-btn-primary mt-4">Back</button>
      </div>
    </div>
  );

  const sc       = STATUS_COLOR[ct.status] || "#94A3B8";
  const invoices = ct.invoices || [];
  const wos      = ct.work_orders || [];
  const totalInv = invoices.reduce((s,i) => s + Number(i.total_amount||0), 0);
  const paidInv  = invoices.filter(i => i.status === "paid").reduce((s,i) => s + Number(i.total_amount||0), 0);
  const now      = new Date();
  const endDate  = ct.end_date ? new Date(ct.end_date) : null;
  const daysLeft = endDate ? Math.ceil((endDate - now) / 86400000) : null;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #1A0F28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-purple-400 mb-1.5">Commercial</div>
              <h1 className="tb-hero-title">{ct.title || `Contract ${id?.slice(0,8)}`}</h1>
              <p className="tb-hero-description">
                <span className="tb-badge mr-2" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`}}>
                  {ct.status||"—"}
                </span>
                {ct.client_name && <span className="text-secondary mr-2">{ct.client_name}</span>}
                {daysLeft !== null && daysLeft > 0 && (
                  <span style={{color:daysLeft<30?"#F87171":"#94A3B8"}}>
                    {daysLeft}d remaining
                  </span>
                )}
              </p>
            </div>
            <button onClick={() => router.push("/commercial/contracts")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Contract Value", value:fmtEGP(ct.total_value||ct.value||0), color:"#34D399" },
              { label:"Invoiced",       value:fmtEGP(totalInv),                    color:"#FBBF24" },
              { label:"Collected",      value:fmtEGP(paidInv),                     color:"#A78BFA" },
              { label:"Expires",        value:fmtDate(ct.end_date),                color:daysLeft&&daysLeft<30?"#F87171":"#F1F5F9" },
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
        {daysLeft !== null && daysLeft <= 30 && daysLeft > 0 && (
          <div className="tb-section" style={{borderColor:"#FBBF2440",background:"#FBBF2408"}}>
            <div className="flex items-center gap-3">
              <span style={{fontSize:"1.25rem"}}>⏰</span>
              <span className="text-sm font-semibold" style={{color:"#FBBF24"}}>
                Contract expires in {daysLeft} days — {fmtDate(ct.end_date)}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-5">
            <div className="tb-section">
              <div className="tb-section-title">Contract Details</div>
              <div className="space-y-1">
                {[
                  ["Title",          ct.title || "—"],
                  ["Client",         ct.client_name || "—"],
                  ["Type",           ct.contract_type || ct.type || "—"],
                  ["Status",         ct.status || "—"],
                  ["Value",          fmtEGP(ct.total_value || ct.value || 0)],
                  ["Start Date",     fmtDate(ct.start_date)],
                  ["End Date",       fmtDate(ct.end_date)],
                  ["Created",        fmtDate(ct.created_at)],
                ].map(([l, v], i) => (
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{l}</span>
                    <span className="tb-info-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {ct.description && (
              <div className="tb-section">
                <div className="tb-section-title">Scope of Work</div>
                <p className="text-sm text-secondary leading-relaxed">{ct.description}</p>
              </div>
            )}

            {invoices.length > 0 && (
              <div className="tb-section">
                <div className="tb-section-header">
                  <div className="tb-section-title" style={{marginBottom:0}}>Invoices ({invoices.length})</div>
                  <button onClick={() => router.push("/invoices")} className="tb-section-link">All →</button>
                </div>
                <div className="tb-table" style={{borderRadius:12,overflow:"hidden",marginTop:12}}>
                  <div className="tb-table-head" style={{gridTemplateColumns:"1fr 80px 120px 100px"}}>
                    {["Invoice","Status","Amount","Due"].map((h, i) => (
                      <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                    ))}
                  </div>
                  {invoices.map((inv, i) => {
                    const ic = INV_STATUS_COLOR[inv.status] || "#94A3B8";
                    return (
                      <button key={i}
                        onClick={() => router.push(`/invoices/${inv.id}`)}
                        className="tb-table-row"
                        style={{gridTemplateColumns:"1fr 80px 120px 100px"}}>
                        <div className="text-sm font-medium text-primary truncate pr-4">{inv.invoice_number || inv.id?.slice(0,16)}</div>
                        <div className="text-center">
                          <span className="tb-badge" style={{background:`${ic}18`,color:ic,border:`1px solid ${ic}30`,fontSize:"0.5625rem"}}>{inv.status||"—"}</span>
                        </div>
                        <div className="text-center text-sm font-bold text-emerald-400">{fmtEGP(inv.total_amount||0)}</div>
                        <div className="text-center text-xs text-tertiary">{fmtDate(inv.due_date)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {wos.length > 0 && (
              <div className="tb-section">
                <div className="tb-section-header">
                  <div className="tb-section-title" style={{marginBottom:0}}>Work Orders ({wos.length})</div>
                  <button onClick={() => router.push("/operations/work-orders")} className="tb-section-link">All →</button>
                </div>
                <div className="space-y-2 mt-3">
                  {wos.map((wo, i) => {
                    const pc = { critical:"#F87171", high:"#FB923C", medium:"#FBBF24", low:"#94A3B8" }[wo.priority] || "#94A3B8";
                    return (
                      <button key={i}
                        onClick={() => router.push(`/operations/work-orders/${wo.id}`)}
                        className="tb-action-item w-full justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="tb-priority-bar" style={{background:pc}}/>
                          <span className="text-sm text-secondary truncate">{wo.title||"—"}</span>
                        </div>
                        <span className="tb-badge" style={{fontSize:"0.5625rem",flexShrink:0}}>{wo.status||"—"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="tb-section">
              <div className="tb-section-title">Financial Summary</div>
              <div className="space-y-3">
                {[
                  { label:"Contract Value", value:fmtEGP(ct.total_value||0), color:"#F1F5F9" },
                  { label:"Total Invoiced",  value:fmtEGP(totalInv),          color:"#FBBF24" },
                  { label:"Total Collected", value:fmtEGP(paidInv),           color:"#34D399" },
                  { label:"Outstanding",     value:fmtEGP(totalInv-paidInv),  color:totalInv-paidInv>0?"#F87171":"#34D399" },
                ].map((row, i) => (
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{row.label}</span>
                    <span className="text-sm font-bold" style={{color:row.color}}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Quick Actions</div>
              <div className="space-y-2">
                {[
                  { label:"All Contracts", icon:"📄", path:"/commercial/contracts" },
                  { label:"Leads",         icon:"👤", path:"/commercial/leads" },
                  { label:"Invoices",      icon:"💰", path:"/invoices" },
                  { label:"Work Orders",   icon:"🔧", path:"/operations/work-orders" },
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
