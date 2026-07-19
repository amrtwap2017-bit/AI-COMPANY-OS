"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PageHeader, SectionCard, MetricCard, EmptyState, LoadingState, AlertBanner,
} from "@/components/ui";
import { fmtCurrency } from "@/lib/design-tokens";
import {
  TrendingUp, TrendingDown, Award, AlertTriangle,
  BarChart3, ShoppingCart, CheckCircle2, Clock,
  Building2, Star, Package, RefreshCw,
} from "lucide-react";
import {
  fetchVendorPerformance, fetchSpendBySupplier, fetchProcurementKPIs,
  type VendorPerformance, type SpendBySupplier, type ProcurementKPIs,
} from "@/lib/vendor-analytics-api";

// ── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 90
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : score >= 75
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border " + cls}>
      {score > 0 ? score + "/100" : "N/A"}
    </span>
  );
}

// ── Risk badge ────────────────────────────────────────────────────────────────
function RiskBadge({ risk }: { risk: string }) {
  const map: Record<string, string> = {
    low:    "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high:   "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border " + (map[risk] ?? map.medium)}>
      {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
    </span>
  );
}

// ── Horizontal score bar ──────────────────────────────────────────────────────
function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 90 ? "bg-emerald-500" : score >= 75 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={color + " h-2 rounded-full transition-all"} style={{ width: score + "%" }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{score}</span>
    </div>
  );
}

export default function VendorAnalyticsPage() {
  const [performance, setPerformance] = useState<VendorPerformance[]>([]);
  const [spend, setSpend]             = useState<SpendBySupplier[]>([]);
  const [kpis, setKpis]               = useState<ProcurementKPIs | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [refreshing, setRefreshing]   = useState(false);

  // Hardcoded scorecards from DB (supplier_scorecards table)
  const scorecards = [
    { name: "Carrier Egypt",          overall: 94, delivery: 98, quality: 95, price: 90, response: 95, risk: "low",    period: "2026-Q3" },
    { name: "Copper Cable Suppliers", overall: 91, delivery: 90, quality: 92, price: 91, response: 89, risk: "medium", period: "2026-Q3" },
    { name: "Marble Egypt Co.",       overall: 88, delivery: 85, quality: 90, price: 88, response: 85, risk: "low",    period: "2026-Q3" },
  ];

  async function load(showRefresh = false) {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const [perf, sp, kpi] = await Promise.all([
        fetchVendorPerformance(),
        fetchSpendBySupplier(),
        fetchProcurementKPIs(),
      ]);
      setPerformance(perf);
      setSpend(sp);
      setKpis(kpi);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? "Failed to load vendor data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState message="Loading vendor analytics..." />;

  const totalSpend   = spend.reduce((s, v) => s + v.total_spend, 0);
  const topVendor    = spend[0];
  const avgScore     = scorecards.length
    ? Math.round(scorecards.reduce((s, v) => s + v.overall, 0) / scorecards.length)
    : 0;
  const highRisk     = scorecards.filter(s => s.risk === "high").length;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Vendor Performance Analytics"
        subtitle="Spend analysis, scorecards, and procurement KPIs"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={"h-4 w-4 " + (refreshing ? "animate-spin" : "")} />
              Refresh
            </button>
            <Link
              href="/supply-chain/vendors"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Building2 className="h-4 w-4" />
              Vendor Directory
            </Link>
          </div>
        }
      />

      {error && <AlertBanner type="error" title={error} onClose={() => setError(null)} />}

      {/* ── KPI Strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Total Spend (EGP)"
          value={fmtCurrency(kpis?.total_spend ?? 0)}
          icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
          
        />
        <MetricCard
          label="Active Suppliers"
          value={String(kpis?.total_suppliers ?? 0)}
          icon={<Building2 className="h-5 w-5 text-blue-600" />}
          
        />
        <MetricCard
          label="Avg Scorecard"
          value={avgScore + "/100"}
          icon={<Star className="h-5 w-5 text-emerald-600" />}
          
          highlight={avgScore >= 90 ? "good" : undefined}
        />
        <MetricCard
          label="PO Approval Rate"
          value={(kpis?.approval_rate ?? 0).toFixed(1) + "%"}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          
          highlight={(kpis?.approval_rate ?? 0) >= 80 ? "good" : "warn"}
        />
      </div>

      {/* ── Second KPI row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Total Purchase Orders"
          value={String(kpis?.total_pos ?? 0)}
          icon={<ShoppingCart className="h-5 w-5 text-slate-600" />}
          
        />
        <MetricCard
          label="Pending Approval"
          value={String(kpis?.pending_pos ?? 0)}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          
          highlight={(kpis?.pending_pos ?? 0) > 5 ? "warn" : undefined}
        />
        <MetricCard
          label="Active RFQs"
          value={String(kpis?.active_rfqs ?? 0)}
          icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
          
        />
        <MetricCard
          label="High Risk Vendors"
          value={String(highRisk)}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          
          highlight={highRisk > 0 ? "warn" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ── Spend by Supplier ──────────────────────────────────────────────── */}
        <SectionCard
          title="Spend by Supplier"
          subtitle={"Top " + spend.length + " vendors by purchase volume"}
        >
          {spend.length === 0 ? (
            <EmptyState title="No spend data" description="No purchase orders found." />
          ) : (
            <div className="space-y-3 p-4">
              {spend.map((v, idx) => {
                const pct = totalSpend > 0 ? (v.total_spend / totalSpend) * 100 : 0;
                const colors = ["bg-amber-500","bg-blue-500","bg-emerald-500","bg-purple-500","bg-red-500"];
                const color  = colors[idx % colors.length];
                return (
                  <div key={v.supplier_id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{v.company_name}</p>
                        <p className="text-xs text-slate-500 capitalize">{v.supplier_type} · {v.po_count} POs</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{fmtCurrency(v.total_spend)}</p>
                        <p className="text-xs text-slate-500">{pct.toFixed(1)}% of total</p>
                      </div>
                    </div>
                    <div className="bg-slate-100 rounded-full h-2">
                      <div className={color + " h-2 rounded-full"} style={{ width: pct + "%" }} />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                <span>Total procurement spend</span>
                <span className="font-semibold text-slate-900">{fmtCurrency(totalSpend)}</span>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── Supplier Scorecards ────────────────────────────────────────────── */}
        <SectionCard
          title="Supplier Performance Scorecards"
          subtitle={scorecards[0]?.period + " · " + scorecards.length + " evaluated suppliers"}
        >
          <div className="divide-y divide-slate-50">
            {scorecards.map((sc) => (
              <div key={sc.name} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{sc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <RiskBadge risk={sc.risk} />
                    </div>
                  </div>
                  <ScoreBadge score={sc.overall} />
                </div>
                <div className="space-y-2">
                  <ScoreBar label="On-time Delivery" score={sc.delivery} />
                  <ScoreBar label="Quality"          score={sc.quality} />
                  <ScoreBar label="Price Competitive" score={sc.price} />
                  <ScoreBar label="Responsiveness"   score={sc.response} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Vendor Activity Table ──────────────────────────────────────────── */}
      <SectionCard
        title="Vendor Activity"
        subtitle={performance.length + " vendors with procurement activity"}
      >
        {performance.length === 0 ? (
          <EmptyState title="No vendor activity" description="No purchase orders found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Vendor</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">POs</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Total Value</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Invoices</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {performance.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                          {v.company_name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{v.company_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">{v.purchase_orders_count}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">{fmtCurrency(v.purchase_orders_total)}</td>
                    <td className="py-3 px-4 text-right text-slate-700">{v.supplier_invoices_count}</td>
                    <td className="py-3 px-4 text-center">
                      <ScoreBadge score={v.avg_score} />
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
