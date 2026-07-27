"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function ExecutivePage() {
  const router = useRouter();
  const { data: twin }        = useQuery(["exe-twin"],   () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: dash }        = useQuery(["exe-dash"],   () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()), {refetchInterval:30000});
  const { data: woRaw }       = useQuery(["exe-wos"],    () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: invRaw }      = useQuery(["exe-inv"],    () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: contractRaw } = useQuery(["exe-cont"],   () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const { data: notifRaw }    = useQuery(["exe-notifs"], () => authFetch("/api/v1/notifications/").then(r=>r.json()));
  const { data: autoStatus }  = useQuery(["exe-auto"],   () => authFetch("/api/v1/automation/status").then(r=>r.json()));

  const wos       = toArr(woRaw);
  const invoices  = toArr(invRaw);
  const contracts = toArr(contractRaw);
  const notifs    = toArr(notifRaw);
  const d         = dash||{};
  const now       = new Date();
  const in30      = new Date(now.getTime()+30*86400000);
  const score     = twin?.health_score??0;

  const criticalWOs     = wos.filter(w=>w.priority==="critical"&&w.status!=="completed");
  const overdueWOs      = wos.filter(w=>w.due_date&&new Date(w.due_date)<now&&w.status!=="completed");
  const expiringContracts = contracts.filter(c=>c.status==="active"&&c.end_date&&new Date(c.end_date)>=now&&new Date(c.end_date)<=in30);
  const totalRevenue    = invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const pendingRevenue  = invoices.filter(i=>i.status==="pending").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const unreadNotifs    = notifs.filter(n=>!n.is_read);
  const pending         = autoStatus?.pending_actions||{};
  const totalPending    = Object.values(pending).reduce((s,v)=>s+Number(v),0);
  const collRate        = invoices.length>0?Math.round(invoices.filter(i=>i.status==="paid").length/invoices.length*100):0;
  const compRate        = wos.length>0?Math.round(wos.filter(w=>w.status==="completed").length/wos.length*100):0;
  const riskScore       = criticalWOs.length*10+overdueWOs.length*3+expiringContracts.length*5+(d.maintenance?.overdue||0)*2;
  const riskLevel       = riskScore===0?"None":riskScore<15?"Low":riskScore<30?"Medium":"High";
  const riskColor       = riskScore===0?"#34D399":riskScore<15?"#60A5FA":riskScore<30?"#FBBF24":"#F87171";

  const executiveNav = [
    {label:"Intelligence",  icon:"🧠", path:"/executive/intelligence"},
    {label:"Daily Review",  icon:"☀️", path:"/executive/daily-review"},
    {label:"Portfolio",     icon:"💼", path:"/executive/portfolio"},
    {label:"Risks",         icon:"⚠️", path:"/executive/risks"},
    {label:"Exceptions",    icon:"🚨", path:"/executive/exceptions"},
    {label:"Scorecard",     icon:"🏆", path:"/executive/scorecard"},
    {label:"Predictive",    icon:"🔮", path:"/executive/predictive"},
    {label:"Reports",       icon:"📊", path:"/executive/reports"},
    {label:"Command",       icon:"⚡", path:"/executive/command"},
    {label:"Workbench",     icon:"🛠️", path:"/executive/workbench"},
  ];

  return (
    <div className="min-h-screen bg-base">
      {/* HERO */}
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #1A0A28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-purple-400 mb-1.5">Executive Center</div>
              <h1 className="tb-hero-title">Executive Dashboard</h1>
              <p className="tb-hero-description">Real-time business intelligence and decision support</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Twin score */}
              <div className={`tb-score-badge ${score>=95?"tb-score-badge--success":"tb-score-badge--warning"}`}>
                <div className="tb-score-value" style={{color:score>=95?"#34D399":"#FBBF24"}}>{score}</div>
                <div className="tb-score-label">Platform Health</div>
                <div className="tb-score-sub" style={{color:score>=95?"#34D399":"#FBBF24"}}>{twin?.health_label||"—"}</div>
              </div>
              {/* Risk score */}
              <div className={`tb-score-badge ${riskScore===0?"tb-score-badge--success":riskScore<15?"":"tb-score-badge--danger"}`}
                style={riskScore>=15?{background:`${riskColor}14`,border:`1px solid ${riskColor}40`}:{}}>
                <div className="tb-score-value" style={{color:riskColor}}>{riskScore}</div>
                <div className="tb-score-label">Risk Score</div>
                <div className="tb-score-sub" style={{color:riskColor}}>{riskLevel}</div>
              </div>
            </div>
          </div>

          {/* KPI strip */}
          <div className="tb-grid-6 mt-6">
            {[
              {label:"Active Contracts", value:d.commercial?.active_contracts??0,  color:"#34D399", path:"/commercial/contracts"},
              {label:"Revenue",          value:fmtEGP(totalRevenue),               color:"#FBBF24", path:"/invoices"},
              {label:"Pending",          value:fmtEGP(pendingRevenue),             color:"#60A5FA", path:"/invoices"},
              {label:"Critical WOs",     value:criticalWOs.length,                 color:criticalWOs.length>0?"#F87171":"#34D399", path:"/executive/exceptions"},
              {label:"WO Completion",    value:`${compRate}%`,                     color:compRate>=80?"#34D399":"#FBBF24", path:"/analytics/scorecards"},
              {label:"Unread Alerts",    value:unreadNotifs.length,               color:"#A78BFA", path:"/inbox"},
            ].map((k,i)=>(
              <button key={i} onClick={()=>router.push(k.path)} className="tb-hero-kpi text-left">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="tb-canvas">

        {/* Executive nav */}
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Executive Views</div>
          <div className="tb-grid-4" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
            {executiveNav.map((nav,i)=>(
              <button key={i} onClick={()=>router.push(nav.path)} className="tb-action-item justify-center py-4 flex-col gap-1.5 text-center">
                <span className="text-xl">{nav.icon}</span>
                <span className="text-xs font-medium text-secondary">{nav.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left — alerts */}
          <div className="space-y-4">
            <div className="tb-section">
              <div className="tb-section-header">
                <div>
                  <div className="text-label-upper text-tertiary mb-1">Attention Required</div>
                  <div className="tb-section-title" style={{marginBottom:0}}>Executive Alerts</div>
                </div>
                <button onClick={()=>router.push("/executive/exceptions")} className="tb-section-link">All →</button>
              </div>
              {criticalWOs.length===0&&expiringContracts.length===0 ? (
                <div className="tb-empty" style={{padding:"24px 0"}}>
                  <div className="tb-empty-icon" style={{fontSize:"2.5rem"}}>✅</div>
                  <div className="tb-empty-desc">No executive alerts</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {criticalWOs.slice(0,3).map((w,i)=>(
                    <button key={i} onClick={()=>router.push(`/operations/work-orders/${w.id}`)}
                      className="tb-domain-card tb-domain-card--danger w-full text-left">
                      <div className="text-label-upper mb-1" style={{color:"#F87171"}}>Critical WO</div>
                      <div className="text-sm font-semibold text-primary truncate">{w.title}</div>
                    </button>
                  ))}
                  {expiringContracts.slice(0,2).map((c,i)=>{
                    const days=Math.ceil((new Date(c.end_date)-Date.now())/86400000);
                    return (
                      <button key={i} onClick={()=>router.push(`/commercial/contracts/${c.id}`)}
                        className="tb-domain-card tb-domain-card--warn w-full text-left">
                        <div className="text-label-upper mb-1" style={{color:"#FBBF24"}}>Contract · {days}d left</div>
                        <div className="text-sm font-semibold text-primary truncate">{c.title||c.id?.slice(0,16)}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Business summary */}
            <div className="tb-section">
              <div className="tb-section-title">Business Summary</div>
              <div className="space-y-1">
                {[
                  ["WO Total",        wos.length],
                  ["PM Plans",        d.maintenance?.pm_plans??0],
                  ["Open Leads",      d.commercial?.open_leads??0],
                  ["Purchase Reqs",   d.procurement?.purchase_requests??0],
                  ["Technicians",     d.platform?.technicians??0],
                  ["Projects",        d.platform?.projects??0],
                ].map(([l,v],i)=>(
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{l}</span>
                    <span className="tb-info-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — twin + finance */}
          <div className="xl:col-span-2 space-y-5">

            {/* Twin domains */}
            <div className="tb-section">
              <div className="tb-section-header">
                <div>
                  <div className="text-label-upper text-tertiary mb-1">Digital Twin</div>
                  <div className="tb-section-title" style={{marginBottom:0}}>Domain Health — {score}/100</div>
                </div>
                <button onClick={()=>router.push("/executive/intelligence")} className="tb-section-link">Intelligence →</button>
              </div>
              <div className="tb-grid-4">
                {(twin?.operational_domains??[]).map((dom,i)=>{
                  const hasIssue=(dom.overdue??0)>0||(dom.critical_open??0)>0||(dom.below_min??0)>0;
                  const c=hasIssue?"#FBBF24":"#34D399";
                  return (
                    <div key={i} className={`tb-domain-card ${hasIssue?"tb-domain-card--warn":"tb-domain-card--ok"}`}>
                      <div className="tb-flex-between mb-1">
                        <div className="text-xs font-semibold text-primary">{dom.domain}</div>
                        <div className="text-xs font-black" style={{color:c}}>{hasIssue?"⚠":"✓"}</div>
                      </div>
                      <div className="text-2xl font-black" style={{color:c}}>{dom.total??0}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Finance snapshot */}
            <div className="tb-section">
              <div className="tb-section-header">
                <div>
                  <div className="text-label-upper text-tertiary mb-1">Finance</div>
                  <div className="tb-section-title" style={{marginBottom:0}}>Revenue Snapshot</div>
                </div>
                <button onClick={()=>router.push("/invoices")} className="tb-section-link">Full report →</button>
              </div>
              <div className="tb-grid-4 mb-4">
                {[
                  {label:"Paid",      count:d.finance?.paid??0,      color:"#34D399"},
                  {label:"Pending",   count:d.finance?.pending??0,    color:"#FBBF24"},
                  {label:"Overdue",   count:d.finance?.overdue??0,    color:"#F87171"},
                  {label:"Cancelled", count:d.finance?.cancelled??0,  color:"#94A3B8"},
                ].map((s,i)=>(
                  <div key={i} className="bg-base-alt rounded-xl p-3 text-center">
                    <div className="text-2xl font-black" style={{color:s.color}}>{s.count}</div>
                    <div className="text-xs text-tertiary mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="tb-progress tb-progress--md">
                <div style={{display:"flex",height:"100%"}}>
                  <div className="tb-progress-bar tb-progress-bar--success" style={{width:`${(d.finance?.paid||0)/(d.finance?.total_invoices||1)*100}%`}}/>
                  <div className="tb-progress-bar tb-progress-bar--warning" style={{width:`${(d.finance?.pending||0)/(d.finance?.total_invoices||1)*100}%`}}/>
                  <div className="tb-progress-bar tb-progress-bar--danger"  style={{width:`${(d.finance?.overdue||0)/(d.finance?.total_invoices||1)*100}%`}}/>
                </div>
              </div>
              <div className="flex gap-5 mt-2">
                {[{label:"Paid",color:"#34D399"},{label:"Pending",color:"#FBBF24"},{label:"Overdue",color:"#F87171"}].map((s,i)=>(
                  <div key={i} className="flex items-center gap-1.5">
                    <div style={{width:7,height:7,borderRadius:"50%",background:s.color}}/>
                    <span className="text-xs text-tertiary">{s.label}</span>
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
