"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { if (!d) return "—"; try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };

const PRIORITY_COLOR = {critical:"var(--color-danger)",high:"var(--color-warning)",medium:"var(--color-warning)",low:"var(--color-text-3)"};
const STATUS_COLOR   = {open:"var(--color-info)",in_progress:"var(--color-warning)",resolved:"var(--color-success)",closed:"var(--color-text-3)",cancelled:"var(--color-text-3)"};

export default function ServiceRequestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showCreateSR, setShowCreateSR] = useState(false);
  const [newSR, setNewSR] = useState({title:"",category:"HVAC",urgency:"normal",description:"",submitted_by:"",site_id:""});
  const [srErrors, setSrErrors] = useState({});
  const qc = useQueryClient();

  const createSR = useMutation(
    (payload) => authFetch("/api/v1/service-requests/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}).then(r => r.data ?? r),
    { onSuccess:(data)=>{ if(data.id){toast.success("Service request created");setShowCreateSR(false);setNewSR({title:"",category:"HVAC",urgency:"normal",description:"",submitted_by:"",site_id:""});qc.invalidateQueries(["sr-list"]);}else{toast.error(data.detail||"Failed");}}, onError:()=>toast.error("Connection error") }
  );

  const handleCreateSR = () => {
    const errors: Record<string, any> = {};
    if (!newSR.title?.trim()) errors.title = "Title is required";
    if (!newSR.submitted_by?.trim()) errors.submitted_by = "Requester name is required";
    if (Object.keys(errors).length) { setSrErrors(errors); toast.error("Please fix the errors"); return; }
    setSrErrors({});
    createSR.mutate({...newSR, hotel_id:"tb-default-hotel-000000000001", status:"open"});
  };

  const { data: srRaw, isLoading } = useQuery(["sr-list"], ()=>authFetch("/api/v1/service-requests/").then(r => r.data ?? r), {refetchInterval:30000});
  const { data: woRaw } = useQuery(["sr-wos"], ()=>authFetch("/api/v1/work-orders/").then(r => r.data ?? r));

  const srs = toArr(srRaw);
  const wos = toArr(woRaw);
  const open = srs.filter((s: any) =>s.status==="open").length;
  const inProgress = srs.filter((s: any) =>s.status==="in_progress").length;
  const resolved = srs.filter((s: any) =>s.status==="resolved").length;
  const linked = srs.filter((s: any) =>s.work_order_id).length;

  const filtered = srs.filter((s: any) => {
    const ms = !search||(s.title||"").toLowerCase().includes(search.toLowerCase())||(s.description||"").toLowerCase().includes(search.toLowerCase())||(s.requester_name||"").toLowerCase().includes(search.toLowerCase());
    return ms && (filterStatus==="all"||s.status===filterStatus);
  });
  const totalPages = Math.ceil(filtered.length/pageSize);
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Service Requests</h1>
              <p className="tb-hero-description">{srs.length} total · {open} open · {linked} linked to work orders</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>setShowCreateSR(true)} className="tb-btn tb-btn-primary">+ New Service Request</button>
              <button onClick={()=>router.push("/operations/work-orders")} className="tb-btn tb-btn-secondary">+ New Work Order</button>
            </div>
          </div>
          <div className="tb-grid-5 mt-6">
            {[{label:"Total",value:srs.length},{label:"Open",value:open,warn:true},{label:"In Progress",value:inProgress},{label:"Resolved",value:resolved},{label:"Linked WOs",value:linked}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.warn&&k.value>0?"var(--color-warning)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section">
          <div className="flex items-center gap-2.5 flex-wrap">
            <input className="tb-input flex-1" style={{minWidth:"200px"}} placeholder="Search service requests..." value={search} onChange={(e: any) =>setSearch(e.target.value)} />
            <div className="tb-tabs border-0 mb-0">
              {["all","open","in_progress","resolved","closed"].map((s: any) =>(
                <button key={s} onClick={()=>setFilterStatus(s)} className={`tb-tab ${filterStatus===s?"active":""}`}>
                  {s==="all"?"All":s.replace("_"," ")}
                  {s!=="all"&&<span className="ml-1 opacity-60">{srs.filter((r: any) =>r.status===s).length}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="tb-section">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-secondary">{filtered.length} requests</div>
            <div className="flex items-center gap-2">
              <ExportButton data={toArr(srRaw)} filename="service-requests" title="Service Requests"/>
              <button onClick={()=>router.push("/operations/work-orders")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">Work Orders →</button>
            </div>
          </div>
          {isLoading ? (
            <div className="flex flex-col gap-3">{[1,2,3,4,5].map((i: any) =><div key={i} className="tb-shimmer tb-shimmer-block" style={{height:56}} />)}</div>
          ) : filtered.length===0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">🎫</div>
              <div className="tb-empty-title">No service requests</div>
              <div className="tb-empty-desc">{search||filterStatus!=="all"?"Try adjusting your filters":"No service requests yet"}</div>
            </div>
          ) : (
            <>
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead><tr><th>Request</th><th style={{textAlign:"center"}}>Priority</th><th style={{textAlign:"center"}}>Status</th><th style={{textAlign:"center"}}>Requester</th><th style={{textAlign:"center"}}>Date</th><th style={{textAlign:"center"}}>Work Order</th></tr></thead>
                  <tbody>
                    {paged.map((sr: any, i: any) =>{
                      const linkedWO = wos.find((w: any) =>w.id===sr.work_order_id);
                      return (
                        <tr key={i} onClick={()=>router.push(`/operations/service-requests/${sr.id}`)} className="cursor-pointer">
                          <td>
                            <div className="font-semibold text-sm text-primary truncate">{sr.title||sr.id?.slice(0,20)}</div>
                            {sr.description&&<div className="text-xs text-tertiary truncate">{sr.description}</div>}
                          </td>
                          <td className="text-center"><span className={`tb-badge ${sr.priority==="critical"?"tb-badge-danger":sr.priority==="high"?"tb-badge-warning":"tb-badge-neutral"}`} style={{fontSize:"10px"}}>{sr.priority||"—"}</span></td>
                          <td className="text-center"><span className={`tb-badge ${sr.status==="resolved"?"tb-badge-success":sr.status==="in_progress"?"tb-badge-warning":sr.status==="open"?"tb-badge-info":"tb-badge-neutral"}`} style={{fontSize:"10px"}}>{(sr.status||"—").replace("_"," ")}</span></td>
                          <td className="text-center text-xs text-secondary truncate">{sr.requester_name||"—"}</td>
                          <td className="text-center text-xs text-tertiary">{fmtDate(sr.created_at)}</td>
                          <td className="text-center">{linkedWO?<span className="tb-badge tb-badge-success" style={{fontSize:"10px"}}>Linked</span>:<span className="text-tertiary text-xs">—</span>}</td>
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

        <div className="tb-grid-3">
          <div className="tb-section">
            <div className="tb-section-title">By Priority</div>
            <div className="flex flex-col gap-2">
              {["critical","high","medium","low"].map((p: any) =>{const cnt=srs.filter((s: any) =>s.priority===p).length;const pct=srs.length>0?(cnt/srs.length)*100:0;return(<div key={p}><div className="flex justify-between mb-1"><span className="text-xs text-secondary capitalize">{p}</span><span className="text-xs font-bold text-primary">{cnt}</span></div><div className="tb-progress"><div className="tb-progress-bar" style={{background:(PRIORITY_COLOR as Record<string, any>)[p],width:`${pct}%`}}/></div></div>);})}
            </div>
          </div>
          <div className="tb-section">
            <div className="tb-section-title">By Status</div>
            <div className="flex flex-col gap-2">
              {["open","in_progress","resolved","closed"].map((s: any) =>{const cnt=srs.filter((sr: any) =>sr.status===s).length;const pct=srs.length>0?(cnt/srs.length)*100:0;return(<div key={s}><div className="flex justify-between mb-1"><span className="text-xs text-secondary capitalize">{s.replace("_"," ")}</span><span className="text-xs font-bold text-primary">{cnt}</span></div><div className="tb-progress"><div className="tb-progress-bar" style={{background:(STATUS_COLOR as Record<string, any>)[s],width:`${pct}%`}}/></div></div>);})}
            </div>
          </div>
          <div className="tb-section">
            <div className="tb-section-title">Quick Actions</div>
            <div className="flex flex-col gap-2">
              {[{label:"Work Orders",icon:"🔧",path:"/operations/work-orders"},{label:"Dispatch",icon:"📋",path:"/operations/dispatch"},{label:"Technicians",icon:"👷",path:"/operations/technicians"},{label:"Assets",icon:"⚙️",path:"/maintenance/assets"}].map((a: any, i: number) =>(
                <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item"><span>{a.icon}</span><span className="text-sm text-secondary">{a.label}</span></button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showCreateSR && (
        <div onClick={()=>setShowCreateSR(false)} className="fixed inset-0 z-modal bg-overlay flex items-center justify-center p-5" style={{backdropFilter:"blur(4px)"}}>
          <div onClick={(e: any) =>e.stopPropagation()} className="tb-section w-full shadow-xl" style={{maxWidth:"520px"}}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-primary">New Service Request</h2>
              <button onClick={()=>setShowCreateSR(false)} className="tb-btn-ghost text-xl px-2">×</button>
            </div>
            <div className="flex flex-col gap-3.5">
              <div className="tb-form-group">
                <label className="tb-label">Title <span className="text-danger">*</span></label>
                <input value={newSR.title} onChange={(e: any) =>setNewSR({...newSR,title:e.target.value})} placeholder="Describe the issue..." className="tb-input" style={srErrors.title?{borderColor:"var(--color-danger)"}:{}} />
                {srErrors.title&&<div className="text-xs text-danger mt-1">{srErrors.title}</div>}
              </div>
              <div className="tb-form-grid">
                <div className="tb-form-group">
                  <label className="tb-label">Category</label>
                  <select value={newSR.category} onChange={(e: any) =>setNewSR({...newSR,category:e.target.value})} className="tb-select">
                    {["HVAC","Electrical","Plumbing","Fire","Civil","IT","General","Other"].map((c: any) =><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="tb-form-group">
                  <label className="tb-label">Urgency</label>
                  <select value={newSR.urgency} onChange={(e: any) =>setNewSR({...newSR,urgency:e.target.value})} className="tb-select">
                    {["emergency","critical","high","normal","low"].map((u: any) =><option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Requested By <span className="text-danger">*</span></label>
                <input value={newSR.submitted_by} onChange={(e: any) =>setNewSR({...newSR,submitted_by:e.target.value})} placeholder="Name of requester..." className="tb-input" style={srErrors.submitted_by?{borderColor:"var(--color-danger)"}:{}} />
                {srErrors.submitted_by&&<div className="text-xs text-danger mt-1">{srErrors.submitted_by}</div>}
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Description</label>
                <textarea value={newSR.description} onChange={(e: any) =>setNewSR({...newSR,description:e.target.value})} placeholder="Additional details..." rows={3} className="tb-input" style={{resize:"vertical"}} />
              </div>
              <div className="tb-action-bar mt-1">
                <button onClick={handleCreateSR} disabled={createSR.isLoading} className="tb-btn tb-btn-primary flex-1 justify-center">
                  {createSR.isLoading?"Creating...":"Create Service Request"}
                </button>
                <button onClick={()=>setShowCreateSR(false)} className="tb-btn tb-btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
