// @ts-nocheck
"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  PageHeader,
  MetricCard,
  SectionCard,
  LoadingState,
  AlertBanner,
  Button,
} from "@/components/ui";
import { executiveIntelligenceApi } from "@/lib";
import {
  Activity,
  Briefcase,
  FileWarning,
  RefreshCw,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react";

interface CeoDashboard {
  kpis: Record<string, number | string>;
  health?: string;
  period?: string;
}

const KPI_META: Record<string, { label: string; icon: ReactNode; color: string }> = {
  active_leads: {
    label: "Active Leads",
    icon: <Users className="h-5 w-5" />,
    color: "blue",
  },
  open_work_orders: {
    label: "Open Work Orders",
    icon: <Wrench className="h-5 w-5" />,
    color: "amber",
  },
  active_contracts: {
    label: "Active Contracts",
    icon: <Briefcase className="h-5 w-5" />,
    color: "green",
  },
  overdue_invoices: {
    label: "Overdue Invoices",
    icon: <FileWarning className="h-5 w-5" />,
    color: "red",
  },
  pending_purchase_orders: {
    label: "Pending POs",
    icon: <ShoppingCart className="h-5 w-5" />,
    color: "purple",
  },
};

function labelize(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ExecutiveDashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["executive-ceo-dashboard"],
    queryFn: () => executiveIntelligenceApi.ceoDashboard() as Promise<CeoDashboard>,
    staleTime: 30_000,
  });

  const kpis = data?.kpis ?? {};
  const kpiEntries = Object.entries(kpis);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Executive Command Center" subtitle="Real-time business intelligence" />
        <LoadingState type="cards" rows={1} cols={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Executive Command Center"
        subtitle="One Identity. One Mission. Real-time business intelligence."
        actions={
          <div className="flex items-center gap-2">
            {data?.health && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> {data.health}
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {isError && (
        <AlertBanner
          type="error"
          title={error instanceof Error ? error.message : "Failed to load executive dashboard"}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiEntries.length === 0 ? (
          <div className="col-span-full text-sm text-slate-500">No KPI data available.</div>
        ) : (
          kpiEntries.map(([key, value]) => {
            const meta = KPI_META[key] ?? {
              label: labelize(key),
              icon: <Activity className="h-5 w-5" />,
              color: "slate",
            };
            return (
              <MetricCard
                key={key}
                label={meta.label}
                value={value}
                icon={meta.icon}
                color={meta.color}
              />
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Executive Quick Actions" className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/approvals" className="text-sm font-semibold text-amber-700 hover:underline">
              Review Approvals
            </Link>
            <Link href="/operations/work-orders" className="text-sm font-semibold text-amber-700 hover:underline">
              Open Work Orders
            </Link>
            <Link href="/commercial" className="text-sm font-semibold text-amber-700 hover:underline">
              Commercial Center
            </Link>
          </div>
        </SectionCard>
        <SectionCard title="Period">
          <div className="text-sm text-slate-600">{data?.period ?? "current"}</div>
        </SectionCard>
      </div>
    </div>
  );
}
