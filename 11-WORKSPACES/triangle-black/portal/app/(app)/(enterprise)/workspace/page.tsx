"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchKPIs() {
  const r = await fetch(`${BACK}/api/v1/ai/analytics/kpis/live`, { credentials: "include" });
  if (!r.ok) return {};
  return r.json();
}

async function fetchSignals() {
  const r = await fetch(`${BACK}/api/v1/ai/signals/summary`, { credentials: "include" });
  if (!r.ok) return { critical: 0, high: 0, total: 0 };
  return r.json();
}

const QUICK_LINKS = [
  { label: "My Day",            href: "/workspace/my-day",           color: "bg-blue-600"   },
  { label: "Operations",        href: "/operations/workbench",        color: "bg-slate-700"  },
  { label: "Dispatch",          href: "/operations/dispatch",         color: "bg-indigo-600" },
  { label: "Calendar",          href: "/operations/calendar",         color: "bg-teal-600"   },
  { label: "Supply Chain",      href: "/supply-chain/workbench",      color: "bg-orange-600" },
  { label: "Maintenance",       href: "/maintenance/intelligence",    color: "bg-red-600"    },
  { label: "Executive",         href: "/executive",                   color: "bg-purple-600" },
  { label: "SLA Review",        href: "/operations/sla-review",       color: "bg-amber-600"  },
];

export default function WorkspacePage() {
  const { data: kpis = {}, isLoading: kpisLoading } = useQuery({
    queryKey: ["workspace-kpis"],
    queryFn: fetchKPIs,
    refetchInterval: 120000,
  });
  const { data: signals = { critical: 0, high: 0, total: 0 }, isLoading: sigLoading } = useQuery({
    queryKey: ["workspace-signals"],
    queryFn: fetchSignals,
    refetchInterval: 120000,
  });

  const wo  = kpis.work_orders   || {};
  const tec = kpis.technicians   || {};

  return (
    <PageWrapper>
      <PageHeader
        title="My Workspace"
        subtitle="Your personal operations hub"
        badge={signals.critical > 0 ? `${signals.critical} Critical` : undefined}
      />

      {kpisLoading || sigLoading ? (
        <div className="h-16" />
      ) : (
        <MetricStrip metrics={[
          { label: "Open WOs",        value: wo.open           ?? 0 },
          { label: "Critical",        value: wo.critical_open  ?? 0, color: "red"   as const },
          { label: "Technicians",     value: tec.active        ?? 0, color: "blue"  as const },
          { label: "AI Signals",      value: signals.total     ?? 0, color: "amber" as const },
        ]} />
      )}

      <SectionCard title="Quick Navigation">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link: any) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${link.color} text-white rounded-xl px-4 py-4 text-center hover:opacity-90 transition-opacity`}
            >
              <span className="text-sm font-semibold">{link.label}</span>
            </Link>
          ))}
        </div>
      </SectionCard>

      {signals.critical > 0 && (
        <SectionCard title="Active Critical Signals">
          <div className="flex items-center justify-between px-4 py-3 bg-red-50 rounded-lg border border-red-200">
            <div>
              <p className="text-sm font-bold text-red-700">
                {signals.critical} Critical Signal{signals.critical > 1 ? "s" : ""} Active
              </p>
              <p className="text-xs text-red-500 mt-0.5">
                {signals.high} high priority · {signals.total} total
              </p>
            </div>
            <Link
              href="/operations/workbench"
              className="text-xs font-semibold text-red-700 underline"
            >
              View all →
            </Link>
          </div>
        </SectionCard>
      )}
    </PageWrapper>
  );
}
