// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { ShoppingCart, CheckCircle, Truck, Package, AlertTriangle, TrendingUp, Clock, Zap } from "lucide-react";
import Link from "next/link";

export default function ProcurementDashboardPage() {
  const { data: reorder = {}, isLoading: rl } = useQuery({
    queryKey: ["proc-reorder"],
    queryFn: () => authFetch("/api/v1/warehouse-intelligence/auto-reorder-plan").then(r => r.json()),
    refetchInterval: 300000,
  });

  const { data: pending = {}, isLoading: pl } = useQuery({
    queryKey: ["proc-pending"],
    queryFn: () => authFetch("/api/v1/goods-receipt-workflow/pending-receipts").then(r => r.json()),
    refetchInterval: 60000,
  });

  const { data: stockHealth = {}, isLoading: sl } = useQuery({
    queryKey: ["proc-stock"],
    queryFn: () => authFetch("/api/v1/warehouse-intelligence/stock-health").then(r => r.json()),
    refetchInterval: 120000,
  });

  const { data: reorderAlerts = {} } = useQuery({
    queryKey: ["proc-alerts"],
    queryFn: () => authFetch("/api/v1/inventory-items/reorder-alerts").then(r => r.json()),
    refetchInterval: 120000,
  });

  const { data: mentor = {} } = useQuery({
    queryKey: ["proc-mentor"],
    queryFn: () => authFetch("/api/v1/ai-mentor/guidance/procurement").then(r => r.json()),
  });

  if (rl || pl || sl) return <PageWrapper><LoadingState title="Loading procurement dashboard..." /></PageWrapper>;

  const summary   = stockHealth?.summary ?? {};
  const guidance  = stockHealth?.mentor_guidance ?? [];
  const practices = mentor?.all_practices ?? [];
  const pendingPOs = pending?.pending ?? [];
  const overduePOs = pending?.overdue ?? 0;
  const reorderItems = reorderAlerts?.alerts ?? [];

  return (
    <PageWrapper>
      <PageHeader
        title="Procurement Intelligence"
        subtitle="Complete procurement cycle - intake to goods received"
        badge="Program K"
      />

      {/* Critical alerts banner */}
      {(summary?.critical > 0 || overduePOs > 0) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-800">Action Required</div>
            <div className="text-sm text-red-600 mt-1 space-y-1">
              {summary?.critical > 0 && (
                <div>{summary?.critical} items completely out of stock - create emergency PRs</div>
              )}
              {overduePOs > 0 && (
                <div>{overduePOs} purchase orders overdue for delivery - follow up with vendors</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        {[
          { label: "Critical Stock",    value: summary.critical ?? 0,        icon: AlertTriangle, color: "text-red-600",     href: "/supply-chain/reorder" },
          { label: "Low Stock",         value: summary.low ?? 0,             icon: TrendingUp,    color: "text-amber-600",   href: "/supply-chain/reorder" },
          { label: "Pending Deliveries",value: pending?.total ?? 0,         icon: Truck,         color: "text-blue-600",    href: "/supply-chain/purchase-orders" },
          { label: "Need Reorder",      value: reorderItems.length,          icon: ShoppingCart,  color: "text-orange-600",  href: "/supply-chain/reorder" },
        ].map(s => (
          <Link key={s.label} href={s.href}>
            <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 cursor-pointer">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Workflow Quick Access */}
      <SectionCard title="Procurement Workflow" className="mb-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: "New Request",       href: "/supply-chain/intake",          icon: Zap,          color: "bg-blue-600",    desc: "Submit via any channel" },
            { label: "Purchase Requests", href: "/supply-chain/purchase-requests", icon: ShoppingCart, color: "bg-amber-600",   desc: "Review pending PRs" },
            { label: "Approvals",         href: "/approvals",                     icon: CheckCircle,  color: "bg-emerald-600", desc: "Approve PRs + POs" },
            { label: "Orders",            href: "/supply-chain/purchase-orders",  icon: Package,      color: "bg-purple-600",  desc: "Track sent POs" },
            { label: "Receive Goods",     href: "/supply-chain/goods-receipts",   icon: Truck,        color: "bg-slate-800",   desc: "Record deliveries" },
          ].map(step => (
            <Link key={step.label} href={step.href}>
              <div className={`${step.color} text-white p-4 rounded-xl cursor-pointer hover:opacity-90 text-center`}>
                <step.icon className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-semibold">{step.label}</div>
                <div className="text-xs opacity-80 mt-1">{step.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending POs */}
        <SectionCard title={`Pending Deliveries (${pendingPOs.length})`}>
          {pendingPOs.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(pendingPOs || []).slice(0, 8).map((po: any) => {
                const isOverdue = (po.days_overdue ?? 0) > 0;
                return (
                  <div key={po.id}
                       className={`flex items-center justify-between p-3 rounded-lg border
                         ${isOverdue ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{po.title}</div>
                      <div className="text-xs text-slate-400">
                        {po.vendor_name} - {po.po_number}
                      </div>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      {isOverdue ? (
                        <span className="text-xs font-bold text-red-600">
                          {Math.abs(po.days_overdue)}d late
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">
                          {String(po.expected_delivery_date ?? "").slice(0,10)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No pending deliveries</p>
            </div>
          )}
          <Link href="/supply-chain/purchase-orders" className="block mt-3 text-xs text-blue-600 text-center hover:text-blue-800">
            View all purchase orders →
          </Link>
        </SectionCard>

        {/* AI Mentor - Best Practices */}
        <SectionCard title="AI Mentor - Best Practices">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {(practices || []).slice(0, 6).map((p: any, i: number) => (
              <div key={i} className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="text-xs font-semibold text-blue-700">{p.rule}</div>
                <div className="text-xs text-slate-600 mt-0.5">{p.guidance}</div>
              </div>
            ))}
            {practices.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Loading best practices...</p>
            )}
          </div>
          <Link href="/ai/page" className="block mt-3 text-xs text-blue-600 text-center hover:text-blue-800">
            Full mentor guidance →
          </Link>
        </SectionCard>

        {/* Stock Guidance from Mentor */}
        {guidance.length > 0 && (
          <SectionCard title="Warehouse Mentor Guidance" className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {guidance.map((g: any, i: number) => (
                <div key={i} className={`p-4 rounded-xl border flex items-start gap-3
                  ${g.priority === "CRITICAL" ? "bg-red-50 border-red-200" :
                    g.priority === "HIGH" ? "bg-amber-50 border-amber-200" :
                    "bg-blue-50 border-blue-200"}`}>
                  <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5
                    ${g.priority === "CRITICAL" ? "text-red-600" :
                      g.priority === "HIGH" ? "text-amber-600" : "text-blue-600"}`} />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{g.message}</div>
                    <div className="text-xs text-slate-600 mt-1">{g.action}</div>
                    {g.items?.length > 0 && (
                      <div className="text-xs text-slate-400 mt-1">
                        Items: {g.items.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </PageWrapper>
  );
}
