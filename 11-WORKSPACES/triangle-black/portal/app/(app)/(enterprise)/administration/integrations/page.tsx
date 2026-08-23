"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Webhook, Cpu, ShieldCheck, Key, Play,
  Plus, CheckCircle2, RefreshCw, Zap, Radio
} from "lucide-react";

export default function IntegrationsWorkbenchPage() {
  const queryClient = useQueryClient();
  const [targetUrl, setTargetUrl] = useState("");
  const [testResult, setTestResult] = useState<any>(null);

  const { data: subsData, isLoading, refetch } = useQuery(
    ["webhook-subscriptions-list"],
    () => authFetch("/api/v1/integrations/webhooks/subscriptions").then(r => r.json()),
    { staleTime: 30000 }
  );

  const subscriptions = subsData?.subscriptions || [];

  const createMutation = useMutation(
    (url: string) =>
      authFetch("/api/v1/integrations/webhooks/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_url: url,
          event_types: ["work_order.created", "sla.breached", "ai.anomaly_detected"]
        })
      }).then(r => r.json()),
    {
      onSuccess: () => {
        setTargetUrl("");
        queryClient.invalidateQueries(["webhook-subscriptions-list"]);
      }
    }
  );

  const pingMutation = useMutation(
    () =>
      authFetch("/api/v1/integrations/webhooks/test-ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      }).then(r => r.json()),
    {
      onSuccess: (data) => setTestResult(data)
    }
  );

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Webhook className="w-7 h-7 text-brand" />
              Enterprise Integrations & Webhook Workbench
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              HMAC-SHA256 Signed
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Configure outbound real-time webhook streams and inbound IoT telemetry gateways for third-party ERPs and BMS.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Active Webhook Endpoints" value={subscriptions.length} sub="Outbound Event Streams" color="emerald" status="ok" />
        <KpiCard label="Security Verification" value="HMAC SHA-256" sub="Signed Headers Active" color="blue" status="ok" />
        <KpiCard label="Inbound IoT Gateways" value="Connected" sub="Vibration & Temp Streams" color="purple" />
        <KpiCard label="Delivery Reliability" value="99.9%" sub="Retry Queue Online" color="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Create Subscription */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Plus className="w-4 h-4 text-brand" />
            Register Webhook Endpoint
          </h2>

          <form onSubmit={(e) => { e.preventDefault(); if (targetUrl) createMutation.mutate(targetUrl); }} className="space-y-4">
            <Input
              label="HTTPS Target Webhook URL"
              placeholder="https://erp.hotelgroup.com/api/v1/tb-events"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              required
            />

            <div className="p-3.5 rounded-lg bg-surface-alt border border-border text-xs text-secondary space-y-1">
              <div className="font-bold text-primary">Subscribed Event Triggers:</div>
              <div>• `work_order.created` (Dispatch telemetry)</div>
              <div>• `sla.breached` (Escalation alert)</div>
              <div>• `ai.anomaly_detected` (Sensor anomaly flag)</div>
            </div>

            <Button type="submit" loading={createMutation.isLoading} disabled={!targetUrl} className="w-full">
              Create Webhook Stream
            </Button>
          </form>

          {/* Test Ping Trigger */}
          <div className="pt-4 border-t border-divider space-y-2">
            <Button
              variant="secondary"
              size="sm"
              loading={pingMutation.isLoading}
              onClick={() => pingMutation.mutate()}
              className="w-full"
            >
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
              Dispatch Test Ping Payload
            </Button>

            {testResult && (
              <div className="p-3 rounded-lg border border-success-border bg-success-bg text-success-text text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Signature Computed Successfully
                </div>
                <div className="font-mono text-[10px] truncate">X-TB-Signature: {testResult.signature}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Webhooks List */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Radio className="w-4 h-4 text-brand" />
            Active Webhook Subscriptions
          </h2>

          {isLoading ? (
            <div className="py-12 text-center text-secondary text-sm">Loading endpoints...</div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub: any) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-lg border border-border bg-surface-alt space-y-2 hover:border-brand/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-primary truncate max-w-xs">{sub.target_url}</span>
                    <StatusBadge status={sub.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-secondary">
                    <span>Events: {sub.event_types.join(", ")}</span>
                    <span className="font-mono text-tertiary">Secret: {sub.secret_key_masked}</span>
                  </div>
                </div>
              ))}

              {subscriptions.length === 0 && (
                <div className="text-center py-12 text-secondary space-y-2">
                  <Webhook className="w-10 h-10 text-tertiary mx-auto opacity-50" />
                  <p className="text-sm font-medium">No webhook endpoints configured yet.</p>
                  <p className="text-xs text-tertiary">Register your enterprise ERP or messaging endpoint on the left.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
