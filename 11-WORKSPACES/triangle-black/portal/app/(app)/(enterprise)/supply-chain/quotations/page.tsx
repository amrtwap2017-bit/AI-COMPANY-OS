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
const STARS = (r) => { const s = Math.round(r || 0); return "★".repeat(s) + "☆".repeat(5 - s); };

export default function QuotationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: rawRFQs, isLoading } = useQuery({ queryKey: ["quot-rfqs"], queryFn: () => authFetch("/api/v1/rfq/").then(r => r.json()), staleTime: 60000 });
  const rfqs = toArr(rawRFQs);
  const withQuotes = rfqs.filter(r => r.quotation_count > 0 || ["responses_received", "evaluated", "awarded"].includes(r.status));
  const totalQuotes = rfqs.reduce((s, r) => s + (r.quotation_count || 0), 0);

  const filtered = useMemo(() => rfqs.filter(r => {
    const ms = !search || (r.rfq_number || "").toLowerCase().includes(search.toLowerCase()) || (r.title || "").toLowerCase().includes(search.toLowerCase());
    const mv = filterStatus === "all" || r.status === filterStatus;
    return ms && mv;
  }), [rfqs, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = search || filterStatus !== "all";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div><h1 className="tb-hero-title">Vendor Quotations</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>RFQ responses · Bid comparison · Vendor scoring</p>
            </div>
            <button onClick={() => router.push("/supply-chain/rfq-management")}
              style={{ background: "linear-gradient(135deg,#8F6F3D,#B9924C)", color: "#181614", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              + New RFQ
            </button>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{rfqs.length}</div><div className="tb-hero-kpi-label">Total RFQs</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#B9924C" }}>{totalQuotes}</div><div className="tb-hero-kpi-label">Total Quotes</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#547C4D" }}>{rfqs.filter(r => r.status === "awarded").length}</div><div className="tb-hero-kpi-label">Awarded</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#5B7C8C" }}>{withQuotes.length}</div><div className="tb-hero-kpi-label">With Responses</div></div>
            </>}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search RFQs..."
            style={{ padding: "8px 14px", borderRadius: 8, fontSize: 14, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)", minWidth: 200 }} />
          {["all", "draft", "sent", "responses_received", "evaluated", "awarded", "cancelled"].map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }} className={filterStatus === s ? "tb-pill tb-pill--active" : "tb-pill"}>
              {s === "all" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
              {s !== "all" && <span style={{ marginLeft: 4, opacity: 0.6 }}>{rfqs.filter(r => r.status === s).length}</span>}
            </button>
          ))}
          {hasFilters && <button onClick={() => { setSearch(""); setFilterStatus("all"); setPage(1); }}
            style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-3)", fontWeight: 600 }}>✕</button>}
        </div>
        <div className="tb-section">
          {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
            <EmptyState icon="📨" title="No RFQs found" description={hasFilters ? "Try adjusting filters" : "No RFQs issued yet"} action={{ label: "Create RFQ", onClick: () => router.push("/supply-chain/rfq-management") }} />
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="tb-table-header">
                      {["RFQ", "TITLE", "STATUS", "QUOTES", "LOWEST BID", "DEADLINE", ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((r, i) => (
                      <tr key={r.id || i} className="tb-table-row" style={{ cursor: "pointer" }} onClick={() => router.push(`/supply-chain/rfqs/${r.id}`)}>
                        <td style={{ padding: "10px 14px", fontWeight: 700, fontSize: 13, color: "var(--color-text-1)" }}>{r.rfq_number || "—"}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--color-text-2)" }}>{(r.title || "—").slice(0, 40)}</td>
                        <td style={{ padding: "10px 14px" }}><StatusBadge status={r.status || "draft"} /></td>
                        <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "#B9924C" }}>{r.quotation_count || 0}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "#547C4D", fontWeight: r.lowest_price ? 700 : 400 }}>
                          {r.lowest_price ? fmtEGP(r.lowest_price) : "—"}
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: r.submission_deadline && new Date(r.submission_deadline) < new Date() ? "#A84A3D" : "var(--color-text-3)" }}>
                          {fmtDate(r.submission_deadline)}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <button onClick={e => { e.stopPropagation(); router.push(`/supply-chain/rfqs/${r.id}`); }}
                            style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none", background: "rgba(185,146,76,0.12)", color: "#B9924C" }}>
                            Compare
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length > pageSize && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
                  <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} pageSize={pageSize} onPageSize={(s) => { setPageSize(s); setPage(1); }} pageSizes={[10, 25, 50]} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
