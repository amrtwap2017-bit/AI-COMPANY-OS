"use client"; // @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useState } from "react";
import { Building, Phone, Mail, TrendingUp, ChevronRight, Loader2, Calendar } from "lucide-react";

const STAGE_COLORS: Record<string, string> = {
  new:         "bg-slate-100 text-slate-600",
  qualified:   "bg-blue-100 text-blue-700",
  negotiation: "bg-amber-100 text-amber-700",
  won:         "bg-emerald-100 text-emerald-700",
  lost:        "bg-red-100 text-red-700",
  proposal:    "bg-purple-100 text-purple-700",
};

const STAGE_ORDER = ["new", "qualified", "proposal", "negotiation", "won", "lost"];

export default function LeadDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [stageResult, setStageResult] = useState<any>(null);

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => authFetch(`/api/v1/leads/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: activities = {} } = useQuery({
    queryKey: ["lead-activities", id],
    queryFn: () => authFetch(`/api/v1/activities/?entity_id=${id}&limit=20`).then(r => r.json()),
    enabled: !!id,
  });

  const updateStage = useMutation({
    mutationFn: (status: string) => authFetch(`/api/v1/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then(r => r.json()),
    onSuccess: (data) => {
      setStageResult(data);
      qc.invalidateQueries({ queryKey: ["lead", id] });
    },
  });

  if (isLoading) return <PageWrapper><LoadingState title="Loading lead..." /></PageWrapper>;
  if (!lead || lead.detail) return <PageWrapper><p className="p-8 text-slate-400">Lead not found</p></PageWrapper>;

  const acts = Array.isArray(activities) ? activities : activities?.data ?? activities?.items ?? [];
  const currentStage = lead.status ?? "new";
  const stageIdx = STAGE_ORDER.indexOf(currentStage);

  return (
    <PageWrapper>
      <PageHeader
        title={lead.title || lead.company_name || "Lead"}
        subtitle={lead.company_name ?? lead.contact_name ?? ""}
        badge={
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STAGE_COLORS[currentStage] ?? ""}`}>
            {currentStage}
          </span>
        }
      />

      {stageResult && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
          ✅ Lead stage updated
        </div>
      )}

      {/* Pipeline progress */}
      <SectionCard title="Pipeline Stage">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STAGE_ORDER.filter(s => s !== "lost").map((stage, idx) => {
            const isActive  = stage === currentStage;
            const isPast    = stageIdx > idx && currentStage !== "lost";
            const isFuture  = stageIdx < idx;
            return (
              <div key={stage} className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => updateStage.mutate(stage)}
                  disabled={updateStage.isPending}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50
                    ${isActive ? "bg-blue-600 text-white" :
                      isPast  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                                "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  {stage}
                </button>
                {idx < STAGE_ORDER.filter(s => s !== "lost").length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-6">
        {/* Lead details */}
        <div className="space-y-6">
          <SectionCard title="Lead Details">
            <div className="space-y-3">
              {lead.company_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">{lead.company_name}</span>
                </div>
              )}
              {lead.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">{lead.contact_phone}</span>
                </div>
              )}
              {lead.contact_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">{lead.contact_email}</span>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {[
                ["Priority",      lead.priority],
                ["Source",        lead.source],
                ["Expected Value", lead.expected_value ? `${Number(lead.expected_value).toLocaleString()} EGP` : "—"],
                ["Expected Close", String(lead.expected_close_date ?? "—").slice(0,10)],
                ["Assigned To",   lead.assigned_to ?? "Unassigned"],
                ["Created",       String(lead.created_at ?? "").slice(0,10)],
              ].filter(([, v]) => v && v !== "—").map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-800 font-medium text-right max-w-32 truncate">{v}</span>
                </div>
              ))}
            </div>
            {lead.notes && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Notes</div>
                <div className="text-sm text-slate-700">{lead.notes}</div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Value">
            <div className="text-center py-4">
              <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">
                {lead.expected_value ? `${Number(lead.expected_value).toLocaleString()}` : "—"}
              </div>
              <div className="text-xs text-slate-500 mt-1">Expected Value (EGP)</div>
            </div>
          </SectionCard>
        </div>

        {/* Activity timeline */}
        <div className="lg:col-span-2">
          <SectionCard title={`Activity Timeline (${acts.length})`}>
            {acts.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {acts.map((act: any, idx: number) => (
                  <div key={act.id ?? idx}
                       className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-800">
                        {act.action ?? act.type ?? act.title ?? "Activity"}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {String(act.created_at ?? "").slice(0, 16)}
                      </div>
                      {act.description && (
                        <div className="text-xs text-slate-500 mt-1">{act.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">No activity logged for this lead</p>
            )}
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
