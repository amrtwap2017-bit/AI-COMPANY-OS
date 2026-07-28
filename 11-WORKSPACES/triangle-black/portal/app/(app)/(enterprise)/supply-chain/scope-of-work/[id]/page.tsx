
"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const SC = {draft:"#94A3B8",pending_approval:"#FBBF24",approved:"#34D399",rejected:"#F87171",sent_to_client:"#A78BFA"};
export default function SOWDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("boq");
  const { data: sow, isLoading } = useQuery(
    ["sow-detail", id],
    () => authFetch(`/api/v1/scope-of-work/${id}`).then(r=>r.json()),
    { staleTime: 30000 }
  );
  const approveMut = useMutation(
    (action) => authFetch(`/api/v1/scope-of-work/${id}/approve`, {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ action, approved_by: "amr@triangleblack.com" })
    }).then(r=>r.json()),
    { onSuccess: () => qc.invalidateQueries(["sow-detail", id]) }
  );
  const deleteMut = useMutation(
    () => authFetch(`/api/v1/scope-of-work/v2/${id}`, { method: "DELETE" }),
    { onSuccess: () => router.push("/supply-chain/scope-of-work") }
  );

    if (isLoading) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="text-secondary text-sm animate-pulse">Loading SOW…</div></div>;
  if (!sow || sow.error) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="text-tertiary">SOW not found</div></div>;
  const sc = SC[sow.status] || "#94A3B8";
  const boqItems = sow.boq_items || [];
  const boqTotal = boqItems.reduce((s,i) => s + Number(i.total_amount||0), 0);
  const overhead = boqTotal * (Number(sow.overhead_pct||0)/100);
  const profit = (boqTotal + overhead) * (Number(sow.profit_margin_pct||0)/100);
  const grandTotal = boqTotal + overhead + profit + Number(sow.labor_cost||0);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A 0%,#0D1A12 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <button onClick={()=>router.push("/supply-chain/scope-of-work")} className="tb-btn-secondary">← SOW List</button>
            <button
              onClick={()=>{ if(window.confirm("Delete this scope of work? This cannot be undone.")) deleteMut.mutate(); }}
              disabled={deleteMut.isLoading}
              className="tb-btn-secondary"
              style={{borderColor:"#F87171",color:"#F87171",fontSize:"0.75rem"}}>
              {deleteMut.isLoading?"Deleting…":"🗑 Delete"}
            </button>
            <div className="flex gap-2">
              {sow.status === "pending_approval" && (
                <>
                  <button onClick={()=>approveMut.mutate("approve")} className="tb-btn-primary" style={{background:"#16A34A"}}>✓ Approve</button>
                  <button onClick={()=>approveMut.mutate("reject")} className="tb-btn-secondary" style={{borderColor:"#F87171",color:"#F87171"}}>✗ Reject</button>
                </>
              )}
              {sow.status === "approved" && (
                <button className="tb-btn-primary" style={{background:"#7C3AED"}}>Send to Client →</button>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1">
              <div className="text-label-upper text-emerald-400 mb-1">Scope of Work</div>
              <h1 className="tb-hero-title mb-1">{sow.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="tb-badge" style={{background:sc+"18",color:sc,border:`1px solid ${sc}30`}}>{(sow.status||"").replace(/_/g," ")}</span>
                <span className="text-xs text-tertiary">{sow.sow_number}</span>
                <span className="text-xs text-tertiary">{sow.type}</span>
                <span className="text-xs text-tertiary">Client: {sow.client_name||"—"}</span>
              </div>
            </div>
          </div>
          <div className="tb-grid-4">
            {[
              {label:"BOQ Total",value:fmtEGP(boqTotal),color:"#60A5FA"},
              {label:"Labor Cost",value:fmtEGP(sow.labor_cost||0),color:"#FBBF24"},
              {label:"Grand Total",value:fmtEGP(sow.total_cost||grandTotal),color:"#34D399"},
              {label:"Est. Days",value:`${sow.estimated_days||0} days`,color:"#A78BFA"},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="flex gap-2 mb-4">
          {["boq","details","notes"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} className={"tb-pill "+(activeTab===tab?"tb-pill--active":"")}>
              {tab==="boq"?"Bill of Quantities":tab==="details"?"Details":"Notes"}
            </button>
          ))}
        </div>
        {activeTab === "boq" && (
          <div className="tb-section">
            <div className="tb-section-title">Bill of Quantities</div>
            {boqItems.length === 0 ? (
              <div className="tb-empty"><div className="tb-empty-icon">📋</div><div className="tb-empty-title">No BOQ items yet</div></div>
            ) : (
              <>
                <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
                  <div className="tb-table-head" style={{gridTemplateColumns:"40px 1fr 80px 100px 100px 110px"}}>
                    {["#","Description","Unit","Qty","Rate","Total"].map((h,i)=>(
                      <div key={i} className="tb-table-head-cell" style={{textAlign:i>1?"center":"left"}}>{h}</div>
                    ))}
                  </div>
                  {boqItems.map((item,i)=>(
                    <div key={i} className="tb-table-row" style={{gridTemplateColumns:"40px 1fr 80px 100px 100px 110px"}}>
                      <div className="text-xs text-tertiary">{item.item_number||i+1}</div>
                      <div className="text-sm text-primary">{item.description}</div>
                      <div className="text-center text-xs text-secondary">{item.unit}</div>
                      <div className="text-center text-sm text-secondary">{item.quantity}</div>
                      <div className="text-center text-sm text-secondary">{Number(item.unit_rate||0).toLocaleString()}</div>
                      <div className="text-center text-sm font-bold text-emerald-400">{fmtEGP(item.total_amount||0)}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 ml-auto max-w-xs space-y-1">
                  {[
                    {label:"BOQ Subtotal",value:boqTotal},
                    {label:`Labor Cost`,value:Number(sow.labor_cost||0)},
                    {label:`Overhead (${sow.overhead_pct||0}%)`,value:overhead},
                    {label:`Profit (${sow.profit_margin_pct||0}%)`,value:profit},
                  ].map((r,i)=>(
                    <div key={i} className="flex justify-between text-xs"><span className="text-tertiary">{r.label}</span><span className="text-secondary">{fmtEGP(r.value)}</span></div>
                  ))}
                  <div className="flex justify-between text-sm font-black pt-2 border-t border-border">
                    <span className="text-primary">Grand Total</span>
                    <span className="text-emerald-400">{fmtEGP(sow.total_cost||grandTotal)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {activeTab === "details" && (
          <div className="tb-section space-y-3">
            <div className="tb-section-title">SOW Details</div>
            {[
              {label:"Scope of Work",value:sow.scope_details},
              {label:"Exclusions",value:sow.exclusions},
              {label:"Assumptions",value:sow.assumptions},
              {label:"Validity",value:`${sow.validity_days||30} days`},
              {label:"Prepared By",value:sow.prepared_by},
              {label:"Approved By",value:sow.approved_by},
              {label:"Approved At",value:fmtDate(sow.approved_at)},
              {label:"Created",value:fmtDate(sow.created_at)},
            ].map((row,i)=>row.value&&(
              <div key={i} className="flex gap-4 py-2 border-b border-border">
                <span className="text-xs text-tertiary w-36 flex-shrink-0">{row.label}</span>
                <span className="text-sm text-primary">{row.value}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === "notes" && (
          <div className="tb-section">
            <div className="tb-section-title">Notes</div>
            <p className="text-sm text-secondary">{sow.notes||"No notes."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
