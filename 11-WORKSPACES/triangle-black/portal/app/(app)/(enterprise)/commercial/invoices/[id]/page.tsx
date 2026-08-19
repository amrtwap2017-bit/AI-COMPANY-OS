"use client";
// @ts-nocheck
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "@/lib/toast";
import { useRouter, useParams } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";

const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => { if (!d) return "—"; try { const dt=new Date(d); if(dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: inv, isLoading } = useQuery(["inv-detail",id], ()=>authFetch(`/api/v1/supplier-invoices/${id}`).then(r=>r.json()), {enabled:!!id});
  const approve = useMutation({
    mutationFn: ()=>authFetch(`/api/v1/supplier-invoices/${id}/approve`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"approve"})}).then(r=>r.json()),
    onSuccess: ()=>{ toast.success("Invoice approved"); window.location.reload(); },
  });
  const pay = useMutation({
    mutationFn: ()=>authFetch(`/api/v1/supplier-invoices/${id}/pay`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount:inv?.total_amount,payment_method:"bank_transfer"})}).then(r=>r.json()),
    onSuccess: ()=>{ toast.success("Payment recorded"); window.location.reload(); },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-tertiary text-sm">Loading invoice...</div>
    </div>
  );
  if (!inv||inv.error||inv.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">📄</div>
        <div className="tb-empty-title">Invoice not found</div>
        <button onClick={()=>router.push("/commercial/invoices")} className="tb-btn tb-btn-primary mt-4">← Back to Invoices</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button onClick={()=>router.push("/commercial/invoices")} className="tb-btn tb-btn-ghost tb-btn-sm">← Invoices</button>
              </div>
              <div className="text-label-upper text-brand mb-1.5">Invoice</div>
              <h1 className="tb-hero-title">{inv.invoice_number}</h1>
              <div className="flex items-center gap-2.5 mt-2">
                <StatusBadge status={inv.status||"draft"} />
                <span className="text-sm text-tertiary">{inv.vendor_name||inv.vendor_id||""}</span>
              </div>
            </div>
            <div className="tb-action-bar">
              {inv.status==="submitted" && <button onClick={()=>approve.mutate()} className="tb-btn tb-btn-primary">✓ Approve</button>}
              {inv.status==="approved" && <button onClick={()=>pay.mutate()} className="tb-btn tb-btn-primary" style={{background:"var(--color-success)"}}>💳 Record Payment</button>}
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Total Amount",value:fmtEGP(inv.total_amount||0)},
              {label:"VAT",value:fmtEGP(inv.vat_amount||0)},
              {label:"Balance Due",value:fmtEGP(inv.balance_due||inv.total_amount||0),warn:inv.payment_status!=="paid"},
              {label:"Due Date",value:fmtDate(inv.due_date)},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.warn?"var(--color-warning)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid gap-6" style={{gridTemplateColumns:"2fr 1fr"}}>
          <div className="tb-section">
            <div className="tb-section-title">Invoice Details</div>
            {[["Invoice Number",inv.invoice_number],["Vendor",inv.vendor_name||inv.vendor_id||"—"],["PO Reference",inv.po_id||"—"],["Subtotal",fmtEGP(inv.subtotal||0)],["VAT Amount",fmtEGP(inv.vat_amount||0)],["Total Amount",fmtEGP(inv.total_amount||0)],["Amount Paid",fmtEGP(inv.amount_paid||0)],["Balance Due",fmtEGP(inv.balance_due||0)],["Payment Status",inv.payment_status||"—"],["Due Date",fmtDate(inv.due_date)],["Created",fmtDate(inv.created_at)]].map(([label,value],i)=>(
              <div key={i} className="tb-detail-row">
                <span className="tb-detail-key">{label}</span>
                <span className="tb-detail-value">{value}</span>
              </div>
            ))}
            {inv.notes && <div className="mt-4 p-3 bg-surface-alt rounded-lg text-sm text-secondary leading-relaxed">{inv.notes}</div>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="tb-section-title">3-Way Match</div>
              {[
                {label:"Match Result",value:inv.match_result||"pending",warn:inv.match_result!=="matched"},
                {label:"PO Total",value:fmtEGP(inv.po_total||0)},
                {label:"GRN Total",value:fmtEGP(inv.grn_total||0)},
                {label:"Variance",value:`${inv.match_variance_pct||0}%`,warn:Number(inv.match_variance_pct||0)>5},
              ].map((row,i)=>(
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{row.label}</span>
                  <span className="tb-detail-value font-bold" style={{color:row.warn?"var(--color-danger)":"var(--color-success)"}}>{row.value}</span>
                </div>
              ))}
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Actions</div>
              <div className="flex flex-col gap-2">
                {inv.status==="submitted" && <button onClick={()=>approve.mutate()} className="tb-btn tb-btn-primary w-full justify-center">✓ Approve Invoice</button>}
                {inv.status==="approved" && <button onClick={()=>pay.mutate()} className="tb-btn w-full justify-center" style={{background:"var(--color-success-bg)",color:"var(--color-success)",border:"1px solid var(--color-success-border)"}}>💳 Record Payment</button>}
                <button onClick={()=>router.push("/commercial/invoices")} className="tb-btn tb-btn-ghost w-full justify-center">← All Invoices</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
