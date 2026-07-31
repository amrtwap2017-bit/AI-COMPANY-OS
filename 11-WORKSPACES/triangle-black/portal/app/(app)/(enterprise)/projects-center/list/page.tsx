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
const fmtEGP = (n) => n ? "EGP " + Number(n).toLocaleString() : "—";

export default function ProjectsListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: raw, isLoading } = useQuery({ queryKey: ["projects-list"], queryFn: () => authFetch("/api/v1/projects-portal").then(r => r.json()), staleTime: 60000 });
  const projects = toArr(raw);
  const active = projects.filter(p => p.status === "active" || p.status === "in_progress");
  const completed = projects.filter(p => p.status === "completed");
  const totalBudget = projects.reduce((s, p) => s + Number(p.budget || 0), 0);

  const filtered = useMemo(() => projects.filter(p => {
    const ms = !search || (p.title || "").toLowerCase().includes(search.toLowerCase());
    const mv = filterStatus === "all" || p.status === filterStatus;
    return ms && mv;
  }), [projects, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = search || filterStatus !== "all";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div><h1 className="tb-hero-title">Projects List</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>All projects · Status · Budget · Timeline</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => router.push("/projects-center")}
                style={{ background: "linear-gradient(135deg,#8F6F3D,#B9924C)", color: "#181614", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                + New Project
              </button>
              <button onClick={() => router.push("/projects-center")}
                style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                ← Projects
              </button>
            </div>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{projects.length}</div><div className="tb-hero-kpi-label">Total</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#5B7C8C" }}>{active.length}</div><div className="tb-hero-kpi-label">Active</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#547C4D" }}>{completed.length}</div><div className="tb-hero-kpi-label">Completed</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#B9924C", fontSize: 14 }}>{fmtEGP(totalBudget)}</div><div className="tb-hero-kpi-label">Total Budget</div></div>
            </>}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search projects..."
            style={{ padding: "8px 14px", borderRadius: 8, fontSize: 14, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)", minWidth: 200 }} />
          {["all", "planning", "active", "in_progress", "on_hold", "completed", "cancelled"].map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }} className={filterStatus === s ? "tb-pill tb-pill--active" : "tb-pill"}>
              {s === "all" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
              {s !== "all" && <span style={{ marginLeft: 4, opacity: 0.6 }}>{projects.filter(p => p.status === s).length}</span>}
            </button>
          ))}
          {hasFilters && <button onClick={() => { setSearch(""); setFilterStatus("all"); setPage(1); }}
            style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-3)", fontWeight: 600 }}>✕</button>}
        </div>
        <div className="tb-section">
          <h2 className="tb-section-title" style={{ marginBottom: 16 }}>Projects — {filtered.length}</h2>
          {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
            <EmptyState icon="📁" title="No projects found" description={hasFilters ? "Try adjusting filters" : "No projects yet"} />
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="tb-table-header">
                      {["PROJECT", "STATUS", "PROGRESS", "BUDGET", "START", "END"].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((p, i) => (
                      <tr key={p.id || i} className="tb-table-row" onClick={() => router.push(`/projects-center/${p.id}`)} style={{ cursor: "pointer" }}>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-1)" }}>{(p.title || "—").slice(0, 50)}</div>
                          <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>{p.id?.slice(0, 8)}</div>
                        </td>
                        <td style={{ padding: "10px 14px" }}><StatusBadge status={p.status || "planning"} /></td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: "var(--color-border)", borderRadius: 3, overflow: "hidden", minWidth: 60 }}>
                              <div style={{ height: "100%", width: `${p.completion_pct || 0}%`, background: (p.completion_pct || 0) >= 80 ? "#547C4D" : "#B9924C", borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-2)", minWidth: 28 }}>{p.completion_pct || 0}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "#B9924C", fontWeight: 600 }}>{fmtEGP(p.budget)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-text-3)" }}>{fmtDate(p.start_date)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: p.end_date && new Date(p.end_date) < new Date() && p.status !== "completed" ? "#A84A3D" : "var(--color-text-3)" }}>{fmtDate(p.end_date)}</td>
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
