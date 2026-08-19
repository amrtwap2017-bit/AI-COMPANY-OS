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

export default function WorkHistoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: rawWOs, isLoading } = useQuery({queryKey:["maint-wo-history"],queryFn:()=>authFetch("/api/v1/work-orders/?limit=200").then(r => (r as any).data ?? r),staleTime:60000});

  const wos = toArr(rawWOs).filter((w: any) =>!w.deleted_at);
  const completed = wos.filter((w: any) =>w.status==="completed");
  const byType = useMemo(()=>{const m: Record<string, any> = {};wos.forEach((w: any) =>{m[w.type||"corrective"]=(m[w.type||"corrective"]||0)+1;});return m;},[wos]);
  const types = ["all",...Object.keys(byType)];
  const compRate = wos.length>0?Math.round(completed.length/wos.length*100):0;

  const filtered = useMemo(()=>wos.filter((w: any) =>{
    const ms = !search||(w.title||"").toLowerCase().includes(search.toLowerCase());
    return ms&&(filterType==="all"||(w.type||"corrective")===filterType)&&(filterStatus==="all"||w.status===filterStatus);
  }),[wos,search,filterType,filterStatus]);

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
              <h1 className="tb-hero-title">Work Order History</h1>
              <p className="tb-hero-description">Maintenance history · Completion tracking · Type analysis</p>
            </div>
            <button onClick={()=>router.push("/maintenance")} className="tb-btn tb-btn-secondary">← Maintenance</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{wos.length}</div><div className="tb-hero-kpi-label">Total WOs</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)"}}>{completed.length}</div><div className="tb-hero-kpi-label">Completed</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:compRate>=80?"var(--color-success)":"var(--color-warning)"}}>{compRate}%</div><div className="tb-hero-kpi-label">Completion</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{Object.keys(byType).length}</div><div className="tb-hero-kpi-label">WO Types</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {!isLoading&&Object.keys(byType).length>0&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
            {Object.entries(byType).map(([type,count])=>(
              <button key={type} onClick={()=>{setFilterType(filterType===type?"all":type);setPage(1);}}
                className={`tb-section text-left cursor-pointer ${filterType===type?"border-brand bg-brand/5":""}`}>
                <div className="text-xl font-extrabold text-primary">{count}</div>
                <div className="text-xs text-tertiary mt-0.5">{type}</div>
              </button>
            ))}
          </div>
        )}

        <div className="tb-section" style={{padding:"12px 16px"}}>
          <div className="flex gap-2.5 flex-wrap items-center">
            <input value={search} onChange={(e: any) =>{setSearch(e.target.value);setPage(1);}} placeholder="Search work orders..." className="tb-input" style={{minWidth:"220px",width:"auto"}} />
            <div className="tb-tabs border-0 mb-0">
              {["all","open","in_progress","completed","cancelled"].map((s: any) =>(
                <button key={s} onClick={()=>{setFilterStatus(s);setPage(1);}} className={`tb-tab ${filterStatus===s?"active":""}`}>
                  {s==="all"?"All":s==="in_progress"?"In Progress":s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>
            {hasFilters&&<button onClick={clearFilters} className="tb-btn tb-btn-ghost tb-btn-sm">✕ Clear</button>}
            <span className="ml-auto text-xs text-tertiary">{filtered.length} of {wos.length}</span>
          </div>
        </div>

        <div className="tb-section">
          <div className="tb-section-title">Maintenance Work Orders</div>
          {isLoading ? <TableSkeleton /> : filtered.length===0 ? (
            <EmptyState icon="🔧" title="No work orders found" description={hasFilters?"Try adjusting filters":"No maintenance work orders yet"} />
          ) : (
            <>
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead><tr><th>Work Order</th><th>Type</th><th>Priority</th><th>Status</th><th>Created</th><th>Completed</th></tr></thead>
                  <tbody>
                    {paged.map((w: any, i: number) =>(
                      <tr key={w.id||i} onClick={()=>router.push(`/operations/work-orders/${w.id}`)} className="cursor-pointer">
                        <td>
                          <div className="font-semibold text-sm text-primary">{(w.title||"Untitled").slice(0,50)}</div>
                          <div className="text-xs text-tertiary">{w.id?.slice(0,8)}</div>
                        </td>
                        <td className="text-xs text-secondary">{w.type||"corrective"}</td>
                        <td><StatusBadge status={w.priority||"medium"} /></td>
                        <td><StatusBadge status={w.status||"open"} /></td>
                        <td className="text-xs text-tertiary">{fmtDate(w.created_at)}</td>
                        <td className={`text-xs ${w.completed_at?"text-success":"text-tertiary"}`}>{fmtDate(w.completed_at)}</td>
                      </tr>
                    ))}
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
