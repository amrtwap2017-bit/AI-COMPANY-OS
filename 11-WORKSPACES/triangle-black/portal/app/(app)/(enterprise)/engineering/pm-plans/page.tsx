"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
export default function EngineeringPMPlansPage() {
  const router = useRouter();
  const { data: pmRaw }    = useQuery(["epmp-pms"],    () => authFetch("/api/v1/maintenance/pm-plans/").then(r => (r as any).data ?? r));
  const { data: assetRaw } = useQuery(["epmp-assets"], () => authFetch("/api/v1/assets/").then(r => (r as any).data ?? r));
  const pms = toArr(pmRaw); const assets = toArr(assetRaw);
  const now = new Date();
  const overdue = pms.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)<now);
  const dueWeek = pms.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)>=now&&new Date(p.next_due_ts)<=new Date(now.getTime()+7*86400000));
  const onTrack = pms.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)>new Date(now.getTime()+7*86400000));
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #0E1A1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Engineering</div>
          <h1 className="tb-hero-title">PM Plans</h1>
          <p className="tb-hero-description">{pms.length} plans · {overdue.length} overdue · {dueWeek.length} due this week</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total Plans",value:pms.length,color:"#221D1A"},{label:"Overdue",value:overdue.length,color:overdue.length>0?"#A84A3D":"#547C4D"},{label:"Due This Week",value:dueWeek.length,color:dueWeek.length>0?"#B07A2A":"#547C4D"},{label:"On Track",value:onTrack.length,color:"#547C4D"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-flex-between mb-4"><div className="text-sm text-secondary">{pms.length} plans</div><button onClick={()=>router.push("/maintenance/pm-plans")} className="tb-section-link">Full View →</button></div>
          <div className="space-y-2">
            {pms.slice(0,8).map((pm: any, i: any) =>{
              const due = pm.next_due_ts?new Date(pm.next_due_ts):null;
              const isOverdue = due&&due<now;
              const daysUntil = due?Math.ceil((due-now)/86400000):null;
              const c = isOverdue?"#A84A3D":daysUntil!==null&&daysUntil<=7?"#B07A2A":"#547C4D";
              return (
                <button key={i} onClick={()=>router.push("/maintenance/pm-plans/"+pm.id)} className="tb-action-item w-full justify-between">
                  <div className="flex items-center gap-2 min-w-0"><span style={{fontSize:"1rem"}}>📅</span><div className="min-w-0"><div className="text-sm text-secondary truncate">{pm.title||"—"}</div><div className="text-xs text-tertiary">{pm.plan_type||"—"}</div></div></div>
                  <div className="flex-shrink-0 text-right"><div className="text-xs font-bold" style={{color:c}}>{isOverdue?"OVERDUE":daysUntil!==null?daysUntil+"d":"—"}</div><div className="text-xs text-tertiary">{fmtDate(pm.next_due_ts)}</div></div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-3">Navigate</div>
          <div className="tb-grid-3">
            {[{label:"PM Plans Full",icon:"📅",path:"/maintenance/pm-plans"},{label:"Assets",icon:"⚙️",path:"/maintenance/assets"},{label:"Work Orders",icon:"🔧",path:"/operations/work-orders"}].map((a: any, i: number) =>(
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
