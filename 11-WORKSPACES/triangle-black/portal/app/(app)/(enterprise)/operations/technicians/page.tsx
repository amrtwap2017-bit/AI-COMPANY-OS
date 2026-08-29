"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";

interface TechSummary {
  total_technicians: number;
  avg_efficiency_score: number;
  avg_completion_hours: number;
  grade_distribution: Record<string, number>;
  top_performers: Array<{ name: string; efficiency_score: number; grade: string; completed_wos: number }>;
  needs_attention: Array<{ name: string; efficiency_score: number; grade: string; completed_wos: number }>;
  insights: Array<{ type: string; severity: string; message: string }>;
}

interface TechScores {
  count: number;
  technicians: Array<{
    technician_id: string;
    name: string;
    department: string;
    efficiency_score: number;
    completion_rate_pct: number;
    sla_compliance_pct: number;
    avg_completion_hours: number;
    completed_wos: number;
    total_wos: number;
    grade: string;
  }>;
}

const GRADE_COLOR: Record<string, string> = {
  EXCELLENT: "#16a34a", GOOD: "#22c55e",
  ACCEPTABLE: "#eab308", NEEDS_IMPROVEMENT: "#ef4444",
};
const GRADE_BG: Record<string, string> = {
  EXCELLENT: "tb-badge-success", GOOD: "tb-badge-success",
  ACCEPTABLE: "tb-badge-warning", NEEDS_IMPROVEMENT: "tb-badge-danger",
};

export default function TechnicianIntelligencePage() {
  const [summary, setSummary] = useState<TechSummary | null>(null);
  const [scores, setScores] = useState<TechScores | null>(null);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTs(new Date().toLocaleString());
    Promise.all([
      authFetch("/api/v1/technician-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/technician-engine/scores?limit=20").then(r => r.json()).catch(() => null),
    ]).then(([s, sc]) => { setSummary(s); setScores(sc); setLoading(false); });
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

  const gradeDist = summary?.grade_distribution || {};

  return (
    <div className="tb-canvas">
      {/* Header */}
      <div className="tb-section">
        <div className="tb-flex-between">
          <div>
            <h1 className="tb-section-title">Technician Intelligence</h1>
            <p className="tb-detail-value">Team productivity + efficiency scoring — {ts}</p>
          </div>
          <span className="tb-badge tb-badge-success">● LIVE</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="tb-section">
        <div className="tb-grid-4 mt-3">
          <div className="tb-kpi">
            <div className="tb-kpi-label">Total Technicians</div>
            <div className="tb-kpi-value">{summary?.total_technicians ?? 0}</div>
            <div className="tb-detail-value">tracked</div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">Avg Efficiency</div>
            <div className="tb-kpi-value" style={{ color: (summary?.avg_efficiency_score ?? 0) >= 70 ? "#22c55e" : "#eab308" }}>
              {summary?.avg_efficiency_score?.toFixed(1) ?? "—"}
            </div>
            <div className="tb-detail-value">/ 100</div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">Avg Completion</div>
            <div className="tb-kpi-value">{summary?.avg_completion_hours?.toFixed(0) ?? "—"}</div>
            <div className="tb-detail-value">hours per WO</div>
          </div>
          <div className="tb-kpi">
            <div className="tb-kpi-label">Needs Attention</div>
            <div className="tb-kpi-value" style={{ color: (summary?.needs_attention?.length ?? 0) > 0 ? "#ef4444" : "#16a34a" }}>
              {summary?.needs_attention?.length ?? 0}
            </div>
            <div className="tb-detail-value">technicians</div>
          </div>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="tb-section">
        <h2 className="tb-section-title">Team Grade Distribution</h2>
        <div className="tb-grid-4 mt-3">
          {["EXCELLENT","GOOD","ACCEPTABLE","NEEDS_IMPROVEMENT"].map(grade => (
            <div key={grade} className="tb-kpi" style={{ borderTop: `3px solid ${GRADE_COLOR[grade]}` }}>
              <div className="tb-kpi-label" style={{ fontSize:"0.75rem" }}>{grade.replace("_"," ")}</div>
              <div className="tb-kpi-value" style={{ color: GRADE_COLOR[grade] }}>
                {gradeDist[grade] ?? 0}
              </div>
              <div className="tb-detail-value">technicians</div>
            </div>
          ))}
        </div>
      </div>

      {/* Technician Leaderboard */}
      {(scores?.technicians || []).length > 0 && (
        <div className="tb-section">
          <h2 className="tb-section-title">Technician Productivity Scores</h2>
          <div className="tb-table-wrap mt-3">
            <table className="tb-table">
              <thead>
                <tr>
                  <th>Technician</th>
                  <th>Dept</th>
                  <th>WOs</th>
                  <th>Completion %</th>
                  <th>SLA %</th>
                  <th>Avg Hrs</th>
                  <th>Score</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {(scores?.technicians || []).slice(0, 15).map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td>{t.department}</td>
                    <td>{t.completed_wos}/{t.total_wos}</td>
                    <td>{t.completion_rate_pct?.toFixed(0)}%</td>
                    <td>{t.sla_compliance_pct?.toFixed(0)}%</td>
                    <td>{t.avg_completion_hours?.toFixed(0)}h</td>
                    <td style={{ fontWeight: 700, color: GRADE_COLOR[t.grade] }}>
                      {t.efficiency_score?.toFixed(0)}
                    </td>
                    <td>
                      <span className={`tb-badge ${GRADE_BG[t.grade] || "tb-badge-neutral"}`}
                            style={{ fontSize:"0.65rem" }}>
                        {t.grade?.replace("_"," ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights */}
      {(summary?.insights || []).length > 0 && (
        <div className="tb-section">
          <h2 className="tb-section-title">Intelligence Alerts</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", marginTop:"0.75rem" }}>
            {summary!.insights.map((ins, i) => (
              <div key={i} className={`tb-alert tb-alert-${
                ins.severity === "HIGH" ? "warning" : "info"
              }`} style={{ display:"flex", gap:"0.75rem", alignItems:"center" }}>
                <span className={`tb-badge tb-badge-${
                  ins.severity === "HIGH" ? "warning" : "info"
                }`} style={{ fontSize:"0.65rem" }}>{ins.severity}</span>
                <span>{ins.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary?.total_technicians === 0 && (
        <div className="tb-section">
          <div className="tb-empty">
            <div className="tb-empty-icon">👷</div>
            <div className="tb-empty-title">No Technician Data</div>
            <div className="tb-empty-desc">Work orders need technician_id assigned to track productivity</div>
          </div>
        </div>
      )}
    </div>
  );
}
