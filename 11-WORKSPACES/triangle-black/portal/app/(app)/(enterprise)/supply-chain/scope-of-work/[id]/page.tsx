"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/lib/toast";

const fmtEGP = (n: any) => "EGP " + Number(n || 0).toLocaleString();
const fmtDate = (d: any) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };

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

  const { data: sow, isLoading } = useQuery({
    queryKey: ["sow-detail", id],
    queryFn: () => authFetch(`/api/v1/scope-of-work/${id}`).then(r => (r as any).data ?? r),
    staleTime: 30000,
    enabled: !!id,
  });

  const approveMut = useMutation({
    mutationFn: (action) =>
      authFetch(`/api/v1/scope-of-work/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, approved_by: "amr@triangleblack.com" }),
      }).then(r => r.data ?? r),
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

  const deleteMut = useMutation({
    mutationFn: () =>
      authFetch(`/api/v1/scope-of-work/v2/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("SOW deleted");
      router.push("/supply-chain/scope-of-work");
    },
    onError: () => toast.error("Delete failed"),
  });

  const createRFQ = useMutation({
    mutationFn: (payload) =>
      authFetch("/api/v1/rfq/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(r => r.data ?? r),
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
    const e: Record<string, any> = {};
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

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-tertiary text-sm">Loading SOW...</div>
    </div>
  );

  if (!sow || sow.error) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">📄</div>
        <div className="tb-empty-title">SOW not found</div>
        <button onClick={() => router.push("/supply-chain/scope-of-work")}
          className="tb-btn tb-btn-primary mt-4">
          Back to SOWs
        </button>
      </div>
    </div>
  );

  const boqItems = sow.boq_items || [];
  const boqTotal = boqItems.reduce((s: any, i: any) => s + Number(i.total_amount || 0), 0);
  const overhead = boqTotal * (Number(sow.overhead_pct || 0) / 100);
  const profit = (boqTotal + overhead) * (Number(sow.profit_margin_pct || 0) / 100);
  const grandTotal = boqTotal + overhead + profit + Number(sow.labor_cost || 0);
  const isApproved = sow.status === "approved";
  const canApprove = sow.status === "pending_approval";

  return (
    <div className="min-h-screen bg-base">

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain · Scope of Work</div>
              <h1 className="tb-hero-title">{sow.sow_number}</h1>
              <p className="tb-hero-description">{(sow.title || "").slice(0, 80)}</p>
            </div>
            <div className="tb-action-bar">
              <StatusBadge status={sow.status || "draft"} />
              {isApproved && (
                <button onClick={openRFQModal} className="tb-btn tb-btn-primary">
                  + Create RFQ
                </button>
              )}
              {canApprove && (
                <>
                  <button onClick={() => approveMut.mutate("approve")}
                    disabled={approveMut.isLoading}
                    className="tb-btn tb-btn-primary">
                    ✓ Approve
                  </button>
                  <button onClick={() => approveMut.mutate("reject")}
                    disabled={approveMut.isLoading}
                    className="tb-btn tb-btn-danger">
                    ✗ Reject
                  </button>
                </>
              )}
              <a href={`/api/v1/pdf/scope-of-work/${id}`}
                target="_blank" rel="noopener noreferrer"
                className="tb-btn tb-btn-secondary">
                📄 PDF
              </a>
              <button onClick={() => router.push("/supply-chain/scope-of-work")}
                className="tb-btn tb-btn-secondary">
                ← Back
              </button>
            </div>
          </div>

          <div className="tb-grid-4 mt-6">
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value">{boqItems.length}</div>
              <div className="tb-hero-kpi-label">BOQ Items</div>
            </div>
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value text-brand" style={{fontSize:"15px"}}>
                {fmtEGP(grandTotal || sow.total_cost || 0)}
              </div>
              <div className="tb-hero-kpi-label">Total Value</div>
            </div>
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{fontSize:"14px"}}>
                {fmtDate(sow.created_at)}
              </div>
              <div className="tb-hero-kpi-label">Created</div>
            </div>
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{fontSize:"14px"}}>
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
        <div className="tb-tabs">
          {[
            { key: "boq",     label: `BOQ Items (${boqItems.length})` },
            { key: "details", label: "SOW Details" },
            { key: "actions", label: "Actions" },
          ].map((t: any) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`tb-tab ${activeTab === t.key ? "active" : ""}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: BOQ ITEMS ────────────────────────────── */}
        {activeTab === "boq" && (
          <div className="tb-section">
            <div className="flex justify-between items-center mb-4">
              <div className="tb-section-title" style={{margin:0}}>Bill of Quantities</div>
              <span className="text-sm font-bold text-brand">{fmtEGP(boqTotal)}</span>
            </div>
            {boqItems.length === 0 ? (
              <EmptyState icon="📋" title="No BOQ items"
                description="No bill of quantities items defined for this SOW" />
            ) : (
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Description</th>
                      <th style={{textAlign:"center"}}>QTY</th>
                      <th>Unit</th>
                      <th style={{textAlign:"right"}}>Unit Price</th>
                      <th style={{textAlign:"right"}}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boqItems.map((item: any, i: number) => (
                      <tr key={item.id || i}>
                        <td className="text-tertiary font-semibold text-xs">{i + 1}</td>
                        <td>
                          <div className="font-semibold text-primary text-sm">
                            {item.description || item.item_name || "—"}
                          </div>
                          {item.specification && (
                            <div className="text-tertiary text-xs mt-0.5">
                              {item.specification.slice(0, 60)}
                            </div>
                          )}
                        </td>
                        <td className="text-center font-bold text-primary">{item.quantity || "—"}</td>
                        <td className="text-secondary text-sm">{item.unit || "unit"}</td>
                        <td className="text-right text-secondary text-sm">
                          {item.unit_price ? fmtEGP(item.unit_price) : "—"}
                        </td>
                        <td className="text-right font-bold text-brand text-sm">
                          {item.total_amount ? fmtEGP(item.total_amount) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-default">
                      <td colSpan={5} className="text-right font-bold text-secondary text-sm p-3">
                        BOQ Subtotal
                      </td>
                      <td className="text-right font-extrabold text-brand p-3">{fmtEGP(boqTotal)}</td>
                    </tr>
                    {sow.overhead_pct > 0 && (
                      <tr>
                        <td colSpan={5} className="text-right text-tertiary text-xs p-2">
                          Overhead ({sow.overhead_pct}%)
                        </td>
                        <td className="text-right text-secondary text-xs p-2">{fmtEGP(overhead)}</td>
                      </tr>
                    )}
                    {sow.profit_margin_pct > 0 && (
                      <tr>
                        <td colSpan={5} className="text-right text-tertiary text-xs p-2">
                          Profit Margin ({sow.profit_margin_pct}%)
                        </td>
                        <td className="text-right text-secondary text-xs p-2">{fmtEGP(profit)}</td>
                      </tr>
                    )}
                    {sow.labor_cost > 0 && (
                      <tr>
                        <td colSpan={5} className="text-right text-tertiary text-xs p-2">Labor Cost</td>
                        <td className="text-right text-secondary text-xs p-2">{fmtEGP(sow.labor_cost)}</td>
                      </tr>
                    )}
                    <tr className="border-t border-default bg-brand/5">
                      <td colSpan={5} className="text-right font-extrabold text-primary p-3">
                        Grand Total
                      </td>
                      <td className="text-right font-black text-brand p-3 text-base">
                        {fmtEGP(grandTotal)}
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
          <div className="tb-grid-2">
            <div className="tb-section">
              <div className="tb-section-title">SOW Information</div>
              {[
                ["SOW Number",      sow.sow_number],
                ["Title",           sow.title],
                ["Status",          sow.status],
                ["Type",            sow.sow_type || sow.type || "standard"],
                ["Currency",        sow.currency || "EGP"],
                ["Total Cost",      sow.total_cost ? fmtEGP(sow.total_cost) : "—"],
                ["Labor Cost",      sow.labor_cost ? fmtEGP(sow.labor_cost) : "—"],
                ["Overhead %",      sow.overhead_pct ? `${sow.overhead_pct}%` : "—"],
                ["Profit Margin %", sow.profit_margin_pct ? `${sow.profit_margin_pct}%` : "—"],
                ["Validity Days",   sow.validity_days ? `${sow.validity_days} days` : "—"],
                ["Prepared By",     sow.prepared_by || "—"],
                ["Approved By",     sow.approved_by || "—"],
                ["Approved At",     fmtDate(sow.approved_at)],
                ["Created",         fmtDate(sow.created_at)],
              ].map(([label, value], i) => (
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{label}</span>
                  <span className="tb-detail-value">
                    {label === "Status" ? <StatusBadge status={value} /> : value}
                  </span>
                </div>
              ))}
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Description & Scope</div>
              {sow.description && (
                <div className="mb-4">
                  <div className="text-label-upper text-tertiary mb-2">Description</div>
                  <p className="text-sm text-secondary leading-relaxed">{sow.description}</p>
                </div>
              )}
              {sow.scope_details && (
                <div className="mb-4">
                  <div className="text-label-upper text-tertiary mb-2">Scope Details</div>
                  <p className="text-sm text-secondary leading-relaxed">{sow.scope_details}</p>
                </div>
              )}
              {sow.exclusions && (
                <div className="mb-4">
                  <div className="text-label-upper text-tertiary mb-2">Exclusions</div>
                  <p className="text-sm text-secondary leading-relaxed">{sow.exclusions}</p>
                </div>
              )}
              {sow.client_name && (
                <div className="mt-4 p-3 bg-brand/5 rounded-lg border border-brand/20">
                  <div className="text-label-upper text-brand mb-1.5">Client</div>
                  <div className="font-bold text-primary text-sm">{sow.client_name}</div>
                  {sow.client_email && (
                    <div className="text-tertiary text-xs mt-1">{sow.client_email}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: ACTIONS ──────────────────────────────── */}
        {activeTab === "actions" && (
          <div className="tb-grid-2">
            <div className="tb-section">
              <div className="tb-section-title">Workflow Actions</div>
              <div className="flex flex-col gap-3">
                {isApproved && (
                  <button onClick={openRFQModal} className="tb-btn tb-btn-primary tb-btn-lg">
                    <span>📋</span>
                    <div className="text-left">
                      <div>Create RFQ from this SOW</div>
                      <div className="text-xs font-normal opacity-70">Start procurement process</div>
                    </div>
                  </button>
                )}
                {canApprove && (
                  <>
                    <button onClick={() => approveMut.mutate("approve")}
                      disabled={approveMut.isLoading}
                      className="tb-btn tb-btn-primary tb-btn-lg">
                      <span>✓</span> Approve SOW
                    </button>
                    <button onClick={() => approveMut.mutate("reject")}
                      disabled={approveMut.isLoading}
                      className="tb-btn tb-btn-danger tb-btn-lg">
                      <span>✗</span> Reject SOW
                    </button>
                  </>
                )}
                <a href={`/api/v1/pdf/scope-of-work/${id}`}
                  target="_blank" rel="noopener noreferrer"
                  className="tb-btn tb-btn-secondary">
                  <span>📄</span> Export PDF
                </a>
              </div>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Danger Zone</div>
              <p className="text-sm text-tertiary mb-4">
                Deleting a SOW is permanent. Linked BOQ items will also be removed.
              </p>
              <button
                onClick={() => {
                  if (window.confirm("Delete this SOW? This cannot be undone."))
                    deleteMut.mutate();
                }}
                disabled={deleteMut.isLoading}
                className="tb-btn tb-btn-danger">
                {deleteMut.isLoading ? "Deleting..." : "🗑 Delete SOW"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE RFQ MODAL ──────────────────────────────── */}
      {showCreateRFQ && (
        <div onClick={() => setShowCreateRFQ(false)}
          className="fixed inset-0 z-modal bg-overlay flex items-center justify-center p-6"
          style={{backdropFilter:"blur(4px)"}}>
          <div onClick={(e: any) => e.stopPropagation()}
            className="tb-section w-full shadow-xl"
            style={{maxWidth:"520px",maxHeight:"90vh",overflowY:"auto",borderRadius:"16px"}}>

            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 mb-4 border-b border-default">
              <div>
                <h2 className="text-lg font-bold text-primary">Create RFQ from SOW</h2>
                <p className="text-xs text-tertiary mt-1">
                  Linked to {sow.sow_number} · Pre-filled from SOW data
                </p>
              </div>
              <button onClick={() => setShowCreateRFQ(false)}
                className="tb-btn-ghost text-xl px-2">✕</button>
            </div>

            {/* SOW Reference badge */}
            <div className="flex items-center gap-3 p-3 bg-brand/5 border border-brand/20 rounded-lg mb-5">
              <span className="text-lg">🔗</span>
              <div>
                <div className="text-xs font-bold text-brand">Linked to SOW</div>
                <div className="text-xs text-secondary">
                  {sow.sow_number} — {(sow.title || "").slice(0, 50)}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="tb-form-group mb-4">
              <label className="tb-label">
                RFQ Title <span className="text-danger">*</span>
              </label>
              <input value={rfqForm.title}
                onChange={(e: any) => setF("title", e.target.value)}
                className="tb-input"
                style={rfqErrors.title ? {borderColor:"var(--color-danger)"} : {}} />
              {rfqErrors.title && (
                <p className="text-xs text-danger mt-1">{rfqErrors.title}</p>
              )}
            </div>

            {/* RFQ Type + Currency */}
            <div className="tb-form-grid mb-4">
              <div className="tb-form-group">
                <label className="tb-label">RFQ Type</label>
                <select value={rfqForm.rfq_type}
                  onChange={(e: any) => setF("rfq_type", e.target.value)}
                  className="tb-select">
                  {["open","closed","direct"].map((t: any) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Currency</label>
                <select value={rfqForm.currency}
                  onChange={(e: any) => setF("currency", e.target.value)}
                  className="tb-select">
                  {["EGP","USD","EUR","AED"].map((c: any) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget + Deadline */}
            <div className="tb-form-grid mb-4">
              <div className="tb-form-group">
                <label className="tb-label">Total Budget</label>
                <input type="number" value={rfqForm.total_budget}
                  onChange={(e: any) => setF("total_budget", e.target.value)}
                  placeholder="0.00" min="0"
                  className="tb-input" />
              </div>
              <div className="tb-form-group">
                <label className="tb-label">
                  Submission Deadline <span className="text-danger">*</span>
                </label>
                <input type="date" value={rfqForm.submission_deadline}
                  onChange={(e: any) => setF("submission_deadline", e.target.value)}
                  className="tb-input"
                  style={rfqErrors.submission_deadline ? {borderColor:"var(--color-danger)"} : {}} />
                {rfqErrors.submission_deadline && (
                  <p className="text-xs text-danger mt-1">{rfqErrors.submission_deadline}</p>
                )}
              </div>
            </div>

            {/* Delivery Location */}
            <div className="tb-form-group mb-4">
              <label className="tb-label">Delivery Location</label>
              <input value={rfqForm.delivery_location}
                onChange={(e: any) => setF("delivery_location", e.target.value)}
                placeholder="e.g. Nile Plaza Hotel — Basement Store"
                className="tb-input" />
            </div>

            {/* Notes */}
            <div className="tb-form-group mb-6">
              <label className="tb-label">Notes</label>
              <textarea value={rfqForm.notes}
                onChange={(e: any) => setF("notes", e.target.value)}
                placeholder="Additional notes for vendors..."
                rows={3}
                className="tb-input"
                style={{resize:"vertical",fontFamily:"inherit"}} />
            </div>

            {/* Actions */}
            <div className="tb-action-bar justify-end">
              <button onClick={() => { setShowCreateRFQ(false); setRFQErrors({}); }}
                className="tb-btn tb-btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateRFQ}
                disabled={createRFQ.isLoading}
                className="tb-btn tb-btn-primary">
                {createRFQ.isLoading ? "Creating..." : "Create RFQ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
