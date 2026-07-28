"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function MaintenancePage() {
  const router = useRouter();
  const { data: assetRaw } = useQuery(["maint-assets"], () => authFetch("/api/v1/assets-portal").then(r=>r.json()));
  const { data: pmRaw }    = useQuery(["maint-pms"],    () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const { data: woRaw }    = useQuery(["maint-wos"],    () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const assets = toArr(assetRaw); const pms = toArr(pmRaw); const wos = toArr(woRaw);
  const now = new Date();
  const faulted   = assets.filter(a=>a.status==="In Fault").length;
  const overduePMs= pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)<now).length;
  const activeWOs = wos.filter(w=>w.status!=="completed"&&w.status!=="cancelled").length;
  const modules = [
    {label:"Assets",        icon:"⚙️",  path:"/maintenance/assets",     count:assets.length,   color:"#60A5FA"},
    {label:"Asset Tree",    icon:"🌳", path:"/maintenance/asset-tree",  count:null,            color:"#34D399"},
    {label:"PM Plans",      icon:"📅", path:"/maintenance/pm-plans",    count:pms.length,      color:"#A78BFA"},
    {label:"Work Orders",   icon:"🔧", path:"/operations/work-orders",  count:activeWOs,       color:"#FBBF24"},
    {label:"Dispatch",      icon:"📋", path:"/operations/dispatch",     count:null,            color:"#FB923C"},
    {label:"Technicians",   icon:"👷", path:"/operations/technicians",  count:null,            color:"#94A3B8"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1A1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Platform</div>
          <h1 className="tb-hero-title">Maintenance</h1>
          <p className="tb-hero-description">{assets.length} assets · {pms.length} PM plans · {faulted} faulted</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total Assets",value:assets.length,color:"#F1F5F9"},{label:"In Fault",value:faulted,color:faulted>0?"#F87171":"#34D399"},{label:"Overdue PMs",value:overduePMs,color:overduePMs>0?"#FBBF24":"#34D399"},{label:"Active WOs",value:activeWOs,color:activeWOs>0?"#60A5FA":"#34D399"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Maintenance Modules</div>
          <div className="tb-grid-3">
            {modules.map((m,i)=>(
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
