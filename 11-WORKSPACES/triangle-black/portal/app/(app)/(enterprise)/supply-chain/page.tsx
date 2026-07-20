// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { scApi } from "@/lib/supply-chain-api";
import { PageHeader, MetricStrip, LoadingState, Button } from "@/components/ui";
import {
  FileText, ShoppingCart, TrendingUp, Scale,
  Users, Truck, Warehouse, RefreshCw
} from "lucide-react";

export default function SupplyChainPage() {
  const kpiQ = useQuery({ 
    queryKey: ["sc-kpis"], 
    queryFn: () => scApi.kpis ? scApi.kpis().then(r=>r.data) : Promise.resolve({ kpis: [] }) 
  });
  const kpis = (kpiQ.data as any)?.kpis || [];

  const metrics = kpis.slice(0,4).map((k:any) => ({
    label: k.label, value: k.value ?? "—",
    sub: k.unit,
    color: k.status === "critical" ? "red" : k.status === "warning" ? "amber" : "slate",
  }));

  const modules = [
    { label: "RFQs & Sourcing", href: "/supply-chain/rfqs", icon: FileText, desc: "Create, manage, and award Requests for Quotation", highlight: true },
    { label: "Purchase Orders", href: "/supply-chain/purchase-orders", icon: ShoppingCart, desc: "Track all active and completed purchase orders" },
    { label: "Purchase Requests", href: "/supply-chain/purchase-requests", icon: TrendingUp, desc: "Internal requisitions and approval workflows" },
    { label: "Quotations", href: "/supply-chain/quotations", icon: Scale, desc: "Compare vendor quotes and pricing" },
    { label: "Suppliers", href: "/supply-chain/suppliers", icon: Users, desc: "Vendor directory, scorecards, and performance" },
    { label: "Goods Receipts", href: "/supply-chain/goods-receipts", icon: Truck, desc: "Inbound delivery tracking and GRN creation" },
    { label: "Inventory", href: "/supply-chain/inventory", icon: Warehouse, desc: "Stock levels, movements, and warehouse management" },
    { label: "Invoice Matching", href: "/supply-chain/invoice-matching", icon: FileText, desc: "3-way matching and payment processing" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Supply Chain & Procurement"
        subtitle="Sourcing · Purchasing · Inventory · Vendor Management"
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5"/>} onClick={()=>kpiQ.refetch()}>
            Refresh
          </Button>
        }
      />

      {kpiQ.isLoading ? (
        <LoadingState type="cards" rows={4} cols={4}/>
      ) : metrics.length > 0 ? (
        <MetricStrip metrics={metrics} cols={4}/>
      ) : null}

      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Procurement Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map(mod => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.label}
                href={mod.href}
                className={`
                  group relative flex flex-col p-5 rounded-2xl border transition-all duration-200
                  ${mod.highlight
                    ? "bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10"
                    : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-md"
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors
                  ${mod.highlight ? "bg-amber-500/20 text-amber-400" : "bg-slate-100 text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-600"}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`font-bold text-sm mb-1 ${mod.highlight ? "text-white" : "text-slate-900"}`}>
                  {mod.label}
                </div>
                <div className={`text-xs leading-relaxed ${mod.highlight ? "text-slate-400" : "text-slate-500"}`}>
                  {mod.desc}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
