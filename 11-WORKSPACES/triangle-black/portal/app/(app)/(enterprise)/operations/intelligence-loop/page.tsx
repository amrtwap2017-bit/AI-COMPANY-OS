"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";

interface BacklogSummary {
  backlog_summary: {
    total_open: number;
    avg_age_days: number;
    max_age_days: number;
    critical_overrun_count: number;
  };
  by_priority: Array<{
    priority: string;
    count: number;
    avg_age_days: number;
    sla_target_hours: number;
    risk_level: string;
  }>;
  insights: Array<{ type: string; severity: string; message: string }>;
}

interface SLASummary {
  overall_compliance_pct: number;
  open_breached: number;
  open_at_risk: number;
}

interface PMSummary {
  total_plans: number;
  pm_compliance_pct: number;
  overdue: { total: number };
}

const RISK_COLOR: Record<string, string> = {
  CRITICAL: "#ef4444", HIGH: "#f97316", MODERATE: "#eab308", LOW: "#22c55e",
};
const PRIORITY_ORDER = ["emergency","critical","high","medium","low"];

export default function OperationalIntelligenceLoop() {
  const [backlog, setBacklog] = useState<BacklogSummary | null>(null);
  const [sla, setSla] = useState<SLASummary | null>(null);
  const [pm, setPm] = useState<PMSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTs(new Date().toLocaleString());
    Promise.all([
      authFetch("/api/v1/backlog-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/sla-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/pm-engine/summary").then(r => r.json()).catch(() => null),
    ]).then(([b, s, p]) => {
      setBacklog(b);
      setSla(s);
      setPm(p);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-shimmer tb-shimmer-title" />
          <div className="tb-grid-3 mt-6">
            {[1,2,3].map(i => <div key={i} className="tb-shimmer tb-shimmer-block" />)}
          </div>
        </div>
      </div>
    );
  }

  const b = backlog?.backlog_summary;
  const byPriority = (backlog?.by_priority || []).sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  );

  return (
    <div className="tb-canvas">
      {/* Header */}
      <div className="tb-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 className="tb-section-title">Operational Intelligence Loop</h1>
            <p className="tb-detail-value">
              Data → Control → Intelligence → Improvement — {ts}
            </p>
          </div>
          <span className="tb-badge tb-badge-success">● LIVE</span>
        </div>
      </div>

      {/* The Loop KPIs */}
      <div className="tb-section">
        <h2 className="tb-section-title">Operational Loop Metrics</h2>
        <div className="tb-grid-4 mt-3">
          <div className="tb-kpi">
            <div className="tb-kpi-label">WO Backlog</div>
            <div className="tb-kpi-value" style={{ color: (b?.total_open ?? 0) > 300 ? "#ef4444" : "#eab308" }}>
              {b?.total_open ?? 0}
            </div>
            <div className="tb-detail-value">open work orders</div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">Avg Backlog Age</div>
            <div className="tb-kpi-value">{b?.avg_age_days?.toFixed(1) ?? "—"}</div>
            <div className="tb-detail-value">days average</div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">SLA Breached Open</div>
            <div className="tb-kpi-value" style={{ color: (sla?.open_breached ?? 0) > 0 ? "#ef4444" : "#16a34a" }}>
              {sla?.open_breached ?? 0}
            </div>
            <div className="tb-detail-value">require immediate action</div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">PM Overdue</div>
            <div className="tb-kpi-value" style={{ color: (pm?.overdue?.total ?? 0) > 0 ? "#f97316" : "#16a34a" }}>
              {pm?.overdue?.total ?? 0}
            </div>
            <div className="tb-detail-value">maintenance plans overdue</div>
          </div>
        </div>
      </div>

      {/* Backlog by Priority */}
      <div className="tb-section">
        <h2 className="tb-section-title">WO Backlog by Priority</h2>
        <div className="tb-table-wrap mt-3">
          <table className="tb-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Count</th>
                <th>Avg Age (days)</th>
                <th>SLA Target</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {byPriority.map((item) => (
                <tr key={item.priority}>
                  <td>
                    <span style={{
                      textTransform: "capitalize",
                      fontWeight: 600,
                      color: item.priority === "emergency" ? "#ef4444" :
                             item.priority === "critical" ? "#f97316" :
                             item.priority === "high" ? "#eab308" : "inherit"
                    }}>
                      {item.priority}
                    </span>
                  </td>
                  <td>{item.count}</td>
                  <td>{item.avg_age_days?.toFixed(1)}</td>
                  <td>{item.sla_target_hours}h</td>
                  <td>
                    <span className={`tb-badge tb-badge-${
                      item.risk_level === "CRITICAL" ? "danger" :
                      item.risk_level === "HIGH" ? "warning" :
                      item.risk_level === "MODERATE" ? "info" : "neutral"
                    }`}>
                      {item.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intelligence Insights */}
      {(backlog?.insights || []).length > 0 && (
        <div className="tb-section">
          <h2 className="tb-section-title">Backlog Intelligence Alerts</h2>
          <div className="tb-flex-col gap-2 mt-3">
            {backlog!.insights.map((ins, i) => (
              <div key={i} className={`tb-alert tb-alert-${
                ins.severity === "CRITICAL" ? "danger" :
                ins.severity === "HIGH" ? "warning" : "info"
              }`} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <span className={`tb-badge tb-badge-${
                  ins.severity === "CRITICAL" ? "danger" :
                  ins.severity === "HIGH" ? "warning" : "info"
                }`} style={{ fontSize: "0.65rem", whiteSpace: "nowrap" }}>
                  {ins.severity}
                </span>
                <span>{ins.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* The Intelligence Loop Visual */}
      <div className="tb-section">
        <h2 className="tb-section-title">The Operational Intelligence Loop</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginTop: "0.75rem",
        }}>
          {[
            { step: "1", label: "CAPTURE", desc: "Work orders, assets, POs enter the system", icon: "📥", color: "#3b82f6" },
            { step: "2", label: "CONTROL", desc: "SLA tracking, approval workflows, PM scheduling", icon: "⚙️", color: "#8b5cf6" },
            { step: "3", label: "ANALYZE", desc: "Intelligence engines process operational data", icon: "🧠", color: "#f59e0b" },
            { step: "4", label: "IMPROVE", desc: "Recommendations act on insights, loop restarts", icon: "📈", color: "#10b981" },
          ].map(({ step, label, desc, icon, color }) => (
            <div key={step} className="tb-kpi" style={{ borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
              <div style={{ fontSize: "0.7rem", color, fontWeight: 700, letterSpacing: "0.05em" }}>
                STEP {step}
              </div>
              <div className="tb-kpi-label" style={{ fontWeight: 700, marginTop: "0.25rem" }}>{label}</div>
              <div className="tb-detail-value" style={{ marginTop: "0.25rem", fontSize: "0.75rem" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
