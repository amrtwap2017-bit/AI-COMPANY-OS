"use client";
// @ts-nocheck
import DocumentsPanel from "@/components/documents/DocumentsPanel";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "@/lib/toast";
import { useRouter, useParams } from "next/navigation";

const fmtEGP  = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const SC = {draft:"#6D5F53",pending_approval:"#B07A2A",approved:"#5B7C8C",sent:"#8D7443",acknowledged:"#8D7443",partial:"#B07A2A",received:"#547C4D",invoiced:"#547C4D",paid:"#547C4D",cancelled:"#A84A3D"};
const EMPTY_LINE = {description:"",unit:"unit",quantity:1,unit_price:0,discount_pct:0,vat_pct:14,notes:""};

export default function POv2DetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const qc = useQueryClient();
  const [activeTab,    setActiveTab]    = useState("lines");
  const [newLine,      setNewLine]      = useState({...EMPTY_LINE});
  const [showAddLine,  setShowAddLine]  = useState(false);

  const { data: po, isLoading } = useQuery(
    ["po-v2-detail", id],
    ()=>authFetch(`/api/v1/purchase-orders-v2/${id}`).then(r=>r.json()),
    {staleTime:30000}
  );
  const statusMut = useMutation(
    (status)=>authFetch(`/api/v1/purchase-orders-v2/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,approved_by:status==="approved"?"amr@triangleblack.com":undefined})}).then(r=>r.json()),
    {onSuccess:()=>{toast.success("Purchase order updated");qc.invalidateQueries(["po-v2-detail",id]);}}
  );
  const addLineMut = useMutation(
    (line)=>authFetch(`/api/v1/purchase-orders-v2/${id}/line-items`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(line)}).then(r=>r.json()),
    {onSuccess:()=>{qc.invalidateQueries(["po-v2-detail",id]);setNewLine({...EMPTY_LINE});setShowAddLine(false);}}
  );
  const deleteMut = useMutation(
    ()=>authFetch(`/api/v1/purchase-orders-v2/v2/${id}`,{method:"DELETE"}),
    {onSuccess:()=>router.push("/supply-chain/purchase-orders-v2")}
  );

  if (isLoading) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="text-secondary text-sm animate-pulse">Loading PO…</div></div>;
  if (!po||po.error) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="text-tertiary">PO not found</div></div>;

  const sc         = SC[po.status]||"#6D5F53";
  const lines      = po.line_items||[];
  const grns       = po.grns||[];
  const subtotal   = lines.reduce((s: any, l: any) =>s+Number(l.total_before_vat||0),0);
  const vatTotal   = lines.reduce((s: any, l: any) =>s+Number(l.vat_amount||0),0);
  const grandTotal = subtotal+vatTotal;

  const ACTIONS = {
    draft:[{label:"Submit for Approval",status:"pending_approval",color:"#B07A2A"}],
    pending_approval:[{label:"✓ Approve",status:"approved",color:"#16A34A"},{label:"✗ Reject",status:"draft",color:"#A84A3D"}],
    approved:[{label:"Send to Vendor →",status:"sent",color:"#7C3AED"}],
    sent:[{label:"Mark Acknowledged",status:"acknowledged",color:"#5B7C8C"}],
    acknowledged:[{label:"Mark Received",status:"received",color:"#547C4D"}],
  };
  const actions = (ACTIONS as Record<string, any>)[po.status]||[];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <button onClick={()=>router.push("/supply-chain/purchase-orders-v2")} className="tb-btn tb-btn-secondary tb-btn-sm">← PO List</button>
            <a href={`/api/v1/pdf/purchase-order/${id}`} target="_blank" rel="noopener noreferrer"
              className="tb-btn tb-btn-secondary tb-btn-sm" style={{textDecoration:"none"}}>📄 Export PDF</a>
            <button onClick={()=>{if(window.confirm("Delete this purchase order? This cannot be undone."))deleteMut.mutate();}}
              disabled={deleteMut.isLoading}
              className="tb-btn tb-btn-ghost tb-btn-sm text-danger border-danger/30">
              {deleteMut.isLoading?"Deleting…":"🗑 Delete"}
            </button>
            <div className="flex gap-2 flex-wrap ml-auto">
              {actions.map((a: any, i: number) =>(
                <button key={i} onClick={()=>statusMut.mutate(a.status)} disabled={statusMut.isLoading}
                  className="tb-btn tb-btn-primary tb-btn-sm" style={{background:a.color}}>
                  {a.label}
                </button>
              ))}
              {(po.status==="approved"||po.status==="sent"||po.status==="acknowledged")&&(
                <button onClick={()=>router.push(`/supply-chain/goods-receipts/new?po=${id}`)} className="tb-btn tb-btn-secondary tb-btn-sm">+ GRN</button>
              )}
            </div>
          </div>
          <div className="text-label-upper text-brand mb-1.5">Purchase Order</div>
          <h1 className="tb-hero-title mb-2">{po.title||po.po_number}</h1>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="tb-badge" style={{background:sc+"18",color:sc,border:`1px solid ${sc}30`}}>{(po.status||"").replace(/_/g," ")}</span>
            <span className="text-xs text-tertiary">{po.po_number}</span>
            <span className="text-xs text-tertiary">Vendor: {po.vendor_name||"—"}</span>
            <span className="text-xs text-tertiary">{po.currency||"EGP"}</span>
          </div>
          <div className="tb-grid-4">
            {[
              {label:"Line Items", value:lines.length,        color:"var(--color-info)"},
              {label:"Subtotal",   value:fmtEGP(subtotal),   color:"var(--color-warning)"},
              {label:"VAT (14%)", value:fmtEGP(vatTotal),    color:"var(--color-warning)"},
              {label:"Grand Total",value:fmtEGP(grandTotal),  color:"var(--color-success)"},
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
        <div className="tb-tabs mb-4">
          {["lines","grns","details","documents"].map((tab: any) =>(
            <button key={tab} onClick={()=>setActiveTab(tab)} className={`tb-tab ${activeTab===tab?"active":""}`}>
              {tab==="lines"?"Line Items":tab==="grns"?"GRN History":tab==="details"?"Details":"Documents"}
              {tab==="grns"&&grns.length>0&&<span className="ml-1 opacity-60">{grns.length}</span>}
            </button>
          ))}
        </div>

        {activeTab==="lines" && (
          <div className="tb-section">
            <div className="flex justify-between items-center mb-3">
              <div className="tb-section-title" style={{marginBottom:0}}>Line Items</div>
              {["draft","pending_approval"].includes(po.status)&&(
                <button onClick={()=>setShowAddLine(!showAddLine)} className="tb-btn tb-btn-primary tb-btn-sm">+ Add Line</button>
              )}
            </div>
            {showAddLine&&(
              <div className="p-4 rounded-xl bg-surface-alt border border-brand/30 mb-4 flex flex-col gap-3">
                <div className="text-xs font-bold text-brand mb-2">New Line Item</div>
                <div className="grid grid-cols-2 gap-3">
                  <input className="tb-input col-span-2" placeholder="Description *" value={newLine.description} onChange={(e: any) =>setNewLine({...newLine,description:e.target.value})}/>
                  <select className="tb-select" value={newLine.unit} onChange={(e: any) =>setNewLine({...newLine,unit:e.target.value})}>
                    {["unit","m","m2","m3","hr","lot","kg","set","pair"].map((u: any) =><option key={u} value={u}>{u}</option>)}
                  </select>
                  <input type="number" className="tb-input" placeholder="Quantity" value={newLine.quantity} onChange={(e: any) =>setNewLine({...newLine,quantity:e.target.value})} min="0.001" step="0.001"/>
                  <input type="number" className="tb-input" placeholder="Unit Price (EGP)" value={newLine.unit_price} onChange={(e: any) =>setNewLine({...newLine,unit_price:e.target.value})} min="0"/>
                  <input type="number" className="tb-input" placeholder="Discount %" value={newLine.discount_pct} onChange={(e: any) =>setNewLine({...newLine,discount_pct:e.target.value})} min="0" max="100"/>
                  <input type="number" className="tb-input" placeholder="VAT %" value={newLine.vat_pct} onChange={(e: any) =>setNewLine({...newLine,vat_pct:e.target.value})} min="0"/>
                  <div className="text-sm font-bold text-success flex items-center">
                    Total: {fmtEGP(Number(newLine.quantity)*Number(newLine.unit_price)*(1-Number(newLine.discount_pct)/100)*(1+Number(newLine.vat_pct)/100))}
                  </div>
                </div>
                <div className="tb-action-bar">
                  <button onClick={()=>addLineMut.mutate(newLine)} disabled={!newLine.description||addLineMut.isLoading} className="tb-btn tb-btn-primary tb-btn-sm">Add Line</button>
                  <button onClick={()=>setShowAddLine(false)} className="tb-btn tb-btn-secondary tb-btn-sm">Cancel</button>
                </div>
              </div>
            )}
            {lines.length===0 ? (
              <div className="tb-empty"><div className="tb-empty-icon">📦</div><div className="tb-empty-title">No line items</div><div className="tb-empty-desc">Add line items to build this PO</div></div>
            ) : (
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Description</th>
                      <th style={{textAlign:"center"}}>Unit</th>
                      <th style={{textAlign:"center"}}>Qty</th>
                      <th style={{textAlign:"center"}}>Unit Price</th>
                      <th style={{textAlign:"center"}}>VAT</th>
                      <th style={{textAlign:"center"}}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line: any, i: any) =>(
                      <tr key={i}>
                        <td className="text-xs text-tertiary">{line.line_number||i+1}</td>
                        <td className="text-sm text-primary truncate" style={{maxWidth:"240px"}}>{line.description}</td>
                        <td className="text-center text-xs text-secondary">{line.unit}</td>
                        <td className="text-center text-sm text-secondary">{Number(line.quantity||0).toLocaleString()}</td>
                        <td className="text-center text-sm text-secondary">{Number(line.unit_price||0).toLocaleString()}</td>
                        <td className="text-center text-xs text-secondary">{fmtEGP(line.vat_amount||0)}</td>
                        <td className="text-center text-sm font-bold text-success">{fmtEGP(line.total_amount||0)}</td>
                      </tr>
                    ))}
                    <tr className="bg-surface-alt">
                      <td colSpan={6} className="text-right text-xs font-bold text-secondary pr-4">Grand Total (incl. VAT)</td>
                      <td className="text-center text-sm font-black text-success">{fmtEGP(grandTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab==="grns" && (
          <div className="tb-section">
            <div className="tb-section-title">Goods Receipt Notes</div>
            {grns.length===0 ? (
              <div className="tb-empty"><div className="tb-empty-icon">✅</div><div className="tb-empty-title">No receipts yet</div></div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                {grns.map((g: any, i: number) =>(
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-surface-alt">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-primary">{g.grn_number||g.id?.slice(0,12)}</div>
                      <div className="text-xs text-tertiary">{fmtDate(g.received_at)}</div>
                    </div>
                    <span className="tb-badge">{g.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab==="details" && (
          <div className="tb-section">
            <div className="tb-section-title">PO Details</div>
            {[
              {label:"PO Number",       value:po.po_number},
              {label:"Vendor",          value:po.vendor_name},
              {label:"Vendor Email",    value:po.vendor_email},
              {label:"Currency",        value:po.currency},
              {label:"Exchange Rate",   value:po.exchange_rate},
              {label:"Payment Terms",   value:`${po.payment_terms||30} days`},
              {label:"Delivery Date",   value:fmtDate(po.delivery_date)},
              {label:"Delivery Address",value:po.delivery_address},
              {label:"Prepared By",     value:po.prepared_by},
              {label:"Approved By",     value:po.approved_by},
              {label:"Approved At",     value:fmtDate(po.approved_at)},
              {label:"Terms",           value:po.terms_conditions},
              {label:"Internal Notes",  value:po.internal_notes},
            ].map((row: any, i: any) =>row.value&&(
              <div key={i} className="tb-detail-row">
                <span className="tb-detail-key">{row.label}</span>
                <span className="tb-detail-value">{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab==="documents" && (
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
