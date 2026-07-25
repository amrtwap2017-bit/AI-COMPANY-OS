// @ts-nocheck
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useState } from "react";
import { ChevronRight, Loader2, Clock, User, Wrench, FileText } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high:     "bg-orange-100 text-orange-700",
  medium:   "bg-blue-100 text-blue-700",
  low:      "bg-slate-100 text-slate-600",
};

const STATUS_COLORS: Record<string, string> = {
  open:          "bg-slate-100 text-slate-600",
  assigned:      "bg-blue-100 text-blue-700",
  in_progress:   "bg-amber-100 text-amber-700",
  waiting_parts: "bg-orange-100 text-orange-700",
  completed:     "bg-emerald-100 text-emerald-700",
  closed:        "bg-slate-200 text-slate-600",
  cancelled:     "bg-red-100 text-red-700",
};

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [transitionResult, setTransitionResult] = useState<any>(null);

  const { data: wo, isLoading } = useQuery({
    queryKey: ["wo-detail", id],
    queryFn: () => authFetch(`/api/v1/work-orders/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: transData = {} } = useQuery({
    queryKey: ["wo-transitions", id],
    queryFn: () => authFetch(`/api/v1/work-orders/${id}/transitions`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: history = {} } = useQuery({
    queryKey: ["wo-history", id],
    queryFn: () => authFetch(`/api/v1/work-orders/${id}/history`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: pdfUrl = [] } = useQuery({
    queryKey: ["wo-pdf", id],
    queryFn: () => Promise.resolve(`/api/v1/pdf-export/work-order/${id}`),
    enabled: !!id,
  });

  const transition = useMutation({
    mutationFn: (toState: string) => authFetch(`/api/v1/work-orders/${id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: toState, comment: "Portal transition" }),
    }).then(r => r.json()),
    onSuccess: (data) => {
      setTransitionResult(data);
      qc.invalidateQueries({ queryKey: ["wo-detail", id] });
      qc.invalidateQueries({ queryKey: ["wo-transitions", id] });
    },
  });

  if (isLoading) return <PageWrapper><LoadingState title="Loading work order..." /></PageWrapper>;
  if (!wo || wo.detail) return <PageWrapper><p className="p-8 text-slate-400">Work order not found</p></PageWrapper>;

  const allowed: string[] = transData?.allowed_transitions ?? [];
  const historyItems = Array.isArray(history) ? history : history?.data ?? [];

  return (
    <PageWrapper>
      <PageHeader
        title={wo.title || "Work Order"}
        subtitle={`${wo.type} · ${wo.hotel_id ?? ""}`}
        badge={
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[wo.priority] ?? ""}`}>
            {wo.priority}
          </span>
        }
      />

      {transitionResult && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
          ✅ {transitionResult.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Details + Actions */}
        <div className="space-y-6">
          <SectionCard title="Details">
            <div className="space-y-2 text-sm">
              {[
                ["Status",     <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[wo.status] ?? ""}`}>{wo.status}</span>],
                ["Priority",   <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[wo.priority] ?? ""}`}>{wo.priority}</span>],
                ["Type",       wo.type],
                ["Due Date",   String(wo.due_date ?? "").slice(0,10)],
                ["Started",    String(wo.started_at ?? "—").slice(0,10)],
                ["Completed",  String(wo.completed_at ?? "—").slice(0,10)],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-1 border-b border-slate-50 items-center">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-medium text-slate-800">{v}</span>
                </div>
              ))}
            </div>
            {wo.description && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Description</div>
                <div className="text-sm text-slate-700 whitespace-pre-wrap">{wo.description}</div>
              </div>
            )}
          </SectionCard>

          {/* State machine transitions */}
          {allowed.length > 0 && (
            <SectionCard title="Transition State">
              <p className="text-xs text-slate-500 mb-3">
                Current: <strong>{wo.status}</strong>
              </p>
              <div className="space-y-2">
                {allowed.map((next: string) => (
                  <button
                    key={next}
                    onClick={() => transition.mutate(next)}
                    disabled={transition.isPending}
                    className="w-full h-9 flex items-center justify-between px-3
                               border border-slate-200 rounded-lg text-sm
                               hover:bg-slate-50 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                      {next.replace(/_/g, " ")}
                    </span>
                    {transition.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Export */}
          <SectionCard title="Export">
            <a
              href={`http://localhost:8030/api/v1/pdf-export/work-order/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-slate-200
                         rounded-lg text-sm hover:bg-slate-50 text-slate-700"
            >
              <FileText className="w-4 h-4" /> Download Work Order (HTML)
            </a>
          </SectionCard>
        </div>

        {/* Right: Activity history */}
        <div className="lg:col-span-2">
          <SectionCard title={`Activity History (${historyItems.length})`}>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {historyItems.map((item: any, idx: number) => (
                <div key={item.id ?? idx}
                     className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      {item.action ?? item.type ?? item.title ?? "Activity"}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {String(item.created_at ?? "").slice(0,16)}
                      {item.user && ` · ${item.user}`}
                    </div>
                    {item.description && (
                      <div className="text-xs text-slate-500 mt-1">{item.description}</div>
                    )}
                  </div>
                </div>
              ))}
              {historyItems.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">No activity history</p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
