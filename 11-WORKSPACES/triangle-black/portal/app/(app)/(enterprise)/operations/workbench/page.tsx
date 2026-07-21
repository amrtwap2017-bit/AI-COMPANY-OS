"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageWrapper, PageHeader, SectionCard, LoadingState, StatusBadge, Avatar, Progress } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { RefreshCw, Plus, Wrench, UserCheck, AlertTriangle } from "lucide-react";
import { toast } from "@/lib/toast";

export default function OperationsWorkbenchPage() {
  const { data: wos = [], isLoading: wLoading, refetch, isFetching } = useQuery({
    queryKey: ["workbench-wos"],
    queryFn: async () => {
      const res = await authFetch("/api/v1/work-orders");
      if (!res.ok) return [];
      const d = await res.json();
      return Array.isArray(d) ? d : d?.items || [];
    },
    refetchInterval: 60_000,
  });

  const { data: techs = [], isLoading: tLoading } = useQuery({
    queryKey: ["workbench-techs"],
    queryFn: async () => {
      const res = await authFetch("/api/v1/technicians");
      if (!res.ok) return [];
      const d = await res.json();
      return Array.isArray(d) ? d : d?.items || [];
    },
    staleTime: 30_000,
  });

  const isLoading = wLoading || tLoading;
  const open = wos.filter((w) => w.status === "open").length;
  const inProgress = wos.filter((w) => w.status === "in_progress").length;
  const critical = wos.filter((w) => w.priority === "critical" && w.status !== "completed").length;
  const activeTechs = techs.filter((t) => t.is_active).length;
  const criticalWOs = wos.filter((w) => w.priority === "critical" && w.status !== "completed").slice(0, 5);

  return (
    <PageWrapper>
      <PageHeader
        title="Operations Workbench"
        subtitle="Field manager daily command view"
        badge="OPS"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => { refetch(); toast.success("Refreshed"); }} disabled={isFetching}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
              <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
            </button>
            <Link href="/operations/work-orders/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700">
              <Plus className="w-4 h-4" /> New WO
            </Link>
          </div>
        }
      />

      {isLoading ? <LoadingState type="cards" rows={4} cols={4} /> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Open WOs",      value: open,       color: "bg-blue-50 border-blue-200 text-blue-700" },
              { label: "In Progress",   value: inProgress,  color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
              { label: "Critical",      value: critical,    color: critical > 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-slate-50 border-slate-200 text-slate-700" },
              { label: "Active Techs",  value: activeTechs, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
            ].map(m => (
              <div key={m.label} className={"rounded-2xl border p-4 " + m.color}>
                <div className="text-2xl font-bold">{m.value}</div>
                <div className="text-xs font-medium mt-1 opacity-80">{m.label}</div>
              </div>
            ))}
          </div>

          {criticalWOs.length > 0 && (
            <SectionCard title="Critical Work Orders" subtitle={criticalWOs.length + " requiring immediate action"}>
              <div className="space-y-2">
                {criticalWOs.map((wo) => (
                  <div key={wo.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{wo.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{wo.type || "general"}</p>
                    </div>
                    <StatusBadge status={wo.status} dot />
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard title="Technician Status" subtitle={activeTechs + " active technicians"}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {techs.filter((t) => t.is_active).slice(0, 6).map((tech) => {
                const used = tech.current_work_orders || 0;
                const max  = tech.max_work_orders || 10;
                const pct  = Math.round((used / max) * 100);
                return (
                  <div key={tech.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                    <Avatar name={tech.name} size="sm" online />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">{tech.name}</p>
                      <div className="mt-1">
                        <Progress value={used} max={max} size="sm"
                          color={pct > 80 ? "red" : pct > 60 ? "amber" : "emerald"} />
                        <p className="text-[10px] text-slate-400 mt-0.5">{used}/{max} jobs</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "All Work Orders",    href: "/operations/work-orders" },
              { label: "Dispatch Board",     href: "/operations/dispatch" },
              { label: "Technicians",        href: "/operations/technicians" },
              { label: "Service Requests",   href: "/operations/service-requests" },
              { label: "SLA Review",         href: "/operations/sla-review" },
              { label: "Calendar",           href: "/operations/calendar" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all text-sm font-semibold text-slate-700 hover:text-amber-700">
                {l.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </PageWrapper>
  );
}
