"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };
const fmtEGP = (n) => n ? "EGP " + Number(n).toLocaleString() : "—";

export default function ProjectsReviewPage() {
  const router = useRouter();
  const { data: raw, isLoading } = useQuery({ queryKey: ["proj-review"], queryFn: () => authFetch("/api/v1/projects-portal").then(r => r.json()), staleTime: 60000 });
  const projects = toArr(raw);
  const now = new Date();
  const needsReview = projects.filter(p => ["active", "in_progress", "on_hold"].includes(p.status));
  const overdue = projects.filter(p => p.end_date && new Date(p.end_date) < now && p.status !== "completed");
  const behindSchedule = projects.filter(p => (p.completion_pct || 0) < 50 && p.status === "active");

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div><h1 className="tb-hero-title">Projects Review</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>Active project review · Risk identification · Action items</p>
            </div>
            <button onClick={() => router.push("/projects-center")}
              style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              ← Projects
            </button>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{needsReview.length}</div><div className="tb-hero-kpi-label">Active</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: overdue.length > 0 ? "#A84A3D" : "#547C4D" }}>{overdue.length}</div><div className="tb-hero-kpi-label">Overdue</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: behindSchedule.length > 0 ? "#B07A2A" : "#547C4D" }}>{behindSchedule.length}</div><div className="tb-hero-kpi-label">Behind Schedule</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#547C4D" }}>{projects.filter(p => p.status === "completed").length}</div><div className="tb-hero-kpi-label">Completed</div></div>
            </>}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        {overdue.length > 0 && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(168,74,61,0.08)", border: "1px solid rgba(168,74,61,0.25)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span>🚨</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#A84A3D" }}>{overdue.length} projects are past their end date</span>
          </div>
        )}
        <div className="tb-section">
          <h2 className="tb-section-title" style={{ marginBottom: 16 }}>Projects Requiring Review</h2>
          {isLoading ? <TableSkeleton /> : needsReview.length === 0 ? (
            <EmptyState icon="✅" title="All projects on track" description="No active projects need review" />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr className="tb-table-header">
                    {["PROJECT", "STATUS", "COMPLETION", "END DATE", "BUDGET", "RISK"].map((h, i) => (
                      <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {needsReview.map((p, i) => {
                    const isOvd = p.end_date && new Date(p.end_date) < now;
                    const isBehind = (p.completion_pct || 0) < 50;
                    const risk = isOvd ? "High" : isBehind ? "Medium" : "Low";
                    const riskColor = isOvd ? "#A84A3D" : isBehind ? "#B07A2A" : "#547C4D";
                    return (
                      <tr key={p.id || i} className="tb-table-row" onClick={() => router.push(`/projects-center/${p.id}`)} style={{ cursor: "pointer", borderLeft: isOvd ? "3px solid rgba(168,74,61,0.4)" : isBehind ? "3px solid rgba(176,122,42,0.4)" : "3px solid transparent" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 600, fontSize: 13, color: "var(--color-text-1)" }}>{(p.title || "—").slice(0, 45)}</td>
                        <td style={{ padding: "10px 14px" }}><StatusBadge status={p.status || "active"} /></td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 60, height: 5, background: "var(--color-border)", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${p.completion_pct || 0}%`, background: (p.completion_pct || 0) >= 80 ? "#547C4D" : "#B9924C", borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-2)" }}>{p.completion_pct || 0}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: isOvd ? "#A84A3D" : "var(--color-text-3)", fontWeight: isOvd ? 700 : 400 }}>
                          {fmtDate(p.end_date)}{isOvd ? " 🚨" : ""}
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "#B9924C" }}>{fmtEGP(p.budget)}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${riskColor}18`, color: riskColor, border: `1px solid ${riskColor}30` }}>{risk}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
