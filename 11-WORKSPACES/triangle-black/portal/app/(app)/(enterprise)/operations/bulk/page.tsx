"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { TableSkeleton, KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "@/lib/toast";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return d?new Date(d).toLocaleDateString("en-GB"):"—"; } catch { return "—"; } };

export default function BulkOperationsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [selected, setSelected] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState("open");
  const [bulkStatus, setBulkStatus] = useState("in_progress");

  const { data: rawWOs, isLoading } = useQuery({queryKey:["bulk-wos"],queryFn:()=>authFetch("/api/v1/work-orders/?limit=100").then(r=>r.json()),staleTime:30000});
  const { data: rawTechs } = useQuery({queryKey:["bulk-techs"],queryFn:()=>authFetch("/api/v1/technicians/").then(r=>r.json()).catch(()=>[]),staleTime:60000});

  const wos = toArr(rawWOs).filter(w=>!w.deleted_at);
  const techs = toArr(rawTechs).filter(t=>t.is_active);
  const filtered = filterStatus==="all"?wos:wos.filter(w=>w.status===filterStatus);

  const toggleAll = () => { if(selected.size===filtered.length) setSelected(new Set()); else setSelected(new Set(filtered.map(w=>w.id))); };
  const toggle = (id) => { const next=new Set(selected); next.has(id)?next.delete(id):next.add(id); setSelected(next); };

  const bulkStatusMut = useMutation({
    mutationFn: async()=>{ const ids=Array.from(selected); await Promise.all(ids.map(id=>authFetch(`/api/v1/work-orders/${id}/status`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:bulkStatus})}))); },
    onSuccess:()=>{ toast.success(`Updated ${selected.size} work orders to ${bulkStatus}`); qc.invalidateQueries(["bulk-wos"]); setSelected(new Set()); },
    onError:()=>toast.error("Bulk update failed"),
  });

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Bulk Operations</h1>
              <p className="tb-hero-description">Select multiple work orders · Apply batch actions</p>
            </div>
            <button onClick={()=>router.push("/operations/work-orders")} className="tb-btn tb-btn-secondary">← Work Orders</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{wos.length}</div><div className="tb-hero-kpi-label">Total WOs</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value text-brand">{selected.size}</div><div className="tb-hero-kpi-label">Selected</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{filtered.length}</div><div className="tb-hero-kpi-label">Filtered</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{techs.length}</div><div className="tb-hero-kpi-label">Technicians</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {selected.size>0 && (
          <div className="flex items-center gap-3 flex-wrap p-3 bg-brand/5 border border-brand/25 rounded-lg mb-4">
            <span className="text-sm font-bold text-brand">{selected.size} selected</span>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-secondary">Set status to:</span>
              <select value={bulkStatus} onChange={e=>setBulkStatus(e.target.value)} className="tb-select" style={{width:"auto",padding:"6px 10px"}}>
                {["in_progress","completed","cancelled","open"].map(s=><option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
              </select>
              <button onClick={()=>bulkStatusMut.mutate()} disabled={bulkStatusMut.isLoading} className="tb-btn tb-btn-primary tb-btn-sm">
                {bulkStatusMut.isLoading?"Updating...":"Apply"}
              </button>
            </div>
            <button onClick={()=>setSelected(new Set())} className="tb-btn tb-btn-ghost tb-btn-sm">Clear</button>
          </div>
        )}

        <div className="tb-tabs mb-4">
          {["all","open","in_progress","completed"].map(s=>(
            <button key={s} onClick={()=>{setFilterStatus(s);setSelected(new Set());}} className={`tb-tab ${filterStatus===s?"active":""}`}>
              {s==="all"?"All":s==="in_progress"?"In Progress":s.charAt(0).toUpperCase()+s.slice(1)}
              <span className="ml-1 opacity-60">{s==="all"?wos.length:wos.filter(w=>w.status===s).length}</span>
            </button>
          ))}
        </div>

        <div className="tb-section">
          {isLoading ? <TableSkeleton /> : filtered.length===0 ? (
            <EmptyState icon="🔧" title="No work orders" description="No work orders match current filter" />
          ) : (
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead>
                  <tr>
                    <th style={{width:40}}>
                      <input type="checkbox" checked={selected.size===filtered.length&&filtered.length>0} onChange={toggleAll} className="cursor-pointer" style={{width:16,height:16}} />
                    </th>
                    <th>Work Order</th><th>Priority</th><th>Status</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w,i)=>(
                    <tr key={w.id||i} className={selected.has(w.id)?"bg-brand/5":""} style={{borderLeft:selected.has(w.id)?"3px solid var(--color-brand)":"3px solid transparent"}}>
                      <td>
                        <input type="checkbox" checked={selected.has(w.id)} onChange={()=>toggle(w.id)} className="cursor-pointer" style={{width:16,height:16}} />
                      </td>
                      <td onClick={()=>router.push(`/operations/work-orders/${w.id}`)} className="cursor-pointer">
                        <div className="font-semibold text-sm text-primary">{(w.title||"Untitled").slice(0,50)}</div>
                        <div className="text-xs text-tertiary">{w.id?.slice(0,8)}</div>
                      </td>
                      <td><StatusBadge status={w.priority||"medium"} /></td>
                      <td><StatusBadge status={w.status||"open"} /></td>
                      <td className="text-xs text-tertiary">{fmtDate(w.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
