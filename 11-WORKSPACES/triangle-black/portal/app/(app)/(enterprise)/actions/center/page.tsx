"use client"; // @ts-nocheck

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchSignals() {
  try {  
    const r = await fetch(`${BACK}/api/v1/ai/signals`, { credentials: "include" });`, { credentials: "include" });
  if (!r.ok) return { signals: [] };
  return r.json();
}
async function fetchPRs() {
  try {  
    const r = await fetch(`${BACK}/api/v1/inventory/purchase-requests/`, { credentials: "include" });`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}
async function fetchWOs() {
  try {  
    const r = await fetch(`${BACK}/api/v1/work-orders`, { credentials: "include" });`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}

const CATEGORY_LINKS = {
  operations: "/operations/workbench",
  maintenance: "/maintenance/intelligence",
  inventory: "/supply-chain/workbench",
  commercial: "/commercial/pipeline",
  resources: "/operations/dispatch",
};

export default function ActionsCenterPage() {
  const [tab, setTab] = useState("all");

  const { data: sigsData = { signals: [] }, isLoading: s1 } = useQuery({
    queryKey: ["actions-signals"], queryFn: fetchSignals, refetchInterval: 30000,
  });
  const { data: prs = [], isLoading: s2 } = useQuery({
    queryKey: ["actions-prs"], queryFn: fetchPRs, refetchInterval: 60000,
  });
  const { data: wos = [], isLoading: s3 } = useQuery({
    queryKey: ["actions-wos"], queryFn: fetchWOs, refetchInterval: 60000,
  });

  const signals = Array.isArray(sigsData) ? sigsData : (sigsData?.signals || []);
  const pendingPRs = (Array.isArray(prs) ? prs : []).filter((p: any) => p.status === "draft" || p.status === "pending");
  const criticalWOs = (wos || []).filter((w: any) => w.priority === "critical" && w.status === "open");

  const totalActions = (signals || []).length + pendingPRs.length + criticalWOs.length;
  const criticalCount = (signals || []).filter((s: any) => s.priority === "critical").length + criticalWOs.length;

  const isLoading = s1 || s2 || s3;
  if (isLoading) return <LoadingState message="Loading action center..." />;

  return (
    <PageWrapper>
      <PageHeader
        title="Actions Center"
        subtitle="All pending actions across the platform"
        badge={totalActions > 0 ? `${totalActions} Actions` : undefined}
      />

      <MetricStrip metrics={[
        { label: "Total Actions", value: totalActions },
        { label: "Critical",      value: criticalCount, color: criticalCount > 0 ? "red" as const : "slate" as const },
        { label: "Approvals",     value: pendingPRs.length, color: "amber" as const },
        { label: "Completed",     value: 0 },
      ]} />

      <div className="flex gap-2 px-1 mb-2">
        {["all", "signals", "approvals", "work-orders"].map((t: any) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              tab === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.replace("-", " ")}
          </button>
        ))}
      </div>

      {totalActions === 0 ? (
        <SectionCard title="Actions">
          <EmptyState title="All clear" description="No pending actions at this time" />
        </SectionCard>
      ) : (
        <SectionCard title="Pending Actions">
          <div className="space-y-2">
            {(tab === "all" || tab === "signals") && (signals || []).map((s: any) => (
              <div key={s.signal_id} className={`px-4 py-3 rounded-lg border-l-4 ${
                s.priority === "critical" ? "border-red-500 bg-red-50" :
                s.priority === "high" ? "border-amber-400 bg-amber-50" : "border-blue-400 bg-blue-50"
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 italic">{s.recommended_action}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <StatusBadge status={s.priority} />
                    <Link href={CATEGORY_LINKS[s.category] || "/operations/workbench"}
                      className="text-xs font-medium text-blue-600 underline whitespace-nowrap">
                      Go
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {(tab === "all" || tab === "approvals") && pendingPRs.map((pr: any) => (
              <div key={pr.id} className="px-4 py-3 rounded-lg border-l-4 border-amber-400 bg-amber-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{pr.pr_number || "PR"}</p>
                    <p className="text-xs text-slate-500">{pr.requester} — approval needed</p>
                  </div>
                  <Link href="/approvals" className="text-xs font-medium text-amber-700 underline">
                    Approve
                  </Link>
                </div>
              </div>
            ))}
            {(tab === "all" || tab === "work-orders") && criticalWOs.map((w: any) => (
              <div key={w.id} className="px-4 py-3 rounded-lg border-l-4 border-red-500 bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{w.title}</p>
                    <p className="text-xs text-slate-500">{w.type} — critical and open</p>
                  </div>
                  <Link href="/operations/work-orders" className="text-xs font-medium text-red-700 underline">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </PageWrapper>
  );
}