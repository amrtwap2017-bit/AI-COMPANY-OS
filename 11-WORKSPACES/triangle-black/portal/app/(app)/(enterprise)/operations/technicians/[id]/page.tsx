"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableSkeleton, KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.work_orders || [];
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };

export default function TechnicianDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // ── TWO SEPARATE QUERIES ──────────────────────────────────
  const { data: tech, isLoading: techLoading } = useQuery({
    queryKey: ["tech-detail", id],
    queryFn: () => authFetch(`/api/v1/technicians/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: rawWOs, isLoading: wosLoading } = useQuery({
    queryKey: ["tech-wos", id],
    queryFn: () => authFetch(`/api/v1/technicians/${id}/work-orders`).then(r => r.json()),
    enabled: !!id,
  });

  const isLoading = techLoading;
  const wos = toArr(rawWOs).filter(w => !w.deleted_at);
  const activeWOs = wos.filter(w => ["open", "in_progress"].includes(w.status));
  const completedWOs = wos.filter(w => w.status === "completed");
  const compRate = wos.length > 0 ? Math.round((completedWOs.length / wos.length) * 100) : 0;

  // specializations can be array or string
  const specs = Array.isArray(tech?.specializations)
    ? tech.specializations
    : tech?.specializations
      ? [tech.specializations]
      : [];

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--color-text-3)", fontSize: 14 }}>Loading technician...</div>
    </div>
  );

  if (!tech || tech.detail === "Not found" || tech.error) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👷</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-1)", marginBottom: 8 }}>Technician not found</div>
        <div style={{ fontSize: 14, color: "var(--color-text-3)", marginBottom: 20 }}>ID: {id}</div>
        <button
          onClick={() => router.push("/operations/technicians")}
          style={{
            background: "linear-gradient(135deg,#8F6F3D,#B9924C)",
            color: "#181614", border: "none", borderRadius: 8,
            padding: "10px 20px", fontWeight: 700, cursor: "pointer"
          }}
        >
          Back to Technicians
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Avatar */}
              <div style={{
                width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                background: "linear-gradient(135deg,#8F6F3D,#B9924C)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 900, color: "#181614"
              }}>
                {(tech.name || "?")[0].toUpperCase()}
              </div>
              <div>
                <h1 className="tb-hero-title">{tech.name || `Technician ${id?.slice(0, 8)}`}</h1>
                <p style={{ color: "var(--color-text-2)", fontSize: 13, marginTop: 3 }}>
                  {specs.length > 0 ? specs.slice(0, 3).join(" · ") : "Field Technician"}
                  {tech.employee_id ? ` · ID: ${tech.employee_id}` : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/operations/technicians")}
              style={{
                background: "none", border: "1px solid var(--color-border)",
                color: "var(--color-text-2)", borderRadius: 8,
                padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 600,
                whiteSpace: "nowrap"
              }}
            >
              ← All Technicians
            </button>
          </div>

          <div className="tb-hero-kpis">
            {isLoading || wosLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{wos.length}</div>
                <div className="tb-hero-kpi-label">Total WOs</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#547C4D" }}>{completedWOs.length}</div>
                <div className="tb-hero-kpi-label">Completed</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: activeWOs.length > 0 ? "#B07A2A" : "#547C4D" }}>
                  {activeWOs.length}
                </div>
                <div className="tb-hero-kpi-label">Active</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: compRate >= 80 ? "#547C4D" : "#B07A2A" }}>
                  {compRate}%
                </div>
                <div className="tb-hero-kpi-label">Completion</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div className="tb-canvas">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

          {/* ── LEFT COLUMN ─────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Profile Details */}
            <div className="tb-section">
              <h2 className="tb-section-title">Technician Profile</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  ["Name",          tech.name || "—"],
                  ["Status",        tech.is_active ? "Active" : "Inactive"],
                  ["Phone",         tech.phone || "—"],
                  ["Email",         tech.email || "—"],
                  ["Max WOs",       tech.max_work_orders || "—"],
                  ["Current WOs",   tech.current_work_orders ?? "—"],
                  ["Notes",         tech.notes || "—"],
                  ["Created",       fmtDate(tech.created_at)],
                ].map(([label, value], i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: i < 7 ? "1px solid var(--color-border)" : "none"
                  }}>
                    <span style={{ fontSize: 13, color: "var(--color-text-3)", fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 13, color: "var(--color-text-1)", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>
                      {label === "Status" ? (
                        <StatusBadge status={tech.is_active ? "active" : "inactive"} />
                      ) : value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Specializations */}
              {specs.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Specializations
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {specs.map((s, i) => (
                      <span key={i} style={{
                        padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: "rgba(185,146,76,0.1)",
                        border: "1px solid rgba(185,146,76,0.25)",
                        color: "#B9924C"
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Work Orders */}
            <div className="tb-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 className="tb-section-title" style={{ margin: 0 }}>
                  Work Orders
                  <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: "var(--color-text-3)" }}>
                    {wos.length}
                  </span>
                </h2>
                <button
                  onClick={() => router.push("/operations/work-orders")}
                  style={{ fontSize: 13, color: "#B9924C", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  All WOs →
                </button>
              </div>

              {wosLoading ? <TableSkeleton /> : wos.length === 0 ? (
                <EmptyState
                  icon="🔧"
                  title="No work orders"
                  description="This technician has no assigned work orders"
                />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr className="tb-table-header">
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>WORK ORDER</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>PRIORITY</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>STATUS</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>DUE DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wos.map(wo => (
                        <tr
                          key={wo.id}
                          className="tb-table-row"
                          onClick={() => router.push(`/operations/work-orders/${wo.id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-1)" }}>
                              {(wo.title || "Untitled").slice(0, 50)}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 2 }}>
                              {wo.type || "corrective"}
                            </div>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <StatusBadge status={wo.priority || "medium"} />
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <StatusBadge status={wo.status || "open"} />
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--color-text-3)" }}>
                            {fmtDate(wo.due_date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Performance Card */}
            <div className="tb-section" style={{ textAlign: "center" }}>
              <h2 className="tb-section-title">Performance</h2>
              <div style={{
                fontSize: 52, fontWeight: 900, marginBottom: 4,
                color: compRate >= 80 ? "#547C4D" : compRate >= 50 ? "#B07A2A" : "#A84A3D"
              }}>
                {compRate}%
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-3)", marginBottom: 16 }}>completion rate</div>

              {/* Progress bar */}
              <div style={{ height: 8, background: "var(--color-border)", borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  width: `${compRate}%`,
                  background: compRate >= 80 ? "#547C4D" : compRate >= 50 ? "#B07A2A" : "#A84A3D",
                  transition: "width 0.5s ease"
                }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { label: "Total", value: wos.length, color: "var(--color-text-1)" },
                  { label: "Done", value: completedWOs.length, color: "#547C4D" },
                  { label: "Active", value: activeWOs.length, color: activeWOs.length > 0 ? "#B07A2A" : "#547C4D" },
                ].map((s, i) => (
                  <div key={i} style={{
                    padding: "10px 8px",
                    background: "var(--color-surface-alt)",
                    borderRadius: 8
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Capacity */}
            <div className="tb-section">
              <h2 className="tb-section-title">Capacity</h2>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-2)" }}>Workload</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-1)" }}>
                    {tech.current_work_orders ?? 0} / {tech.max_work_orders ?? 10}
                  </span>
                </div>
                <div style={{ height: 8, background: "var(--color-border)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    width: `${Math.min(100, ((tech.current_work_orders ?? 0) / (tech.max_work_orders ?? 10)) * 100)}%`,
                    background: (tech.current_work_orders ?? 0) >= (tech.max_work_orders ?? 10) ? "#A84A3D" : "#547C4D"
                  }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 8 }}>
                {(tech.max_work_orders ?? 10) - (tech.current_work_orders ?? 0)} slots available
              </div>
            </div>

            {/* Quick Actions */}
            <div className="tb-section">
              <h2 className="tb-section-title">Quick Actions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "All Technicians", icon: "👷", path: "/operations/technicians" },
                  { label: "Dispatch Board",  icon: "📋", path: "/operations/dispatch" },
                  { label: "Work Orders",     icon: "🔧", path: "/operations/work-orders" },
                  { label: "Time Tracking",   icon: "⏱️", path: "/operations/time-tracking" },
                ].map((a, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(a.path)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                      background: "var(--color-surface-alt)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-2)", fontSize: 13, fontWeight: 500,
                      textAlign: "left", width: "100%"
                    }}
                  >
                    <span>{a.icon}</span>
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
