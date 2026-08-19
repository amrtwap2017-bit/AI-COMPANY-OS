"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return d?new Date(d).toLocaleDateString("en-GB"):"—"; } catch { return "—"; } };
const fmtDateTime = (d: any) => { try { return d?new Date(d).toLocaleString("en-GB"):"—"; } catch { return "—"; } };

export default function GRNDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const { data: grn, isLoading } = useQuery({ queryKey:["grn-detail",id], queryFn:()=>authFetch(`/api/v1/goods-receipt-notes/${id}`).then(r => (r as any).data ?? r), enabled:!!id, staleTime:30000 });
  const { data: rawItems } = useQuery({ queryKey:["grn-items",id], queryFn:()=>authFetch(`/api/v1/goods-receipt-notes/${id}/items`).then(r => (r as any).data ?? r).catch(()=>[]), enabled:!!id, staleTime:30000 });

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-tertiary text-sm">Loading GRN...</div>
    </div>
  );

  if (!grn||grn.detail||grn.error) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">📦</div>
        <div className="tb-empty-title">GRN not found</div>
        <button onClick={()=>router.push("/supply-chain/goods-receipts")} className="tb-btn tb-btn-primary mt-4">Back to GRNs</button>
      </div>
    </div>
  );

  const items = toArr(rawItems);
  const inspPassed = grn.inspection_passed===true||grn.inspection_passed==="true";

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain · Goods Receipt</div>
              <h1 className="tb-hero-title">{grn.grn_number||id?.slice(0,12)}</h1>
              <p className="tb-hero-description">{grn.vendor_name||"—"} · PO: {grn.po_number||"—"}</p>
            </div>
            <div className="tb-action-bar">
              <StatusBadge status={grn.status||"received"} />
              <span className={`tb-badge ${inspPassed?"tb-badge-success":"tb-badge-danger"}`}>
                {inspPassed?"✓ Inspection Passed":"✗ Inspection Failed"}
              </span>
              <button onClick={()=>router.push("/supply-chain/goods-receipts")} className="tb-btn tb-btn-secondary">← Back</button>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{fontSize:"14px"}}>{fmtDate(grn.received_at||grn.created_at)}</div><div className="tb-hero-kpi-label">Received Date</div></div>
            <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{items.length||"—"}</div><div className="tb-hero-kpi-label">Line Items</div></div>
            <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{fontSize:"13px"}}>{grn.received_by||"—"}</div><div className="tb-hero-kpi-label">Received By</div></div>
            <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:inspPassed?"var(--color-success)":"var(--color-danger)"}}>{inspPassed?"Passed":"Failed"}</div><div className="tb-hero-kpi-label">Inspection</div></div>
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid gap-5" style={{gridTemplateColumns:"1fr 340px",alignItems:"start"}}>

          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="tb-section-title">Received Items</div>
              {items.length===0 ? (
                <EmptyState icon="📋" title="No items recorded" description="No line items found for this GRN" />
              ) : (
                <div className="tb-table-wrap">
                  <table className="tb-table">
                    <thead><tr><th>Item</th><th style={{textAlign:"right"}}>Ordered</th><th style={{textAlign:"right"}}>Received</th><th style={{textAlign:"right"}}>Rejected</th><th>Unit</th><th>Notes</th></tr></thead>
                    <tbody>
                      {items.map((item: any, i: number) => {
                        const hasRej = (item.qty_rejected||0) > 0;
                        return (
                          <tr key={item.id||i} style={{borderLeft:hasRej?"3px solid var(--color-danger-border)":"3px solid transparent"}}>
                            <td>
                              <div className="font-semibold text-sm text-primary">{item.item_name||item.description||"—"}</div>
                              {item.item_code && <div className="text-xs text-tertiary mt-0.5">{item.item_code}</div>}
                            </td>
                            <td className="text-right text-sm text-secondary">{item.qty_ordered||item.quantity_ordered||"—"}</td>
                            <td className="text-right font-bold text-success">{item.qty_received||item.quantity_received||"—"}</td>
                            <td className={`text-right ${hasRej?"font-bold text-danger":"text-tertiary"}`}>{item.qty_rejected||0}</td>
                            <td className="text-sm text-secondary">{item.unit||item.unit_of_measure||"—"}</td>
                            <td className="text-xs text-tertiary">{item.notes||item.rejection_reason||"—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {grn.rejection_reason && (
              <div className="tb-alert tb-alert-danger">
                <div>
                  <div className="text-label-upper mb-1.5">Rejection Reason</div>
                  <p className="text-sm m-0">{grn.rejection_reason}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="tb-section-title">Receipt Details</div>
              {[["GRN Number",grn.grn_number],["Status",grn.status],["Vendor",grn.vendor_name||"—"],["Purchase Order",grn.po_number||"—"],["Received By",grn.received_by||"—"],["Received At",fmtDateTime(grn.received_at)],["Delivery Note",grn.delivery_note_no||"—"],["Vehicle No",grn.vehicle_no||"—"],["Inspection",inspPassed?"Passed":"Failed"],["Created",fmtDate(grn.created_at)]].map(([label,value],i)=>(
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{label}</span>
                  <span className="tb-detail-value">
                    {label==="Status"?<StatusBadge status={value||"received"}/>:
                     label==="Inspection"?<span className={inspPassed?"text-success font-bold":"text-danger font-bold"}>{value}</span>:value}
                  </span>
                </div>
              ))}
              {grn.notes && (
                <div className="mt-3 p-3 bg-surface-alt rounded-lg">
                  <div className="text-label-upper text-tertiary mb-1.5">Notes</div>
                  <p className="text-sm text-secondary m-0">{grn.notes}</p>
                </div>
              )}
            </div>
            <div className="tb-section">
              <div className="tb-section-title">Quick Actions</div>
              <div className="flex flex-col gap-2">
                {[{label:"All GRNs",icon:"📦",path:"/supply-chain/goods-receipts"},{label:"Purchase Orders",icon:"📋",path:"/supply-chain/purchase-orders-v2"},{label:"Supplier Invoices",icon:"🧾",path:"/supply-chain/supplier-invoices"},{label:"Vendor Management",icon:"🏢",path:"/supply-chain/vendor-management"}].map((a: any, i: number) =>(
                  <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item">
                    <span>{a.icon}</span><span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
