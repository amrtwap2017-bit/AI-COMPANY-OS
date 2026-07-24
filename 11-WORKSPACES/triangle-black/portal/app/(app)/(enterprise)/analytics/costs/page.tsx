"use client"; // @ts-nocheck

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState, Progress
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchSummary() {
  const r = await fetch(`${BACK}/api/v1/ai/analytics/costs/summary`, { credentials: "include" });
  if (!r.ok) return {};
  return r.json();
}
async function fetchFull() {
  const r = await fetch(`${BACK}/api/v1/ai/analytics/costs`, { credentials: "include" });
  if (!r.ok) return { work_orders: [], contracts: [] };
  return r.json();
}
async function fetchBOQ(type) {
  const r = await fetch(`${BACK}/api/v1/ai/documents/boq/template?wo_type=${type}`, { credentials: "include" });
  if (!r.ok) return null;
  return r.json();
}

const BOQ_TYPES = ["hvac", "electrical", "plumbing", "general"];

export default function CostsPage() {
  const [boqType, setBoqType] = useState(null);
  const [boqData, setBOQData] = useState(null);
  const [loadingBOQ, setLoadingBOQ] = useState(false);

  const { data: summary = {}, isLoading: s1 } = useQuery({
    queryKey: ["costs-summary"], queryFn: fetchSummary, refetchInterval: 300000,
  });
  const { data: full = { work_orders: [], contracts: [] }, isLoading: s2 } = useQuery({
    queryKey: ["costs-full"], queryFn: fetchFull, refetchInterval: 300000,
  });

  const isLoading = s1 || s2;

  const woCost    = summary.total_wo_cost_egp    || 0;
  const avgCost   = summary.avg_wo_cost_egp      || 0;
  const revenue   = summary.total_contract_value || 0;
  const marginPct = summary.overall_margin_pct   || 0;
  const atRisk    = summary.at_risk_contracts    || 0;

  const wos       = full.work_orders  || [];
  const contracts = full.contracts    || [];

  // Group WO costs by type
  const byType = wos.reduce((acc, w) => {
    const t = w.wo_type || "general";
    if (!acc[t]) acc[t] = { count: 0, total: 0 };
    acc[t].count += 1;
    acc[t].total += w.total_cost_egp || 0;
    return acc;
  }, {});
  const maxTypeCost = Math.max(...Object.values(byType).map((v) => v.total), 1);

  const topContracts = [...contracts].sort((a, b) => a.margin_pct - b.margin_pct).slice(0, 5);

  async function loadBOQ(type) {
    setBoqType(type);
    setLoadingBOQ(true);
    const data = await fetchBOQ(type);
    setBOQData(data);
    setLoadingBOQ(false);
  }

  if (isLoading) return <LoadingState message="Loading cost analytics..." />;

  return (
    <PageWrapper>
      <PageHeader
        title="Cost & Profitability"
        subtitle="Operational cost analysis — Program F"
        badge={atRisk > 0 ? `${atRisk} At Risk` : "97.6% Margin"}
      />

      <MetricStrip metrics={[
        { label: "Total WO Cost",  value: `${woCost.toLocaleString()} EGP` },
        { label: "Avg WO Cost",    value: `${avgCost.toLocaleString()} EGP` },
        { label: "Portfolio Rev",  value: `${revenue.toLocaleString()} EGP` },
        { label: "Margin",         value: `${marginPct}%`, color: marginPct >= 30 ? "green" as const : marginPct >= 20 ? "amber" as const : "red" as const },
      ]} />

      <SectionCard title={`Profitability — ${marginPct}% (target 30%)`}>
        <Progress value={Math.min(marginPct, 100)} className="h-4 mb-2" />
        <p className="text-xs text-slate-500">
          Current: {marginPct}% | Target: 30% | Gap: {Math.max(0, 30 - marginPct).toFixed(1)}%
        </p>
      </SectionCard>

      <SectionCard title="WO Cost by Type">
        {Object.keys(byType).length === 0 ? (
          <EmptyState title="No cost data" description="No work orders with cost data" />
        ) : (
          <div className="space-y-3">
            {Object.entries(byType).map(([type, data]) => (
              <div key={type} className="flex items-center gap-3">
                <div className="w-20 text-sm font-medium text-slate-700 capitalize">{type}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 bg-blue-500 rounded-full"
                    style={{ width: `${(data.total / maxTypeCost) * 100}%` }}
                  />
                </div>
                <div className="w-40 text-xs text-slate-500 text-right">
                  {data.total.toLocaleString()} EGP ({data.count} WOs)
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Contract Profitability (Lowest Margin First)">
        {topContracts.length === 0 ? (
          <EmptyState title="No contracts" description="No contract profitability data" />
        ) : (
          <div className="space-y-2">
            {topContracts.map((c) => (
              <div key={c.contract_id} className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                c.profitability === "at_risk" ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"
              }`}>
                <div>
                  <p className="text-sm font-medium text-slate-800">{c.client_name}</p>
                  <p className="text-xs text-slate-500">
                    Value: {(c.contract_value || 0).toLocaleString()} EGP
                    · Cost: {(c.allocated_cost_egp || 0).toLocaleString()} EGP
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${c.margin_pct >= 30 ? "text-green-600" : c.margin_pct >= 20 ? "text-amber-600" : "text-red-600"}`}>
                    {c.margin_pct}%
                  </span>
                  <StatusBadge status={c.profitability === "at_risk" ? "critical" : "active"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="BOQ Templates">
        <div className="flex gap-2 mb-4 flex-wrap">
          {BOQ_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => loadBOQ(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                boqType === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.toUpperCase()} Template
            </button>
          ))}
        </div>
        {loadingBOQ && <LoadingState message="Loading template..." />}
        {boqData && !loadingBOQ && (
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-left py-2 px-2">Unit</th>
                  <th className="text-right py-2">Unit Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {(boqData.lines || []).map((line, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2 text-slate-700">{line.description}</td>
                    <td className="py-2 text-right text-slate-600">{line.quantity}</td>
                    <td className="py-2 px-2 text-slate-500">{line.unit}</td>
                    <td className="py-2 text-right text-slate-600">{(line.unit_price || 0).toLocaleString()}</td>
                    <td className="py-2 text-right font-medium text-slate-800">{(line.line_total || 0).toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-300">
                  <td colSpan={4} className="py-2 font-bold text-slate-800">Total</td>
                  <td className="py-2 text-right font-bold text-blue-700">{(boqData.total_egp || 0).toLocaleString()} EGP</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-slate-400 mt-2 italic">{boqData.note}</p>
          </div>
        )}
        {!boqType && !loadingBOQ && (
          <p className="text-sm text-slate-400 text-center py-4">Select a template above to view BOQ lines</p>
        )}
      </SectionCard>
    </PageWrapper>
  );
}
