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

const EMPTY_RFQ = {
  title: "", rfq_type: "open", currency: "EGP",
  total_budget: "", submission_deadline: "",
  delivery_location: "", notes: ""
};

export default function SOWDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("boq");
  const [showCreateRFQ, setShowCreateRFQ] = useState(false);
  const [rfqForm, setRFQForm] = useState({ ...EMPTY_RFQ });
  const [rfqErrors, setRFQErrors] = useState({});

  // ── DATA ──────────────────────────────────────────────────
  const { data: sow, isLoading } = useQuery({
    queryKey: ["sow-detail", id],
    queryFn: () => authFetch(`/api/v1/scope-of-work/${id}`).then(r => r.json()),
    staleTime: 30000,
    enabled: !!id,
  });

  // ── APPROVE / REJECT ──────────────────────────────────────
  const approveMut = useMutation({
    mutationFn: (action) =>
      authFetch(`/api/v1/scope-of-work/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, approved_by: "amr@triangleblack.com" }),
      }).then(r => r.json()),
    onSuccess: (data, action) => {
      if (data?.id || data?.status) {
        toast.success(action === "approve" ? "SOW approved" : "SOW rejected");
        qc.invalidateQueries(["sow-detail", id]);
      } else {
        toast.error(data?.detail || "Action failed");
      }
    },
    onError: () => toast.error("Network error"),
  });

  // ── DELETE ────────────────────────────────────────────────
  const deleteMut = useMutation({
    mutationFn: () =>
      authFetch(`/api/v1/scope-of-work/v2/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("SOW deleted");
      router.push("/supply-chain/scope-of-work");
    },
    onError: () => toast.error("Delete failed"),
  });

  // ── CREATE RFQ ────────────────────────────────────────────
  const createRFQ = useMutation({
    mutationFn: (payload) =>
      authFetch("/api/v1/rfq/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(r => r.json()),
    onSuccess: (data) => {
      if (data?.id || data?.rfq_number) {
        toast.success(`RFQ ${data.rfq_number || ""} created from SOW`);
        qc.invalidateQueries(["sow-detail", id]);
        setShowCreateRFQ(false);
        setRFQForm({ ...EMPTY_RFQ });
        setRFQErrors({});
        if (data.id) router.push(`/supply-chain/rfqs/${data.id}`);
        else router.push("/supply-chain/rfq-management");
      } else {
        toast.error(data?.detail || data?.error || "Failed to create RFQ");
      }
    },
    onError: () => toast.error("Network error — please try again"),
  });

  const openRFQModal = () => {
    if (!sow) return;
    setRFQForm({
      title: `RFQ for ${sow.title || sow.sow_number || "SOW"}`,
      rfq_type: "open",
      currency: sow.currency || "EGP",
      total_budget: sow.total_cost || sow.materials_cost || "",
      submission_deadline: "",
      delivery_location: sow.delivery_location || "",
      notes: "",
    });
    setRFQErrors({});
    setShowCreateRFQ(true);
  };

  const setF = (k, v) => {
    setRFQForm(f => ({ ...f, [k]: v }));
    if (rfqErrors[k]) setRFQErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const handleCreateRFQ = () => {
    const e = {};
    if (!rfqForm.title.trim()) e.title = "Title is required";
    if (!rfqForm.submission_deadline) e.submission_deadline = "Deadline is required";
    if (Object.keys(e).length) { setRFQErrors(e); return; }
    createRFQ.mutate({
      title: rfqForm.title.trim(),
      sow_id: id,
      rfq_type: rfqForm.rfq_type,
      currency: rfqForm.currency,
      total_budget: parseFloat(rfqForm.total_budget) || 0,
      submission_deadline: rfqForm.submission_deadline,
      delivery_location: rfqForm.delivery_location || "",
      notes: rfqForm.notes || "",
    });
  };

  // ── LOADING / ERROR STATES ────────────────────────────────
  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--color-text-3)", fontSize: 14 }}>Loading SOW...</div>
    </div>
  );

  if (!sow || sow.error) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-1)", marginBottom: 20 }}>SOW not found</div>
        <button onClick={() => router.push("/supply-chain/scope-of-work")}
          style={{ background: "linear-gradient(135deg,#8F6F3D,#B9924C)", color: "#181614", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>
          Back to SOWs
        </button>
      </div>
    </div>
  );

  const boqItems = sow.boq_items || [];
  const boqTotal = boqItems.reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const overhead = boqTotal * (Number(sow.overhead_pct || 0) / 100);
  const profit = (boqTotal + overhead) * (Number(sow.profit_margin_pct || 0) / 100);
  const grandTotal = boqTotal + overhead + profit + Number(sow.labor_cost || 0);
  const isApproved = sow.status === "approved";
  const canApprove = sow.status === "pending_approval";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#B9924C", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Supply Chain · Scope of Work
              </div>
              <h1 className="tb-hero-title">{sow.sow_number}</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 13, marginTop: 4, maxWidth: 500 }}>
                {(sow.title || "").slice(0, 80)}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <StatusBadge status={sow.status || "draft"} />

              {/* Create RFQ — only when approved */}
              {isApproved && (
                <button
                  onClick={openRFQModal}
                  style={{
                    background: "linear-gradient(135deg,#8F6F3D,#B9924C)",
                    color: "#181614", border: "none", borderRadius: 10,
                    padding: "10px 20px", fontWeight: 700, fontSize: 14,
                    cursor: "pointer", whiteSpace: "nowrap"
                  }}
                >
                  + Create RFQ
                </button>
              )}

              {/* Approve / Reject */}
              {canApprove && (
                <>
                  <button
                    onClick={() => approveMut.mutate("approve")}
                    disabled={approveMut.isLoading}
                    style={{
                      background: "#547C4D", color: "#fff", border: "none",
                      borderRadius: 8, padding: "8px 16px", fontWeight: 700,
                      fontSize: 13, cursor: "pointer"
                    }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => approveMut.mutate("reject")}
                    disabled={approveMut.isLoading}
                    style={{
                      background: "#A84A3D", color: "#fff", border: "none",
                      borderRadius: 8, padding: "8px 16px", fontWeight: 700,
                      fontSize: 13, cursor: "pointer"
                    }}
                  >
                    ✗ Reject
                  </button>
                </>
              )}

              {/* PDF Export */}
              <a
                href={`/api/v1/pdf/scope-of-work/${id}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  background: "none", border: "1px solid var(--color-border)",
                  color: "var(--color-text-2)", borderRadius: 8,
                  padding: "8px 14px", fontSize: 13, cursor: "pointer",
                  fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4
                }}
              >
                📄 PDF
              </a>

              <button
                onClick={() => router.push("/supply-chain/scope-of-work")}
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
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value">{boqItems.length}</div>
              <div className="tb-hero-kpi-label">BOQ Items</div>
            </div>
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{ color: "#B9924C", fontSize: 15 }}>
                {fmtEGP(grandTotal || sow.total_cost || 0)}
              </div>
              <div className="tb-hero-kpi-label">Total Value</div>
            </div>
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{ fontSize: 14 }}>
                {fmtDate(sow.created_at)}
              </div>
              <div className="tb-hero-kpi-label">Created</div>
            </div>
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{ fontSize: 14 }}>
                {sow.prepared_by?.split("@")[0] || "—"}
              </div>
              <div className="tb-hero-kpi-label">Prepared By</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div className="tb-canvas">

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--color-border)" }}>
          {[
            { key: "boq", label: `BOQ Items (${boqItems.length})` },
            { key: "details", label: "SOW Details" },
            { key: "actions", label: "Actions" },
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

        {/* ── TAB: BOQ ITEMS ────────────────────────────── */}
        {activeTab === "boq" && (
          <div className="tb-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 className="tb-section-title" style={{ margin: 0 }}>Bill of Quantities</h2>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#B9924C" }}>{fmtEGP(boqTotal)}</span>
            </div>
            {boqItems.length === 0 ? (
              <EmptyState icon="📋" title="No BOQ items" description="No bill of quantities items defined for this SOW" />
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr className="tb-table-header">
                        <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>#</th>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>DESCRIPTION</th>
                        <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>QTY</th>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>UNIT</th>
                        <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>UNIT PRICE</th>
                        <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boqItems.map((item, i) => (
                        <tr key={item.id || i} className="tb-table-row">
                          <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-text-3)", fontWeight: 600 }}>{i + 1}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-1)" }}>{item.description || item.item_name || "—"}</div>
                            {item.specification && <div style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 2 }}>{item.specification.slice(0, 60)}</div>}
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "center", fontSize: 14, fontWeight: 700, color: "var(--color-text-1)" }}>{item.quantity || "—"}</td>
                          <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--color-text-2)" }}>{item.unit || "unit"}</td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 13, color: "var(--color-text-2)" }}>{item.unit_price ? fmtEGP(item.unit_price) : "—"}</td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#B9924C" }}>{item.total_amount ? fmtEGP(item.total_amount) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: "2px solid var(--color-border)" }}>
                        <td colSpan={5} style={{ padding: "12px 14px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "var(--color-text-2)" }}>BOQ Subtotal</td>
                        <td style={{ padding: "12px 14px", textAlign: "right", fontSize: 14, fontWeight: 800, color: "#B9924C" }}>{fmtEGP(boqTotal)}</td>
                      </tr>
                      {sow.overhead_pct > 0 && (
                        <tr>
                          <td colSpan={5} style={{ padding: "6px 14px", textAlign: "right", fontSize: 12, color: "var(--color-text-3)" }}>Overhead ({sow.overhead_pct}%)</td>
                          <td style={{ padding: "6px 14px", textAlign: "right", fontSize: 12, color: "var(--color-text-2)" }}>{fmtEGP(overhead)}</td>
                        </tr>
                      )}
                      {sow.profit_margin_pct > 0 && (
                        <tr>
                          <td colSpan={5} style={{ padding: "6px 14px", textAlign: "right", fontSize: 12, color: "var(--color-text-3)" }}>Profit Margin ({sow.profit_margin_pct}%)</td>
                          <td style={{ padding: "6px 14px", textAlign: "right", fontSize: 12, color: "var(--color-text-2)" }}>{fmtEGP(profit)}</td>
                        </tr>
                      )}
                      {sow.labor_cost > 0 && (
                        <tr>
                          <td colSpan={5} style={{ padding: "6px 14px", textAlign: "right", fontSize: 12, color: "var(--color-text-3)" }}>Labor Cost</td>
                          <td style={{ padding: "6px 14px", textAlign: "right", fontSize: 12, color: "var(--color-text-2)" }}>{fmtEGP(sow.labor_cost)}</td>
                        </tr>
                      )}
                      <tr style={{ borderTop: "1px solid var(--color-border)", background: "rgba(185,146,76,0.05)" }}>
                        <td colSpan={5} style={{ padding: "12px 14px", textAlign: "right", fontSize: 14, fontWeight: 800, color: "var(--color-text-1)" }}>Grand Total</td>
                        <td style={{ padding: "12px 14px", textAlign: "right", fontSize: 16, fontWeight: 900, color: "#B9924C" }}>{fmtEGP(grandTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB: DETAILS ──────────────────────────────── */}
        {activeTab === "details" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="tb-section">
              <h2 className="tb-section-title">SOW Information</h2>
              {[
                ["SOW Number",     sow.sow_number],
                ["Title",          sow.title],
                ["Status",         sow.status],
                ["Type",           sow.sow_type || sow.type || "standard"],
                ["Currency",       sow.currency || "EGP"],
                ["Total Cost",     sow.total_cost ? fmtEGP(sow.total_cost) : "—"],
                ["Labor Cost",     sow.labor_cost ? fmtEGP(sow.labor_cost) : "—"],
                ["Overhead %",     sow.overhead_pct ? `${sow.overhead_pct}%` : "—"],
                ["Profit Margin %",sow.profit_margin_pct ? `${sow.profit_margin_pct}%` : "—"],
                ["Validity Days",  sow.validity_days ? `${sow.validity_days} days` : "—"],
                ["Prepared By",    sow.prepared_by || "—"],
                ["Approved By",    sow.approved_by || "—"],
                ["Approved At",    fmtDate(sow.approved_at)],
                ["Created",        fmtDate(sow.created_at)],
              ].map(([label, value], i, arr) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", padding: "8px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none"
                }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-3)" }}>{label}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-1)", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>
                    {label === "Status" ? <StatusBadge status={value} /> : value}
                  </span>
                </div>
              ))}
            </div>
            <div className="tb-section">
              <h2 className="tb-section-title">Description & Scope</h2>
              {sow.description && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-3)", marginBottom: 8, textTransform: "uppercase" }}>Description</div>
                  <p style={{ fontSize: 13, color: "var(--color-text-2)", lineHeight: 1.6 }}>{sow.description}</p>
                </div>
              )}
              {sow.scope_details && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-3)", marginBottom: 8, textTransform: "uppercase" }}>Scope Details</div>
                  <p style={{ fontSize: 13, color: "var(--color-text-2)", lineHeight: 1.6 }}>{sow.scope_details}</p>
                </div>
              )}
              {sow.exclusions && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-3)", marginBottom: 8, textTransform: "uppercase" }}>Exclusions</div>
                  <p style={{ fontSize: 13, color: "var(--color-text-2)", lineHeight: 1.6 }}>{sow.exclusions}</p>
                </div>
              )}
              {sow.client_name && (
                <div style={{ marginTop: 16, padding: "12px", background: "rgba(185,146,76,0.06)", borderRadius: 8, border: "1px solid rgba(185,146,76,0.15)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#B9924C", marginBottom: 6, textTransform: "uppercase" }}>Client</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-1)" }}>{sow.client_name}</div>
                  {sow.client_email && <div style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 2 }}>{sow.client_email}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: ACTIONS ──────────────────────────────── */}
        {activeTab === "actions" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="tb-section">
              <h2 className="tb-section-title">Workflow Actions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {isApproved && (
                  <button
                    onClick={openRFQModal}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                      background: "linear-gradient(135deg,#8F6F3D,#B9924C)",
                      border: "none", color: "#181614", fontWeight: 700, fontSize: 14
                    }}
                  >
                    <span style={{ fontSize: 18 }}>📋</span>
                    <div style={{ textAlign: "left" }}>
                      <div>Create RFQ from this SOW</div>
                      <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>Start procurement process</div>
                    </div>
                  </button>
                )}
                {canApprove && (
                  <>
                    <button
                      onClick={() => approveMut.mutate("approve")}
                      disabled={approveMut.isLoading}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                        background: "#547C4D", border: "none", color: "#fff", fontWeight: 700, fontSize: 14
                      }}
                    >
                      <span>✓</span> Approve SOW
                    </button>
                    <button
                      onClick={() => approveMut.mutate("reject")}
                      disabled={approveMut.isLoading}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                        background: "#A84A3D", border: "none", color: "#fff", fontWeight: 700, fontSize: 14
                      }}
                    >
                      <span>✗</span> Reject SOW
                    </button>
                  </>
                )}
                <a
                  href={`/api/v1/pdf/scope-of-work/${id}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                    background: "var(--color-surface-alt)", border: "1px solid var(--color-border)",
                    color: "var(--color-text-2)", fontWeight: 600, fontSize: 13, textDecoration: "none"
                  }}
                >
                  <span>📄</span> Export PDF
                </a>
              </div>
            </div>
            <div className="tb-section">
              <h2 className="tb-section-title">Danger Zone</h2>
              <p style={{ fontSize: 13, color: "var(--color-text-3)", marginBottom: 16 }}>
                Deleting a SOW is permanent. Linked BOQ items will also be removed.
              </p>
              <button
                onClick={() => {
                  if (window.confirm("Delete this SOW? This cannot be undone.")) deleteMut.mutate();
                }}
                disabled={deleteMut.isLoading}
                style={{
                  padding: "10px 20px", borderRadius: 8, cursor: "pointer",
                  background: "rgba(168,74,61,0.1)", border: "1px solid rgba(168,74,61,0.3)",
                  color: "#A84A3D", fontWeight: 700, fontSize: 13
                }}
              >
                {deleteMut.isLoading ? "Deleting..." : "🗑 Delete SOW"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE RFQ MODAL ──────────────────────────────── */}
      {showCreateRFQ && (
        <div
          onClick={() => setShowCreateRFQ(false)}
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
              width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto"
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid var(--color-border)",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-1)", margin: 0 }}>
                  Create RFQ from SOW
                </h2>
                <p style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 4 }}>
                  Linked to {sow.sow_number} · Pre-filled from SOW data
                </p>
              </div>
              <button onClick={() => setShowCreateRFQ(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-3)", fontSize: 20, padding: 4 }}>
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px" }}>

              {/* SOW Reference badge */}
              <div style={{
                background: "rgba(185,146,76,0.08)", border: "1px solid rgba(185,146,76,0.2)",
                borderRadius: 8, padding: "10px 14px", marginBottom: 20,
                display: "flex", alignItems: "center", gap: 10
              }}>
                <span style={{ fontSize: 16 }}>🔗</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#B9924C" }}>Linked to SOW</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-2)" }}>{sow.sow_number} — {(sow.title || "").slice(0, 50)}</div>
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>
                  RFQ Title <span style={{ color: "#A84A3D" }}>*</span>
                </label>
                <input
                  value={rfqForm.title}
                  onChange={e => setF("title", e.target.value)}
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                    border: `1px solid ${rfqErrors.title ? "#A84A3D" : "var(--color-border)"}`,
                    background: "var(--color-surface)", color: "var(--color-text-1)", boxSizing: "border-box"
                  }}
                />
                {rfqErrors.title && <p style={{ fontSize: 12, color: "#A84A3D", marginTop: 4 }}>{rfqErrors.title}</p>}
              </div>

              {/* RFQ Type + Currency */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>RFQ Type</label>
                  <select value={rfqForm.rfq_type} onChange={e => setF("rfq_type", e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)" }}>
                    {["open", "closed", "direct"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>Currency</label>
                  <select value={rfqForm.currency} onChange={e => setF("currency", e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)" }}>
                    {["EGP", "USD", "EUR", "AED"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Budget + Deadline */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>Total Budget</label>
                  <input type="number" value={rfqForm.total_budget} onChange={e => setF("total_budget", e.target.value)}
                    placeholder="0.00" min="0"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>
                    Submission Deadline <span style={{ color: "#A84A3D" }}>*</span>
                  </label>
                  <input type="date" value={rfqForm.submission_deadline} onChange={e => setF("submission_deadline", e.target.value)}
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                      border: `1px solid ${rfqErrors.submission_deadline ? "#A84A3D" : "var(--color-border)"}`,
                      background: "var(--color-surface)", color: "var(--color-text-1)", boxSizing: "border-box"
                    }} />
                  {rfqErrors.submission_deadline && <p style={{ fontSize: 12, color: "#A84A3D", marginTop: 4 }}>{rfqErrors.submission_deadline}</p>}
                </div>
              </div>

              {/* Delivery Location */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>Delivery Location</label>
                <input value={rfqForm.delivery_location} onChange={e => setF("delivery_location", e.target.value)}
                  placeholder="e.g. Nile Plaza Hotel — Basement Store"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)", boxSizing: "border-box" }} />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>Notes</label>
                <textarea value={rfqForm.notes} onChange={e => setF("notes", e.target.value)}
                  placeholder="Additional notes for vendors..."
                  rows={3}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => { setShowCreateRFQ(false); setRFQErrors({}); }}
                  style={{ padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer", background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", fontWeight: 600 }}>
                  Cancel
                </button>
                <button onClick={handleCreateRFQ} disabled={createRFQ.isLoading}
                  style={{
                    padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 700,
                    cursor: createRFQ.isLoading ? "not-allowed" : "pointer",
                    background: createRFQ.isLoading ? "var(--color-border)" : "linear-gradient(135deg,#8F6F3D,#B9924C)",
                    color: "#181614", border: "none"
                  }}>
                  {createRFQ.isLoading ? "Creating..." : "Create RFQ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
