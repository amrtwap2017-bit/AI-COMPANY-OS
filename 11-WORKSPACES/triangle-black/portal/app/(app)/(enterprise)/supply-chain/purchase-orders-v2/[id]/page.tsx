"use client";
// @ts-nocheck
import DocumentsPanel from "@/components/documents/DocumentsPanel";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "@/lib/toast";
import { useRouter, useParams } from "next/navigation";
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const SC = {draft:"#6D5F53",pending_approval:"#B07A2A",approved:"#5B7C8C",sent:"#8D7443",acknowledged:"#8D7443",partial:"#B07A2A",received:"#547C4D",invoiced:"#547C4D",paid:"#547C4D",cancelled:"#A84A3D"};
const EMPTY_LINE = {description:"",unit:"unit",quantity:1,unit_price:0,discount_pct:0,vat_pct:14,notes:""};
export default function POv2DetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("lines");
  const [newLine, setNewLine] = useState({...EMPTY_LINE});
  const [showAddLine, setShowAddLine] = useState(false);
  const { data: po, isLoading } = useQuery(
    ["po-v2-detail", id],
    () => authFetch(`/api/v1/purchase-orders-v2/${id}`).then(r=>r.json()),
    { staleTime: 30000 }
  );
  const statusMut = useMutation(
    (status) => authFetch(`/api/v1/purchase-orders-v2/${id}`, {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ status, approved_by: status==="approved"?"amr@triangleblack.com":undefined })
    }).then(r=>r.json()),
    { onSuccess: () => { toast.success("Purchase order updated"); qc.invalidateQueries(["po-v2-detail", id]); } }
  );
  const addLineMut = useMutation(
    (line) => authFetch(`/api/v1/purchase-orders-v2/${id}/line-items`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(line)
    }).then(r=>r.json()),
    { onSuccess: () => { qc.invalidateQueries(["po-v2-detail",id]); setNewLine({...EMPTY_LINE}); setShowAddLine(false); }}
  );
  const deleteMut = useMutation(
    () => authFetch(`/api/v1/purchase-orders-v2/v2/${id}`, { method: "DELETE" }),
    { onSuccess: () => router.push("/supply-chain/purchase-orders-v2") }
  );

    if (isLoading) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="text-secondary text-sm animate-pulse">Loading PO…</div></div>;
  if (!po || po.error) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="text-tertiary">PO not found</div></div>;
  const sc = SC[po.status]||"#6D5F53";
  const lines = po.line_items || [];
  const grns = po.grns || [];
  const subtotal = lines.reduce((s,l)=>s+Number(l.total_before_vat||0),0);
  const vatTotal = lines.reduce((s,l)=>s+Number(l.vat_amount||0),0);
  const grandTotal = subtotal + vatTotal;
  const ACTIONS = {
    draft:[{label:"Submit for Approval",status:"pending_approval",color:"#B07A2A"}],
    pending_approval:[{label:"✓ Approve",status:"approved",color:"#16A34A"},{label:"✗ Reject",status:"draft",color:"#A84A3D"}],
    approved:[{label:"Send to Vendor →",status:"sent",color:"#7C3AED"}],
    sent:[{label:"Mark Acknowledged",status:"acknowledged",color:"#5B7C8C"}],
    acknowledged:[{label:"Mark Received",status:"received",color:"#547C4D"}],
  };
  const actions = ACTIONS[po.status] || [];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#221D1A 0%,#221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <button onClick={()=>router.push("/supply-chain/purchase-orders-v2")} className="tb-btn-secondary">← PO List</button>
            <a href={`/api/v1/pdf/purchase-order/${id}`} target="_blank" rel="noopener noreferrer" className="tb-btn-secondary" style={{fontSize:"0.75rem",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"4px"}}>📄 Export PDF</a>
            <button
              onClick={()=>{ if(window.confirm("Delete this purchase order? This cannot be undone.")) deleteMut.mutate(); }}
              disabled={deleteMut.isLoading}
              className="tb-btn-secondary"
              style={{borderColor:"#A84A3D",color:"#A84A3D",fontSize:"0.75rem"}}>
              {deleteMut.isLoading?"Deleting…":"🗑 Delete"}
            </button>
            <div className="flex gap-2 flex-wrap">
              {actions.map((a,i)=>(
                <button key={i} onClick={()=>statusMut.mutate(a.status)} disabled={statusMut.isLoading}
                  className="tb-btn-primary" style={{background:a.color,fontSize:"0.75rem",padding:"8px 14px"}}>
                  {a.label}
                </button>
              ))}
              {(po.status==="approved"||po.status==="sent"||po.status==="acknowledged") && (
                <button onClick={()=>router.push(`/supply-chain/goods-receipts/new?po=${id}`)} className="tb-btn-secondary" style={{fontSize:"0.75rem"}}>
                  + GRN
                </button>
              )}
            </div>
          </div>
          <div className="text-label-upper text-emerald-400 mb-1">Purchase Order</div>
          <h1 className="tb-hero-title mb-2">{po.title||po.po_number}</h1>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="tb-badge" style={{background:sc+"18",color:sc,border:`1px solid ${sc}30`}}>{(po.status||"").replace(/_/g," ")}</span>
            <span className="text-xs text-tertiary">{po.po_number}</span>
            <span className="text-xs text-tertiary">Vendor: {po.vendor_name||"—"}</span>
            <span className="text-xs text-tertiary">{po.currency||"EGP"}</span>
          </div>
          <div className="tb-grid-4">
            {[
              {label:"Line Items",value:lines.length,color:"#5B7C8C"},
              {label:"Subtotal",value:fmtEGP(subtotal),color:"#B07A2A"},
              {label:"VAT (14%)",value:fmtEGP(vatTotal),color:"#B07A2A"},
              {label:"Grand Total",value:fmtEGP(grandTotal),color:"#547C4D"},
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
          {["lines","grns","details","documents"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} className={"tb-pill "+(activeTab===tab?"tb-pill--active":"")}>
              {tab==="lines"?"Line Items":tab==="grns"?"GRN History":tab==="details"?"Details":"Documents"}
              {tab==="grns"&&grns.length>0&&<span className="ml-1 opacity-60">{grns.length}</span>}
            </button>
          ))}
        </div>
        {activeTab === "lines" && (
          <div className="tb-section">
            <div className="tb-flex-between mb-3">
              <div className="tb-section-title" style={{marginBottom:0}}>Line Items</div>
              {["draft","pending_approval"].includes(po.status) && (
                <button onClick={()=>setShowAddLine(!showAddLine)} className="tb-btn-primary" style={{fontSize:"0.75rem",padding:"6px 12px"}}>+ Add Line</button>
              )}
            </div>
            {showAddLine && (
              <div className="p-4 rounded-xl bg-base-alt border border-brand/30 mb-4 space-y-3">
                <div className="text-xs font-bold text-brand mb-2">New Line Item</div>
                <div className="grid grid-cols-2 gap-3">
                  <input className="tb-input col-span-2" placeholder="Description *" value={newLine.description} onChange={e=>setNewLine({...newLine,description:e.target.value})}/>
                  <select className="tb-input" value={newLine.unit} onChange={e=>setNewLine({...newLine,unit:e.target.value})}>
                    {["unit","m","m2","m3","hr","lot","kg","set","pair"].map(u=><option key={u} value={u}>{u}</option>)}
                  </select>
                  <input type="number" className="tb-input" placeholder="Quantity" value={newLine.quantity} onChange={e=>setNewLine({...newLine,quantity:e.target.value})} min="0.001" step="0.001"/>
                  <input type="number" className="tb-input" placeholder="Unit Price (EGP)" value={newLine.unit_price} onChange={e=>setNewLine({...newLine,unit_price:e.target.value})} min="0"/>
                  <input type="number" className="tb-input" placeholder="Discount %" value={newLine.discount_pct} onChange={e=>setNewLine({...newLine,discount_pct:e.target.value})} min="0" max="100"/>
                  <input type="number" className="tb-input" placeholder="VAT %" value={newLine.vat_pct} onChange={e=>setNewLine({...newLine,vat_pct:e.target.value})} min="0"/>
                  <div className="text-sm font-bold text-emerald-400 flex items-center">
                    Total: {fmtEGP(Number(newLine.quantity)*Number(newLine.unit_price)*(1-Number(newLine.discount_pct)/100)*(1+Number(newLine.vat_pct)/100))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>addLineMut.mutate(newLine)} disabled={!newLine.description||addLineMut.isLoading} className="tb-btn-primary" style={{fontSize:"0.75rem",padding:"6px 14px"}}>Add Line</button>
                  <button onClick={()=>setShowAddLine(false)} className="tb-btn-secondary" style={{fontSize:"0.75rem",padding:"6px 12px"}}>Cancel</button>
                </div>
              </div>
            )}
            {lines.length===0 ? (
              <div className="tb-empty"><div className="tb-empty-icon">📦</div><div className="tb-empty-title">No line items</div><div className="tb-empty-desc">Add line items to build this PO</div></div>
            ) : (
              <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
                <div className="tb-table-head" style={{gridTemplateColumns:"40px 1fr 70px 70px 100px 90px 110px"}}>
                  {["#","Description","Unit","Qty","Unit Price","VAT","Total"].map((h,i)=>(
                    <div key={i} className="tb-table-head-cell" style={{textAlign:i>1?"center":"left"}}>{h}</div>
                  ))}
                </div>
                {lines.map((line,i)=>(
                  <div key={i} className="tb-table-row" style={{gridTemplateColumns:"40px 1fr 70px 70px 100px 90px 110px"}}>
                    <div className="text-xs text-tertiary">{line.line_number||i+1}</div>
                    <div className="text-sm text-primary truncate pr-2">{line.description}</div>
                    <div className="text-center text-xs text-secondary">{line.unit}</div>
                    <div className="text-center text-sm text-secondary">{Number(line.quantity||0).toLocaleString()}</div>
                    <div className="text-center text-sm text-secondary">{Number(line.unit_price||0).toLocaleString()}</div>
                    <div className="text-center text-xs text-secondary">{fmtEGP(line.vat_amount||0)}</div>
                    <div className="text-center text-sm font-bold text-emerald-400">{fmtEGP(line.total_amount||0)}</div>
                  </div>
                ))}
                <div className="tb-table-row" style={{gridTemplateColumns:"40px 1fr 70px 70px 100px 90px 110px",background:"rgba(255,255,255,0.03)"}}>
                  <div/><div className="text-xs font-bold text-secondary col-span-5 text-right pr-4">Grand Total (incl. VAT)</div>
                  <div className="text-center text-sm font-black text-emerald-400">{fmtEGP(grandTotal)}</div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "grns" && (
          <div className="tb-section">
            <div className="tb-section-title">Goods Receipt Notes</div>
            {grns.length===0 ? (
              <div className="tb-empty"><div className="tb-empty-icon">✅</div><div className="tb-empty-title">No receipts yet</div></div>
            ) : (
              <div className="space-y-2 mt-2">
                {grns.map((g,i)=>(
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-base-alt">
                    <div className="flex-1"><div className="text-sm font-semibold text-primary">{g.grn_number||g.id?.slice(0,12)}</div><div className="text-xs text-tertiary">{fmtDate(g.received_at)}</div></div>
                    <span className="tb-badge">{g.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "details" && (
          <div className="tb-section space-y-2">
            <div className="tb-section-title">PO Details</div>
            {[
              {label:"PO Number",value:po.po_number},
              {label:"Vendor",value:po.vendor_name},
              {label:"Vendor Email",value:po.vendor_email},
              {label:"Currency",value:po.currency},
              {label:"Exchange Rate",value:po.exchange_rate},
              {label:"Payment Terms",value:`${po.payment_terms||30} days`},
              {label:"Delivery Date",value:fmtDate(po.delivery_date)},
              {label:"Delivery Address",value:po.delivery_address},
              {label:"Prepared By",value:po.prepared_by},
              {label:"Approved By",value:po.approved_by},
              {label:"Approved At",value:fmtDate(po.approved_at)},
              {label:"Terms",value:po.terms_conditions},
              {label:"Internal Notes",value:po.internal_notes},
            ].map((row,i)=>row.value&&(
              <div key={i} className="flex gap-4 py-2 border-b border-border">
                <span className="text-xs text-tertiary w-36 flex-shrink-0">{row.label}</span>
                <span className="text-sm text-primary">{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "documents" && (
          <DocumentsPanel
            entityType="purchase_orders_v2"
            entityId={id as string}
            title="PO Documents"
            categories={["technical_spec","quote","approval_email","delivery_note","inspection_report","invoice","po_document","other"]}
          />
        )}
      </div>
    </div>
  );
}
