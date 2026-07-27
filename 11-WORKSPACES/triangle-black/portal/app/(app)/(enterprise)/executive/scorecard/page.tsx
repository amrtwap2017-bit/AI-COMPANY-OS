"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
export default function ScorecardPage() {
  const router = useRouter();
  const { data: twin }   = useQuery(["sc2-twin"],  () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: woRaw }  = useQuery(["sc2-wos"],   () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: invRaw } = useQuery(["sc2-inv"],   () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: pmRaw }  = useQuery(["sc2-pms"],   () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const wos = toArr(woRaw); const inv = toArr(invRaw); const pms = toArr(pmRaw);
  const score = twin?.health_score||0;
  const now = new Date();
  const compRate  = wos.length>0?Math.round(wos.filter(w=>w.status==="completed").length/wos.length*100):0;
  const collRate  = inv.length>0?Math.round(inv.filter(i=>i.status==="paid").length/inv.length*100):0;
  const pmComp    = pms.length>0?Math.round((pms.length-pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)<now).length)/pms.length*100):100;
  const kpis = [
    {label:"Platform Twin Score",   value:score,     target:95,  color:"#34D399", unit:"/100",  path:"/executive"},
    {label:"WO Completion Rate",    value:compRate,  target:85,  color:"#60A5FA", unit:"%",     path:"/operations/work-orders"},
    {label:"Invoice Collection",    value:collRate,  target:90,  color:"#FBBF24", unit:"%",     path:"/invoices"},
    {label:"PM Plan Compliance",    value:pmComp,    target:90,  color:"#A78BFA", unit:"%",     path:"/maintenance/pm-plans"},
    {label:"Asset Uptime",          value:100,       target:95,  color:"#34D399", unit:"%",     path:"/maintenance/assets"},
    {label:"Critical WOs Open",     value:wos.filter(w=>w.priority==="critical"&&w.status!=="completed").length, target:0, color:"#F87171", unit:"",path:"/operations/work-orders"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #1A0A28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Executive</div>
          <h1 className="tb-hero-title">Executive Scorecard</h1>
          <p className="tb-hero-description">Key performance indicators vs targets</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Twin Score",value:score+"/100",color:score>=95?"#34D399":"#FBBF24"},{label:"On Target",value:kpis.filter(k=>k.value>=(k.target||0)&&k.label!=="Critical WOs Open"||k.value===0).length+"/"+kpis.length,color:"#34D399"},{label:"WO Rate",value:compRate+"%",color:compRate>=85?"#34D399":"#FBBF24"},{label:"Collection",value:collRate+"%",color:collRate>=90?"#34D399":"#FBBF24"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-grid-3">
          {kpis.map((kpi,i)=>{
            const isGood = kpi.label==="Critical WOs Open" ? kpi.value===0 : kpi.value>=kpi.target;
            const c = isGood ? kpi.color : "#F87171";
            return (
              <button key={i} onClick={()=>router.push(kpi.path)} className="tb-section text-left hover:border-brand transition-colors">
                <div className="text-xs text-tertiary mb-2">{kpi.label}</div>
                <div className="text-3xl font-black mb-1" style={{color:c}}>{kpi.value}{kpi.unit}</div>
                <div className="text-xs text-tertiary mb-3">Target: {kpi.target}{kpi.unit}</div>
                <div className="tb-progress"><div className="tb-progress-bar" style={{background:c,width:Math.min((kpi.value/Math.max(kpi.target,1))*100,100)+"%"}}/></div>
                <div className="text-xs mt-2" style={{color:isGood?"#34D399":"#F87171"}}>{isGood?"✓ On target":"↓ Below target"}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
