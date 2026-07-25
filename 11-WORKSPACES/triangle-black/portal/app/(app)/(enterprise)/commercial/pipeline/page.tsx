// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n: any) => `EGP ${Number(n || 0).toLocaleString()}`;

const PipelinePage = () => {
  const { data: pipeline, isLoading } = useQuery(
    ["sales-pipeline"],
    () => authFetch("/api/v1/sales-pipeline/").then(r => r.json()),
    { refetchInterval: 120000 }
  );

  const { data: conversion } = useQuery(
    ["sales-conversion"],
    () => authFetch("/api/v1/sales-pipeline/conversion").then(r => r.json()),
    { refetchInterval: 120000 }
  );

  if (isLoading) return <LoadingState />;
  const kpis = pipeline?.kpis || {};
  const conv = conversion || {};

  return (
    <PageWrapper>
      <PageHeader title="Sales Pipeline" subtitle="Lead to Revenue journey" badge="SALES" />
      <MetricStrip metrics={[
        { label: "Total Leads",   value: kpis?.total_leads || 0 },
        { label: "Quotes",        value: kpis?.total_quotes || 0 },
        { label: "Contracts",     value: kpis?.total_contracts || 0 },
        { label: "Pipeline Value", value: fmtEGP(kpis?.pipeline_value_egp), color: "amber" },
        { label: "Revenue",       value: fmtEGP(kpis?.total_revenue_egp), color: "green" },
      ]} />
      <div className="grid grid-cols-2 gap-4 mt-4">
        <SectionCard title="Conversion Rates">
          <div className="space-y-4 p-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Lead → Quote</span>
                <span className="font-semibold">{conv.lead_to_quote_rate || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{width: `${Math.min(100, conv.lead_to_quote_rate || 0)}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Quote Win Rate</span>
                <span className="font-semibold">{conv.quote_win_rate || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: `${conv.quote_win_rate || 0}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Active Contracts</span>
                <span className="font-semibold">{conv.contract_active_rate || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: `${conv.contract_active_rate || 0}%`}}></div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Funnel Breakdown">
          <div className="space-y-3 p-2">
            {[
              { label: "Leads", items: toArr(pipeline?.funnel?.leads), color: "bg-slate-400" },
              { label: "Quotes", items: toArr(pipeline?.funnel?.quotes), color: "bg-amber-400" },
              { label: "Contracts", items: toArr(pipeline?.funnel?.contracts), color: "bg-green-400" },
            ].map(stage => (
              <div key={stage.label}>
                <p className="text-xs font-semibold text-slate-500 mb-1">{stage.label}</p>
                <div className="flex gap-2 flex-wrap">
                  {stage.items.map((item: any) => (
                    <span key={item.status} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 rounded text-xs">
                      <span className={`w-2 h-2 rounded-full ${stage.color}`}></span>
                      {item.status}: {item.count}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageWrapper>
  );
};

export default PipelinePage;
