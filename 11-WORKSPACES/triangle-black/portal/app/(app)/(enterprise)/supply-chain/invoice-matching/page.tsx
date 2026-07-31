"use client";
// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n || 0).toLocaleString();
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };

export default function InvoiceMatchingPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: dash, isLoading: loadingDash } = useQuery({
    queryKey: ["inv-dash"],
    queryFn: () => authFetch("/api/v1/supplier-invoices/dashboard").then(r => r.json()),
    staleTime: 60000,
  });

  const { data: rawInv, isLoading: loadingInv } = useQuery({
    queryKey: ["inv-list-matching"],
    queryFn: () => authFetch("/api/v1/supplier-invoices/").then(r => r.json()),
    staleTime: 60000,
  });

  const invoices = toArr(rawInv);
  const totals = dash?.totals || {};
  const byStatus = dash?.by_status || {};
  const overdue = toArr(dash?.overdue);
  const isLoading = loadingDash || loadingInv;

  const filtered = useMemo(() => invoices.filter(inv => {
    const matchSearch = !search ||
      (inv.invoice_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.vendor_name || inv.supplier_name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || inv.status === filterStatus;
    return matchSearch && matchStatus;
  }), [invoices, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const statuses = ["all", ...Object.keys(byStatus)];
  const hasFilters = search || filterStatus !== "all";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Invoice Matching</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>
                3-way match: PO · GRN · Invoice · Payment tracking
              </p>
            </div>
            <button onClick={() => router.push("/supply-chain")}
              style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              ← Supply Chain
            </button>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{totals.total_invoices || invoices.length}</div>
                <div className="tb-hero-kpi-label">Total Invoices</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#B9924C", fontSize: 15 }}>
                  {fmtEGP(totals.total_amount || 0)}
                </div>
                <div className="tb-hero-kpi-label">Total Value</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#547C4D", fontSize: 15 }}>
                  {fmtEGP(totals.paid_amount || 0)}
                </div>
                <div className="tb-hero-kpi-label">Paid</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: overdue.length > 0 ? "#A84A3D" : "var(--color-text-1)" }}>
                  {overdue.length}
                </div>
                <div className="tb-hero-kpi-label">Overdue</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {/* Overdue alert */}
        {overdue.length > 0 && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(168,74,61,0.08)", border: "1px solid rgba(168,74,61,0.25)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#A84A3D" }}>{overdue.length} overdue invoice{overdue.length !== 1 ? "s" : ""}</span>
              <span style={{ fontSize: 13, color: "var(--color-text-3)", marginLeft: 8 }}>— payment required</span>
            </div>
            <button onClick={() => { setFilterStatus("overdue"); setPage(1); }}
              style={{ padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", background: "rgba(168,74,61,0.12)", border: "1px solid rgba(168,74,61,0.3)", color: "#A84A3D" }}>
              View Overdue
            </button>
          </div>
        )}

        {/* Status summary cards */}
        {!isLoading && Object.keys(byStatus).length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
            {Object.entries(byStatus).map(([status, data]: any) => (
              <button key={status}
                onClick={() => { setFilterStatus(filterStatus === status ? "all" : status); setPage(1); }}
                className={filterStatus === status ? "tb-section" : "tb-section"}
                style={{
                  textAlign: "left", cursor: "pointer",
                  border: filterStatus === status ? "2px solid #B9924C" : "1px solid var(--color-border)",
                  background: filterStatus === status ? "rgba(185,146,76,0.06)" : "var(--color-surface)"
                }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-1)" }}>{data.count || 0}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 2 }}>{status.replace(/_/g, " ")}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#B9924C", marginTop: 4 }}>{fmtEGP(data.amount || 0)}</div>
              </button>
            ))}
          </div>
        )}

        {/* Filter + Table */}
        <div className="tb-section">
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search invoices..."
              style={{ padding: "8px 14px", borderRadius: 8, fontSize: 14, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)", minWidth: 200 }} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["all", "submitted", "matching", "approved", "paid", "disputed"].map(s => (
                <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
                  className={filterStatus === s ? "tb-pill tb-pill--active" : "tb-pill"}>
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                  {s !== "all" && <span style={{ marginLeft: 4, opacity: 0.6 }}>{invoices.filter(i => i.status === s).length}</span>}
                </button>
              ))}
            </div>
            {hasFilters && (
              <button onClick={() => { setSearch(""); setFilterStatus("all"); setPage(1); }}
                style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-3)", fontWeight: 600 }}>
                ✕ Clear
              </button>
            )}
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-3)" }}>{filtered.length} invoices</span>
          </div>

          {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
            <EmptyState icon="🧾" title="No invoices found" description={hasFilters ? "Try adjusting filters" : "No supplier invoices yet"} />
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="tb-table-header">
                      {["INVOICE", "VENDOR", "AMOUNT", "PO LINK", "STATUS", "DATE", "ACTION"].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", textAlign: i > 1 ? "right" : "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((inv, i) => (
                      <tr key={inv.id || i} className="tb-table-row" onClick={() => router.push(`/supply-chain/invoices/${inv.id}`)} style={{ cursor: "pointer" }}>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-1)" }}>{inv.invoice_number || "—"}</div>
                          <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>{inv.id?.slice(0, 8)}</div>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--color-text-2)" }}>
                          {inv.vendor_name || inv.supplier_name || "—"}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 14, fontWeight: 700, color: "#B9924C" }}>
                          {fmtEGP(inv.total_amount || inv.amount || 0)}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 12, color: inv.po_id ? "#547C4D" : "var(--color-text-3)" }}>
                          {inv.po_id ? "✓ Linked" : "— None"}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right" }}>
                          <StatusBadge status={inv.status || "submitted"} />
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 12, color: "var(--color-text-3)" }}>
                          {fmtDate(inv.created_at)}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right" }}>
                          <button onClick={e => { e.stopPropagation(); router.push(`/supply-chain/invoices/${inv.id}`); }}
                            style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none", background: "rgba(185,146,76,0.12)", color: "#B9924C" }}>
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length > pageSize && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
                  <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length}
                    pageSize={pageSize} onPageSize={(s) => { setPageSize(s); setPage(1); }} pageSizes={[10, 25, 50]} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
