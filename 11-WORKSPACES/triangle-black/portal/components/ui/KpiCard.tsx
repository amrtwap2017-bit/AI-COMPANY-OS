"use client";
// @ts-nocheck
// Triangle Black — Enterprise KPI Card
// Usage: <KpiCard label="Open WOs" value={57} sub="4 in progress" color="blue" onClick={...} />

import { useRouter } from "next/navigation";

type KpiColor = "blue" | "emerald" | "amber" | "red" | "purple" | "orange" | "cyan" | "slate";

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: KpiColor;
  icon?: string;
  trend?: { value: number; label: string };
  onClick?: () => void;
  href?: string;
  size?: "sm" | "md" | "lg";
  status?: "ok" | "warn" | "critical";
}

const COLOR_MAP: Record<KpiColor, string> = {
  blue:    "text-blue-500",
  emerald: "text-emerald-500",
  amber:   "text-amber-500",
  red:     "text-red-500",
  purple:  "text-purple-500",
  orange:  "text-orange-500",
  cyan:    "text-cyan-500",
  slate:   "text-slate-500",
};

const BORDER_MAP: Record<KpiColor, string> = {
  blue:    "hover:border-blue-400",
  emerald: "hover:border-emerald-400",
  amber:   "hover:border-amber-400",
  red:     "hover:border-red-400",
  purple:  "hover:border-purple-400",
  orange:  "hover:border-orange-400",
  cyan:    "hover:border-cyan-400",
  slate:   "hover:border-slate-400",
};

const VALUE_SIZE: Record<string, string> = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl",
};

export function KpiCard({ label, value, sub, color = "slate", icon, trend, onClick, href, size = "md", status }: KpiCardProps) {
  const router = useRouter();
  const isClickable = !!(onClick || href);

  const handleClick = () => {
    if (onClick) onClick();
    else if (href) router.push(href);
  };

  const statusBorder = status === "critical" ? "border-red-200 bg-red-50/30 dark:bg-red-900/10" :
                       status === "warn"     ? "border-amber-200 bg-amber-50/30 dark:bg-amber-900/10" :
                       status === "ok"       ? "border-emerald-200 bg-emerald-50/30 dark:bg-emerald-900/10" : "";

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 transition-all ${statusBorder} ${isClickable ? `cursor-pointer ${BORDER_MAP[color]} hover:shadow-lg group` : ""}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-xs font-medium text-slate-500 leading-tight">{label}</div>
        {icon && <span className="text-xl">{icon}</span>}
        {status === "critical" && <span className="text-xs font-bold text-red-500">●</span>}
        {status === "warn"     && <span className="text-xs font-bold text-amber-500">●</span>}
        {status === "ok"       && <span className="text-xs font-bold text-emerald-500">●</span>}
      </div>

      <div className={`font-black ${VALUE_SIZE[size] || VALUE_SIZE.md} ${COLOR_MAP[color]} ${isClickable ? "group-hover:scale-105 transition-transform origin-left" : ""}`}>
        {value}
      </div>

      {sub && (
        <div className="text-xs text-slate-400 mt-1 truncate">{sub}</div>
      )}

      {trend && (
        <div className={`text-xs font-medium mt-2 ${trend.value >= 0 ? "text-emerald-600" : "text-red-600"}`}>
          {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
  );
}

export default KpiCard;
