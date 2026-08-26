"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";

interface PlatformSnapshot {
  healthScore: number;
  healthGrade: string;
  riskScore: number;
  riskLevel: string;
  totalAssets: number;
  pmCoverage: number;
  openWOs: number;
  totalCost: number;
  slaBreached: number;
  suppliersScored: number;
  backlogOpen: number;
  backlogMaxAge: number;
}

const DEMO_STORY = [
  { icon: "💰", title: "EGP 2.36M+ Operational Cost", desc: "Fully tracked and categorized across assets, POs, and invoices — from invisible to measurable." },
  { icon: "🚨", title: "50 Active SLA Breaches", desc: "50 open work orders already past their SLA deadline. Each breach is now visible, assigned, and trackable." },
  { icon: "📋", title: "354 WO Backlog Items", desc: "Average 14 days in queue, max 35 days. Capacity planning is now data-driven not experience-driven." },
  { icon: "🔧", title: "95.7% Asset PM Coverage", desc: "227 assets now have preventive maintenance plans. Zero unplanned failures start here." },
  { icon: "📊", title: "10 Intelligence Engines", desc: "PM → SLA → Asset → Supplier → Procurement → Executive → Cost → Risk → Workflow → Backlog." },
];

export default function CommercialDemoPage() {
  const [snap, setSnap] = useState<PlatformSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    Promise.all([
      authFetch("/api/v1/executive-engine/health-score").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/risk-engine/operational").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/asset-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/executive-engine/daily-briefing").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/cost-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/sla-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/supplier-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/backlog-engine/summary").then(r => r.json()).catch(() => null),
    ]).then(([h, r, a, b, c, s, sup, bl]) => {
      setSnap({
        healthScore: h?.health_score ?? 0,
        healthGrade: h?.grade ?? "—",
        riskScore: r?.composite_risk_score ?? 0,
        riskLevel: r?.risk_level ?? "—",
        totalAssets: a?.portfolio?.total_assets ?? 0,
        pmCoverage: a?.portfolio?.pm_coverage_pct ?? 0,
        openWOs: b?.kpis?.open_work_orders ?? 0,
        totalCost: c?.cost_overview?.total_operational_cost ?? 0,
        slaBreached: s?.open_breached ?? 0,
        suppliersScored: sup?.total_suppliers ?? 0,
        backlogOpen: bl?.backlog_summary?.total_open ?? 0,
        backlogMaxAge: bl?.backlog_summary?.max_age_days ?? 0,
      });
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="tb-canvas">
      <div className="tb-section">
        <div className="tb-shimmer tb-shimmer-title" />
      </div>
    </div>
  );

  const GRADE_COLOR: Record<string,string> = {
    "A+":"#16a34a",A:"#22c55e","B+":"#84cc16",B:"#eab308",C:"#f97316",D:"#ef4444",GOOD:"#22c55e",FAIR:"#eab308",POOR:"#ef4444"
  };

  return (
    <div className="tb-canvas">
      {/* Hero */}
      <div className="tb-section" style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: "1rem", padding: "2rem" }}>
        <div style={{ color: "#f8fafc" }}>
          <div style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#94a3b8", marginBottom: "0.5rem" }}>
            TRIANGLE BLACK — COMMERCIAL INTELLIGENCE PLATFORM
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
            Hospitality Engineering Operations
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem", margin: 0 }}>
            Turn operational data into measurable business intelligence
          </p>
        </div>
        <div className="tb-grid-4" style={{ marginTop: "1.5rem" }}>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: GRADE_COLOR[snap?.healthGrade || "D"] }}>
              {snap?.healthScore?.toFixed(0)}/100
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Platform Health</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: snap?.riskScore <= 40 ? "#22c55e" : "#f97316" }}>
              {snap?.riskScore?.toFixed(0)}/100
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Operational Risk</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#60a5fa" }}>
              EGP {snap?.totalCost ? `${(snap.totalCost/1000000).toFixed(1)}M` : "—"}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Total Op Cost</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#f59e0b" }}>10</div>
            <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Intelligence Engines</div>
          </div>
        </div>
      </div>

      {/* The 5 Commercial Stories */}
      <div className="tb-section">
        <h2 className="tb-section-title">The Commercial Story</h2>
        <p className="tb-detail-value">5 data points that make an engineering director pay attention</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
          {DEMO_STORY.map((story, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: "1rem",
              padding: "1rem 1.25rem", borderRadius: "0.75rem",
              background: "var(--surface-alt)", border: "1px solid var(--border-color)"
            }}>
              <div style={{ fontSize: "1.75rem", flexShrink: 0 }}>{story.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{story.title}</div>
                <div className="tb-detail-value">{story.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live KPI Grid */}
      <div className="tb-section">
        <h2 className="tb-section-title">Live Platform Metrics</h2>
        <div className="tb-grid-4" style={{ marginTop: "0.75rem" }}>
          {[
            { label: "Total Assets", value: snap?.totalAssets, sub: "managed", color: "#3b82f6" },
            { label: "PM Coverage", value: `${snap?.pmCoverage?.toFixed(0)}%`, sub: "of assets", color: "#22c55e" },
            { label: "SLA Breached", value: snap?.slaBreached, sub: "open WOs", color: "#ef4444" },
            { label: "WO Backlog", value: snap?.backlogOpen, sub: `max ${snap?.backlogMaxAge}d`, color: "#f97316" },
            { label: "Suppliers", value: snap?.suppliersScored, sub: "scored", color: "#8b5cf6" },
            { label: "PM Plans", value: "257+", sub: "active", color: "#06b6d4" },
            { label: "Pending POs", value: "247+", sub: "awaiting approval", color: "#eab308" },
            { label: "Risk Level", value: snap?.riskLevel, sub: `${snap?.riskScore?.toFixed(0)}/100`, color: "#22c55e" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="tb-kpi" style={{ borderTop: `3px solid ${color}` }}>
              <div className="tb-kpi-label">{label}</div>
              <div className="tb-kpi-value" style={{ color }}>{value ?? "—"}</div>
              <div className="tb-detail-value">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
