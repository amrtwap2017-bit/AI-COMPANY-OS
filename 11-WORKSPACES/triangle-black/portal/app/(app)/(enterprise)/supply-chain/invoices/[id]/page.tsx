"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const SC = {draft:"#94A3B8",submitted:"#60A5FA",matching:"#A78BFA",matched:"#34D399",mismatch:"#F87171",approved:"#34D399",rejected:"#F87171",paid:"#10B981"};
const MC = {matched:"#34D399",partial:"#FBBF24",mismatch:"#F87171",pending:"#94A3B8"};
export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [payForm, setPayForm] = useState({amount:"",method:"bank_transfer",reference:"",notes:""});
  const [showPay, setShowPay] = useState(false);
  const { data: inv, isLoading } = useQuery(
    ["invoice-detail", id],
    () => authFetch(`/api/v1/supplier-invoices/${id}`).then(r=>r.json()),
    { staleTime: 30000 }
  );
  const matchMut = useMutation(
    () => authFetch(`/api/v1/supplier-invoices/${id}/match`, {method:"POST"}).then(r=>r.json()),
    { onSuccess: () => qc.invalidateQueries(["invoice-detail", id]) }
  );
  const approveMut = useMutation(
    (action) => authFetch(`/api/v1/supplier-invoices/${id}/approve`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({action, approved_by:"amr@triangleblack.com"})
    }).then(r=>r.json()),
    { onSuccess: () => qc.invalidateQueries(["invoice-detail", id]) }
  );
  const payMut = useMutation(
    (payload) => authFetch(`/api/v1/supplier-invoices/${id}/pay`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
    }).then(r=>r.json()),
    { onSuccess: () => { qc.invalidateQueries(["invoice-detail",id]); setShowPay(false); setPayForm({amount:"",method:"bank_transfer",reference:"",notes:""}); }}
  );
  const deleteMut = useMutation(
    () => authFetch(`/api/v1/supplier-invoices/v2/${id}`, { method: "DELETE" }),
    { onSuccess: () => router.push("/supply-chain/invoices") }
  );

    if (isLoading) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="text-secondary animate-pulse">Loading invoice…</div></div>;
  if (!inv || inv.error) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="text-tertiary">Invoice not found</div></div>;
  const sc = SC[inv.status]||"#94A3B8";
  const mc = MC[inv.match_result]||"#94A3B8";
  const lines = inv.line_items || [];
  const payments = inv.payments || [];
  const overdue = inv.due_date && new Date(inv.due_date) < new Date() && inv.payment_status !== "paid";
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A 0%,#0D1A2A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <button onClick={()=>router.push("/supply-chain/invoices")} className="tb-btn-secondary">← Invoices</button>
            <a href={`/api/v1/pdf/invoice/${id}`} target="_blank" rel="noopener noreferrer" className="tb-btn-secondary" style={{fontSize:"0.75rem",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"4px"}}>📄 Export PDF</a>
            <button
              onClick={()=>{ if(window.confirm("Delete this invoice? This cannot be undone.")) deleteMut.mutate(); }}
              disabled={deleteMut.isLoading}
              className="tb-btn-secondary"
              style={{borderColor:"#F87171",color:"#F87171",fontSize:"0.75rem"}}>
              {deleteMut.isLoading?"Deleting…":"🗑 Delete"}
            </button>
            <div className="flex gap-2 flex-wrap">
              {(inv.status==="submitted"||inv.status==="matching") && (
                <button onClick={()=>matchMut.mutate()} disabled={matchMut.isLoading} className="tb-btn-primary" style={{background:"#7C3AED",fontSize:"0.75rem"}}>
                  {matchMut.isLoading?"Matching…":"⚡ Run 3-Way Match"}
                </button>
              )}
              {inv.status==="matching" && inv.match_result==="matched" && (
                <button onClick={()=>approveMut.mutate("approve")} disabled={approveMut.isLoading} className="tb-btn-primary" style={{background:"#16A34A",fontSize:"0.75rem"}}>✓ Approve</button>
              )}
              {inv.status==="matching" && inv.match_result==="mismatch" && (
                <button onClick={()=>approveMut.mutate("reject")} disabled={approveMut.isLoading} className="tb-btn-secondary" style={{borderColor:"#F87171",color:"#F87171",fontSize:"0.75rem"}}>✗ Reject</button>
              )}
              {inv.status==="approved" && inv.payment_status!=="paid" && (
                <button onClick={()=>setShowPay(!showPay)} className="tb-btn-primary" style={{background:"#0369A1",fontSize:"0.75rem"}}>💳 Record Payment</button>
              )}
            </div>
          </div>
          <div className="text-label-upper text-blue-400 mb-1">Supplier Invoice</div>
          <h1 className="tb-hero-title mb-2">{inv.invoice_number}</h1>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="tb-badge" style={{background:sc+"18",color:sc,border:`1px solid ${sc}30`}}>{inv.status}</span>
            <span className="tb-badge" style={{background:mc+"18",color:mc,border:`1px solid ${mc}30`}}>Match: {inv.match_result||"pending"}</span>
            <span className="text-xs text-tertiary">Vendor: {inv.vendor_name||"—"}</span>
            {overdue && <span className="tb-badge" style={{background:"#F8717118",color:"#F87171"}}>⚠ OVERDUE</span>}
          </div>
          <div className="tb-grid-4">
            {[
              {label:"Invoice Total",value:fmtEGP(inv.total_amount||0),color:"#60A5FA"},
              {label:"PO Total",value:fmtEGP(inv.po_total||0),color:"#A78BFA"},
              {label:"Balance Due",value:fmtEGP(inv.balance_due||0),color:Number(inv.balance_due||0)>0?"#FBBF24":"#34D399"},
              {label:"Variance",value:`${inv.match_variance_pct||0}%`,color:Number(inv.match_variance_pct||0)>2?"#F87171":Number(inv.match_variance_pct||0)>0?"#FBBF24":"#34D399"},
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
        {showPay && (
          <div className="tb-section mb-4" style={{borderColor:"#0369A140",background:"#0369A108"}}>
            <div className="tb-section-title" style={{color:"#60A5FA"}}>Record Payment</div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div><label className="text-xs text-tertiary block mb-1">Amount (EGP) *</label><input type="number" className="tb-input w-full" placeholder={`Max: ${fmtEGP(inv.balance_due||0)}`} value={payForm.amount} onChange={e=>setPayForm({...payForm,amount:e.target.value})}/></div>
              <div><label className="text-xs text-tertiary block mb-1">Payment Method</label>
                <select className="tb-input w-full" value={payForm.method} onChange={e=>setPayForm({...payForm,method:e.target.value})}>
                  {["bank_transfer","cheque","cash","online"].map(m=><option key={m} value={m}>{m.replace("_"," ")}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-tertiary block mb-1">Reference No.</label><input className="tb-input w-full" value={payForm.reference} onChange={e=>setPayForm({...payForm,reference:e.target.value})} placeholder="Bank ref / cheque no."/></div>
              <div><label className="text-xs text-tertiary block mb-1">Notes</label><input className="tb-input w-full" value={payForm.notes} onChange={e=>setPayForm({...payForm,notes:e.target.value})}/></div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={()=>payMut.mutate({...payForm,amount:Number(payForm.amount),recorded_by:"amr@triangleblack.com",vendor_id:inv.vendor_id})} disabled={!payForm.amount||payMut.isLoading} className="tb-btn-primary" style={{fontSize:"0.75rem",padding:"6px 14px"}}>Confirm Payment ✓</button>
              <button onClick={()=>setShowPay(false)} className="tb-btn-secondary" style={{fontSize:"0.75rem",padding:"6px 12px"}}>Cancel</button>
            </div>
          </div>
        )}
        {matchMut.data && (
          <div className="tb-section mb-4" style={{borderColor:matchMut.data.approved_for_payment?"#34D39940":"#F8717140",background:matchMut.data.approved_for_payment?"#34D39908":"#F8717108"}}>
            <div className="text-sm font-bold" style={{color:matchMut.data.approved_for_payment?"#34D399":"#F87171"}}>
              {matchMut.data.approved_for_payment?"✅ 3-Way Match PASSED — Ready for Approval":"❌ 3-Way Match FAILED — Review Required"}
            </div>
            <div className="text-xs text-secondary mt-1">{matchMut.data.match_notes}</div>
          </div>
        )}
        <div className="flex gap-2 mb-4">
          {["overview","lines","payments","match"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} className={"tb-pill "+(activeTab===tab?"tb-pill--active":"")}>
              {tab==="overview"?"Overview":tab==="lines"?"Line Items":tab==="payments"?"Payments":"Match Details"}
            </button>
          ))}
        </div>
        {activeTab === "overview" && (
          <div className="tb-section space-y-2">
            <div className="tb-section-title">Invoice Details</div>
            {[
              {label:"Invoice No.",value:inv.invoice_number},
              {label:"Vendor Invoice",value:inv.vendor_invoice_number},
              {label:"Vendor",value:inv.vendor_name},
              {label:"Invoice Date",value:fmtDate(inv.invoice_date)},
              {label:"Due Date",value:fmtDate(inv.due_date)},
              {label:"Currency",value:inv.currency||"EGP"},
              {label:"Subtotal",value:fmtEGP(inv.subtotal||0)},
              {label:`VAT (${inv.vat_pct||14}%)`,value:fmtEGP(inv.vat_amount||0)},
              {label:"Total Amount",value:fmtEGP(inv.total_amount||0)},
              {label:"Net Payable",value:fmtEGP(inv.net_payable||0)},
              {label:"Amount Paid",value:fmtEGP(inv.amount_paid||0)},
              {label:"Balance Due",value:fmtEGP(inv.balance_due||0)},
              {label:"Approved By",value:inv.approved_by},
              {label:"Notes",value:inv.notes},
            ].map((row,i)=>row.value&&(
              <div key={i} className="flex gap-4 py-2 border-b border-border">
                <span className="text-xs text-tertiary w-36 flex-shrink-0">{row.label}</span>
                <span className="text-sm text-primary">{row.value}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === "lines" && (
          <div className="tb-section">
            <div className="tb-section-title">Line Items</div>
            {lines.length===0 ? <div className="tb-empty"><div className="tb-empty-icon">📋</div><div className="tb-empty-title">No line items</div></div> : (
              <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
                <div className="tb-table-head" style={{gridTemplateColumns:"1fr 60px 80px 80px 80px 100px 80px"}}>
                  {["Description","Unit","Invoiced","PO Qty","GRN Qty","Unit Price","Total"].map((h,i)=>(
                    <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                  ))}
                </div>
                {lines.map((line,i)=>{
                  const ms = line.match_status;
                  const lineColor = ms==="matched"?"#34D399":ms==="qty_mismatch"||ms==="price_mismatch"?"#F87171":"#94A3B8";
                  return (
                    <div key={i} className="tb-table-row" style={{gridTemplateColumns:"1fr 60px 80px 80px 80px 100px 80px",borderLeft:`3px solid ${lineColor}`}}>
                      <div className="text-sm text-primary truncate pr-2">{line.description}</div>
                      <div className="text-center text-xs text-secondary">{line.unit}</div>
                      <div className="text-center text-sm text-secondary">{line.invoiced_qty}</div>
                      <div className="text-center text-sm text-secondary">{line.po_qty||"—"}</div>
                      <div className="text-center text-sm text-secondary">{line.grn_accepted_qty||"—"}</div>
                      <div className="text-center text-sm text-secondary">{Number(line.unit_price||0).toLocaleString()}</div>
                      <div className="text-center text-sm font-bold text-emerald-400">{fmtEGP(line.total_amount||0)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {activeTab === "payments" && (
          <div className="tb-section">
            <div className="tb-section-title">Payment History</div>
            {payments.length===0 ? (
              <div className="tb-empty"><div className="tb-empty-icon">💳</div><div className="tb-empty-title">No payments recorded</div></div>
            ) : (
              <div className="space-y-2 mt-2">
                {payments.map((pay,i)=>(
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-base-alt border border-border">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-primary">{fmtEGP(pay.amount||0)}</div>
                      <div className="text-xs text-tertiary">{pay.payment_method?.replace("_"," ")} · {fmtDate(pay.payment_date)} · Ref: {pay.reference_number||"—"}</div>
                    </div>
                    <span className="tb-badge" style={{background:"#34D39918",color:"#34D399",fontSize:"0.5rem"}}>PAID</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border flex justify-between text-sm font-bold">
                  <span className="text-secondary">Total Paid</span>
                  <span className="text-emerald-400">{fmtEGP(inv.amount_paid||0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-secondary">Balance Due</span>
                  <span style={{color:Number(inv.balance_due||0)>0?"#FBBF24":"#34D399"}}>{fmtEGP(inv.balance_due||0)}</span>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "match" && (
          <div className="tb-section">
            <div className="tb-section-title">3-Way Match Details</div>
            <div className="space-y-3 mt-3">
              {[
                {label:"Invoice Amount",value:inv.total_amount||0,color:"#60A5FA"},
                {label:"PO Amount",value:inv.po_total||0,color:"#A78BFA"},
                {label:"GRN Amount",value:inv.grn_total||0,color:"#FBBF24"},
              ].map((row,i)=>(
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-base-alt">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:row.color}}/>
                  <div className="flex-1 text-sm text-secondary">{row.label}</div>
                  <div className="text-sm font-bold text-primary">{fmtEGP(row.value)}</div>
                </div>
              ))}
              <div className="p-4 rounded-xl mt-2" style={{background:inv.match_result==="matched"?"#34D39910":"#F8717110",border:`1px solid ${inv.match_result==="matched"?"#34D39930":"#F8717130"}`}}>
                <div className="text-sm font-bold mb-1" style={{color:MC[inv.match_result]||"#94A3B8"}}>
                  Match Result: {(inv.match_result||"pending").toUpperCase()}
                </div>
                <div className="text-xs text-secondary">{inv.match_notes||"Run 3-way match to validate this invoice."}</div>
                {Number(inv.match_variance_pct||0) > 0 && (
                  <div className="text-xs mt-1" style={{color:Number(inv.match_variance_pct||0)>2?"#F87171":"#FBBF24"}}>
                    Variance: {inv.match_variance_pct}% {Number(inv.match_variance_pct||0)<=2?"(within tolerance)":"(exceeds 2% tolerance)"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
