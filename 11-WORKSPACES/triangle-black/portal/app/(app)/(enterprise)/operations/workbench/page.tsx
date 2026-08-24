"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return d?new Date(d).toLocaleDateString("en-GB"):"—"; } catch { return "—"; } };

export default function OperationsWorkbenchPage() {
  const router = useRouter();
  const { data: rawWOs, isLoading } = useQuery({queryKey:["wb-wos"],queryFn:()=>authFetch("/api/v1/work-orders/?limit=50").then(r => (r as any).data ?? r),staleTime:30000,refetchInterval:60000});
  const { data: dispatch } = useQuery({queryKey:["wb-dispatch"],queryFn:()=>authFetch("/api/v1/dispatch/board").then(r => (r as any).data ?? r),staleTime:30000});
  const { data: sla } = useQuery({queryKey:["wb-sla"],queryFn:()=>authFetch("/api/v1/sla/dashboard").then(r => (r as any).data ?? r),staleTime:60000});

  const wos = toArr(rawWOs).filter((w: any) =>!w.deleted_at);
  const open = wos.filter((w: any) =>w.status==="open");
  const inProg = wos.filter((w: any) =>w.status==="in_progress");
  const overdue = wos.filter((w: any) =>w.due_date&&new Date(w.due_date)<new Date()&&w.status!=="completed");
  const techs = toArr(dispatch?.technicians);
  const activeTechs = techs.filter((t: any) =>(t.current_work_orders||0)>0);
  const overall = sla?.overall||{};

  const SECTIONS = [
    {title:"Open Work Orders",items:open.slice(0,5),path:"/operations/work-orders",icon:"🔧"},
    {title:"In Progress",items:inProg.slice(0,5),path:"/operations/dispatch",icon:"⚡"},
    {title:"Overdue",items:overdue.slice(0,5),path:"/operations/work-orders",icon:"🚨",danger:true},
  ];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Operations Workbench</h1>
              <p className="tb-hero-description">Live operations summary · Team · SLA at a glance</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>router.push("/operations/command")} className="tb-btn tb-btn-primary">Command →</button>
              <button onClick={()=>router.push("/operations")} className="tb-btn tb-btn-secondary">← Operations</button>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi" onClick={()=>router.push("/operations/work-orders")} style={{cursor:"pointer"}}>
                <div className="tb-hero-kpi-value">{open.length}</div><div className="tb-hero-kpi-label">Open</div>
              </div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-warning)"}}>{inProg.length}</div><div className="tb-hero-kpi-label">In Progress</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:overdue.length>0?"var(--color-danger)":"var(--color-success)"}}>{overdue.length}</div><div className="tb-hero-kpi-label">Overdue</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:(overall.compliance_rate||0)>=80?"var(--color-success)":"var(--color-danger)"}}>{Math.round(overall.compliance_rate||0)}%</div><div className="tb-hero-kpi-label">SLA</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid gap-4" style={{gridTemplateColumns:"2fr 1fr"}}>
          <div className="flex flex-col gap-3.5">
            {SECTIONS.map(({title,items,path,icon,danger})=>(
              <div key={title} className="tb-section" style={danger&&items.length>0?{borderColor:"var(--color-danger-border)"}:{}}>
                <div className="flex justify-between items-center mb-3">
                  <div className={`text-sm font-bold ${danger&&items.length>0?"text-danger":"text-primary"}`}>{icon} {title} ({items.length})</div>
                  <button onClick={()=>router.push(path)} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">View all →</button>
                </div>
                {items.length===0 ? (
                  <p className="text-sm text-tertiary">No items</p>
                ) : items.map((w: any, i: number) =>(
                  <button key={i} onClick={()=>router.push(`/operations/work-orders/${w.id}`)}
                    className="flex justify-between items-center py-2 border-b border-divider w-full text-left bg-transparent cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-primary truncate">{w.title||"Untitled"}</div>
                      <div className="text-xs text-tertiary">{fmtDate(w.due_date)}</div>
                    </div>
                    <StatusBadge status={w.priority||"medium"} />
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="tb-section">
              <div className="tb-section-title">Active Technicians ({activeTechs.length})</div>
              {activeTechs.slice(0,8).map((t: any, i: number) =>(
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{t.name?.split(" ")[0]||"—"}</span>
                  <span className="tb-detail-value font-bold text-brand">{t.current_work_orders||0} WO</span>
                </div>
              ))}
              {activeTechs.length===0&&<p className="text-sm text-tertiary">No active technicians</p>}
              <button onClick={()=>router.push("/operations/dispatch")} className="tb-btn tb-btn-secondary w-full justify-center mt-3">Full Dispatch Board →</button>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Quick Actions</div>
              <div className="flex flex-col gap-1.5">
                {[{label:"+ New Work Order",path:"/operations/work-orders/new",primary:true},{label:"Bulk Operations",path:"/operations/bulk"},{label:"SLA Review",path:"/operations/sla-review"},{label:"Schedule",path:"/operations/schedule"},{label:"Time Tracking",path:"/operations/time-tracking"}].map((a: any, i: number) =>(
                  <button key={i} onClick={()=>router.push(a.path)}
                    className={a.primary?"tb-btn tb-btn-primary w-full justify-center":"tb-btn tb-btn-secondary w-full justify-start"}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
