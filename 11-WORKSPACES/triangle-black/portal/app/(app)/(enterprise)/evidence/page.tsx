"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const LEVEL_LABELS: Record<number, { label: string; color: string; icon: string }> = {
  0: { label: "INTERNAL", color: "#6D5F53", icon: "🔵" },
  1: { label: "SYSTEM MEASURED", color: "#8D7443", icon: "📊" },
  2: { label: "OPERATOR CONFIRMED", color: "#B07A2A", icon: "👷" },
  3: { label: "CUSTOMER VERIFIED", color: "#27AE60", icon: "✅" },
  4: { label: "FINANCIALLY DOCUMENTED", color: "#1A7A3C", icon: "📄" },
};

export default function EvidencePage(): React.JSX.Element {
  const qc = useQueryClient();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ["evidence-summary"],
    queryFn: () => authFetch("/api/v1/evidence/summary").then(r => r.json()),
    staleTime: 30000,
  });

  const { data: records, isLoading } = useQuery({
    queryKey: ["evidence-list"],
    queryFn: () => authFetch("/api/v1/evidence/").then(r => r.json()),
    staleTime: 30000,
  });

  const handleUpgrade = async (evidenceId: string, currentLevel: number) => {
    const newLevel = Math.min(currentLevel + 1, 4);
    const notes = prompt(
      `Upgrade to Level ${newLevel} (${LEVEL_LABELS[newLevel]?.label})?\nAdd confirmation notes:`
    );
    if (notes === null) return;

    setUpgrading(evidenceId);
    try {
      await authFetch(`/api/v1/evidence/${evidenceId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_level: newLevel, notes }),
      });
      qc.invalidateQueries({ queryKey: ["evidence"] });
    } finally {
      setUpgrading(null);
    }
  };

  const s = summary?.summary || {};
  const allRecords = records?.records || [];

  if (isLoading || sumLoading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{ background: "linear-gradient(135deg, #1A0F28 0%, #221D1A 100%)" }}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Evidence Ledger</div>
          <h1 className="tb-hero-title">ROI Verification</h1>
          <p className="tb-hero-description">
            Track and verify operational improvements through the evidence hierarchy.
            Only Level 3+ (Customer Verified) appears in executive reports.
          </p>
          <div className="tb-grid-2 mt-6">
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{ color: "#6D5F53", fontSize: "0.9rem" }}>
                EGP {(s.internal_roi_egp || 0).toLocaleString()}
              </div>
              <div className="tb-hero-kpi-label">🔵 Internal (L0-2)</div>
            </div>
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{ color: "#27AE60", fontSize: "0.9rem" }}>
                EGP {(s.customer_verified_roi_egp || 0).toLocaleString()}
              </div>
              <div className="tb-hero-kpi-label">✅ Customer Verified (L3+)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section mb-4 border-l-4" style={{ borderColor: "#E67E22" }}>
          <p className="text-sm font-medium" style={{ color: "#E67E22" }}>
            ⚠️ Only Customer Verified (L3+) ROI is safe for customer presentations and executive reports.
          </p>
          <p className="text-xs text-tertiary mt-1">
            Internal evidence (L0-2) is for platform validation only.
          </p>
        </div>

        {allRecords.length === 0 ? (
          <div className="tb-section text-center py-12">
            <div className="text-4xl mb-3">📊</div>
            <h2 className="text-primary font-bold mb-2">No Evidence Records Yet</h2>
            <p className="text-secondary text-sm">
              Record recommendation outcomes to start building the evidence chain.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allRecords.map((rec: any) => {
              const level = rec.evidence_level || 0;
              const meta = LEVEL_LABELS[level] || LEVEL_LABELS[0];
              const canUpgrade = level < 4;
              return (
                <div key={rec.id} className="tb-section">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{meta.icon}</span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded uppercase"
                        style={{ background: meta.color + "22", color: meta.color }}
                      >
                        L{level} — {meta.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      EGP {(rec.financial_value || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-primary mb-1">{rec.metric_name}</p>
                  {rec.notes && <p className="text-xs text-tertiary mb-2">{rec.notes}</p>}
                  {rec.baseline_value != null && rec.observed_value != null && (
                    <p className="text-xs text-secondary mb-2">
                      {rec.baseline_value} → {rec.observed_value}
                      {rec.improvement_pct ? ` (${rec.improvement_pct}% change)` : ""}
                    </p>
                  )}
                  {canUpgrade && (
                    <button
                      onClick={() => handleUpgrade(rec.id, level)}
                      disabled={upgrading === rec.id}
                      className="text-xs px-3 py-1 rounded border border-brand text-brand hover:bg-brand hover:text-white transition-colors disabled:opacity-50"
                    >
                      {upgrading === rec.id ? "Upgrading..." :
                       level < 2 ? "👷 Operator Confirms →" :
                       level < 3 ? "✅ Customer Verifies →" :
                       "📄 Financial Documents →"}
                    </button>
                  )}
                  {level >= 3 && (
                    <span className="text-xs text-green-400">✅ Safe for executive reports</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
