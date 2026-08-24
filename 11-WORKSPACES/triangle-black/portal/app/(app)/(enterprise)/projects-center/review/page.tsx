"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return d?new Date(d).toLocaleDateString("en-GB"):"—"; } catch { return "—"; } };
const fmtEGP = (n: any) => n?"EGP "+Number(n).toLocaleString():"—";

export default function ProjectsReviewPage() {
  const router = useRouter();
  const { data: raw, isLoading } = useQuery({queryKey:["proj-review"],queryFn:()=>authFetch("/api/v1/projects-portal").then(r => (r as any).data ?? r),staleTime:60000});
  const projects = toArr(raw);
  const now = new Date();
  const needsReview = projects.filter((p: any) =>["active","in_progress","on_hold"].includes(p.status));
  const overdue = projects.filter((p: any) =>p.end_date&&new Date(p.end_date)<now&&p.status!=="completed");
  const behindSchedule = projects.filter((p: any) =>(p.completion_pct||0)<50&&p.status==="active");

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Projects Center</div>
              <h1 className="tb-hero-title">Projects Review</h1>
              <p className="tb-hero-description">Active project review · Risk identification · Action items</p>
            </div>
            <button onClick={()=>router.push("/projects-center")} className="tb-btn tb-btn-secondary">← Projects</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{needsReview.length}</div><div className="tb-hero-kpi-label">Active</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:overdue.length>0?"var(--color-danger)":"var(--color-success)"}}>{overdue.length}</div><div className="tb-hero-kpi-label">Overdue</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:behindSchedule.length>0?"var(--color-warning)":"var(--color-success)"}}>{behindSchedule.length}</div><div className="tb-hero-kpi-label">Behind Schedule</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)"}}>{projects.filter((p: any) =>p.status==="completed").length}</div><div className="tb-hero-kpi-label">Completed</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {overdue.length>0 && (
          <div className="tb-alert tb-alert-danger mb-4">
            <span>🚨</span>
            <span className="font-bold">{overdue.length} projects are past their end date</span>
          </div>
        )}

        <div className="tb-section">
          <div className="tb-section-title">Projects Requiring Review</div>
          {isLoading ? <TableSkeleton /> : needsReview.length===0 ? (
            <EmptyState icon="✅" title="All projects on track" description="No active projects need review" />
          ) : (
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead><tr><th>Project</th><th>Status</th><th>Completion</th><th>End Date</th><th style={{textAlign:"right"}}>Budget</th><th>Risk</th></tr></thead>
                <tbody>
                  {needsReview.map((p: any, i: number) =>{
                    const isOvd = p.end_date&&new Date(p.end_date)<now;
                    const isBehind = (p.completion_pct||0)<50;
                    const risk = isOvd?"High":isBehind?"Medium":"Low";
                    const riskBadge = isOvd?"tb-badge-danger":isBehind?"tb-badge-warning":"tb-badge-success";
                    return (
                      <tr key={p.id||i} onClick={()=>router.push(`/projects-center/${p.id}`)} className="cursor-pointer"
                        style={{borderLeft:isOvd?"3px solid var(--color-danger-border)":isBehind?"3px solid var(--color-warning-border)":"3px solid transparent"}}>
                        <td className="font-semibold text-sm text-primary">{(p.title||"—").slice(0,45)}</td>
                        <td><StatusBadge status={p.status||"active"} /></td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="tb-progress" style={{width:"60px"}}>
                              <div className="tb-progress-bar" style={{width:`${p.completion_pct||0}%`,background:(p.completion_pct||0)>=80?"var(--color-success)":"var(--color-brand)"}} />
                            </div>
                            <span className="text-xs font-bold text-secondary">{p.completion_pct||0}%</span>
                          </div>
                        </td>
                        <td className={`text-xs ${isOvd?"font-bold text-danger":"text-tertiary"}`}>{fmtDate(p.end_date)}{isOvd?" 🚨":""}</td>
                        <td className="text-right text-sm text-brand">{fmtEGP(p.budget)}</td>
                        <td><span className={`tb-badge ${riskBadge}`}>{risk}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
