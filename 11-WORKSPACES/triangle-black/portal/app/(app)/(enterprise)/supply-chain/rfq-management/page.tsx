"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function RFQManagementPage() {
  const router = useRouter();
  const [showNewRFQ, setShowNewRFQ] = useState(false);
  const [newRFQ, setNewRFQ] = useState({title:"",rfq_type:"open",currency:"EGP",total_budget:0,submission_deadline:"",delivery_location:""});
  const [filter, setFilter] = useState("all");
  const qc = useQueryClient();

  const createRFQ = useMutation(
    (payload)=>import("@/lib/hooks/useAuthFetch").then(m=>m.authFetch("/api/v1/rfq/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})).then(r => r.data ?? r),
    {onSuccess:(d)=>{if(d.id||d.rfq_number){toast.success("RFQ created successfully");setShowNewRFQ(false);qc.invalidateQueries(["rfq-list"]);}else{toast.error(d.detail||"Failed to create RFQ");}},onError:()=>toast.error("Connection error")}
  );

  const { data: raw, isLoading } = useQuery(["rfq-list"],()=>authFetch("/api/v1/rfq/").then(r => r.data ?? r),{staleTime:60000});
  const rfqs = toArr(raw);
  const filtered = filter==="all"?rfqs:rfqs.filter((r: any) =>r.status===filter);

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain · Procurement</div>
              <h1 className="tb-hero-title">Request for Quotation</h1>
              <p className="tb-hero-description">{rfqs.length} RFQs · Competitive bidding process</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>router.push("/supply-chain/procurement")} className="tb-btn tb-btn-secondary">← Back</button>
              <button onClick={()=>setShowNewRFQ(true)} className="tb-btn tb-btn-primary">+ New RFQ</button>
            </div>
          </div>
          <div className="tb-grid-4">
            {[{label:"Total",value:rfqs.length},{label:"Active",value:rfqs.filter((r: any) =>r.status==="sent").length,color:"var(--color-info)"},{label:"With Quotes",value:rfqs.filter((r: any) =>r.status==="responses_received").length,color:"var(--color-warning)"},{label:"Awarded",value:rfqs.filter((r: any) =>r.status==="awarded").length,color:"var(--color-success)"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color||"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-tabs mb-4">
            {["all","draft","sent","responses_received","evaluated","awarded"].map((f: any) =>(
              <button key={f} onClick={()=>setFilter(f)} className={`tb-tab ${filter===f?"active":""}`}>
                {f==="all"?"All":f.replace(/_/g," ")}
                {f!=="all"&&<span className="ml-1 opacity-60">{rfqs.filter((r: any) =>r.status===f).length}</span>}
              </button>
            ))}
          </div>
          {isLoading ? (
            <div className="flex flex-col gap-3">{[1,2,3].map((i: any) =><div key={i} className="tb-shimmer tb-shimmer-block" style={{height:56}} />)}</div>
          ) : filtered.length===0 ? (
            <div className="tb-empty"><div className="tb-empty-icon">📝</div><div className="tb-empty-title">No RFQs found</div><div className="tb-empty-desc">Create an RFQ to request vendor quotations</div></div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((r: any, i: number) =>(
                <button key={i} onClick={()=>router.push("/supply-chain/rfq-management/"+r.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-alt tb-hover-lift text-left border border-transparent hover:border-default">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-bold text-primary truncate">{r.title}</div>
                      <span className={`tb-badge flex-shrink-0 ${r.status==="awarded"?"tb-badge-success":r.status==="responses_received"?"tb-badge-warning":r.status==="sent"?"tb-badge-info":"tb-badge-neutral"}`} style={{fontSize:"9px"}}>{(r.status||"").replace(/_/g," ")}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-tertiary">
                      <span>{r.rfq_number||"—"}</span>
                      <span>{r.rfq_type||"open"}</span>
                      <span>Deadline: {fmtDate(r.submission_deadline)}</span>
                    </div>
                  </div>
                  <span className="text-xs text-brand flex-shrink-0">View →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showNewRFQ && (
        <div onClick={()=>setShowNewRFQ(false)} className="fixed inset-0 z-modal bg-overlay flex items-center justify-center p-5" style={{backdropFilter:"blur(4px)"}}>
          <div onClick={(e: any) =>e.stopPropagation()} className="tb-section w-full shadow-xl" style={{maxWidth:"500px"}}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-primary">New Request for Quotation</h2>
              <button onClick={()=>setShowNewRFQ(false)} className="tb-btn-ghost text-xl px-2">×</button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="tb-form-group">
                <label className="tb-label">Title <span className="text-danger">*</span></label>
                <input value={newRFQ.title} onChange={(e: any) =>setNewRFQ({...newRFQ,title:e.target.value})} placeholder="e.g. HVAC Spare Parts Q4 2026" className="tb-input" />
              </div>
              <div className="tb-form-grid">
                <div className="tb-form-group">
                  <label className="tb-label">Type</label>
                  <select value={newRFQ.rfq_type} onChange={(e: any) =>setNewRFQ({...newRFQ,rfq_type:e.target.value})} className="tb-select">
                    {["open","selective","direct"].map((t: any) =><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="tb-form-group">
                  <label className="tb-label">Budget (EGP)</label>
                  <input type="number" value={newRFQ.total_budget} onChange={(e: any) =>setNewRFQ({...newRFQ,total_budget:Number(e.target.value)})} className="tb-input" />
                </div>
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Delivery Location</label>
                <input value={newRFQ.delivery_location} onChange={(e: any) =>setNewRFQ({...newRFQ,delivery_location:e.target.value})} placeholder="Site and location" className="tb-input" />
              </div>
              <div className="tb-action-bar mt-1">
                <button onClick={()=>{if(!newRFQ.title.trim()){toast.error("Title required");return;}createRFQ.mutate({...newRFQ,hotel_id:"tb-default-hotel-000000000001",status:"draft",prepared_by:"amr@triangleblack.com",evaluation_criteria:"best_value"});}} disabled={createRFQ.isLoading} className="tb-btn tb-btn-primary flex-1 justify-center">
                  {createRFQ.isLoading?"Creating...":"Create RFQ"}
                </button>
                <button onClick={()=>setShowNewRFQ(false)} className="tb-btn tb-btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
