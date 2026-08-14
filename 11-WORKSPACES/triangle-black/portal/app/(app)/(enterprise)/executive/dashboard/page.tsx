"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => { if (!d) return "—"; try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtRelative = (d) => { if (!d) return ""; try { const h=Math.floor((Date.now()-new Date(d).getTime())/3600000); if(h<1) return "just now"; if(h<24) return `${h}h ago`; return `${Math.floor(h/24)}d ago`; } catch { return ""; } };

export default function ExecutiveDashboardPage() {
  const router = useRouter();
  const { data: dash, isLoading } = useQuery(["exec-dashboard"], ()=>authFetch("/api/v1/executive/dashboard").then(r=>r.json()), {staleTime:60000,refetchInterval:120000});
  const { data: procDash } = useQuery(["exec-procurement"], ()=>authFetch("/api/v1/procurement/dashboard").then(r=>r.json()), {staleTime:60000});
  const { data: timeDash } = useQuery(["exec-time"], ()=>authFetch("/api/v1/time-entries/summary").then(r=>r.json()), {staleTime:60000});
  const { data: slaDash } = useQuery(["exec-sla"], ()=>authFetch("/api/v1/sla/dashboard").then(r=>r.json()), {staleTime:60000});

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">📊</div>
        <div className="text-secondary tb-shimmer px-8 py-2 rounded">Loading executive dashboard…</div>
      </div>
    </div>
  );

  const ops = dash?.operations||{};
  const fin = dash?.financial||{};
  const alerts = dash?.alerts||{};
  const wo = ops.work_orders||{};
  const sr = ops.service_requests||{};
  const inv = fin.invoices||{};
  const proj = fin.projects||{};
  const totalAlerts = alerts.total_alerts||0;
  const proc = procDash||{};
  const timeData = timeDash||{};
  const sla = slaDash||{};
  const siteSla = sla.site_sla||[];
  const topTechs = (timeData.by_technician||[]).slice(0,5);
  const totalLaborCost = timeData.totals?.total_labor_cost||0;
  const totalLaborHours = timeData.totals?.total_hours||0;
  const poSpend = proc.pos?.total_value||0;
  const pendingApprovals = proc.approvals?.pending||0;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Executive Intelligence</div>
              <h1 className="tb-hero-title">Operations Dashboard</h1>
              <p className="tb-hero-description">Triangle Black Engineering Services — Real-time KPIs</p>
            </div>
            <div className="tb-action-bar">
              {totalAlerts>0 && (
                <div className="tb-badge tb-badge-danger">⚠ {totalAlerts} Alerts</div>
              )}
              <button onClick={()=>router.push("/operations/work-orders")} className="tb-btn tb-btn-secondary tb-btn-sm">All Work Orders →</button>
            </div>
          </div>

          <div className="tb-grid-4">
            {[
              {label:"Open Work Orders",value:wo.open_count||0,sub:`${wo.critical_open||0} critical · ${wo.overdue||0} overdue`,warn:(wo.critical_open||0)>0,icon:"🔧",path:"/operations/work-orders"},
              {label:"Revenue Collected",value:fmtEGP(inv.collected||0),sub:`EGP ${Number(inv.outstanding||0).toLocaleString()} outstanding`,icon:"💰",path:"/supply-chain/invoices"},
              {label:"Active Projects",value:proj.active||0,sub:`EGP ${Number(proj.total_budget||0).toLocaleString()} budget · ${Math.round(proj.avg_completion||0)}% avg`,icon:"🏗️",path:"/projects"},
              {label:"Service Requests",value:sr.open_count||0,sub:`${sr.critical||0} critical · ${sr.high_urgency||0} high`,warn:(sr.critical||0)>0,icon:"🎫",path:"/operations/service-requests"},
            ].map((k,i)=>(
              <button key={i} onClick={()=>router.push(k.path)} className="tb-hero-kpi text-left hover:opacity-80 transition-opacity cursor-pointer">
                <div className="text-2xl mb-1">{k.icon}</div>
                <div className="tb-hero-kpi-value" style={{color:k.warn?"var(--color-warning)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
                <div className="text-xs mt-1 opacity-60">{k.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid gap-4" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>

          <div className="col-span-2 flex flex-col gap-4">
            <div className="tb-section">
              <div className="flex justify-between items-center mb-4">
                <div className="tb-section-title" style={{margin:0}}>Work Order Status</div>
                <button onClick={()=>router.push("/operations/work-orders")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">View all →</button>
              </div>
              <div className="tb-grid-4">
                {[{label:"Total",value:wo.total||0},{label:"Open",value:wo.open_count||0,warn:true},{label:"In Progress",value:wo.in_progress||0},{label:"Completed",value:wo.completed||0,good:true}].map((s,i)=>(
                  <div key={i} className="p-3 rounded-xl bg-surface-alt text-center">
                    <div className="text-2xl font-black" style={{color:s.good?"var(--color-success)":s.warn?(wo.open_count||0)>0?"var(--color-info)":"var(--color-text-1)":"var(--color-text-1)"}}>{s.value}</div>
                    <div className="text-xs text-tertiary mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              {wo.total>0 && (
                <div className="tb-progress mt-3">
                  <div className="tb-progress-bar" style={{width:`${(wo.open_count||0)/wo.total*100}%`,background:"var(--color-info)"}} />
                </div>
              )}
            </div>

            {(ops.critical_work_orders||[]).length>0 && (
              <div className="tb-section" style={{borderColor:"var(--color-danger-border)"}}>
                <div className="flex justify-between items-center mb-3">
                  <div className="tb-section-title text-danger" style={{margin:0}}>⚠ Critical Work Orders</div>
                  <span className="tb-badge tb-badge-danger" style={{fontSize:"9px"}}>{(ops.critical_work_orders||[]).length} ACTIVE</span>
                </div>
                <div className="flex flex-col gap-2">
                  {(ops.critical_work_orders||[]).map((wo_item,i)=>(
                    <button key={i} onClick={()=>router.push("/operations/work-orders/"+wo_item.id)}
                      className="tb-action-item">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:"var(--color-danger)"}} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{wo_item.title}</div>
                        <div className="text-xs text-tertiary">{wo_item.site_name||"—"} · {wo_item.technician_name||"Unassigned"}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="tb-badge tb-badge-warning" style={{fontSize:"9px"}}>{(wo_item.status||"").replace(/_/g," ")}</span>
                        <div className="text-xs text-tertiary mt-0.5">{fmtDate(wo_item.due_date)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="tb-section">
              <div className="flex justify-between items-center mb-3">
                <div className="tb-section-title" style={{margin:0}}>Open Service Requests</div>
                <button onClick={()=>router.push("/operations/service-requests")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">View all →</button>
              </div>
              {(ops.recent_service_requests||[]).length===0 ? (
                <div className="tb-empty" style={{padding:"16px"}}><div className="tb-empty-title">No open service requests</div></div>
              ) : (
                <div className="flex flex-col gap-2">
                  {(ops.recent_service_requests||[]).map((sr_item,i)=>(
                    <button key={i} onClick={()=>router.push("/operations/service-requests/"+sr_item.id)} className="tb-action-item">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:sr_item.urgency==="critical"?"var(--color-danger)":sr_item.urgency==="high"?"var(--color-warning)":"var(--color-info)"}} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-primary truncate">{sr_item.title}</div>
                        <div className="text-xs text-tertiary">{fmtRelative(sr_item.created_at)}</div>
                      </div>
                      <span className={`tb-badge flex-shrink-0 ${sr_item.urgency==="critical"?"tb-badge-danger":sr_item.urgency==="high"?"tb-badge-warning":"tb-badge-info"}`} style={{fontSize:"9px"}}>{sr_item.urgency}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="tb-section-title">Financial Snapshot</div>
              <div className="flex flex-col gap-0">
                {[{label:"Total Invoiced",value:fmtEGP(inv.total_value||0)},{label:"Collected",value:fmtEGP(inv.collected||0),good:true},{label:"Outstanding",value:fmtEGP(inv.outstanding||0),warn:(inv.outstanding||0)>0},{label:"Overdue Invoices",value:`${inv.overdue_count||0} invoices`,danger:(inv.overdue_count||0)>0}].map((row,i)=>(
                  <div key={i} className="tb-detail-row">
                    <span className="tb-detail-key">{row.label}</span>
                    <span className="tb-detail-value font-bold" style={{color:row.danger?"var(--color-danger)":row.warn?"var(--color-warning)":row.good?"var(--color-success)":"var(--color-text-1)"}}>{row.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>router.push("/supply-chain/invoices")} className="tb-btn tb-btn-ghost w-full justify-center mt-3 tb-btn-sm">View All Invoices →</button>
            </div>

            {(fin.outstanding_invoices||[]).length>0 && (
              <div className="tb-section">
                <div className="tb-section-title">Pending Payment</div>
                <div className="flex flex-col gap-2">
                  {(fin.outstanding_invoices||[]).map((inv_item,i)=>{
                    const overdue = inv_item.due_date&&new Date(inv_item.due_date)<new Date();
                    return (
                      <button key={i} onClick={()=>router.push("/supply-chain/invoices/"+inv_item.id)} className="tb-action-item">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-primary">{inv_item.invoice_number}</div>
                          <div className="text-xs text-tertiary">{overdue?"⚠ OVERDUE ":""}Due: {fmtDate(inv_item.due_date)}</div>
                        </div>
                        <div className="text-sm font-black flex-shrink-0" style={{color:overdue?"var(--color-danger)":"var(--color-warning)"}}>{fmtEGP(inv_item.balance_due||0)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="tb-section">
              <div className="tb-section-title">Projects</div>
              {[{label:"Active",value:proj.active||0},{label:"Total Budget",value:fmtEGP(proj.total_budget||0)},{label:"Avg Progress",value:`${Math.round(proj.avg_completion||0)}%`}].map((row,i)=>(
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{row.label}</span>
                  <span className="tb-detail-value">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="tb-grid-3 mt-4">
          <div className="tb-section">
            <div className="flex justify-between items-center mb-3">
              <div className="tb-section-title" style={{margin:0}}>SLA by Site</div>
              <button onClick={()=>router.push("/operations/sla")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">SLA Dashboard →</button>
            </div>
            <div className="flex flex-col gap-2">
              {siteSla.map((site,i)=>{
                const gc = site.sla_grade==="A"?"var(--color-success)":site.sla_grade==="B"?"var(--color-info)":site.sla_grade==="C"?"var(--color-warning)":"var(--color-danger)";
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-surface-alt rounded-lg">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0" style={{background:`${gc}20`,color:gc}}>{site.sla_grade}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-primary truncate">{site.site_name}</div>
                      <div className="text-xs text-tertiary">{site.resolved}/{site.total_requests} resolved</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-black" style={{color:gc}}>{site.sla_score}</div>
                      <div className="text-xs text-tertiary">score</div>
                    </div>
                  </div>
                );
              })}
              {siteSla.length===0&&<div className="text-xs text-tertiary text-center py-4">No SLA data available</div>}
            </div>
            <div className="mt-3 pt-3 border-t border-default flex justify-between text-xs">
              <span className="text-tertiary">Overall</span>
              <span className="font-bold text-secondary">{sla.overall?.total_requests||0} requests · {sla.breach_count||0} breaches</span>
            </div>
          </div>

          <div className="tb-section">
            <div className="flex justify-between items-center mb-3">
              <div className="tb-section-title" style={{margin:0}}>Labor Intelligence</div>
              <button onClick={()=>router.push("/operations/time-tracking")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">Time Tracking →</button>
            </div>
            <div className="tb-grid-2 mb-4">
              <div className="p-3 bg-surface-alt rounded-lg text-center">
                <div className="text-xl font-black text-success">{Math.round(totalLaborHours)}</div>
                <div className="text-xs text-tertiary">Hours Logged</div>
              </div>
              <div className="p-3 bg-surface-alt rounded-lg text-center">
                <div className="text-xl font-black text-brand" style={{fontSize:"14px"}}>{fmtEGP(totalLaborCost)}</div>
                <div className="text-xs text-tertiary">Labor Cost</div>
              </div>
            </div>
            <div className="text-xs text-tertiary mb-2 font-semibold">Top Technicians</div>
            <div className="flex flex-col gap-1.5">
              {topTechs.map((tech,i)=>(
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-black flex-shrink-0 bg-surface-alt text-tertiary">{i+1}</div>
                  <div className="flex-1 min-w-0"><div className="text-xs text-primary truncate">{tech.name}</div></div>
                  <div className="text-xs font-bold text-secondary flex-shrink-0">{tech.total_hours}h</div>
                  <div className="text-xs font-bold text-success flex-shrink-0 w-20 text-right">{fmtEGP(tech.total_cost)}</div>
                </div>
              ))}
              {topTechs.length===0&&<div className="text-xs text-tertiary text-center py-3">No time entries logged</div>}
            </div>
          </div>

          <div className="tb-section">
            <div className="flex justify-between items-center mb-3">
              <div className="tb-section-title" style={{margin:0}}>Procurement</div>
              <button onClick={()=>router.push("/supply-chain/procurement")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">P2P Hub →</button>
            </div>
            <div className="flex flex-col gap-0">
              {[{label:"Active SOWs",value:proc.sow?.total||0,sub:`${proc.sow?.pending||0} pending`},{label:"Active RFQs",value:proc.rfqs?.total||0,sub:`${proc.rfqs?.with_quotes||0} with quotes`},{label:"Purchase Orders",value:proc.pos?.total||0,sub:fmtEGP(poSpend)+" value"},{label:"Goods Received",value:proc.grns?.total||0,sub:"deliveries"},{label:"Approved Vendors",value:proc.vendors?.approved||0,sub:`of ${proc.vendors?.total||0} total`}].map((row,i)=>(
                <div key={i} className="tb-detail-row">
                  <div><span className="tb-detail-key">{row.label}</span><div className="text-xs text-tertiary">{row.sub}</div></div>
                  <span className="text-xl font-black text-primary">{row.value}</span>
                </div>
              ))}
            </div>
            {pendingApprovals>0 && (
              <button onClick={()=>router.push("/supply-chain/approvals-center")} className="tb-btn tb-btn-secondary w-full justify-center mt-3 tb-btn-sm">
                ✍ {pendingApprovals} Pending Approvals
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
