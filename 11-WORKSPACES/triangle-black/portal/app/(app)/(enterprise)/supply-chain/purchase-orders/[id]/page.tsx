"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_COLOR = {
  draft:"#6D5F53", pending:"#5B7C8C", approved:"#8D7443",
  ordered:"#B07A2A", received:"#547C4D", cancelled:"#A84A3D"
};

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: po, isLoading } = useQuery(
    ["po-detail", id],
    () => authFetch("/api/v1/purchase-orders-portal" + id).then(r => r.data ?? r),
    { enabled: !!id }
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-secondary text-sm animate-pulse">Loading...</div>
    </div>
  );

  if (!po || po.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">📦</div>
        <div className="tb-empty-title">Purchase order not found</div>
        <button onClick={() => router.push("/supply-chain/purchase-orders")} className="tb-btn-primary mt-4">Back</button>
      </div>
    </div>
  );

  const sc = (STATUS_COLOR as Record<string, any>)[po.status] || "#6D5F53";
  const amount = Number(po.total_amount || po.total_value || 0);

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1.5">Supply Chain · Purchase Orders</div>
              <h1 className="tb-hero-title">{po.po_number || ("PO-" + (id||"").slice(0,8).toUpperCase())}</h1>
              <p className="tb-hero-description">
                <span className="tb-badge mr-2" style={{background:sc+"18",color:sc,border:"1px solid "+sc+"30"}}>{po.status||"—"}</span>
                {po.supplier_name && <span className="text-secondary">{po.supplier_name}</span>}
              </p>
            </div>
            <button onClick={() => router.push("/supply-chain/purchase-orders")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Status",     value:(po.status||"—").toUpperCase(), color:sc },
              { label:"Total",      value:fmtEGP(amount),                 color:"#547C4D" },
              { label:"Supplier",   value:po.supplier_name||"—",          color:"#5B7C8C" },
              { label:"Order Date", value:fmtDate(po.order_date||po.created_at), color:"#6D5F53" },
            ].map((k: any, i: number) => (
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-5">
            <div className="tb-section">
              <div className="tb-section-title">Order Details</div>
              <div className="space-y-1">
                {[
                  ["PO Number",         po.po_number || ("PO-" + id?.slice(0,8)?.toUpperCase())],
                  ["Status",            po.status || "—"],
                  ["Supplier",          po.supplier_name || "—"],
                  ["Total Amount",      fmtEGP(amount)],
                  ["Order Date",        fmtDate(po.order_date || po.created_at)],
                  ["Expected Delivery", fmtDate(po.expected_delivery_date || po.delivery_date)],
                  ["Received Date",     fmtDate(po.received_date)],
                  ["Payment Terms",     po.payment_terms || "—"],
                  ["Created By",        po.created_by || "—"],
                  ["Notes",             po.notes || "—"],
                ].map(([l, v], i) => (
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{l}</span>
                    <span className="tb-info-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order lifecycle */}
            <div className="tb-section">
              <div className="tb-section-title">Order Lifecycle</div>
              <div className="space-y-3">
                {[
                  { label:"Created",   date:po.created_at,          done:true,                         color:"#5B7C8C" },
                  { label:"Approved",  date:po.approved_at,         done:["approved","ordered","received"].includes(po.status), color:"#8D7443" },
                  { label:"Ordered",   date:po.order_date,          done:["ordered","received"].includes(po.status), color:"#B07A2A" },
                  { label:"Received",  date:po.received_date,       done:po.status==="received",       color:"#547C4D" },
                ].map((step: any, i: any) => (
                  <div key={i} className="flex items-center gap-3">
                    <div style={{
                      width:20, height:20, borderRadius:"50%", flexShrink:0,
                      background: step.done ? step.color+"30" : "transparent",
                      border: "2px solid " + (step.done ? step.color : "#334155"),
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"0.625rem", color: step.done ? step.color : "#64748B", fontWeight:900,
                    }}>
                      {step.done ? "✓" : ""}
                    </div>
                    <div>
                      <div className="text-xs font-semibold" style={{color:step.done?step.color:"#64748B"}}>{step.label}</div>
                      {step.date && <div className="text-xs text-tertiary">{fmtDate(step.date)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="tb-section">
              <div className="tb-section-title">Order Status</div>
              <div className="text-center py-4">
                <div className="text-5xl font-black mb-2" style={{color:sc}}>
                  {po.status==="received"?"✓":po.status==="cancelled"?"✗":"○"}
                </div>
                <div className="text-sm font-bold" style={{color:sc}}>{(po.status||"—").toUpperCase()}</div>
                <div className="text-lg font-black text-emerald-400 mt-2">{fmtEGP(amount)}</div>
              </div>
            </div>
            {po.supplier_id && (
              <button onClick={() => router.push("/supply-chain/suppliers/" + po.supplier_id)}
                className="tb-section w-full text-left hover:border-brand transition-colors">
                <div className="text-xs text-tertiary mb-1">Supplier</div>
                <div className="text-sm font-semibold text-primary">{po.supplier_name||"—"}</div>
                <div className="text-xs text-brand mt-1">View supplier →</div>
              </button>
            )}
            <div className="tb-section">
              <div className="tb-section-title">Quick Actions</div>
              <div className="space-y-2">
                {[
                  { label:"All POs",          icon:"📦", path:"/supply-chain/purchase-orders" },
                  { label:"Purchase Requests", icon:"📋", path:"/supply-chain/purchase-requests" },
                  { label:"Suppliers",         icon:"🏭", path:"/supply-chain/suppliers" },
                  { label:"Inventory",         icon:"📦", path:"/supply-chain/inventory" },
                ].map((a: any, i: number) => (
                  <button key={i} onClick={() => router.push(a.path)} className="tb-action-item w-full justify-start">
                    <span>{a.icon}</span>
                    <span className="text-sm text-secondary">{a.label}</span>
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
