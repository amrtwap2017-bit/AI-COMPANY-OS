"use client";
import React from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "brand"
  | "neutral"
  | "critical";

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

export function StatusBadge({ status, variant, className = "" }: StatusBadgeProps) {
  // Infer variant from status name if not explicitly passed
  const getVariant = (): BadgeVariant => {
    if (variant) return variant;
    const s = String(status || "").toLowerCase();
    if (["active", "completed", "paid", "operational", "healthy", "ok", "approved"].includes(s)) return "success";
    if (["pending", "in_progress", "triaged", "sent", "maintenance"].includes(s)) return "warning";
    if (["critical", "overdue", "rejected", "in fault", "sla_breached"].includes(s)) return "danger";
    if (["open", "assigned", "draft"].includes(s)) return "info";
    if (["brand", "governed", "ai"].includes(s)) return "brand";
    return "neutral";
  };

  const v = getVariant();

  const variantStyles: Record<BadgeVariant, string> = {
    success: "bg-success-bg text-success-text border-success-border",
    warning: "bg-warning-bg text-warning-text border-warning-border",
    danger: "bg-danger-bg text-danger-text border-danger-border",
    critical: "bg-danger-bg text-danger-text border-danger-border animate-pulse",
    info: "bg-info-bg text-info-text border-info-border",
    brand: "bg-brand-light text-brand border-brand-border",
    neutral: "bg-surface-alt text-secondary border-border"
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize transition-colors ${variantStyles[v]} ${className}`}
    >
      {String(status || "Unknown").replace(/_/g, " ")}
    </span>
  );
}
