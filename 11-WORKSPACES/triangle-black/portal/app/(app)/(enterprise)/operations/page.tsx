"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  PageHeader, PageWrapper, LoadingState, AlertBanner,
} from "@/components/ui";
import { executiveApi } from "@/lib/api/enterprise";
import { Wrench, MapPin, Clock, Calendar, GitBranch,
  LayoutDashboard, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";

const MODULES = [
  { label: "Workbench",        href: "/operations/workbench",        icon: LayoutDashboard, desc: "Daily command center", highlight: true },
  { label: "Work Orders",      href: "/operations/work-orders",      icon: Wrench,          desc: "All work orders and history" },
  { label: "New Work Order",   href: "/operations/work-orders/new",  icon: Wrench,          desc: "Create a new work order" },
  { label: "Dispatch Board",   href: "/operations/dispatch",         icon: MapPin,          desc: "Assign technicians to jobs" },
  { label: "Service Requests", href: "/operations/service-requests", icon: Wrench,          desc: "Incoming service requests" },
  { label: "SLA Review",       href: "/operations/sla-review",       icon: Clock,           desc: "SLA compliance monitoring" },
  { label: "Calendar",         href: "/operations/calendar",         icon: Calendar,        desc: "Schedule & calendar view" },
  { label: "Workflows",        href: "/operations/workflows",        icon: GitBranch,       desc: "Approval workflows" },
];

export default function OperationsPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["exec-dashboard-ops"],
    queryFn:  () => executiveApi.dashboard(),
    refetchInterval: 60_000,
  });

  const kpis = data?.data?.kpis || {};

  const metrics = [
    { label: "Open WOs",     value: kpis.open_work_orders  ?? 0, color: "bg-amber-50 border-amber-100",   val: "text-amber-700" },
    { label: "In Progress",  value: kpis.open_work_orders  ?? 0, color: "bg-indigo-50 border-indigo-100", val: "text-indigo-700" },
    { label: "Technicians",  value: data?.data?.kpis?.won_leads ?? 0, color: "bg-emerald-50 border-emerald-100", val: "text-emerald-700" },
    { label: "Critical",     value: 0,                            color: "bg-slate-50 border-slate-200",   val: "text-slate-900" },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Operations Center"
        subtitle="Work orders, dispatch, SLA and field execution"
        badge="OPS"
        actions={
          <button onClick={() => { refetch(); toast.success("Refreshed"); }}
            disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {isLoading ? <LoadingState type="cards" rows={4} cols={4} /> : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metrics.map(m => (
            <div key={m.label} className={"rounded-2xl border p-4 " + m.color}>
              <div className={"text-2xl font-bold " + m.val}>{m.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MODULES.map(mod => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}
              className={
                "group rounded-2xl border p-5 hover:shadow-sm transition-all " +
                (mod.highlight
                  ? "bg-amber-50 border-amber-200 hover:border-amber-400"
                  : "bg-white border-slate-200 hover:border-amber-300")
              }>
              <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-3 " + (mod.highlight ? "bg-amber-200" : "bg-slate-100 group-hover:bg-amber-50")}>
                <Icon className={"w-5 h-5 " + (mod.highlight ? "text-amber-700" : "text-slate-500 group-hover:text-amber-600")} />
              </div>
              <p className="font-semibold text-sm text-slate-900">{mod.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{mod.desc}</p>
              <ArrowRight className={"w-4 h-4 mt-3 transition-colors " + (mod.highlight ? "text-amber-500" : "text-slate-300 group-hover:text-amber-500")} />
            </Link>
          );
        })}
      </div>
    </PageWrapper>
  );
}
