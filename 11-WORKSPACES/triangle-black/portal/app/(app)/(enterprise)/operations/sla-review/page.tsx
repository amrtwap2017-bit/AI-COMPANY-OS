"use client";
// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };
const pct = (n) => `${Math.round(n || 0)}%`;

export default function SLAReviewPage() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");

  const { data: sla, isLoading } = useQuery({
    queryKey: ["sla-dashboard"],
    queryFn: () => authFetch("/api/v1/sla/dashboard").then(r => r.json()),
    staleTime: 60000,
    refetchInterval: 120000,
  });

  const overall = sla?.overall || {};
  const siteSLA = toArr(sla?.site_sla);
  const woSLA = toArr(sla?.work_order_sla);
  const breaches = toArr(sla?.active_breaches);
  const targets = sla?.sla_targets || {};

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">SLA Review</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>
                Service level compliance · Breach tracking · Site performance
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {breaches.length > 0 && (
                <div style={{ padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "rgba(168,74,61,0.12)", color: "#A84A3D", border: "1px solid rgba(168,74,61,0.3)" }}>
                  🚨 {breaches.length} Active Breach{breaches.length !== 1 ? "es" : ""}
                </div>
              )}
              <button onClick={() => router.push("/operations")}
                style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                ← Operations
              </button>
            </div>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: (overall.compliance_rate || 0) >= 80 ? "#547C4D" : "#A84A3D" }}>
                  {pct(overall.compliance_rate)}
                </div>
                <div className="tb-hero-kpi-label">Compliance Rate</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: breaches.length > 0 ? "#A84A3D" : "#547C4D" }}>{sla?.breach_count || 0}</div>
                <div className="tb-hero-kpi-label">Total Breaches</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{overall.total_wos || 0}</div>
                <div className="tb-hero-kpi-label">WOs Measured</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#547C4D" }}>{overall.on_time || 0}</div>
                <div className="tb-hero-kpi-label">On Time</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--color-border)" }}>
          {[{ key: "overview", label: "Overview" }, { key: "breaches", label: `Active Breaches (${breaches.length})` }, { key: "sites", label: "By Site" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", background: "none", border: "none", color: tab === t.key ? "#B9924C" : "var(--color-text-3)", borderBottom: tab === t.key ? "2px solid #B9924C" : "2px solid transparent", marginBottom: -1 }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="tb-section">
              <h2 className="tb-section-title">Overall Performance</h2>
              {[
                ["Compliance Rate", pct(overall.compliance_rate), (overall.compliance_rate || 0) >= 80 ? "#547C4D" : "#A84A3D"],
                ["On Time", overall.on_time || 0, "#547C4D"],
                ["Breached", overall.breached || 0, "#A84A3D"],
                ["Total Measured", overall.total_wos || 0, "var(--color-text-1)"],
                ["Avg Response (h)", overall.avg_response_hours?.toFixed(1) || "—", "var(--color-text-1)"],
              ].map(([label, value, color], i, arr) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-3)" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: color as string }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="tb-section">
              <h2 className="tb-section-title">SLA Targets</h2>
              {Object.entries(targets).length > 0 ? Object.entries(targets).map(([key, val]: any, i, arr) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-3)" }}>{key.replace(/_/g, " ")}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-1)" }}>{typeof val === "number" ? `${val}h` : val}</span>
                </div>
              )) : <p style={{ fontSize: 13, color: "var(--color-text-3)" }}>No SLA targets configured</p>}
            </div>
          </div>
        )}

        {tab === "breaches" && (
          <div className="tb-section">
            <h2 className="tb-section-title">Active SLA Breaches</h2>
            {isLoading ? <TableSkeleton /> : breaches.length === 0 ? (
              <EmptyState icon="✅" title="No active breaches" description="All work orders are within SLA targets" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="tb-table-header">
                      {["WORK ORDER", "PRIORITY", "STATUS", "BREACH TYPE", "DUE DATE", ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {breaches.map((b, i) => (
                      <tr key={b.id || i} className="tb-table-row" style={{ borderLeft: "3px solid rgba(168,74,61,0.4)" }}>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-1)" }}>{(b.title || "Untitled").slice(0, 50)}</div>
                          <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>{b.id?.slice(0, 8)}</div>
                        </td>
                        <td style={{ padding: "10px 14px" }}><StatusBadge status={b.priority || "medium"} /></td>
                        <td style={{ padding: "10px 14px" }}><StatusBadge status={b.status || "open"} /></td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "#A84A3D", fontWeight: 700 }}>{b.breach_type || "Response"}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "#A84A3D" }}>{fmtDate(b.due_date)}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <button onClick={() => router.push(`/operations/work-orders/${b.id}`)}
                            style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none", background: "rgba(168,74,61,0.12)", color: "#A84A3D" }}>
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "sites" && (
          <div className="tb-section">
            <h2 className="tb-section-title">SLA Performance by Site</h2>
            {siteSLA.length === 0 ? (
              <EmptyState icon="🏨" title="No site data" description="No SLA data by site available" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="tb-table-header">
                      {["SITE", "TOTAL WOs", "ON TIME", "BREACHED", "COMPLIANCE"].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {siteSLA.map((s, i) => {
                      const comp = s.total > 0 ? Math.round((s.on_time || 0) / s.total * 100) : 0;
                      return (
                        <tr key={i} className="tb-table-row">
                          <td style={{ padding: "10px 14px", fontWeight: 600, fontSize: 13, color: "var(--color-text-1)" }}>{s.site_name || s.site_id || "—"}</td>
                          <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--color-text-2)" }}>{s.total || 0}</td>
                          <td style={{ padding: "10px 14px", fontSize: 13, color: "#547C4D", fontWeight: 600 }}>{s.on_time || 0}</td>
                          <td style={{ padding: "10px 14px", fontSize: 13, color: (s.breached || 0) > 0 ? "#A84A3D" : "var(--color-text-3)", fontWeight: (s.breached || 0) > 0 ? 700 : 400 }}>{s.breached || 0}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ flex: 1, height: 6, background: "var(--color-border)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${comp}%`, background: comp >= 80 ? "#547C4D" : "#A84A3D", borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: comp >= 80 ? "#547C4D" : "#A84A3D", minWidth: 36 }}>{pct(comp)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
