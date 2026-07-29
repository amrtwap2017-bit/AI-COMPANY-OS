"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtDate = (d) => {
  if (!d) return "—";
  try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); }
  catch { return "—"; }
};
const fmtDays = (n) => {
  const days = Number(n||0);
  if (days > 0) return `${days}d overdue`;
  if (days === 0) return "Due today";
  return `In ${Math.abs(days)}d`;
};

const STATUS_CONFIG = {
  overdue:   {color:"#F87171",bg:"#F8717110",label:"Overdue",icon:"🚨"},
  due_soon:  {color:"#FBBF24",bg:"#FBBF2410",label:"Due This Week",icon:"⚠️"},
  upcoming:  {color:"#60A5FA",bg:"#60A5FA10",label:"Due This Month",icon:"📅"},
  scheduled: {color:"#34D399",bg:"#34D39910",label:"Scheduled",icon:"✅"},
};
const CRIT_COLORS = {critical:"#F87171",high:"#FB923C",medium:"#FBBF24",low:"#34D399"};

export default function MaintenanceSchedulerPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("schedule");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSite, setFilterSite] = useState("all");
  const [genResult, setGenResult] = useState(null);

  const { data: schedData, isLoading } = useQuery(
    ["pm-schedule-assets"],
    () => authFetch("/api/v1/pm-schedule/assets?limit=100").then(r=>r.json()),
    { staleTime: 30000, refetchInterval: 60000 }
  );

  const { data: calData } = useQuery(
    ["pm-schedule-calendar"],
    () => authFetch("/api/v1/pm-schedule/calendar").then(r=>r.json()),
    { staleTime: 60000 }
  );

  const { data: stats } = useQuery(
    ["pm-schedule-stats"],
    () => authFetch("/api/v1/pm-schedule/stats").then(r=>r.json()),
    { staleTime: 30000 }
  );

  const genMut = useMutation(
    () => authFetch("/api/v1/pm-schedule/generate", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:"{}"
    }).then(r=>r.json()),
    { onSuccess: (data) => {
        setGenResult(data);
        qc.invalidateQueries(["pm-schedule-assets"]);
        qc.invalidateQueries(["pm-schedule-stats"]);
      }
    }
  );

  const assets = schedData?.assets || [];
  const summary = schedData?.summary || {};
  const weeks = calData?.weeks || {};
  const overdue_cal = calData?.overdue || [];
  const assetStats = stats?.assets || {};
  const woStats = stats?.wos_this_month || {};

  const filtered = assets.filter(a =>
    (filterStatus === "all" || a.schedule_status === filterStatus) &&
    (filterSite === "all" || a.site_name?.includes(filterSite))
  );

  const sites = [...new Set(assets.map(a=>a.site_name).filter(Boolean))];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A 0%,#0D1A2A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between mb-4">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1">Operations</div>
              <h1 className="tb-hero-title">Maintenance Scheduler</h1>
              <p className="tb-hero-description">Preventive maintenance tracking · Auto-generate work orders</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={()=>genMut.mutate()}
                disabled={genMut.isLoading}
                className="tb-btn-primary"
                style={{background:genMut.isLoading?"#4B5563":"#D97706",fontSize:"0.75rem"}}>
                {genMut.isLoading?"Generating…":"⚡ Auto-Generate WOs"}
              </button>
              <button onClick={()=>router.push("/operations/work-orders")} className="tb-btn-secondary" style={{fontSize:"0.75rem"}}>
                All Work Orders →
              </button>
            </div>
          </div>

          {/* Generation Result */}
          {genResult && (
            <div className="mb-4 p-3 rounded-xl" style={{background:genResult.error?"#F8717110":"#34D39910",border:`1px solid ${genResult.error?"#F8717140":"#34D39940"}`}}>
              <div className="text-sm font-bold" style={{color:genResult.error?"#F87171":"#34D399"}}>
                {genResult.error ? `❌ Error: ${genResult.error}` : `✅ ${genResult.message}`}
              </div>
              {genResult.work_orders?.length > 0 && (
                <div className="text-xs text-tertiary mt-1">
                  {genResult.work_orders.map((wo,i)=>`${wo.asset} → ${wo.technician}`).join(" · ")}
                </div>
              )}
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {label:"Overdue",value:assetStats.overdue||0,color:"#F87171",sub:"immediate action"},
              {label:"Due This Week",value:assetStats.due_week||0,color:"#FBBF24",sub:"schedule now"},
              {label:"Due This Month",value:assetStats.due_month||0,color:"#60A5FA",sub:"plan ahead"},
              {label:"WOs Created",value:woStats.created||0,color:"#34D399",sub:`${woStats.completed||0} completed`},
            ].map((k,i)=>(
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
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {["schedule","calendar"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} className={"tb-pill "+(activeTab===tab?"tb-pill--active":"")}>
              {tab==="schedule"?"📋 Maintenance Schedule":"📅 30-Day Calendar"}
            </button>
          ))}
        </div>

        {activeTab === "schedule" && (
          <>
            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap">
              <select className="tb-input" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{minWidth:"160px"}}>
                <option value="all">All Status</option>
                <option value="overdue">🚨 Overdue</option>
                <option value="due_soon">⚠️ Due This Week</option>
                <option value="upcoming">📅 Due This Month</option>
                <option value="scheduled">✅ Scheduled</option>
              </select>
              <select className="tb-input" value={filterSite} onChange={e=>setFilterSite(e.target.value)} style={{minWidth:"180px"}}>
                <option value="all">All Sites</option>
                {sites.map(s=><option key={s} value={s}>{s.split(' ').slice(0,2).join(' ')}</option>)}
              </select>
              {(filterStatus!=="all"||filterSite!=="all") && (
                <button onClick={()=>{setFilterStatus("all");setFilterSite("all");}} className="tb-btn-secondary" style={{fontSize:"0.75rem",padding:"6px 12px"}}>Reset</button>
              )}
              <div className="text-xs text-tertiary self-center ml-2">{filtered.length} assets</div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {Object.entries(STATUS_CONFIG).map(([status, cfg])=>{
                const count = assets.filter(a=>a.schedule_status===status).length;
                return (
                  <button key={status} onClick={()=>setFilterStatus(status===filterStatus?"all":status)}
                    className="p-3 rounded-xl border transition-all text-left"
                    style={{background:filterStatus===status?cfg.bg:"transparent",borderColor:filterStatus===status?cfg.color+"40":"rgba(255,255,255,0.08)"}}>
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
              <div className="space-y-2">{[1,2,3,4,5].map(i=><div key={i} className="h-16 bg-base-alt rounded-xl animate-pulse"/>)}</div>
            ) : filtered.length === 0 ? (
              <div className="tb-empty"><div className="tb-empty-icon">✅</div><div className="tb-empty-title">All clear!</div><div className="tb-empty-desc">No assets match this filter</div></div>
            ) : (
              <div className="space-y-2">
                {filtered.map((asset,i)=>{
                  const cfg = STATUS_CONFIG[asset.schedule_status] || STATUS_CONFIG.scheduled;
                  const cc = CRIT_COLORS[asset.criticality] || "#94A3B8";
                  const hasRecentWO = (asset.recent_wo_count||0) > 0;
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border transition-colors"
                         style={{background:cfg.bg,borderColor:cfg.color+"20"}}>
                      <div className="text-lg flex-shrink-0">{cfg.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-bold text-primary truncate">{asset.asset_name}</span>
                          <span className="tb-badge" style={{fontSize:"0.45rem",background:cc+"18",color:cc}}>{asset.criticality}</span>
                          {hasRecentWO && <span className="tb-badge" style={{fontSize:"0.45rem",background:"#34D39918",color:"#34D399"}}>WO Active</span>}
                        </div>
                        <div className="text-xs text-tertiary">{asset.category} · {asset.site_name} · {asset.location_description?.slice(0,40)||"—"}</div>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-0.5">
                        <div className="text-xs font-bold" style={{color:cfg.color}}>{fmtDays(asset.overdue_days)}</div>
                        <div className="text-xs text-tertiary">Last: {fmtDate(asset.last_maintenance_date)}</div>
                        <div className="text-xs text-secondary">Next: {fmtDate(asset.next_maintenance_date)}</div>
                      </div>
                      <button onClick={()=>router.push(`/operations/work-orders/new`)}
                        className="tb-btn-secondary flex-shrink-0" style={{fontSize:"0.6rem",padding:"4px 10px"}}>
                        + WO
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "calendar" && (
          <div className="space-y-4">
            {/* Overdue */}
            {overdue_cal.length > 0 && (
              <div className="tb-section" style={{borderColor:"#F8717140",background:"#F8717108"}}>
                <div className="tb-section-title" style={{color:"#F87171"}}>🚨 Overdue ({overdue_cal.length} assets)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                  {overdue_cal.map((a,i)=>(
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-base-alt">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{a.name}</div>
                        <div className="text-xs text-tertiary">{a.category} · {a.site_name}</div>
                      </div>
                      <div className="text-xs text-red-400 font-bold">{fmtDate(a.next_maintenance_date)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Weeks */}
            {Object.entries(weeks).length === 0 ? (
              <div className="tb-empty"><div className="tb-empty-icon">📅</div><div className="tb-empty-title">No scheduled maintenance in next 30 days</div></div>
            ) : (
              Object.entries(weeks).map(([week, weekAssets],wi)=>(
                <div key={wi} className="tb-section">
                  <div className="tb-section-title">Week of {fmtDate(week)} ({weekAssets.length} assets)</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                    {weekAssets.map((a,i)=>{
                      const cc = CRIT_COLORS[a.criticality]||"#94A3B8";
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-base-alt">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:cc}}/>
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
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
