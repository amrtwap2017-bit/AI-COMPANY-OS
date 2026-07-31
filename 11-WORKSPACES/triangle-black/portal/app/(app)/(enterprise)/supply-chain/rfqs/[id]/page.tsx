"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/lib/toast";

const fmtEGP = (n) => "EGP " + Number(n || 0).toLocaleString();
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };
const STARS = (r) => { const s = Math.round(r || 0); return "★".repeat(s) + "☆".repeat(5 - s); };

export default function RFQDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("bids");
  const [awardTarget, setAwardTarget] = useState(null); // {vendor_id, vendor_name, total_amount, quotation_id}
  const [sortBy, setSortBy] = useState("total_score"); // total_amount | total_score

  const { data: rfq, isLoading } = useQuery({
    queryKey: ["rfq-detail", id],
    queryFn: () => authFetch(`/api/v1/rfq/${id}/bid-comparison`).then(r => r.json()),
    staleTime: 30000,
    enabled: !!id,
  });

  const awardMut = useMutation({
    mutationFn: (payload) =>
      authFetch(`/api/v1/rfq/${id}/award`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(r => r.json()),
    onSuccess: (data) => {
      if (data?.success || data?.rfq_number || data?.id) {
        toast.success(`RFQ awarded to ${awardTarget?.vendor_name}`);
        qc.invalidateQueries(["rfq-detail", id]);
        qc.invalidateQueries(["rfqs-list"]);
        setAwardTarget(null);
      } else {
        toast.error(data?.detail || data?.error || "Award failed");
      }
    },
    onError: () => toast.error("Network error — please try again"),
  });

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--color-text-3)", fontSize: 14 }}>Loading RFQ...</div>
    </div>
  );

  if (!rfq || rfq.error || rfq.detail) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-1)", marginBottom: 8 }}>RFQ not found</div>
        <button onClick={() => router.push("/supply-chain/rfq-management")}
          style={{ background: "linear-gradient(135deg,#8F6F3D,#B9924C)", color: "#181614", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>
          Back to RFQs
        </button>
      </div>
    </div>
  );

  const quotes = [...(rfq.quotations || [])].sort((a, b) =>
    sortBy === "total_amount"
      ? Number(a.total_amount) - Number(b.total_amount)
      : Number(b.total_score || 0) - Number(a.total_score || 0)
  );
  const items = rfq.rfq_items || [];
  const lowestPrice = rfq.lowest_price || Math.min(...quotes.map(q => q.total_amount || Infinity));
  const canAward = ["responses_received", "evaluated", "open", "closed"].includes(rfq.status);
  const isAwarded = rfq.status === "awarded";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#B9924C", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Supply Chain · RFQ
              </div>
              <h1 className="tb-hero-title">{rfq.rfq_number}</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 13, marginTop: 4, maxWidth: 500 }}>
                {(rfq.title || "").slice(0, 80)}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <StatusBadge status={rfq.status || "draft"} />
              {canAward && (
                <button
                  onClick={() => {
                    const best = quotes[0];
                    if (best) setAwardTarget({ vendor_id: best.vendor_id, vendor_name: best.vendor_name, total_amount: best.total_amount, quotation_id: best.id });
                  }}
                  style={{
                    background: "linear-gradient(135deg,#8F6F3D,#B9924C)",
                    color: "#181614", border: "none", borderRadius: 10,
                    padding: "10px 20px", fontWeight: 700, fontSize: 14,
                    cursor: "pointer", whiteSpace: "nowrap"
                  }}
                >
                  🏆 Award RFQ
                </button>
              )}
              <button
                onClick={() => router.push("/supply-chain/rfq-management")}
                style={{
                  background: "none", border: "1px solid var(--color-border)",
                  color: "var(--color-text-2)", borderRadius: 8,
                  padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600
                }}
              >
                ← Back
              </button>
            </div>
          </div>

          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{quotes.length}</div>
                <div className="tb-hero-kpi-label">Bids Received</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#547C4D", fontSize: 15 }}>
                  {lowestPrice < Infinity ? fmtEGP(lowestPrice) : "—"}
                </div>
                <div className="tb-hero-kpi-label">Lowest Bid</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#B9924C", fontSize: 15 }}>
                  {rfq.total_budget ? fmtEGP(rfq.total_budget) : "—"}
                </div>
                <div className="tb-hero-kpi-label">Budget</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ fontSize: 14, color: rfq.submission_deadline && new Date(rfq.submission_deadline) < new Date() ? "#A84A3D" : "var(--color-text-1)" }}>
                  {fmtDate(rfq.submission_deadline)}
                </div>
                <div className="tb-hero-kpi-label">Deadline</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div className="tb-canvas">

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--color-border)", paddingBottom: 0 }}>
          {[
            { key: "bids", label: `Bid Comparison (${quotes.length})` },
            { key: "items", label: `Line Items (${items.length})` },
            { key: "details", label: "RFQ Details" },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{
                padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                background: "none", border: "none",
                color: activeTab === t.key ? "#B9924C" : "var(--color-text-3)",
                borderBottom: activeTab === t.key ? "2px solid #B9924C" : "2px solid transparent",
                marginBottom: -1
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: BID COMPARISON ───────────────────────── */}
        {activeTab === "bids" && (
          <div className="tb-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 className="tb-section-title" style={{ margin: 0 }}>
                Vendor Bids
                {isAwarded && <span style={{ marginLeft: 8, fontSize: 12, color: "#547C4D", fontWeight: 400 }}>✓ Awarded</span>}
              </h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--color-text-3)" }}>Sort by:</span>
                <button onClick={() => setSortBy("total_score")}
                  className={sortBy === "total_score" ? "tb-pill tb-pill--active" : "tb-pill"}>
                  Score
                </button>
                <button onClick={() => setSortBy("total_amount")}
                  className={sortBy === "total_amount" ? "tb-pill tb-pill--active" : "tb-pill"}>
                  Price
                </button>
              </div>
            </div>

            {quotes.length === 0 ? (
              <EmptyState icon="📊" title="No bids received yet" description="Vendors have not submitted quotations for this RFQ" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="tb-table-header">
                      <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>VENDOR</th>
                      <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>TOTAL PRICE</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>SCORE</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>DELIVERY</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>TERMS</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>STATUS</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((q, idx) => {
                      const isLowest = q.total_amount === lowestPrice;
                      const isBest = idx === 0 && sortBy === "total_score";
                      const isWinner = q.is_selected || (isAwarded && q.vendor_id === rfq.awarded_vendor_id);
                      return (
                        <tr key={q.id} className="tb-table-row"
                          style={{
                            background: isWinner
                              ? "rgba(185,146,76,0.08)"
                              : isLowest && sortBy === "total_amount"
                                ? "rgba(84,124,77,0.06)"
                                : undefined,
                            borderLeft: isWinner ? "3px solid #B9924C" : "3px solid transparent"
                          }}
                        >
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-1)", display: "flex", alignItems: "center", gap: 6 }}>
                              {isWinner && <span style={{ color: "#B9924C" }}>🏆</span>}
                              {q.vendor_name || "—"}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 2 }}>
                              {STARS(q.vendor_rating)} {q.quotation_number}
                            </div>
                            {q.notes && (
                              <div style={{ fontSize: 11, color: "#547C4D", marginTop: 2, fontStyle: "italic" }}>
                                {q.notes.slice(0, 60)}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right" }}>
                            <div style={{ fontWeight: 800, fontSize: 15, color: isLowest ? "#547C4D" : "#B9924C" }}>
                              {fmtEGP(q.total_amount)}
                            </div>
                            {isLowest && <div style={{ fontSize: 10, color: "#547C4D", fontWeight: 600 }}>LOWEST</div>}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <div style={{ fontWeight: 800, fontSize: 16, color: (q.total_score || 0) >= 85 ? "#547C4D" : (q.total_score || 0) >= 70 ? "#B07A2A" : "#A84A3D" }}>
                              {q.total_score?.toFixed(0) || "—"}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--color-text-3)" }}>
                              T:{q.technical_score?.toFixed(0)} C:{q.commercial_score?.toFixed(0)}
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 13, color: "var(--color-text-2)" }}>
                            {q.delivery_days ? `${q.delivery_days}d` : "—"}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 13, color: "var(--color-text-2)" }}>
                            Net {q.payment_terms || 30}d
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <StatusBadge status={q.status || "submitted"} />
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            {canAward && !isAwarded ? (
                              <button
                                onClick={() => setAwardTarget({
                                  vendor_id: q.vendor_id,
                                  vendor_name: q.vendor_name,
                                  total_amount: q.total_amount,
                                  quotation_id: q.id
                                })}
                                style={{
                                  background: isLowest || isBest
                                    ? "linear-gradient(135deg,#8F6F3D,#B9924C)"
                                    : "var(--color-surface-alt)",
                                  color: isLowest || isBest ? "#181614" : "var(--color-text-2)",
                                  border: "1px solid var(--color-border)",
                                  borderRadius: 6, padding: "6px 12px",
                                  fontSize: 12, fontWeight: 700, cursor: "pointer"
                                }}
                              >
                                Award
                              </button>
                            ) : isWinner ? (
                              <span style={{ fontSize: 12, color: "#547C4D", fontWeight: 700 }}>✓ Awarded</span>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: LINE ITEMS ───────────────────────────── */}
        {activeTab === "items" && (
          <div className="tb-section">
            <h2 className="tb-section-title">RFQ Line Items</h2>
            {items.length === 0 ? (
              <EmptyState icon="📦" title="No line items" description="No items defined for this RFQ" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="tb-table-header">
                      <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>#</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>DESCRIPTION</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>QTY</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>UNIT</th>
                      <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>EST. PRICE</th>
                      <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>EST. TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={item.id || i} className="tb-table-row">
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--color-text-3)", fontWeight: 600 }}>
                          {item.item_number || i + 1}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-1)" }}>
                            {item.description || "—"}
                          </div>
                          {item.specification && (
                            <div style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 2 }}>
                              {item.specification.slice(0, 60)}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "center", fontSize: 14, fontWeight: 700, color: "var(--color-text-1)" }}>
                          {item.quantity || "—"}
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--color-text-2)" }}>
                          {item.unit || "unit"}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 13, color: "var(--color-text-2)" }}>
                          {item.estimated_unit_price ? fmtEGP(item.estimated_unit_price) : "—"}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#B9924C" }}>
                          {item.estimated_unit_price && item.quantity
                            ? fmtEGP(item.estimated_unit_price * item.quantity)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "2px solid var(--color-border)" }}>
                      <td colSpan={5} style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "var(--color-text-2)", textAlign: "right" }}>
                        Estimated Total
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontSize: 15, fontWeight: 800, color: "#B9924C" }}>
                        {fmtEGP(items.reduce((s, i) => s + (i.estimated_unit_price || 0) * (i.quantity || 0), 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: DETAILS ──────────────────────────────── */}
        {activeTab === "details" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="tb-section">
              <h2 className="tb-section-title">RFQ Information</h2>
              {[
                ["RFQ Number",       rfq.rfq_number],
                ["Title",            rfq.title],
                ["Status",           rfq.status],
                ["RFQ Type",         rfq.rfq_type || "open"],
                ["Currency",         rfq.currency || "EGP"],
                ["Total Budget",     rfq.total_budget ? fmtEGP(rfq.total_budget) : "—"],
                ["Submission Deadline", fmtDate(rfq.submission_deadline)],
                ["Evaluation Criteria", rfq.evaluation_criteria || "best_value"],
                ["Prepared By",      rfq.prepared_by || "—"],
                ["Created",          fmtDate(rfq.created_at)],
              ].map(([label, value], i, arr) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "9px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none"
                }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-3)" }}>{label}</span>
                  <span style={{ fontSize: 13, color: "var(--color-text-1)", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>
                    {label === "Status" ? <StatusBadge status={value} /> : value}
                  </span>
                </div>
              ))}
            </div>
            <div className="tb-section">
              <h2 className="tb-section-title">Description & Notes</h2>
              {rfq.description && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-3)", marginBottom: 8, textTransform: "uppercase" }}>Description</div>
                  <p style={{ fontSize: 13, color: "var(--color-text-2)", lineHeight: 1.6 }}>{rfq.description}</p>
                </div>
              )}
              {rfq.delivery_location && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-3)", marginBottom: 8, textTransform: "uppercase" }}>Delivery Location</div>
                  <p style={{ fontSize: 13, color: "var(--color-text-2)" }}>📍 {rfq.delivery_location}</p>
                </div>
              )}
              {rfq.notes && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-3)", marginBottom: 8, textTransform: "uppercase" }}>Notes</div>
                  <p style={{ fontSize: 13, color: "var(--color-text-2)", lineHeight: 1.6 }}>{rfq.notes}</p>
                </div>
              )}
              {!rfq.description && !rfq.delivery_location && !rfq.notes && (
                <p style={{ fontSize: 13, color: "var(--color-text-3)" }}>No additional details</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── AWARD CONFIRM MODAL ───────────────────────────── */}
      {awardTarget && (
        <div
          onClick={() => setAwardTarget(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(15,13,11,0.65)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--color-surface)", borderRadius: 16,
              border: "1px solid var(--color-border)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
              width: "100%", maxWidth: 440, padding: 28
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text-1)", margin: 0 }}>
                Confirm Award
              </h2>
              <p style={{ fontSize: 13, color: "var(--color-text-3)", marginTop: 6 }}>
                This action cannot be undone
              </p>
            </div>

            {/* Award summary */}
            <div style={{
              background: "rgba(185,146,76,0.08)",
              border: "1px solid rgba(185,146,76,0.2)",
              borderRadius: 10, padding: "16px 20px", marginBottom: 24
            }}>
              {[
                ["RFQ", rfq.rfq_number],
                ["Vendor", awardTarget.vendor_name],
                ["Amount", fmtEGP(awardTarget.total_amount)],
              ].map(([label, value], i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: i < 2 ? "1px solid rgba(185,146,76,0.15)" : "none"
                }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-3)" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-1)" }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setAwardTarget(null)}
                style={{
                  flex: 1, padding: "11px", borderRadius: 8, fontSize: 14,
                  cursor: "pointer", background: "none",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-2)", fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => awardMut.mutate({ vendor_id: awardTarget.vendor_id, quotation_id: awardTarget.quotation_id })}
                disabled={awardMut.isLoading}
                style={{
                  flex: 1, padding: "11px", borderRadius: 8, fontSize: 14,
                  fontWeight: 800, cursor: awardMut.isLoading ? "not-allowed" : "pointer",
                  background: awardMut.isLoading ? "var(--color-border)" : "linear-gradient(135deg,#8F6F3D,#B9924C)",
                  color: "#181614", border: "none"
                }}
              >
                {awardMut.isLoading ? "Awarding..." : "Confirm Award"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
