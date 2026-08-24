"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CreditCard, RefreshCw, ArrowRight, CheckCircle2, Zap } from "lucide-react";

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);

  const { data: plansData } = useQuery(
    ["plans-matrix"],
    () => fetch("/api/v1/plans/matrix").then(r => r.json()),
    { staleTime: 300000 }
  );

  const { data: entitlements, refetch } = useQuery(
    ["my-entitlements"],
    () => authFetch("/api/v1/plans/my-entitlements").then(r => r.json()),
    { staleTime: 30000 }
  );

  const checkoutMutation = useMutation(
    (planId: string) =>
      authFetch("/api/v1/billing/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId })
      }).then(r => r.json()),
    { onSuccess: (data) => setCheckoutResult(data) }
  );

  const plans = plansData?.plans || [];
  const activePlan = entitlements?.active_plan || "foundation";
  const usage = entitlements?.usage || {};

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-brand" />
            SaaS Subscription & Billing
          </h1>
          <p className="text-sm text-secondary mt-1">
            Manage your platform tier, usage limits, and billing
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border border-brand bg-brand-light/30 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-primary flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand" />
              Active Subscription: <span className="capitalize ml-1">{entitlements?.tier_name || activePlan}</span>
            </h2>
            <p className="text-xs text-secondary mt-1">Status: {entitlements?.status || "active"}</p>
          </div>
          <StatusBadge status="active" variant="success" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Assets Used" value={usage.assets_used ?? "—"} sub={`Limit: ${usage.assets_limit ?? "—"}`} color="blue" />
          <KpiCard label="Active Users" value={usage.users_active ?? "—"} sub={`Limit: ${usage.users_limit ?? "—"}`} color="purple" />
          <KpiCard label="Enabled Features" value={(entitlements?.enabled_features || []).length} sub="Intelligence modules" color="emerald" status="ok" />
          <KpiCard label="Platform Tier" value={activePlan.toUpperCase()} sub="Current subscription" color="brand" />
        </div>
      </div>

      {/* Plan Selection */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-primary">Upgrade Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan: any) => (
            <div
              key={plan.id}
              className={`rounded-xl border p-6 space-y-4 cursor-pointer transition-all relative ${
                plan.is_featured ? "border-brand ring-1 ring-brand shadow-md" :
                selectedPlan === plan.id ? "border-brand" :
                "border-border hover:border-brand/40"
              } ${plan.id === activePlan ? "opacity-75" : ""}`}
              onClick={() => setSelectedPlan(plan.id === activePlan ? null : plan.id)}
            >
              {plan.is_featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold bg-brand text-white">
                  {plan.badge}
                </span>
              )}
              {plan.id === activePlan && (
                <span className="absolute top-3 right-3 text-[10px] font-bold text-success-text bg-success-bg px-2 py-0.5 rounded-full border border-success-border">
                  CURRENT
                </span>
              )}

              <div>
                <h3 className="text-sm font-bold text-primary">{plan.name}</h3>
                <p className="text-xs text-secondary mt-0.5">{plan.tagline}</p>
              </div>

              <div>
                <span className="text-3xl font-black text-primary">${plan.annual_price_usd}</span>
                <span className="text-xs text-secondary"> /mo · annual</span>
              </div>

              <ul className="space-y-1.5 text-xs text-secondary">
                {plan.features?.slice(0, 4).map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {selectedPlan === plan.id && plan.id !== activePlan && (
                <Button
                  variant="primary"
                  className="w-full"
                  loading={checkoutMutation.isLoading}
                  onClick={(e) => { e.stopPropagation(); checkoutMutation.mutate(plan.id); }}
                >
                  Upgrade to {plan.name.split(" ")[0]}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Result */}
      {checkoutResult && (
        <div className="p-4 rounded-xl border border-success-border bg-success-bg space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm font-bold text-success-text">Checkout Session Created</span>
          </div>
          <p className="text-xs text-secondary">Plan: <strong>{checkoutResult.plan_id}</strong></p>
          <p className="text-xs font-mono text-tertiary break-all">{checkoutResult.checkout_url}</p>
        </div>
      )}
    </div>
  );
}
