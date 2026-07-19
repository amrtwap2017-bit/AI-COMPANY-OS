import { Zap, TrendingUp, AlertTriangle } from "lucide-react";

type AIInsight = { title: string; detail: string; severity?: "info" | "success" | "warning"; recommendation?: string };
type AIInsightPanelProps = { title: string; subtitle: string; insights: AIInsight[] };

const severityMap = {
  info:    { card: "border-blue-200 bg-blue-50/60",     icon: Zap,         iconBg: "bg-blue-100 text-blue-600",     rec: "text-blue-700" },
  success: { card: "border-emerald-200 bg-emerald-50/60", icon: TrendingUp, iconBg: "bg-emerald-100 text-emerald-600", rec: "text-emerald-700" },
  warning: { card: "border-amber-200 bg-amber-50/60",   icon: AlertTriangle, iconBg: "bg-amber-100 text-amber-600",  rec: "text-amber-700" },
};

export function AIInsightPanel({ title, subtitle, insights }: AIInsightPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {insights.map((item) => {
          const s = severityMap[item.severity ?? "info"];
          const Icon = s.icon;
          return (
            <div key={item.title} className={`rounded-xl border p-4 ${s.card}`}>
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${s.iconBg}`}>
                  <Icon className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.detail}</p>
                  {item.recommendation && (
                    <div className={`mt-2 text-xs font-semibold ${s.rec}`}>→ {item.recommendation}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
