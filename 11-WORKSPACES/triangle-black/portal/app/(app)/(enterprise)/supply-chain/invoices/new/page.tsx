"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function CreateInvoicePage() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const due30 = new Date(Date.now().getTime() +30*864e5).toISOString().split("T")[0];
  const [form, setForm] = useState({
    vendor_id:"", vendor_invoice_number:"", po_id:"", grn_id:"",
    invoice_date:today, due_date:due30, currency:"EGP", exchange_rate:1,
    subtotal:0, vat_pct:14, withholding_tax_pct:0,
    po_total:0, grn_total:0, notes:"", submitted_by:"amr@triangleblack.com"
  });
  const { data: vendorsRaw } = useQuery(["vendors-inv"], () => authFetch("/api/v1/vendors/").then(r => (r as any).data ?? r), {staleTime:60000});
  const { data: posRaw } = useQuery(["pos-inv"], () => authFetch("/api/v1/purchase-orders-v2/").then(r => (r as any).data ?? r), {staleTime:60000});
  const vendors = toArr(vendorsRaw);
  const pos = toArr(posRaw);
  const vat_amount = Number(form.subtotal) * (Number(form.vat_pct)/100);
  const wht_amount = Number(form.subtotal) * (Number(form.withholding_tax_pct)/100);
  const total = Number(form.subtotal) + vat_amount;
  const net_payable = total - wht_amount;
  const createMut = useMutation(
    (payload) => authFetch("/api/v1/supplier-invoices/", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
    }).then(r => r.data ?? r),
    { onSuccess: (data) => { if (!data.error && data.id) router.push("/supply-chain/invoices/"+data.id); }}
  );
  const handleSubmit = () => createMut.mutate({...form, subtotal:Number(form.subtotal), vat_pct:Number(form.vat_pct), withholding_tax_pct:Number(form.withholding_tax_pct), exchange_rate:Number(form.exchange_rate), po_total:Number(form.po_total), grn_total:Number(form.grn_total)});
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#221D1A 0%,#221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <button onClick={()=>router.push("/supply-chain/invoices")} className="tb-btn-secondary">← Invoices</button>
          </div>
          <div className="text-label-upper text-blue-400 mb-1">Create New</div>
          <h1 className="tb-hero-title">Supplier Invoice</h1>
          <div className="tb-grid-4 mt-4">
            {[
              {label:"Subtotal",value:fmtEGP(Number(form.subtotal)||0),color:"#5B7C8C"},
              {label:`VAT (${form.vat_pct}%)`,value:fmtEGP(vat_amount),color:"#8D7443"},
              {label:"Total",value:fmtEGP(total),color:"#547C4D"},
              {label:"Net Payable",value:fmtEGP(net_payable),color:"#B07A2A"},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas space-y-4">
        <div className="tb-section space-y-4">
          <div className="tb-section-title">Invoice Information</div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-tertiary block mb-1">Vendor *</label>
              <select className="tb-input w-full" value={form.vendor_id} onChange={(e: any) =>setForm({...form,vendor_id:e.target.value})}>
                <option value="">Select vendor…</option>
                {vendors.map((v: any) =><option key={v.id} value={v.id}>{v.company_name} ({v.vendor_code})</option>)}
              </select>
            </div>
            <div><label className="text-xs text-tertiary block mb-1">Vendor Invoice No. *</label>
              <input className="tb-input w-full" value={form.vendor_invoice_number} onChange={(e: any) =>setForm({...form,vendor_invoice_number:e.target.value})} placeholder="e.g. VND-2025-001"/>
            </div>
            <div><label className="text-xs text-tertiary block mb-1">Linked PO</label>
              <select className="tb-input w-full" value={form.po_id} onChange={(e: any) =>{
                const po = pos.find((p: any) =>p.id===e.target.value);
                setForm({...form,po_id:e.target.value,po_total:po?.total_amount||0,vendor_id:po?.vendor_id||form.vendor_id});
              }}>
                <option value="">Select PO (optional)…</option>
                {pos.map((p: any) =><option key={p.id} value={p.id}>{p.po_number} — {p.vendor_name||"—"}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-tertiary block mb-1">Currency</label>
              <select className="tb-input w-full" value={form.currency} onChange={(e: any) =>setForm({...form,currency:e.target.value})}>
                {["EGP","USD","EUR","GBP","SAR","AED"].map((c: any) =><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-tertiary block mb-1">Invoice Date *</label>
              <input type="date" className="tb-input w-full" value={form.invoice_date} onChange={(e: any) =>setForm({...form,invoice_date:e.target.value})}/>
            </div>
            <div><label className="text-xs text-tertiary block mb-1">Due Date *</label>
              <input type="date" className="tb-input w-full" value={form.due_date} onChange={(e: any) =>setForm({...form,due_date:e.target.value})}/>
            </div>
            <div><label className="text-xs text-tertiary block mb-1">Subtotal (before VAT) *</label>
              <input type="number" className="tb-input w-full" value={form.subtotal} onChange={(e: any) =>setForm({...form,subtotal:e.target.value})} min="0" step="0.01"/>
            </div>
            <div><label className="text-xs text-tertiary block mb-1">VAT %</label>
              <input type="number" className="tb-input w-full" value={form.vat_pct} onChange={(e: any) =>setForm({...form,vat_pct:e.target.value})} min="0" max="100"/>
            </div>
            <div><label className="text-xs text-tertiary block mb-1">Withholding Tax %</label>
              <input type="number" className="tb-input w-full" value={form.withholding_tax_pct} onChange={(e: any) =>setForm({...form,withholding_tax_pct:e.target.value})} min="0" max="10"/>
            </div>
            <div><label className="text-xs text-tertiary block mb-1">GRN Total (received value)</label>
              <input type="number" className="tb-input w-full" value={form.grn_total} onChange={(e: any) =>setForm({...form,grn_total:e.target.value})} min="0"/>
            </div>
            <div className="col-span-2"><label className="text-xs text-tertiary block mb-1">Notes</label>
              <textarea className="tb-input w-full h-20 resize-none" value={form.notes} onChange={(e: any) =>setForm({...form,notes:e.target.value})}/>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-base-alt border border-border space-y-1">
            <div className="text-xs font-bold text-secondary mb-2">Invoice Summary</div>
            {[
              {label:"Subtotal",value:fmtEGP(Number(form.subtotal)||0)},
              {label:`VAT ${form.vat_pct}%`,value:fmtEGP(vat_amount)},
              {label:`WHT ${form.withholding_tax_pct}%`,value:`-${fmtEGP(wht_amount)}`},
            ].map((r: any, i: number) =>(
              <div key={i} className="flex justify-between text-xs"><span className="text-tertiary">{r.label}</span><span className="text-secondary">{r.value}</span></div>
            ))}
            <div className="flex justify-between text-sm font-black pt-2 border-t border-border">
              <span className="text-primary">Net Payable</span>
              <span className="text-emerald-400">{fmtEGP(net_payable)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end pb-8">
          <button onClick={()=>router.back()} className="tb-btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={!form.vendor_id||!form.vendor_invoice_number||!form.subtotal||createMut.isLoading} className="tb-btn-primary">
            {createMut.isLoading?"Creating…":"Create Invoice →"}
          </button>
        </div>
      </div>
    </div>
  );
}
