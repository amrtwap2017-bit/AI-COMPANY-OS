"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";

const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [payForm, setPayForm] = useState({amount:"",method:"bank_transfer",reference:"",notes:""});
  const [showPay, setShowPay] = useState(false);

  const { data: inv, isLoading } = useQuery(["invoice-detail",id], ()=>authFetch(`/api/v1/supplier-invoices/${id}`).then(r=>r.json()), {staleTime:30000});
  const matchMut   = useMutation(()=>authFetch(`/api/v1/supplier-invoices/${id}/match`,{method:"POST"}).then(r=>r.json()), {onSuccess:()=>qc.invalidateQueries(["invoice-detail",id])});
  const approveMut = useMutation((action)=>authFetch(`/api/v1/supplier-invoices/${id}/approve`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,approved_by:"amr@triangleblack.com"})}).then(r=>r.json()), {onSuccess:()=>qc.invalidateQueries(["invoice-detail",id])});
  const payMut     = useMutation((payload)=>authFetch(`/api/v1/supplier-invoices/${id}/pay`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}).then(r=>r.json()), {onSuccess:()=>{qc.invalidateQueries(["invoice-detail",id]);setShowPay(false);setPayForm({amount:"",method:"bank_transfer",reference:"",notes:""});}});
  const deleteMut  = useMutation(()=>authFetch(`/api/v1/supplier-invoices/v2/${id}`,{method:"DELETE"}), {onSuccess:()=>router.push("/supply-chain/invoices")});

  if (isLoading) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="text-secondary">Loading invoice…</div></div>;
  if (!inv||inv.error) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="text-tertiary">Invoice not found</div></div>;

  const overdue = inv.due_date&&new Date(inv.due_date)<new Date()&&inv.payment_status!=="paid";
  const lines = inv.line_items||[];
  const payments = inv.payments||[];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <button onClick={()=>router.push("/supply-chain/invoices")} className="tb-btn tb-btn-ghost tb-btn-sm">← Invoices</button>
            <a href={`/api/v1/pdf/invoice/${id}`} target="_blank" rel="noopener noreferrer" className="tb-btn tb-btn-secondary tb-btn-sm">📄 Export PDF</a>
            <button onClick={()=>{if(window.confirm("Delete this invoice? This cannot be undone.")) deleteMut.mutate();}} disabled={deleteMut.isLoading} className="tb-btn tb-btn-danger tb-btn-sm">
              {deleteMut.isLoading?"Deleting…":"🗑 Delete"}
            </button>
            <div className="ml-auto flex gap-2 flex-wrap">
              {(inv.status==="submitted"||inv.status==="matching")&&<button onClick={()=>matchMut.mutate()} disabled={matchMut.isLoading} className="tb-btn tb-btn-primary tb-btn-sm" style={{background:"#7C3AED"}}>{matchMut.isLoading?"Matching…":"⚡ Run 3-Way Match"}</button>}
              {inv.status==="matching"&&inv.match_result==="matched"&&<button onClick={()=>approveMut.mutate("approve")} disabled={approveMut.isLoading} className="tb-btn tb-btn-primary tb-btn-sm" style={{background:"var(--color-success)"}}>✓ Approve</button>}
              {inv.status==="matching"&&inv.match_result==="mismatch"&&<button onClick={()=>approveMut.mutate("reject")} disabled={approveMut.isLoading} className="tb-btn tb-btn-danger tb-btn-sm">✗ Reject</button>}
              {inv.status==="approved"&&inv.payment_status!=="paid"&&<button onClick={()=>setShowPay(!showPay)} className="tb-btn tb-btn-primary tb-btn-sm" style={{background:"#0369A1"}}>💳 Record Payment</button>}
            </div>
          </div>

          <div className="text-label-upper text-brand mb-1.5">Supplier Invoice</div>
          <h1 className="tb-hero-title mb-2">{inv.invoice_number}</h1>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <StatusBadge status={inv.status||"draft"} />
            <span className={`tb-badge ${inv.match_result==="matched"?"tb-badge-success":inv.match_result==="mismatch"?"tb-badge-danger":"tb-badge-neutral"}`}>Match: {inv.match_result||"pending"}</span>
            <span className="text-xs text-tertiary">Vendor: {inv.vendor_name||"—"}</span>
            {overdue&&<span className="tb-badge tb-badge-danger">⚠ OVERDUE</span>}
          </div>
          <div className="tb-grid-4">
            {[{label:"Invoice Total",value:fmtEGP(inv.total_amount||0)},{label:"PO Total",value:fmtEGP(inv.po_total||0)},{label:"Balance Due",value:fmtEGP(inv.balance_due||0),warn:Number(inv.balance_due||0)>0},{label:"Variance",value:`${inv.match_variance_pct||0}%`,danger:Number(inv.match_variance_pct||0)>2}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.danger?"var(--color-danger)":k.warn?"var(--color-warning)":"var(--color-text-inv)",fontSize:"1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {showPay && (
          <div className="tb-section mb-4" style={{borderColor:"rgba(3,105,161,0.25)",background:"rgba(3,105,161,0.05)"}}>
            <div className="tb-section-title text-info">Record Payment</div>
            <div className="tb-form-grid mt-3">
              <div className="tb-form-group">
                <label className="tb-label">Amount (EGP) <span className="text-danger">*</span></label>
                <input type="number" className="tb-input" placeholder={`Max: ${fmtEGP(inv.balance_due||0)}`} value={payForm.amount} onChange={(e: any) =>setPayForm({...payForm,amount:e.target.value})} />
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Payment Method</label>
                <select className="tb-select" value={payForm.method} onChange={(e: any) =>setPayForm({...payForm,method:e.target.value})}>
                  {["bank_transfer","cheque","cash","online"].map((m: any) =><option key={m} value={m}>{m.replace("_"," ")}</option>)}
                </select>
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Reference No.</label>
                <input className="tb-input" value={payForm.reference} onChange={(e: any) =>setPayForm({...payForm,reference:e.target.value})} placeholder="Bank ref / cheque no." />
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Notes</label>
                <input className="tb-input" value={payForm.notes} onChange={(e: any) =>setPayForm({...payForm,notes:e.target.value})} />
              </div>
            </div>
            <div className="tb-action-bar mt-3">
              <button onClick={()=>payMut.mutate({...payForm,amount:Number(payForm.amount),recorded_by:"amr@triangleblack.com",vendor_id:inv.vendor_id})} disabled={!payForm.amount||payMut.isLoading} className="tb-btn tb-btn-primary tb-btn-sm">Confirm Payment ✓</button>
              <button onClick={()=>setShowPay(false)} className="tb-btn tb-btn-secondary tb-btn-sm">Cancel</button>
            </div>
          </div>
        )}

        {matchMut.data && (
          <div className={`tb-alert ${matchMut.data.approved_for_payment?"tb-alert-success":"tb-alert-danger"} mb-4`}>
            <div>
              <div className="font-bold">{matchMut.data.approved_for_payment?"✅ 3-Way Match PASSED — Ready for Approval":"❌ 3-Way Match FAILED — Review Required"}</div>
              <div className="text-xs opacity-80 mt-0.5">{matchMut.data.match_notes}</div>
            </div>
          </div>
        )}

        <div className="tb-tabs mb-4">
          {[{k:"overview",l:"Overview"},{k:"lines",l:"Line Items"},{k:"payments",l:"Payments"},{k:"match",l:"Match Details"}].map((t: any) =>(
            <button key={t.k} onClick={()=>setActiveTab(t.k)} className={`tb-tab ${activeTab===t.k?"active":""}`}>{t.l}</button>
          ))}
        </div>

        {activeTab==="overview" && (
          <div className="tb-section">
            <div className="tb-section-title">Invoice Details</div>
            {[["Invoice No.",inv.invoice_number],["Vendor Invoice",inv.vendor_invoice_number],["Vendor",inv.vendor_name],["Invoice Date",fmtDate(inv.invoice_date)],["Due Date",fmtDate(inv.due_date)],["Currency",inv.currency||"EGP"],["Subtotal",fmtEGP(inv.subtotal||0)],[`VAT (${inv.vat_pct||14}%)`,fmtEGP(inv.vat_amount||0)],["Total Amount",fmtEGP(inv.total_amount||0)],["Net Payable",fmtEGP(inv.net_payable||0)],["Amount Paid",fmtEGP(inv.amount_paid||0)],["Balance Due",fmtEGP(inv.balance_due||0)],["Approved By",inv.approved_by],["Notes",inv.notes]].map((row: any, i: any) =>row[1]&&(
              <div key={i} className="tb-detail-row">
                <span className="tb-detail-key">{row[0]}</span>
                <span className="tb-detail-value">{row[1]}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab==="lines" && (
          <div className="tb-section">
            <div className="tb-section-title">Line Items</div>
            {lines.length===0 ? <div className="tb-empty"><div className="tb-empty-icon">📋</div><div className="tb-empty-title">No line items</div></div> : (
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead><tr><th>Description</th><th style={{textAlign:"center"}}>Unit</th><th style={{textAlign:"center"}}>Invoiced</th><th style={{textAlign:"center"}}>PO Qty</th><th style={{textAlign:"center"}}>GRN Qty</th><th style={{textAlign:"right"}}>Unit Price</th><th style={{textAlign:"right"}}>Total</th></tr></thead>
                  <tbody>
                    {lines.map((line,i)=>{
                      const isOk = line.match_status==="matched";
                      return (
                        <tr key={i} style={{borderLeft:isOk?"3px solid var(--color-success-border)":line.match_status&&line.match_status!=="matched"?"3px solid var(--color-danger-border)":"3px solid transparent"}}>
                          <td className="text-sm text-primary">{line.description}</td>
                          <td className="text-center text-xs text-secondary">{line.unit}</td>
                          <td className="text-center text-sm text-secondary">{line.invoiced_qty}</td>
                          <td className="text-center text-sm text-secondary">{line.po_qty||"—"}</td>
                          <td className="text-center text-sm text-secondary">{line.grn_accepted_qty||"—"}</td>
                          <td className="text-right text-sm text-secondary">{Number(line.unit_price||0).toLocaleString()}</td>
                          <td className="text-right text-sm font-bold text-success">{fmtEGP(line.total_amount||0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab==="payments" && (
          <div className="tb-section">
            <div className="tb-section-title">Payment History</div>
            {payments.length===0 ? (
              <div className="tb-empty"><div className="tb-empty-icon">💳</div><div className="tb-empty-title">No payments recorded</div></div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                {payments.map((pay,i)=>(
                  <div key={i} className="flex items-center gap-4 p-3 bg-surface-alt rounded-lg border border-default">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-primary">{fmtEGP(pay.amount||0)}</div>
                      <div className="text-xs text-tertiary">{pay.payment_method?.replace("_"," ")} · {fmtDate(pay.payment_date)} · Ref: {pay.reference_number||"—"}</div>
                    </div>
                    <span className="tb-badge tb-badge-success" style={{fontSize:"9px"}}>PAID</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-default flex justify-between text-sm font-bold">
                  <span className="text-secondary">Total Paid</span>
                  <span className="text-success">{fmtEGP(inv.amount_paid||0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-secondary">Balance Due</span>
                  <span style={{color:Number(inv.balance_due||0)>0?"var(--color-warning)":"var(--color-success)"}}>{fmtEGP(inv.balance_due||0)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab==="match" && (
          <div className="tb-section">
            <div className="tb-section-title">3-Way Match Details</div>
            <div className="flex flex-col gap-3 mt-3">
              {[{label:"Invoice Amount",value:inv.total_amount||0,color:"var(--color-info)"},{label:"PO Amount",value:inv.po_total||0,color:"var(--color-brand)"},{label:"GRN Amount",value:inv.grn_total||0,color:"var(--color-warning)"}].map((row: any, i: any) =>(
                <div key={i} className="flex items-center gap-4 p-3 bg-surface-alt rounded-lg">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:row.color}} />
                  <div className="flex-1 text-sm text-secondary">{row.label}</div>
                  <div className="text-sm font-bold text-primary">{fmtEGP(row.value)}</div>
                </div>
              ))}
              <div className={`tb-alert ${inv.match_result==="matched"?"tb-alert-success":"tb-alert-danger"} mt-2`}>
                <div>
                  <div className="font-bold">Match Result: {(inv.match_result||"pending").toUpperCase()}</div>
                  <div className="text-xs opacity-80 mt-0.5">{inv.match_notes||"Run 3-way match to validate this invoice."}</div>
                  {Number(inv.match_variance_pct||0)>0&&(
                    <div className="text-xs mt-1" style={{color:Number(inv.match_variance_pct||0)>2?"var(--color-danger)":"var(--color-warning)"}}>
                      Variance: {inv.match_variance_pct}% {Number(inv.match_variance_pct||0)<=2?"(within tolerance)":"(exceeds 2% tolerance)"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
