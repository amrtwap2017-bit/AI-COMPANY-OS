"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };

export default function SchedulePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: rawPlans, isLoading } = useQuery({ queryKey: ["schedule-plans"], queryFn: () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()), staleTime: 60000 });
  const { data: stats } = useQuery({ queryKey: ["schedule-stats"], queryFn: () => authFetch("/api/v1/pm-schedule/stats").then(r => r.json()), staleTime: 60000 });

  const plans = toArr(rawPlans);
  const now = new Date();
  const overdue = plans.filter(p => p.next_due_date && new Date(p.next_due_date) < now);
  const upcoming = plans.filter(p => { if (!p.next_due_date) return false; const diff = (new Date(p.next_due_date).getTime() - now.getTime()) / 86400000; return diff >= 0 && diff <= 30; });

  const filtered = filterStatus === "all" ? plans : plans.filter(p => p.status === filterStatus);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Maintenance Schedule</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>PM plans · Due dates · Schedule overview</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => router.push("/maintenance/pm-plans")}
                style={{ background: "linear-gradient(135deg,#8F6F3D,#B9924C)", color: "#181614", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                PM Plans
              </button>
              <button onClick={() => router.push("/operations")}
                style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                ← Operations
              </button>
            </div>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{plans.length}</div><div className="tb-hero-kpi-label">Total Plans</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#A84A3D" }}>{overdue.length}</div><div className="tb-hero-kpi-label">Overdue</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#B07A2A" }}>{upcoming.length}</div><div className="tb-hero-kpi-label">Due 30 Days</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{stats?.assets?.total || 0}</div><div className="tb-hero-kpi-label">Assets</div></div>
            </>}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {["all", "scheduled", "in_progress", "completed", "overdue"].map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }} className={filterStatus === s ? "tb-pill tb-pill--active" : "tb-pill"}>
              {s === "all" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
              {s !== "all" && <span style={{ marginLeft: 4, opacity: 0.6 }}>{plans.filter(p => p.status === s).length}</span>}
            </button>
          ))}
        </div>
        <div className="tb-section">
          <h2 className="tb-section-title" style={{ marginBottom: 16 }}>PM Schedule — {filtered.length} plans</h2>
          {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
            <EmptyState icon="📅" title="No plans found" description="No PM plans match the current filter" />
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="tb-table-header">
                      {["PLAN", "TYPE", "FREQUENCY", "NEXT DUE", "STATUS", "OWNER"].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((p, i) => {
                      const isOvd = p.next_due_date && new Date(p.next_due_date) < now;
                      return (
                        <tr key={p.id || i} className="tb-table-row" style={{ borderLeft: isOvd ? "3px solid rgba(168,74,61,0.4)" : "3px solid transparent" }}>
                          <td style={{ padding: "10px 14px", fontWeight: 600, fontSize: 13, color: "var(--color-text-1)" }}>{(p.title || "—").slice(0, 50)}</td>
                          <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-text-2)" }}>{p.plan_type || "—"}</td>
                          <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-text-2)" }}>{p.frequency || "—"}</td>
                          <td style={{ padding: "10px 14px", fontSize: 12, color: isOvd ? "#A84A3D" : "var(--color-text-3)", fontWeight: isOvd ? 700 : 400 }}>
                            {fmtDate(p.next_due_date)}{isOvd ? " 🚨" : ""}
                          </td>
                          <td style={{ padding: "10px 14px" }}><StatusBadge status={p.status || "scheduled"} /></td>
                          <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-text-2)" }}>{p.owner || "—"}</td>
                        </tr>
                      );
                    })}
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
