"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function NewWorkOrderPage() {
  const router = useRouter();
  const { data: techRaw }  = useQuery(["nwo-techs"],  () => authFetch("/api/v1/technicians/").then(r=>r.json()));
  const { data: assetRaw } = useQuery(["nwo-assets"], () => authFetch("/api/v1/assets/").then(r=>r.json()));
  const { data: srRaw }    = useQuery(["nwo-srs"],    () => authFetch("/api/v1/service-requests/").then(r=>r.json()));
  const techs = toArr(techRaw); const assets = toArr(assetRaw); const srs = toArr(srRaw);
  const unlinkedSRs = srs.filter((s: any) =>!s.work_order_id&&s.status==="open");
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Operations</div>
          <h1 className="tb-hero-title">New Work Order</h1>
          <p className="tb-hero-description">{techs.length} technicians · {assets.length} assets · {unlinkedSRs.length} unlinked service requests</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Technicians",value:techs.length,color:"#547C4D"},{label:"Assets",value:assets.length,color:"#5B7C8C"},{label:"Open SRs",value:unlinkedSRs.length,color:unlinkedSRs.length>0?"#B07A2A":"#547C4D"},{label:"Ready",value:"Yes",color:"#547C4D"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section" style={{borderColor:"#5B7C8C40",background:"#5B7C8C08"}}>
          <div className="flex items-center gap-3 flex-wrap">
            <span style={{fontSize:"1.25rem"}}>💡</span>
            <div className="flex-1"><div className="text-sm font-semibold text-primary">Work Order Creation</div><div className="text-xs text-tertiary">Navigate to Work Orders to create a new WO</div></div>
            <button onClick={()=>router.push("/operations/work-orders")} className="tb-btn-primary" style={{fontSize:"0.875rem",padding:"8px 16px"}}>Go to Work Orders →</button>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="tb-section">
            <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Unlinked Service Requests ({unlinkedSRs.length})</div><button onClick={()=>router.push("/operations/service-requests")} className="tb-section-link">All →</button></div>
            <div className="space-y-2 mt-3">
              {unlinkedSRs.slice(0,5).map((sr: any, i: any) =>{
                const pc={critical:"#A84A3D",high:"#B07A2A",medium:"#B07A2A",low:"#6D5F53"}[sr.priority]||"#6D5F53";
                return (
                  <button key={i} onClick={()=>router.push("/operations/service-requests/"+sr.id)} className="tb-action-item w-full justify-between">
                    <div className="flex items-center gap-2 min-w-0"><div className="tb-priority-bar" style={{background:pc}}/><span className="text-sm text-secondary truncate">{sr.title||"—"}</span></div>
                    <span className="tb-badge" style={{background:pc+"18",color:pc,border:"1px solid "+pc+"30",fontSize:"0.5rem"}}>{sr.priority}</span>
                  </button>
                );
              })}
              {unlinkedSRs.length===0&&<div className="text-xs text-tertiary text-center py-4">All service requests are linked</div>}
            </div>
          </div>
          <div className="tb-section">
            <div className="tb-section-title">Available Technicians</div>
            <div className="space-y-2">
              {techs.slice(0,5).map((tech: any, i: any) =>(
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-base-alt">
                  <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-xs font-black text-secondary">{(tech.name||"?").charAt(0)}</div>
                  <div><div className="text-sm text-primary">{tech.name}</div><div className="text-xs text-tertiary">{tech.specialization||"—"}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
