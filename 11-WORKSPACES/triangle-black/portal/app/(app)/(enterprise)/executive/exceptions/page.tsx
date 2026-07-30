"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
export default function ExceptionsPage() {
  const router = useRouter();
  const { data: woRaw }   = useQuery(["exc-wos"],   () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: contRaw } = useQuery(["exc-conts"], () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const { data: pmRaw }   = useQuery(["exc-pms"],   () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const { data: notifRaw }= useQuery(["exc-notifs"],() => authFetch("/api/v1/notifications-portal?limit=100").then(r=>r.json()));
  const wos = toArr(woRaw); const contracts = toArr(contRaw);
  const pms = toArr(pmRaw); const notifs = toArr(notifRaw);
  const now = new Date();
  const criticalWOs  = wos.filter(w=>w.priority==="critical"&&w.status!=="completed");
  const overdueWOs   = wos.filter(w=>w.due_date&&new Date(w.due_date)<now&&w.status!=="completed");
  const expiringCts  = contracts.filter(c=>c.status==="active"&&c.end_date&&new Date(c.end_date)<=new Date(now.getTime()+30*86400000));
  const overduePMs   = pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)<now);
  const criticalNotifs = notifs.filter(n=>!n.is_read&&(n.type==="contract_expiring"||n.type==="asset_fault"||n.type==="pm_overdue"));
  const totalExceptions = criticalWOs.length+overdueWOs.length+expiringCts.length+overduePMs.length;
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #1A0505 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-red-400 mb-1.5">Executive · Attention</div>
          <h1 className="tb-hero-title">Exceptions</h1>
          <p className="tb-hero-description">{totalExceptions} items requiring immediate attention</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Critical WOs",value:criticalWOs.length,color:criticalWOs.length>0?"#A84A3D":"#547C4D"},{label:"Overdue WOs",value:overdueWOs.length,color:overdueWOs.length>0?"#B07A2A":"#547C4D"},{label:"Expiring Contracts",value:expiringCts.length,color:expiringCts.length>0?"#B07A2A":"#547C4D"},{label:"Overdue PMs",value:overduePMs.length,color:overduePMs.length>0?"#A84A3D":"#547C4D"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        {totalExceptions===0 && (
          <div className="tb-section" style={{borderColor:"#547C4D40",background:"#547C4D08"}}>
            <div className="flex items-center gap-3"><span style={{fontSize:"1.5rem"}}>✅</span><span className="text-sm font-semibold text-emerald-400">No exceptions — all systems normal</span></div>
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {criticalWOs.length>0 && (
            <div className="tb-section" style={{borderColor:"#A84A3D40"}}>
              <div className="tb-section-header"><div className="text-label-upper text-red-400 mb-0">Critical</div><button onClick={()=>router.push("/operations/work-orders")} className="tb-section-link">All WOs →</button></div>
              <div className="space-y-2 mt-3">
                {criticalWOs.slice(0,5).map((wo,i)=>(
                  <button key={i} onClick={()=>router.push("/operations/work-orders/"+wo.id)} className="tb-action-item w-full justify-between">
                    <div className="flex items-center gap-2 min-w-0"><div className="tb-priority-bar" style={{background:"#A84A3D"}}/><span className="text-sm text-secondary truncate">{wo.title||"—"}</span></div>
                    <span className="tb-badge tb-badge--danger" style={{fontSize:"0.5rem"}}>CRITICAL</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {overdueWOs.length>0 && (
            <div className="tb-section" style={{borderColor:"#B07A2A40"}}>
              <div className="tb-section-header"><div className="text-label-upper" style={{color:"#B07A2A",marginBottom:0}}>Overdue WOs</div><button onClick={()=>router.push("/analytics/sla")} className="tb-section-link">SLA →</button></div>
              <div className="space-y-2 mt-3">
                {overdueWOs.slice(0,5).map((wo,i)=>{
                  const days=Math.floor((now-new Date(wo.due_date))/86400000);
                  return (
                    <button key={i} onClick={()=>router.push("/operations/work-orders/"+wo.id)} className="tb-action-item w-full justify-between">
                      <div className="text-sm text-secondary truncate">{wo.title||"—"}</div>
                      <span className="text-xs font-black text-red-400 flex-shrink-0">{days}d overdue</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {expiringCts.length>0 && (
            <div className="tb-section" style={{borderColor:"#B07A2A40"}}>
              <div className="tb-section-header"><div className="text-label-upper" style={{color:"#B07A2A",marginBottom:0}}>Expiring Contracts</div><button onClick={()=>router.push("/commercial/contracts")} className="tb-section-link">Contracts →</button></div>
              <div className="space-y-2 mt-3">
                {expiringCts.map((c,i)=>{
                  const days=Math.ceil((new Date(c.end_date)-now)/86400000);
                  return (
                    <button key={i} onClick={()=>router.push("/commercial/contracts/"+c.id)} className="tb-action-item w-full justify-between">
                      <div className="text-sm text-secondary truncate">{c.title||c.id?.slice(0,20)}</div>
                      <span className="tb-badge tb-badge--warning" style={{fontSize:"0.5rem"}}>{days}d left</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {overduePMs.length>0 && (
            <div className="tb-section" style={{borderColor:"#A84A3D40"}}>
              <div className="tb-section-header"><div className="text-label-upper text-red-400 mb-0">Overdue PM Plans</div><button onClick={()=>router.push("/maintenance/pm-plans")} className="tb-section-link">PM Plans →</button></div>
              <div className="space-y-2 mt-3">
                {overduePMs.slice(0,5).map((pm,i)=>{
                  const days=Math.floor((now-new Date(pm.next_due_ts))/86400000);
                  return (
                    <button key={i} onClick={()=>router.push("/maintenance/pm-plans/"+pm.id)} className="tb-action-item w-full justify-between">
                      <div className="text-sm text-secondary truncate">{pm.title||"—"}</div>
                      <span className="text-xs font-black text-red-400 flex-shrink-0">{days}d overdue</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
