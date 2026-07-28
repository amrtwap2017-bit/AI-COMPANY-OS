
"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useSearchParams } from "next/navigation";
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
export default function GRNCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poId = searchParams.get("po");
  const [form, setForm] = useState({
    po_id: poId||"", received_by:"amr@triangleblack.com",
    delivery_note_no:"", vehicle_no:"", inspection_passed:true, notes:""
  });
  const [lineItems, setLineItems] = useState([]);
  const { data: po, isLoading: poLoading } = useQuery(
    ["grn-po", poId],
    () => authFetch(`/api/v1/purchase-orders-v2/${poId}`).then(r=>r.json()),
    { enabled: !!poId, staleTime: 30000,
      onSuccess: (data) => {
        if (data.line_items) {
          setLineItems(data.line_items.map(l=>({
            po_line_item_id: l.id, description: l.description,
            ordered_qty: Number(l.quantity||0), received_qty: Number(l.quantity||0),
            accepted_qty: Number(l.quantity||0), rejected_qty: 0,
            unit_price: Number(l.unit_price||0),
            total_value: Number(l.quantity||0)*Number(l.unit_price||0), notes:""
          })));
        }
      }
    }
  );
  const createMut = useMutation(
    (payload) => authFetch("/api/v1/goods-receipt-notes/", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
    }).then(r=>r.json()),
    { onSuccess: (data) => { if (!data.error) router.push("/supply-chain/goods-receipts"); }}
  );
  const updateLine = (i, field, val) => {
    const updated = [...lineItems];
    updated[i] = {...updated[i], [field]: Number(val)||0};
    if (field==="received_qty") {
      updated[i].accepted_qty = Number(val)||0;
      updated[i].rejected_qty = 0;
      updated[i].total_value = (Number(val)||0) * updated[i].unit_price;
    }
    if (field==="accepted_qty") {
      updated[i].rejected_qty = (updated[i].received_qty||0) - (Number(val)||0);
    }
    setLineItems(updated);
  };
  const handleSubmit = () => {
    createMut.mutate({
      ...form,
      vendor_id: po?.vendor_id,
      items: lineItems
    });
  };
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A 0%,#0A1530 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <button onClick={()=>router.back()} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="text-label-upper text-cyan-400 mb-1">Goods Receipt</div>
          <h1 className="tb-hero-title">Receive Delivery</h1>
          {po && <p className="tb-hero-description">PO: {po.po_number} · Vendor: {po.vendor_name||"—"}</p>}
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section space-y-4">
          <div className="tb-section-title">Receipt Details</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-tertiary block mb-1">Received By</label>
              <input className="tb-input w-full" value={form.received_by} onChange={e=>setForm({...form,received_by:e.target.value})}/>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Delivery Note No.</label>
              <input className="tb-input w-full" value={form.delivery_note_no} onChange={e=>setForm({...form,delivery_note_no:e.target.value})} placeholder="DN-XXXXX"/>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Vehicle No.</label>
              <input className="tb-input w-full" value={form.vehicle_no} onChange={e=>setForm({...form,vehicle_no:e.target.value})} placeholder="Plate number"/>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <input type="checkbox" id="inspection" checked={form.inspection_passed} onChange={e=>setForm({...form,inspection_passed:e.target.checked})} className="w-4 h-4"/>
              <label htmlFor="inspection" className="text-sm text-secondary">Inspection Passed</label>
            </div>
          </div>
          <div>
            <label className="text-xs text-tertiary block mb-1">Notes</label>
            <textarea className="tb-input w-full h-20 resize-none" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Delivery notes…"/>
          </div>
        </div>
        <div className="tb-section mt-4">
          <div className="tb-section-title">Received Items</div>
          {poLoading ? <div className="text-sm text-secondary animate-pulse">Loading PO items…</div> :
          lineItems.length===0 ? <div className="tb-empty"><div className="tb-empty-icon">📦</div><div className="tb-empty-title">No items from PO</div></div> : (
            <div className="space-y-3 mt-3">
              {lineItems.map((line,i)=>(
                <div key={i} className="p-4 rounded-xl bg-base-alt border border-border">
                  <div className="text-sm font-semibold text-primary mb-3">{line.description}</div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-tertiary block mb-1">Ordered</label>
                      <div className="text-sm font-bold text-secondary">{line.ordered_qty}</div>
                    </div>
                    <div>
                      <label className="text-xs text-tertiary block mb-1">Received *</label>
                      <input type="number" className="tb-input w-full" value={line.received_qty} onChange={e=>updateLine(i,"received_qty",e.target.value)} min="0" max={line.ordered_qty} step="0.001"/>
                    </div>
                    <div>
                      <label className="text-xs text-tertiary block mb-1">Accepted</label>
                      <input type="number" className="tb-input w-full" value={line.accepted_qty} onChange={e=>updateLine(i,"accepted_qty",e.target.value)} min="0" max={line.received_qty} step="0.001"/>
                    </div>
                    <div>
                      <label className="text-xs text-tertiary block mb-1">Rejected</label>
                      <div className="text-sm font-bold" style={{color:line.rejected_qty>0?"#F87171":"#94A3B8"}}>{line.rejected_qty}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-emerald-400 font-bold">{fmtEGP(line.total_value||0)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-3 justify-end">
          <button onClick={()=>router.back()} className="tb-btn-secondary">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={createMut.isLoading || lineItems.length===0}
            className="tb-btn-primary">
            {createMut.isLoading ? "Saving…" : "✓ Confirm Receipt"}
          </button>
        </div>
      </div>
    </div>
  );
}
