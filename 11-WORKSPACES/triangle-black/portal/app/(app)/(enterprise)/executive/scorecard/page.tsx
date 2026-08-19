"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
export default function ScorecardPage() {
  const router = useRouter();
  const { data: twin }   = useQuery(["sc2-twin"],  () => authFetch("/api/v1/twin/state").then(r => (r as any).data ?? r));
  const { data: woRaw }  = useQuery(["sc2-wos"],   () => authFetch("/api/v1/work-orders/").then(r => (r as any).data ?? r));
  const { data: invRaw } = useQuery(["sc2-inv"],   () => authFetch("/api/v1/invoices/").then(r => (r as any).data ?? r));
  const { data: pmRaw }  = useQuery(["sc2-pms"],   () => authFetch("/api/v1/maintenance/pm-plans/").then(r => (r as any).data ?? r));
  const wos = toArr(woRaw); const inv = toArr(invRaw); const pms = toArr(pmRaw);
  const score = twin?.health_score||0;
  const now = new Date();
  const compRate  = wos.length>0?Math.round(wos.filter((w: any) =>w.status==="completed").length/wos.length*100):0;
  const collRate  = inv.length>0?Math.round(inv.filter((i: any) =>i.status==="paid").length/inv.length*100):0;
  const pmComp    = pms.length>0?Math.round((pms.length-pms.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)<now).length)/pms.length*100):100;
  const kpis = [
    {label:"Platform Twin Score",   value:score,     target:95,  color:"#547C4D", unit:"/100",  path:"/executive"},
    {label:"WO Completion Rate",    value:compRate,  target:85,  color:"#5B7C8C", unit:"%",     path:"/operations/work-orders"},
    {label:"Invoice Collection",    value:collRate,  target:90,  color:"#B07A2A", unit:"%",     path:"/invoices"},
    {label:"PM Plan Compliance",    value:pmComp,    target:90,  color:"#8D7443", unit:"%",     path:"/maintenance/pm-plans"},
    {label:"Asset Uptime",          value:100,       target:95,  color:"#547C4D", unit:"%",     path:"/maintenance/assets"},
    {label:"Critical WOs Open",     value:wos.filter((w: any) =>w.priority==="critical"&&w.status!=="completed").length, target:0, color:"#A84A3D", unit:"",path:"/operations/work-orders"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Executive</div>
          <h1 className="tb-hero-title">Executive Scorecard</h1>
          <p className="tb-hero-description">Key performance indicators vs targets</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Twin Score",value:score+"/100",color:score>=95?"#547C4D":"#B07A2A"},{label:"On Target",value:kpis.filter((k: any) =>k.value>=(k.target||0)&&k.label!=="Critical WOs Open"||k.value===0).length+"/"+kpis.length,color:"#547C4D"},{label:"WO Rate",value:compRate+"%",color:compRate>=85?"#547C4D":"#B07A2A"},{label:"Collection",value:collRate+"%",color:collRate>=90?"#547C4D":"#B07A2A"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-grid-3">
          {kpis.map((kpi: any, i: any) =>{
            const isGood = kpi.label==="Critical WOs Open" ? kpi.value===0 : kpi.value>=kpi.target;
            const c = isGood ? kpi.color : "#A84A3D";
            return (
              <button key={i} onClick={()=>router.push(kpi.path)} className="tb-section text-left hover:border-brand transition-colors">
                <div className="text-xs text-tertiary mb-2">{kpi.label}</div>
                <div className="text-3xl font-black mb-1" style={{color:c}}>{kpi.value}{kpi.unit}</div>
                <div className="text-xs text-tertiary mb-3">Target: {kpi.target}{kpi.unit}</div>
                <div className="tb-progress"><div className="tb-progress-bar" style={{background:c,width:Math.min((kpi.value/Math.max(kpi.target,1))*100,100)+"%"}}/></div>
                <div className="text-xs mt-2" style={{color:isGood?"#547C4D":"#A84A3D"}}>{isGood?"✓ On target":"↓ Below target"}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
