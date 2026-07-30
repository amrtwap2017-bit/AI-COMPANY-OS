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

const PRIORITY_COLORS = {critical:"#A84A3D",high:"#B07A2A",medium:"#B07A2A",low:"#547C4D"};
const STATUS_COLORS = {open:"#5B7C8C",in_progress:"#B07A2A",completed:"#547C4D",cancelled:"#6D5F53"};
const URGENCY_COLORS = {critical:"#A84A3D",high:"#B07A2A",medium:"#B07A2A",low:"#547C4D"};

export default function ExecutiveDashboardPage() {
  const router = useRouter();
  const { data: dash, isLoading } = useQuery(
    ["exec-dashboard"],
    () => authFetch("/api/v1/executive/dashboard").then(r=>r.json()),
    { staleTime: 60000, refetchInterval: 120000 }
  );

  const { data: procDash } = useQuery(
    ["exec-procurement"],
    () => authFetch("/api/v1/procurement/dashboard").then(r=>r.json()),
    { staleTime: 60000 }
  );
  const { data: timeDash } = useQuery(
    ["exec-time"],
    () => authFetch("/api/v1/time-entries/summary").then(r=>r.json()),
    { staleTime: 60000 }
  );
  const { data: slaDash } = useQuery(
    ["exec-sla"],
    () => authFetch("/api/v1/sla/dashboard").then(r=>r.json()),
    { staleTime: 60000 }
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

  // Sprint 276: Intelligence data
  const proc = procDash || {};
  const timeData = timeDash || {};
  const sla = slaDash || {};
  const siteSla = sla.site_sla || [];
  const topTechs = (timeData.by_technician || []).slice(0, 5);
  const totalLaborCost = timeData.totals?.total_labor_cost || 0;
  const totalLaborHours = timeData.totals?.total_hours || 0;
  const poSpend = proc.pos?.total_value || 0;
  const pendingApprovals = proc.approvals?.pending || 0;

  return (
    <div className="min-h-screen bg-base">
      {/* HERO */}
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="tb-flex-between mb-4">
            <div>
              <div className="text-label-upper text-amber-400 mb-1">Executive Intelligence</div>
              <h1 className="tb-hero-title">Operations Dashboard</h1>
              <p className="tb-hero-description">Triangle Black Engineering Services — Real-time KPIs</p>
            </div>
            <div className="flex gap-2">
              {totalAlerts > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{background:"#A84A3D18",border:"1px solid #A84A3D40"}}>
                  <span style={{color:"#A84A3D",fontSize:"1.25rem"}}>⚠</span>
                  <span className="text-sm font-bold" style={{color:"#A84A3D"}}>{totalAlerts} Alerts</span>
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
                color: (wo.critical_open||0) > 0 ? "#A84A3D" : "#5B7C8C",
                icon:"🔧",
                path:"/operations/work-orders"
              },
              {
                label:"Revenue Collected",
                value: fmtEGP(inv.collected||0),
                sub: `EGP ${Number(inv.outstanding||0).toLocaleString()} outstanding`,
                color:"#547C4D",
                icon:"💰",
                path:"/supply-chain/invoices"
              },
              {
                label:"Active Projects",
                value: proj.active || 0,
                sub: `EGP ${Number(proj.total_budget||0).toLocaleString()} budget · ${Math.round(proj.avg_completion||0)}% avg`,
                color:"#8D7443",
                icon:"🏗️",
                path:"/projects"
              },
              {
                label:"Service Requests",
                value: sr.open_count || 0,
                sub: `${sr.critical||0} critical · ${sr.high_urgency||0} high`,
                color: (sr.critical||0) > 0 ? "#B07A2A" : "#B07A2A",
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
                  {label:"Total",value:wo.total||0,color:"#221D1A"},
                  {label:"Open",value:wo.open_count||0,color:"#5B7C8C"},
                  {label:"In Progress",value:wo.in_progress||0,color:"#B07A2A"},
                  {label:"Completed",value:wo.completed||0,color:"#547C4D"},
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
                  <div style={{width:`${(wo.open_count||0)/wo.total*100}%`,background:"#5B7C8C"}}/>
                  <div style={{width:`${(wo.in_progress||0)/wo.total*100}%`,background:"#B07A2A"}}/>
                  <div style={{width:`${(wo.completed||0)/wo.total*100}%`,background:"#547C4D"}}/>
                </>}
              </div>
            </div>

            {/* Critical Work Orders */}
            {(ops.critical_work_orders||[]).length > 0 && (
              <div className="tb-section">
                <div className="tb-flex-between mb-3">
                  <div className="tb-section-title" style={{marginBottom:0,color:"#A84A3D"}}>⚠ Critical Work Orders</div>
                  <span className="tb-badge" style={{background:"#A84A3D18",color:"#A84A3D",fontSize:"0.5rem"}}>{(ops.critical_work_orders||[]).length} ACTIVE</span>
                </div>
                <div className="space-y-2">
                  {(ops.critical_work_orders||[]).map((wo_item,i)=>(
                    <button key={i} onClick={()=>router.push("/operations/work-orders/"+wo_item.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-base-alt hover:bg-surface border border-red-400/20 transition-colors text-left">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:"#A84A3D"}}/>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{wo_item.title}</div>
                        <div className="text-xs text-tertiary">{wo_item.site_name||"—"} · {wo_item.technician_name||"Unassigned"}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="tb-badge" style={{background:"#B07A2A18",color:wo_item.status==="in_progress"?"#B07A2A":"#5B7C8C",fontSize:"0.45rem"}}>
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
                    const uc = URGENCY_COLORS[sr_item.urgency]||"#6D5F53";
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
                  {label:"Total Invoiced",value:fmtEGP(inv.total_value||0),color:"#5B7C8C"},
                  {label:"Collected",value:fmtEGP(inv.collected||0),color:"#547C4D"},
                  {label:"Outstanding",value:fmtEGP(inv.outstanding||0),color:(inv.outstanding||0)>0?"#B07A2A":"#547C4D"},
                  {label:"Overdue Invoices",value:`${inv.overdue_count||0} invoices`,color:(inv.overdue_count||0)>0?"#A84A3D":"#547C4D"},
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
                        <div className="text-sm font-black" style={{color:overdue?"#A84A3D":"#B07A2A"}}>
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
                <div className="tb-section-title" style={{color:"#B07A2A"}}>🔩 Maintenance Due</div>
                <div className="space-y-2 mt-2">
                  {(ops.maintenance_due||[]).map((a,i)=>{
                    const overdue = a.next_maintenance_date && new Date(a.next_maintenance_date) < new Date();
                    return (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-base-alt">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:overdue?"#A84A3D":"#B07A2A"}}/>
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
                  {label:"Active",value:proj.active||0,color:"#547C4D"},
                  {label:"Total Budget",value:fmtEGP(proj.total_budget||0),color:"#8D7443"},
                  {label:"Avg Progress",value:`${Math.round(proj.avg_completion||0)}%`,color:"#5B7C8C"},
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

        {/* ── SPRINT 276: INTELLIGENCE ROW ────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">

          {/* SLA Site Grades */}
          <div className="tb-section">
            <div className="tb-flex-between mb-3">
              <div className="tb-section-title" style={{marginBottom:0}}>SLA by Site</div>
              <button onClick={()=>router.push("/operations/sla")} className="text-xs text-brand">SLA Dashboard →</button>
            </div>
            <div className="space-y-2">
              {siteSla.map((site,i) => {
                const gc = site.sla_grade==="A"?"#547C4D":site.sla_grade==="B"?"#5B7C8C":site.sla_grade==="C"?"#B07A2A":"#A84A3D";
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-base-alt">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0" style={{background:gc+"20",color:gc}}>
                      {site.sla_grade}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-primary truncate">{site.site_name}</div>
                      <div className="text-xs text-tertiary">{site.resolved}/{site.total_requests} resolved · {site.avg_resolution_hours ? Math.round(site.avg_resolution_hours)+"h avg" : "—"}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-black" style={{color:gc}}>{site.sla_score}</div>
                      <div className="text-xs text-tertiary">score</div>
                    </div>
                  </div>
                );
              })}
              {siteSla.length === 0 && (
                <div className="text-xs text-tertiary text-center py-4">No SLA data available</div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs">
              <span className="text-tertiary">Overall</span>
              <span className="font-bold text-secondary">{sla.overall?.total_requests||0} requests · {sla.overall?.resolved||0} resolved · {sla.breach_count||0} breaches</span>
            </div>
          </div>

          {/* Labor Intelligence */}
          <div className="tb-section">
            <div className="tb-flex-between mb-3">
              <div className="tb-section-title" style={{marginBottom:0}}>Labor Intelligence</div>
              <button onClick={()=>router.push("/operations/time-tracking")} className="text-xs text-brand">Time Tracking →</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-base-alt text-center">
                <div className="text-lg font-black text-emerald-400">{Math.round(totalLaborHours)}</div>
                <div className="text-xs text-tertiary">Hours Logged</div>
              </div>
              <div className="p-3 rounded-xl bg-base-alt text-center">
                <div className="text-lg font-black text-amber-400">{fmtEGP(totalLaborCost)}</div>
                <div className="text-xs text-tertiary">Labor Cost</div>
              </div>
            </div>
            <div className="text-xs text-tertiary mb-2 font-semibold">Top Technicians</div>
            <div className="space-y-1.5">
              {topTechs.map((tech,i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-black flex-shrink-0" style={{background:"rgba(255,255,255,0.05)",color:"#6D5F53"}}>
                    {i+1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-primary truncate">{tech.name}</div>
                  </div>
                  <div className="text-xs font-bold text-secondary flex-shrink-0">{tech.total_hours}h</div>
                  <div className="text-xs font-bold text-emerald-400 flex-shrink-0 w-20 text-right">{fmtEGP(tech.total_cost)}</div>
                </div>
              ))}
              {topTechs.length === 0 && (
                <div className="text-xs text-tertiary text-center py-3">No time entries logged</div>
              )}
            </div>
          </div>

          {/* Procurement Intelligence */}
          <div className="tb-section">
            <div className="tb-flex-between mb-3">
              <div className="tb-section-title" style={{marginBottom:0}}>Procurement</div>
              <button onClick={()=>router.push("/supply-chain/procurement")} className="text-xs text-brand">P2P Hub →</button>
            </div>
            <div className="space-y-3">
              {[
                {label:"Active SOWs",value:proc.sow?.total||0,sub:`${proc.sow?.pending||0} pending approval`,color:"#5B7C8C"},
                {label:"Active RFQs",value:proc.rfqs?.total||0,sub:`${proc.rfqs?.with_quotes||0} with vendor quotes`,color:"#B07A2A"},
                {label:"Purchase Orders",value:proc.pos?.total||0,sub:fmtEGP(poSpend)+" total value",color:"#8D7443"},
                {label:"Goods Received",value:proc.grns?.total||0,sub:"deliveries accepted",color:"#547C4D"},
                {label:"Approved Vendors",value:proc.vendors?.approved||0,sub:`of ${proc.vendors?.total||0} total vendors`,color:"#547C4D"},
              ].map((row,i)=>(
                <div key={i} className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <span className="text-xs text-tertiary">{row.label}</span>
                    <div className="text-xs opacity-50" style={{color:row.color}}>{row.sub}</div>
                  </div>
                  <span className="text-lg font-black" style={{color:row.color}}>{row.value}</span>
                </div>
              ))}
            </div>
            {pendingApprovals > 0 && (
              <button onClick={()=>router.push("/supply-chain/approvals-center")}
                className="w-full mt-3 flex items-center justify-center gap-2 p-2 rounded-xl transition-colors"
                style={{background:"#B07A2A10",border:"1px solid #B07A2A30"}}>
                <span style={{color:"#B07A2A",fontSize:"0.8rem"}}>✍</span>
                <span className="text-xs font-bold" style={{color:"#B07A2A"}}>{pendingApprovals} Pending Approvals</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
