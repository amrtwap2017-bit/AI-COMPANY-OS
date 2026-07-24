"use client"; // @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Calendar, CheckCircle, Clock, AlertTriangle, Wrench, Activity } from "lucide-react";

const FREQ_COLORS: Record<string, string> = {
  daily:     "bg-red-100 text-red-700",
  weekly:    "bg-orange-100 text-orange-700",
  monthly:   "bg-blue-100 text-blue-700",
  quarterly: "bg-purple-100 text-purple-700",
  annual:    "bg-slate-100 text-slate-600",
  biannual:  "bg-indigo-100 text-indigo-700",
};

export default function PMPlanDetailPage() {
  const { id } = useParams();

  const { data: plan, isLoading } = useQuery({
    queryKey: ["pm-plan", id],
    queryFn: () => authFetch(`/api/v1/maintenance/pm-plans/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: historyData = {} } = useQuery({
    queryKey: ["pm-history", id],
    queryFn: () => authFetch(`/api/v1/maintenance/history/?plan_id=${id}&limit=20`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: woData = {} } = useQuery({
    queryKey: ["pm-wos", id],
    queryFn: () => authFetch(`/api/v1/work-orders/?maintenance_plan_id=${id}&limit=10`).then(r => r.json()),
    enabled: !!id,
  });

  if (isLoading) return <PageWrapper><LoadingState title="Loading maintenance plan..." /></PageWrapper>;
  if (!plan || plan.detail) return (
    <PageWrapper><p className="p-8 text-slate-400">Maintenance plan not found</p></PageWrapper>
  );

  const history  = Array.isArray(historyData) ? historyData : historyData?.data ?? historyData?.items ?? [];
  const wos      = Array.isArray(woData) ? woData : woData?.data ?? woData?.items ?? [];

  const now = new Date();
  const dueDate = plan.next_due_date ? new Date(plan.next_due_date) : null;
  const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / 86400000) : null;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

  return (
    <PageWrapper>
      <PageHeader
        title={plan.title || "Maintenance Plan"}
        subtitle={`${plan.plan_type ?? "preventive"} · ${plan.frequency ?? "monthly"}`}
        badge={
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${FREQ_COLORS[plan.frequency] ?? FREQ_COLORS.monthly}`}>
            {plan.frequency}
          </span>
        }
      />

      {isOverdue && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <div className="font-semibold text-red-800">PM Plan Overdue</div>
            <div className="text-sm text-red-600">
              {Math.abs(daysUntilDue!)} days past due — schedule maintenance immediately
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <SectionCard title="Plan Details">
            <div className="space-y-2 text-sm">
              {[
                ["Type",       plan.plan_type],
                ["Frequency",  plan.frequency],
                ["Status",     plan.status],
                ["Next Due",   String(plan.next_due_date ?? "—").slice(0,10)],
                ["Last Done",  String(plan.last_completed ?? "—").slice(0,10)],
                ["Owner",      plan.owner ?? plan.assigned_to ?? "—"],
                ["Asset ID",   plan.asset_id],
                ["Duration",   plan.estimated_duration ? `${plan.estimated_duration} hours` : "—"],
              ].filter(([, v]) => v && v !== "—").map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className={`font-medium text-right max-w-36 truncate
                    ${k === "Next Due" && isOverdue ? "text-red-600" : "text-slate-800"}`}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
            {plan.description && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Description</div>
                <div className="text-sm text-slate-700">{plan.description}</div>
              </div>
            )}
          </SectionCard>

          {/* Due countdown */}
          {daysUntilDue !== null && (
            <SectionCard title="Schedule Status">
              <div className="text-center py-4">
                {isOverdue ? (
                  <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                ) : daysUntilDue <= 7 ? (
                  <Clock className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                ) : (
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                )}
                <div className={`text-2xl font-bold
                  ${isOverdue ? "text-red-600" : daysUntilDue <= 7 ? "text-amber-600" : "text-emerald-600"}`}>
                  {isOverdue ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d remaining`}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Next due: {String(plan.next_due_date ?? "").slice(0,10)}
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* WOs linked to this plan */}
          <SectionCard title={`Work Orders (${(wos || []).length})`}>
            {(wos || []).length > 0 ? (
              <div className="space-y-2">
                {(wos || []).map((wo: any) => (
                  <div key={wo.id}
                       className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Wrench className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{wo.title}</div>
                        <div className="text-xs text-slate-400">{String(wo.created_at ?? "").slice(0,10)}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium
                      ${wo.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        "bg-slate-100 text-slate-600"}`}>
                      {wo.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No work orders on this plan</p>
            )}
          </SectionCard>

          {/* Maintenance history */}
          <SectionCard title={`Execution History (${history.length})`}>
            {history.length > 0 ? (
              <div className="space-y-2">
                {history.map((h: any, idx: number) => (
                  <div key={h.id ?? idx}
                       className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {h.title ?? h.action ?? "PM Execution"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {String(h.completed_at ?? h.created_at ?? "").slice(0,10)}
                          {h.technician_name ? ` · ${h.technician_name}` : ""}
                        </div>
                      </div>
                    </div>
                    {h.duration_hours && (
                      <span className="text-xs text-slate-500">{h.duration_hours}h</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No execution history</p>
            )}
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
