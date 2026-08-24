"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Activity, RefreshCw, AlertTriangle, TrendingUp } from "lucide-react";

export default function PredictiveMaintenancePage() {
  const { data: forecastData, refetch: refetchForecast } = useQuery(
    ["predictive-forecast"],
    () => authFetch("/api/v1/predictive/forecast?horizon_days=30").then(r => r.json()),
    { staleTime: 30000 }
  );

  const { data: anomalyData } = useQuery(
    ["predictive-anomalies"],
    () => authFetch("/api/v1/predictive/anomalies").then(r => r.json()),
    { staleTime: 30000 }
  );

  const forecasts = forecastData?.forecasts || [];
  const anomalies = anomalyData?.anomalies || [];
  const criticalCount = forecasts.filter((f: any) => f.failure_probability_pct >= 80).length;
  const totalExposure = forecasts.reduce((sum: number, f: any) => sum + (f.estimated_repair_cost_usd || 0), 0);

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-brand" />
            AI Predictive Failure Forecaster
          </h1>
          <p className="text-sm text-secondary mt-1">
            30-day failure probability forecasts + live anomaly detection
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetchForecast()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Assets Forecasted" value={forecasts.length} sub="In 30-day horizon" color="blue" />
        <KpiCard label="High Risk Assets" value={criticalCount} sub="≥80% failure probability" color={criticalCount > 0 ? "amber" : "emerald"} />
        <KpiCard label="Active Anomalies" value={anomalies.length} sub="Live sensor alerts" color={anomalies.length > 0 ? "amber" : "emerald"} status={anomalies.length > 0 ? "warning" : "ok"} />
        <KpiCard label="Total Repair Exposure" value={`$${Number(totalExposure).toLocaleString()}`} sub="If failures not prevented" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Failure Forecasts */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand" />
            Asset Failure Forecasts (30 days)
          </h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {forecasts.map((f: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border border-border bg-surface-alt">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <p className="text-xs font-bold text-primary">{f.asset_name}</p>
                    <p className="text-[11px] text-tertiary">{f.category} · {f.criticality}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-black ${f.failure_probability_pct >= 80 ? "text-danger-text" : f.failure_probability_pct >= 50 ? "text-warning-text" : "text-success-text"}`}>
                      {f.failure_probability_pct}%
                    </div>
                    <div className="text-[10px] text-tertiary">probability</div>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${f.failure_probability_pct >= 80 ? "bg-danger" : f.failure_probability_pct >= 50 ? "bg-warning" : "bg-success"}`}
                    style={{ width: `${f.failure_probability_pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-tertiary">
                  <span>{f.predicted_failure_window_days}d window</span>
                  <span className="text-brand">${Number(f.estimated_repair_cost_usd || 0).toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-secondary mt-1 italic">{f.recommended_action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-danger" />
            Live Anomaly Detection ({anomalies.length})
          </h2>
          <div className="space-y-2">
            {anomalies.length > 0 ? anomalies.map((a: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border border-danger-border bg-danger-bg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-danger-text">{a.asset_name}</span>
                  <StatusBadge status={a.severity} variant="danger" />
                </div>
                <p className="text-xs text-danger-text/80">{a.description}</p>
                <p className="text-[11px] text-secondary mt-1.5 italic">{a.recommended_mitigation}</p>
                <div className="flex justify-between text-[11px] font-mono text-tertiary mt-1">
                  <span>{a.anomaly_type}</span>
                  <span>{a.confidence_pct}% confidence</span>
                </div>
              </div>
            )) : (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-success-bg flex items-center justify-center mx-auto">
                  <Activity className="w-6 h-6 text-success" />
                </div>
                <p className="text-sm font-semibold text-primary">All Systems Normal</p>
                <p className="text-xs text-secondary">No anomalies detected in current telemetry stream</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
