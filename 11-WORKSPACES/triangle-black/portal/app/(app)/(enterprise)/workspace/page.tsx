"use client";
// @ts-nocheck
import { RoleBadge } from "@/components/ui/RoleBadge";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useState } from "react";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function WorkspacePage() {
  const router = useRouter();
  const qc     = useQueryClient();
  const [runningAuto, setRunningAuto] = useState(false);
  const [autoResult,  setAutoResult]  = useState(null);

  const { data: twin }     = useQuery(["ws-twin"],   () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: dash }     = useQuery(["ws-dash"],   () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()), {refetchInterval:60000});
  const { data: woRaw }    = useQuery(["ws-wos"],    () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: notifRaw } = useQuery(["ws-notifs"], () => authFetch("/api/v1/notifications-portal").then(r=>r.json()));
  const { data: pmRaw }    = useQuery(["ws-pms"],    () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const { data: autoStatus, refetch: refetchAuto } = useQuery(["ws-auto"], () => authFetch("/api/v1/automation/status").then(r=>r.json()));

  const wos    = toArr(woRaw);
  const notifs = toArr(notifRaw);
  const pms    = toArr(pmRaw);
  const d      = dash || {};
  const score  = twin?.health_score ?? 0;
  const now    = new Date();
  const today  = now.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  const pending      = autoStatus?.pending_actions || {};
  const totalPending = Object.values(pending).reduce((s,v) => s+Number(v), 0);
  const unreadNotifs = notifs.filter(n => !n.is_read);
  const criticalWOs  = wos.filter(w => w.priority==="critical" && w.status!=="completed");
  const openWOs      = wos.filter(w => w.status==="open");
  const inProgressWOs= wos.filter(w => w.status==="in_progress");
  const overduePMs   = pms.filter(p => p.next_due_ts && new Date(p.next_due_ts) < now);
  const completedWOs = wos.filter(w => w.status==="completed");
  const compRate     = wos.length > 0 ? Math.round(completedWOs.length/wos.length*100) : 0;
  const collRate     = (d.finance?.total_invoices||0) > 0 ? Math.round((d.finance?.paid||0)/(d.finance?.total_invoices||1)*100) : 0;

  const urgentItems = [
    ...criticalWOs.map(w => ({type:"Critical WO", title:w.title, path:`/operations/work-orders/${w.id}`, color:"red"})),
    ...overduePMs.slice(0,2).map(p => ({type:"Overdue PM", title:p.title, path:"/maintenance/pm-plans", color:"amber"})),
  ].slice(0,6);

  const runAutomation = async () => {
    setRunningAuto(true);
    try {
      const res = await authFetch("/api/v1/automation/run", {method:"POST"});
      setAutoResult(await res.json());
      refetchAuto();
    } finally { setRunningAuto(false); }
  };

  const domainHealth = [
    {domain:"Operations",  metric:`${openWOs.length} open WOs`,        health:compRate,    path:"/operations"},
    {domain:"Maintenance", metric:`${overduePMs.length} overdue PM`,    health:overduePMs.length===0?100:Math.max(0,100-overduePMs.length*10), path:"/maintenance"},
    {domain:"Commercial",  metric:`${d.commercial?.active_contracts??0} active`, health:85, path:"/commercial"},
    {domain:"Finance",     metric:`${collRate}% collected`,             health:collRate,    path:"/invoices"},
    {domain:"Supply Chain",metric:`${d.procurement?.purchase_requests??0} PRs`, health:80, path:"/supply-chain"},
    {domain:"Platform",    metric:`${score}/100 twin score`,            health:score,       path:"/executive/intelligence"},
  ];

  const quickLinks = [
    {label:"My Day",     icon:"☀️", path:"/workspace/my-day"},
    {label:"Work Orders",icon:"🔧", path:"/operations/work-orders"},
    {label:"Dispatch",   icon:"👷", path:"/operations/dispatch"},
    {label:"PM Plans",   icon:"📅", path:"/maintenance/pm-plans"},
    {label:"Assets",     icon:"🏗️", path:"/maintenance/assets"},
    {label:"Contracts",  icon:"📄", path:"/commercial/contracts"},
    {label:"Invoices",   icon:"💰", path:"/invoices"},
    {label:"Procurement",icon:"📦", path:"/supply-chain"},
    {label:"Analytics",  icon:"📊", path:"/analytics"},
    {label:"Automation", icon:"⚡", path:"/workflows/launcher"},
  ];

  return (
    <div className="min-h-screen bg-base">

      {/* HERO */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                <span className="text-label-upper" style={{color:"rgba(148,163,184,0.7)"}}>Triangle Black — Platform Live</span>
              </div>
              <h1 className="tb-hero-title">Platform Command Center</h1>
              <div style={{marginBottom:8}}><RoleBadge size="md"/></div>
              <p className="tb-hero-description">{today}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {totalPending > 0 && (
                <button onClick={runAutomation} disabled={runningAuto} className="tb-hero-btn tb-hero-btn--glass">
                  {runningAuto ? "⏳ Running..." : `⚡ Auto (${totalPending})`}
                </button>
              )}
              <div className={`tb-score-badge ${score>=95?"tb-score-badge--success":"tb-score-badge--warning"}`}>
                <div className="tb-score-value" style={{color:score>=95?"#34D399":"#FCD34D"}}>{score}</div>
                <div className="tb-score-label">Digital Twin</div>
                <div className="tb-score-sub" style={{color:score>=95?"#34D399":"#FCD34D"}}>
                  {score>=98?"A+":score>=95?"A":"A-"}
                </div>
              </div>
            </div>
          </div>

          {/* KPI strip */}
          <div className="tb-grid-8 mt-6">
            {[
              {label:"Open WOs",       value:openWOs.length,         color:"#60A5FA", path:"/operations/work-orders"},
              {label:"In Progress",    value:inProgressWOs.length,   color:"#FBBF24", path:"/operations/dispatch"},
              {label:"Critical",       value:criticalWOs.length,     color:criticalWOs.length>0?"#F87171":"#34D399", path:"/executive/exceptions"},
              {label:"PM Overdue",     value:overduePMs.length,      color:overduePMs.length>0?"#F87171":"#34D399", path:"/maintenance/pm-plans"},
              {label:"Alerts",         value:unreadNotifs.length,    color:"#A78BFA", path:"/inbox"},
              {label:"Contracts",      value:d.commercial?.active_contracts??0, color:"#34D399", path:"/commercial/contracts"},
              {label:"WO Complete",    value:`${compRate}%`,         color:compRate>=80?"#34D399":"#FBBF24", path:"/analytics/scorecards"},
              {label:"Collection",     value:`${collRate}%`,         color:collRate>=85?"#34D399":"#FBBF24", path:"/invoices"},
            ].map((k,i) => (
              <button key={i} onClick={() => router.push(k.path)} className="tb-hero-kpi text-left">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="tb-canvas">

        {/* Automation success */}
        {autoResult && (
          <div className="tb-alert tb-alert-success">
            <span className="text-2xl">✅</span>
            <div>
              <div style={{fontWeight:700,color:"#34D399",fontSize:"0.875rem"}}>
                Automation — {autoResult.total_actions} actions taken
              </div>
              <div style={{fontSize:"0.75rem",color:"rgba(52,211,153,0.7)",marginTop:2}}>
                {autoResult.wf01_pm_to_wo?.created?.length||0} PM→WO · {autoResult.wf02_contract_renewals?.notified?.length||0} renewals · {autoResult.wf03_stock_auto_pr?.created?.length||0} auto-PRs
              </div>
            </div>
          </div>
        )}

        {/* 3-column grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="space-y-4">

            {/* Urgent items */}
            <div className="tb-section">
              <div className="tb-section-header">
                <div>
                  <div className="text-label-upper text-tertiary mb-1">Attention Required</div>
                  <div className="font-bold text-primary" style={{marginBottom:0}}>Urgent Items</div>
                </div>
                <button onClick={() => router.push("/executive/exceptions")} className="tb-section-link">All →</button>
              </div>
              {urgentItems.length === 0 ? (
                <div className="tb-empty" style={{padding:"32px 0"}}>
                  <div className="tb-empty-icon" style={{fontSize:"2.5rem"}}>✅</div>
                  <div className="tb-empty-desc">All clear</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {urgentItems.map((item,i) => (
                    <button key={i} onClick={() => router.push(item.path)} className={`w-full text-left tb-domain-card ${item.color==="red"?"tb-domain-card--danger":"tb-domain-card--warn"}`}>
                      <div className="text-label-upper mb-1" style={{color:item.color==="red"?"#F87171":"#FBBF24"}}>{item.type}</div>
                      <div className="text-sm font-semibold text-primary truncate">{item.title}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="tb-section">
              <div className="tb-section-header">
                <div className="tb-section-title" style={{marginBottom:0}}>🕐 Recent Activity</div>
              </div>
              <ActivityFeed limit={8} compact/>
            </div>

            {/* Automation */}
            <div className="tb-section">
              <div className="tb-section-header">
                <div className="font-bold text-primary" style={{marginBottom:0}}>⚡ Automation</div>
                <button onClick={() => router.push("/workflows/launcher")} className="tb-section-link">Manage →</button>
              </div>
              <div className="space-y-2">
                {Object.entries(pending).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <span className="text-sm text-secondary capitalize">{key.replace(/wf\d+_/,"").replace(/_/g," ")}</span>
                    <span className={`tb-badge ${val===0?"tb-badge--success":"tb-badge--warning"}`}>
                      {val===0?"✓ OK":`${val} pending`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER + RIGHT */}
          <div className="xl:col-span-2 space-y-5">

            {/* Domain health */}
            <div className="tb-section">
              <div className="tb-section-header">
                <div>
                  <div className="text-label-upper text-tertiary mb-1">Digital Twin</div>
                  <div className="font-bold text-primary" style={{marginBottom:0}}>Domain Health</div>
                </div>
                <button onClick={() => router.push("/executive/intelligence")} className="tb-section-link">Full view →</button>
              </div>
              <div className="tb-grid-3">
                {domainHealth.map((item,i) => {
                  const h = item.health;
                  const cls = h>=80?"tb-domain-card--ok":h>=60?"tb-domain-card--warn":"tb-domain-card--danger";
                  const color = h>=80?"#34D399":h>=60?"#FBBF24":"#F87171";
                  return (
                    <button key={i} onClick={() => router.push(item.path)} className={`tb-domain-card ${cls}`}>
                      <div className="flex justify-between mb-2">
                        <div className="text-xs font-semibold text-primary">{item.domain}</div>
                        <div className="text-xs font-black" style={{color}}>{h>=80?"✓":h>=60?"!":"✗"}</div>
                      </div>
                      <div className="text-2xl font-black" style={{color}}>{Math.round(h)}%</div>
                      <div className="text-xs text-tertiary mt-1">{item.metric}</div>
                      <div className="mt-2 h-0.5 bg-black/10 rounded-full overflow-hidden">
                        <div className="h-0.5 rounded-full" style={{background:color,width:`${Math.min(h,100)}%`}}/>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent WOs */}
            <div className="tb-table">
              <div className="tb-section-header" style={{padding:"16px 24px",borderBottom:"1px solid var(--color-divider)"}}>
                <div>
                  <div className="text-label-upper text-tertiary mb-1">Live Queue</div>
                  <div className="font-bold text-primary" style={{marginBottom:0}}>Recent Work Orders</div>
                </div>
                <button onClick={() => router.push("/operations/work-orders")} className="tb-section-link">All {wos.length} →</button>
              </div>
              {wos.slice(0,6).map((w,i) => {
                const pColor = {critical:"#F87171",high:"#FB923C",medium:"#FBBF24",low:"rgba(148,163,184,0.4)"}[w.priority]||"rgba(148,163,184,0.4)";
                const sColor = {open:"#60A5FA",in_progress:"#FBBF24",completed:"#34D399",cancelled:"rgba(148,163,184,0.4)"}[w.status]||"rgba(148,163,184,0.4)";
                return (
                  <button key={i} onClick={() => router.push(`/operations/work-orders/${w.id}`)}
                    className="tb-table-row flex items-center gap-4">
                    <div className="tb-priority-bar" style={{background:pColor}}/>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-primary truncate">{w.title}</div>
                      <div className="text-xs text-tertiary mt-0.5 capitalize">{w.type||"corrective"}</div>
                    </div>
                    <span className="tb-badge" style={{background:`${sColor}18`,color:sColor,border:`1px solid ${sColor}30`}}>
                      {w.status}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Twin domains */}
            <div className="tb-section">
              <div className="tb-section-header">
                <div className="font-bold text-primary" style={{marginBottom:0}}>Digital Twin — All Domains</div>
                <button onClick={() => router.push("/executive/intelligence")} className="tb-section-link">Details →</button>
              </div>
              <div className="tb-grid-8">
                {(twin?.operational_domains??[]).map((dom,i) => {
                  const hasIssue = (dom.overdue??0)>0||(dom.critical_open??0)>0||(dom.below_min??0)>0;
                  const cls = hasIssue ? "tb-domain-card--warn" : "tb-domain-card--ok";
                  return (
                    <div key={i} className={`tb-domain-card ${cls} text-center`}>
                      <div className="text-xl font-black">{dom.total??0}</div>
                      <div className="text-xs mt-1" style={{color:hasIssue?"#FBBF24":"#34D399",fontSize:"0.5625rem",textTransform:"uppercase",letterSpacing:"0.04em"}}>{dom.domain}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick access */}
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Quick Access</div>
          <div className="tb-grid-8" style={{gridTemplateColumns:"repeat(10,1fr)"}}>
            {quickLinks.map((a,i) => (
              <button key={i} onClick={() => router.push(a.path)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-base-alt transition-colors border border-transparent hover:border-border">
                <span className="text-xl">{a.icon}</span>
                <span className="text-label" style={{fontSize:"0.5625rem",textAlign:"center",color:"var(--color-text-3)"}}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
