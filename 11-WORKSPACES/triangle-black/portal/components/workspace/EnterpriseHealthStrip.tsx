import { CheckCircle, AlertTriangle, Activity } from "lucide-react";

type HealthItem = { label: string; value: string; tone?: "neutral" | "success" | "warning" };
type EnterpriseHealthStripProps = { title: string; subtitle: string; items: HealthItem[] };

const toneMap = {
  success: { card: "border-emerald-200 bg-emerald-50", value: "text-emerald-700", icon: CheckCircle, iconColor: "text-emerald-500" },
  warning: { card: "border-amber-200 bg-amber-50",     value: "text-amber-700",   icon: AlertTriangle, iconColor: "text-amber-500" },
  neutral: { card: "border-slate-200 bg-slate-50",     value: "text-slate-800",   icon: Activity, iconColor: "text-slate-400" },
};

export function EnterpriseHealthStrip({ title, subtitle, items }: EnterpriseHealthStripProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const t = toneMap[item.tone ?? "neutral"];
          const Icon = t.icon;
          return (
            <div key={item.label} className={`rounded-xl border p-4 ${t.card}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{item.label}</span>
                <Icon className={`w-3.5 h-3.5 ${t.iconColor}`} />
              </div>
              <div className={`text-2xl font-bold tracking-tight ${t.value}`}>{item.value}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
