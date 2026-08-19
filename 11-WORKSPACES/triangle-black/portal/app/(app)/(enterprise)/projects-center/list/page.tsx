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
const fmtEGP = (n: any) => n?"EGP "+Number(n).toLocaleString():"—";

export default function ProjectsListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: raw, isLoading } = useQuery({queryKey:["projects-list"],queryFn:()=>authFetch("/api/v1/projects-portal").then(r=>r.json()),staleTime:60000});
  const projects = toArr(raw);
  const active = projects.filter((p: any) =>p.status==="active"||p.status==="in_progress");
  const completed = projects.filter((p: any) =>p.status==="completed");
  const totalBudget = projects.reduce((s: any, p: any) =>s+Number(p.budget||0),0);

  const filtered = useMemo(()=>projects.filter((p: any) =>{
    const ms = !search||(p.title||"").toLowerCase().includes(search.toLowerCase());
    return ms&&(filterStatus==="all"||p.status===filterStatus);
  }),[projects,search,filterStatus]);

  const totalPages = Math.ceil(filtered.length/pageSize);
  const paged = filtered.slice((page-1)*pageSize,page*pageSize);
  const hasFilters = search||filterStatus!=="all";

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Projects Center</div>
              <h1 className="tb-hero-title">Projects List</h1>
              <p className="tb-hero-description">All projects · Status · Budget · Timeline</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>router.push("/projects-center")} className="tb-btn tb-btn-primary">+ New Project</button>
              <button onClick={()=>router.push("/projects-center")} className="tb-btn tb-btn-secondary">← Projects</button>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{projects.length}</div><div className="tb-hero-kpi-label">Total</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-info)"}}>{active.length}</div><div className="tb-hero-kpi-label">Active</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)"}}>{completed.length}</div><div className="tb-hero-kpi-label">Completed</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value text-brand" style={{fontSize:"14px"}}>{fmtEGP(totalBudget)}</div><div className="tb-hero-kpi-label">Total Budget</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="flex gap-2.5 flex-wrap items-center mb-4">
          <input value={search} onChange={(e: any) =>{setSearch(e.target.value);setPage(1);}} placeholder="Search projects..." className="tb-input" style={{minWidth:"200px",width:"auto"}} />
          <div className="tb-tabs border-0 mb-0">
            {["all","planning","active","in_progress","on_hold","completed","cancelled"].map((s: any) =>(
              <button key={s} onClick={()=>{setFilterStatus(s);setPage(1);}} className={`tb-tab ${filterStatus===s?"active":""}`}>
                {s==="all"?"All":s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
                {s!=="all"&&<span className="ml-1 opacity-60">{projects.filter((p: any) =>p.status===s).length}</span>}
              </button>
            ))}
          </div>
          {hasFilters&&<button onClick={()=>{setSearch("");setFilterStatus("all");setPage(1);}} className="tb-btn tb-btn-ghost tb-btn-sm">✕</button>}
        </div>

        <div className="tb-section">
          <div className="tb-section-title">Projects — {filtered.length}</div>
          {isLoading ? <TableSkeleton /> : filtered.length===0 ? (
            <EmptyState icon="📁" title="No projects found" description={hasFilters?"Try adjusting filters":"No projects yet"} />
          ) : (
            <>
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead><tr><th>Project</th><th>Status</th><th>Progress</th><th style={{textAlign:"right"}}>Budget</th><th>Start</th><th>End</th></tr></thead>
                  <tbody>
                    {paged.map((p: any, i: number) =>{
                      const isOverdue = p.end_date&&new Date(p.end_date)<new Date()&&p.status!=="completed";
                      return (
                        <tr key={p.id||i} onClick={()=>router.push(`/projects-center/${p.id}`)} className="cursor-pointer">
                          <td>
                            <div className="font-semibold text-sm text-primary">{(p.title||"—").slice(0,50)}</div>
                            <div className="text-xs text-tertiary">{p.id?.slice(0,8)}</div>
                          </td>
                          <td><StatusBadge status={p.status||"planning"} /></td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="tb-progress flex-1" style={{minWidth:"60px"}}>
                                <div className="tb-progress-bar" style={{width:`${p.completion_pct||0}%`,background:(p.completion_pct||0)>=80?"var(--color-success)":"var(--color-brand)"}} />
                              </div>
                              <span className="text-xs font-bold text-secondary" style={{minWidth:"28px"}}>{p.completion_pct||0}%</span>
                            </div>
                          </td>
                          <td className="text-right font-semibold text-brand">{fmtEGP(p.budget)}</td>
                          <td className="text-xs text-tertiary">{fmtDate(p.start_date)}</td>
                          <td className={`text-xs ${isOverdue?"font-bold text-danger":"text-tertiary"}`}>{fmtDate(p.end_date)}</td>
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
