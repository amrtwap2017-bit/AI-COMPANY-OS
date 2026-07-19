"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader,
  MetricCard,
  SectionCard,
  LoadingState,
  AlertBanner,
  Button,
} from "@/components/ui";
import { api } from "@/lib";
import {
  Users,
  FileText,
  Briefcase,
  Target,
  RefreshCw,
  Plus,
  BarChart3,
  Building2,
  DollarSign,
  ArrowRight,
} from "lucide-react";

interface PipelineSummary {
  total_leads: number;
  by_status?: Record<string, number>;
  total_quote_value?: number;
  approved_value?: number;
  pending_value?: number;
  conversion_rate?: number;
  active_quotes?: number;
}

interface CommercialKpis {
  total_leads: number;
  active_leads: number;
  total_quotes: number;
  total_contracts: number;
}

async function fetchCommercialKpis(): Promise<CommercialKpis> {
  const [pipeline, contracts] = await Promise.all([
    api.get<PipelineSummary>("/actions/pipeline/summary"),
    api.get<unknown>("/contracts/", { params: { limit: 500 } }),
  ]);

  const byStatus = pipeline.by_status ?? {};
  const lost = byStatus.lost ?? 0;
  const activeLeads = Math.max(0, (pipeline.total_leads ?? 0) - lost);

  const contractList = Array.isArray(contracts)
    ? contracts
    : Array.isArray((contracts as { items?: unknown[] })?.items)
      ? (contracts as { items: unknown[] }).items
      : Array.isArray((contracts as { data?: unknown[] })?.data)
        ? (contracts as { data: unknown[] }).data
        : [];

  return {
    total_leads: pipeline.total_leads ?? 0,
    active_leads: activeLeads,
    total_quotes: pipeline.active_quotes ?? 0,
    total_contracts: contractList.length,
  };
}

const MODULES = [
  {
    id: "pipeline",
    title: "Sales Pipeline",
    subtitle: "Lead and opportunity pipeline",
    icon: BarChart3,
    link: "/commercial/pipeline",
  },
  {
    id: "leads",
    title: "Leads & Prospects",
    subtitle: "All leads and prospects",
    icon: Users,
    link: "/commercial/leads",
  },
  {
    id: "proposals",
    title: "Proposals",
    subtitle: "Quotations and proposals",
    icon: FileText,
    link: "/commercial/proposals",
  },
  {
    id: "contracts",
    title: "Contracts",
    subtitle: "Active contract management",
    icon: Briefcase,
    link: "/commercial/contracts",
  },
  {
    id: "invoices",
    title: "Invoices",
    subtitle: "Invoice lifecycle and collection",
    icon: DollarSign,
    link: "/commercial/invoices",
  },
  {
    id: "customers",
    title: "Customers 360",
    subtitle: "Full customer relationship view",
    icon: Building2,
    link: "/commercial/customers",
  },
];

export default function CommercialCenterPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["commercial-pipeline-summary"],
    queryFn: fetchCommercialKpis,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Commercial Center" subtitle="Pipeline and revenue command" />
        <LoadingState type="cards" rows={1} cols={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Commercial Center"
        subtitle="One Identity. One Mission. Driving revenue and client success."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Link href="/commercial/leads/new">
              <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                Add New Lead
              </Button>
            </Link>
          </div>
        }
      />

      {isError && (
        <AlertBanner
          type="error"
          title={error instanceof Error ? error.message : "Failed to load commercial summary"}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Leads"
          value={data?.total_leads ?? 0}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <MetricCard
          label="Active Leads"
          value={data?.active_leads ?? 0}
          icon={<Target className="h-5 w-5" />}
          color="amber"
        />
        <MetricCard
          label="Total Quotes"
          value={data?.total_quotes ?? 0}
          icon={<FileText className="h-5 w-5" />}
          color="purple"
        />
        <MetricCard
          label="Total Contracts"
          value={data?.total_contracts ?? 0}
          icon={<Briefcase className="h-5 w-5" />}
          color="green"
        />
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-500" /> Commercial Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.id} href={mod.link} className="block group">
                <SectionCard title={mod.title} subtitle={mod.subtitle}>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
                  </div>
                </SectionCard>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
