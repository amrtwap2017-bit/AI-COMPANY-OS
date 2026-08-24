"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function MaintenancePage() {
  const router = useRouter();
  const { data: assetRaw } = useQuery(["maint-assets"], () => authFetch("/api/v1/assets/").then(r => (r as any).data ?? r));
  const { data: pmRaw }    = useQuery(["maint-pms"],    () => authFetch("/api/v1/maintenance/pm-plans/").then(r => (r as any).data ?? r));
  const { data: woRaw }    = useQuery(["maint-wos"],    () => authFetch("/api/v1/work-orders/").then(r => (r as any).data ?? r));
  const assets = toArr(assetRaw); const pms = toArr(pmRaw); const wos = toArr(woRaw);
  const now = new Date();
  const faulted   = assets.filter((a: any) =>a.status==="In Fault").length;
  const overduePMs= pms.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)<now).length;
  const activeWOs = wos.filter((w: any) =>w.status!=="completed"&&w.status!=="cancelled").length;
  const modules = [
    {label:"Assets",        icon:"⚙️",  path:"/maintenance/assets",     count:assets.length,   color:"#5B7C8C"},
    {label:"Asset Tree",    icon:"🌳", path:"/maintenance/asset-tree",  count:null,            color:"#547C4D"},
    {label:"PM Plans",      icon:"📅", path:"/maintenance/pm-plans",    count:pms.length,      color:"#8D7443"},
    {label:"Work Orders",   icon:"🔧", path:"/operations/work-orders",  count:activeWOs,       color:"#B07A2A"},
    {label:"Dispatch",      icon:"📋", path:"/operations/dispatch",     count:null,            color:"#B07A2A"},
    {label:"Technicians",   icon:"👷", path:"/operations/technicians",  count:null,            color:"#6D5F53"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #0E1A1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Platform</div>
          <h1 className="tb-hero-title">Maintenance</h1>
          <p className="tb-hero-description">{assets.length} assets · {pms.length} PM plans · {faulted} faulted</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total Assets",value:assets.length,color:"#221D1A"},{label:"In Fault",value:faulted,color:faulted>0?"#A84A3D":"#547C4D"},{label:"Overdue PMs",value:overduePMs,color:overduePMs>0?"#B07A2A":"#547C4D"},{label:"Active WOs",value:activeWOs,color:activeWOs>0?"#5B7C8C":"#547C4D"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Maintenance Modules</div>
          <div className="tb-grid-3">
            {modules.map((m: any, i: number) =>(
              <button key={i} onClick={()=>router.push(m.path)} className="tb-section text-left hover:border-brand transition-colors">
                <div className="flex items-center justify-between mb-3"><span style={{fontSize:"1.75rem"}}>{m.icon}</span>{m.count!==null&&<span className="text-2xl font-black" style={{color:m.color}}>{m.count}</span>}</div>
                <div className="text-sm font-bold text-primary">{m.label}</div><div className="text-xs text-brand mt-2">View →</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
