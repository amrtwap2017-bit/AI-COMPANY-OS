"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Radio, RefreshCw, Send, AlertTriangle, Activity } from "lucide-react";

export default function IoTTelemetryPage() {
  const [assetId, setAssetId] = useState("ast-chiller-01");
  const [vibration, setVibration] = useState("5.8");
  const [temperature, setTemperature] = useState("72.0");
  const [runtime, setRuntime] = useState("3200.0");
  const [results, setResults] = useState<any[]>([]);

  const ingestMutation = useMutation(
    () =>
      authFetch("/api/v1/integrations/ingest/iot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_id: assetId,
          vibration_rms: parseFloat(vibration),
          temperature_c: parseFloat(temperature),
          runtime_hours: parseFloat(runtime)
        })
      }).then(r => r.json()),
    {
      onSuccess: (data) => {
        setResults(prev => [{
          ...data,
          timestamp: new Date().toLocaleTimeString(),
          vibration_rms: parseFloat(vibration),
          temperature_c: parseFloat(temperature)
        }, ...prev.slice(0, 9)])
      }
    }
  );

  const anomalyCount = results.filter(r => r.anomaly_detected).length;

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <Radio className="w-7 h-7 text-brand" />
            IoT Telemetry Ingestion Gateway
          </h1>
          <p className="text-sm text-secondary mt-1">
            Live sensor data ingestion with anomaly detection and HMAC-signed webhook dispatch
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Readings Ingested" value={results.length} sub="This session" color="blue" />
        <KpiCard label="Anomalies Detected" value={anomalyCount} sub="Above threshold" color={anomalyCount > 0 ? "amber" : "emerald"} status={anomalyCount > 0 ? "warning" : "ok"} />
        <KpiCard label="Vibration Threshold" value="4.5 mm/s" sub="ISO-10816 Standard" color="purple" />
        <KpiCard label="Temp Threshold" value="85°C" sub="Critical Alert Limit" color="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-surface p-6 space-y-5">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Send className="w-4 h-4 text-brand" />
            Inject Sensor Reading
          </h2>
          <div className="space-y-3">
            <Input label="Asset ID" value={assetId} onChange={(e) => setAssetId(e.target.value)} />
            <Input label="Vibration RMS (mm/s)" value={vibration} onChange={(e) => setVibration(e.target.value)} helperText="Threshold: 4.5 mm/s" />
            <Input label="Temperature (°C)" value={temperature} onChange={(e) => setTemperature(e.target.value)} helperText="Alert: >85°C" />
            <Input label="Runtime Hours" value={runtime} onChange={(e) => setRuntime(e.target.value)} />
          </div>

          <Button className="w-full" loading={ingestMutation.isLoading}
            onClick={() => ingestMutation.mutate()}>
            <Send className="w-3.5 h-3.5 mr-1.5" /> Ingest Telemetry
          </Button>

          <div className="p-3 rounded-lg bg-surface-alt border border-border text-xs space-y-1">
            <div className="font-bold text-primary">Anomaly Logic:</div>
            <div className="text-secondary">• Vibration &gt; 4.5 mm/s → AI dispatch</div>
            <div className="text-secondary">• Temperature &gt; 85°C → Critical alert</div>
            <div className="text-secondary">• Audit event logged automatically</div>
          </div>
        </div>

        {/* Results Feed */}
        <div className="lg:col-span-8 rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Activity className="w-4 h-4 text-brand" />
            Live Telemetry Stream ({results.length} readings)
          </h2>
          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {results.map((r: any, i: number) => (
              <div key={i} className={`p-4 rounded-lg border ${
                r.anomaly_detected
                  ? "border-danger-border bg-danger-bg"
                  : "border-border bg-surface-alt"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {r.anomaly_detected && <AlertTriangle className="w-4 h-4 text-danger-text" />}
                    <span className="text-xs font-bold text-primary">{r.asset_id}</span>
                    <span className="text-[11px] text-tertiary">{r.timestamp}</span>
                  </div>
                  <StatusBadge status={r.anomaly_detected ? "ANOMALY" : "NORMAL"} variant={r.anomaly_detected ? "danger" : "success"} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                  <div className={`p-2 rounded ${r.vibration_rms > 4.5 ? "bg-danger-bg text-danger-text" : "bg-surface text-secondary"}`}>
                    Vibration: {r.vibration_rms} mm/s
                  </div>
                  <div className={`p-2 rounded ${r.temperature_c > 85 ? "bg-danger-bg text-danger-text" : "bg-surface text-secondary"}`}>
                    Temp: {r.temperature_c}°C
                  </div>
                  <div className="p-2 rounded bg-surface text-secondary">
                    Action: {r.action_queued || "NONE"}
                  </div>
                </div>
              </div>
            ))}
            {results.length === 0 && (
              <div className="py-20 text-center space-y-3 text-secondary">
                <Radio className="w-12 h-12 mx-auto opacity-20" />
                <p className="text-sm font-medium">No telemetry ingested yet</p>
                <p className="text-xs">Use the panel on the left to inject sensor readings</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
