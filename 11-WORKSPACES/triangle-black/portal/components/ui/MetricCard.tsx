// @ts-nocheck
import { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number | ReactNode;
  sub?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "stable" | null;
  trendValue?: string;
  color?: string;
  highlight?: string;
  onClick?: () => void;
}

const colorMap: Record<string, { icon: string; bar: string }> = {
  amber:   { icon: "bg-amber-50 text-amber-600",     bar: "bg-amber-500"   },
  blue:    { icon: "bg-blue-50 text-blue-600",       bar: "bg-blue-500"    },
  green:   { icon: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-500" },
  red:     { icon: "bg-red-50 text-red-600",         bar: "bg-red-500"     },
  slate:   { icon: "bg-slate-100 text-slate-600",    bar: "bg-slate-400"   },
  purple:  { icon: "bg-purple-50 text-purple-600",   bar: "bg-purple-500"  },
  orange:  { icon: "bg-orange-50 text-orange-600",   bar: "bg-orange-500"  },
};

export function MetricCard({
  label,
  value,
  sub,
  icon,
  trend,
  trendValue,
  color = "amber",
  highlight,
  onClick,
}: Props) {
  const c = colorMap[color] ?? colorMap.amber;
  const trendColor =
    trend === "up"   ? "text-emerald-600 bg-emerald-50" :
    trend === "down" ? "text-red-600 bg-red-50"         :
                       "text-slate-500 bg-slate-50";
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-amber-300 hover:shadow-lg hover:-translate-y-0.5" : "hover:shadow-md"
      }`}
    >
      <div className={`h-0.5 w-full ${c.bar} opacity-60`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-none">
            {label}
          </span>
          {icon && (
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
              <span className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>
            </div>
          )}
        </div>
        <div className="text-[1.75rem] font-bold text-slate-900 leading-none tracking-tight mb-3">
          {value}
        </div>
        <div className="flex items-center gap-2 min-h-[20px]">
          {trendValue && trend && (
            <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${trendColor}`}>
              {trendIcon} {trendValue}
            </span>
          )}
          {highlight && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
              {highlight}
            </span>
          )}
          {sub && <span className="text-[11px] text-slate-400 truncate">{sub}</span>}
        </div>
      </div>
    </div>
  );
}
