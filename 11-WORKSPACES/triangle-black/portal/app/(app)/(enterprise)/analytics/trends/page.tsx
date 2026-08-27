"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";

interface TrendCompare {
  current_month: { month: string; completed_wos: number; completion_rate_pct: number; sla_compliance_pct: number; avg_completion_hours: number };
  previous_month: { month: string; completed_wos: number; completion_rate_pct: number; sla_compliance_pct: number };
  trends: Record<string, { current: number; previous: number; change_pct: number; direction: string }>;
}

interface TrendSummary {
  monthly_wo_trend: Array<{ month: string; completed_wos: number; completion_rate_pct: number; total_wos: number }>;
  spend_trend: Array<{ month: string; total_spend: number; po_count: number }>;
}

const DIR_COLOR = (dir: string, bigger_is_better = true) => {
  if (dir === "UP") return bigger_is_better ? "#22c55e" : "#ef4444";
  return bigger_is_better ? "#ef4444" : "#22c55e";
};

export default function TrendIntelligencePage() {
  const [compare, setCompare] = useState<TrendCompare | null>(null);
  const [summary, setSummary] = useState<TrendSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTs(new Date().toLocaleString());
    Promise.all([
      authFetch("/api/v1/trend-engine/compare").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/trend-engine/summary").then(r => r.json()).catch(() => null),
    ]).then(([c, s]) => { setCompare(c); setSummary(s); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="tb-canvas"><div className="tb-section"><div className="tb-shimmer tb-shimmer-title" /></div></div>
  );

  const trends = compare?.trends || {};
  const monthly = summary?.monthly_wo_trend || [];
  const spend = summary?.spend_trend || [];

  const trendItems = [
    { key: "wos_completed", label: "WOs Completed", bigger_better: true },
    { key: "completion_rate", label: "Completion Rate", bigger_better: true },
    { key: "sla_compliance", label: "SLA Compliance", bigger_better: true },
    { key: "avg_completion_hours", label: "Avg Completion Hours", bigger_better: false },
  ];

  return (
    <div className="tb-canvas">
      <div className="tb-section">
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <div>
            <h1 className="tb-section-title">Trend Intelligence</h1>
            <p className="tb-detail-value">Month-over-month operational comparison — {ts}</p>
          </div>
          <span className="tb-badge tb-badge-success">● LIVE</span>
        </div>
      </div>

      {/* Month Comparison */}
      {compare?.current_month && (
        <div className="tb-section">
          <h2 className="tb-section-title">
            {compare.current_month.month} vs {compare.previous_month?.month}
          </h2>
          <div className="tb-grid-4 mt-3">
            {trendItems.map(({ key, label, bigger_better }) => {
              const t = trends[key];
              if (!t) return null;
              const isGood = (t.direction === "UP") === bigger_better;
              return (
                <div key={key} className="tb-kpi">
                  <div className="tb-kpi-label">{label}</div>
                  <div className="tb-kpi-value" style={{ color: isGood ? "#22c55e" : "#ef4444" }}>
                    {typeof t.current === "number" ? t.current.toFixed(key.includes("rate") || key.includes("compliance") ? 1 : 0) : "—"}
                    {key.includes("rate") || key.includes("compliance") ? "%" : ""}
                  </div>
                  <div className="tb-detail-value" style={{ color: isGood ? "#22c55e" : "#ef4444" }}>
                    {t.direction === "UP" ? "▲" : "▼"} {Math.abs(t.change_pct).toFixed(1)}% vs prev
                  </div>
                  <div className="tb-detail-value">Prev: {typeof t.previous === "number" ? t.previous.toFixed(0) : "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly WO Trend */}
      {monthly.length > 0 && (
        <div className="tb-section">
          <h2 className="tb-section-title">Monthly Work Order Trend</h2>
          <div className="tb-table-wrap mt-3">
            <table className="tb-table">
              <thead>
                <tr><th>Month</th><th>Total WOs</th><th>Completed</th><th>Rate</th></tr>
              </thead>
              <tbody>
                {monthly.slice(0, 6).map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:600 }}>{m.month}</td>
                    <td>{m.total_wos}</td>
                    <td>{m.completed_wos}</td>
                    <td style={{ color: m.completion_rate_pct >= 60 ? "#22c55e" : "#eab308" }}>
                      {m.completion_rate_pct?.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Spend Trend */}
      {spend.length > 0 && (
        <div className="tb-section">
          <h2 className="tb-section-title">Monthly Procurement Spend</h2>
          <div className="tb-grid-3 mt-3">
            {spend.slice(0,3).map((s, i) => (
              <div key={i} className="tb-kpi">
                <div className="tb-kpi-label">{s.month}</div>
                <div className="tb-kpi-value" style={{ fontSize:"1.2rem" }}>
                  EGP {(s.total_spend/1000).toFixed(0)}K
                </div>
                <div className="tb-detail-value">{s.po_count} purchase orders</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
