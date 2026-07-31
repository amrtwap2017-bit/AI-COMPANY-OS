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
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };

export default function WorkHistoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: rawWOs, isLoading } = useQuery({
    queryKey: ["maint-wo-history"],
    queryFn: () => authFetch("/api/v1/work-orders/?limit=200").then(r => r.json()),
    staleTime: 60000,
  });

  const { data: rawStats } = useQuery({
    queryKey: ["pm-stats"],
    queryFn: () => authFetch("/api/v1/pm-schedule/stats").then(r => r.json()),
    staleTime: 60000,
  });

  const wos = toArr(rawWOs).filter(w => !w.deleted_at);
  const completed = wos.filter(w => w.status === "completed");
  const byType = useMemo(() => {
    const m: Record<string, number> = {};
    wos.forEach(w => { m[w.type || "corrective"] = (m[w.type || "corrective"] || 0) + 1; });
    return m;
  }, [wos]);

  const types = ["all", ...Object.keys(byType)];

  const filtered = useMemo(() => wos.filter(w => {
    const ms = !search || (w.title || "").toLowerCase().includes(search.toLowerCase());
    const mt = filterType === "all" || (w.type || "corrective") === filterType;
    const mv = filterStatus === "all" || w.status === filterStatus;
    return ms && mt && mv;
  }), [wos, search, filterType, filterStatus]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const compRate = wos.length > 0 ? Math.round(completed.length / wos.length * 100) : 0;
  const hasFilters = search || filterType !== "all" || filterStatus !== "all";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Work Order History</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>Maintenance history · Completion tracking · Type analysis</p>
            </div>
            <button onClick={() => router.push("/maintenance")}
              style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              ← Maintenance
            </button>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{wos.length}</div><div className="tb-hero-kpi-label">Total WOs</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#547C4D" }}>{completed.length}</div><div className="tb-hero-kpi-label">Completed</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: compRate >= 80 ? "#547C4D" : "#B07A2A" }}>{compRate}%</div><div className="tb-hero-kpi-label">Completion</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{Object.keys(byType).length}</div><div className="tb-hero-kpi-label">WO Types</div></div>
            </>}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        {/* Type breakdown cards */}
        {!isLoading && Object.keys(byType).length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
            {Object.entries(byType).map(([type, count]) => (
              <button key={type} onClick={() => { setFilterType(filterType === type ? "all" : type); setPage(1); }}
                style={{ padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                  background: filterType === type ? "rgba(185,146,76,0.06)" : "var(--color-surface)",
                  border: filterType === type ? "2px solid #B9924C" : "1px solid var(--color-border)" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text-1)" }}>{count}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 2 }}>{type}</div>
              </button>
            ))}
          </div>
        )}
        <div className="tb-section" style={{ marginBottom: 16, padding: "12px 16px" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search work orders..."
              style={{ padding: "8px 14px", borderRadius: 8, fontSize: 14, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)", minWidth: 220 }} />
            {["all", "open", "in_progress", "completed", "cancelled"].map(s => (
              <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
                className={filterStatus === s ? "tb-pill tb-pill--active" : "tb-pill"}>
                {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            {hasFilters && <button onClick={() => { setSearch(""); setFilterType("all"); setFilterStatus("all"); setPage(1); }}
              style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-3)", fontWeight: 600 }}>✕ Clear</button>}
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-3)" }}>{filtered.length} of {wos.length}</span>
          </div>
        </div>
        <div className="tb-section">
          <h2 className="tb-section-title" style={{ marginBottom: 16 }}>Maintenance Work Orders</h2>
          {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
            <EmptyState icon="🔧" title="No work orders found" description={hasFilters ? "Try adjusting filters" : "No maintenance work orders yet"} />
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="tb-table-header">
                      {["WORK ORDER", "TYPE", "PRIORITY", "STATUS", "CREATED", "COMPLETED"].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((w, i) => (
                      <tr key={w.id || i} className="tb-table-row" onClick={() => router.push(`/operations/work-orders/${w.id}`)} style={{ cursor: "pointer" }}>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-1)" }}>{(w.title || "Untitled").slice(0, 50)}</div>
                          <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>{w.id?.slice(0, 8)}</div>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-text-2)" }}>{w.type || "corrective"}</td>
                        <td style={{ padding: "10px 14px" }}><StatusBadge status={w.priority || "medium"} /></td>
                        <td style={{ padding: "10px 14px" }}><StatusBadge status={w.status || "open"} /></td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-text-3)" }}>{fmtDate(w.created_at)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: w.completed_at ? "#547C4D" : "var(--color-text-3)" }}>
                          {fmtDate(w.completed_at)}
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
