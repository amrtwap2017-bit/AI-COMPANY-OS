// @ts-nocheck
import { XCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";

type AlertItem = {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  domain: string;
  detail: string;
  action: string;
};
type AlertCenterPanelProps = { title: string; subtitle: string; alerts: AlertItem[] };

const severityMap = {
  critical: { card: "border-red-300 bg-red-50",     icon: XCircle,       iconColor: "text-red-500",    badge: "bg-red-100 text-red-700 border-red-200" },
  high:     { card: "border-amber-300 bg-amber-50", icon: AlertTriangle, iconColor: "text-amber-500",  badge: "bg-amber-100 text-amber-700 border-amber-200" },
  medium:   { card: "border-blue-200 bg-blue-50",   icon: Info,          iconColor: "text-blue-500",   badge: "bg-blue-100 text-blue-700 border-blue-200" },
  low:      { card: "border-border bg-base-alt", icon: CheckCircle,   iconColor: "text-tertiary",  badge: "bg-surface-alt text-secondary border-border" },
};

export function AlertCenterPanel({ title, subtitle, alerts }: AlertCenterPanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-primary">{title}</h2>
          <p className="mt-0.5 text-xs text-secondary">{subtitle}</p>
        </div>
        {alerts.length > 0 && (
          <span className="rounded-full bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1">{alerts.length}</span>
        )}
      </div>
      <div className="space-y-2.5">
        {alerts.map((alert: any, i: any) => {
          const s = severityMap[alert.severity];
          const Icon = s.icon;
          return (
            <div key={`${alert.title}-${i}`} className={`rounded-xl border p-4 ${s.card}`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${s.iconColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-primary">{alert.title}</span>
                    <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.badge}`}>{alert.severity}</span>
                    <span className="rounded-md border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-secondary">{alert.domain}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-secondary leading-relaxed">{alert.detail}</p>
                  <div className="mt-2 text-xs font-medium text-amber-700">→ {alert.action}</div>
                </div>
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-tertiary">
            <CheckCircle className="w-4 h-4 text-emerald-500" /> All clear — no active alerts
          </div>
        )}
      </div>
    </section>
  );
}
