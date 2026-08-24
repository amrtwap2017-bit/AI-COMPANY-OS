"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.events || d?.items || d?.data || [];
const fmtRelative = (d: any) => {
  if (!d) return "";
  try { const h=Math.floor((Date.now()-new Date(d).getTime())/3600000); return h<1?"just now":h<24?h+"h ago":Math.floor(h/24)+"d ago"; }
  catch { return ""; }
};
const fmtDate = (d: any) => {
  if (!d) return "";
  try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return ""; return dt.toLocaleString("en-GB",{dateStyle:"short",timeStyle:"short"}); }
  catch { return ""; }
};

const ACTION_COLORS: Record<string, string> = {
  created:"#547C4D", status_changed:"#5B7C8C", approved:"#547C4D",
  selected:"#8D7443", sent_to_vendor:"#B07A2A", accepted:"#547C4D",
  assigned:"#5B7C8C", logged:"#6D5F53", login:"#6D5F53",
  updated:"#B07A2A", deleted:"#A84A3D",
};
const ENTITY_ICONS: Record<string, string> = {
  scope_of_work:"📋", rfq_header:"📝", vendor_quotation:"⚖️",
  purchase_order:"📦", goods_receipt:"✅", supplier_invoice:"📄",
  approval_request:"✍️", work_order:"🔧", time_entry:"🕐",
  user:"👤", vendor:"🏭",
};
const ENTITY_PATHS: Record<string, string> = {
  scope_of_work:"/supply-chain/scope-of-work/",
  purchase_order:"/supply-chain/purchase-orders-v2/",
  work_order:"/operations/work-orders/",
  supplier_invoice:"/supply-chain/invoices/",
  vendor:"/supply-chain/vendor-management/",
};

export default function AuditTrailPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState("all");

  const { data: recent, isLoading } = useQuery(
    ["audit-recent", filterType],
    () => authFetch("/api/v1/audit-log/recent?limit=100" + (filterType !== "all" ? "&entity_type=" + filterType : "")).then(r => (r as any).data ?? r),
    { staleTime: 15000 }
  );
  const { data: summary } = useQuery(
    ["audit-summary"],
    () => authFetch("/api/v1/audit-log/summary").then(r => (r as any).data ?? r),
    { staleTime: 30000 }
  );

  const events = toArr(recent);
  const stats = summary?.last_7_days || {};
  const byType = summary?.by_entity_type || [];
  const entityTypes = [...new Set(events.map((e: any) => e.entity_type))].sort();

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#221D1A 0%,#1A0A15 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-rose-400 mb-1.5">Administration</div>
          <h1 className="tb-hero-title">Audit Trail</h1>
          <p className="tb-hero-description">Complete activity log — who changed what and when</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              {label:"Events (7d)",value:stats.total_events||0,color:"#221D1A"},
              {label:"Entity Types",value:stats.entity_types||0,color:"#5B7C8C"},
              {label:"Unique Actors",value:stats.unique_actors||0,color:"#8D7443"},
              {label:"Last Event",value:fmtRelative(stats.last_event),color:"#547C4D"},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">

          {/* LEFT: Filters */}
          <div className="space-y-4">
            <div className="tb-section">
              <div className="tb-section-title">Filter by Type</div>
              <div className="space-y-1">
                <button onClick={()=>setFilterType("all")}
                  className={"w-full text-left px-3 py-2 rounded-lg text-xs transition-colors " + (filterType==="all" ? "bg-brand/10 text-brand font-bold" : "text-tertiary hover:text-primary hover:bg-base-alt")}>
                  All Events
                </button>
                {entityTypes.map((t: any) => (
                  <button key={t} onClick={()=>setFilterType(t)}
                    className={"w-full text-left px-3 py-2 rounded-lg text-xs transition-colors " + (filterType===t ? "bg-brand/10 text-brand font-bold" : "text-tertiary hover:text-primary hover:bg-base-alt")}>
                    {(ENTITY_ICONS as Record<string, any>)[t]||"📄"} {t.replace(/_/g," ")}
                  </button>
                ))}
              </div>
            </div>

            {byType.length > 0 && (
              <div className="tb-section">
                <div className="tb-section-title">Activity by Type (7d)</div>
                <div className="space-y-2 mt-2">
                  {byType.map((b: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs py-1 border-b border-border">
                      <span className="text-tertiary">{(b.entity_type||"").replace(/_/g," ")}</span>
                      <span className="font-bold text-secondary">{b.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Event Timeline */}
          <div className="xl:col-span-3">
            <div className="tb-section">
              <div className="tb-flex-between mb-4">
                <div className="tb-section-title" style={{marginBottom:0}}>Activity Timeline ({events.length} events)</div>
              </div>

              {isLoading ? (
                <div className="space-y-3">{[1,2,3,4,5].map((i: any) => <div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
              ) : events.length === 0 ? (
                <div className="tb-empty">
                  <div className="tb-empty-icon">📜</div>
                  <div className="tb-empty-title">No audit events</div>
                  <div className="tb-empty-desc">Activity will appear here as the platform is used</div>
                </div>
              ) : (
                <div className="space-y-1">
                  {events.map((e: any,i: number) => {
                    const ac = (ACTION_COLORS as Record<string, any>)[e.action] || "#6D5F53";
                    const icon = (ENTITY_ICONS as Record<string, any>)[e.entity_type] || "📄";
                    const path = (ENTITY_PATHS as Record<string, any>)[e.entity_type];
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-base-alt hover:bg-surface transition-colors border border-transparent hover:border-border">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                          <span style={{fontSize:"1.1rem"}}>{icon}</span>
                          <div className="w-0.5 h-6 bg-border rounded-full"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-primary">{e.actor_name || "System"}</span>
                            <span className="tb-badge" style={{background:ac+"18",color:ac,border:"1px solid "+ac+"30",fontSize:"0.45rem"}}>{(e.action||"").replace(/_/g," ")}</span>
                            <span className="text-xs text-tertiary">{e.entity_type?.replace(/_/g," ")}</span>
                          </div>
                          {e.new_value && (
                            <div className="text-xs text-secondary mt-0.5">{e.new_value}</div>
                          )}
                          {e.old_value && e.new_value && (
                            <div className="text-xs text-tertiary mt-0.5">
                              <span style={{color:"#A84A3D"}}>-{e.old_value}</span>
                              <span className="mx-1">→</span>
                              <span style={{color:"#547C4D"}}>+{e.new_value}</span>
                            </div>
                          )}
                          {e.metadata && (
                            <div className="text-xs text-tertiary mt-0.5 opacity-60">{e.metadata}</div>
                          )}
                          <div className="text-xs text-tertiary mt-1 opacity-50">{fmtDate(e.created_at)} · {fmtRelative(e.created_at)}</div>
                        </div>
                        {path && e.entity_id && (
                          <button onClick={()=>router.push(path+e.entity_id)}
                            className="text-xs text-brand flex-shrink-0 hover:underline">
                            View →
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
