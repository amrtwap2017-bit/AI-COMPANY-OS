"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const RISK_COLORS: Record<string, string> = {
  critical: "#C0392B",
  high: "#E67E22",
  medium: "#F39C12",
  low: "#27AE60",
};

export default function RecommendationsPage(): React.JSX.Element {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["recommendations", filter],
    queryFn: () =>
      authFetch(`/api/v1/recommendations/?status=${filter === "all" ? "" : filter}&limit=50`)
        .then((r) => r.json()),
    staleTime: 30000,
  });

  const { data: summary } = useQuery({
    queryKey: ["rec-effectiveness"],
    queryFn: () => authFetch("/api/v1/recommendations/effectiveness").then((r) => r.json()),
    staleTime: 60000,
  });

  const approveMutation = useMutation({
    mutationFn: (recId: string) =>
      authFetch(`/api/v1/recommendations/${recId}/approve`, { method: "POST" }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recommendations"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (recId: string) =>
      authFetch(`/api/v1/recommendations/${recId}/reject`, { method: "POST" }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recommendations"] }),
  });

  const recs = data?.recommendations || [];
  const summaryData = summary?.summary || {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-secondary text-sm">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="tb-section max-w-md text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="text-primary font-bold mb-2">Error Loading Recommendations</h2>
          <p className="text-secondary text-sm mb-4">
            Failed to load AI recommendations. Check your connection.
          </p>
          <button onClick={() => refetch()} className="tb-btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base">
      {/* Hero */}
      <div className="tb-hero" style={{ background: "linear-gradient(135deg, #1A0F28 0%, #221D1A 100%)" }}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Intelligence</div>
          <h1 className="tb-hero-title">AI Recommendations</h1>
          <p className="tb-hero-description">
            Evidence-based recommendations from your operational data.
            Every recommendation requires human decision and approval.
          </p>
          <div className="tb-grid-4 mt-6">
            {[
              { label: "Total", value: summaryData.total_recommendations || 0, color: "#5B7C8C" },
              { label: "Pending Review", value: summaryData.pending || 0, color: "#E67E22" },
              { label: "Approved", value: summaryData.acted_upon || 0, color: "#27AE60" },
              { label: "Acceptance Rate", value: `${summaryData.acceptance_rate_pct || 0}%`, color: "#8D7443" },
            ].map((k, i) => (
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: k.color }}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {/* Filter */}
        <div className="flex gap-3 mb-6">
          {(["pending", "approved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-brand text-white"
                  : "bg-surface text-secondary hover:text-primary border border-border"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {recs.length === 0 && (
          <div className="tb-section text-center py-16">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-primary font-bold mb-2">No Recommendations Yet</h2>
            <p className="text-secondary text-sm max-w-md mx-auto">
              AI recommendations are generated from operational data.
              Ensure assets, work orders and PM plans are imported and linked.
            </p>
          </div>
        )}

        {/* Recommendations list */}
        <div className="space-y-4">
          {recs.map((rec: any) => {
            const riskLevel = (rec.risk_level || "low").toLowerCase();
            const riskColor = RISK_COLORS[riskLevel] || "#888";
            return (
              <div key={rec.id} className="tb-section">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                      style={{ background: riskColor + "22", color: riskColor }}
                    >
                      {riskLevel}
                    </span>
                    <span className="text-xs text-tertiary">{rec.director} Director</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    rec.status === "pending" ? "bg-orange-500/20 text-orange-400" :
                    rec.status === "approved" ? "bg-green-500/20 text-green-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {rec.status}
                  </span>
                </div>

                <p className="text-primary text-sm font-medium mb-2">{rec.recommendation}</p>

                {rec.action && (
                  <p className="text-secondary text-xs mb-3">
                    <span className="text-brand font-medium">Action: </span>
                    {rec.action}
                  </p>
                )}

                {rec.evidence && (
                  <p className="text-tertiary text-xs mb-3 italic">{rec.evidence}</p>
                )}


                {rec.status === "approved" && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-tertiary mb-2">Record what happened:</p>
                    <div className="flex gap-2 flex-wrap">
                      {["improved", "partial", "no_change", "declined"].map((ot) => (
                        <button
                          key={ot}
                          onClick={() => {
                            const notes = prompt(`Notes for "${ot}" outcome (optional):`);
                            fetch(`/api/v1/recommendations/${rec.id}/outcome`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json",
                                "Authorization": `Bearer ${localStorage.getItem("tb_access_token")}` },
                              body: JSON.stringify({ outcome_type: ot, notes: notes || "",
                                metric_key: "operational_metric" })
                            }).then(() => queryClient.invalidateQueries({ queryKey: ["recommendations"] }));
                          }}
                          className={`text-xs px-2 py-1 rounded border transition-colors cursor-pointer ${
                            ot === "improved" ? "border-green-600 text-green-400 hover:bg-green-600/20" :
                            ot === "partial" ? "border-yellow-600 text-yellow-400 hover:bg-yellow-600/20" :
                            "border-red-600/50 text-red-400/70 hover:bg-red-600/10"
                          }`}
                        >
                          {ot === "improved" ? "✅ Improved" :
                           ot === "partial" ? "⚠️ Partial" :
                           ot === "no_change" ? "➡️ No Change" : "❌ Declined"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {rec.status === "pending" && (
                  <div className="flex gap-3 mt-4 pt-3 border-t border-border">
                    <button
                      onClick={() => approveMutation.mutate(rec.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors disabled:opacity-50"
                    >
                      ✅ Approve &amp; Act
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(rec.id)}
                      disabled={rejectMutation.isPending}
                      className="px-4 py-2 bg-surface text-secondary hover:text-primary border border-border text-sm rounded-md transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
