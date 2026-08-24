"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function OperationsPage() {
  const router = useRouter();
  const { data: woRaw }   = useQuery(["ops-wos"],   () => authFetch("/api/v1/work-orders/").then(r => (r as any).data ?? r));
  const { data: techRaw } = useQuery(["ops-techs"], () => authFetch("/api/v1/technicians/").then(r => (r as any).data ?? r));
  const { data: srRaw }   = useQuery(["ops-srs"],   () => authFetch("/api/v1/service-requests/").then(r => (r as any).data ?? r));
  const wos = toArr(woRaw); const techs = toArr(techRaw); const srs = toArr(srRaw);
  const openWOs    = wos.filter((w: any) =>w.status==="open").length;
  const inProgWOs  = wos.filter((w: any) =>w.status==="in_progress").length;
  const criticalWOs= wos.filter((w: any) =>w.priority==="critical"&&w.status!=="completed").length;
  const openSRs    = srs.filter((s: any) =>s.status==="open").length;
  const modules = [
    {label:"Work Orders",      icon:"🔧", path:"/operations/work-orders",         count:wos.length,    color:"#5B7C8C"},
    {label:"Dispatch Board",   icon:"📋", path:"/operations/dispatch",             count:openWOs,       color:"#B07A2A"},
    {label:"Service Requests", icon:"🎫", path:"/operations/service-requests",     count:openSRs,       color:"#8D7443"},
    {label:"Technicians",      icon:"👷", path:"/operations/technicians",          count:techs.length,  color:"#547C4D"},
    {label:"Sites",            icon:"🏢", path:"/operations/sites",                count:null,          color:"#6D5F53"},
    {label:"Maintenance",      icon:"⚙️",  path:"/maintenance",                    count:null,          color:"#B07A2A"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Platform</div>
          <h1 className="tb-hero-title">Operations</h1>
          <p className="tb-hero-description">{wos.length} work orders · {techs.length} technicians · {openSRs} open requests</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Open WOs",value:openWOs,color:"#5B7C8C"},{label:"In Progress",value:inProgWOs,color:"#B07A2A"},{label:"Critical",value:criticalWOs,color:criticalWOs>0?"#A84A3D":"#547C4D"},{label:"Open SRs",value:openSRs,color:"#8D7443"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Operations Modules</div>
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
