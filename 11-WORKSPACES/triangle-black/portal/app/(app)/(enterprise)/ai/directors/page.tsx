"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Wrench, ShoppingCart, Activity, ShieldCheck,
  Cpu, ArrowRight, Sparkles, CheckCircle2, RefreshCw
} from "lucide-react";

export default function AIDirectorsPage() {
  const [selectedDirector, setSelectedDirector] = useState<string>("maintenance");

  const { data: analysis, isLoading, refetch } = useQuery(
    ["ai-director-analysis", selectedDirector],
    () => authFetch("/api/v1/ai-directors/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ director: selectedDirector, context: {} })
    }).then(r => r.json()),
    { staleTime: 30000 }
  );

  const directors = [
    { id: "maintenance", name: "AI Maintenance Director", icon: Wrench, desc: "Predictive asset health & vibration analysis" },
    { id: "procurement", name: "AI Procurement Director", icon: ShoppingCart, desc: "Spare-part spend variance & supplier risk" },
    { id: "operations", name: "AI Operations Director", icon: Activity, desc: "SLA bottlenecks & technician dispatch" },
    { id: "executive", name: "AI Executive Analyst", icon: ShieldCheck, desc: "Strategic operational cost leakage insights" },
  ];

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Cpu className="w-7 h-7 text-brand" />
              AI Advisory Directors Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              Governed Operational Intelligence
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Specialized advisory engines providing evidence-backed root cause hypotheses and non-autonomous action plans.
          </p>
        </div>
        <div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md border border-border bg-surface hover:bg-surface-alt transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-secondary" />
            Re-run Analysis
          </button>
        </div>
      </div>

      {/* 4 Director Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {directors.map((d) => {
          const Icon = d.icon;
          const isSelected = selectedDirector === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDirector(d.id)}
              className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
                isSelected
                  ? "border-brand bg-brand-light/30 ring-1 ring-brand"
                  : "border-border bg-surface hover:border-brand/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${isSelected ? "text-brand" : "text-secondary"}`} />
                <span className="text-xs font-mono text-tertiary">Active</span>
              </div>
              <div>
                <div className="text-sm font-bold text-primary">{d.name}</div>
                <div className="text-xs text-secondary mt-0.5">{d.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Director Output Panel */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-divider pb-4">
          <div>
            <h2 className="text-base font-bold text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              {analysis?.director || "AI Director Assessment"}
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Audit Reference: <span className="font-mono">{analysis?.audit_id || "calculating..."}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge
              status={analysis?.risk_level === "HIGH" ? "critical" : "operational"}
              variant={analysis?.risk_level === "HIGH" ? "danger" : "success"}
            />
            <span className="text-xs font-semibold text-secondary">
              Confidence: {Math.round((analysis?.confidence_score ?? 0.9) * 100)}%
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-secondary text-sm">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Evaluating telemetry and evidence patterns...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hypothesis */}
            <div className="p-4 rounded-lg border border-border bg-surface-alt space-y-1.5">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                Root Cause Hypothesis
              </span>
              <p className="text-sm font-semibold text-primary leading-relaxed">
                {analysis?.root_cause_hypothesis}
              </p>
            </div>

            {/* Evidence Chain */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                Evidence Chain & Telemetry Signals
              </span>
              <div className="space-y-2">
                {(analysis?.evidence || []).map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-secondary p-2.5 rounded-md border border-border bg-surface-alt">
                    <CheckCircle2 className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation & Required Role */}
            <div className="p-4 rounded-lg border border-brand-border bg-brand-light/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-brand uppercase">
                <span>Governed Action Recommendation</span>
                <span>Required Approver: {analysis?.required_approval_role}</span>
              </div>
              <p className="text-sm font-bold text-primary">
                {analysis?.recommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
