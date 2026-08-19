"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function MaintenanceIntelligencePage() {
  const router = useRouter();
  const { data: assetRaw } = useQuery(["mi-assets"], () => authFetch("/api/v1/assets/").then(r => r.data ?? r));
  const { data: woRaw }    = useQuery(["mi-wos"],    () => authFetch("/api/v1/work-orders/").then(r => r.data ?? r));
  const { data: pmRaw }    = useQuery(["mi-pms"],    () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.data ?? r));
  const assets = toArr(assetRaw); const wos = toArr(woRaw); const pms = toArr(pmRaw);
  const now = new Date();
  const faulted    = assets.filter((a: any) =>a.status==="In Fault");
  const overduePMs = pms.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)<now);
  const criticalWOs= wos.filter((w: any) =>w.priority==="critical"&&w.status!=="completed");
  const assetHealth  = assets.length>0?Math.round(assets.filter((a: any) =>a.status==="Operational").length/assets.length*100):100;
  const pmCompliance = pms.length>0?Math.round((pms.length-overduePMs.length)/pms.length*100):100;
  const compRate     = wos.length>0?Math.round(wos.filter((w: any) =>w.status==="completed").length/wos.length*100):0;
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #0E1A1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Maintenance · AI</div>
          <h1 className="tb-hero-title">Maintenance Intelligence</h1>
          <p className="tb-hero-description">AI-powered maintenance insights and health analysis</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Asset Health",value:assetHealth+"%",color:assetHealth>=95?"#547C4D":"#B07A2A"},{label:"PM Compliance",value:pmCompliance+"%",color:pmCompliance>=90?"#547C4D":"#B07A2A"},{label:"Faulted",value:faulted.length,color:faulted.length>0?"#A84A3D":"#547C4D"},{label:"Overdue PMs",value:overduePMs.length,color:overduePMs.length>0?"#B07A2A":"#547C4D"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-grid-3">
          {[{label:"Asset Health",value:assetHealth,color:"#547C4D",path:"/maintenance/assets"},{label:"PM Compliance",value:pmCompliance,color:"#8D7443",path:"/maintenance/pm-plans"},{label:"WO Completion",value:compRate,color:"#5B7C8C",path:"/operations/work-orders"}].map((k: any, i: number) =>(
            <button key={i} onClick={()=>router.push(k.path)} className="tb-section text-center hover:border-brand transition-colors">
              <div className="text-3xl font-black mb-2" style={{color:k.value>=80?k.color:"#A84A3D"}}>{k.value}%</div>
              <div className="text-xs text-secondary mb-2">{k.label}</div>
              <div className="tb-progress"><div className="tb-progress-bar" style={{background:k.value>=80?k.color:"#A84A3D",width:k.value+"%"}}/></div>
            </button>
          ))}
        </div>
        {(faulted.length>0||overduePMs.length>0||criticalWOs.length>0)&&(
          <div className="tb-section" style={{borderColor:"#A84A3D40",background:"#A84A3D08"}}>
            <div className="tb-section-title">Attention Required</div>
            <div className="space-y-2">
              {faulted.slice(0,3).map((a: any, i: number) =>(
                <button key={i} onClick={()=>router.push("/maintenance/assets/"+a.id)} className="tb-action-item w-full justify-between">
                  <div className="flex items-center gap-2"><span>⚙️</span><span className="text-sm text-secondary truncate">{a.name}</span></div>
                  <span className="tb-badge tb-badge--danger" style={{fontSize:"0.5rem"}}>FAULT</span>
                </button>
              ))}
              {overduePMs.slice(0,3).map((pm: any, i: any) =>(
                <button key={i} onClick={()=>router.push("/maintenance/pm-plans/"+pm.id)} className="tb-action-item w-full justify-between">
                  <div className="flex items-center gap-2"><span>📅</span><span className="text-sm text-secondary truncate">{pm.title}</span></div>
                  <span className="tb-badge tb-badge--warning" style={{fontSize:"0.5rem"}}>OVERDUE</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Navigate</div>
          <div className="tb-grid-4">
            {[{label:"Assets",icon:"⚙️",path:"/maintenance/assets"},{label:"PM Plans",icon:"📅",path:"/maintenance/pm-plans"},{label:"Asset Tree",icon:"🌳",path:"/maintenance/asset-tree"},{label:"Work Orders",icon:"🔧",path:"/operations/work-orders"}].map((a: any, i: number) =>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item justify-center py-4 flex-col gap-1.5 text-center">
                <span className="text-xl">{a.icon}</span><span className="text-xs font-medium text-secondary">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
