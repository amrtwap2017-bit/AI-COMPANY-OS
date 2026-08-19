"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtDate = (d: any) => { if (!d) return "—"; try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtDays = (n: any) => { const days=Number(n||0); if(days>0) return `${days}d overdue`; if(days===0) return "Due today"; return `In ${Math.abs(days)}d`; };

const STATUS_CONFIG = {
  overdue:   {color:"var(--color-danger)",bg:"rgba(168,74,61,0.08)",label:"Overdue",icon:"🚨"},
  due_soon:  {color:"var(--color-warning)",bg:"rgba(176,122,42,0.08)",label:"Due This Week",icon:"⚠️"},
  upcoming:  {color:"var(--color-info)",bg:"rgba(91,124,140,0.08)",label:"Due This Month",icon:"📅"},
  scheduled: {color:"var(--color-success)",bg:"rgba(84,124,77,0.08)",label:"Scheduled",icon:"✅"},
};
const CRIT_COLORS = {critical:"var(--color-danger)",high:"var(--color-warning)",medium:"var(--color-warning)",low:"var(--color-text-3)"};

export default function MaintenanceSchedulerPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("schedule");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSite, setFilterSite] = useState("all");
  const [genResult, setGenResult] = useState(null);

  const { data: schedData, isLoading } = useQuery(["pm-schedule-assets"],()=>authFetch("/api/v1/pm-schedule/assets?limit=100").then(r=>r.json()),{staleTime:30000,refetchInterval:60000});
  const { data: calData } = useQuery(["pm-schedule-calendar"],()=>authFetch("/api/v1/pm-schedule/calendar").then(r=>r.json()),{staleTime:60000});
  const { data: stats } = useQuery(["pm-schedule-stats"],()=>authFetch("/api/v1/pm-schedule/stats").then(r=>r.json()),{staleTime:30000});

  const genMut = useMutation(
    ()=>authFetch("/api/v1/pm-schedule/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}).then(r=>r.json()),
    {onSuccess:(data)=>{setGenResult(data);qc.invalidateQueries(["pm-schedule-assets"]);qc.invalidateQueries(["pm-schedule-stats"]);}}
  );

  const assets = schedData?.assets||[];
  const weeks = calData?.weeks||{};
  const overdue_cal = calData?.overdue||[];
  const assetStats = stats?.assets||{};
  const woStats = stats?.wos_this_month||{};

  const filtered = assets.filter((a: any) =>(filterStatus==="all"||a.schedule_status===filterStatus)&&(filterSite==="all"||a.site_name?.includes(filterSite)));
  const sites = [...new Set(assets.map((a: any) =>a.site_name).filter(Boolean))];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Maintenance Scheduler</h1>
              <p className="tb-hero-description">Preventive maintenance tracking · Auto-generate work orders</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>genMut.mutate()} disabled={genMut.isLoading} className="tb-btn tb-btn-primary">
                {genMut.isLoading?"Generating…":"⚡ Auto-Generate WOs"}
              </button>
              <button onClick={()=>router.push("/operations/work-orders")} className="tb-btn tb-btn-secondary tb-btn-sm">All Work Orders →</button>
            </div>
          </div>

          {genResult && (
            <div className={`tb-alert ${genResult.error?"tb-alert-danger":"tb-alert-success"} mb-4`}>
              <div className="font-bold text-sm">{genResult.error?`❌ Error: ${genResult.error}`:`✅ ${genResult.message}`}</div>
              {genResult.work_orders?.length>0&&<div className="text-xs opacity-70 mt-0.5">{genResult.work_orders.map(wo=>`${wo.asset} → ${wo.technician}`).join(" · ")}</div>}
            </div>
          )}

          <div className="tb-grid-4">
            {[{label:"Overdue",value:assetStats.overdue||0,color:"var(--color-danger)",sub:"immediate action"},{label:"Due This Week",value:assetStats.due_week||0,color:"var(--color-warning)",sub:"schedule now"},{label:"Due This Month",value:assetStats.due_month||0,color:"var(--color-info)",sub:"plan ahead"},{label:"WOs Created",value:woStats.created||0,color:"var(--color-success)",sub:`${woStats.completed||0} completed`}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
                <div className="text-xs opacity-50 mt-0.5">{k.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-tabs mb-4">
          {[{k:"schedule",l:"📋 Maintenance Schedule"},{k:"calendar",l:"📅 30-Day Calendar"}].map(tab=>(
            <button key={tab.k} onClick={()=>setActiveTab(tab.k)} className={`tb-tab ${activeTab===tab.k?"active":""}`}>{tab.l}</button>
          ))}
        </div>

        {activeTab==="schedule" && (
          <>
            <div className="flex gap-3 mb-4 flex-wrap items-center">
              <select className="tb-select" value={filterStatus} onChange={(e: any) =>setFilterStatus(e.target.value)} style={{minWidth:"160px",width:"auto"}}>
                <option value="all">All Status</option>
                <option value="overdue">🚨 Overdue</option>
                <option value="due_soon">⚠️ Due This Week</option>
                <option value="upcoming">📅 Due This Month</option>
                <option value="scheduled">✅ Scheduled</option>
              </select>
              <select className="tb-select" value={filterSite} onChange={(e: any) =>setFilterSite(e.target.value)} style={{minWidth:"180px",width:"auto"}}>
                <option value="all">All Sites</option>
                {sites.map((s: any) =><option key={s} value={s}>{s.split(" ").slice(0,2).join(" ")}</option>)}
              </select>
              {(filterStatus!=="all"||filterSite!=="all")&&<button onClick={()=>{setFilterStatus("all");setFilterSite("all");}} className="tb-btn tb-btn-ghost tb-btn-sm">Reset</button>}
              <span className="text-xs text-tertiary">{filtered.length} assets</span>
            </div>

            <div className="tb-grid-4 mb-4">
              {Object.entries(STATUS_CONFIG).map(([status,cfg])=>{
                const count = assets.filter((a: any) =>a.schedule_status===status).length;
                return (
                  <button key={status} onClick={()=>setFilterStatus(status===filterStatus?"all":status)}
                    className="tb-section text-left cursor-pointer"
                    style={{background:filterStatus===status?cfg.bg:"var(--color-surface)",borderColor:filterStatus===status?cfg.color:"var(--color-border)"}}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{cfg.icon}</span>
                      <span className="text-xs font-bold" style={{color:cfg.color}}>{count}</span>
                    </div>
                    <div className="text-xs text-secondary">{cfg.label}</div>
                  </button>
                );
              })}
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-2">{[1,2,3,4,5].map((i: any) =><div key={i} className="tb-shimmer tb-shimmer-block" style={{height:64}} />)}</div>
            ) : filtered.length===0 ? (
              <div className="tb-empty"><div className="tb-empty-icon">✅</div><div className="tb-empty-title">All clear!</div><div className="tb-empty-desc">No assets match this filter</div></div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((asset,i)=>{
                  const cfg = (STATUS_CONFIG as Record<string, any>)[asset.schedule_status]||STATUS_CONFIG.scheduled;
                  const cc = (CRIT_COLORS as Record<string, any>)[asset.criticality]||"var(--color-text-3)";
                  const hasRecentWO = (asset.recent_wo_count||0)>0;
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border"
                      style={{background:cfg.bg,borderColor:`${cfg.color}30`}}>
                      <div className="text-lg flex-shrink-0">{cfg.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-bold text-primary truncate">{asset.asset_name}</span>
                          <span className="tb-badge" style={{fontSize:"9px",background:`${cc}18`,color:cc}}>{asset.criticality}</span>
                          {hasRecentWO&&<span className="tb-badge tb-badge-success" style={{fontSize:"9px"}}>WO Active</span>}
                        </div>
                        <div className="text-xs text-tertiary">{asset.category} · {asset.site_name} · {asset.location_description?.slice(0,40)||"—"}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-bold" style={{color:cfg.color}}>{fmtDays(asset.overdue_days)}</div>
                        <div className="text-xs text-tertiary">Last: {fmtDate(asset.last_maintenance_date)}</div>
                        <div className="text-xs text-secondary">Next: {fmtDate(asset.next_maintenance_date)}</div>
                      </div>
                      <button onClick={()=>router.push("/operations/work-orders/new")} className="tb-btn tb-btn-secondary tb-btn-sm flex-shrink-0">+ WO</button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab==="calendar" && (
          <div className="flex flex-col gap-4">
            {overdue_cal.length>0 && (
              <div className="tb-section" style={{borderColor:"var(--color-danger-border)",background:"var(--color-danger-bg)"}}>
                <div className="font-bold text-danger mb-3">🚨 Overdue ({overdue_cal.length} assets)</div>
                <div className="tb-grid-2">
                  {overdue_cal.map((a: any, i: number) =>(
                    <div key={i} className="flex items-center gap-3 p-3 bg-surface-alt rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{a.name}</div>
                        <div className="text-xs text-tertiary">{a.category} · {a.site_name}</div>
                      </div>
                      <div className="text-xs text-danger font-bold">{fmtDate(a.next_maintenance_date)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {Object.entries(weeks).length===0 ? (
              <div className="tb-empty"><div className="tb-empty-icon">📅</div><div className="tb-empty-title">No scheduled maintenance in next 30 days</div></div>
            ) : Object.entries(weeks).map(([week,weekAssets],wi)=>(
              <div key={wi} className="tb-section">
                <div className="tb-section-title">Week of {fmtDate(week)} ({weekAssets.length} assets)</div>
                <div className="tb-grid-2 mt-3">
                  {weekAssets.map((a: any, i: number) =>{
                    const cc = (CRIT_COLORS as Record<string, any>)[a.criticality]||"var(--color-text-3)";
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 bg-surface-alt rounded-lg">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:cc}} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-primary truncate">{a.asset_name}</div>
                          <div className="text-xs text-tertiary">{a.category} · {a.site_name}</div>
                        </div>
                        <div className="text-xs text-secondary font-bold">{fmtDate(a.next_maintenance_date)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
