"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const PO_STATUS_COLOR = {
  pending:"#5B7C8C", approved:"#8D7443", ordered:"#B07A2A",
  received:"#547C4D", cancelled:"#A84A3D", draft:"#6D5F53"
};

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: supplier, isLoading } = useQuery(
    ["supplier-detail", id],
    () => authFetch(`/api/v1/suppliers/${id}`).then(r => r.json()),
    { enabled: !!id }
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-secondary text-sm animate-pulse">Loading supplier...</div>
    </div>
  );

  if (!supplier || supplier.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">🏭</div>
        <div className="tb-empty-title">Supplier not found</div>
        <button onClick={() => router.push("/supply-chain/suppliers")} className="tb-btn-primary mt-4">Back</button>
      </div>
    </div>
  );

  const pos   = supplier.purchase_orders || [];
  const prs   = supplier.purchase_requests || [];
  const stats = supplier.stats || {};

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-base-alt flex items-center justify-center text-2xl font-black text-secondary flex-shrink-0">
                {(supplier.name||"?").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-label-upper text-emerald-400 mb-1">Supply Chain · Supplier</div>
                <h1 className="tb-hero-title">{supplier.name||`Supplier ${id?.slice(0,8)}`}</h1>
                <p className="tb-hero-description">
                  {supplier.category && <span className="text-secondary mr-2">{supplier.category}</span>}
                  {supplier.city && <span className="text-tertiary">{supplier.city}</span>}
                </p>
              </div>
            </div>
            <button onClick={() => router.push("/supply-chain/suppliers")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Total POs",    value:stats.total_pos||0,       color:"#221D1A" },
              { label:"Total Value",  value:fmtEGP(stats.total_value||0), color:"#547C4D" },
              { label:"Open PRs",     value:stats.total_prs||0,       color:"#B07A2A" },
              { label:"Category",     value:supplier.category||"—",   color:"#5B7C8C" },
            ].map((k, i) => (
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
              <div className="tb-section-title">Supplier Details</div>
              <div className="space-y-1">
                {[
                  ["Name",         supplier.name || "—"],
                  ["Category",     supplier.category || "—"],
                  ["Contact",      supplier.contact_name || supplier.contact || "—"],
                  ["Email",        supplier.email || "—"],
                  ["Phone",        supplier.phone || "—"],
                  ["Address",      supplier.address || "—"],
                  ["City",         supplier.city || "—"],
                  ["Country",      supplier.country || "Egypt"],
                  ["Tax ID",       supplier.tax_id || "—"],
                  ["Status",       supplier.status || "Active"],
                ].map(([l, v], i) => (
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{l}</span>
                    <span className="tb-info-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {pos.length > 0 && (
              <div className="tb-section">
                <div className="tb-section-header">
                  <div className="tb-section-title" style={{marginBottom:0}}>Purchase Orders ({pos.length})</div>
                  <button onClick={() => router.push("/supply-chain/purchase-orders")} className="tb-section-link">All →</button>
                </div>
                <div className="tb-table" style={{borderRadius:12,overflow:"hidden",marginTop:12}}>
                  <div className="tb-table-head" style={{gridTemplateColumns:"1fr 90px 120px 100px"}}>
                    {["PO Number","Status","Amount","Date"].map((h, i) => (
                      <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                    ))}
                  </div>
                  {pos.map((po, i) => {
                    const pc = PO_STATUS_COLOR[po.status] || "#6D5F53";
                    return (
                      <button key={i}
                        onClick={() => router.push(`/supply-chain/purchase-orders/${po.id}`)}
                        className="tb-table-row"
                        style={{gridTemplateColumns:"1fr 90px 120px 100px"}}>
                        <div className="text-sm font-medium text-primary truncate pr-4">{po.po_number || po.id?.slice(0,16)}</div>
                        <div className="text-center">
                          <span className="tb-badge" style={{background:`${pc}18`,color:pc,border:`1px solid ${pc}30`,fontSize:"0.5625rem"}}>{po.status||"—"}</span>
                        </div>
                        <div className="text-center text-sm font-bold text-emerald-400">{fmtEGP(po.total_amount||0)}</div>
                        <div className="text-center text-xs text-tertiary">{fmtDate(po.order_date||po.created_at)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {prs.length > 0 && (
              <div className="tb-section">
                <div className="tb-section-header">
                  <div className="tb-section-title" style={{marginBottom:0}}>Purchase Requests ({prs.length})</div>
                  <button onClick={() => router.push("/supply-chain/purchase-requests")} className="tb-section-link">All →</button>
                </div>
                <div className="space-y-2 mt-3">
                  {prs.map((pr, i) => {
                    const sc = { pending:"#5B7C8C", approved:"#547C4D", rejected:"#A84A3D" }[pr.status] || "#6D5F53";
                    return (
                      <button key={i}
                        onClick={() => router.push(`/supply-chain/purchase-requests/${pr.id}`)}
                        className="tb-action-item w-full justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">📋</span>
                          <div className="min-w-0">
                            <div className="text-sm text-secondary truncate">{pr.title||pr.id?.slice(0,20)}</div>
                            <div className="text-xs text-tertiary">{fmtEGP(pr.total_amount||0)}</div>
                          </div>
                        </div>
                        <span className="tb-badge" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`,fontSize:"0.5625rem",flexShrink:0}}>{pr.status||"—"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="tb-section">
              <div className="tb-section-title">Procurement Summary</div>
              <div className="space-y-3">
                {[
                  { label:"Total POs",    value:String(stats.total_pos||0),       color:"#221D1A" },
                  { label:"Total Value",  value:fmtEGP(stats.total_value||0),     color:"#547C4D" },
                  { label:"Open PRs",     value:String(stats.total_prs||0),       color:"#B07A2A" },
                ].map((row, i) => (
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{row.label}</span>
                    <span className="text-sm font-bold" style={{color:row.color}}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Quick Actions</div>
              <div className="space-y-2">
                {[
                  { label:"All Suppliers",      icon:"🏭", path:"/supply-chain/suppliers" },
                  { label:"Purchase Orders",    icon:"📦", path:"/supply-chain/purchase-orders" },
                  { label:"Purchase Requests",  icon:"📋", path:"/supply-chain/purchase-requests" },
                  { label:"Inventory",          icon:"📦", path:"/supply-chain/inventory" },
                ].map((a, i) => (
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
