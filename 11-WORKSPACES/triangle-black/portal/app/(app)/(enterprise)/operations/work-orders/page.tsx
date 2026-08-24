"use client";
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "@/lib/toast";
import { TableSkeleton, KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";
import { CreateModal } from "@/components/ui/CreateModal";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { if (!d) return "—"; try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };

const P_COLOR = {critical:"var(--color-danger)",high:"var(--color-warning)",medium:"var(--color-warning)",low:"var(--color-text-3)"};

const woFields = [
  {key:"title",label:"Title",type:"text",required:true,placeholder:"e.g. HVAC Filter Replacement"},
  {key:"description",label:"Description",type:"textarea",required:false,placeholder:"Describe the work required..."},
  {key:"priority",label:"Priority",type:"select",required:true,defaultValue:"medium",options:[{label:"Critical",value:"critical"},{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low",value:"low"}] as any[]},
  {key:"type",label:"Type",type:"select",required:true,defaultValue:"corrective",options:[{label:"Corrective",value:"corrective"},{label:"Preventive",value:"preventive"},{label:"Inspection",value:"inspection"}]},
];

export default function WorkOrdersPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [updatingId, setUpdatingId] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [priorityF, setPriorityF] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const updateStatusMut = useMutation(
    ({id,status})=>authFetch(`/api/v1/work-orders/${id}/status`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}).then(r => (r as any).data ?? r),
    {onSuccess:(data,vars)=>{toast.success(`Status updated to ${vars.status.replace(/_/g," ")}`);qc.invalidateQueries(["wo-list"]);setUpdatingId(null);},onError:()=>{toast.error("Failed to update status");setUpdatingId(null);}}
  );

  const { data: raw, isLoading } = useQuery(["wo-list"],()=>authFetch("/api/v1/work-orders/").then(r => (r as any).data ?? r),{refetchInterval:30000});
  const wos = toArr(raw);
  const now = new Date();

  const filtered = wos.filter((w: any) =>{
    const ms = !search||w.title?.toLowerCase().includes(search.toLowerCase());
    return ms&&(statusF==="all"||w.status===statusF)&&(priorityF==="all"||w.priority===priorityF);
  });

  const totalPages = Math.ceil(filtered.length/pageSize);
  const paged = filtered.slice((page-1)*pageSize,page*pageSize);
  const open = wos.filter((w: any) =>w.status==="open");
  const inProgress = wos.filter((w: any) =>w.status==="in_progress");
  const completed = wos.filter((w: any) =>w.status==="completed");
  const critical = wos.filter((w: any) =>w.priority==="critical"&&w.status!=="completed");
  const overdue = wos.filter((w: any) =>w.due_date&&new Date(w.due_date)<now&&w.status!=="completed");
  const compRate = wos.length>0?Math.round(completed.length/wos.length*100):0;

  if (isLoading) return (
    <div className="tb-page">
      <div className="tb-section tb-shimmer-block" style={{height:80}}/>
      <div className="tb-grid-4">{[1,2,3,4].map((i: any) =><div key={i} className="tb-shimmer-block" style={{height:64}}/>)}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base">
      <CreateModal open={showCreate} onClose={()=>setShowCreate(false)} title="Work Order" icon="🔧"
        endpoint="/api/v1/work-orders/" fields={woFields} invalidateKeys={["wo-list"]}
        successPath="/operations/work-orders/"/>

      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Work Orders</h1>
              <p className="tb-hero-description">{wos.length} total · {open.length} open · {overdue.length} overdue · {compRate}% completion</p>
            </div>
            <button onClick={()=>setShowCreate(true)} className="tb-btn tb-btn-primary">+ New Work Order</button>
          </div>

          <div className="tb-grid-5 mt-6">
            {[{label:"Total",value:wos.length,f:"all",pf:"all"},{label:"Open",value:open.length,f:"open",pf:"all"},{label:"In Progress",value:inProgress.length,f:"in_progress",pf:"all"},{label:"Completed",value:completed.length,f:"completed",pf:"all"},{label:"Critical",value:critical.length,f:"all",pf:"critical",danger:critical.length>0}].map((k: any, i: number) =>(
              <button key={i} onClick={()=>{setStatusF(k.f);setPriorityF(k.pf);setPage(1);}} className="tb-hero-kpi cursor-pointer">
                <div className="tb-hero-kpi-value" style={{color:k.danger?"var(--color-danger)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {critical.length>0 && (
          <div className="tb-alert tb-alert-danger mb-4">
            <span className="text-xl">⚠️</span>
            <div className="flex-1 text-sm">{critical.length} Critical Work Orders Need Immediate Action — {critical.slice(0,2).map((w: any) =>w.title).join(" · ")}</div>
            <button onClick={()=>setPriorityF("critical")} className="tb-btn tb-btn-danger tb-btn-sm">Show Critical</button>
          </div>
        )}

        <div className="flex gap-2.5 flex-wrap items-center mb-4">
          <input value={search} onChange={(e: any) =>{setSearch(e.target.value);setPage(1);}} placeholder="Search work orders..." className="tb-input" style={{maxWidth:"320px"}} />
          <div className="tb-tabs border-0 mb-0">
            {["all","open","in_progress","completed","cancelled"].map((s: any) =>(
              <button key={s} onClick={()=>{setStatusF(s);setPage(1);}} className={`tb-tab ${statusF===s?"active":""}`}>
                {s==="in_progress"?"In Progress":s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {["critical","high","medium"].map((p: any) =>(
              <button key={p} onClick={()=>{setPriorityF(priorityF===p?"all":p);setPage(1);}}
                className={`tb-btn tb-btn-sm ${priorityF===p?"tb-btn-primary":"tb-btn-ghost"}`}>
                {p.charAt(0).toUpperCase()+p.slice(1)}
              </button>
            ))}
          </div>
          {(search||statusF!=="all"||priorityF!=="all")&&<button onClick={()=>{setSearch("");setStatusF("all");setPriorityF("all");}} className="tb-btn tb-btn-ghost tb-btn-sm">Clear ×</button>}
          <span className="text-xs text-tertiary ml-auto">{filtered.length} results</span>
          <ExportButton data={toArr(raw)} filename="work-orders" title="Work Orders"/>
        </div>

        <div className="tb-section">
          {filtered.length===0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">🔧</div>
              <div className="tb-empty-title">No work orders found</div>
              <div className="tb-empty-desc">Try adjusting filters or create a new work order</div>
              <button onClick={()=>setShowCreate(true)} className="tb-btn tb-btn-primary mt-4">+ New Work Order</button>
            </div>
          ) : (
            <>
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead><tr><th>Work Order</th><th className="text-center">Priority</th><th className="text-center">Status</th><th className="text-center">Due Date</th><th className="text-center">Created</th></tr></thead>
                  <tbody>
                    {paged.map((w: any, i: number) =>{
                      const isOverdue = w.due_date&&new Date(w.due_date)<now&&w.status!=="completed";
                      return (
                        <tr key={i} onClick={()=>router.push(`/operations/work-orders/${w.id}`)} className="cursor-pointer" style={{borderLeft:isOverdue?"3px solid var(--color-danger-border)":"3px solid transparent"}}>
                          <td>
                            <div className="text-sm font-semibold text-primary truncate">{w.title}</div>
                            <div className="text-xs text-tertiary mt-0.5 capitalize">{w.type||"corrective"}</div>
                          </td>
                          <td className="text-center"><StatusBadge status={w.priority||"medium"} /></td>
                          <td className="text-center"><StatusBadge status={w.status||"open"} /></td>
                          <td className={`text-center text-xs ${isOverdue?"font-bold text-danger":"text-tertiary"}`}>
                            {fmtDate(w.due_date)}
                            {isOverdue&&<div className="text-xs uppercase" style={{fontSize:"0.5rem"}}>OVERDUE</div>}
                          </td>
                          <td className="text-center text-xs text-tertiary">{fmtDate(w.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length>pageSize&&<div className="mt-4 pt-4 border-t border-default"><Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} pageSize={pageSize} onPageSize={(s)=>{setPageSize(s);setPage(1);}} pageSizes={[10,25,50,100]} /></div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
