"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtHours = (h) => {
  const n = Number(h||0);
  if (n < 1) return `${Math.round(n*60)}m`;
  return `${n.toFixed(1)}h`;
};
const fmtDate = (d) => {
  if (!d) return "—";
  try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); }
  catch { return "—"; }
};
const URGENCY_COLORS = {critical:"#F87171",high:"#FB923C",medium:"#FBBF24",low:"#34D399"};
const GRADE_COLORS = {A:"#34D399",B:"#60A5FA",C:"#FBBF24",D:"#F87171"};
const GRADE_BG = {A:"#0D2A1E",B:"#0D1A2A",C:"#2A1E0D",D:"#2A0D0D"};

export default function SLADashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: sla, isLoading } = useQuery(
    ["sla-dashboard"],
    () => authFetch("/api/v1/sla/dashboard").then(r=>r.json()),
    { staleTime: 30000, refetchInterval: 60000 }
  );

  const { data: breaches = [] } = useQuery(
    ["sla-breaches"],
    () => authFetch("/api/v1/sla/breaches").then(r=>r.json()),
    { staleTime: 30000 }
  );

  const overall = sla?.overall || {};
  const siteSLA = sla?.site_sla || [];
  const woSLA = sla?.work_order_sla || [];
  const activeBreach = sla?.active_breaches || [];
  const slaTargets = sla?.sla_targets || {};
  const breachCount = sla?.breach_count || 0;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A 0%,#1A0D0D 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between mb-4">
            <div>
              <div className="text-label-upper text-red-400 mb-1">Operations Intelligence</div>
              <h1 className="tb-hero-title">SLA Dashboard</h1>
              <p className="tb-hero-description">Response time KPIs · Breach alerts · Compliance scores</p>
            </div>
            <div className="flex gap-2">
              {breachCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{background:"#F8717118",border:"1px solid #F8717140"}}>
                  <span style={{color:"#F87171",fontSize:"1.2rem"}}>🚨</span>
                  <span className="text-sm font-black" style={{color:"#F87171"}}>{breachCount} Active Breaches</span>
                </div>
              )}
              <button onClick={()=>router.push("/operations/service-requests")} className="tb-btn-secondary" style={{fontSize:"0.75rem"}}>
                Service Requests →
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {label:"Total Requests",value:overall.total_requests||0,color:"#F1F5F9"},
              {label:"Resolved",value:overall.resolved||0,color:"#34D399"},
              {label:"Active Breaches",value:breachCount,color:breachCount>0?"#F87171":"#34D399"},
              {label:"Avg Resolution",value:overall.avg_resolution_hours?`${Number(overall.avg_resolution_hours).toFixed(1)}h`:"—",color:"#60A5FA"},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="flex gap-2 mb-4">
          {["overview","sites","breaches","targets"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} className={"tb-pill "+(activeTab===tab?"tb-pill--active":"")}>
              {tab==="overview"?"📊 Overview":tab==="sites"?"📍 By Site":tab==="breaches"?"🚨 Breaches":"⏱ SLA Targets"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Site SLA Scores */}
            <div className="tb-section">
              <div className="tb-section-title">SLA Compliance by Site</div>
              {isLoading ? <div className="space-y-2">{[1,2,3,4].map(i=><div key={i} className="h-20 bg-base-alt rounded-xl animate-pulse"/>)}</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {siteSLA.map((site,i)=>{
                    const score = site.sla_score || 0;
                    const grade = site.sla_grade || "D";
                    const gc = GRADE_COLORS[grade]||"#94A3B8";
                    return (
                      <div key={i} className="p-4 rounded-2xl border border-border"
                           style={{background:GRADE_BG[grade]||"#1E293B"}}>
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
                        <div className="h-2 rounded-full bg-base-alt overflow-hidden mb-2">
                          <div className="h-full rounded-full transition-all" style={{width:`${score}%`,background:gc}}/>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {[
                            {label:"Critical",value:site.critical||0,color:"#F87171"},
                            {label:"Resolved",value:site.resolved||0,color:"#34D399"},
                            {label:"Rate",value:`${site.resolution_rate_pct||0}%`,color:"#60A5FA"},
                          ].map((stat,si)=>(
                            <div key={si} className="bg-base-alt rounded-xl p-2">
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

            {/* WO Response SLA */}
            <div className="tb-section">
              <div className="tb-section-title">Work Order Response SLA (Last 30 Days)</div>
              {woSLA.length === 0 ? <div className="tb-empty"><div className="tb-empty-icon">📋</div><div className="tb-empty-title">No data</div></div> : (
                <div className="tb-table mt-3" style={{borderRadius:12,overflow:"hidden"}}>
                  <div className="tb-table-head" style={{gridTemplateColumns:"100px 80px 80px 100px 120px"}}>
                    {["Priority","Total","Started","Avg Response","Breached"].map((h,i)=>(
                      <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                    ))}
                  </div>
                  {woSLA.map((row,i)=>{
                    const pc = URGENCY_COLORS[row.priority]||"#94A3B8";
                    const target = SLA_RESPONSE[row.priority]||24;
                    const isBreached = Number(row.avg_response_hours||0) > target;
                    return (
                      <div key={i} className="tb-table-row" style={{gridTemplateColumns:"100px 80px 80px 100px 120px"}}>
                        <span className="tb-badge" style={{background:pc+"18",color:pc}}>{row.priority}</span>
                        <div className="text-center text-sm text-primary">{row.total||0}</div>
                        <div className="text-center text-sm text-secondary">{row.started||0}</div>
                        <div className="text-center text-sm" style={{color:isBreached?"#F87171":"#34D399"}}>
                          {row.avg_response_hours ? fmtHours(row.avg_response_hours) : "—"}
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-bold" style={{color:Number(row.breached_response||0)>0?"#F87171":"#34D399"}}>
                            {row.breached_response||0} {Number(row.breached_response||0)>0?"⚠️":"✅"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "sites" && (
          <div className="space-y-4">
            {siteSLA.map((site,i)=>(
              <div key={i} className="tb-section">
                <div className="tb-flex-between mb-3">
                  <div>
                    <div className="tb-section-title" style={{marginBottom:0}}>{site.site_name||"—"}</div>
                    <div className="text-xs text-tertiary">{site.total_requests||0} requests total</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black" style={{color:GRADE_COLORS[site.sla_grade||"D"]}}>{site.sla_grade||"D"}</div>
                    <div className="text-xs text-tertiary">SLA Score: {site.sla_score||0}/100</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {label:"Open",value:site.open_count||0,color:"#60A5FA"},
                    {label:"In Progress",value:site.in_progress||0,color:"#FBBF24"},
                    {label:"Resolved",value:site.resolved||0,color:"#34D399"},
                    {label:"Avg Resolution",value:site.avg_resolution_hours?`${Number(site.avg_resolution_hours).toFixed(1)}h`:"—",color:"#A78BFA"},
                  ].map((stat,si)=>(
                    <div key={si} className="p-3 rounded-xl bg-base-alt text-center">
                      <div className="text-xl font-black" style={{color:stat.color}}>{stat.value}</div>
                      <div className="text-xs text-tertiary">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "breaches" && (
          <div className="tb-section">
            <div className="tb-section-title" style={{color:"#F87171"}}>🚨 Active SLA Breaches ({activeBreach.length})</div>
            {activeBreach.length === 0 ? (
              <div className="tb-empty mt-4"><div className="tb-empty-icon">✅</div><div className="tb-empty-title">No active breaches</div><div className="tb-empty-desc">All service requests are within SLA</div></div>
            ) : (
              <div className="space-y-2 mt-3">
                {activeBreach.map((item,i)=>{
                  const uc = URGENCY_COLORS[item.urgency]||"#94A3B8";
                  const overdue = Number(item.hours_overdue||0);
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border" style={{background:"#F8717108",borderColor:"#F8717130"}}>
                      <div className="flex-shrink-0">
                        <span className="tb-badge" style={{background:uc+"18",color:uc}}>{item.urgency}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-primary truncate">{item.title}</div>
                        <div className="text-xs text-tertiary">{item.site_name||"—"} · Open {fmtHours(item.hours_open)} · Target: {fmtHours(item.sla_target_hours)}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-black text-red-400">+{fmtHours(overdue)} overdue</div>
                        <div className="text-xs text-tertiary">{fmtDate(item.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "targets" && (
          <div className="tb-section">
            <div className="tb-section-title">SLA Targets — Triangle Black Standard</div>
            <div className="space-y-3 mt-4">
              {[
                {priority:"critical",response:2,resolution:8,color:"#F87171",desc:"Safety / Guest impact"},
                {priority:"high",response:4,resolution:24,color:"#FB923C",desc:"Operations affected"},
                {priority:"medium",response:8,resolution:48,color:"#FBBF24",desc:"Non-critical issue"},
                {priority:"low",response:24,resolution:72,color:"#34D399",desc:"Planned / Cosmetic"},
              ].map((tier,i)=>(
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-base-alt border border-border">
                  <span className="tb-badge flex-shrink-0" style={{background:tier.color+"18",color:tier.color,fontSize:"0.6rem",minWidth:"70px",textAlign:"center"}}>
                    {tier.priority.toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm text-secondary">{tier.desc}</div>
                  </div>
                  <div className="flex gap-6 flex-shrink-0 text-right">
                    <div>
                      <div className="text-sm font-black text-primary">{tier.response}h</div>
                      <div className="text-xs text-tertiary">Response</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-primary">{tier.resolution}h</div>
                      <div className="text-xs text-tertiary">Resolution</div>
                    </div>
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
