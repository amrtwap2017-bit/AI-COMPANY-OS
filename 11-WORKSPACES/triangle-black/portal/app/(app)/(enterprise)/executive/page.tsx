"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  PageHeader, PageWrapper, LoadingState, AlertBanner, SectionCard,
} from "@/components/ui";
import { executiveApi } from "@/lib/api/enterprise";
import { TrendingUp, Briefcase, FileWarning, ShoppingCart,
  Wrench, Users, AlertTriangle, RefreshCw, ArrowRight } from "lucide-react";
import { fmtCurrency } from "@/lib/design-tokens";
import { toast } from "@/lib/toast";

export default function ExecutivePage() {
  const { data: dashData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["executive-dashboard"],
    queryFn:  () => executiveApi.dashboard(),
    refetchInterval: 60_000,
  });

  const { data: alertsData } = useQuery({
    queryKey: ["executive-alerts"],
    queryFn:  () => executiveApi.alerts(),
  });

  const kpis = dashData?.data?.kpis || {};
  const alerts = alertsData?.data?.alerts || [];

  const metrics = [
    { label: "Active Leads",      value: kpis.active_leads      ?? "—", icon: TrendingUp,   color: "blue",    href: "/leads" },
    { label: "Active Contracts",  value: kpis.active_contracts  ?? "—", icon: Briefcase,    color: "emerald", href: "/contracts" },
    { label: "Open Work Orders",  value: kpis.open_work_orders  ?? "—", icon: Wrench,       color: "amber",   href: "/work-orders" },
    { label: "Overdue Invoices",  value: kpis.overdue_invoices  ?? "—", icon: FileWarning,  color: (kpis.overdue_invoices ?? 0) > 0 ? "red" : "slate", href: "/invoices" },
    { label: "Pending POs",       value: kpis.pending_pos       ?? "—", icon: ShoppingCart, color: "amber",   href: "/supply-chain/purchase-orders" },
    { label: "Revenue Collected", value: kpis.revenue_collected ? fmtCurrency(kpis.revenue_collected) : "—", icon: TrendingUp, color: "emerald", href: "/analytics" },
  ];

  const colorMap: Record<string, string> = {
    blue:    "bg-blue-50 text-blue-700 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber:   "bg-amber-50 text-amber-700 border-amber-100",
    red:     "bg-red-50 text-red-700 border-red-100",
    slate:   "bg-slate-50 text-slate-700 border-slate-200",
  };

  const MODULES = [
    { label: "Intelligence",  href: "/executive/intelligence",  desc: "AI signals and enterprise intelligence" },
    { label: "Portfolio",     href: "/executive/portfolio",     desc: "Contract portfolio and revenue base" },
    { label: "Risks",         href: "/executive/risks",         desc: "Enterprise risk signals" },
    { label: "Exceptions",    href: "/executive/exceptions",    desc: "Items requiring leadership action" },
    { label: "Daily Review",  href: "/executive/daily-review",  desc: "Today's summary and signals" },
    { label: "Reports",       href: "/executive/reports",       desc: "Executive report suite" },
    { label: "Workbench",     href: "/executive/workbench",     desc: "Daily leadership workbench" },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Executive Center"
        subtitle="Revenue, risk, portfolio and decisions"
        badge="EXEC"
        actions={
          <button onClick={() => { refetch(); toast.success("Refreshed"); }}
            disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {isLoading ? <LoadingState type="cards" rows={6} cols={3} /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {metrics.map(m => {
            const Icon = m.icon;
            const cls = colorMap[m.color] || colorMap.slate;
            return (
              <Link key={m.label} href={m.href}
                className={"rounded-2xl border p-5 hover:shadow-sm transition-all " + cls}>
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-5 h-5 opacity-70" />
                  <ArrowRight className="w-4 h-4 opacity-40" />
                </div>
                <div className="text-2xl font-bold">{m.value}</div>
                <div className="text-xs font-medium mt-1 opacity-80">{m.label}</div>
              </Link>
            );
          })}
        </div>
      )}

      {alerts.length > 0 && (
        <SectionCard title="Active Alerts" subtitle={alerts.length + " items requiring attention"}>
          <div className="space-y-2">
            {alerts.map((alert: any) => (
              <div key={alert.id}
                className={"flex items-start gap-3 p-3 rounded-xl border " +
                  (alert.severity === "high" || alert.severity === "critical"
                    ? "bg-red-50 border-red-200"
                    : alert.severity === "medium"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-slate-50 border-slate-200")}>
                <AlertTriangle className={"w-4 h-4 flex-shrink-0 mt-0.5 " +
                  (alert.severity === "high" || alert.severity === "critical" ? "text-red-500" : "text-amber-500")} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{alert.message}</p>
                </div>
                <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full capitalize " +
                  (alert.severity === "high" || alert.severity === "critical"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700")}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MODULES.map(mod => (
          <Link key={mod.href} href={mod.href}
            className="group bg-white rounded-2xl border border-slate-200 p-4 hover:border-amber-300 hover:shadow-sm transition-all">
            <p className="font-semibold text-sm text-slate-900 group-hover:text-amber-700">{mod.label}</p>
            <p className="text-xs text-slate-400 mt-1">{mod.desc}</p>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 mt-2 transition-colors" />
          </Link>
        ))}
      </div>
    </PageWrapper>
  );
}
