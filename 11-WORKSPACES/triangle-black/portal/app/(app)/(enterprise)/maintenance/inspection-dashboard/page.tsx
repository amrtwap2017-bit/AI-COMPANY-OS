"use client";
// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return d?new Date(d).toLocaleDateString("en-GB"):"—"; } catch { return "—"; } };

export default function InspectionDashboardPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: rawPlans, isLoading } = useQuery({ queryKey:["pm-plans-inspection"], queryFn:()=>authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()), staleTime:60000 });
  const { data: stats } = useQuery({ queryKey:["pm-stats-insp"], queryFn:()=>authFetch("/api/v1/pm-schedule/stats").then(r => r.json()), staleTime:60000 });

  const plans = toArr(rawPlans);
  const now = new Date();
  const overdue = plans.filter((p: any) =>p.next_due_date&&new Date(p.next_due_date)<now&&p.status!=="completed");
  const dueThisWeek = plans.filter((p: any) =>{if(!p.next_due_date) return false;const d=new Date(p.next_due_date);const diff=(d.getTime()-now.getTime())/86400000;return diff>=0&&diff<=7;});
  const types = ["all",...Array.from(new Set(plans.map((p: any) =>p.plan_type).filter(Boolean)))];
  const statuses = ["all",...Array.from(new Set(plans.map((p: any) =>p.status).filter(Boolean)))];

  const filtered = useMemo(()=>plans.filter((p: any) =>{
    const ms = !search||(p.title||"").toLowerCase().includes(search.toLowerCase())||(p.owner||"").toLowerCase().includes(search.toLowerCase());
    return ms&&(filterType==="all"||p.plan_type===filterType)&&(filterStatus==="all"||p.status===filterStatus);
  }),[plans,search,filterType,filterStatus]);

  const totalPages = Math.ceil(filtered.length/pageSize);
  const paged = filtered.slice((page-1)*pageSize,page*pageSize);
  const hasFilters = search||filterType!=="all"||filterStatus!=="all";
  const clearFilters = ()=>{setSearch("");setFilterType("all");setFilterStatus("all");setPage(1);};

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Maintenance</div>
              <h1 className="tb-hero-title">Inspection & PM Dashboard</h1>
              <p className="tb-hero-description">Preventive maintenance schedules · Due dates · Compliance tracking</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>router.push("/maintenance/pm-plans")} className="tb-btn tb-btn-primary">PM Plans</button>
              <button onClick={()=>router.push("/maintenance")} className="tb-btn tb-btn-secondary">← Maintenance</button>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{plans.length}</div><div className="tb-hero-kpi-label">Total Plans</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:overdue.length>0?"var(--color-danger)":"var(--color-success)"}}>{overdue.length}</div><div className="tb-hero-kpi-label">Overdue</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-warning)"}}>{dueThisWeek.length}</div><div className="tb-hero-kpi-label">Due This Week</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{stats?.assets?.total||0}</div><div className="tb-hero-kpi-label">Assets Covered</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {overdue.length>0 && <div className="tb-alert tb-alert-danger"><span>🚨</span><div className="flex-1"><span className="font-bold">{overdue.length} PM plans overdue</span><span className="text-sm ml-2 opacity-70">— schedule immediately</span></div></div>}
        {dueThisWeek.length>0 && <div className="tb-alert tb-alert-warning"><span>📅</span><span className="font-semibold">{dueThisWeek.length} inspections due this week</span></div>}

        <div className="tb-section" style={{padding:"12px 16px"}}>
          <div className="flex gap-2.5 flex-wrap items-center">
            <input value={search} onChange={(e: any) =>{setSearch(e.target.value);setPage(1);}} placeholder="Search plans..." className="tb-input" style={{minWidth:"220px",width:"auto"}} />
            <select value={filterType} onChange={(e: any) =>{setFilterType(e.target.value);setPage(1);}} className="tb-select" style={{width:"auto"}}>
              {types.map((t: any) =><option key={t} value={t}>{t==="all"?"All Types":t}</option>)}
            </select>
            <select value={filterStatus} onChange={(e: any) =>{setFilterStatus(e.target.value);setPage(1);}} className="tb-select" style={{width:"auto"}}>
              {statuses.map((s: any) =><option key={s} value={s}>{s==="all"?"All Statuses":s}</option>)}
            </select>
            {hasFilters&&<button onClick={clearFilters} className="tb-btn tb-btn-ghost tb-btn-sm">✕ Clear</button>}
            <span className="ml-auto text-xs text-tertiary">{filtered.length} of {plans.length}</span>
          </div>
        </div>

        <div className="tb-section">
          <div className="tb-section-title">PM Inspection Plans</div>
          {isLoading ? <TableSkeleton /> : filtered.length===0 ? (
            <EmptyState icon="📋" title="No plans found" description={hasFilters?"Try adjusting filters":"No preventive maintenance plans configured"} />
          ) : (
            <>
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead><tr><th>Plan</th><th>Type</th><th>Frequency</th><th>Owner</th><th>Next Due</th><th>Status</th></tr></thead>
                  <tbody>
                    {paged.map((p: any, i: number) =>{
                      const isOverdueRow = p.next_due_date&&new Date(p.next_due_date)<now&&p.status!=="completed";
                      const isDueSoon = p.next_due_date&&!isOverdueRow&&((new Date(p.next_due_date).getTime()-now.getTime())/86400000)<=7;
                      return (
                        <tr key={p.id||i} style={{borderLeft:isOverdueRow?"3px solid var(--color-danger-border)":isDueSoon?"3px solid var(--color-warning-border)":"3px solid transparent"}}>
                          <td><div className="font-semibold text-sm text-primary">{(p.title||"Untitled").slice(0,50)}</div></td>
                          <td className="text-xs text-secondary">{p.plan_type||"—"}</td>
                          <td className="text-xs text-secondary">{p.frequency||"—"}</td>
                          <td className="text-xs text-secondary">{p.owner||"—"}</td>
                          <td className={`text-xs ${isOverdueRow?"font-bold text-danger":isDueSoon?"font-bold text-warning":"text-tertiary"}`}>
                            {fmtDate(p.next_due_date)}{isOverdueRow?" 🚨":isDueSoon?" ⚠️":""}
                          </td>
                          <td><StatusBadge status={p.status||"scheduled"} /></td>
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
