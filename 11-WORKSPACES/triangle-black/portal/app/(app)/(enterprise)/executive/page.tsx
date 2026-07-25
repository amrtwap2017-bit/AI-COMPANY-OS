// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { AlertTriangle } from "lucide-react";
import { useUserPreferences } from "@/lib/hooks/useUserPreferences";

// Safe array extractor — handles all backend response shapes
const toArr = (d: any): any[] => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.records)) return d.records;
  return [];
};


const WIDGETS = [
  { key: "ai_signals",    label: "AI Signals",      endpoint: "/api/v1/ai/signals/v2" },
  { key: "cash_flow",     label: "Cash Flow",       endpoint: "/api/v1/analytics/cashflow" },
  { key: "sla",           label: "SLA Overview",    endpoint: "/api/v1/sla/overview" },
  { key: "pred_maint",    label: "Asset Health",    endpoint: "/api/v1/predictive-maintenance/health-scores?max_score=40" },
  { key: "kpi",           label: "KPI Summary",     endpoint: "/api/v1/executive-kpi/summary" },
  { key: "notifications", label: "Notifications",   endpoint: "/api/v1/notifications/live/count" },
  { key: "customer",      label: "Customer Success", endpoint: "/api/v1/customer-success/overview" },
];

function WidgetData({ endpoint }: { endpoint: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["exec-widget", endpoint],
    queryFn: () => authFetch(endpoint).then(r => r.json()),
    refetchInterval: 60000,
  });
  if (isLoading) return <p className="text-xs text-slate-400">Loading...</p>;
  if (!data) return <p className="text-xs text-slate-400">No data</p>;
  const keys = Object.keys(data).slice(0, 4);
  return (
    <div className="space-y-1">
      {toArr(keys).map(k => {
        const v = data[k];
        const display = typeof v === "object" ? JSON.stringify(v).slice(0,40) : String(v ?? "—");
        return (
          <div key={k} className="flex justify-between text-xs">
            <span className="text-slate-500 capitalize">{k.replace(/_/g," ")}</span>
            <span className="font-medium text-slate-800 text-right max-w-32 truncate">{display}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ExecutiveDashboardPage() {
  const { widgetVisible, toggleWidget, isSaving } = useUserPreferences("portal_user");
  const [showConfig, setShowConfig] = useState(false);

  const { data: kpis = {} } = useQuery({
    queryKey: ["exec-kpis-main"],
    queryFn: () => authFetch("/api/v1/executive-kpi/summary").then(r => r.json()),
    refetchInterval: 300000,
  });

  const { data: twin = {} } = useQuery({
    queryKey: ["exec-twin-main"],
    queryFn: () => authFetch("/api/v1/twin/state").then(r => r.json()),
    refetchInterval: 60000,
  });

  const { data: notifs = {} } = useQuery({
    queryKey: ["exec-notifs-main"],
    queryFn: () => authFetch("/api/v1/notifications/live/count").then(r => r.json()),
    refetchInterval: 30000,
  });

  const twinHealth  = twin?.health_score ?? 0;
  const twinLabel   = twin?.health_label ?? "Unknown";
  const criticalBadge = notifs?.critical ?? 0;

  const visibleWidgets = toArr(WIDGETS).filter(w => typeof widgetVisible === 'function' ? widgetVisible(w.key) : true);

  return (
    <PageWrapper>
      <PageHeader
        title="Executive Dashboard"
        subtitle={`${twinLabel} · Platform Health ${twinHealth}/100 · ${notifs?.total ?? 0} alerts`}
        badge={criticalBadge > 0 ? `${criticalBadge} critical` : "Operational"}
      />

      {/* Top KPI strip */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        {[
          { label: "Revenue (EGP)",    value: Number(kpis.revenue_egp||0).toLocaleString(),  color: "text-emerald-600" },
          { label: "WO Completion",    value: `${kpis.wo_completion_pct ?? 0}%`,             color: kpis.wo_completion_pct >= 90 ? "text-emerald-600" : "text-amber-600" },
          { label: "Platform Health",  value: `${twinHealth}/100`,                           color: twinHealth >= 70 ? "text-emerald-600" : twinHealth >= 50 ? "text-amber-600" : "text-red-600" },
          { label: "Active Alerts",    value: notifs?.badge ?? 0,                            color: (notifs?.badge ?? 0) > 0 ? "text-red-600" : "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Widget configuration toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
        >
          {showConfig ? "Done" : "⚙️ Customize Widgets"}
        </button>
      </div>

      {/* Widget configuration panel */}
      {showConfig && (
        <SectionCard title="Dashboard Widgets" className="mb-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {toArr(WIDGETS).map(w => (
              <label key={w.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={typeof widgetVisible === 'function' ? widgetVisible(w.key) : true}
                  onChange={() => toggleWidget(w.key)}
                  disabled={isSaving}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-sm text-slate-700">{w.label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Changes are saved automatically to your user preferences.
          </p>
        </SectionCard>
      )}

      {/* Dynamic widget grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {toArr(visibleWidgets).map(widget => (
          <SectionCard key={widget.key} title={widget.label}>
            <WidgetData endpoint={widget.endpoint} />
          </SectionCard>
        ))}
        {visibleWidgets.length === 0 && (
          <div className="lg:col-span-3 text-center py-12 text-slate-400">
            <p className="text-sm">All widgets hidden. Click "Customize Widgets" to show them.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
