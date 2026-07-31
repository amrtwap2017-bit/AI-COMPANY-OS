"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { TableSkeleton, KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n) => "EGP " + Number(n || 0).toLocaleString();

const EMPTY_FORM = {
  vendor_id: "", title: "", rfq_id: "",
  currency: "EGP", total_amount: "", payment_terms: 30,
  delivery_address: "", internal_notes: ""
};

export default function PurchaseOrdersV2Page() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [showNewPO, setShowNewPO] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── DATA ──────────────────────────────────────────────────
  const { data: rawPOs, isLoading } = useQuery({
    queryKey: ["pos-v2-list"],
    queryFn: () => authFetch("/api/v1/purchase-orders-v2/").then(r => r.json()),
    staleTime: 60000,
  });

  const { data: rawVendors } = useQuery({
    queryKey: ["vendors-dropdown"],
    queryFn: () => authFetch("/api/v1/vendors/").then(r => r.json()),
    staleTime: 300000,
  });

  const { data: rawRFQs } = useQuery({
    queryKey: ["rfqs-dropdown"],
    queryFn: () => authFetch("/api/v1/rfq/").then(r => r.json()),
    staleTime: 300000,
  });

  const pos = toArr(rawPOs);
  const vendors = toArr(rawVendors).filter(v => !v.deleted_at && v.is_approved !== false);
  const rfqs = toArr(rawRFQs).filter(r => ["open", "draft", "awarded"].includes(r.status));

  const filtered = filter === "all" ? pos : pos.filter(p => p.status === filter);
  const totalValue = pos.reduce((s, p) => s + Number(p.total_amount || 0), 0);
  const approved = pos.filter(p => p.status === "approved").length;
  const pending = pos.filter(p => p.status === "pending_approval").length;
  const draft = pos.filter(p => p.status === "draft").length;

  // ── CREATE MUTATION ───────────────────────────────────────
  const createPO = useMutation({
    mutationFn: (payload) =>
      authFetch("/api/v1/purchase-orders-v2/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(r => r.json()),
    onSuccess: (data) => {
      if (data?.id || data?.po_number) {
        toast.success(`Purchase Order ${data.po_number || ""} created`);
        qc.invalidateQueries(["pos-v2-list"]);
        setShowNewPO(false);
        setForm({ ...EMPTY_FORM });
        setErrors({});
        if (data.id) router.push(`/supply-chain/purchase-orders-v2/${data.id}`);
      } else {
        toast.error(data?.detail || data?.error || "Failed to create PO");
      }
    },
    onError: () => toast.error("Network error — please try again"),
  });

  // ── VALIDATION + SUBMIT ───────────────────────────────────
  const handleSubmit = () => {
    const e: Record<string, string> = {};
    if (!form.vendor_id) e.vendor_id = "Vendor is required";
    if (!form.title.trim()) e.title = "Title is required";
    if (Object.keys(e).length) { setErrors(e); return; }
    createPO.mutate({
      vendor_id: form.vendor_id,
      title: form.title.trim(),
      rfq_id: form.rfq_id || null,
      currency: form.currency || "EGP",
      total_amount: parseFloat(form.total_amount) || 0,
      payment_terms: parseInt(form.payment_terms) || 30,
      delivery_address: form.delivery_address || "",
      internal_notes: form.internal_notes || "",
    });
  };

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Purchase Orders</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>
                Procurement lifecycle · Vendor commitments · Multi-currency
              </p>
            </div>
            <button
              onClick={() => setShowNewPO(true)}
              style={{
                background: "linear-gradient(135deg,#8F6F3D,#B9924C)",
                color: "#181614", border: "none", borderRadius: 10,
                padding: "10px 22px", fontWeight: 700, fontSize: 14,
                cursor: "pointer", whiteSpace: "nowrap"
              }}
            >
              + New PO
            </button>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{pos.length}</div>
                <div className="tb-hero-kpi-label">Total POs</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#B07A2A" }}>{pending}</div>
                <div className="tb-hero-kpi-label">Pending</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#547C4D" }}>{approved}</div>
                <div className="tb-hero-kpi-label">Approved</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#B9924C", fontSize: 16 }}>
                  {fmtEGP(totalValue)}
                </div>
                <div className="tb-hero-kpi-label">Total Value</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div className="tb-canvas">
        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {["all", "draft", "pending_approval", "approved", "sent", "received", "paid", "cancelled"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? "tb-pill tb-pill--active" : "tb-pill"}
            >
              {f === "all" ? "All" : f.replace(/_/g, " ")}
              {f !== "all" && (
                <span style={{ marginLeft: 4, opacity: 0.6 }}>
                  {pos.filter(p => p.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* PO Table */}
        <div className="tb-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 className="tb-section-title">
              Purchase Orders
              <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: "var(--color-text-3)" }}>
                {filtered.length} of {pos.length}
              </span>
            </h2>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#B9924C" }}>
              {fmtEGP(filtered.reduce((s, p) => s + Number(p.total_amount || 0), 0))}
            </span>
          </div>

          {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No purchase orders"
              description={filter !== "all" ? `No POs with status "${filter.replace(/_/g, " ")}"` : "Create your first purchase order"}
              action={{ label: "Create PO", onClick: () => setShowNewPO(true) }}
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr className="tb-table-header">
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>PO / VENDOR</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>STATUS</th>
                    <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>AMOUNT</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>CURRENCY</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(po => (
                    <tr
                      key={po.id}
                      className="tb-table-row"
                      onClick={() => router.push(`/supply-chain/purchase-orders-v2/${po.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-1)" }}>
                          {po.po_number || po.id?.slice(0, 12)}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 2 }}>
                          {po.vendor_name || po.title || "—"}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <StatusBadge status={po.status || "draft"} />
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontSize: 14, fontWeight: 700, color: "#B9924C" }}>
                        {fmtEGP(po.total_amount || 0)}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--color-text-2)" }}>
                        {po.currency || "EGP"}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--color-text-3)" }}>
                        {fmtDate(po.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── NEW PO MODAL ──────────────────────────────────── */}
      {showNewPO && (
        <div
          onClick={() => setShowNewPO(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(15,13,11,0.65)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--color-surface)", borderRadius: 16,
              border: "1px solid var(--color-border)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
              width: "100%", maxWidth: 560,
              maxHeight: "90vh", overflowY: "auto"
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
                  New Purchase Order
                </h2>
                <p style={{ fontSize: 13, color: "var(--color-text-3)", marginTop: 4 }}>
                  PO number will be auto-generated
                </p>
              </div>
              <button
                onClick={() => setShowNewPO(false)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--color-text-3)", fontSize: 20, padding: 4
                }}
              >✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px" }}>
              {/* Vendor (required) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>
                  Vendor <span style={{ color: "#A84A3D" }}>*</span>
                </label>
                <select
                  value={form.vendor_id}
                  onChange={e => set("vendor_id", e.target.value)}
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                    border: `1px solid ${errors.vendor_id ? "#A84A3D" : "var(--color-border)"}`,
                    background: "var(--color-surface)", color: "var(--color-text-1)"
                  }}
                >
                  <option value="">— Select vendor —</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.company_name} · {v.category}
                    </option>
                  ))}
                </select>
                {errors.vendor_id && (
                  <p style={{ fontSize: 12, color: "#A84A3D", marginTop: 4 }}>{errors.vendor_id}</p>
                )}
              </div>

              {/* Title (required) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>
                  Title <span style={{ color: "#A84A3D" }}>*</span>
                </label>
                <input
                  value={form.title}
                  onChange={e => set("title", e.target.value)}
                  placeholder="e.g. HVAC Spare Parts Q3 2026"
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                    border: `1px solid ${errors.title ? "#A84A3D" : "var(--color-border)"}`,
                    background: "var(--color-surface)", color: "var(--color-text-1)",
                    boxSizing: "border-box"
                  }}
                />
                {errors.title && (
                  <p style={{ fontSize: 12, color: "#A84A3D", marginTop: 4 }}>{errors.title}</p>
                )}
              </div>

              {/* Linked RFQ (optional) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>
                  Linked RFQ <span style={{ fontSize: 11, fontWeight: 400, color: "var(--color-text-3)" }}>(optional)</span>
                </label>
                <select
                  value={form.rfq_id}
                  onChange={e => set("rfq_id", e.target.value)}
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)", color: "var(--color-text-1)"
                  }}
                >
                  <option value="">— No linked RFQ —</option>
                  {rfqs.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.rfq_number} · {(r.title || "").slice(0, 40)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency + Amount row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>
                    Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={e => set("currency", e.target.value)}
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)", color: "var(--color-text-1)"
                    }}
                  >
                    {["EGP", "USD", "EUR", "AED", "SAR"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>
                    Total Amount
                  </label>
                  <input
                    type="number"
                    value={form.total_amount}
                    onChange={e => set("total_amount", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)", color: "var(--color-text-1)",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* Payment Terms */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>
                  Payment Terms (days)
                </label>
                <select
                  value={form.payment_terms}
                  onChange={e => set("payment_terms", e.target.value)}
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)", color: "var(--color-text-1)"
                  }}
                >
                  {[7, 14, 30, 45, 60, 90].map(d => (
                    <option key={d} value={d}>Net {d} days</option>
                  ))}
                </select>
              </div>

              {/* Delivery Address */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>
                  Delivery Address
                </label>
                <input
                  value={form.delivery_address}
                  onChange={e => set("delivery_address", e.target.value)}
                  placeholder="e.g. Nile Plaza Hotel, Garden City, Cairo"
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)", color: "var(--color-text-1)",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>
                  Internal Notes
                </label>
                <textarea
                  value={form.internal_notes}
                  onChange={e => set("internal_notes", e.target.value)}
                  placeholder="Any internal notes or special instructions..."
                  rows={3}
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)", color: "var(--color-text-1)",
                    resize: "vertical", boxSizing: "border-box", fontFamily: "inherit"
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  onClick={() => { setShowNewPO(false); setForm({ ...EMPTY_FORM }); setErrors({}); }}
                  style={{
                    padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer",
                    background: "none", border: "1px solid var(--color-border)",
                    color: "var(--color-text-2)", fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createPO.isLoading}
                  style={{
                    padding: "10px 24px", borderRadius: 8, fontSize: 14,
                    fontWeight: 700, cursor: createPO.isLoading ? "not-allowed" : "pointer",
                    background: createPO.isLoading
                      ? "var(--color-border)"
                      : "linear-gradient(135deg,#8F6F3D,#B9924C)",
                    color: "#181614", border: "none"
                  }}
                >
                  {createPO.isLoading ? "Creating..." : "Create Purchase Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
