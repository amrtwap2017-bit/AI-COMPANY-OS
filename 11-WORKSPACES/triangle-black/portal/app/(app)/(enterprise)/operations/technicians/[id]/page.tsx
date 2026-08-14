"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableSkeleton, KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.work_orders || [];
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };

export default function TechnicianDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: tech, isLoading } = useQuery({ queryKey:["tech-detail",id], queryFn:()=>authFetch(`/api/v1/technicians/${id}`).then(r=>r.json()), enabled:!!id });
  const { data: rawWOs, isLoading: wosLoading } = useQuery({ queryKey:["tech-wos",id], queryFn:()=>authFetch(`/api/v1/technicians/${id}/work-orders`).then(r=>r.json()), enabled:!!id });

  const wos = toArr(rawWOs).filter(w => !w.deleted_at);
  const activeWOs = wos.filter(w => ["open","in_progress"].includes(w.status));
  const completedWOs = wos.filter(w => w.status === "completed");
  const compRate = wos.length > 0 ? Math.round((completedWOs.length / wos.length) * 100) : 0;
  const specs = Array.isArray(tech?.specializations) ? tech.specializations : tech?.specializations ? [tech.specializations] : [];
  const load = tech?.current_work_orders || 0;
  const max = tech?.max_work_orders || 10;
  const loadPct = Math.min(100, Math.round(load / max * 100));

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-tertiary text-sm">Loading technician...</div>
    </div>
  );

  if (!tech || tech.detail === "Not found" || tech.error) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">👷</div>
        <div className="tb-empty-title">Technician not found</div>
        <div className="tb-empty-desc">ID: {id}</div>
        <button onClick={() => router.push("/operations/technicians")} className="tb-btn tb-btn-primary mt-4">Back to Technicians</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base">

      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-brand flex items-center justify-center text-2xl font-black text-sidebar flex-shrink-0">
                {(tech.name || "?")[0].toUpperCase()}
              </div>
              <div>
                <h1 className="tb-hero-title">{tech.name || `Technician ${id?.slice(0,8)}`}</h1>
                <p className="tb-hero-description">
                  {specs.length > 0 ? specs.slice(0,3).join(" · ") : "Field Technician"}
                  {tech.employee_id ? ` · ID: ${tech.employee_id}` : ""}
                </p>
              </div>
            </div>
            <button onClick={() => router.push("/operations/technicians")} className="tb-btn tb-btn-secondary">← All Technicians</button>
          </div>

          <div className="tb-grid-4 mt-6">
            {isLoading || wosLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{wos.length}</div><div className="tb-hero-kpi-label">Total WOs</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)"}}>{completedWOs.length}</div><div className="tb-hero-kpi-label">Completed</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:activeWOs.length>0?"var(--color-warning)":"var(--color-success)"}}>{activeWOs.length}</div><div className="tb-hero-kpi-label">Active</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:compRate>=80?"var(--color-success)":"var(--color-warning)"}}>{compRate}%</div><div className="tb-hero-kpi-label">Completion</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid gap-5" style={{gridTemplateColumns:"1fr 320px",alignItems:"start"}}>

          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="tb-section-title">Technician Profile</div>
              {[
                ["Name",        tech.name || "—"],
                ["Status",      tech.is_active ? "Active" : "Inactive"],
                ["Phone",       tech.phone || "—"],
                ["Email",       tech.email || "—"],
                ["Max WOs",     tech.max_work_orders || "—"],
                ["Current WOs", tech.current_work_orders ?? "—"],
                ["Notes",       tech.notes || "—"],
                ["Created",     fmtDate(tech.created_at)],
              ].map(([label, value], i) => (
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{label}</span>
                  <span className="tb-detail-value">
                    {label === "Status" ? <StatusBadge status={tech.is_active ? "active" : "inactive"} /> : value}
                  </span>
                </div>
              ))}
              {specs.length > 0 && (
                <div className="mt-4">
                  <div className="text-label-upper text-tertiary mb-2">Specializations</div>
                  <div className="flex flex-wrap gap-1.5">
                    {specs.map((s, i) => (
                      <span key={i} className="tb-badge tb-badge-brand">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="tb-section">
              <div className="flex justify-between items-center mb-4">
                <div className="tb-section-title" style={{margin:0}}>
                  Work Orders <span className="ml-2 text-sm font-normal text-tertiary">{wos.length}</span>
                </div>
                <button onClick={() => router.push("/operations/work-orders")} className="text-sm text-brand font-semibold bg-transparent border-0 cursor-pointer">All WOs →</button>
              </div>
              {wosLoading ? <TableSkeleton /> : wos.length === 0 ? (
                <EmptyState icon="🔧" title="No work orders" description="This technician has no assigned work orders" />
              ) : (
                <div className="tb-table-wrap">
                  <table className="tb-table">
                    <thead><tr><th>Work Order</th><th>Priority</th><th>Status</th><th>Due Date</th></tr></thead>
                    <tbody>
                      {wos.map(wo => (
                        <tr key={wo.id} onClick={() => router.push(`/operations/work-orders/${wo.id}`)} className="cursor-pointer">
                          <td>
                            <div className="font-semibold text-sm text-primary">{(wo.title||"Untitled").slice(0,50)}</div>
                            <div className="text-xs text-tertiary mt-0.5">{wo.type || "corrective"}</div>
                          </td>
                          <td><StatusBadge status={wo.priority || "medium"} /></td>
                          <td><StatusBadge status={wo.status || "open"} /></td>
                          <td className="text-xs text-tertiary">{fmtDate(wo.due_date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="tb-section text-center">
              <div className="tb-section-title">Performance</div>
              <div className={`text-5xl font-black mb-1 ${compRate>=80?"text-success":compRate>=50?"text-warning":"text-danger"}`} style={{fontSize:"52px"}}>
                {compRate}%
              </div>
              <div className="text-xs text-tertiary mb-4">completion rate</div>
              <div className="tb-progress mb-4">
                <div className="tb-progress-bar" style={{width:`${compRate}%`, background:compRate>=80?"var(--color-success)":compRate>=50?"var(--color-warning)":"var(--color-danger)"}} />
              </div>
              <div className="tb-grid-3">
                {[{label:"Total",value:wos.length,color:"var(--color-text-1)"},{label:"Done",value:completedWOs.length,color:"var(--color-success)"},{label:"Active",value:activeWOs.length,color:activeWOs.length>0?"var(--color-warning)":"var(--color-success)"}].map((s,i)=>(
                  <div key={i} className="p-2 bg-surface-alt rounded-lg">
                    <div className="text-xl font-extrabold" style={{color:s.color}}>{s.value}</div>
                    <div className="text-xs text-tertiary mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Capacity</div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-secondary">Workload</span>
                <span className="text-sm font-bold text-primary">{load} / {max}</span>
              </div>
              <div className="tb-progress mb-2">
                <div className="tb-progress-bar" style={{width:`${loadPct}%`, background:load>=max?"var(--color-danger)":"var(--color-success)"}} />
              </div>
              <div className="text-xs text-tertiary">{max - load} slots available</div>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Quick Actions</div>
              <div className="flex flex-col gap-2">
                {[{label:"All Technicians",icon:"👷",path:"/operations/technicians"},{label:"Dispatch Board",icon:"📋",path:"/operations/dispatch"},{label:"Work Orders",icon:"🔧",path:"/operations/work-orders"},{label:"Time Tracking",icon:"⏱️",path:"/operations/time-tracking"}].map((a,i)=>(
                  <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item">
                    <span>{a.icon}</span><span>{a.label}</span>
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
