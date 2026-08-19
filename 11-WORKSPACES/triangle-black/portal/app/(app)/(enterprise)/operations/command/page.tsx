"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];

export default function OperationsCommandPage() {
  const router = useRouter();

  const { data: dispatch, isLoading: loadD } = useQuery({ queryKey:["cmd-dispatch"], queryFn:()=>authFetch("/api/v1/dispatch/board").then(r => (r as any).data ?? r), staleTime:30000, refetchInterval:60000 });
  const { data: sla, isLoading: loadS } = useQuery({ queryKey:["cmd-sla"], queryFn:()=>authFetch("/api/v1/sla/dashboard").then(r => (r as any).data ?? r), staleTime:60000 });
  const { data: rawWOs } = useQuery({ queryKey:["cmd-wos"], queryFn:()=>authFetch("/api/v1/work-orders/?limit=50").then(r => (r as any).data ?? r), staleTime:30000 });

  const techs = toArr(dispatch?.technicians);
  const wos = toArr(rawWOs).filter((w: any) =>!w.deleted_at);
  const open = wos.filter((w: any) =>w.status==="open");
  const inProg = wos.filter((w: any) =>w.status==="in_progress");
  const critical = wos.filter((w: any) =>w.priority==="critical"&&w.status!=="completed");
  const overall = sla?.overall||{};
  const breaches = toArr(sla?.active_breaches);
  const isLoading = loadD||loadS;

  const ACTIONS = [
    {label:"Work Orders",icon:"🔧",path:"/operations/work-orders",count:wos.length},
    {label:"Dispatch Board",icon:"📋",path:"/operations/dispatch",count:inProg.length},
    {label:"Service Requests",icon:"🎫",path:"/operations/service-requests"},
    {label:"SLA Review",icon:"📊",path:"/operations/sla-review",count:breaches.length,warn:breaches.length>0},
    {label:"Time Tracking",icon:"⏱",path:"/operations/time-tracking"},
    {label:"Technicians",icon:"👷",path:"/operations/technicians",count:techs.filter((t: any) =>t.is_active).length},
  ];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Operations Command</h1>
              <p className="tb-hero-description">Live operations overview · Quick actions · Team status</p>
            </div>
            <button onClick={()=>router.push("/workspace/my-day")} className="tb-btn tb-btn-primary">My Day →</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi" onClick={()=>router.push("/operations/work-orders")} style={{cursor:"pointer"}}>
                <div className="tb-hero-kpi-value">{open.length}</div><div className="tb-hero-kpi-label">Open WOs</div>
              </div>
              <div className="tb-hero-kpi" onClick={()=>router.push("/operations/dispatch")} style={{cursor:"pointer"}}>
                <div className="tb-hero-kpi-value" style={{color:"var(--color-warning)"}}>{inProg.length}</div><div className="tb-hero-kpi-label">In Progress</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:critical.length>0?"var(--color-danger)":"var(--color-success)"}}>{critical.length}</div><div className="tb-hero-kpi-label">Critical</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:(overall.compliance_rate||0)>=80?"var(--color-success)":"var(--color-danger)"}}>{Math.round(overall.compliance_rate||0)}%</div>
                <div className="tb-hero-kpi-label">SLA Rate</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {critical.length>0 && (
          <div className="tb-alert tb-alert-critical">
            <span>🚨</span>
            <div className="flex-1">
              <span className="font-bold">{critical.length} critical work orders need immediate attention</span>
              <div className="text-xs opacity-70 mt-0.5">{critical.slice(0,3).map((w: any) =>w.title).join(" · ")}</div>
            </div>
            <button onClick={()=>router.push("/operations/work-orders")} className="tb-btn tb-btn-danger tb-btn-sm">View →</button>
          </div>
        )}

        <div className="tb-grid-3 mb-5">
          {ACTIONS.map((a: any, i: number) =>(
            <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item">
              <span className="text-2xl">{a.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-sm text-primary">{a.label}</div>
                {a.count!==undefined && (
                  <div className="text-xs font-bold mt-0.5" style={{color:a.warn?"var(--color-danger)":"var(--color-success)"}}>{a.count} active</div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="tb-section">
          <div className="flex justify-between items-center mb-4">
            <div className="tb-section-title" style={{margin:0}}>Field Team Status</div>
            <button onClick={()=>router.push("/operations/dispatch")} className="text-sm text-brand font-semibold bg-transparent border-0 cursor-pointer">Full Dispatch →</button>
          </div>
          {techs.length===0 ? (
            <p className="text-sm text-tertiary">No technician data available</p>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
              {techs.slice(0,12).map((t: any, i: number) =>{
                const load = t.current_work_orders||0;
                const max = t.max_work_orders||10;
                const pct = Math.min(100,Math.round(load/max*100));
                return (
                  <div key={i} className="p-3 bg-surface-alt border border-default rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{background:t.is_active?"var(--color-brand)":"var(--color-border)",color:"#181614"}}>
                        {(t.name||"?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{t.name}</div>
                        <div className="text-xs font-semibold" style={{color:t.is_active?"var(--color-success)":"var(--color-danger)"}}>{t.is_active?"Active":"Offline"}</div>
                      </div>
                      <span className="text-xs font-bold text-secondary">{load}/{max}</span>
                    </div>
                    <div className="tb-progress">
                      <div className="tb-progress-bar" style={{width:`${pct}%`,background:pct>=90?"var(--color-danger)":pct>=70?"var(--color-warning)":"var(--color-success)"}} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
