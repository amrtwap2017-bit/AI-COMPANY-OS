"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import {
  MessageSquarePlus, AlertCircle, ShieldCheck,
  CheckCircle2, RefreshCw, Filter, Clock, Sparkles
} from "lucide-react";

export default function FeedbackTriagePage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("");

  const { data: feedbackList = [], isLoading, refetch } = useQuery(
    ["customer-feedback-list", filterStatus],
    () => authFetch(`/api/v1/feedback/list${filterStatus ? `?status=${filterStatus}` : ""}`).then(r => r.json()),
    { staleTime: 15000 }
  );

  const triageMutation = useMutation(
    ({ id, priority, status }: { id: string; priority: string; status: string }) =>
      authFetch(`/api/v1/feedback/${id}/triage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority, status, notes: "Triaged via Enterprise Workbench" })
      }).then(r => r.json()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["customer-feedback-list"]);
      }
    }
  );

  const p0Count = feedbackList.filter((f: any) => f.priority === "P0" && f.status !== "resolved").length;
  const openCount = feedbackList.filter((f: any) => f.status === "open").length;

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <MessageSquarePlus className="w-7 h-7 text-brand" />
              Customer Feedback & Pilot Triage Workbench
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              P0–P4 Classification Active
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Capture operational feedback, classify urgency, and resolve pilot bottlenecks in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Critical Blockers (P0)" value={p0Count} sub="Immediate SRE Action" color="red" status={p0Count > 0 ? "critical" : "ok"} />
        <KpiCard label="Pending Triage" value={openCount} sub="Unclassified Inquiries" color="amber" status={openCount > 0 ? "warning" : "ok"} />
        <KpiCard label="Total Feedback Logged" value={feedbackList.length} sub="All Pilot Tenants" color="blue" />
        <KpiCard label="Triage Response SLA" value="< 2 Hours" sub="Standard Operational Gate" color="brand" />
      </div>

      {/* Triage Table */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-divider pb-3">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand" />
            Live Customer Feedback Queue
          </h2>
          <div className="flex items-center gap-2">
            {["", "open", "scheduled", "resolved"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  filterStatus === st ? "bg-brand text-white" : "bg-surface-alt text-secondary hover:text-primary"
                }`}
              >
                {st ? st.toUpperCase() : "ALL"}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-secondary text-sm">Loading feedback items...</div>
        ) : (
          <div className="space-y-3">
            {feedbackList.map((item: any) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-border bg-surface-alt flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand/40 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                      item.priority === "P0" ? "bg-danger-bg text-danger-text border border-danger-border" :
                      item.priority === "P1" ? "bg-warning-bg text-warning-text border border-warning-border" :
                      "bg-surface text-secondary border border-border"
                    }`}>
                      {item.priority}
                    </span>
                    <span className="text-xs font-bold text-secondary uppercase">{item.category}</span>
                    <span className="text-xs text-tertiary font-mono">• {item.user_email}</span>
                  </div>
                  <p className="text-sm font-semibold text-primary">{item.message}</p>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} />
                  {item.status === "open" && (
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => triageMutation.mutate({ id: item.id, priority: item.priority, status: "scheduled" })}
                    >
                      Schedule Fix
                    </Button>
                  )}
                  {item.status === "scheduled" && (
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => triageMutation.mutate({ id: item.id, priority: item.priority, status: "resolved" })}
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {feedbackList.length === 0 && (
              <div className="text-center py-12 text-secondary space-y-2">
                <CheckCircle2 className="w-10 h-10 text-success mx-auto opacity-70" />
                <p className="text-sm font-medium">Feedback queue is completely clear.</p>
                <p className="text-xs text-tertiary">Zero unaddressed pilot issues reported.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
