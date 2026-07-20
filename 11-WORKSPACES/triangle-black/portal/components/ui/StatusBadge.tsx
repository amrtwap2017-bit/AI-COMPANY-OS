// @ts-nocheck
"use client";

const STATUS_COLORS: Record<string, string> = {
  active:      "bg-green-500/20 text-green-400 border-green-500/30",
  inactive:    "bg-slate-500/20 text-slate-400 border-slate-500/30",
  pending:     "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  failed:      "bg-red-500/20 text-red-400 border-red-500/30",
  new:         "bg-purple-500/20 text-purple-400 border-purple-500/30",
  qualified:   "bg-green-500/20 text-green-400 border-green-500/30",
  negotiation: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  won:         "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  lost:        "bg-red-500/20 text-red-400 border-red-500/30",
  open:        "bg-blue-500/20 text-blue-400 border-blue-500/30",
  closed:      "bg-slate-500/20 text-slate-400 border-slate-500/30",
  critical:    "bg-red-500/20 text-red-400 border-red-500/30",
  high:        "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium:      "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low:         "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

interface Props {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: Props) {
  const key    = status?.toLowerCase?.() ?? "inactive";
  const colors = STATUS_COLORS[key] ?? STATUS_COLORS.inactive;
  return (
    <span className={
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border " +
      colors + " " + className
    }>
      {status}
    </span>
  );
}
