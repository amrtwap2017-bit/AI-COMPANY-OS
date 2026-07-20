// @ts-nocheck

"use client";
import { useState, useEffect } from "react";
import { PageHeader, SectionCard, MetricCard, EmptyState, LoadingState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Activity, Clock, ShieldCheck, AlertTriangle, RefreshCw, Briefcase } from "lucide-react";
import { fetchSlaSummary, fetchContractSlas, type SlaSummary, type ContractSla } from "@/lib/sla-api";

function ComplianceBadge({ pct }: { pct: number }) {
  const cls = pct >= 95 ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
            : pct >= 85 ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border " + cls}>
      {pct.toFixed(1)}%
    </span>
  );
}

export default function SlaTrackingPage() {
  const [summary, setSummary] = useState<SlaSummary | null>(null);
  const [contracts, setContracts] = useState<ContractSla[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load(showRefresh = false) {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const [sum, con] = await Promise.all([fetchSlaSummary(), fetchContractSlas()]);
      setSummary(sum);
      setContracts(con);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? "Failed to load SLA data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState message="Loading SLA analytics..." />;

  const isHealthy = (summary?.compliance_pct ?? 0) >= 95;

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb/>
      <PageHeader
        title="SLA Tracking Dashboard"
        subtitle="Response and resolution performance across active contracts"
        actions={
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={"h-4 w-4 " + (refreshing ? "animate-spin" : "")} />
            Refresh
          </button>
        }
      />

      {error && <AlertBanner type="error" title={error} onClose={() => setError(null)} />}
      
      {!isHealthy && summary && summary.compliance_pct > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              SLA Compliance is below 95% threshold ({summary.compliance_pct.toFixed(1)}%)
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Review the contract breakdown below to identify lagging performance.
            </p>
          </div>
        </div>
      )}

      {/* KPI Strip */}
      {summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Overall Compliance"
            value={summary.compliance_pct.toFixed(1) + "%"}
            icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
            
            highlight={summary.compliance_pct >= 95 ? "good" : "warn"}
          />
          <MetricCard
            label="Avg Response Time"
            value={summary.avg_response_hrs.toFixed(1) + "h"}
            icon={<Activity className="h-5 w-5 text-blue-600" />}
            
          />
          <MetricCard
            label="Avg Resolution Time"
            value={summary.avg_resolution_hrs.toFixed(1) + "h"}
            icon={<Clock className="h-5 w-5 text-slate-600" />}
            
          />
          <MetricCard
            label="Total Breaches"
            value={String(summary.total_breaches)}
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            
            highlight={summary.total_breaches > 0 ? "warn" : undefined}
          />
        </div>
      )}

      <SectionCard title="Performance by Contract" subtitle={contracts.length + " tracked contracts"}>
        {contracts.length === 0 ? (
          <EmptyState title="No contract data" description="No work orders linked to contracts found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Contract</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Total WOs</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Avg Response</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Avg Resolution</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Breaches</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {contracts.map(c => (
                  <tr key={c.contract_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{c.contract_name || "Unassigned / General"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">{c.total_wos}</td>
                    <td className="py-3 px-4 text-right text-slate-700 font-mono">{c.avg_response_hrs.toFixed(1)}h</td>
                    <td className="py-3 px-4 text-right text-slate-700 font-mono">{c.avg_resolution_hrs.toFixed(1)}h</td>
                    <td className="py-3 px-4 text-right">
                      {c.breaches > 0 ? (
                        <span className="text-red-600 font-semibold">{c.breaches}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <ComplianceBadge pct={c.compliance_pct} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
