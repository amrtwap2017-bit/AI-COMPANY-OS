// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { executiveApi, approvalsApi } from "@/lib/api/enterprise";
import {
  TrendingUp, Users, Wrench, Package, BarChart3,
  Zap, Activity, DollarSign, FolderKanban,
  ArrowRight, CheckSquare, Shield, RefreshCw,
  Bell, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { LoadingState, AlertBanner, PageWrapper } from "@/components/ui";
import { fmtCurrency } from "@/lib/design-tokens";
import { enterpriseCenters } from "@/components/workspace/nav";

const centerIcons: Record<string, any> = {
  workspace: BarChart3, executive: TrendingUp, customers: Users,
  commercial: DollarSign, operations: Activity, "supply-chain": Package,
  engineering: Wrench, maintenance: Wrench, ai: Zap, analytics: BarChart3,
  "projects-center": FolderKanban, administration: Shield, approvals: CheckSquare,
};

const centerColors: Record<string, string> = {
  workspace:"bg-slate-700", executive:"bg-emerald-700", customers:"bg-blue-700",
  commercial:"bg-amber-700", operations:"bg-orange-700", "supply-chain":"bg-yellow-700",
  engineering:"bg-purple-700", maintenance:"bg-red-700", ai:"bg-amber-600",
  analytics:"bg-cyan-700", "projects-center":"bg-indigo-700",
  administration:"bg-slate-600", approvals:"bg-emerald-600",
};

export default function WorkspacePage() {
  const { user } = useAuth();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";

  const { data: execData, isLoading: execLoading, refetch } = useQuery({
    queryKey: ["exec-dashboard"],
    queryFn:  () => executiveApi.dashboard(),
    refetchInterval: 60_000,
  });

  const { data: alertsData } = useQuery({
    queryKey: ["predictive-alerts"],
    queryFn:  () => executiveApi.alerts(),
    refetchInterval: 120_000,
  });

  const { data: approvalsData } = useQuery({
    queryKey: ["approvals-count"],
    queryFn:  () => approvalsApi.count(),
    refetchInterval: 60_000,
  });

  const kpis = execData?.data?.kpis || {};
  const alerts = (alertsData?.data?.alerts || []).slice(0, 3);
  const approvalCount = approvalsData?.data?.total || 0;

  const metrics = [
    { label:"Active Leads",     value: kpis.active_leads     ?? "—", sub:"in pipeline",    color:"blue"    as const },
    { label:"Open Work Orders", value: kpis.open_work_orders ?? "—", sub:"need attention", color:"amber"   as const },
    { label:"Active Contracts", value: kpis.active_contracts ?? "—", sub:"revenue base",   color:"emerald" as const },
    { label:"Pending Approvals",value: approvalCount,                 sub:"awaiting action",color: approvalCount > 0 ? "red" as const : "slate" as const },
  ];

  // Filter centers for display (exclude workspace itself)
  const centers = enterpriseCenters.filter(c => c.key !== "workspace" && c.key !== "agents" && c.key !== "reports");

  return (
    <PageWrapper showBreadcrumb={false}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting}, {firstName}</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            {now.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            {" · "}Triangle Black Enterprise Platform
          </p>
        </div>
        <button onClick={() => refetch()} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Strip */}
      {execLoading ? <LoadingState type="cards" rows={4} cols={4} /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map(m => {
            const colorMap: Record<string,string> = {
              blue:"bg-blue-50 border-blue-100", amber:"bg-amber-50 border-amber-100",
              emerald:"bg-emerald-50 border-emerald-100", red:"bg-red-50 border-red-100",
              slate:"bg-white border-slate-200",
            };
            const valColor: Record<string,string> = {
              blue:"text-blue-700", amber:"text-amber-700",
              emerald:"text-emerald-700", red:"text-red-700", slate:"text-slate-900",
            };
            return (
              <div key={m.label} className={"rounded-2xl border p-4 " + (colorMap[m.color] || colorMap.slate)}>
                <div className={"text-3xl font-bold " + (valColor[m.color] || "text-slate-900")}>{m.value}</div>
                <div className="text-sm font-medium text-slate-700 mt-1">{m.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{m.sub}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert: any) => (
            <div key={alert.id} className={"flex items-center gap-3 p-4 rounded-2xl border " + (alert.severity === "high" ? "bg-red-50 border-red-200" : alert.severity === "medium" ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200")}>
              <AlertTriangle className={"w-4 h-4 flex-shrink-0 " + (alert.severity === "high" ? "text-red-500" : "text-amber-500")} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                <p className="text-xs text-slate-500">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enterprise Centers Grid */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Enterprise Centers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {centers.map(center => {
            const Icon = centerIcons[center.key] || BarChart3;
            const bg   = centerColors[center.key] || "bg-slate-700";
            return (
              <Link key={center.key} href={center.href}
                className="group bg-white rounded-2xl border border-slate-200 p-4 hover:border-amber-300 hover:shadow-sm transition-all">
                <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-3 " + bg}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                    {center.shortLabel || center.label}
                  </p>
                  {center.badge && (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{center.badge}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{center.subtitle}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
