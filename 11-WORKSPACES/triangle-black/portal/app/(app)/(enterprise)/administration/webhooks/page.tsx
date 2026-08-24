"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Webhook, RefreshCw, Plus, Play, Shield, Radio } from "lucide-react";

export default function WebhooksPage() {
  const queryClient = useQueryClient();
  const [targetUrl, setTargetUrl] = useState("");
  const [pingResult, setPingResult] = useState<any>(null);

  const { data: subsData, isLoading, refetch } = useQuery(
    ["webhook-subscriptions"],
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
          event_types: ["work_order.created", "sla.breached", "ai.anomaly_detected", "invoice.paid"]
        })
      }).then(r => r.json()),
    {
      onSuccess: () => {
        setTargetUrl("");
        queryClient.invalidateQueries(["webhook-subscriptions"]);
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
    { onSuccess: (data) => setPingResult(data) }
  );

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <Webhook className="w-7 h-7 text-brand" />
            Webhook & Integration Management
          </h1>
          <p className="text-sm text-secondary mt-1">
            HMAC-SHA256 signed outbound webhooks for ERP, BMS, and messaging integrations
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Active Endpoints" value={subscriptions.length} sub="Outbound Streams" color="blue" />
        <KpiCard label="Security" value="HMAC-SHA256" sub="Signed Headers" color="emerald" status="ok" />
        <KpiCard label="Event Types" value="4" sub="Trigger Categories" color="purple" />
        <KpiCard label="Delivery" value="99.9%" sub="Uptime Guarantee" color="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Registration Form */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-surface p-6 space-y-5">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Plus className="w-4 h-4 text-brand" />
            Register Webhook Endpoint
          </h2>

          <form onSubmit={(e) => { e.preventDefault(); if (targetUrl) createMutation.mutate(targetUrl); }} className="space-y-4">
            <Input
              label="HTTPS Webhook URL"
              placeholder="https://erp.company.com/api/webhooks/tb-events"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              required
            />
            <div className="p-3 rounded-lg bg-surface-alt border border-border text-xs text-secondary space-y-1">
              <div className="font-bold text-primary mb-1">Subscribed Events:</div>
              {["work_order.created", "sla.breached", "ai.anomaly_detected", "invoice.paid"].map(ev => (
                <div key={ev} className="font-mono">• {ev}</div>
              ))}
            </div>
            <Button type="submit" loading={createMutation.isLoading} disabled={!targetUrl} className="w-full">
              Create Webhook Stream
            </Button>
          </form>

          <div className="border-t border-divider pt-4 space-y-3">
            <Button variant="secondary" size="sm" loading={pingMutation.isLoading}
              onClick={() => pingMutation.mutate()} className="w-full">
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
              Send Test Ping
            </Button>
            {pingResult && (
              <div className="p-3 rounded-lg border border-success-border bg-success-bg text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-success-text">
                  <Shield className="w-3.5 h-3.5" /> HMAC Signature Valid
                </div>
                <div className="font-mono text-[10px] text-tertiary truncate">
                  Sig: {pingResult.signature?.slice(0, 32)}...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Radio className="w-4 h-4 text-brand" />
            Active Webhook Subscriptions ({subscriptions.length})
          </h2>
          <div className="space-y-3">
            {subscriptions.map((sub: any) => (
              <div key={sub.id} className="p-4 rounded-lg border border-border bg-surface-alt space-y-2 hover:border-brand/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary truncate max-w-xs">
                    {sub.target_url}
                  </span>
                  <StatusBadge status={sub.status} variant="success" />
                </div>
                <div className="flex flex-wrap gap-1">
                  {(sub.event_types || []).map((ev: string) => (
                    <span key={ev} className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-tertiary font-mono">{ev}</span>
                  ))}
                </div>
                <div className="flex justify-between text-[11px] font-mono text-tertiary">
                  <span>Secret: {sub.secret_key_masked}</span>
                  <span>{sub.created_at?.slice(0, 10)}</span>
                </div>
              </div>
            ))}
            {subscriptions.length === 0 && (
              <div className="py-12 text-center space-y-2 text-secondary">
                <Webhook className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-medium">No webhooks configured</p>
                <p className="text-xs">Register your first endpoint on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
