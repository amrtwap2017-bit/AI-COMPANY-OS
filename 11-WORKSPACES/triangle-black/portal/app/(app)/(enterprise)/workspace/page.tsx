"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { executiveApi } from "@/lib/api/enterprise";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import {
  LoadingState, AlertBanner, PageWrapper,
  SectionCard,
} from "@/components/ui";
import { fmtCurrency } from "@/lib/design-tokens";
import { enterpriseCenters } from "@/components/workspace/nav";
import {
  TrendingUp, Users, Wrench, Package, BarChart3, Zap, Activity,
  DollarSign, FolderKanban, ArrowRight, CheckSquare, Shield,
  RefreshCw, AlertTriangle, AlertCircle, Info,
} from "lucide-react";
import { toast } from "@/lib/toast";

const centerIcons = {
  workspace:BarChart3, executive:TrendingUp, customers:Users,
  commercial:DollarSign, operations:Activity, "supply-chain":Package,
  engineering:Wrench, maintenance:Wrench, ai:Zap, analytics:BarChart3,
  "projects-center":FolderKanban, administration:Shield, approvals:CheckSquare,
};

const centerColors = {
  workspace:"bg-slate-700", executive:"bg-emerald-700", customers:"bg-blue-700",
  commercial:"bg-amber-700", operations:"bg-orange-700", "supply-chain":"bg-yellow-700",
  engineering:"bg-purple-700", maintenance:"bg-red-700", ai:"bg-amber-600",
  analytics:"bg-cyan-700", "projects-center":"bg-indigo-700",
  administration:"bg-slate-600", approvals:"bg-emerald-600",
};

const SIGNAL_ICONS = { critical: AlertTriangle, high: AlertCircle, medium: Info, low: Info };
const SIGNAL_COLORS = {
  critical: "bg-red-50 border-red-200 text-red-700",
  high:     "bg-amber-50 border-amber-200 text-amber-700",
  medium:   "bg-blue-50 border-blue-200 text-blue-700",
  low:      "bg-slate-50 border-slate-200 text-slate-600",
};

export default function WorkspacePage() {
  const { user } = useAuth();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";

  const { data: execData, isLoading: execLoading, refetch, isFetching } = useQuery({
    queryKey: ["exec-dashboard"],
    queryFn:  () => executiveApi.dashboard(),
    refetchInterval: 60_000,
  });

  const { data: signalsData, isLoading: sigLoading, refetch: refetchSig } = useQuery({
    queryKey: ["ai-signals"],
    queryFn: async () => {
      const res = await authFetch("/api/v1/ai/signals");
      if (!res.ok) return { signals: [], total: 0 };
      return res.json();
    },
    refetchInterval: 120_000,
  });

  const kpis = execData?.data?.kpis || {};
  const signals = signalsData?.signals || [];
  const centers = enterpriseCenters.filter(c => c.key !== "workspace" && c.key !== "agents" && c.key !== "reports");

  const metrics = [
    { label:"Active Leads",     value: kpis.active_leads     ?? "—", color:"blue",    href:"/leads" },
    { label:"Open Work Orders", value: kpis.open_work_orders ?? "—", color:"amber",   href:"/operations/work-orders" },
    { label:"Active Contracts", value: kpis.active_contracts ?? "—", color:"emerald", href:"/contracts" },
    { label:"Pending Approvals",value: kpis.pending_pos      ?? "—", color: "red",    href:"/approvals" },
  ];

  const colorMap = {
    blue:    "bg-blue-50 border-blue-100 text-blue-700",
    amber:   "bg-amber-50 border-amber-100 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    red:     "bg-red-50 border-red-100 text-red-700",
    slate:   "bg-white border-slate-200 text-slate-900",
  };

  return (
    <PageWrapper showBreadcrumb={false}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting}, {firstName}</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            {now.toLocaleDateString("en-GB", {weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            {" · "}Triangle Black Enterprise Platform
          </p>
        </div>
        <button onClick={() => { refetch(); refetchSig(); toast.success("Refreshed"); }}
          disabled={isFetching} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
          <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
        </button>
      </div>

      {execLoading ? <LoadingState type="cards" rows={4} cols={4} /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map(m => (
            <Link key={m.label} href={m.href}
              className={"rounded-2xl border p-4 hover:shadow-sm transition-all " + (colorMap[m.color] || colorMap.slate)}>
              <div className="text-3xl font-bold">{m.value}</div>
              <div className="text-sm font-medium mt-1">{m.label}</div>
            </Link>
          ))}
        </div>
      )}

      {signals.length > 0 && (
        <SectionCard title={"AI Signals (" + signals.length + ")"}
          subtitle="Automated intelligence requiring your attention">
          <div className="space-y-2">
            {signals.slice(0, 6).map((sig) => {
              const Icon = SIGNAL_ICONS[sig.level] || Info;
              const cls  = SIGNAL_COLORS[sig.level] || SIGNAL_COLORS.low;
              return (
                <Link key={sig.id} href={sig.endpoint || "/workspace"}
                  className={"flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm " + cls}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{sig.title}</p>
                    <p className="text-xs opacity-70 mt-0.5">{sig.action}</p>
                  </div>
                  <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full uppercase opacity-70"}>
                    {sig.level}
                  </span>
                </Link>
              );
            })}
          </div>
        </SectionCard>
      )}

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
                  <p className="font-semibold text-sm text-slate-900 group-hover:text-amber-700">
                    {center.shortLabel || center.label}
                  </p>
                  {center.badge && (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                      {center.badge}
                    </span>
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
