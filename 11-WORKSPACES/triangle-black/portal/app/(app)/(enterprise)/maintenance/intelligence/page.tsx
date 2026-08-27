"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";

interface PMSummary {
  total_plans: number;
  pm_compliance_pct: number;
  compliance_grade: string;
  overdue: { total: number; critical: number };
  insights: Array<{ type: string; severity: string; message: string }>;
}

interface PMCompliance {
  overall_compliance_pct: number;
  by_category: Array<{
    category: string;
    compliance_pct: number;
    scheduled: number;
    overdue: number;
  }>;
}

interface PMSchedule {
  schedule_period: string;
  asset_schedule: {
    overdue: Array<{ asset_name: string; schedule_status: string; days_overdue?: number }>;
    due_this_week: Array<{ asset_name: string; next_due: string }>;
    due_this_month: Array<{ asset_name: string; next_due: string }>;
  };
}

interface CostSummary {
  risk_summary: { recurring_failure_assets: number };
  top_cost_assets: Array<{ asset_name: string; total_invoice_cost: number; cost_risk: string }>;
}

const GRADE_COLOR: Record<string,string> = {
  A:"#16a34a","B":"#22c55e",C:"#eab308",D:"#ef4444","A+":"#16a34a","B+":"#84cc16"
};

export default function MaintenanceIntelligencePage() {
  const [pm, setPm] = useState<PMSummary | null>(null);
  const [compliance, setCompliance] = useState<PMCompliance | null>(null);
  const [schedule, setSchedule] = useState<PMSchedule | null>(null);
  const [cost, setCost] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTs(new Date().toLocaleString());
    Promise.all([
      authFetch("/api/v1/pm-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/pm-engine/compliance").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/pm-engine/schedule").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/cost-engine/summary").then(r => r.json()).catch(() => null),
    ]).then(([p, c, s, co]) => {
      setPm(p); setCompliance(c); setSchedule(s); setCost(co);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="tb-canvas">
      <div className="tb-section">
        <div className="tb-shimmer tb-shimmer-title" />
        <div className="tb-grid-4 mt-6">
          {[1,2,3,4].map(i => <div key={i} className="tb-shimmer tb-shimmer-block" />)}
        </div>
      </div>
    </div>
  );

  const overdue = schedule?.asset_schedule?.overdue || [];
  const dueWeek = schedule?.asset_schedule?.due_this_week || [];
  const dueMonth = schedule?.asset_schedule?.due_this_month || [];
  const topCostAssets = cost?.top_cost_assets || [];

  return (
    <div className="tb-canvas">
      {/* Header */}
      <div className="tb-section">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <h1 className="tb-section-title">Maintenance Intelligence</h1>
            <p className="tb-detail-value">PM compliance, scheduling and cost analysis — {ts}</p>
          </div>
          <span className="tb-badge tb-badge-success">● LIVE</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="tb-section">
        <div className="tb-grid-4 mt-3">
          <div className="tb-kpi">
            <div className="tb-kpi-label">PM Compliance</div>
            <div className="tb-kpi-value" style={{ color: GRADE_COLOR[pm?.compliance_grade || "D"] }}>
              {pm?.pm_compliance_pct?.toFixed(1) ?? "—"}%
            </div>
            <div className="tb-detail-value">Grade: {pm?.compliance_grade ?? "—"}</div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">Active Plans</div>
            <div className="tb-kpi-value">{pm?.total_plans ?? 0}</div>
            <div className="tb-detail-value">scheduled</div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">Overdue Plans</div>
            <div className="tb-kpi-value" style={{ color: (pm?.overdue?.total ?? 0) > 0 ? "#ef4444" : "#16a34a" }}>
              {pm?.overdue?.total ?? 0}
            </div>
            <div className="tb-detail-value">{pm?.overdue?.critical ?? 0} critical</div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">Recurring Failures</div>
            <div className="tb-kpi-value" style={{ color: "#f97316" }}>
              {cost?.risk_summary?.recurring_failure_assets ?? 0}
            </div>
            <div className="tb-detail-value">assets</div>
          </div>
        </div>
      </div>

      {/* Compliance by Category */}
      {(compliance?.by_category || []).length > 0 && (
        <div className="tb-section">
          <h2 className="tb-section-title">Compliance by Category</h2>
          <div className="tb-table-wrap mt-3">
            <table className="tb-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Scheduled</th>
                  <th>Overdue</th>
                  <th>Compliance</th>
                </tr>
              </thead>
              <tbody>
                {(compliance?.by_category || []).slice(0, 8).map((cat) => (
                  <tr key={cat.category}>
                    <td>{cat.category || "Unknown"}</td>
                    <td>{cat.scheduled}</td>
                    <td style={{ color: cat.overdue > 0 ? "#ef4444" : "inherit" }}>
                      {cat.overdue}
                    </td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                        <div style={{ width:"60px", height:"6px", background:"var(--border-color)", borderRadius:"3px" }}>
                          <div style={{
                            width:`${Math.min(cat.compliance_pct,100)}%`,
                            height:"100%",
                            background: cat.compliance_pct >= 80 ? "#22c55e" : cat.compliance_pct >= 60 ? "#eab308" : "#ef4444",
                            borderRadius:"3px",
                          }} />
                        </div>
                        <span>{cat.compliance_pct?.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 30-Day Schedule */}
      <div className="tb-section">
        <h2 className="tb-section-title">30-Day Maintenance Schedule</h2>
        <div className="tb-grid-3 mt-3">
          <div className="tb-kpi">
            <h3 style={{ fontSize:"0.8rem", fontWeight:700, color:"#ef4444", marginBottom:"0.5rem" }}>
              🚨 OVERDUE ({overdue.length})
            </h3>
            {overdue.slice(0,5).map((a,i) => (
              <div key={i} className="tb-detail-row">
                <span className="tb-detail-key" style={{ fontSize:"0.75rem" }}>{a.asset_name?.slice(0,20) || "—"}</span>
                <span className="tb-badge tb-badge-danger" style={{ fontSize:"0.6rem" }}>OVERDUE</span>
              </div>
            ))}
            {overdue.length === 0 && <div className="tb-detail-value">No overdue items</div>}
          </div>
          <div className="tb-kpi">
            <h3 style={{ fontSize:"0.8rem", fontWeight:700, color:"#f97316", marginBottom:"0.5rem" }}>
              ⚡ DUE THIS WEEK ({dueWeek.length})
            </h3>
            {dueWeek.slice(0,5).map((a,i) => (
              <div key={i} className="tb-detail-row">
                <span className="tb-detail-key" style={{ fontSize:"0.75rem" }}>{a.asset_name?.slice(0,20) || "—"}</span>
                <span className="tb-detail-value" style={{ fontSize:"0.7rem" }}>{a.next_due}</span>
              </div>
            ))}
            {dueWeek.length === 0 && <div className="tb-detail-value">None this week</div>}
          </div>
          <div className="tb-kpi">
            <h3 style={{ fontSize:"0.8rem", fontWeight:700, color:"#eab308", marginBottom:"0.5rem" }}>
              📅 DUE THIS MONTH ({dueMonth.length})
            </h3>
            {dueMonth.slice(0,5).map((a,i) => (
              <div key={i} className="tb-detail-row">
                <span className="tb-detail-key" style={{ fontSize:"0.75rem" }}>{a.asset_name?.slice(0,20) || "—"}</span>
                <span className="tb-detail-value" style={{ fontSize:"0.7rem" }}>{a.next_due}</span>
              </div>
            ))}
            {dueMonth.length === 0 && <div className="tb-detail-value">None this month</div>}
          </div>
        </div>
      </div>

      {/* Top Cost Assets */}
      {topCostAssets.length > 0 && (
        <div className="tb-section">
          <h2 className="tb-section-title">Highest Maintenance Cost Assets</h2>
          <div className="tb-table-wrap mt-3">
            <table className="tb-table">
              <thead>
                <tr><th>Asset</th><th>Invoice Cost (EGP)</th><th>Risk</th></tr>
              </thead>
              <tbody>
                {topCostAssets.slice(0,5).map((a,i) => (
                  <tr key={i}>
                    <td>{a.asset_name}</td>
                    <td>{a.total_invoice_cost?.toLocaleString("en-EG")}</td>
                    <td>
                      <span className={`tb-badge tb-badge-${
                        a.cost_risk === "HIGH" ? "danger" :
                        a.cost_risk === "MODERATE" ? "warning" : "neutral"
                      }`}>{a.cost_risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights */}
      {(pm?.insights || []).length > 0 && (
        <div className="tb-section">
          <h2 className="tb-section-title">Intelligence Alerts</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", marginTop:"0.75rem" }}>
            {pm!.insights.map((ins, i) => (
              <div key={i} className={`tb-alert tb-alert-${
                ins.severity === "CRITICAL" ? "danger" :
                ins.severity === "HIGH" ? "warning" : "info"
              }`} style={{ display:"flex", gap:"0.75rem", alignItems:"center" }}>
                <span className={`tb-badge tb-badge-${
                  ins.severity === "CRITICAL" ? "danger" :
                  ins.severity === "HIGH" ? "warning" : "info"
                }`} style={{ fontSize:"0.65rem", whiteSpace:"nowrap" }}>
                  {ins.severity}
                </span>
                <span>{ins.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
