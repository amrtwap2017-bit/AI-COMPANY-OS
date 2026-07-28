"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime()) || dt.getFullYear() < 1990) return "—";
    return dt.toLocaleDateString("en-GB");
  } catch { return "—"; }
};
const fmtRelative = (d) => {
  if (!d) return "";
  try {
    const ms = Date.now() - new Date(d).getTime();
    const h = Math.floor(ms/3600000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  } catch { return ""; }
};

const PRIORITY_COLORS = {critical:"#F87171",high:"#FB923C",medium:"#FBBF24",low:"#34D399"};
const STATUS_COLORS = {open:"#60A5FA",in_progress:"#FBBF24",completed:"#34D399",cancelled:"#94A3B8"};
const URGENCY_COLORS = {critical:"#F87171",high:"#FB923C",medium:"#FBBF24",low:"#34D399"};

export default function ExecutiveDashboardPage() {
  const router = useRouter();
  const { data: dash, isLoading } = useQuery(
    ["exec-dashboard"],
    () => authFetch("/api/v1/executive/dashboard").then(r=>r.json()),
    { staleTime: 60000, refetchInterval: 120000 }
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="text-4xl">📊</div>
        <div className="text-secondary animate-pulse">Loading executive dashboard…</div>
      </div>
    </div>
  );

  const ops = dash?.operations || {};
  const fin = dash?.financial || {};
  const alerts = dash?.alerts || {};
  const wo = ops.work_orders || {};
  const sr = ops.service_requests || {};
  const inv = fin.invoices || {};
  const proj = fin.projects || {};

  const totalAlerts = alerts.total_alerts || 0;

  return (
    <div className="min-h-screen bg-base">
      {/* HERO */}
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0A0F1E 0%,#0D1A2A 50%,#0A1520 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between mb-4">
            <div>
              <div className="text-label-upper text-amber-400 mb-1">Executive Intelligence</div>
              <h1 className="tb-hero-title">Operations Dashboard</h1>
              <p className="tb-hero-description">Triangle Black Engineering Services — Real-time KPIs</p>
            </div>
            <div className="flex gap-2">
              {totalAlerts > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{background:"#F8717118",border:"1px solid #F8717140"}}>
                  <span style={{color:"#F87171",fontSize:"1.25rem"}}>⚠</span>
                  <span className="text-sm font-bold" style={{color:"#F87171"}}>{totalAlerts} Alerts</span>
                </div>
              )}
              <button onClick={()=>router.push("/operations/work-orders")} className="tb-btn-secondary" style={{fontSize:"0.75rem"}}>
                All Work Orders →
              </button>
            </div>
          </div>

          {/* TOP KPI ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label:"Open Work Orders",
                value: wo.open_count || 0,
                sub: `${wo.critical_open||0} critical · ${wo.overdue||0} overdue`,
                color: (wo.critical_open||0) > 0 ? "#F87171" : "#60A5FA",
                icon:"🔧",
                path:"/operations/work-orders"
              },
              {
                label:"Revenue Collected",
                value: fmtEGP(inv.collected||0),
                sub: `EGP ${Number(inv.outstanding||0).toLocaleString()} outstanding`,
                color:"#34D399",
                icon:"💰",
                path:"/supply-chain/invoices"
              },
              {
                label:"Active Projects",
                value: proj.active || 0,
                sub: `EGP ${Number(proj.total_budget||0).toLocaleString()} budget · ${Math.round(proj.avg_completion||0)}% avg`,
                color:"#A78BFA",
                icon:"🏗️",
                path:"/projects"
              },
              {
                label:"Service Requests",
                value: sr.open_count || 0,
                sub: `${sr.critical||0} critical · ${sr.high_urgency||0} high`,
                color: (sr.critical||0) > 0 ? "#FB923C" : "#FBBF24",
                icon:"🎫",
                path:"/operations/service-requests"
              },
            ].map((k,i)=>(
              <button key={i} onClick={()=>router.push(k.path)} className="tb-hero-kpi text-left hover:opacity-80 transition-opacity">
                <div className="flex items-start justify-between mb-1">
                  <span style={{fontSize:"1.5rem"}}>{k.icon}</span>
                </div>
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
                <div className="text-xs mt-1 opacity-60">{k.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* LEFT: Operations */}
          <div className="xl:col-span-2 space-y-4">

            {/* Work Order Status Breakdown */}
            <div className="tb-section">
              <div className="tb-flex-between mb-4">
                <div className="tb-section-title" style={{marginBottom:0}}>Work Order Status</div>
                <button onClick={()=>router.push("/operations/work-orders")} className="text-xs text-brand">View all →</button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  {label:"Total",value:wo.total||0,color:"#F1F5F9"},
                  {label:"Open",value:wo.open_count||0,color:"#60A5FA"},
                  {label:"In Progress",value:wo.in_progress||0,color:"#FBBF24"},
                  {label:"Completed",value:wo.completed||0,color:"#34D399"},
                ].map((s,i)=>(
                  <div key={i} className="p-3 rounded-xl bg-base-alt text-center">
                    <div className="text-2xl font-black" style={{color:s.color}}>{s.value}</div>
                    <div className="text-xs text-tertiary mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 rounded-full bg-base-alt overflow-hidden flex">
                {wo.total > 0 && <>
                  <div style={{width:`${(wo.open_count||0)/wo.total*100}%`,background:"#60A5FA"}}/>
                  <div style={{width:`${(wo.in_progress||0)/wo.total*100}%`,background:"#FBBF24"}}/>
                  <div style={{width:`${(wo.completed||0)/wo.total*100}%`,background:"#34D399"}}/>
                </>}
              </div>
            </div>

            {/* Critical Work Orders */}
            {(ops.critical_work_orders||[]).length > 0 && (
              <div className="tb-section">
                <div className="tb-flex-between mb-3">
                  <div className="tb-section-title" style={{marginBottom:0,color:"#F87171"}}>⚠ Critical Work Orders</div>
                  <span className="tb-badge" style={{background:"#F8717118",color:"#F87171",fontSize:"0.5rem"}}>{(ops.critical_work_orders||[]).length} ACTIVE</span>
                </div>
                <div className="space-y-2">
                  {(ops.critical_work_orders||[]).map((wo_item,i)=>(
                    <button key={i} onClick={()=>router.push("/operations/work-orders/"+wo_item.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-base-alt hover:bg-surface border border-red-400/20 transition-colors text-left">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:"#F87171"}}/>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{wo_item.title}</div>
                        <div className="text-xs text-tertiary">{wo_item.site_name||"—"} · {wo_item.technician_name||"Unassigned"}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="tb-badge" style={{background:"#FBBF2418",color:wo_item.status==="in_progress"?"#FBBF24":"#60A5FA",fontSize:"0.45rem"}}>
                          {(wo_item.status||"").replace(/_/g," ")}
                        </span>
                        <div className="text-xs text-tertiary mt-0.5">{fmtDate(wo_item.due_date)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Service Requests */}
            <div className="tb-section">
              <div className="tb-flex-between mb-3">
                <div className="tb-section-title" style={{marginBottom:0}}>Open Service Requests</div>
                <button onClick={()=>router.push("/operations/service-requests")} className="text-xs text-brand">View all →</button>
              </div>
              {(ops.recent_service_requests||[]).length===0 ? (
                <div className="tb-empty" style={{padding:"16px"}}><div className="tb-empty-title">No open service requests</div></div>
              ) : (
                <div className="space-y-2">
                  {(ops.recent_service_requests||[]).map((sr_item,i)=>{
                    const uc = URGENCY_COLORS[sr_item.urgency]||"#94A3B8";
                    return (
                      <button key={i} onClick={()=>router.push("/operations/service-requests/"+sr_item.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-base-alt hover:bg-surface transition-colors text-left">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:uc}}/>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-primary truncate">{sr_item.title}</div>
                          <div className="text-xs text-tertiary">{fmtRelative(sr_item.created_at)}</div>
                        </div>
                        <span className="tb-badge flex-shrink-0" style={{background:uc+"18",color:uc,border:`1px solid ${uc}30`,fontSize:"0.45rem"}}>{sr_item.urgency}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Financial + Assets */}
          <div className="space-y-4">

            {/* Financial Snapshot */}
            <div className="tb-section">
              <div className="tb-section-title">Financial Snapshot</div>
              <div className="space-y-3">
                {[
                  {label:"Total Invoiced",value:fmtEGP(inv.total_value||0),color:"#60A5FA"},
                  {label:"Collected",value:fmtEGP(inv.collected||0),color:"#34D399"},
                  {label:"Outstanding",value:fmtEGP(inv.outstanding||0),color:(inv.outstanding||0)>0?"#FBBF24":"#34D399"},
                  {label:"Overdue Invoices",value:`${inv.overdue_count||0} invoices`,color:(inv.overdue_count||0)>0?"#F87171":"#34D399"},
                ].map((row,i)=>(
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-xs text-tertiary">{row.label}</span>
                    <span className="text-sm font-bold" style={{color:row.color}}>{row.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>router.push("/supply-chain/invoices")} className="tb-btn-secondary w-full mt-3" style={{fontSize:"0.7rem",padding:"6px"}}>
                View All Invoices →
              </button>
            </div>

            {/* Outstanding Invoices */}
            {(fin.outstanding_invoices||[]).length > 0 && (
              <div className="tb-section">
                <div className="tb-section-title">Pending Payment</div>
                <div className="space-y-2">
                  {(fin.outstanding_invoices||[]).map((inv_item,i)=>{
                    const overdue = inv_item.due_date && new Date(inv_item.due_date) < new Date();
                    return (
                      <button key={i} onClick={()=>router.push("/supply-chain/invoices/"+inv_item.id)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-base-alt hover:bg-surface transition-colors text-left">
                        <div>
                          <div className="text-xs font-semibold text-primary">{inv_item.invoice_number}</div>
                          <div className="text-xs text-tertiary">{overdue?"⚠ OVERDUE ":""}Due: {fmtDate(inv_item.due_date)}</div>
                        </div>
                        <div className="text-sm font-black" style={{color:overdue?"#F87171":"#FBBF24"}}>
                          {fmtEGP(inv_item.balance_due||0)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Assets Maintenance Due */}
            {(ops.maintenance_due||[]).length > 0 && (
              <div className="tb-section">
                <div className="tb-section-title" style={{color:"#FBBF24"}}>🔩 Maintenance Due</div>
                <div className="space-y-2 mt-2">
                  {(ops.maintenance_due||[]).map((a,i)=>{
                    const overdue = a.next_maintenance_date && new Date(a.next_maintenance_date) < new Date();
                    return (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-base-alt">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:overdue?"#F87171":"#FBBF24"}}/>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-primary truncate">{a.name}</div>
                          <div className="text-xs text-tertiary">{a.category} · {fmtDate(a.next_maintenance_date)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Project Status */}
            <div className="tb-section">
              <div className="tb-section-title">Projects</div>
              <div className="space-y-2 mt-2">
                {[
                  {label:"Active",value:proj.active||0,color:"#34D399"},
                  {label:"Total Budget",value:fmtEGP(proj.total_budget||0),color:"#A78BFA"},
                  {label:"Avg Progress",value:`${Math.round(proj.avg_completion||0)}%`,color:"#60A5FA"},
                ].map((row,i)=>(
                  <div key={i} className="flex justify-between text-xs py-1.5 border-b border-border">
                    <span className="text-tertiary">{row.label}</span>
                    <span className="font-bold" style={{color:row.color}}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
