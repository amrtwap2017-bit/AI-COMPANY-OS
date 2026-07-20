"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader, PageWrapper, LoadingState, AlertBanner, SectionCard } from "@/components/ui";
import { analyticsApi } from "@/lib/api/enterprise";
import { ShoppingCart, Package, Truck, FileText, ArrowRight,
  BarChart3, RefreshCw, AlertTriangle } from "lucide-react";
import { fmtCurrency } from "@/lib/design-tokens";
import { toast } from "@/lib/toast";

const MODULES = [
  { label: "Inventory",          href: "/supply-chain/inventory",         icon: Package,      desc: "Stock levels and items", highlight: true },
  { label: "Warehouses",         href: "/warehouses",                     icon: Package,      desc: "Warehouse management" },
  { label: "Purchase Requests",  href: "/supply-chain/purchase-requests", icon: FileText,     desc: "Request approvals" },
  { label: "Purchase Orders",    href: "/supply-chain/purchase-orders",   icon: ShoppingCart, desc: "Committed POs" },
  { label: "Suppliers",          href: "/supply-chain/suppliers",         icon: Truck,        desc: "Supplier directory" },
  { label: "RFQs",               href: "/supply-chain/rfqs",              icon: FileText,     desc: "Request for quotations" },
  { label: "Goods Receipts",     href: "/supply-chain/goods-receipts",    icon: Package,      desc: "Inbound goods recording" },
  { label: "Spend Analysis",     href: "/supply-chain/spend",             icon: BarChart3,    desc: "Procurement spend analytics" },
  { label: "Command",            href: "/supply-chain/command",           icon: BarChart3,    desc: "Procurement command center" },
  { label: "Workbench",          href: "/supply-chain/workbench",         icon: BarChart3,    desc: "Daily procurement workbench" },
];

export default function SupplyChainPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["supply-chain-kpis"],
    queryFn:  () => analyticsApi.kpis(),
    refetchInterval: 60_000,
  });

  const kpis = data?.data?.operations || {};

  const metrics = [
    { label: "Work Orders",    value: kpis.total_work_orders     ?? 0, color: "bg-slate-50 border-slate-200",     val: "text-slate-900" },
    { label: "Inventory Items",value: kpis.total_work_orders     ?? 0, color: "bg-blue-50 border-blue-100",       val: "text-blue-700" },
    { label: "Technicians",    value: kpis.active_technicians    ?? 0, color: "bg-emerald-50 border-emerald-100", val: "text-emerald-700" },
    { label: "Completion",     value: (kpis.completion_rate ?? 0) + "%", color: "bg-amber-50 border-amber-100",   val: "text-amber-700" },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Supply Chain Center"
        subtitle="Procurement, vendors, inventory and spend management"
        badge="SCM"
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

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {MODULES.map(mod => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}
              className={
                "group rounded-2xl border p-4 hover:shadow-sm transition-all " +
                (mod.highlight
                  ? "bg-amber-50 border-amber-200 hover:border-amber-400"
                  : "bg-white border-slate-200 hover:border-amber-300")
              }>
              <div className={"w-9 h-9 rounded-xl flex items-center justify-center mb-3 " + (mod.highlight ? "bg-amber-200" : "bg-slate-100 group-hover:bg-amber-50")}>
                <Icon className={"w-4 h-4 " + (mod.highlight ? "text-amber-700" : "text-slate-500 group-hover:text-amber-600")} />
              </div>
              <p className="font-semibold text-xs text-slate-900">{mod.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{mod.desc}</p>
            </Link>
          );
        })}
      </div>
    </PageWrapper>
  );
}
