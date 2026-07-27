"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;

export default function AnalyticsHub() {
  const router = useRouter();
  const { data: dash }        = useQuery(["an-dash"],   () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()), {refetchInterval:60000});
  const { data: twin }        = useQuery(["an-twin"],   () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: woRaw }       = useQuery(["an-wos"],    () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: invRaw }      = useQuery(["an-inv"],    () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: assetRaw }    = useQuery(["an-assets"], () => authFetch("/api/v1/assets/").then(r=>r.json()));

  const wos=toArr(woRaw); const invoices=toArr(invRaw); const assets=toArr(assetRaw);
  const d=dash||{}; const score=twin?.health_score??0;

  const compRate   = wos.length>0?Math.round(wos.filter(w=>w.status==="completed").length/wos.length*100):0;
  const collRate   = invoices.length>0?Math.round(invoices.filter(i=>i.status==="paid").length/invoices.length*100):0;
  const assetUp    = assets.length>0?Math.round(assets.filter(a=>a.status==="Operational").length/assets.length*100):100;
  const pmCompliance = (d.maintenance?.pm_plans||0)>0?Math.round(((d.maintenance?.pm_plans||0)-(d.maintenance?.overdue||0))/(d.maintenance?.pm_plans||1)*100):100;
  const totalRev   = invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);

  const kpiGroups = [
    {
      section:"Operations", color:"#F97316", path:"/operations",
      kpis:[
        {label:"Total WOs",     value:wos.length,          unit:"",  target:null},
        {label:"Open",          value:d.work_orders?.open??0, unit:"", target:null},
        {label:"Completion",    value:compRate,             unit:"%", target:85},
        {label:"In Progress",   value:d.work_orders?.in_progress??0, unit:"", target:null},
      ]
    },
    {
      section:"Maintenance", color:"#EF4444", path:"/maintenance",
      kpis:[
        {label:"Assets",        value:assets.length,        unit:"",  target:null},
        {label:"Uptime",        value:assetUp,              unit:"%", target:95},
        {label:"PM Compliance", value:pmCompliance,         unit:"%", target:90},
        {label:"PM Overdue",    value:d.maintenance?.overdue??0, unit:"", target:0},
      ]
    },
    {
      section:"Finance", color:"#10B981", path:"/invoices",
      kpis:[
        {label:"Revenue",       value:fmtEGP(totalRev),    unit:"",  target:null},
        {label:"Collection",    value:collRate,             unit:"%", target:90},
        {label:"Paid",          value:d.finance?.paid??0,  unit:"",  target:null},
        {label:"Overdue",       value:d.finance?.overdue??0, unit:"", target:0},
      ]
    },
    {
      section:"Commercial", color:"#8B5CF6", path:"/commercial",
      kpis:[
        {label:"Contracts",     value:d.commercial?.active_contracts??0, unit:"", target:null},
        {label:"Open Leads",    value:d.commercial?.open_leads??0,       unit:"", target:null},
        {label:"Expiring",      value:d.commercial?.expiring_30d??0,     unit:"", target:0},
        {label:"Pending Sign",  value:29,                                unit:"", target:null},
      ]
    },
  ];

  const subPages = [
    {title:"Scorecards",    icon:"🏆", desc:"KPI vs targets",        path:"/analytics/scorecards"},
    {title:"SLA Reports",   icon:"⏱️", desc:"Response time",         path:"/analytics/sla"},
    {title:"Trends",        icon:"📈", desc:"Performance over time",  path:"/analytics/trends"},
    {title:"Cost Analysis", icon:"💵", desc:"Revenue & spend",        path:"/analytics/costs"},
  ];

  return (
    <div className="min-h-screen" className="bg-base">

      {/* DARK HEADER */}
      <div style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1B30 60%, #0F172A 100%)",borderBottom:"1px solid rgba(255,255,255,0.06)"}} className="px-8 py-7">
        <div className="max-w-content mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <div style={{fontSize:"0.6875rem",fontWeight:700,color:"#22D3EE",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Analytics</div>
              <h1 className="text-page-title" style={{color:"#F1F5F9"}}>Analytics Hub</h1>
              <p style={{color:"rgba(148,163,184,0.6)",fontSize:"0.8125rem",marginTop:5}}>Live KPIs, performance metrics, and business intelligence</p>
            </div>
            <div style={{background:score>=95?"rgba(16,185,129,0.08)":"rgba(245,158,11,0.08)",border:`1px solid ${score>=95?"rgba(16,185,129,0.25)":"rgba(245,158,11,0.25)"}`,borderRadius:14,padding:"14px 22px",textAlign:"center"}}>
              <div style={{fontSize:"2rem",fontWeight:900,lineHeight:1,color:score>=95?"#34D399":"#FCD34D"}}>{score}</div>
              <div style={{fontSize:"0.625rem",color:"rgba(148,163,184,0.6)",marginTop:3,textTransform:"uppercase",letterSpacing:"0.06em"}}>Platform Twin</div>
            </div>
          </div>

          {/* Sub-page nav */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {subPages.map((s,i)=>(
              <button key={i} onClick={()=>router.push(s.path)}
                style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"14px 16px",textAlign:"left",cursor:"pointer",transition:"all 150ms ease"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}}>
                <div style={{fontSize:"1.25rem",marginBottom:8}}>{s.icon}</div>
                <div style={{fontSize:"0.8125rem",fontWeight:700,color:"#F1F5F9",marginBottom:3}}>{s.title}</div>
                <div style={{fontSize:"0.625rem",color:"rgba(148,163,184,0.5)"}}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-content mx-auto px-8 py-8 space-y-5">

        {/* KPI Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {kpiGroups.map((group,gi)=>(
            <div key={gi} className="tb-section">
              <div className="flex items-center justify-between" style={{marginBottom:20}}>
                <div>
                  <div style={{fontSize:"0.625rem",fontWeight:700,color:group.color,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{group.section}</div>
                  <div className="tb-empty-title">{group.section} KPIs</div>
                </div>
                <button onClick={()=>router.push(group.path)} className="tb-section-link">View →</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {group.kpis.map((kpi,ki)=>{
                  const isGood = kpi.target===null?true:kpi.target===0?Number(kpi.value)===0:Number(kpi.value)>=kpi.target;
                  const kColor = kpi.target!==null?(isGood?"#34D399":"#F87171"):"var(--color-text-1)";
                  const showBar = kpi.unit==="%";
                  return (
                    <div key={ki} style={{background:"var(--color-bg-alt)",borderRadius:12,padding:"14px"}}>
                      <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginBottom:6}}>{kpi.label}</div>
                      <div style={{fontSize:"1.5rem",fontWeight:900,color:kColor,lineHeight:1}}>{kpi.value}{kpi.unit}</div>
                      {showBar && (
                        <div style={{marginTop:8,height:3,background:"rgba(0,0,0,0.1)",borderRadius:99,overflow:"hidden"}}>
                          <div style={{height:3,background:kColor,borderRadius:99,width:`${Math.min(Number(kpi.value)||0,100)}%`,transition:"width 600ms ease"}}/>
                        </div>
                      )}
                      {kpi.target!==null && <div style={{fontSize:"0.5625rem",color:"var(--color-text-3)",marginTop:4}}>Target: {kpi.target}{kpi.unit}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Twin domain matrix */}
        <div className="tb-section">
          <div className="flex items-center justify-between" style={{marginBottom:20}}>
            <div>
              <div style={{fontSize:"0.625rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Digital Twin</div>
              <div className="tb-empty-title">All 8 Operational Domains</div>
            </div>
            <button onClick={()=>router.push("/executive/intelligence")} className="tb-section-link">Full report →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            {(twin?.operational_domains??[]).map((dom,i)=>{
              const h=(dom.overdue??0)>0||(dom.critical_open??0)>0||(dom.below_min??0)>0;
              const c=h?"#FBBF24":"#34D399";
              return (
                <div key={i} style={{background:h?"rgba(245,158,11,0.06)":"rgba(16,185,129,0.06)",border:`1px solid ${h?"rgba(245,158,11,0.2)":"rgba(16,185,129,0.2)"}`,borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                  <div style={{fontSize:"1.5rem",fontWeight:900,color:c,lineHeight:1}}>{dom.total??0}</div>
                  <div style={{fontSize:"0.5625rem",fontWeight:600,color:c,marginTop:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>{dom.domain}</div>
                  <div style={{fontSize:"0.5rem",color:"rgba(148,163,184,0.5)",marginTop:3}}>{h?"⚠ Action":"✓ OK"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
