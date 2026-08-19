"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr  = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate= (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function ExceptionsPage() {
  const router = useRouter();
  const { data: woRaw }    = useQuery(["exc-wos"],   ()=>authFetch("/api/v1/work-orders/").then(r => (r as any).data ?? r));
  const { data: contRaw }  = useQuery(["exc-conts"], ()=>authFetch("/api/v1/contracts/").then(r => (r as any).data ?? r));
  const { data: pmRaw }    = useQuery(["exc-pms"],   ()=>authFetch("/api/v1/maintenance/pm-plans/").then(r => (r as any).data ?? r));
  const { data: notifRaw } = useQuery(["exc-notifs"],()=>authFetch("/api/v1/notifications-portal?limit=100").then(r => (r as any).data ?? r));

  const wos       = toArr(woRaw);
  const contracts = toArr(contRaw);
  const pms       = toArr(pmRaw);
  const notifs    = toArr(notifRaw);
  const now       = new Date();

  const criticalWOs  = wos.filter((w: any) =>w.priority==="critical"&&w.status!=="completed");
  const overdueWOs   = wos.filter((w: any) =>w.due_date&&new Date(w.due_date)<now&&w.status!=="completed");
  const expiringCts  = contracts.filter((c: any) =>c.status==="active"&&c.end_date&&new Date(c.end_date)<=new Date(now.getTime() +30*86400000));
  const overduePMs   = pms.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)<now);
  const totalExceptions = criticalWOs.length+overdueWOs.length+expiringCts.length+overduePMs.length;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="text-label-upper text-danger mb-1.5">Executive · Attention</div>
          <h1 className="tb-hero-title">Exceptions</h1>
          <p className="tb-hero-description">{totalExceptions} items requiring immediate attention</p>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Critical WOs",       value:criticalWOs.length,  color:criticalWOs.length>0?"var(--color-danger)":"var(--color-success)"},
              {label:"Overdue WOs",         value:overdueWOs.length,   color:overdueWOs.length>0?"var(--color-warning)":"var(--color-success)"},
              {label:"Expiring Contracts",  value:expiringCts.length,  color:expiringCts.length>0?"var(--color-warning)":"var(--color-success)"},
              {label:"Overdue PMs",         value:overduePMs.length,   color:overduePMs.length>0?"var(--color-danger)":"var(--color-success)"},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {totalExceptions===0 && (
          <div className="tb-alert tb-alert-success mb-4">
            <span className="text-xl">✅</span>
            <span className="text-sm font-semibold">No exceptions — all systems normal</span>
          </div>
        )}

        <div className="tb-grid-2">
          {criticalWOs.length>0 && (
            <div className="tb-section" style={{borderColor:"var(--color-danger-border)"}}>
              <div className="flex justify-between items-center mb-3">
                <div className="text-label-upper text-danger">Critical Work Orders</div>
                <button onClick={()=>router.push("/operations/work-orders")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">All WOs →</button>
              </div>
              <div className="flex flex-col gap-2">
                {criticalWOs.slice(0,5).map((wo: any, i: any) =>(
                  <button key={i} onClick={()=>router.push("/operations/work-orders/"+wo.id)} className="tb-action-item w-full justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1 h-4 rounded-full flex-shrink-0 bg-danger"/>
                      <span className="text-sm text-secondary truncate">{wo.title||"—"}</span>
                    </div>
                    <span className="tb-badge tb-badge-danger" style={{fontSize:"0.5rem"}}>CRITICAL</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {overdueWOs.length>0 && (
            <div className="tb-section" style={{borderColor:"var(--color-warning-border)"}}>
              <div className="flex justify-between items-center mb-3">
                <div className="text-label-upper text-warning">Overdue Work Orders</div>
                <button onClick={()=>router.push("/analytics/sla")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">SLA →</button>
              </div>
              <div className="flex flex-col gap-2">
                {overdueWOs.slice(0,5).map((wo: any, i: any) =>{
                  const days=Math.floor((now.getTime() - new Date(wo.due_date).getTime())/86400000);
                  return (
                    <button key={i} onClick={()=>router.push("/operations/work-orders/"+wo.id)} className="tb-action-item w-full justify-between">
                      <div className="text-sm text-secondary truncate">{wo.title||"—"}</div>
                      <span className="text-xs font-black text-danger flex-shrink-0">{days}d overdue</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {expiringCts.length>0 && (
            <div className="tb-section" style={{borderColor:"var(--color-warning-border)"}}>
              <div className="flex justify-between items-center mb-3">
                <div className="text-label-upper text-warning">Expiring Contracts</div>
                <button onClick={()=>router.push("/commercial/contracts")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">Contracts →</button>
              </div>
              <div className="flex flex-col gap-2">
                {expiringCts.map((c: any, i: number) =>{
                  const days=Math.ceil((new Date(c.end_date).getTime() -now)/86400000);
                  return (
                    <button key={i} onClick={()=>router.push("/commercial/contracts/"+c.id)} className="tb-action-item w-full justify-between">
                      <div className="text-sm text-secondary truncate">{c.title||c.id?.slice(0,20)}</div>
                      <span className="tb-badge tb-badge-warning" style={{fontSize:"0.5rem"}}>{days}d left</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {overduePMs.length>0 && (
            <div className="tb-section" style={{borderColor:"var(--color-danger-border)"}}>
              <div className="flex justify-between items-center mb-3">
                <div className="text-label-upper text-danger">Overdue PM Plans</div>
                <button onClick={()=>router.push("/maintenance/pm-plans")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">PM Plans →</button>
              </div>
              <div className="flex flex-col gap-2">
                {overduePMs.slice(0,5).map((pm: any, i: any) =>{
                  const days=Math.floor((now.getTime() - new Date(pm.next_due_ts).getTime())/86400000);
                  return (
                    <button key={i} onClick={()=>router.push("/maintenance/pm-plans/"+pm.id)} className="tb-action-item w-full justify-between">
                      <div className="text-sm text-secondary truncate">{pm.title||"—"}</div>
                      <span className="text-xs font-black text-danger flex-shrink-0">{days}d overdue</span>
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
