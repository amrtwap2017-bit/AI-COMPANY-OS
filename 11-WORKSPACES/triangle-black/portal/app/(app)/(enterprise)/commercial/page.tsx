"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader, PageWrapper, LoadingState } from "@/components/ui";
import { executiveApi } from "@/lib/api/enterprise";
import { TrendingUp, Users, FileText, Receipt, DollarSign,
  GitBranch, ArrowRight, RefreshCw } from "lucide-react";
import { fmtCurrency } from "@/lib/design-tokens";
import { toast } from "@/lib/toast";

const MODULES = [
  { label: "Leads",           href: "/leads",                         icon: TrendingUp, desc: "CRM pipeline and lead management", highlight: true },
  { label: "Customers",       href: "/customers",                     icon: Users,      desc: "Customer success and 360 view" },
  { label: "Contracts",       href: "/contracts",                     icon: FileText,   desc: "Contract lifecycle management" },
  { label: "Invoices",        href: "/invoices",                      icon: Receipt,    desc: "Invoice tracking and payments" },
  { label: "Quotes",          href: "/quotes",                        icon: FileText,   desc: "Quotation management" },
  { label: "Pipeline",        href: "/commercial/pipeline",           icon: GitBranch,  desc: "Sales pipeline overview" },
  { label: "Workbench",       href: "/commercial/workbench",          icon: DollarSign, desc: "Daily commercial workbench" },
  { label: "Review Board",    href: "/commercial/review",             icon: TrendingUp, desc: "Commercial review signals" },
];

export default function CommercialPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["commercial-kpis"],
    queryFn:  () => executiveApi.dashboard(),
    refetchInterval: 60_000,
  });

  const kpis = data?.data?.kpis || {};

  const metrics = [
    { label: "Active Leads",     value: kpis.active_leads      ?? 0,  color: "bg-blue-50 border-blue-100",       val: "text-blue-700" },
    { label: "Active Contracts", value: kpis.active_contracts  ?? 0,  color: "bg-emerald-50 border-emerald-100", val: "text-emerald-700" },
    { label: "Total Quotes",     value: kpis.total_quotes      ?? 0,  color: "bg-amber-50 border-amber-100",     val: "text-amber-700" },
    { label: "Revenue",          value: kpis.revenue_collected ? fmtCurrency(kpis.revenue_collected) : "—", color: "bg-slate-50 border-slate-200", val: "text-slate-900" },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Commercial Center"
        subtitle="CRM, quotations, contracts and relationships"
        badge="CRM"
        actions={
          <button onClick={() => { refetch(); toast.success("Refreshed"); }}
            disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {isLoading ? <LoadingState type="cards" rows={4} cols={4} /> : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metrics.map(m => (
            <div key={m.label} className={"rounded-2xl border p-4 " + m.color}>
              <div className={"text-2xl font-bold " + m.val}>{m.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MODULES.map(mod => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}
              className={
                "group rounded-2xl border p-5 hover:shadow-sm transition-all " +
                (mod.highlight ? "bg-amber-50 border-amber-200 hover:border-amber-400" : "bg-white border-slate-200 hover:border-amber-300")
              }>
              <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-3 " + (mod.highlight ? "bg-amber-200" : "bg-slate-100 group-hover:bg-amber-50")}>
                <Icon className={"w-5 h-5 " + (mod.highlight ? "text-amber-700" : "text-slate-500 group-hover:text-amber-600")} />
              </div>
              <p className="font-semibold text-sm text-slate-900">{mod.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{mod.desc}</p>
              <ArrowRight className={"w-4 h-4 mt-3 transition-colors " + (mod.highlight ? "text-amber-500" : "text-slate-300 group-hover:text-amber-500")} />
            </Link>
          );
        })}
      </div>
    </PageWrapper>
  );
}
