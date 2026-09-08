/**
 * Triangle Black — Shared Page State Components
 * V9-008: Reusable loading, error, empty states
 * Use these instead of custom per-page implementations
 */
"use client";
import React from "react";

// ── Loading Skeleton ─────────────────────────────────────────────────────────
export function LoadingSkeleton({ rows = 5, message = "Loading..." }: {
  rows?: number;
  message?: string;
}) {
  return (
    <div style={{ padding: 24 }}>
      <div style={{
        color: "rgba(255,255,255,0.4)",
        fontSize: 13,
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 8
      }}>
        <span style={{
          display: "inline-block",
          width: 12,
          height: 12,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.2)",
          borderTopColor: "#60a5fa",
          animation: "spin 0.8s linear infinite"
        }} />
        {message}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          height: 48,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 8,
          marginBottom: 8,
          animation: "pulse 1.5s ease-in-out infinite",
          animationDelay: `${i * 0.1}s`
        }} />
      ))}
    </div>
  );
}

// ── Error State ──────────────────────────────────────────────────────────────
export function ErrorState({ message = "Something went wrong", onRetry }: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div style={{
      padding: 48,
      textAlign: "center",
      color: "rgba(255,255,255,0.5)"
    }}>
      <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#fca5a5", marginBottom: 8 }}>
        {message}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 16,
            padding: "8px 20px",
            background: "rgba(96,165,250,0.15)",
            border: "1px solid rgba(96,165,250,0.3)",
            borderRadius: 8,
            color: "#93c5fd",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ title = "No data", description, action }: {
  title?: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void; };
}) {
  return (
    <div style={{
      padding: 48,
      textAlign: "center",
      color: "rgba(255,255,255,0.4)"
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 13, marginBottom: 16, maxWidth: 300, margin: "0 auto 16px" }}>
          {description}
        </div>
      )}
      {action && (
        <a
          href={action.href}
          onClick={action.onClick}
          style={{
            display: "inline-block",
            padding: "8px 20px",
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: 8,
            color: "#86efac",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "none"
          }}
        >
          {action.label}
        </a>
      )}
    </div>
  );
}

// ── Permission Denied ────────────────────────────────────────────────────────
export function PermissionDenied({ resource = "this resource" }: {
  resource?: string;
}) {
  return (
    <div style={{ padding: 48, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#fca5a5", marginBottom: 8 }}>
        Access Denied
      </div>
      <div style={{ fontSize: 13 }}>
        You do not have permission to access {resource}.
      </div>
    </div>
  );
}

// ── Data Quality Warning ─────────────────────────────────────────────────────
export function DataQualityBadge({ confidence, coverage }: {
  confidence: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW";
  coverage?: number;
}) {
  const colors = {
    HIGH:     { bg: "rgba(22,163,74,0.15)",  border: "rgba(22,163,74,0.4)",  text: "#86efac" },
    MEDIUM:   { bg: "rgba(234,179,8,0.15)",  border: "rgba(234,179,8,0.4)",  text: "#fde047" },
    LOW:      { bg: "rgba(234,88,12,0.15)",  border: "rgba(234,88,12,0.4)",  text: "#fdba74" },
    VERY_LOW: { bg: "rgba(220,38,38,0.15)",  border: "rgba(220,38,38,0.4)",  text: "#fca5a5" },
  };
  const c = colors[confidence] || colors.LOW;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      color: c.text
    }}>
      {confidence} CONFIDENCE
      {coverage !== undefined && ` (${Math.round(coverage * 100)}% data)`}
    </span>
  );
}
