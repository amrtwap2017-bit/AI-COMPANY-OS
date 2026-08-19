
"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const SC = {draft:"#6D5F53",sent:"#5B7C8C",responses_received:"#B07A2A",evaluated:"#8D7443",awarded:"#547C4D",cancelled:"#A84A3D"};
export default function RFQDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("items");
  const [awardingId, setAwardingId] = useState(null);
  const { data: rfq, isLoading } = useQuery(
    ["rfq-detail", id],
    () => authFetch(`/api/v1/rfq/${id}/bid-comparison`).then(r=>r.json()),
    { staleTime: 30000 }
  );
  const awardMut = useMutation(
    (payload) => authFetch(`/api/v1/rfq/${id}/award`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({...payload, awarded_by:"amr@triangleblack.com"})
    }).then(r=>r.json()),
    { onSuccess: () => { qc.invalidateQueries(["rfq-detail",id]); setAwardingId(null); } }
  );
  if (isLoading) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="text-secondary text-sm animate-pulse">Loading RFQ…</div></div>;
  if (!rfq || rfq.error) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="text-tertiary">RFQ not found</div></div>;
  const sc = SC[rfq.status]||"#6D5F53";
  const quotes = rfq.quotations || [];
  const items = rfq.rfq_items || [];
  const lowest = rfq.lowest_price || 0;
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#221D1A 0%,#221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <button onClick={()=>router.push("/supply-chain/rfq-management")} className="tb-btn-secondary">← RFQ List</button>
          </div>
          <div className="text-label-upper text-emerald-400 mb-1">RFQ</div>
          <h1 className="tb-hero-title mb-2">{rfq.title}</h1>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="tb-badge" style={{background:sc+"18",color:sc,border:`1px solid ${sc}30`}}>{(rfq.status||"").replace(/_/g," ")}</span>
            <span className="text-xs text-tertiary">{rfq.rfq_number}</span>
            <span className="text-xs text-tertiary">Deadline: {fmtDate(rfq.submission_deadline)}</span>
            <span className="text-xs text-tertiary">{rfq.rfq_type}</span>
          </div>
          <div className="tb-grid-4">
            {[
              {label:"Line Items",value:items.length,color:"#5B7C8C"},
              {label:"Quotations",value:quotes.length,color:"#B07A2A"},
              {label:"Lowest Bid",value:fmtEGP(lowest),color:"#547C4D"},
              {label:"Budget",value:fmtEGP(rfq.total_budget||0),color:"#8D7443"},
            ].map((k: any, i: number) =>(
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
          {["items","comparison","details"].map((tab: any) =>(
            <button key={tab} onClick={()=>setActiveTab(tab)} className={"tb-pill "+(activeTab===tab?"tb-pill--active":"")}>
              {tab==="items"?"RFQ Items":tab==="comparison"?"Bid Comparison":"Details"}
            </button>
          ))}
        </div>
        {activeTab === "items" && (
          <div className="tb-section">
            <div className="tb-section-title">Requested Items</div>
            {items.length===0 ? <div className="tb-empty"><div className="tb-empty-icon">📝</div><div className="tb-empty-title">No items</div></div> : (
              <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
                <div className="tb-table-head" style={{gridTemplateColumns:"40px 1fr 80px 80px 120px"}}>
                  {["#","Description","Unit","Qty","Est. Price"].map((h: any, i: number) =>(
                    <div key={i} className="tb-table-head-cell" style={{textAlign:i>1?"center":"left"}}>{h}</div>
                  ))}
                </div>
                {items.map((item: any, i: number) =>(
                  <div key={i} className="tb-table-row" style={{gridTemplateColumns:"40px 1fr 80px 80px 120px"}}>
                    <div className="text-xs text-tertiary">{item.item_number||i+1}</div>
                    <div className="text-sm text-primary">{item.description}</div>
                    <div className="text-center text-xs text-secondary">{item.unit}</div>
                    <div className="text-center text-sm text-secondary">{item.quantity}</div>
                    <div className="text-center text-sm text-secondary">{fmtEGP(item.estimated_unit_price||0)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "comparison" && (
          <div className="tb-section">
            <div className="tb-section-title">Bid Comparison — {quotes.length} Quotations</div>
            {quotes.length===0 ? <div className="tb-empty"><div className="tb-empty-icon">⚖️</div><div className="tb-empty-title">No quotations received yet</div></div> : (
              <div className="space-y-3 mt-3">
                {quotes.map((q: any, i: number) =>{
                  const isLowest = Number(q.total_amount||0) === lowest && lowest > 0;
                  const savings = lowest > 0 ? ((Number(q.total_amount||0)-lowest)/lowest*100) : 0;
                  return (
                    <div key={i} className="p-4 rounded-xl border transition-colors" style={{background: q.is_selected?"#547C4D08":"rgba(255,255,255,0.02)", borderColor: q.is_selected?"#547C4D40":isLowest?"#B07A2A40":"rgba(255,255,255,0.06)"}}>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div>
                          <div className="text-sm font-bold text-primary flex items-center gap-2">
                            {q.vendor_name||"Unknown Vendor"}
                            {isLowest && <span className="tb-badge" style={{background:"#B07A2A18",color:"#B07A2A",fontSize:"0.5rem"}}>LOWEST</span>}
                            {q.is_selected && <span className="tb-badge" style={{background:"#547C4D18",color:"#547C4D",fontSize:"0.5rem"}}>SELECTED</span>}
                          </div>
                          <div className="text-xs text-tertiary">{q.quotation_number||"—"} · {q.delivery_days||7} days delivery · {q.payment_terms||30} days payment</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-black text-emerald-400">{fmtEGP(q.total_amount||0)}</div>
                          {savings > 0 && <div className="text-xs text-red-400">+{savings.toFixed(1)}% vs lowest</div>}
                        </div>
                      </div>
                      {rfq.status !== "awarded" && !q.is_selected && (
                        <button
                          onClick={()=>awardMut.mutate({vendor_id:q.vendor_id,quotation_id:q.id})}
                          disabled={awardMut.isLoading}
                          className="tb-btn-primary w-full mt-2" style={{fontSize:"0.75rem",padding:"8px"}}>
                          Award to {q.vendor_name} →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {activeTab === "details" && (
          <div className="tb-section space-y-2">
            <div className="tb-section-title">RFQ Details</div>
            {[
              {label:"Type",value:rfq.rfq_type},
              {label:"Evaluation",value:rfq.evaluation_criteria},
              {label:"Submission Deadline",value:fmtDate(rfq.submission_deadline)},
              {label:"Delivery Required",value:fmtDate(rfq.delivery_required)},
              {label:"Delivery Location",value:rfq.delivery_location},
              {label:"Terms",value:rfq.terms_conditions},
              {label:"Prepared By",value:rfq.prepared_by},
              {label:"Created",value:fmtDate(rfq.created_at)},
            ].map((row: any, i: any) =>row.value&&(
              <div key={i} className="flex gap-4 py-2 border-b border-border">
                <span className="text-xs text-tertiary w-36 flex-shrink-0">{row.label}</span>
                <span className="text-sm text-primary">{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
