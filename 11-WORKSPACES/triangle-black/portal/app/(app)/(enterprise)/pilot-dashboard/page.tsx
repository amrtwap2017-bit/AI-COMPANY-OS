"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";

interface DailyBriefing {
  health: { health_score: number; grade: string };
  kpis: {
    open_work_orders: number;
    completed_today: number;
    active_suppliers: number;
    total_assets: number;
    active_alerts: number;
    critical_alerts: number;
  };
  alerts: Array<{ type: string; severity: string; title: string; message: string; count: number }>;
  summary: string;
}

interface CostSummary {
  cost_overview: {
    total_invoice_cost: number;
    total_procurement_spend: number;
    total_operational_cost: number;
  };
  risk_summary: { recurring_failure_assets: number; high_cost_assets: number };
}

interface PMSummary {
  total_plans: number;
  pm_compliance_pct: number;
  compliance_grade: string;
  overdue: { total: number; critical: number };
}

interface SLASummary {
  overall_compliance_pct: number;
  compliance_grade: string;
  open_breached: number;
}

const GRADE_BG: Record<string, string> = {
  "A+": "#dcfce7", A: "#dcfce7", "B+": "#f0fdf4",
  B: "#fef9c3", C: "#fff7ed", D: "#fee2e2",
};
const GRADE_COLOR: Record<string, string> = {
  "A+": "#15803d", A: "#16a34a", "B+": "#65a30d",
  B: "#ca8a04", C: "#ea580c", D: "#dc2626",
};

export default function PilotCustomerDashboard() {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [cost, setCost] = useState<CostSummary | null>(null);
  const [pm, setPm] = useState<PMSummary | null>(null);
  const [sla, setSla] = useState<SLASummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTs(new Date().toLocaleString());
    Promise.all([
      authFetch("/api/v1/executive-engine/daily-briefing").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/cost-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/pm-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/sla-engine/summary").then(r => r.json()).catch(() => null),
    ]).then(([b, c, p, s]) => {
      setBriefing(b);
      setCost(c);
      setPm(p);
      setSla(s);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-shimmer tb-shimmer-title" className="w-40p" />
          <div className="tb-grid-4" className="mt-6">
            {[1,2,3,4].map(i => <div key={i} className="tb-shimmer tb-shimmer-block" />)}
          </div>
        </div>
      </div>
    );
  }

  const health = briefing?.health;
  const kpis = briefing?.kpis;
  const alerts = briefing?.alerts || [];
  const costOverview = cost?.cost_overview;

  return (
    <div className="tb-canvas">
      {/* Header */}
      <div className="tb-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 className="tb-section-title">Pilot Customer Dashboard</h1>
            <p className="tb-detail-value">Engineering Operations — {ts}</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {(kpis?.critical_alerts ?? 0) > 0 && (
              <span className="tb-badge tb-badge-danger">
                🔴 {kpis?.critical_alerts} Critical
              </span>
            )}
            <span className="tb-badge tb-badge-success">● LIVE</span>
          </div>
        </div>
      </div>

      {/* Health Score Banner */}
      {health && (
        <div className="tb-section">
          <div style={{
            padding: "1.25rem 1.5rem",
            borderRadius: "0.75rem",
            background: GRADE_BG[health.grade] || "#f9fafb",
            border: `1px solid ${GRADE_COLOR[health.grade] || "#e5e7eb"}`,
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                color: GRADE_COLOR[health.grade],
                lineHeight: 1,
              }}>
                {health.health_score.toFixed(0)}
              </div>
              <div style={{ fontSize: "0.75rem", color: GRADE_COLOR[health.grade], fontWeight: 600 }}>
                / 100
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: GRADE_COLOR[health.grade] }}>
                Operational Health: Grade {health.grade}
              </div>
              <div className="tb-detail-value">{briefing?.summary}</div>
            </div>
          </div>
        </div>
      )}

      {/* 8 Priority KPIs */}
      <div className="tb-section">
        <h2 className="tb-section-title">Priority KPIs</h2>
        <div className="tb-grid-4" className="mt-3">
          {/* KPI 1: SLA Compliance */}
          <div className="tb-kpi">
            <div className="tb-kpi-label">SLA Compliance</div>
            <div className="tb-kpi-value" style={{ color: GRADE_COLOR[sla?.compliance_grade || "D"] }}>
              {sla?.overall_compliance_pct?.toFixed(1) ?? "—"}%
            </div>
            <div className="tb-detail-value">{sla?.open_breached ?? 0} active breaches</div>
          </div>
          {/* KPI 2: PM Compliance */}
          <div className="tb-kpi">
            <div className="tb-kpi-label">PM Compliance</div>
            <div className="tb-kpi-value" style={{ color: GRADE_COLOR[pm?.compliance_grade || "D"] }}>
              {pm?.pm_compliance_pct?.toFixed(1) ?? "—"}%
            </div>
            <div className="tb-detail-value">{pm?.overdue?.total ?? 0} plans overdue</div>
          </div>
          {/* KPI 3: Open WOs */}
          <div className="tb-kpi">
            <div className="tb-kpi-label">Open Work Orders</div>
            <div className="tb-kpi-value">{kpis?.open_work_orders ?? 0}</div>
            <div className="tb-detail-value">{kpis?.completed_today ?? 0} completed today</div>
          </div>
          {/* KPI 4: Maintenance Spend */}
          <div className="tb-kpi">
            <div className="tb-kpi-label">Total Op Cost</div>
            <div className="tb-kpi-value" style={{ fontSize: "1.2rem" }}>
              {costOverview?.total_operational_cost
                ? `EGP ${(costOverview.total_operational_cost / 1000).toFixed(0)}K`
                : "—"}
            </div>
            <div className="tb-detail-value">Invoices + Procurement</div>
          </div>
          {/* KPI 5: Active Alerts */}
          <div className="tb-kpi">
            <div className="tb-kpi-label">Active Alerts</div>
            <div className="tb-kpi-value" style={{ color: (kpis?.critical_alerts ?? 0) > 0 ? "#ef4444" : "#16a34a" }}>
              {kpis?.active_alerts ?? 0}
            </div>
            <div className="tb-detail-value">{kpis?.critical_alerts ?? 0} critical</div>
          </div>
          {/* KPI 6: SLA Breaches */}
          <div className="tb-kpi">
            <div className="tb-kpi-label">SLA Breaches Open</div>
            <div className="tb-kpi-value" style={{ color: (sla?.open_breached ?? 0) > 0 ? "#ef4444" : "#16a34a" }}>
              {sla?.open_breached ?? 0}
            </div>
            <div className="tb-detail-value">Requires immediate action</div>
          </div>
          {/* KPI 7: PM Plans Active */}
          <div className="tb-kpi">
            <div className="tb-kpi-label">PM Plans Active</div>
            <div className="tb-kpi-value">{pm?.total_plans ?? 0}</div>
            <div className="tb-detail-value">{pm?.overdue?.critical ?? 0} critical overdue</div>
          </div>
          {/* KPI 8: Total Assets */}
          <div className="tb-kpi">
            <div className="tb-kpi-label">Total Assets</div>
            <div className="tb-kpi-value">{kpis?.total_assets ?? 0}</div>
            <div className="tb-detail-value">{kpis?.active_suppliers ?? 0} active suppliers</div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="tb-section">
          <h2 className="tb-section-title">Active Operational Alerts</h2>
          <div className="tb-flex-col gap-2 mt-3">
            {alerts.map((alert, i) => (
              <div key={i} className={`tb-alert tb-alert-${
                alert.severity.includes("CRITICAL") ? "danger" :
                alert.severity.includes("HIGH") ? "warning" : "info"
              }`} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className={`tb-badge ${
                  alert.severity.includes("CRITICAL") ? "tb-badge-danger" :
                  alert.severity.includes("HIGH") ? "tb-badge-warning" : "tb-badge-info"
                }`} style={{ fontSize: "0.65rem", whiteSpace: "nowrap" }}>
                  {alert.severity}
                </span>
                <div>
                  <strong style={{ fontSize: "0.875rem" }}>{alert.title}</strong>
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", opacity: 0.8 }}>
                    {alert.message}
                  </span>
                </div>
                <span className="tb-badge tb-badge-neutral" style={{ marginLeft: "auto", fontSize: "0.7rem" }}>
                  {alert.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="tb-section">
          <div className="tb-empty">
            <div className="tb-empty-icon">✅</div>
            <div className="tb-empty-title">No Active Alerts</div>
            <div className="tb-empty-desc">All operational metrics within normal parameters</div>
          </div>
        </div>
      )}
    </div>
  );
}
