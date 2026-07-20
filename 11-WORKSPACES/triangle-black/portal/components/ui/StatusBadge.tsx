// @ts-nocheck
// Triangle Black - Unified Status Badge
// Consolidates StatusPill + StatusBadge into one component

interface StatusBadgeProps {
  status:   string;
  dot?:     boolean;
  size?:    "sm" | "md";
  className?: string;
}

const STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  active:      { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  inactive:    { bg: "bg-slate-100",  text: "text-slate-500",   dot: "bg-slate-400"   },
  pending:     { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500"   },
  critical:    { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500"     },
  emergency:   { bg: "bg-red-100",    text: "text-red-800",     dot: "bg-red-600"     },
  warning:     { bg: "bg-orange-50",  text: "text-orange-700",  dot: "bg-orange-500"  },
  completed:   { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500"    },
  done:        { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  draft:       { bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400"   },
  approved:    { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  rejected:    { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500"     },
  paid:        { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  overdue:     { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500"     },
  open:        { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500"    },
  in_progress: { bg: "bg-indigo-50",  text: "text-indigo-700",  dot: "bg-indigo-500"  },
  closed:      { bg: "bg-slate-100",  text: "text-slate-500",   dot: "bg-slate-400"   },
  cancelled:   { bg: "bg-slate-100",  text: "text-slate-400",   dot: "bg-slate-300"   },
  delivered:   { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  review:      { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500"   },
  sent:        { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500"    },
  new:         { bg: "bg-purple-50",  text: "text-purple-700",  dot: "bg-purple-500"  },
  qualified:   { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500"    },
  negotiation: { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500"   },
  won:         { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  lost:        { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500"     },
  planning:    { bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-500"   },
  operational: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  low:         { bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400"   },
  medium:      { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500"    },
  high:        { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500"   },
};

const FALLBACK = { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };

export function StatusBadge({ status, dot = false, size = "sm", className = "" }: StatusBadgeProps) {
  const key = (status || "").toLowerCase().replace(/ /g, "_");
  const s = STATUS[key] || FALLBACK;
  const label = (status || "").replace(/_/g, " ");
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  return (
    <span className={"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold capitalize " + textSize + " " + s.bg + " " + s.text + " " + className}>
      {dot && <span className={"w-1.5 h-1.5 rounded-full flex-shrink-0 " + s.dot} />}
      {label}
    </span>
  );
}

export { StatusBadge as StatusPill };
