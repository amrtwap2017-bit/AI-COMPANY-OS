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

export default function InspectionDashboardPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: rawPlans, isLoading } = useQuery({
    queryKey: ["pm-plans-inspection"],
    queryFn: () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()),
    staleTime: 60000,
  });

  const { data: stats } = useQuery({
    queryKey: ["pm-stats-insp"],
    queryFn: () => authFetch("/api/v1/pm-schedule/stats").then(r => r.json()),
    staleTime: 60000,
  });

  const plans = toArr(rawPlans);
  const now = new Date();

  const overdue = plans.filter(p => p.next_due_date && new Date(p.next_due_date) < now && p.status !== "completed");
  const dueThisWeek = plans.filter(p => {
    if (!p.next_due_date) return false;
    const d = new Date(p.next_due_date);
    const diff = (d.getTime() - now.getTime()) / 86400000;
    return diff >= 0 && diff <= 7;
  });

  const types = ["all", ...Array.from(new Set(plans.map(p => p.plan_type).filter(Boolean)))];
  const statuses = ["all", ...Array.from(new Set(plans.map(p => p.status).filter(Boolean)))];

  const filtered = useMemo(() => plans.filter(p => {
    const ms = !search || (p.title || "").toLowerCase().includes(search.toLowerCase()) || (p.owner || "").toLowerCase().includes(search.toLowerCase());
    const mt = filterType === "all" || p.plan_type === filterType;
    const mv = filterStatus === "all" || p.status === filterStatus;
    return ms && mt && mv;
  }), [plans, search, filterType, filterStatus]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = search || filterType !== "all" || filterStatus !== "all";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Inspection & PM Dashboard</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>Preventive maintenance schedules · Due dates · Compliance tracking</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => router.push("/maintenance/pm-plans")}
                style={{ background: "linear-gradient(135deg,#8F6F3D,#B9924C)", color: "#181614", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                PM Plans
              </button>
              <button onClick={() => router.push("/maintenance")}
                style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                ← Maintenance
              </button>
            </div>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{plans.length}</div><div className="tb-hero-kpi-label">Total Plans</div></div>
              <div className="tb-hero-kpi" onClick={() => { setFilterStatus("all"); setSearch("overdue"); setTimeout(() => setSearch(""), 10); }} style={{ cursor: "pointer" }}>
                <div className="tb-hero-kpi-value" style={{ color: overdue.length > 0 ? "#A84A3D" : "#547C4D" }}>{overdue.length}</div>
                <div className="tb-hero-kpi-label">Overdue</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#B07A2A" }}>{dueThisWeek.length}</div>
                <div className="tb-hero-kpi-label">Due This Week</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{stats?.assets?.total || 0}</div>
                <div className="tb-hero-kpi-label">Assets Covered</div>
              </div>
            </>}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        {overdue.length > 0 && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(168,74,61,0.08)", border: "1px solid rgba(168,74,61,0.25)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span>🚨</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#A84A3D" }}>{overdue.length} PM plans overdue</span>
              <span style={{ fontSize: 13, color: "var(--color-text-3)", marginLeft: 8 }}>— schedule immediately</span>
            </div>
          </div>
        )}
        {dueThisWeek.length > 0 && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(176,122,42,0.08)", border: "1px solid rgba(176,122,42,0.25)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span>📅</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#B07A2A" }}>{dueThisWeek.length} inspections due this week</span>
          </div>
        )}
        <div className="tb-section" style={{ marginBottom: 16, padding: "12px 16px" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search plans..."
              style={{ padding: "8px 14px", borderRadius: 8, fontSize: 14, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)", minWidth: 220 }} />
            <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
              style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)" }}>
              {types.map(t => <option key={t} value={t}>{t === "all" ? "All Types" : t}</option>)}
            </select>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)" }}>
              {statuses.map(s => <option key={s} value={s}>{s === "all" ? "All Statuses" : s}</option>)}
            </select>
            {hasFilters && <button onClick={() => { setSearch(""); setFilterType("all"); setFilterStatus("all"); setPage(1); }}
              style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-3)", fontWeight: 600 }}>✕ Clear</button>}
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-3)" }}>{filtered.length} of {plans.length}</span>
          </div>
        </div>
        <div className="tb-section">
          <h2 className="tb-section-title" style={{ marginBottom: 16 }}>PM Inspection Plans</h2>
          {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
            <EmptyState icon="📋" title="No plans found" description={hasFilters ? "Try adjusting filters" : "No preventive maintenance plans configured"} />
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="tb-table-header">
                      {["PLAN", "TYPE", "FREQUENCY", "OWNER", "NEXT DUE", "STATUS"].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((p, i) => {
                      const isOverdueRow = p.next_due_date && new Date(p.next_due_date) < now && p.status !== "completed";
                      const isDuesSoon = p.next_due_date && !isOverdueRow && ((new Date(p.next_due_date).getTime() - now.getTime()) / 86400000) <= 7;
                      return (
                        <tr key={p.id || i} className="tb-table-row"
                          style={{ borderLeft: isOverdueRow ? "3px solid rgba(168,74,61,0.4)" : isDuesSoon ? "3px solid rgba(176,122,42,0.4)" : "3px solid transparent" }}>
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-1)" }}>{(p.title || "Untitled").slice(0, 50)}</div>
                          </td>
                          <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-text-2)" }}>{p.plan_type || "—"}</td>
                          <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-text-2)" }}>{p.frequency || "—"}</td>
                          <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-text-2)" }}>{p.owner || "—"}</td>
                          <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: isOverdueRow ? 700 : 400, color: isOverdueRow ? "#A84A3D" : isDuesSoon ? "#B07A2A" : "var(--color-text-3)" }}>
                            {fmtDate(p.next_due_date)}{isOverdueRow ? " 🚨" : isDuesSoon ? " ⚠️" : ""}
                          </td>
                          <td style={{ padding: "10px 14px" }}><StatusBadge status={p.status || "scheduled"} /></td>
                        </tr>
                      );
                    })}
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
