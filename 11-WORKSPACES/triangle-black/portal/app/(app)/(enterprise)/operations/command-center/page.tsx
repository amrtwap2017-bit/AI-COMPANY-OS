"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";

interface PMSummary {
  pm_compliance_pct: number;
  compliance_grade: string;
  total_plans: number;
  overdue: { total: number; critical: number };
  insights: Array<{ type: string; severity: string; message: string }>;
}

interface SupplierSummary {
  total_suppliers: number;
  avg_performance_score: number;
  concentration_risk: { pct: number; level: string };
  insights: Array<{ type: string; severity: string; message: string }>;
}

interface WorkflowData {
  count: number;
}

const SEVERITY_CLASS: Record<string, string> = {
  CRITICAL: "tb-badge tb-badge-danger",
  HIGH: "tb-badge tb-badge-warning",
  MEDIUM: "tb-badge tb-badge-info",
  LOW: "tb-badge tb-badge-neutral",
};

const GRADE_COLOR: Record<string, string> = {
  "A+": "#16a34a", A: "#22c55e", "B+": "#84cc16",
  B: "#eab308", C: "#f97316", D: "#ef4444",
};

export default function OperationalCommandCenterPage() {
  const [pm, setPm] = useState<PMSummary | null>(null);
  const [supplier, setSupplier] = useState<SupplierSummary | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTs(new Date().toLocaleTimeString());

    Promise.all([
      authFetch("/api/v1/pm-engine/summary").then((r) => r.json()).catch(() => null),
      authFetch("/api/v1/supplier-engine/summary").then((r) => r.json()).catch(() => null),
      authFetch("/api/v1/workflow/instances").then((r) => r.json()).catch(() => null),
    ]).then(([pmData, supData, wfData]) => {
      setPm(pmData);
      setSupplier(supData);
      setWorkflow(wfData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-shimmer tb-shimmer-title" />
          <div className="tb-grid-3" style={{ marginTop: "1.5rem" }}>
            {[1, 2, 3].map((i) => <div key={i} className="tb-shimmer tb-shimmer-block" />)}
          </div>
        </div>
      </div>
    );
  }

  const allInsights = [
    ...(pm?.insights || []),
    ...(supplier?.insights || []),
  ];

  return (
    <div className="tb-canvas">
      {/* Header */}
      <div className="tb-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 className="tb-section-title">Operational Command Center</h1>
            <p className="tb-detail-value">
              Live intelligence across PM, Suppliers and Workflows — updated {ts}
            </p>
          </div>
          <span className="tb-badge tb-badge-success">● LIVE</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="tb-section">
        <div className="tb-grid-4">
          <div className="tb-kpi">
            <div className="tb-kpi-label">PM Compliance</div>
            <div className="tb-kpi-value" style={{ color: GRADE_COLOR[pm?.compliance_grade || "D"] }}>
              {pm?.pm_compliance_pct?.toFixed(1) ?? "—"}%
            </div>
            <div className="tb-detail-value">Grade {pm?.compliance_grade ?? "—"}</div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">PM Plans</div>
            <div className="tb-kpi-value">{pm?.total_plans ?? 0}</div>
            <div className="tb-detail-value">Active plans</div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">Overdue Tasks</div>
            <div className="tb-kpi-value" style={{ color: (pm?.overdue?.total ?? 0) > 0 ? "#ef4444" : "#16a34a" }}>
              {pm?.overdue?.total ?? 0}
            </div>
            <div className="tb-detail-value">{pm?.overdue?.critical ?? 0} critical</div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">Supplier Score</div>
            <div className="tb-kpi-value">{supplier?.avg_performance_score?.toFixed(0) ?? "—"}</div>
            <div className="tb-detail-value">Avg / 100</div>
          </div>
        </div>
      </div>

      {/* Intelligence Row */}
      <div className="tb-section">
        <div className="tb-grid-3">

          {/* PM Intelligence */}
          <div className="tb-kpi" style={{ gridColumn: "1" }}>
            <h3 className="tb-section-title" style={{ fontSize: "0.9rem" }}>
              PM Intelligence
            </h3>
            <div style={{ marginTop: "0.75rem" }}>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Active Plans</span>
                <span className="tb-detail-value">{pm?.total_plans ?? 0}</span>
              </div>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Overdue</span>
                <span className="tb-detail-value">{pm?.overdue?.total ?? 0}</span>
              </div>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Critical Overdue</span>
                <span className="tb-detail-value" style={{ color: "#ef4444" }}>
                  {pm?.overdue?.critical ?? 0}
                </span>
              </div>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Compliance</span>
                <span className="tb-detail-value">
                  {pm?.pm_compliance_pct?.toFixed(1) ?? 0}% — {pm?.compliance_grade}
                </span>
              </div>
            </div>
          </div>

          {/* Supplier Intelligence */}
          <div className="tb-kpi">
            <h3 className="tb-section-title" style={{ fontSize: "0.9rem" }}>
              Supplier Intelligence
            </h3>
            <div style={{ marginTop: "0.75rem" }}>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Total Suppliers</span>
                <span className="tb-detail-value">{supplier?.total_suppliers ?? 0}</span>
              </div>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Avg Score</span>
                <span className="tb-detail-value">
                  {supplier?.avg_performance_score?.toFixed(0) ?? "—"}/100
                </span>
              </div>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Concentration Risk</span>
                <span className="tb-detail-value">
                  {supplier?.concentration_risk?.pct?.toFixed(1) ?? "—"}%
                  {" "}({supplier?.concentration_risk?.level ?? "—"})
                </span>
              </div>
            </div>
          </div>

          {/* Workflow Intelligence */}
          <div className="tb-kpi">
            <h3 className="tb-section-title" style={{ fontSize: "0.9rem" }}>
              Workflow Intelligence
            </h3>
            <div style={{ marginTop: "0.75rem" }}>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Active Instances</span>
                <span className="tb-detail-value">{workflow?.count ?? 0}</span>
              </div>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Status</span>
                <span className="tb-badge tb-badge-success" style={{ fontSize: "0.7rem" }}>
                  OPERATIONAL
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence Alerts */}
      {allInsights.length > 0 && (
        <div className="tb-section">
          <h2 className="tb-section-title">Intelligence Alerts</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem" }}>
            {allInsights.map((ins, i) => (
              <div key={i} className={`tb-alert tb-alert-${
                ins.severity === "CRITICAL" ? "danger" :
                ins.severity === "HIGH" ? "warning" : "info"
              }`} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className={SEVERITY_CLASS[ins.severity] || "tb-badge tb-badge-neutral"}>
                  {ins.severity}
                </span>
                <span>{ins.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {allInsights.length === 0 && (
        <div className="tb-section">
          <div className="tb-empty">
            <div className="tb-empty-icon">✅</div>
            <div className="tb-empty-title">No Active Alerts</div>
            <div className="tb-empty-desc">All systems operating within normal parameters</div>
          </div>
        </div>
      )}
    </div>
  );
}
