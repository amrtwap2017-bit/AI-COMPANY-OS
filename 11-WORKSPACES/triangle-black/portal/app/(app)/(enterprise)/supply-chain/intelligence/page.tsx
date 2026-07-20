// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { procurementIntelligenceApi } from "@/lib/procurement-intelligence-api";
import { useState } from "react";
import {
  TrendingUp, Package, Users, FileText, AlertTriangle,
  CheckCircle, BarChart3, Star, RefreshCw, Zap,
} from "lucide-react";

const scoreColor = (s: number) =>
  s >= 75 ? "text-emerald-600" : s >= 50 ? "text-amber-600" : "text-red-600";

const scoreBg = (s: number) =>
  s >= 75 ? "bg-emerald-100 border-emerald-200" : s >= 50 ? "bg-amber-100 border-amber-200" : "bg-red-100 border-red-200";

const recBadge: Record<string, string> = {
  preferred: "bg-emerald-100 text-emerald-700",
  approved: "bg-blue-100 text-blue-700",
  under_review: "bg-amber-100 text-amber-700",
  neutral: "bg-gray-100 text-gray-700",
};

const riskBadge: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

function KpiCard({ label, value, sub, icon: Icon, color = "amber" }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</span>
        <Icon className={`w-4 h-4 text-${color}-500`} />
      </div>
      <div className={`text-2xl font-bold text-${color}-600`}>{value ?? "—"}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function ProcurementIntelligencePage() {
  const [tab, setTab] = useState<"spend" | "suppliers" | "rfq">("spend");
  const [rfqCategory, setRfqCategory] = useState("all");

  const kpiQ = useQuery({ queryKey: ["pi-kpis"], queryFn: () => procurementIntelligenceApi.kpis() });
  const summaryQ = useQuery({ queryKey: ["pi-spend-summary"], queryFn: () => procurementIntelligenceApi.spendSummary() });
  const catQ = useQuery({ queryKey: ["pi-spend-cat"], queryFn: () => procurementIntelligenceApi.spendByCategory() });
  const supQ = useQuery({ queryKey: ["pi-spend-sup"], queryFn: () => procurementIntelligenceApi.spendBySupplier(10) });
  const intQ = useQuery({ queryKey: ["pi-sup-intelligence"], queryFn: () => procurementIntelligenceApi.supplierIntelligence() });
  const recQ = useQuery({ queryKey: ["pi-rfq-rec", rfqCategory], queryFn: () => procurementIntelligenceApi.rfqRecommendations(rfqCategory) });
  const benchQ = useQuery({ queryKey: ["pi-benchmark"], queryFn: () => procurementIntelligenceApi.priceBenchmark("MEP") });

  const kpis = (kpiQ.data as any)?.kpis || {};
  const summary = summaryQ.data || {};
  const categories = (catQ.data as any)?.items || [];
  const topSuppliers = (supQ.data as any)?.items || [];
  const intelligence = (intQ.data as any)?.items || [];
  const recommendations = (recQ.data as any)?.recommendations || [];
  const benchmarks = (benchQ.data as any)?.items || [];

  const fmt = (n: number) => n >= 1000000 ? `EGP ${(n/1000000).toFixed(1)}M` : n >= 1000 ? `EGP ${(n/1000).toFixed(0)}K` : `EGP ${n}`;

  return (
    <div className="p-6 space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement Intelligence</h1>
          <p className="text-sm text-gray-500 mt-1">Spend analysis · Supplier scoring · RFQ optimization · Price benchmarking</p>
        </div>
        <button onClick={() => { kpiQ.refetch(); summaryQ.refetch(); intQ.refetch(); }}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total Spend" value={fmt(summary.total_spend || 0)} sub={`${kpis.total_pos || 0} purchase orders`} icon={TrendingUp} color="amber" />
        <KpiCard label="Active Suppliers" value={kpis.total_suppliers || 0} sub={`${summary.active_suppliers || 0} with orders`} icon={Users} color="blue" />
        <KpiCard label="Active RFQs" value={kpis.active_rfqs || 0} sub="open for quotation" icon={FileText} color="purple" />
        <KpiCard label="Approval Rate" value={`${kpis.approval_rate || 0}%`} sub={`${kpis.approved_pos || 0} approved POs`} icon={CheckCircle} color="emerald" />
      </div>

      {/* tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["spend","suppliers","rfq"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "spend" ? "Spend Analysis" : t === "suppliers" ? "Supplier Intelligence" : "RFQ & Pricing"}
          </button>
        ))}
      </div>

      {/* SPEND TAB */}
      {tab === "spend" && (
        <div className="grid grid-cols-2 gap-6">
          {/* spend by category */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-900">Spend by Category</span>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </div>
            <div className="p-4 space-y-3">
              {categories.length === 0 && <div className="text-sm text-gray-400 text-center py-6">No spend data yet</div>}
              {categories.map((cat: any, i: number) => {
                const total = categories.reduce((s: number, c: any) => s + (c.total || 0), 0);
                const pct = total > 0 ? Math.round((cat.total / total) * 100) : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 capitalize">{cat.category || "Uncategorized"}</span>
                      <span className="text-gray-500">{fmt(cat.total || 0)} · {pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-gray-400">{cat.po_count} orders</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* top suppliers by spend */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-900">Top Suppliers by Spend</span>
              <Package className="w-4 h-4 text-gray-400" />
            </div>
            <div className="divide-y divide-gray-50">
              {topSuppliers.length === 0 && <div className="text-sm text-gray-400 text-center py-8">No spend data yet</div>}
              {topSuppliers.map((sup: any, i: number) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{sup.company_name}</div>
                    <div className="text-xs text-gray-400 capitalize">{sup.supplier_type} · {sup.po_count} orders</div>
                  </div>
                  <div className="text-sm font-bold text-amber-600">{fmt(sup.total_spend || 0)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* spend summary cards */}
          <div className="col-span-2 grid grid-cols-3 gap-4">
            {[
              { label: "Total Invoiced", value: fmt(summary.total_invoiced || 0), color: "blue" },
              { label: "Pending Spend", value: fmt(summary.pending_spend || 0), color: "amber" },
              { label: "Approved Spend", value: fmt(summary.approved_spend || 0), color: "emerald" },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{card.label}</div>
                <div className={`text-xl font-bold text-${card.color}-600`}>{card.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUPPLIERS TAB */}
      {tab === "suppliers" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-900">Supplier Intelligence Scores</span>
            <span className="text-xs text-gray-400">{intelligence.length} suppliers evaluated</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Score</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Risk</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Orders</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Spend</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {intelligence.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No suppliers found</td></tr>
              )}
              {intelligence.map((sup: any) => (
                <tr key={sup.supplier_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{sup.company_name}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{sup.supplier_type || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-lg font-bold ${scoreColor(sup.intelligence_score)}`}>{sup.intelligence_score}</span>
                    <span className="text-xs text-gray-400">/100</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${riskBadge[sup.risk_level] || "bg-gray-100 text-gray-600"}`}>
                      {sup.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{sup.total_orders}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{fmt(sup.total_spend || 0)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${recBadge[sup.recommendation] || "bg-gray-100 text-gray-600"}`}>
                      {sup.recommendation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RFQ TAB */}
      {tab === "rfq" && (
        <div className="grid grid-cols-2 gap-6">
          {/* supplier recommendations */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <span className="font-semibold text-sm text-gray-900">Supplier Recommendations</span>
              <select value={rfqCategory} onChange={e => setRfqCategory(e.target.value)}
                className="ml-auto text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
                {["all","mep","electrical","hvac","plumbing","general","fire_fighting"].map(c => (
                  <option key={c} value={c}>{c === "all" ? "All Categories" : c.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="divide-y divide-gray-50">
              {recommendations.length === 0 && <div className="text-sm text-gray-400 text-center py-8">No recommendations</div>}
              {recommendations.map((sup: any, i: number) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {i === 0 && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                        {sup.company_name}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{sup.reason}</div>
                    </div>
                    <div className={`text-sm font-bold px-2 py-1 rounded-lg border ${scoreBg(sup.recommended_score)}`}>
                      <span className={scoreColor(sup.recommended_score)}>{sup.recommended_score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* price benchmark */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-900">Price Benchmark — MEP</span>
              <Star className="w-4 h-4 text-gray-400" />
            </div>
            <div className="divide-y divide-gray-50">
              {benchmarks.length === 0 && <div className="text-sm text-gray-400 text-center py-8">No benchmark data — add catalog items</div>}
              {benchmarks.map((item: any, i: number) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.unit}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">EGP {item.unit_price}</div>
                    <div className="text-xs text-gray-400">{item.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
