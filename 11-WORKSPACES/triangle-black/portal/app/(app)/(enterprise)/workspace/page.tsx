// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { executiveIntelligenceApi } from "@/lib/executive-intelligence-api";
import {
  TrendingUp, Users, Wrench, Package, BarChart3,
  Zap, Activity, DollarSign, FolderKanban,
  ArrowRight, ChevronRight, Bell, CheckSquare, Shield,
} from "lucide-react";
import { MetricStrip, AlertBanner, LoadingState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { fmtCurrency } from "@/lib/design-tokens";
import { enterpriseCenters } from "@/components/workspace/nav";

const centerIcons: Record<string, any> = {
  executive: TrendingUp, customers: Users, commercial: DollarSign,
  operations: Activity, "supply-chain": Package, engineering: Wrench,
  maintenance: Activity, ai: Zap, analytics: BarChart3,
  "projects-center": FolderKanban, administration: Shield, approvals: CheckSquare,
};

const centerGradients: Record<string, string> = {
  executive:        "from-emerald-600 to-emerald-800",
  customers:        "from-blue-600 to-blue-800",
  commercial:       "from-amber-600 to-amber-800",
  operations:       "from-orange-600 to-orange-800",
  "supply-chain":   "from-yellow-600 to-yellow-800",
  engineering:      "from-purple-600 to-purple-800",
  maintenance:      "from-red-600 to-red-800",
  ai:               "from-amber-500 to-amber-700",
  analytics:        "from-cyan-600 to-cyan-800",
  "projects-center":"from-indigo-600 to-indigo-800",
  administration:   "from-slate-600 to-slate-800",
  approvals:        "from-emerald-500 to-emerald-700",
};

export default function WorkspacePage() {
  const { user } = useAuth();
  const execQ = useQuery({
    queryKey: ["exec-summary"],
    queryFn: () => executiveIntelligenceApi.ceoDashboard(),
    refetchInterval: 60000,
  });
  const alertsQ = useQuery({
    queryKey: ["predictive-alerts"],
    queryFn: () => executiveIntelligenceApi.predictiveAlerts(),
  });

  const data = execQ.data || {};
  const rev = data.revenue || {};
  const comm = data.commercial || {};
  const ops = data.operations || {};
  const proc = data.procurement || {};
  const alerts = ((alertsQ.data as any)?.alerts || []).slice(0, 2);

  const summaryMetrics = [
    { label: "Revenue Pipeline",    value: fmtCurrency(rev.pipeline_value || 0),  sub: `${rev.collection_rate || 0}% collected`,                                        color: "emerald" },
    { label: "Active Contracts",    value: comm.contracts_active || 0,             sub: comm.expiring_30d > 0 ? `${comm.expiring_30d} expiring` : "All healthy",         color: comm.expiring_30d > 0 ? "amber" : "blue" },
    { label: "Open Work Orders",    value: ops.work_orders_open || 0,              sub: ops.emergency_open > 0 ? `${ops.emergency_open} emergency` : "No emergencies",   color: ops.emergency_open > 0 ? "red" : "slate" },
    { label: "Procurement Spend",   value: fmtCurrency(proc.total_spend || 0),    sub: `${proc.active_suppliers || 0} suppliers`,                                        color: "amber" },
  ];

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      <Breadcrumb/>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting}, {firstName}</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {" · "}Triangle Black Enterprise Platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/approvals"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-amber-300 hover:text-amber-700 transition-colors">
            <CheckSquare className="w-3.5 h-3.5" />
            Approvals
          </Link>
          <Link href="/executive"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 rounded-xl text-xs font-semibold text-white hover:bg-amber-600 transition-colors">
            <TrendingUp className="w-3.5 h-3.5" />
            CEO Dashboard
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert: any, i: number) => (
            <AlertBanner
              key={i}
              type={alert.severity === "critical" ? "error" : "warning"}
              title={alert.title}
              description={alert.description}
              action={<Link href="/executive" className="text-xs font-semibold underline">Review →</Link>}
            />
          ))}
        </div>
      )}

      {/* KPI Strip */}
      {execQ.isLoading
        ? <LoadingState type="cards" rows={1} cols={4} />
        : <MetricStrip metrics={summaryMetrics} cols={4} />
      }

      {/* Business Centers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Business Centers</h2>
          <span className="text-xs text-slate-400">{enterpriseCenters.length} available</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {enterpriseCenters.map(center => {
            const Icon = centerIcons[center.key] || BarChart3;
            const gradient = centerGradients[center.key] || "from-slate-600 to-slate-800";
            return (
              <Link key={center.key} href={center.href}
                className="group relative bg-white rounded-2xl border border-slate-200 p-4 hover:border-transparent hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-sm`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs font-bold text-slate-900 truncate leading-tight">{center.shortLabel || center.label}</div>
                {center.badge && (
                  <span className={`inline-flex mt-1.5 text-xs px-1.5 py-0.5 rounded-md font-semibold ${
                    center.badge === "AI"     ? "bg-amber-100 text-amber-700" :
                    center.badge === "New"    ? "bg-blue-100 text-blue-700" :
                    center.badge === "Live"   ? "bg-emerald-100 text-emerald-700" :
                    center.badge === "Inbox"  ? "bg-purple-100 text-purple-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>{center.badge}</span>
                )}
                <ChevronRight className="absolute bottom-3 right-3 w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Quick Actions</div>
          <div className="space-y-1">
            {[
              { label: "New Work Order",         href: "/operations/work-orders" },
              { label: "New Lead",               href: "/commercial" },
              { label: "New Purchase Request",   href: "/supply-chain/purchase-requests" },
              { label: "View Pending Approvals", href: "/approvals" },
            ].map(action => (
              <Link key={action.label} href={action.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                <span className="text-sm text-slate-700 font-medium">{action.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">System Status</div>
          <div className="space-y-3">
            {[
              { label: "Backend API",    status: "operational", color: "emerald" },
              { label: "Database",       status: "operational", color: "emerald" },
              { label: "AI Engine",      status: "operational", color: "emerald" },
              { label: "Notifications",  status: "operational", color: "emerald" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full bg-${item.color}-500`} />
                  <span className={`text-xs font-medium text-${item.color}-600 capitalize`}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl bg-amber-700 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">AI Assistant</div>
          </div>
          <div className="text-sm text-slate-300 mb-4 leading-relaxed">
            Ask anything about your operations. Grounded answers from your live data.
          </div>
          <div className="space-y-1.5 mb-4">
            {[
              "What is our collection rate?",
              "Show maintenance status",
              "Which suppliers are preferred?",
            ].map(q => (
              <Link key={q} href="/ai"
                className="block text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors truncate">
                "{q}"
              </Link>
            ))}
          </div>
          <Link href="/ai"
            className="flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors">
            Open AI Center <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
