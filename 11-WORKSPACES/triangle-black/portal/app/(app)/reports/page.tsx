// @ts-nocheck
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TrendRow {
  month: string;
  approved_quotes: number;
  active_contracts: number;
  invoices_sent: number;
  invoices_paid: number;
}

interface FunnelStage {
  key: string;
  label: string;
  count: number;
}

interface AgentRow {
  agent_id: string;
  name: string;
  email: string;
  current_leads: number;
  max_leads: number;
  utilization_pct: number;
  quotes_sent: number;
  quotes_approved: number;
  contracts_active: number;
  approval_rate: number;
}

// ── Formatters ────────────────────────────────────────────────────────────────

const EGP = (n: number) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(n);

const PCT = (n: number) => `${Number(n).toFixed(1)}%`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [trendMonths, setTrendMonths] = useState(12);
  const [exportingInv, setExportingInv] = useState(false);
  const [exportingCon, setExportingCon] = useState(false);

  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ["revenue-trend", trendMonths],
    queryFn: () => reportsApi.getRevenueTrend(trendMonths),
  });

  const { data: funnelData, isLoading: funnelLoading } = useQuery({
    queryKey: ["lead-funnel"],
    queryFn: reportsApi.getLeadFunnel,
  });

  const { data: leaderData, isLoading: leaderLoading } = useQuery({
    queryKey: ["agent-leaderboard"],
    queryFn: reportsApi.getAgentLeaderboard,
  });

  const handleExportInvoices = async () => {
    setExportingInv(true);
    try { await reportsApi.exportInvoicesCsv(); }
    finally { setExportingInv(false); }
  };

  const handleExportContracts = async () => {
    setExportingCon(true);
    try { await reportsApi.exportContractsCsv(); }
    finally { setExportingCon(false); }
  };

  // Max funnel count for bar scaling
  const funnelMax = funnelData?.stages?.[0]?.count || 1;

  // Max trend value across all series for bar scaling
  const trendMax = trendData?.series
    ? Math.max(
        ...trendData.series.flatMap((r: TrendRow) => [
          r.approved_quotes, r.active_contracts,
          r.invoices_sent, r.invoices_paid,
        ]),
        1
      )
    : 1;

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B4B]">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Revenue trends, pipeline funnel and agent performance
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleExportInvoices}
            disabled={exportingInv}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200
                       bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50
                       transition-colors flex items-center gap-2"
          >
            {exportingInv ? "Exporting…" : "⬇ Invoices CSV"}
          </button>
          <button
            onClick={handleExportContracts}
            disabled={exportingCon}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200
                       bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50
                       transition-colors flex items-center gap-2"
          >
            {exportingCon ? "Exporting…" : "⬇ Contracts CSV"}
          </button>
        </div>
      </div>

      {/* ── Revenue Trend ── */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-lg font-semibold text-[#1B2B4B]">Revenue Trend</h2>
          <div className="flex gap-2">
            {[6, 12, 24].map((m) => (
              <button
                key={m}
                onClick={() => setTrendMonths(m)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  trendMonths === m
                    ? "bg-[#1B2B4B] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {m}M
              </button>
            ))}
          </div>
        </div>

        {trendLoading && (
          <div className="h-32 flex items-center justify-center text-sm text-gray-400">
            Loading trend data…
          </div>
        )}

        {trendData && (
          <>
            {/* Totals summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Approved Quotes",  key: "approved_quotes",  color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Active Contracts", key: "active_contracts", color: "text-blue-600",   bg: "bg-blue-50"   },
                { label: "Invoices Sent",    key: "invoices_sent",    color: "text-amber-500",  bg: "bg-amber-50"  },
                { label: "Invoices Paid",    key: "invoices_paid",    color: "text-green-600",  bg: "bg-green-50"  },
              ].map(({ label, key, color, bg }) => (
                <div key={key} className={`${bg} rounded-xl p-4`}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-xl font-bold ${color}`}>
                    {EGP(trendData.totals[key] ?? 0)}
                  </p>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-end gap-3 min-w-max">
                {trendData.series.map((row: TrendRow) => (
                  <div key={row.month} className="flex flex-col items-center gap-1">
                    <div className="flex items-end gap-[3px] h-28">
                      {[
                        { val: row.approved_quotes,  color: "bg-purple-400" },
                        { val: row.active_contracts, color: "bg-blue-400"   },
                        { val: row.invoices_sent,    color: "bg-amber-400"  },
                        { val: row.invoices_paid,    color: "bg-green-400"  },
                      ].map(({ val, color }, i) => (
                        <div
                          key={i}
                          title={EGP(val)}
                          className={`w-3 rounded-t ${color} transition-all`}
                          style={{
                            height: `${Math.max(2, Math.round((val / trendMax) * 112))}px`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {row.month.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
              {[
                { color: "bg-purple-400", label: "Approved Quotes" },
                { color: "bg-blue-400",   label: "Active Contracts" },
                { color: "bg-amber-400",  label: "Invoices Sent" },
                { color: "bg-green-400",  label: "Invoices Paid" },
              ].map(({ color, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-sm ${color}`} />
                  {label}
                </span>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Lead Funnel ── */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-[#1B2B4B] mb-5">Lead Conversion Funnel</h2>

        {funnelLoading && (
          <div className="h-24 flex items-center justify-center text-sm text-gray-400">
            Loading funnel…
          </div>
        )}

        {funnelData && (
          <>
            <div className="space-y-2 mb-6">
              {funnelData.stages.map((stage: FunnelStage, idx: number) => {
                const convKeys = Object.keys(funnelData.conversion_rates);
                const convRate: number | null =
                  idx > 0 ? funnelData.conversion_rates[convKeys[idx - 1]] : null;
                const barPct = funnelMax > 0
                  ? Math.max(8, Math.round((stage.count / funnelMax) * 100))
                  : 8;

                return (
                  <div key={stage.key}>
                    {convRate !== null && (
                      <p className="text-[11px] text-gray-400 ml-3 mb-1">
                        ↓ {PCT(convRate)} conversion rate
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 bg-[#1B2B4B] rounded-r-lg flex items-center
                                   px-3 transition-all duration-500"
                        style={{ width: `${barPct}%` }}
                      >
                        <span className="text-white text-sm font-bold whitespace-nowrap">
                          {stage.count}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        {stage.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Conversion rate cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
              {Object.entries(funnelData.conversion_rates).map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] text-gray-400 mb-1 capitalize leading-tight">
                    {k.replace(/_/g, " → ")}
                  </p>
                  <p className="text-xl font-bold text-[#1B2B4B]">
                    {PCT(v as number)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Agent Leaderboard ── */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-[#1B2B4B] mb-5">
          Agent Performance Leaderboard
        </h2>

        {leaderLoading && (
          <div className="h-24 flex items-center justify-center text-sm text-gray-400">
            Loading leaderboard…
          </div>
        )}

        {leaderData && leaderData.agents.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No agents found.</p>
        )}

        {leaderData && leaderData.agents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-3 pr-6 font-medium">Agent</th>
                  <th className="pb-3 pr-6 text-right font-medium">Utilization</th>
                  <th className="pb-3 pr-6 text-right font-medium">Leads</th>
                  <th className="pb-3 pr-6 text-right font-medium">Quotes Sent</th>
                  <th className="pb-3 pr-6 text-right font-medium">Approved</th>
                  <th className="pb-3 pr-6 text-right font-medium">Approval Rate</th>
                  <th className="pb-3 text-right font-medium">Active Contracts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leaderData.agents.map((agent: AgentRow, idx: number) => (
                  <tr key={agent.agent_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 pr-6">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-[#1B2B4B] text-white
                                         text-xs flex items-center justify-center font-bold
                                         shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{agent.name}</p>
                          <p className="text-xs text-gray-400">{agent.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-6 text-right">
                      <span className={`font-semibold ${
                        agent.utilization_pct > 80 ? "text-red-500"
                        : agent.utilization_pct > 50 ? "text-amber-500"
                        : "text-green-600"
                      }`}>
                        {PCT(agent.utilization_pct)}
                      </span>
                      <p className="text-xs text-gray-400">
                        {agent.current_leads}/{agent.max_leads}
                      </p>
                    </td>
                    <td className="py-3.5 pr-6 text-right font-medium text-gray-700">
                      {agent.current_leads}
                    </td>
                    <td className="py-3.5 pr-6 text-right text-gray-700">
                      {agent.quotes_sent}
                    </td>
                    <td className="py-3.5 pr-6 text-right text-gray-700">
                      {agent.quotes_approved}
                    </td>
                    <td className="py-3.5 pr-6 text-right">
                      <span className={`font-bold ${
                        agent.approval_rate >= 70 ? "text-green-600"
                        : agent.approval_rate >= 40 ? "text-amber-500"
                        : "text-red-500"
                      }`}>
                        {PCT(agent.approval_rate)}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full
                                       text-xs font-semibold bg-green-100 text-green-700">
                        {agent.contracts_active}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
