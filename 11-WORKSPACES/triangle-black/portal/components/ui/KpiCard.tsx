"use client";
// @ts-nocheck
// Triangle Black — Enterprise KPI Card v2.0
// Uses TBEDS design tokens — never hardcoded colors

import { useRouter } from "next/navigation";

type KpiColor = "blue" | "emerald" | "amber" | "red" | "purple" | "orange" | "cyan" | "slate" | "brand";
type KpiStatus = "ok" | "warn" | "critical" | "neutral";

interface KpiCardProps {
  label:   string;
  value:   string | number;
  sub?:    string;
  color?:  KpiColor;
  icon?:   string;
  trend?:  { value: number; label: string };
  onClick?: () => void;
  href?:   string;
  size?:   "sm" | "md" | "lg";
  status?: KpiStatus;
}

const COLOR_MAP: Record<KpiColor, string> = {
  blue:    "text-blue-500",
  emerald: "text-emerald-500",
  amber:   "text-amber-500",
  red:     "text-red-500",
  purple:  "text-purple-500",
  orange:  "text-orange-500",
  cyan:    "text-cyan-500",
  slate:   "text-secondary",
  brand:   "text-brand",
};

const STATUS_RING: Record<KpiStatus, string> = {
  ok:       "border-success/30",
  warn:     "border-warning/30",
  critical: "border-danger/30",
  neutral:  "border-border",
};

const VALUE_SIZE: Record<string, string> = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl",
};

export function KpiCard({
  label, value, sub, color = "slate", icon, trend,
  onClick, href, size = "md", status = "neutral",
}: KpiCardProps) {
  const router = useRouter();
  const isClickable = !!(onClick || href);

  const handleClick = () => {
    if (onClick) onClick();
    else if (href) router.push(href);
  };

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={[
        "bg-surface border rounded-2xl p-5 transition-all duration-base",
        STATUS_RING[status],
        isClickable
          ? "cursor-pointer hover:border-brand hover:shadow-md group"
          : "",
      ].join(" ")}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <div className="text-xs font-medium text-secondary leading-tight">{label}</div>
        {icon && <span className="text-xl leading-none">{icon}</span>}
        {status === "critical" && <span className="text-xs text-danger">●</span>}
        {status === "warn"     && <span className="text-xs text-warning">●</span>}
        {status === "ok"       && <span className="text-xs text-success">●</span>}
      </div>

      {/* Value */}
      <div className={[
        "font-black leading-none",
        VALUE_SIZE[size] || VALUE_SIZE.md,
        COLOR_MAP[color],
        isClickable ? "group-hover:scale-105 transition-transform origin-left" : "",
      ].join(" ")}>
        {value}
      </div>

      {/* Sub */}
      {sub && (
        <div className="text-2xs text-tertiary mt-1 truncate">{sub}</div>
      )}

      {/* Trend */}
      {trend && (
        <div className={[
          "text-2xs font-medium mt-2 flex items-center gap-1",
          trend.value >= 0 ? "text-success" : "text-danger",
        ].join(" ")}>
          <span>{trend.value >= 0 ? "↑" : "↓"}</span>
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </div>
  );
}

export default KpiCard;
