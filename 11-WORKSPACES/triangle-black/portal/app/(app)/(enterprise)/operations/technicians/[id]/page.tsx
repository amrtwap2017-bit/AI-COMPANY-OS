// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { User, Wrench, Star, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function TechnicianDetailPage() {
  const { id } = useParams();

  const { data: tech, isLoading: tl } = useQuery({
    queryKey: ["technician", id],
    queryFn: () => authFetch(`/api/v1/technicians/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: wosData = {} } = useQuery({
    queryKey: ["tech-wos", id],
    queryFn: () => authFetch(`/api/v1/work-orders/?technician_id=${id}&limit=30`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: dispatchData = {} } = useQuery({
    queryKey: ["tech-dispatch", id],
    queryFn: () => authFetch(`/api/v1/ai-scheduling/daily-plan/${tech?.hotel_id ?? "all"}`).then(r => r.json()),
    enabled: !!id && !!tech?.hotel_id,
  });

  if (tl) return <PageWrapper><LoadingState title="Loading technician..." /></PageWrapper>;
  if (!tech || tech.detail) return <PageWrapper><p className="p-8 text-slate-400">Technician not found</p></PageWrapper>;

  const wos = Array.isArray(wosData) ? wosData : wosData?.data ?? wosData?.items ?? [];

  const completed = (wos || []).filter((w: any) => w.status === "completed").length;
  const inProgress = (wos || []).filter((w: any) => w.status === "in_progress").length;
  const open = (wos || []).filter((w: any) => w.status === "open").length;
  const completionRate = (wos || []).length > 0 ? Math.round(completed / (wos || []).length * 100) : 0;
  const utilization = tech.max_work_orders > 0
    ? Math.round(tech.current_work_orders / tech.max_work_orders * 100)
    : 0;

  const specs = Array.isArray(tech.specializations)
    ? tech.specializations
    : typeof tech.specializations === "string"
      ? tech.specializations.split(",").map((s: string) => s.trim())
      : [];

  return (
    <PageWrapper>
      <PageHeader
        title={tech.name || "Technician"}
        subtitle={`${specs.join(" · ") || "General"}`}
        badge={tech.is_active ? "Active" : "Inactive"}
      />

      {/* Performance strip */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        {[
          { label: "Current WOs",      value: tech.current_work_orders ?? 0, icon: Wrench,      color: "text-blue-600" },
          { label: "Utilization",      value: `${utilization}%`,             icon: TrendingUp,  color: utilization > 80 ? "text-red-600" : "text-emerald-600" },
          { label: "Completion Rate",  value: `${completionRate}%`,          icon: CheckCircle, color: completionRate >= 80 ? "text-emerald-600" : "text-amber-600" },
          { label: "Total WOs",        value: (wos || []).length,                    icon: Star,        color: "text-slate-700" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile */}
        <div className="space-y-6">
          <SectionCard title="Profile">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">{tech.name}</div>
                <div className={`text-sm ${tech.is_active ? "text-emerald-600" : "text-slate-400"}`}>
                  {tech.is_active ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["Max Capacity",  `${tech.max_work_orders} WOs`],
                ["Current Load",  `${tech.current_work_orders} WOs`],
                ["Available",     `${Math.max(0, tech.max_work_orders - tech.current_work_orders)} slots`],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-800 font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="text-xs text-slate-500 mb-2 font-medium uppercase">Specializations</div>
              <div className="flex flex-wrap gap-1">
                {specs.map((s: string) => (
                  <span key={s} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">{s}</span>
                ))}
                {specs.length === 0 && <span className="text-xs text-slate-400">None specified</span>}
              </div>
            </div>
          </SectionCard>

          {/* Capacity bar */}
          <SectionCard title="Capacity">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-600">Utilization</span>
              <span className="font-semibold">{utilization}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${utilization >= 90 ? "bg-red-500" : utilization >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-3 text-center text-xs text-slate-500">
              <div><div className="font-bold text-blue-600">{open}</div>Open</div>
              <div><div className="font-bold text-amber-600">{inProgress}</div>In Progress</div>
              <div><div className="font-bold text-emerald-600">{completed}</div>Completed</div>
            </div>
          </SectionCard>
        </div>

        {/* WO History */}
        <div className="lg:col-span-2">
          <SectionCard title={`Work Order History (${(wos || []).length})`}>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(wos || []).map((wo: any) => (
                <div key={wo.id} className="flex items-center justify-between p-3
                                             bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Wrench className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-slate-800">{wo.title}</div>
                      <div className="text-xs text-slate-400">{wo.type} · {wo.priority}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0
                    ${wo.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                      wo.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                      "bg-slate-100 text-slate-600"}`}>
                    {wo.status?.replace(/_/g," ")}
                  </span>
                </div>
              ))}
              {(wos || []).length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">No work orders assigned</p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
