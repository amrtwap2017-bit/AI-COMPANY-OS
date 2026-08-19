"use client";
// @ts-nocheck
// Triangle Black V7 — Enterprise Workspace Header
// THE universal page header — replaces all inline dark hero sections
// Every page gets: context + KPIs + actions + AI insight + health
// Max height: 240px desktop — users reach content immediately
import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────
interface KpiItem {
  label:  string;
  value:  string | number;
  color?: "default" | "success" | "warning" | "danger" | "info" | "ai";
  trend?: { value: number; up: boolean };
}
interface ActionItem {
  label:   string;
  icon?:   string;
  onClick?: () => void;
  href?:   string;
  variant?: "primary" | "secondary" | "ghost";
}
interface AIInsight {
  text:       string;
  action?:    string;
  onAction?:  () => void;
  type?:      "info" | "warning" | "recommendation";
}
interface HealthBadge {
  score:  number;
  label:  string;
  sub?:   string;
}
interface WorkspaceHeaderProps {
  domain:      string;
  domainColor?: string;
  title:       string;
  description?: string;
  kpis?:       KpiItem[];
  actions?:    ActionItem[];
  aiInsight?:  AIInsight;
  health?:     HealthBadge;
  tabs?:       { label: string; href: string; active?: boolean }[];
}

// ── Color maps ───────────────────────────────────────────────────
const KPI_COLOR: Record<string, string> = {
  default:        "rgba(248,250,252,0.9)",
  success:        "#34D399",
  warning:        "#FCD34D",
  danger:         "#F87171",
  info:           "#60A5FA",
  ai:             "#A78BFA",
};
const DOMAIN_ACCENT: Record<string, string> = {
  "Operations":     "#F97316",
  "Maintenance":    "#EF4444",
  "Commercial":     "#F59E0B",
  "Finance":        "#10B981",
  "Supply Chain":   "#EAB308",
  "Executive":      "#8B5CF6",
  "Analytics":      "#06B6D4",
  "Engineering":    "#3B82F6",
  "Projects":       "#6366F1",
  "Administration": "#94A3B8",
  "Platform":       "#F59E0B",
  "AI":             "#7C3AED",
};

// ── WorkspaceHeader ──────────────────────────────────────────────
export function WorkspaceHeader({
  domain, domainColor, title, description,
  kpis = [], actions = [], aiInsight, health, tabs = [],
}: WorkspaceHeaderProps) {
  const router = useRouter();
  const accent = domainColor || (DOMAIN_ACCENT as Record<string, any>)[domain] || "#F59E0B";

  const handleAction = (a: ActionItem) => {
    if (a.onClick) a.onClick();
    else if (a.href) router.push(a.href);
  };

  return (
    <div style={{
      background:   "linear-gradient(180deg, #0F172A 0%, #111827 100%)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      position:     "relative",
      overflow:     "hidden",
    }}>
      {/* Subtle accent glow — top left */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: 400, height: 200, pointerEvents: "none",
        background: `radial-gradient(ellipse at 0% 0%, ${accent}18 0%, transparent 70%)`,
      }}/>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px" }}>

        {/* ── ROW 1: Domain badge + Title + Health ─────────────── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>

          {/* Left: context */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Domain label */}
            <div style={{
              display:       "inline-flex",
              alignItems:    "center",
              gap:           6,
              marginBottom:  10,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: accent, flexShrink: 0 }} />
              <span style={{
                fontSize:      "0.625rem",
                fontWeight:    700,
                color:         accent,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}>
                {domain}
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize:      "1.75rem",
              fontWeight:    900,
              color:         "#F1F5F9",
              letterSpacing: "-0.02em",
              lineHeight:    1.15,
              margin:        0,
            }}>
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p style={{
                fontSize:   "0.8125rem",
                color:      "rgba(148,163,184,0.65)",
                marginTop:  6,
                lineHeight: 1.5,
              }}>
                {description}
              </p>
            )}
          </div>

          {/* Right: health badge */}
          {health && (
            <div style={{
              background:   health.score >= 95 ? "rgba(16,185,129,0.08)" : health.score >= 80 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
              border:       `1px solid ${health.score >= 95 ? "rgba(16,185,129,0.22)" : health.score >= 80 ? "rgba(245,158,11,0.22)" : "rgba(239,68,68,0.22)"}`,
              borderRadius: 14,
              padding:      "14px 22px",
              textAlign:    "center",
              flexShrink:   0,
              boxShadow:    health.score >= 95 ? "0 0 20px rgba(16,185,129,0.1)" : "none",
            }}>
              <div style={{
                fontSize:   "2rem",
                fontWeight: 900,
                lineHeight: 1,
                color:      health.score >= 95 ? "#34D399" : health.score >= 80 ? "#FCD34D" : "#F87171",
              }}>
                {health.score}
              </div>
              <div style={{ fontSize: "0.5625rem", color: "rgba(148,163,184,0.55)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {health.label}
              </div>
              {health.sub && (
                <div style={{ fontSize: "0.625rem", fontWeight: 700, color: health.score >= 95 ? "#34D399" : "#FCD34D", marginTop: 2 }}>
                  {health.sub}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── ROW 2: Actions ───────────────────────────────────── */}
        {actions.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            {actions.map((a: any, i: number) => {
              const isPrimary = a.variant === "primary" || (i === 0 && !a.variant);
              return (
                <button key={i} onClick={() => handleAction(a)}
                  style={{
                    padding:       "8px 16px",
                    borderRadius:  8,
                    fontSize:      "0.75rem",
                    fontWeight:    700,
                    cursor:        "pointer",
                    transition:    "all 120ms ease",
                    display:       "flex",
                    alignItems:    "center",
                    gap:           6,
                    border:        isPrimary ? "none" : "1px solid rgba(255,255,255,0.12)",
                    background:    isPrimary ? accent : "rgba(255,255,255,0.06)",
                    color:         isPrimary ? "#fff" : "rgba(248,250,252,0.8)",
                  }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.background = isPrimary ? `${accent}dd` : "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.background = isPrimary ? accent : "rgba(255,255,255,0.06)";
                  }}
                >
                  {a.icon && <span>{a.icon}</span>}
                  {a.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── ROW 3: KPI strip ─────────────────────────────────── */}
        {kpis.length > 0 && (
          <div style={{
            display:             "grid",
            gridTemplateColumns: `repeat(${Math.min(kpis.length, 8)}, 1fr)`,
            gap:                 8,
            marginTop:           16,
          }}>
            {kpis.map((kpi: any, i: any) => {
              const c = KPI_COLOR[kpi.color || "default"];
              return (
                <div key={i} style={{
                  background:    "rgba(255,255,255,0.04)",
                  border:        "1px solid rgba(255,255,255,0.07)",
                  borderRadius:  10,
                  padding:       "11px 10px",
                  textAlign:     "center",
                  backdropFilter:"blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}>
                  <div style={{
                    fontSize:   "1.25rem",
                    fontWeight: 900,
                    color:      c,
                    lineHeight: 1,
                  }}>
                    {kpi.value}
                  </div>
                  <div style={{
                    fontSize:      "0.5625rem",
                    color:         "rgba(148,163,184,0.55)",
                    marginTop:     4,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    lineHeight:    1.3,
                  }}>
                    {kpi.label}
                  </div>
                  {kpi.trend && (
                    <div style={{
                      fontSize:   "0.5625rem",
                      fontWeight: 700,
                      color:      kpi.trend.up ? "#34D399" : "#F87171",
                      marginTop:  3,
                    }}>
                      {kpi.trend.up ? "↑" : "↓"} {kpi.trend.value}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── ROW 4: AI Insight ────────────────────────────────── */}
        {aiInsight && (
          <div style={{
            marginTop:    12,
            background:   "rgba(124,58,237,0.08)",
            border:       "1px solid rgba(124,58,237,0.2)",
            borderRadius: 10,
            padding:      "10px 16px",
            display:      "flex",
            alignItems:   "center",
            gap:          12,
          }}>
            <div style={{
              width:        28, height: 28, borderRadius: 7,
              background:   "rgba(124,58,237,0.2)",
              display:      "flex", alignItems: "center", justifyContent: "center",
              flexShrink:   0, fontSize: "0.875rem",
            }}>
              {aiInsight.type === "warning" ? "⚠️" : aiInsight.type === "recommendation" ? "💡" : "🤖"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "#C4B5FD", lineHeight: 1.4 }}>
                {aiInsight.text}
              </div>
            </div>
            {aiInsight.action && (
              <button onClick={aiInsight.onAction}
                style={{
                  fontSize:   "0.6875rem", fontWeight: 700,
                  color:      "#A78BFA", background: "none",
                  border:     "1px solid rgba(124,58,237,0.3)",
                  borderRadius: 6, padding: "4px 10px",
                  cursor:     "pointer", flexShrink: 0, whiteSpace: "nowrap",
                }}>
                {aiInsight.action} →
              </button>
            )}
          </div>
        )}

        {/* ── ROW 5: Workspace tabs ────────────────────────────── */}
        {tabs.length > 0 && (
          <div style={{
            display:    "flex",
            gap:        2,
            marginTop:  14,
            borderTop:  "1px solid rgba(255,255,255,0.06)",
            paddingTop: 12,
            flexWrap:   "wrap",
          }}>
            {tabs.map((tab: any, i: any) => (
              <button key={i} onClick={() => router.push(tab.href)}
                style={{
                  padding:      "5px 12px",
                  borderRadius: 6,
                  fontSize:     "0.75rem",
                  fontWeight:   tab.active ? 700 : 500,
                  cursor:       "pointer",
                  transition:   "all 120ms ease",
                  background:   tab.active ? `${accent}20` : "transparent",
                  color:        tab.active ? accent : "rgba(148,163,184,0.6)",
                  border:       tab.active ? `1px solid ${accent}35` : "1px solid transparent",
                }}>
                {tab.label}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default WorkspaceHeader;
