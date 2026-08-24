"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
export default function ScheduleReviewPage() {
  const router = useRouter();
  const { data: pmRaw } = useQuery(["sr2-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r => (r as any).data ?? r));
  const { data: woRaw } = useQuery(["sr2-wos"], () => authFetch("/api/v1/work-orders/").then(r => (r as any).data ?? r));
  const pms = toArr(pmRaw); const wos = toArr(woRaw);
  const now = new Date();
  const next7  = new Date(now.getTime() +7*86400000);
  const next30 = new Date(now.getTime() +30*86400000);
  const overdue   = pms.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)<now);
  const dueWeek   = pms.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)>=now&&new Date(p.next_due_ts)<=next7);
  const dueMonth  = pms.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)>next7&&new Date(p.next_due_ts)<=next30);
  const wosDue    = wos.filter((w: any) =>w.due_date&&new Date(w.due_date)>=now&&new Date(w.due_date)<=next7&&w.status!=="completed");
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #0E1A1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Maintenance · Schedule</div>
          <h1 className="tb-hero-title">Schedule Review</h1>
          <p className="tb-hero-description">Upcoming maintenance and work order schedule</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Overdue PMs",value:overdue.length,color:overdue.length>0?"#A84A3D":"#547C4D"},{label:"Due This Week",value:dueWeek.length,color:dueWeek.length>0?"#B07A2A":"#547C4D"},{label:"Due This Month",value:dueMonth.length,color:"#5B7C8C"},{label:"WOs Due Soon",value:wosDue.length,color:wosDue.length>0?"#B07A2A":"#547C4D"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        {overdue.length>0&&(
          <div className="tb-section" style={{borderColor:"#A84A3D40",background:"#A84A3D08"}}>
            <div className="flex items-center gap-2"><span>⚠️</span><span className="text-sm font-semibold text-red-400">{overdue.length} PM plan{overdue.length>1?"s":""} overdue</span><button onClick={()=>router.push("/maintenance/pm-plans")} className="tb-section-link ml-auto">View →</button></div>
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="tb-section">
            <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Due This Week ({dueWeek.length})</div><button onClick={()=>router.push("/maintenance/pm-plans")} className="tb-section-link">All →</button></div>
            <div className="space-y-2 mt-3">
              {dueWeek.length===0 ? <div className="tb-empty" style={{padding:"16px 0"}}><div className="tb-empty-icon" style={{fontSize:"1.5rem"}}>✅</div><div className="tb-empty-desc">No PMs due this week</div></div>
              : dueWeek.map((pm: any, i: any) =>{
                const days=Math.ceil((new Date(pm.next_due_ts).getTime() -now)/86400000);
                return (
                  <button key={i} onClick={()=>router.push("/maintenance/pm-plans/"+pm.id)} className="tb-action-item w-full justify-between">
                    <div className="flex items-center gap-2 min-w-0"><span>📅</span><span className="text-sm text-secondary truncate">{pm.title||"—"}</span></div>
                    <span className="text-xs flex-shrink-0" style={{color:"#B07A2A"}}>in {days}d</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="tb-section">
            <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>WOs Due Soon ({wosDue.length})</div><button onClick={()=>router.push("/operations/work-orders")} className="tb-section-link">All →</button></div>
            <div className="space-y-2 mt-3">
              {wosDue.length===0 ? <div className="tb-empty" style={{padding:"16px 0"}}><div className="tb-empty-icon" style={{fontSize:"1.5rem"}}>✅</div><div className="tb-empty-desc">No WOs due this week</div></div>
              : wosDue.map((wo: any, i: any) =>{
                const days=Math.ceil((new Date(wo.due_date).getTime() -now)/86400000);
                const pc={critical:"#A84A3D",high:"#B07A2A",medium:"#B07A2A",low:"#6D5F53"}[wo.priority]||"#6D5F53";
                return (
                  <button key={i} onClick={()=>router.push("/operations/work-orders/"+wo.id)} className="tb-action-item w-full justify-between">
                    <div className="flex items-center gap-2 min-w-0"><div className="tb-priority-bar" style={{background:pc}}/><span className="text-sm text-secondary truncate">{wo.title||"—"}</span></div>
                    <span className="text-xs flex-shrink-0" style={{color:pc}}>in {days}d</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-3">Due This Month ({dueMonth.length})</div>
          <div className="space-y-2">
            {dueMonth.slice(0,5).map((pm: any, i: any) =>{
              const days=Math.ceil((new Date(pm.next_due_ts).getTime() -now)/86400000);
              return (
                <button key={i} onClick={()=>router.push("/maintenance/pm-plans/"+pm.id)} className="tb-action-item w-full justify-between">
                  <div className="flex items-center gap-2 min-w-0"><span>📅</span><span className="text-sm text-secondary truncate">{pm.title||"—"}</span></div>
                  <span className="text-xs text-tertiary flex-shrink-0">in {days}d — {fmtDate(pm.next_due_ts)}</span>
                </button>
              );
            })}
            {dueMonth.length===0&&<div className="text-xs text-tertiary text-center py-4">No PMs due this month</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
