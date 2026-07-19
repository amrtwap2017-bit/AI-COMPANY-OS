type KpiCardProps = {
  label: string;
  value: string;
  trend: string;
  accent?: "amber" | "blue" | "green" | "red" | "purple" | "slate";
};

const accentMap: Record<string, { bar: string; value: string }> = {
  amber:  { bar: "from-amber-400 to-orange-500",   value: "text-amber-600" },
  blue:   { bar: "from-blue-400 to-blue-600",       value: "text-blue-600" },
  green:  { bar: "from-emerald-400 to-emerald-600", value: "text-emerald-600" },
  red:    { bar: "from-red-400 to-red-600",         value: "text-red-600" },
  purple: { bar: "from-purple-400 to-purple-600",   value: "text-purple-600" },
  slate:  { bar: "from-slate-400 to-slate-600",     value: "text-slate-700" },
};

export function KpiCard({ label, value, trend, accent = "amber" }: KpiCardProps) {
  const a = accentMap[accent];
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
      <div className={`h-0.5 w-full bg-gradient-to-r ${a.bar}`} />
      <div className="p-5">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</div>
        <div className={`mt-3 text-2xl font-bold tracking-tight sm:text-3xl ${a.value}`}>{value}</div>
        <div className="mt-2 text-xs text-slate-500 leading-relaxed">{trend}</div>
      </div>
    </div>
  );
}
