"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Button } from "@/components/ui/Button";
import {
  Play, Sparkles, AlertTriangle, ShieldCheck,
  CheckCircle2, DollarSign, Wrench, RefreshCw, Layers
} from "lucide-react";

export default function DemoScenariosPage() {
  const [activeResult, setActiveResult] = useState<any>(null);
  const [triggering, setTriggering] = useState<string | null>(null);

  const { data: scenarios = [], isLoading } = useQuery(
    ["demo-scenarios-list"],
    () => authFetch("/api/v1/demo/scenarios").then(r => r.json()),
    { staleTime: 60000 }
  );

  const handleTrigger = async (scenarioId: string) => {
    setTriggering(scenarioId);
    try {
      const res = await authFetch("/api/v1/demo/trigger-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_id: scenarioId })
      });
      const data = await res.json();
      setActiveResult(data);
    } catch {
      alert("Failed to execute demo scenario");
    } finally {
      setTriggering(null);
    }
  };

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-brand" />
              Commercial Demonstration Sandbox
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              Red Sea Grand Resort Cluster
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Trigger real-time operational breakdown scenarios to demonstrate Triangle Black's closed-loop AI triage and financial controls.
          </p>
        </div>
      </div>

      {/* Result Toast/Banner */}
      {activeResult && (
        <div className="p-4 rounded-xl border border-success-border bg-success-bg text-success-text flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold">{activeResult.title}</div>
              <div className="text-xs mt-0.5 opacity-90">
                {activeResult.action_taken} • Target: {activeResult.target_entity} (Audit Ref: {activeResult.audit_reference.slice(0, 8)})
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActiveResult(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((sc: any) => (
          <div
            key={sc.id}
            className="p-6 rounded-xl border border-border bg-surface space-y-4 flex flex-col justify-between hover:border-brand/40 transition-all shadow-sm"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full font-semibold bg-surface-alt border border-border text-secondary">
                  {sc.category}
                </span>
                <span className="font-mono text-tertiary">Ready</span>
              </div>
              <h3 className="text-base font-bold text-primary">{sc.title}</h3>
              <p className="text-xs text-secondary leading-relaxed">{sc.description}</p>
            </div>

            <div className="pt-3 border-t border-divider space-y-3">
              <div className="text-xs text-brand font-semibold">
                Commercial Value: {sc.impact}
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                loading={triggering === sc.id}
                disabled={triggering !== null}
                onClick={() => handleTrigger(sc.id)}
              >
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                Simulate Live Scenario
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
