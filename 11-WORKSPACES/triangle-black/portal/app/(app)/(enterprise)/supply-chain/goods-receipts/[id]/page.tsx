"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };
const fmtDateTime = (d) => { try { return d ? new Date(d).toLocaleString("en-GB") : "—"; } catch { return "—"; } };

export default function GRNDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const { data: grn, isLoading } = useQuery({
    queryKey: ["grn-detail", id],
    queryFn: () => authFetch(`/api/v1/goods-receipt-notes/${id}`).then(r => r.json()),
    enabled: !!id,
    staleTime: 30000,
  });

  const { data: rawItems } = useQuery({
    queryKey: ["grn-items", id],
    queryFn: () => authFetch(`/api/v1/goods-receipt-notes/${id}/items`).then(r => r.json()).catch(() => []),
    enabled: !!id,
    staleTime: 30000,
  });

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--color-text-3)", fontSize: 14 }}>Loading GRN...</div>
    </div>
  );

  if (!grn || grn.detail || grn.error) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-1)", marginBottom: 20 }}>GRN not found</div>
        <button onClick={() => router.push("/supply-chain/goods-receipts")}
          style={{ background: "linear-gradient(135deg,#8F6F3D,#B9924C)", color: "#181614", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>
          Back to GRNs
        </button>
      </div>
    </div>
  );

  const items = toArr(rawItems);
  const isInspectionPassed = grn.inspection_passed === true || grn.inspection_passed === "true";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#B9924C", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Supply Chain · Goods Receipt
              </div>
              <h1 className="tb-hero-title">{grn.grn_number || id?.slice(0, 12)}</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 13, marginTop: 4 }}>
                {grn.vendor_name || "—"} · PO: {grn.po_number || "—"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <StatusBadge status={grn.status || "received"} />
              <div style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: isInspectionPassed ? "rgba(84,124,77,0.12)" : "rgba(168,74,61,0.12)",
                color: isInspectionPassed ? "#547C4D" : "#A84A3D",
                border: `1px solid ${isInspectionPassed ? "rgba(84,124,77,0.25)" : "rgba(168,74,61,0.25)"}`
              }}>
                {isInspectionPassed ? "✓ Inspection Passed" : "✗ Inspection Failed"}
              </div>
              <button onClick={() => router.push("/supply-chain/goods-receipts")}
                style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                ← Back
              </button>
            </div>
          </div>
          <div className="tb-hero-kpis">
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{ fontSize: 14 }}>{fmtDate(grn.received_at || grn.created_at)}</div>
              <div className="tb-hero-kpi-label">Received Date</div>
            </div>
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value">{items.length || "—"}</div>
              <div className="tb-hero-kpi-label">Line Items</div>
            </div>
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{ fontSize: 13 }}>{grn.received_by || "—"}</div>
              <div className="tb-hero-kpi-label">Received By</div>
            </div>
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{ color: isInspectionPassed ? "#547C4D" : "#A84A3D" }}>
                {isInspectionPassed ? "Passed" : "Failed"}
              </div>
              <div className="tb-hero-kpi-label">Inspection</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div className="tb-canvas">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

          {/* ── LEFT: GRN ITEMS ───────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Received Items */}
            <div className="tb-section">
              <h2 className="tb-section-title">Received Items</h2>
              {items.length === 0 ? (
                <EmptyState icon="📋" title="No items recorded" description="No line items found for this GRN" />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr className="tb-table-header">
                        <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>ITEM</th>
                        <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>ORDERED</th>
                        <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>RECEIVED</th>
                        <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>REJECTED</th>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>UNIT</th>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>NOTES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => {
                        const hasRejection = (item.qty_rejected || 0) > 0;
                        return (
                          <tr key={item.id || i} className="tb-table-row"
                            style={{ borderLeft: hasRejection ? "3px solid rgba(168,74,61,0.4)" : "3px solid transparent" }}>
                            <td style={{ padding: "10px 14px" }}>
                              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-1)" }}>
                                {item.item_name || item.description || "—"}
                              </div>
                              {item.item_code && (
                                <div style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 1 }}>{item.item_code}</div>
                              )}
                            </td>
                            <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 13, color: "var(--color-text-2)" }}>
                              {item.qty_ordered || item.quantity_ordered || "—"}
                            </td>
                            <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 14, fontWeight: 700, color: "#547C4D" }}>
                              {item.qty_received || item.quantity_received || "—"}
                            </td>
                            <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 13, color: hasRejection ? "#A84A3D" : "var(--color-text-3)", fontWeight: hasRejection ? 700 : 400 }}>
                              {item.qty_rejected || 0}
                            </td>
                            <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--color-text-2)" }}>
                              {item.unit || item.unit_of_measure || "—"}
                            </td>
                            <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-text-3)" }}>
                              {item.notes || item.rejection_reason || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Rejection reason if any */}
            {grn.rejection_reason && (
              <div style={{
                padding: "14px 16px", background: "rgba(168,74,61,0.06)",
                border: "1px solid rgba(168,74,61,0.2)", borderRadius: 10
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#A84A3D", marginBottom: 6, textTransform: "uppercase" }}>
                  Rejection Reason
                </div>
                <p style={{ fontSize: 13, color: "var(--color-text-2)", margin: 0 }}>{grn.rejection_reason}</p>
              </div>
            )}
          </div>

          {/* ── RIGHT: GRN INFO ───────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* GRN Details */}
            <div className="tb-section">
              <h2 className="tb-section-title">Receipt Details</h2>
              {[
                ["GRN Number",      grn.grn_number],
                ["Status",          grn.status],
                ["Vendor",          grn.vendor_name || "—"],
                ["Purchase Order",  grn.po_number || "—"],
                ["Received By",     grn.received_by || "—"],
                ["Received At",     fmtDateTime(grn.received_at)],
                ["Delivery Note",   grn.delivery_note_no || "—"],
                ["Vehicle No",      grn.vehicle_no || "—"],
                ["Inspection",      isInspectionPassed ? "Passed" : "Failed"],
                ["Created",         fmtDate(grn.created_at)],
              ].map(([label, value], i, arr) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", padding: "8px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none"
                }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-3)" }}>{label}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-1)", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>
                    {label === "Status" ? <StatusBadge status={value || "received"} /> :
                     label === "Inspection" ? (
                       <span style={{ color: isInspectionPassed ? "#547C4D" : "#A84A3D", fontWeight: 700 }}>{value}</span>
                     ) : value}
                  </span>
                </div>
              ))}
              {grn.notes && (
                <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--color-surface-alt)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-3)", marginBottom: 4, textTransform: "uppercase" }}>Notes</div>
                  <p style={{ fontSize: 13, color: "var(--color-text-2)", margin: 0 }}>{grn.notes}</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="tb-section">
              <h2 className="tb-section-title">Quick Actions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "All GRNs", icon: "📦", path: "/supply-chain/goods-receipts" },
                  { label: "Purchase Orders", icon: "📋", path: "/supply-chain/purchase-orders-v2" },
                  { label: "Supplier Invoices", icon: "🧾", path: "/supply-chain/supplier-invoices" },
                  { label: "Vendor Management", icon: "🏢", path: "/supply-chain/vendor-management" },
                ].map((a, i) => (
                  <button key={i} onClick={() => router.push(a.path)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                      background: "var(--color-surface-alt)", border: "1px solid var(--color-border)",
                      color: "var(--color-text-2)", fontSize: 13, fontWeight: 500, textAlign: "left", width: "100%"
                    }}>
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
