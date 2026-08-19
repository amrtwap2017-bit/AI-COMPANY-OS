"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return d?new Date(d).toLocaleDateString("en-GB"):"—"; } catch { return "—"; } };

export default function SchedulePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: rawPlans, isLoading } = useQuery({queryKey:["schedule-plans"],queryFn:()=>authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()),staleTime:60000});
  const { data: stats } = useQuery({queryKey:["schedule-stats"],queryFn:()=>authFetch("/api/v1/pm-schedule/stats").then(r => r.json()),staleTime:60000});

  const plans = toArr(rawPlans);
  const now = new Date();
  const overdue = plans.filter((p: any) =>p.next_due_date&&new Date(p.next_due_date)<now);
  const upcoming = plans.filter((p: any) =>{if(!p.next_due_date) return false;const diff=(new Date(p.next_due_date).getTime()-now.getTime())/86400000;return diff>=0&&diff<=30;});

  const filtered = filterStatus==="all"?plans:plans.filter((p: any) =>p.status===filterStatus);
  const totalPages = Math.ceil(filtered.length/pageSize);
  const paged = filtered.slice((page-1)*pageSize,page*pageSize);

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Maintenance Schedule</h1>
              <p className="tb-hero-description">PM plans · Due dates · Schedule overview</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>router.push("/maintenance/pm-plans")} className="tb-btn tb-btn-primary">PM Plans</button>
              <button onClick={()=>router.push("/operations")} className="tb-btn tb-btn-secondary">← Operations</button>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{plans.length}</div><div className="tb-hero-kpi-label">Total Plans</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-danger)"}}>{overdue.length}</div><div className="tb-hero-kpi-label">Overdue</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-warning)"}}>{upcoming.length}</div><div className="tb-hero-kpi-label">Due 30 Days</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{stats?.assets?.total||0}</div><div className="tb-hero-kpi-label">Assets</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-tabs mb-4">
          {["all","scheduled","in_progress","completed","overdue"].map((s: any) =>(
            <button key={s} onClick={()=>{setFilterStatus(s);setPage(1);}} className={`tb-tab ${filterStatus===s?"active":""}`}>
              {s==="all"?"All":s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
              {s!=="all"&&<span className="ml-1 opacity-60">{plans.filter((p: any) =>p.status===s).length}</span>}
            </button>
          ))}
        </div>

        <div className="tb-section">
          <div className="tb-section-title">PM Schedule — {filtered.length} plans</div>
          {isLoading ? <TableSkeleton /> : filtered.length===0 ? (
            <EmptyState icon="📅" title="No plans found" description="No PM plans match the current filter" />
          ) : (
            <>
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead><tr><th>Plan</th><th>Type</th><th>Frequency</th><th>Next Due</th><th>Status</th><th>Owner</th></tr></thead>
                  <tbody>
                    {paged.map((p: any, i: number) =>{
                      const isOvd = p.next_due_date&&new Date(p.next_due_date)<now;
                      return (
                        <tr key={p.id||i} style={{borderLeft:isOvd?"3px solid var(--color-danger-border)":"3px solid transparent"}}>
                          <td className="font-semibold text-sm text-primary">{(p.title||"—").slice(0,50)}</td>
                          <td className="text-xs text-secondary">{p.plan_type||"—"}</td>
                          <td className="text-xs text-secondary">{p.frequency||"—"}</td>
                          <td className={`text-xs ${isOvd?"font-bold text-danger":"text-tertiary"}`}>{fmtDate(p.next_due_date)}{isOvd?" 🚨":""}</td>
                          <td><StatusBadge status={p.status||"scheduled"} /></td>
                          <td className="text-xs text-secondary">{p.owner||"—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length>pageSize&&<div className="mt-4 pt-4 border-t border-default"><Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} pageSize={pageSize} onPageSize={(s)=>{setPageSize(s);setPage(1);}} pageSizes={[10,25,50]} /></div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
