"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { FeatureGate } from "@/components/ui/FeatureGate";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n: any) => `EGP ${Number(n||0).toLocaleString()}`;

function AnalyticsHubInner() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter();
  useEffect(() => { setMounted(true) }, [])
  const { data: dash }     = useQuery(["an-dash"],   () => authFetch("/api/v1/executive/dashboard").then(r => (r as any).data ?? r), {refetchInterval:60000});
  const { data: twin }     = useQuery(["an-twin"],   () => authFetch("/api/v1/twin/state").then(r => (r as any).data ?? r));
  const { data: woRaw }    = useQuery(["an-wos"],    () => authFetch("/api/v1/work-orders/").then(r => (r as any).data ?? r));
  const { data: invRaw }   = useQuery(["an-inv"],    () => authFetch("/api/v1/supplier-invoices/").then(r => (r as any).data ?? r));
  const { data: assetRaw } = useQuery(["an-assets"], () => authFetch("/api/v1/assets/").then(r => (r as any).data ?? r));

  const wos    = toArr(woRaw);
  const inv    = toArr(invRaw);
  const assets = toArr(assetRaw);
  const d      = dash||{};
  const score  = twin?.health_score??0;

  const compRate   = wos.length>0?Math.round(wos.filter((w: any) =>w.status==="completed").length/wos.length*100):0;
  const totalRev   = inv.filter((i: any) =>i.status==="paid").reduce((s: any, i: any) =>s+Number(i.total_amount||0),0);
  const collRate   = inv.length>0?Math.round(inv.filter((i: any) =>i.status==="paid").length/inv.length*100):0;
  const assetUp    = assets.length>0?Math.round(assets.filter((a: any) =>a.status==="Operational").length/assets.length*100):100;
  const pmCompliance=(d.maintenance?.pm_plans||0)>0?Math.round(((d.maintenance?.pm_plans||0)-(d.maintenance?.overdue||0))/(d.maintenance?.pm_plans||1)*100):100;

  const subPages = [
    {title:"Scorecards",   icon:"🏆", desc:"KPI vs targets",    path:"/analytics/scorecards"},
    {title:"SLA Reports",  icon:"⏱️", desc:"Response compliance",path:"/analytics/sla"},
    {title:"Trends",       icon:"📈", desc:"Performance over time",path:"/analytics/trends"},
    {title:"Cost Analysis",icon:"💵", desc:"Revenue & spend",    path:"/analytics/costs"},
  ];

  const kpiGroups = [
    {section:"Operations",  color:"#B07A2A", path:"/operations",  kpis:[
      {label:"WO Completion", value:compRate,              unit:"%", target:85},
      {label:"Total WOs",     value:wos.length,            unit:"",  target:null},
      {label:"Open",          value:d.work_orders?.open??0, unit:"", target:null},
      {label:"In Progress",   value:d.work_orders?.in_progress??0, unit:"", target:null},
    ]},
    {section:"Maintenance", color:"#A84A3D", path:"/maintenance",kpis:[
      {label:"Asset Uptime",  value:assetUp,              unit:"%", target:95},
      {label:"PM Compliance", value:pmCompliance,         unit:"%", target:90},
      {label:"Assets",        value:assets.length,        unit:"",  target:null},
      {label:"PM Overdue",    value:d.maintenance?.overdue??0, unit:"", target:0},
    ]},
    {section:"Finance",     color:"#547C4D", path:"/invoices",  kpis:[
      {label:"Collection Rate",value:collRate,            unit:"%", target:90},
      {label:"Revenue",        value:fmtEGP(totalRev),   unit:"",  target:null},
      {label:"Paid",           value:d.finance?.paid??0, unit:"",  target:null},
      {label:"Overdue",        value:d.finance?.overdue??0, unit:"", target:0},
    ]},
    {section:"Commercial",  color:"#8D7443", path:"/commercial",kpis:[
      {label:"Active Contracts",value:d.commercial?.active_contracts??0, unit:"", target:null},
      {label:"Open Leads",     value:d.commercial?.open_leads??0, unit:"", target:null},
      {label:"Expiring 30d",   value:d.commercial?.expiring_30d??0, unit:"", target:0},
      {label:"Pending Sign",   value:29,                 unit:"",  target:null},
    ]},
  ];

  if (!mounted) return null
  return (
    <div className="min-h-screen bg-base">
      {/* HERO */}
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1.5">Analytics</div>
              <h1 className="tb-hero-title">Analytics Hub</h1>
              <p className="tb-hero-description">Live KPIs, performance metrics, and business intelligence</p>
            </div>
            <div className={`tb-score-badge ${score>=95?"tb-score-badge--success":"tb-score-badge--warning"}`}>
              <div className="tb-score-value" style={{color:score>=95?"#547C4D":"#B07A2A"}}>{score}</div>
              <div className="tb-score-label">Platform Twin</div>
            </div>
          </div>
          {/* Sub-page nav */}
          <div className="tb-grid-4 mt-6">
            {subPages.map((s: any, i: number) =>(
              <button key={i} onClick={()=>router.push(s.path)}
                className="tb-hero-kpi text-left" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{fontSize:"1.25rem",marginBottom:6}}>{s.icon}</div>
                <div className="text-sm font-bold" style={{color:"#221D1A",marginBottom:3}}>{s.title}</div>
                <div style={{fontSize:"0.625rem",color:"rgba(148,163,184,0.5)"}}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {/* KPI sections */}
        <div className="tb-grid-2">
          {kpiGroups.map((group: any, gi: any) =>(
            <div key={gi} className="tb-section">
              <div className="tb-section-header">
                <div>
                  <div className="text-label-upper mb-1" style={{color:group.color}}>{group.section}</div>
                  <div className="tb-section-title" style={{marginBottom:0}}>{group.section} KPIs</div>
                </div>
                <button onClick={()=>router.push(group.path)} className="tb-section-link">View →</button>
              </div>
              <div className="tb-grid-2">
                {group.kpis.map((kpi: any, ki: any) =>{
                  const isGood = kpi.target===null?true:kpi.target===0?Number(kpi.value)===0:Number(kpi.value)>=kpi.target;
                  const kColor = kpi.target!==null?(isGood?"#547C4D":"#A84A3D"):"var(--color-text-1)";
                  return (
                    <div key={ki} className="bg-base-alt rounded-xl p-3">
                      <div className="text-xs text-tertiary mb-1.5">{kpi.label}</div>
                      <div className="text-xl font-black" style={{color:kColor}}>{kpi.value}{kpi.unit}</div>
                      {kpi.unit==="%"&&(
                        <div className="tb-progress tb-progress--sm mt-2">
                          <div className="tb-progress-bar" style={{background:kColor,width:`${Math.min(Number(kpi.value)||0,100)}%`}}/>
                        </div>
                      )}
                      {kpi.target!==null&&<div className="text-xs text-tertiary mt-1">Target: {kpi.target}{kpi.unit}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Twin domain matrix */}
        <div className="tb-section">
          <div className="tb-section-header">
            <div className="tb-section-title" style={{marginBottom:0}}>Digital Twin — All 8 Domains</div>
            <button onClick={()=>router.push("/executive/intelligence")} className="tb-section-link">Full report →</button>
          </div>
          <div className="tb-grid-8">
            {(twin?.operational_domains??[]).map((dom: any, i: any) =>{
              const hasIssue=(dom.overdue??0)>0||(dom.critical_open??0)>0||(dom.below_min??0)>0;
              const c=hasIssue?"#B07A2A":"#547C4D";
              return (
                <div key={i} className={`tb-domain-card ${hasIssue?"tb-domain-card--warn":"tb-domain-card--ok"} text-center`}>
                  <div className="text-xl font-black" style={{color:c}}>{dom.total??0}</div>
                  <div style={{fontSize:"0.5rem",fontWeight:700,color:c,marginTop:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>{dom.domain}</div>
                  <div style={{fontSize:"0.5rem",color:"rgba(148,163,184,0.5)",marginTop:2}}>{hasIssue?"⚠ Action":"✓ OK"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


export default function AnalyticsHub(props: any) {
  return (
    <FeatureGate feature="analytics">
      <AnalyticsHubInner {...props} />
    </FeatureGate>
  );
}
