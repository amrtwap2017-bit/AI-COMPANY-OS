"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return d?new Date(d).toLocaleDateString("en-GB"):"—"; } catch { return "—"; } };
const pct = (n: any) => `${Math.round(n||0)}%`;

export default function SLAReviewPage() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");

  const { data: sla, isLoading } = useQuery({ queryKey:["sla-dashboard"], queryFn:()=>authFetch("/api/v1/sla/dashboard").then(r => r.json()), staleTime:60000, refetchInterval:120000 });

  const overall = sla?.overall || {};
  const siteSLA = toArr(sla?.site_sla);
  const breaches = toArr(sla?.active_breaches);
  const targets = sla?.sla_targets || {};

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Operations</div>
              <h1 className="tb-hero-title">SLA Review</h1>
              <p className="tb-hero-description">Service level compliance · Breach tracking · Site performance</p>
            </div>
            <div className="tb-action-bar">
              {breaches.length > 0 && (
                <div className="tb-badge tb-badge-danger">🚨 {breaches.length} Active Breach{breaches.length!==1?"es":""}</div>
              )}
              <button onClick={()=>router.push("/operations")} className="tb-btn tb-btn-secondary">← Operations</button>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:(overall.compliance_rate||0)>=80?"var(--color-success)":"var(--color-danger)"}}>{pct(overall.compliance_rate)}</div>
                <div className="tb-hero-kpi-label">Compliance Rate</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:breaches.length>0?"var(--color-danger)":"var(--color-success)"}}>{sla?.breach_count||0}</div>
                <div className="tb-hero-kpi-label">Total Breaches</div>
              </div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{overall.total_wos||0}</div><div className="tb-hero-kpi-label">WOs Measured</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)"}}>{overall.on_time||0}</div><div className="tb-hero-kpi-label">On Time</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-tabs">
          {[{key:"overview",label:"Overview"},{key:"breaches",label:`Active Breaches (${breaches.length})`},{key:"sites",label:"By Site"}].map((t: any) =>(
            <button key={t.key} onClick={()=>setTab(t.key)} className={`tb-tab ${tab===t.key?"active":""}`}>{t.label}</button>
          ))}
        </div>

        {tab==="overview" && (
          <div className="tb-grid-2">
            <div className="tb-section">
              <div className="tb-section-title">Overall Performance</div>
              {[
                ["Compliance Rate",pct(overall.compliance_rate),(overall.compliance_rate||0)>=80?"var(--color-success)":"var(--color-danger)"],
                ["On Time",overall.on_time||0,"var(--color-success)"],
                ["Breached",overall.breached||0,"var(--color-danger)"],
                ["Total Measured",overall.total_wos||0,"var(--color-text-1)"],
                ["Avg Response (h)",overall.avg_response_hours?.toFixed(1)||"—","var(--color-text-1)"],
              ].map(([label,value,color],i)=>(
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{label}</span>
                  <span className="tb-detail-value font-bold" style={{color}}>{value}</span>
                </div>
              ))}
            </div>
            <div className="tb-section">
              <div className="tb-section-title">SLA Targets</div>
              {Object.entries(targets).length>0 ? Object.entries(targets).map(([key,val],i)=>(
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{key.replace(/_/g," ")}</span>
                  <span className="tb-detail-value">{typeof val==="number"?`${val}h`:val}</span>
                </div>
              )) : <p className="text-sm text-tertiary">No SLA targets configured</p>}
            </div>
          </div>
        )}

        {tab==="breaches" && (
          <div className="tb-section">
            <div className="tb-section-title">Active SLA Breaches</div>
            {isLoading ? <TableSkeleton /> : breaches.length===0 ? (
              <EmptyState icon="✅" title="No active breaches" description="All work orders are within SLA targets" />
            ) : (
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead><tr><th>Work Order</th><th>Priority</th><th>Status</th><th>Breach Type</th><th>Due Date</th><th></th></tr></thead>
                  <tbody>
                    {breaches.map((b: any, i: number) =>(
                      <tr key={b.id||i} style={{borderLeft:"3px solid var(--color-danger-border)"}}>
                        <td>
                          <div className="font-semibold text-sm text-primary">{(b.title||"Untitled").slice(0,50)}</div>
                          <div className="text-xs text-tertiary">{b.id?.slice(0,8)}</div>
                        </td>
                        <td><StatusBadge status={b.priority||"medium"} /></td>
                        <td><StatusBadge status={b.status||"open"} /></td>
                        <td className="text-xs text-danger font-bold">{b.breach_type||"Response"}</td>
                        <td className="text-xs text-danger">{fmtDate(b.due_date)}</td>
                        <td>
                          <button onClick={()=>router.push(`/operations/work-orders/${b.id}`)}
                            className="tb-btn tb-btn-danger tb-btn-sm">Resolve</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab==="sites" && (
          <div className="tb-section">
            <div className="tb-section-title">SLA Performance by Site</div>
            {siteSLA.length===0 ? (
              <EmptyState icon="🏨" title="No site data" description="No SLA data by site available" />
            ) : (
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead><tr><th>Site</th><th>Total WOs</th><th>On Time</th><th>Breached</th><th>Compliance</th></tr></thead>
                  <tbody>
                    {siteSLA.map((s: any, i: number) =>{
                      const comp = s.total>0?Math.round((s.on_time||0)/s.total*100):0;
                      return (
                        <tr key={i}>
                          <td className="font-semibold text-sm text-primary">{s.site_name||s.site_id||"—"}</td>
                          <td className="text-sm text-secondary">{s.total||0}</td>
                          <td className="text-sm font-semibold text-success">{s.on_time||0}</td>
                          <td className={`text-sm ${(s.breached||0)>0?"font-bold text-danger":"text-tertiary"}`}>{s.breached||0}</td>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <div className="tb-progress flex-1">
                                <div className="tb-progress-bar" style={{width:`${comp}%`,background:comp>=80?"var(--color-success)":"var(--color-danger)"}} />
                              </div>
                              <span className={`text-xs font-bold ${comp>=80?"text-success":"text-danger"}`} style={{minWidth:36}}>{pct(comp)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
