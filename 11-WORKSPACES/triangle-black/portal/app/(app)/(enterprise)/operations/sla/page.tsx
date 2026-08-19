"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

const fmtHours = (h: any) => { const n=Number(h||0); if(n<1) return `${Math.round(n*60)}m`; return `${n.toFixed(1)}h`; };
const fmtDate = (d: any) => { if (!d) return "—"; try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };
const GRADE_COLOR = {A:"var(--color-success)",B:"var(--color-info)",C:"var(--color-warning)",D:"var(--color-danger)"};
const URGENCY_COLOR = {critical:"var(--color-danger)",high:"var(--color-warning)",medium:"var(--color-warning)",low:"var(--color-success)"};

export default function SLADashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: sla, isLoading } = useQuery(["sla-dashboard"],()=>authFetch("/api/v1/sla/dashboard").then(r => r.json()),{staleTime:30000,refetchInterval:60000});
  const { data: breaches=[] } = useQuery(["sla-breaches"],()=>authFetch("/api/v1/sla/breaches").then(r => r.json()),{staleTime:30000});

  const overall = sla?.overall||{};
  const siteSLA = sla?.site_sla||[];
  const woSLA = sla?.work_order_sla||[];
  const activeBreach = sla?.active_breaches||[];
  const breachCount = sla?.breach_count||0;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Operations Intelligence</div>
              <h1 className="tb-hero-title">SLA Dashboard</h1>
              <p className="tb-hero-description">Response time KPIs · Breach alerts · Compliance scores</p>
            </div>
            <div className="tb-action-bar">
              {breachCount>0 && <div className="tb-badge tb-badge-danger">🚨 {breachCount} Active Breaches</div>}
              <button onClick={()=>router.push("/operations/service-requests")} className="tb-btn tb-btn-secondary tb-btn-sm">Service Requests →</button>
            </div>
          </div>
          <div className="tb-grid-4">
            {[{label:"Total Requests",value:overall.total_requests||0},{label:"Resolved",value:overall.resolved||0,good:true},{label:"Active Breaches",value:breachCount,danger:breachCount>0},{label:"Avg Resolution",value:overall.avg_resolution_hours?`${Number(overall.avg_resolution_hours).toFixed(1)}h`:"—"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.danger?"var(--color-danger)":k.good?"var(--color-success)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-tabs mb-4">
          {[{k:"overview",l:"📊 Overview"},{k:"sites",l:"📍 By Site"},{k:"breaches",l:"🚨 Breaches"},{k:"targets",l:"⏱ SLA Targets"}].map((tab: any) =>(
            <button key={tab.k} onClick={()=>setActiveTab(tab.k)} className={`tb-tab ${activeTab===tab.k?"active":""}`}>{tab.l}</button>
          ))}
        </div>

        {activeTab==="overview" && (
          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="tb-section-title">SLA Compliance by Site</div>
              {isLoading ? <div className="flex flex-col gap-2">{[1,2,3,4].map((i: any) =><div key={i} className="tb-shimmer tb-shimmer-block" style={{height:80}} />)}</div> : (
                <div className="tb-grid-2 mt-3">
                  {siteSLA.map((site: any, i: any) =>{
                    const score = site.sla_score||0;
                    const grade = site.sla_grade||"D";
                    const gc = (GRADE_COLOR as Record<string, any>)[grade]||"var(--color-text-3)";
                    return (
                      <div key={i} className="p-4 rounded-2xl border border-default bg-surface-alt">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm font-bold text-primary">{site.site_name||"Unknown Site"}</div>
                            <div className="text-xs text-tertiary">{site.total_requests||0} total · {site.open_count||0} open</div>
                          </div>
                          <div className="text-center flex-shrink-0">
                            <div className="text-3xl font-black" style={{color:gc}}>{grade}</div>
                            <div className="text-xs text-tertiary">{score}/100</div>
                          </div>
                        </div>
                        <div className="tb-progress mb-2">
                          <div className="tb-progress-bar" style={{width:`${score}%`,background:gc}} />
                        </div>
                        <div className="tb-grid-3 text-center">
                          {[{label:"Critical",value:site.critical||0,color:"var(--color-danger)"},{label:"Resolved",value:site.resolved||0,color:"var(--color-success)"},{label:"Rate",value:`${site.resolution_rate_pct||0}%`,color:"var(--color-info)"}].map((stat: any, si: any) =>(
                            <div key={si} className="bg-base rounded-lg p-2">
                              <div className="text-sm font-black" style={{color:stat.color}}>{stat.value}</div>
                              <div className="text-xs text-tertiary">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {woSLA.length>0 && (
              <div className="tb-section">
                <div className="tb-section-title">Work Order Response SLA (Last 30 Days)</div>
                <div className="tb-table-wrap mt-3">
                  <table className="tb-table">
                    <thead><tr><th>Priority</th><th style={{textAlign:"center"}}>Total</th><th style={{textAlign:"center"}}>Started</th><th style={{textAlign:"center"}}>Avg Response</th><th style={{textAlign:"center"}}>Breached</th></tr></thead>
                    <tbody>
                      {woSLA.map((row: any, i: any) =>{
                        const target = (sla?.sla_targets||{critical:8,high:24,medium:48,low:72})[row.priority]||24;
                        const isBreached = Number(row.avg_response_hours||0)>target;
                        return (
                          <tr key={i}>
                            <td><StatusBadge status={row.priority||"medium"} /></td>
                            <td className="text-center text-sm text-primary">{row.total||0}</td>
                            <td className="text-center text-sm text-secondary">{row.started||0}</td>
                            <td className="text-center text-sm font-bold" style={{color:isBreached?"var(--color-danger)":"var(--color-success)"}}>{row.avg_response_hours?fmtHours(row.avg_response_hours):"—"}</td>
                            <td className="text-center">
                              <span className="text-sm font-bold" style={{color:Number(row.breached_response||0)>0?"var(--color-danger)":"var(--color-success)"}}>
                                {row.breached_response||0} {Number(row.breached_response||0)>0?"⚠️":"✅"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab==="sites" && (
          <div className="flex flex-col gap-4">
            {siteSLA.map((site: any, i: any) =>(
              <div key={i} className="tb-section">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="tb-section-title" style={{margin:0}}>{site.site_name||"—"}</div>
                    <div className="text-xs text-tertiary">{site.total_requests||0} requests total</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black" style={{color:GRADE_COLOR[site.sla_grade||"D"]}}>{site.sla_grade||"D"}</div>
                    <div className="text-xs text-tertiary">SLA Score: {site.sla_score||0}/100</div>
                  </div>
                </div>
                <div className="tb-grid-4">
                  {[{label:"Open",value:site.open_count||0,color:"var(--color-info)"},{label:"In Progress",value:site.in_progress||0,color:"var(--color-warning)"},{label:"Resolved",value:site.resolved||0,color:"var(--color-success)"},{label:"Avg Resolution",value:site.avg_resolution_hours?`${Number(site.avg_resolution_hours).toFixed(1)}h`:"—"}].map((stat: any, si: any) =>(
                    <div key={si} className="p-3 bg-surface-alt rounded-xl text-center">
                      <div className="text-xl font-black" style={{color:stat.color||"var(--color-text-1)"}}>{stat.value}</div>
                      <div className="text-xs text-tertiary">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab==="breaches" && (
          <div className="tb-section">
            <div className="font-bold text-danger mb-4">🚨 Active SLA Breaches ({activeBreach.length})</div>
            {activeBreach.length===0 ? (
              <div className="tb-empty"><div className="tb-empty-icon">✅</div><div className="tb-empty-title">No active breaches</div><div className="tb-empty-desc">All service requests are within SLA</div></div>
            ) : (
              <div className="flex flex-col gap-2">
                {activeBreach.map((item: any, i: number) =>(
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-danger/20 bg-danger/5">
                    <span className={`tb-badge flex-shrink-0 ${item.urgency==="critical"?"tb-badge-danger":item.urgency==="high"?"tb-badge-warning":"tb-badge-neutral"}`}>{item.urgency}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-primary truncate">{item.title}</div>
                      <div className="text-xs text-tertiary">{item.site_name||"—"} · Open {fmtHours(item.hours_open)} · Target: {fmtHours(item.sla_target_hours)}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-black text-danger">+{fmtHours(item.hours_overdue||0)} overdue</div>
                      <div className="text-xs text-tertiary">{fmtDate(item.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab==="targets" && (
          <div className="tb-section">
            <div className="tb-section-title">SLA Targets — Triangle Black Standard</div>
            <div className="flex flex-col gap-3 mt-4">
              {[{priority:"critical",response:2,resolution:8,color:"var(--color-danger)",desc:"Safety / Guest impact"},{priority:"high",response:4,resolution:24,color:"var(--color-warning)",desc:"Operations affected"},{priority:"medium",response:8,resolution:48,color:"var(--color-warning)",desc:"Non-critical issue"},{priority:"low",response:24,resolution:72,color:"var(--color-success)",desc:"Planned / Cosmetic"}].map((tier: any, i: any) =>(
                <div key={i} className="flex items-center gap-4 p-4 bg-surface-alt rounded-xl border border-default">
                  <span className="tb-badge flex-shrink-0" style={{background:`${tier.color}18`,color:tier.color,minWidth:"70px",textAlign:"center",fontSize:"9px"}}>{tier.priority.toUpperCase()}</span>
                  <div className="flex-1 text-sm text-secondary">{tier.desc}</div>
                  <div className="flex gap-6 flex-shrink-0 text-right">
                    <div><div className="text-sm font-black text-primary">{tier.response}h</div><div className="text-xs text-tertiary">Response</div></div>
                    <div><div className="text-sm font-black text-primary">{tier.resolution}h</div><div className="text-xs text-tertiary">Resolution</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
