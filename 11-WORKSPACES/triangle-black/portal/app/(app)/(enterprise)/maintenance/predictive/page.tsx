"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";

interface PredSummary {
  total_assessed: number;
  avg_predictive_score: number;
  risk_distribution: Record<string, number>;
  immediate_action: Array<{ asset_name: string; predictive_score: number; category: string; recommendation: string; days_to_recommended_action: number }>;
  schedule_soon: Array<{ asset_name: string; predictive_score: number; recommendation: string }>;
  insights: Array<{ type: string; severity: string; message: string }>;
  top_risk_assets: Array<{ asset_name: string; predictive_score: number; risk_level: string; category: string; recommendation: string; factors: { failure_factor: number; pm_gap_factor: number; age_factor: number } }>;
}

const RISK_COLOR: Record<string,string> = {
  CRITICAL:"#ef4444", HIGH:"#f97316", MODERATE:"#eab308", LOW:"#22c55e"
};
const REC_COLOR: Record<string,string> = {
  IMMEDIATE_ACTION:"#ef4444", SCHEDULE_SOON:"#f97316",
  MONITOR:"#eab308", MAINTAIN_SCHEDULE:"#22c55e"
};

export default function PredictiveMaintenancePage() {
  const [summary, setSummary] = useState<PredSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTs(new Date().toLocaleString());
    authFetch("/api/v1/predictive-engine/summary")
      .then(r => r.json()).catch(() => null)
      .then(d => { setSummary(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="tb-canvas">
      <div className="tb-section">
        <div className="tb-shimmer tb-shimmer-title" />
      </div>
    </div>
  );

  const riskDist = summary?.risk_distribution || {};
  const immediate = summary?.immediate_action || [];
  const topRisk = summary?.top_risk_assets || [];

  return (
    <div className="tb-canvas">
      <div className="tb-section">
        <div className="tb-flex-between">
          <div>
            <h1 className="tb-section-title">Predictive Maintenance</h1>
            <p className="tb-detail-value">Rule-based asset failure risk prediction — {ts}</p>
          </div>
          {(riskDist["CRITICAL"] ?? 0) > 0 && (
            <span className="tb-badge tb-badge-danger">
              🔴 {riskDist["CRITICAL"]} CRITICAL
            </span>
          )}
        </div>
      </div>

      {/* Risk Distribution KPIs */}
      <div className="tb-section">
        <div className="tb-grid-4 mt-3">
          {["CRITICAL","HIGH","MODERATE","LOW"].map(level => (
            <div key={level} className="tb-kpi" style={{ borderTop:`3px solid ${RISK_COLOR[level]}` }}>
              <div className="tb-kpi-label">{level}</div>
              <div className="tb-kpi-value" style={{ color: RISK_COLOR[level] }}>
                {riskDist[level] ?? 0}
              </div>
              <div className="tb-detail-value">assets</div>
            </div>
          ))}
        </div>
      </div>

      {/* Immediate Action Required */}
      {immediate.length > 0 && (
        <div className="tb-section">
          <h2 className="tb-section-title" style={{ color:"#ef4444" }}>
            🚨 IMMEDIATE ACTION REQUIRED ({immediate.length} assets)
          </h2>
          <div className="tb-table-wrap mt-3">
            <table className="tb-table">
              <thead>
                <tr><th>Asset</th><th>Category</th><th>Risk Score</th><th>Days to Action</th><th>Action</th></tr>
              </thead>
              <tbody>
                {immediate.map((a, i) => (
                  <tr key={i} style={{ background: i === 0 ? "rgba(239,68,68,0.05)" : undefined }}>
                    <td style={{ fontWeight:600 }}>{a.asset_name}</td>
                    <td>{a.category}</td>
                    <td style={{ color:"#ef4444", fontWeight:700 }}>{a.predictive_score?.toFixed(0)}/100</td>
                    <td style={{ color: a.days_to_recommended_action <= 0 ? "#ef4444" : "inherit" }}>
                      {a.days_to_recommended_action <= 0 ? "OVERDUE" : `${a.days_to_recommended_action}d`}
                    </td>
                    <td>
                      <span className="tb-badge tb-badge-danger" style={{ fontSize:"0.65rem" }}>
                        {a.recommendation?.replace("_"," ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Risk Assets */}
      {topRisk.length > 0 && (
        <div className="tb-section">
          <h2 className="tb-section-title">Asset Risk Map (Top 5)</h2>
          <div className="tb-grid-3 mt-3">
            {topRisk.slice(0,5).map((a, i) => (
              <div key={i} className="tb-kpi" style={{ borderLeft:`4px solid ${RISK_COLOR[a.risk_level]}` }}>
                <div style={{ fontWeight:700, fontSize:"0.85rem", marginBottom:"0.25rem" }}>{a.asset_name}</div>
                <div className="tb-detail-value">{a.category}</div>
                <div style={{ margin:"0.5rem 0" }}>
                  <span className={`tb-badge tb-badge-${
                    a.risk_level === "CRITICAL" ? "danger" :
                    a.risk_level === "HIGH" ? "warning" : "info"
                  }`}>{a.risk_level}</span>
                  <span style={{ marginLeft:"0.5rem", fontWeight:700, color: RISK_COLOR[a.risk_level] }}>
                    {a.predictive_score?.toFixed(0)}/100
                  </span>
                </div>
                <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
                  {Object.entries(a.factors || {}).map(([k,v]) => (
                    <span key={k} className="tb-badge tb-badge-neutral" style={{ fontSize:"0.6rem" }}>
                      {k.replace("_factor","")}: {Number(v).toFixed(0)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {(summary?.insights || []).length > 0 && (
        <div className="tb-section">
          <h2 className="tb-section-title">Predictive Alerts</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", marginTop:"0.75rem" }}>
            {summary!.insights.map((ins, i) => (
              <div key={i} className={`tb-alert tb-alert-${
                ins.severity === "CRITICAL" ? "danger" : "warning"
              }`} style={{ display:"flex", gap:"0.75rem", alignItems:"center" }}>
                <span className={`tb-badge tb-badge-${
                  ins.severity === "CRITICAL" ? "danger" : "warning"
                }`} style={{ fontSize:"0.65rem" }}>{ins.severity}</span>
                <span>{ins.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
