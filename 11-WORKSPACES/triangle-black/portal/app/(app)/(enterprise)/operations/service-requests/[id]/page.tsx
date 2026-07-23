"use client"; // @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useState } from "react";
import { Wrench, User, Clock, AlertTriangle, ChevronRight, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  open:          "bg-slate-100 text-slate-600",
  assigned:      "bg-blue-100 text-blue-700",
  in_progress:   "bg-amber-100 text-amber-700",
  resolved:      "bg-emerald-100 text-emerald-700",
  closed:        "bg-slate-200 text-slate-500",
  cancelled:     "bg-red-100 text-red-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "text-red-600 bg-red-50 border-red-200",
  high:     "text-amber-600 bg-amber-50 border-amber-200",
  medium:   "text-blue-600 bg-blue-50 border-blue-200",
  low:      "text-slate-600 bg-slate-50 border-slate-200",
};

export default function ServiceRequestDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [escalateResult, setEscalateResult] = useState<any>(null);

  const { data: sr, isLoading } = useQuery({
    queryKey: ["sr", id],
    queryFn: () => authFetch(`/api/v1/service-requests/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: linkedWOs = {} } = useQuery({
    queryKey: ["sr-wos", id],
    queryFn: () => authFetch(`/api/v1/work-orders/?service_request_id=${id}&limit=10`).then(r => r.json()),
    enabled: !!id,
  });

  const escalate = useMutation({
    mutationFn: () => authFetch(`/api/v1/service-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: "critical", status: "assigned" }),
    }).then(r => r.json()),
    onSuccess: (data) => {
      setEscalateResult(data);
      qc.invalidateQueries({ queryKey: ["sr", id] });
    },
  });

  if (isLoading) return <PageWrapper><LoadingState title="Loading service request..." /></PageWrapper>;
  if (!sr || sr.detail) return <PageWrapper><p className="p-8 text-slate-400">Service request not found</p></PageWrapper>;

  const wos = Array.isArray(linkedWOs) ? linkedWOs : linkedWOs?.data ?? linkedWOs?.items ?? [];
  const priorityStyle = PRIORITY_COLORS[sr.priority] ?? PRIORITY_COLORS.medium;

  return (
    <PageWrapper>
      <PageHeader
        title={sr.title || sr.subject || "Service Request"}
        subtitle={`${sr.request_type ?? sr.type ?? "Service"} · ${String(sr.created_at ?? "").slice(0,10)}`}
        badge={
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[sr.status] ?? ""}`}>
            {sr.status}
          </span>
        }
      />

      {escalateResult && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          ⚠️ Service request escalated to critical priority
        </div>
      )}

      {/* Priority banner */}
      {sr.priority === "critical" && (
        <div className={`mb-4 p-4 rounded-xl border flex items-center gap-3 ${priorityStyle}`}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="font-semibold">Critical Priority — Requires Immediate Attention</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* SR details */}
        <div className="space-y-6">
          <SectionCard title="Request Details">
            <div className="space-y-2 text-sm">
              {[
                ["Status",       sr.status],
                ["Priority",     sr.priority],
                ["Type",         sr.request_type ?? sr.type],
                ["Reporter",     sr.reporter_name ?? sr.created_by],
                ["Hotel",        sr.hotel_id],
                ["Location",     sr.location ?? sr.room_number],
                ["Created",      String(sr.created_at ?? "").slice(0,10)],
                ["Due By",       String(sr.due_date ?? "—").slice(0,10)],
              ].filter(([, v]) => v && v !== "—").map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-800 font-medium text-right max-w-32 truncate">{v}</span>
                </div>
              ))}
            </div>
            {sr.description && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Description</div>
                <div className="text-sm text-slate-700">{sr.description}</div>
              </div>
            )}
          </SectionCard>

          {/* Escalation action */}
          {sr.priority !== "critical" && sr.status !== "resolved" && sr.status !== "closed" && (
            <SectionCard title="Actions">
              <button
                onClick={() => escalate.mutate()}
                disabled={escalate.isPending}
                className="w-full h-10 flex items-center justify-center gap-2 text-sm font-medium
                           bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {escalate.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <AlertTriangle className="w-4 h-4" />}
                Escalate to Critical
              </button>
              <p className="text-xs text-slate-400 text-center mt-2">
                Use for urgent issues requiring immediate dispatch
              </p>
            </SectionCard>
          )}
        </div>

        {/* Linked Work Orders */}
        <div className="lg:col-span-2">
          <SectionCard title={`Linked Work Orders (${wos.length})`}>
            {wos.length > 0 ? (
              <div className="space-y-3">
                {wos.map((wo: any) => (
                  <div key={wo.id}
                       className="flex items-center justify-between p-3
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
                      {wo.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No work orders linked to this request</p>
                <p className="text-xs text-slate-300 mt-1">
                  A work order will appear here when dispatched
                </p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
