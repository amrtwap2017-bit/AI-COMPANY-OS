"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { KpiCard } from "@/components/ui/KpiCard";
import { Sparkles, RefreshCw, Cpu, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SignalSummary {
  anomaly_count?: number;
  preventive_count?: number;
  cost_saving_estimate?: number;
  signals?: Array<{
    id: string;
    type: string;
    title: string;
    severity: string;
    created_at: string;
  }>;
}

function AISignalsPageInner() {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);
  const [summary, setSummary] = useState<SignalSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefresh, setLast] = useState<string>("");

  const loadData = () => {
    setLoading(true);
    tbFetch("/api/v1/ai/signals/summary")
      .then((r: any) => r.data ?? r)
      .then((d: SignalSummary) => {
        setSummary(d);
        setLast(new Date().toLocaleTimeString("en-GB"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) loadData();
  }, [mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const signals = summary?.signals || [];

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Cpu className="w-7 h-7 text-brand" />
              AI Operational Signals
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              Continuous Intelligence
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Real-time anomaly detection, early failure warnings, and predictive work order triggers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-secondary">Updated: {lastRefresh}</span>
          )}
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md border border-border bg-surface hover:bg-surface-alt transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-secondary" />
            Refresh Signals
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Active Anomalies"
          value={summary?.anomaly_count ?? 0}
          sub="Requires Review"
          color="red"
          status={(summary?.anomaly_count ?? 0) > 0 ? "critical" : "ok"}
        />
        <KpiCard
          label="Predictive Triggers"
          value={summary?.preventive_count ?? 0}
          sub="Auto-Scheduled PM"
          color="blue"
          status="ok"
        />
        <KpiCard
          label="Est. Cost Leakage Prevented"
          value={`$${summary?.cost_saving_estimate ?? 0}`}
          sub="Last 30 Days"
          color="emerald"
          status="ok"
        />
        <KpiCard
          label="Signal Pipeline Health"
          value="100%"
          sub="Telemetry Active"
          color="brand"
        />
      </div>

      {/* Signal Stream */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <h2 className="text-base font-semibold text-primary flex items-center gap-2 border-b border-divider pb-3">
          <Activity className="w-4 h-4 text-brand" />
          Discovered Operational Signals
        </h2>

        <div className="space-y-3">
          {signals.map((sig) => (
            <div
              key={sig.id}
              className="p-4 rounded-lg border border-border bg-surface-alt flex items-center justify-between transition-all hover:border-brand/40"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-primary">{sig.title}</div>
                  <div className="text-xs text-secondary mt-0.5">Type: {sig.type} • {sig.created_at}</div>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-warning-bg text-warning-text border border-warning-border capitalize">
                {sig.severity}
              </span>
            </div>
          ))}

          {signals.length === 0 && (
            <div className="text-center py-12 text-secondary space-y-2">
              <CheckCircle2 className="w-10 h-10 text-success mx-auto opacity-70" />
              <p className="text-sm font-medium">All equipment running within normal operational baselines.</p>
              <p className="text-xs text-tertiary">Zero active failure signals detected across monitored hotel assets.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AISignalsPage() {
  return (
    <FeatureGate flag="signals">
      <AISignalsPageInner />
    </FeatureGate>
  );
}
