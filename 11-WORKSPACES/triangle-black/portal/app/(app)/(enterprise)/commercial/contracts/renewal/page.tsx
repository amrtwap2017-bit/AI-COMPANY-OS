// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  PageHeader, SectionCard, MetricCard, EmptyState, LoadingState, AlertBanner,
} from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { fmtCurrency } from "@/lib/design-tokens";
import {
  FileText, AlertTriangle, Clock, CheckCircle2,
  DollarSign, RefreshCw, RotateCcw, Zap,
} from "lucide-react";
import {
  fetchRenewalPipeline, renewContract,
  type ContractPipelineItem, type RenewalPipeline,
} from "@/lib/contracts-api";

// ── Urgency badge ─────────────────────────────────────────────────────────────
function UrgencyBadge({ urgency, days }: { urgency: string; days: number }) {
  const map: Record<string, string> = {
    critical: "bg-red-600 text-white",
    high:     "bg-amber-50 text-amber-700 border border-amber-300",
    medium:   "bg-blue-50 text-blue-700 border border-blue-200",
    low:      "bg-slate-100 text-slate-600",
  };
  return (
    <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold " + (map[urgency] ?? map.low)}>
      {urgency === "critical" && <Zap className="h-3 w-3" />}
      {days} days
    </span>
  );
}

// ── Contract row ──────────────────────────────────────────────────────────────
function ContractRow({ contract, onRenew, renewing }: {
  contract: ContractPipelineItem;
  onRenew: (id: string) => void;
  renewing: boolean;
}) {
  const endDate = contract.end_date ? new Date(contract.end_date).toLocaleDateString("en-GB") : "—";
  return (
    <tr className={"hover:bg-slate-50 transition-colors " +
      (contract.urgency === "critical" ? "bg-red-50/30" : "")}>
      <td className="py-3 px-4">
        <p className="font-semibold text-slate-900 text-sm">{contract.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          Renewed {contract.renewal_count}x · {contract.duration_months}mo term
        </p>
      </td>
      <td className="py-3 px-4 text-center">
        <UrgencyBadge urgency={contract.urgency} days={contract.days_until_expiry} />
      </td>
      <td className="py-3 px-4 text-right text-slate-700">{endDate}</td>
      <td className="py-3 px-4 text-right">
        <p className="font-semibold text-slate-900">{fmtCurrency(contract.total_value)}</p>
        <p className="text-xs text-slate-500">{fmtCurrency(contract.monthly_value)}/mo</p>
      </td>
      <td className="py-3 px-4 text-right">
        <button
          onClick={() => onRenew(contract.id)}
          disabled={renewing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors ml-auto"
        >
          <RotateCcw className="h-3 w-3" />
          Renew
        </button>
      </td>
    </tr>
  );
}

// ── Bucket section ────────────────────────────────────────────────────────────
function BucketSection({ title, contracts, color, icon, onRenew, renewingId }: {
  title: string;
  contracts: ContractPipelineItem[];
  color: string;
  icon: React.ReactNode;
  onRenew: (id: string) => void;
  renewingId: string | null;
}) {
  if (contracts.length === 0) return null;
  return (
    <SectionCard
      title={title}
      subtitle={contracts.length + " contract" + (contracts.length > 1 ? "s" : "") + " · " +
        fmtCurrency(contracts.reduce((s, c) => s + c.total_value, 0)) + " total value"}
      actions={<div className={"flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium " + color}>{icon}</div>}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Contract</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Expires In</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">End Date</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Value</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {contracts.map(c => (
              <ContractRow key={c.id} contract={c} onRenew={onRenew} renewing={renewingId === c.id} />
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

export default function ContractRenewalPage() {
  const [pipeline, setPipeline]   = useState<RenewalPipeline | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);
  const [renewingId, setRenewing] = useState<string | null>(null);
  const [refreshing, setRefresh]  = useState(false);

  async function load(refresh = false) {
    try {
      if (refresh) setRefresh(true);
      else setLoading(true);
      setError(null);
      setPipeline(await fetchRenewalPipeline());
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? "Failed to load pipeline");
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRenew(contractId: string) {
    setRenewing(contractId);
    try {
      setError(null);
      await renewContract(contractId);
      setSuccess("Contract renewed successfully");
      await load(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? "Renewal failed");
    } finally {
      setRenewing(null);
      setTimeout(() => setSuccess(null), 4000);
    }
  }

  if (loading) return <LoadingState message="Loading renewal pipeline..." />;

  const summary = pipeline?.summary;

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb/>
      <PageHeader
        title="Contract Renewal Pipeline"
        subtitle="30/60/90 day expiry alerts and one-click renewal"
        actions={
          <button onClick={() => load(true)} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={"h-4 w-4 " + (refreshing ? "animate-spin" : "")} />
            Refresh
          </button>
        }
      />

      {error   && <AlertBanner type="error"   title={error}   onClose={() => setError(null)} />}
      {success && <AlertBanner type="success" title={success} onClose={() => setSuccess(null)} />}

      {(summary?.expiring_30_days ?? 0) > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">
              {summary!.expiring_30_days} contract{summary!.expiring_30_days > 1 ? "s" : ""} expiring within 30 days
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {fmtCurrency(summary!.value_at_risk_30d)} at risk — renew immediately
            </p>
          </div>
        </div>
      )}

      {/* KPI Strip */}
      {summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard label="Active Contracts" value={String(summary.total_active)}
            icon={<FileText className="h-5 w-5 text-blue-600" />}  />
          <MetricCard label="Expiring in 30 Days" value={String(summary.expiring_30_days)}
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />} 
            highlight={summary.expiring_30_days > 0 ? "warn" : undefined} />
          <MetricCard label="Expiring in 60 Days" value={String(summary.expiring_60_days)}
            icon={<Clock className="h-5 w-5 text-amber-600" />} 
            highlight={summary.expiring_60_days > 0 ? "warn" : undefined} />
          <MetricCard label="Monthly Recurring"
            value={fmtCurrency(summary.total_monthly_value)}
            icon={<DollarSign className="h-5 w-5 text-emerald-600" />}  />
        </div>
      )}

      <BucketSection title="Critical — Expiring Within 30 Days"
        contracts={pipeline?.expiring_30 ?? []}
        color="text-red-700 bg-red-50"
        icon={<><Zap className="h-3.5 w-3.5" /><span>Immediate action</span></>}
        onRenew={handleRenew} renewingId={renewingId} />

      <BucketSection title="Urgent — Expiring Within 60 Days"
        contracts={pipeline?.expiring_60 ?? []}
        color="text-amber-700 bg-amber-50"
        icon={<><AlertTriangle className="h-3.5 w-3.5" /><span>Action required</span></>}
        onRenew={handleRenew} renewingId={renewingId} />

      <BucketSection title="Upcoming — Expiring Within 90 Days"
        contracts={pipeline?.expiring_90 ?? []}
        color="text-blue-700 bg-blue-50"
        icon={<><Clock className="h-3.5 w-3.5" /><span>Plan renewal</span></>}
        onRenew={handleRenew} renewingId={renewingId} />

      {(pipeline?.later?.length ?? 0) > 0 && (
        <SectionCard title="Healthy Contracts" subtitle="Expiring in 90+ days — no action needed">
          <div className="p-4">
            {pipeline!.later.map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.title}</p>
                  <p className="text-xs text-slate-500">{c.days_until_expiry} days · {fmtCurrency(c.total_value)}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {!pipeline?.expiring_30?.length && !pipeline?.expiring_60?.length && !pipeline?.expiring_90?.length && (
        <div className="flex items-center gap-3 p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800">All contracts are healthy</p>
            <p className="text-sm text-emerald-600 mt-0.5">No contracts expiring within the next 90 days.</p>
          </div>
        </div>
      )}
    </div>
  );
}
