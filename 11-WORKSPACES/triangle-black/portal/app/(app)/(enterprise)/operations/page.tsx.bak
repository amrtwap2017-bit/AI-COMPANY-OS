"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { analyticsApi } from "@/lib/analytics-api";
import { PageHeader, MetricStrip, LoadingState, Button } from "@/components/ui";
import {
  LayoutDashboard, ClipboardList, Wrench, MapPin,
  Timer, Calendar, GitBranch, RefreshCw
} from "lucide-react";

export default function OperationsPage() {
  const kpiQ = useQuery({ queryKey:["ops-kpis"], queryFn:()=>analyticsApi.operationalKpis() });
  const kpis = kpiQ.data?.kpis || [];

  const metrics = kpis.slice(0,4).map((k:any) => ({
    label: k.label, value: k.value ?? "—",
    sub: k.unit && k.unit !== "WOs" && k.unit !== "tickets" ? k.unit : undefined,
    color: k.status === "critical" ? "red" : k.status === "warning" ? "amber" : "slate",
  }));

  const modules = [
    { label: "Operations Workbench", href: "/operations/workbench", icon: LayoutDashboard, desc: "Real-time command center for engineering ops", highlight: true },
    { label: "Service Requests", href: "/operations/service-requests", icon: ClipboardList, desc: "Incoming requests from clients and staff" },
    { label: "Work Orders", href: "/operations/work-orders", icon: Wrench, desc: "Manage all open and in-progress work orders" },
    { label: "Dispatch Board", href: "/operations/dispatch", icon: MapPin, desc: "Assign technicians and manage scheduling" },
    { label: "SLA Monitor", href: "/operations/sla-review", icon: Timer, desc: "Track SLA compliance and breach risks" },
    { label: "Calendar", href: "/operations/calendar", icon: Calendar, desc: "Work order calendar and schedule view" },
    { label: "Workflows", href: "/operations/workflows", icon: GitBranch, desc: "Approval and business process workflows" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Operations Center"
        subtitle="Work orders · Dispatch · SLA · Service requests · Workflows"
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5"/>} onClick={()=>kpiQ.refetch()}>
            Refresh
          </Button>
        }
      />

      {kpiQ.isLoading ? (
        <LoadingState type="cards" rows={4} cols={4}/>
      ) : (
        <MetricStrip metrics={metrics} cols={4}/>
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Operations Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map(mod => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.label}
                href={mod.href}
                className={`
                  group relative flex flex-col p-5 rounded-2xl border transition-all duration-200
                  ${mod.highlight
                    ? "bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10"
                    : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-md"
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors
                  ${mod.highlight ? "bg-amber-500/20 text-amber-400" : "bg-slate-100 text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-600"}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`font-bold text-sm mb-1 ${mod.highlight ? "text-white" : "text-slate-900"}`}>
                  {mod.label}
                </div>
                <div className={`text-xs leading-relaxed ${mod.highlight ? "text-slate-400" : "text-slate-500"}`}>
                  {mod.desc}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
