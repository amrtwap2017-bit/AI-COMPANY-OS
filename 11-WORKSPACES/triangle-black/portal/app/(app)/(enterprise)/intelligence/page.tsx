"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";

interface HealthScore { health_score: number; grade: string; components: Record<string, {score: number; weight: number}>; }
interface SLASummary { overall_compliance_pct: number; compliance_grade: string; open_at_risk: number; open_breached: number; }
interface AssetSummary { portfolio: { total_assets: number; pm_coverage_pct: number; }; risk_summary: { critical_count: number; high_count: number; }; }
interface ProcSummary { spend: { total_spend: number; pending_orders: number; }; concentration: { concentration_pct: number; risk_level: string; }; }
interface PMSummary { total_plans: number; pm_compliance_pct: number; compliance_grade: string; overdue: { total: number; critical: number }; }
interface Alert { type: string; severity: string; title: string; message: string; count: number; }

const GRADE_COLOR: Record<string, string> = {
  "A+": "#16a34a", A: "#22c55e", "B+": "#84cc16",
  B: "#eab308", C: "#f97316", D: "#ef4444",
};

const SEV_CLASS: Record<string, string> = {
  P0_CRITICAL: "tb-badge tb-badge-danger",
  P1_HIGH: "tb-badge tb-badge-warning",
  P2_MEDIUM: "tb-badge tb-badge-info",
  CRITICAL: "tb-badge tb-badge-danger",
  HIGH: "tb-badge tb-badge-warning",
  MEDIUM: "tb-badge tb-badge-info",
};

export default function UnifiedIntelligenceDashboard() {
  const [health, setHealth] = useState<HealthScore | null>(null);
  const [sla, setSla] = useState<SLASummary | null>(null);
  const [assets, setAssets] = useState<AssetSummary | null>(null);
  const [proc, setProc] = useState<ProcSummary | null>(null);
  const [pm, setPm] = useState<PMSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTs(new Date().toLocaleString());

    Promise.all([
      authFetch("/api/v1/executive-engine/health-score").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/sla-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/asset-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/procurement-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/pm-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/executive-engine/alerts").then(r => r.json()).catch(() => null),
    ]).then(([h, s, a, p, pm_, al]) => {
      setHealth(h);
      setSla(s);
      setAssets(a);
      setProc(p);
      setPm(pm_);
      setAlerts(al?.alerts || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-shimmer tb-shimmer-title" />
          <div className="tb-grid-4" className="mt-6">
            {[1,2,3,4].map(i => <div key={i} className="tb-shimmer tb-shimmer-block" />)}
          </div>
        </div>
      </div>
    );
  }

  const criticalAlerts = alerts.filter(a => a.severity.includes("CRITICAL") || a.severity === "P0_CRITICAL");
  const highAlerts = alerts.filter(a => a.severity.includes("HIGH") || a.severity === "P1_HIGH");

  return (
    <div className="tb-canvas">
      {/* Header */}
      <div className="tb-section">
        <div className="tb-flex-between">
          <div>
            <h1 className="tb-section-title">Unified Intelligence Dashboard</h1>
            <p className="tb-detail-value">
              Operational intelligence across all domains — {ts}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {criticalAlerts.length > 0 && (
              <span className="tb-badge tb-badge-danger">
                🔴 {criticalAlerts.length} Critical
              </span>
            )}
            {highAlerts.length > 0 && (
              <span className="tb-badge tb-badge-warning">
                ⚠️ {highAlerts.length} High
              </span>
            )}
            <span className="tb-badge tb-badge-success">● LIVE</span>
          </div>
        </div>
      </div>

      {/* Operational Health Score */}
      <div className="tb-section">
        <h2 className="tb-section-title">Operational Health</h2>
        <div className="tb-grid-4" className="mt-3">
          <div className="tb-kpi">
            <div className="tb-kpi-label">Overall Score</div>
            <div className="tb-kpi-value" style={{ color: GRADE_COLOR[health?.grade || "D"] }}>
              {health?.health_score?.toFixed(0) ?? "—"}/100
            </div>
            <div className="tb-detail-value">Grade: {health?.grade ?? "—"}</div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">SLA Compliance</div>
            <div className="tb-kpi-value" style={{ color: GRADE_COLOR[sla?.compliance_grade || "D"] }}>
              {sla?.overall_compliance_pct?.toFixed(1) ?? "—"}%
            </div>
            <div className="tb-detail-value">
              {sla?.open_breached ?? 0} breached open
            </div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">PM Compliance</div>
            <div className="tb-kpi-value" style={{ color: GRADE_COLOR[pm?.compliance_grade || "D"] }}>
              {pm?.pm_compliance_pct?.toFixed(1) ?? "—"}%
            </div>
            <div className="tb-detail-value">{pm?.total_plans ?? 0} plans active</div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">Asset PM Coverage</div>
            <div className="tb-kpi-value">
              {assets?.portfolio?.pm_coverage_pct?.toFixed(1) ?? "—"}%
            </div>
            <div className="tb-detail-value">{assets?.portfolio?.total_assets ?? 0} total assets</div>
          </div>
        </div>
      </div>

      {/* Intelligence Domains */}
      <div className="tb-section">
        <h2 className="tb-section-title">Domain Intelligence</h2>
        <div className="tb-grid-3" className="mt-3">

          {/* SLA Domain */}
          <div className="tb-kpi">
            <h3 className="tb-section-title" style={{ fontSize: "0.85rem" }}>
              🎯 SLA Intelligence
            </h3>
            <div className="tb-detail-row">
              <span className="tb-detail-key">Compliance</span>
              <span className="tb-detail-value">{sla?.overall_compliance_pct?.toFixed(1)}% ({sla?.compliance_grade})</span>
            </div>
            <div className="tb-detail-row">
              <span className="tb-detail-key">Open Breached</span>
              <span className="tb-detail-value" style={{ color: (sla?.open_breached ?? 0) > 0 ? "#ef4444" : "inherit" }}>
                {sla?.open_breached ?? 0}
              </span>
            </div>
            <div className="tb-detail-row">
              <span className="tb-detail-key">At Risk</span>
              <span className="tb-detail-value">{sla?.open_at_risk ?? 0}</span>
            </div>
          </div>

          {/* Asset Domain */}
          <div className="tb-kpi">
            <h3 className="tb-section-title" style={{ fontSize: "0.85rem" }}>
              🏗️ Asset Intelligence
            </h3>
            <div className="tb-detail-row">
              <span className="tb-detail-key">Total Assets</span>
              <span className="tb-detail-value">{assets?.portfolio?.total_assets ?? 0}</span>
            </div>
            <div className="tb-detail-row">
              <span className="tb-detail-key">PM Coverage</span>
              <span className="tb-detail-value">{assets?.portfolio?.pm_coverage_pct?.toFixed(1)}%</span>
            </div>
            <div className="tb-detail-row">
              <span className="tb-detail-key">Critical Risk</span>
              <span className="tb-detail-value" style={{ color: (assets?.risk_summary?.critical_count ?? 0) > 0 ? "#ef4444" : "inherit" }}>
                {assets?.risk_summary?.critical_count ?? 0}
              </span>
            </div>
          </div>

          {/* Procurement Domain */}
          <div className="tb-kpi">
            <h3 className="tb-section-title" style={{ fontSize: "0.85rem" }}>
              📦 Procurement Intelligence
            </h3>
            <div className="tb-detail-row">
              <span className="tb-detail-key">Total Spend</span>
              <span className="tb-detail-value">
                {proc?.spend?.total_spend
                  ? `EGP ${(proc.spend.total_spend / 1000).toFixed(0)}K`
                  : "—"}
              </span>
            </div>
            <div className="tb-detail-row">
              <span className="tb-detail-key">Pending Approval</span>
              <span className="tb-detail-value" style={{ color: (proc?.spend?.pending_orders ?? 0) > 50 ? "#f97316" : "inherit" }}>
                {proc?.spend?.pending_orders ?? 0}
              </span>
            </div>
            <div className="tb-detail-row">
              <span className="tb-detail-key">Concentration</span>
              <span className="tb-detail-value">
                {proc?.concentration?.concentration_pct?.toFixed(1)}% ({proc?.concentration?.risk_level})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Health Score Breakdown */}
      {health?.components && (
        <div className="tb-section">
          <h2 className="tb-section-title">Health Score Breakdown</h2>
          <div className="tb-grid-4" className="mt-3">
            {Object.entries(health.components).map(([key, val]) => (
              <div key={key} className="tb-kpi">
                <div className="tb-kpi-label" style={{ textTransform: "capitalize" }}>
                  {key.replace(/_/g, " ")}
                </div>
                <div className="tb-kpi-value" style={{ fontSize: "1.4rem" }}>
                  {val.score?.toFixed(1)}%
                </div>
                <div className="tb-detail-value">Weight: {(val.weight * 100).toFixed(0)}%</div>
                <div style={{ marginTop: "0.4rem", height: "4px", background: "var(--border-color)", borderRadius: "2px" }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min(val.score, 100)}%`,
                    background: val.score >= 80 ? "#22c55e" : val.score >= 60 ? "#eab308" : "#ef4444",
                    borderRadius: "2px",
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="tb-section">
          <h2 className="tb-section-title">Active Alerts ({alerts.length})</h2>
          <div className="tb-flex-col gap-2 mt-3">
            {alerts.map((alert, i) => (
              <div key={i} className={`tb-alert tb-alert-${
                alert.severity.includes("CRITICAL") || alert.severity === "P0_CRITICAL" ? "danger" :
                alert.severity.includes("HIGH") || alert.severity === "P1_HIGH" ? "warning" : "info"
              }`} className="tb-flex-gap-3">
                <span className={SEV_CLASS[alert.severity] || "tb-badge tb-badge-neutral"} style={{ fontSize: "0.65rem", whiteSpace: "nowrap" }}>
                  {alert.severity}
                </span>
                <div>
                  <strong style={{ fontSize: "0.875rem" }}>{alert.title}</strong>
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", opacity: 0.8 }}>{alert.message}</span>
                </div>
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
            <div className="tb-empty-desc">All operational domains within normal parameters</div>
          </div>
        </div>
      )}
    </div>
  );
}
