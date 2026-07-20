// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { scApi } from "@/lib/supply-chain-api";
import { PageHeader, Button, SectionCard, LoadingState } from "@/components/ui";
import { fmtDate, fmtCurrency } from "@/lib/design-tokens";
import Link from "next/link";
import { FileText, Truck, CheckCircle, AlertTriangle, Clock, DollarSign, ArrowRight } from "lucide-react";

export default function ProcurementWorkbenchPage() {
  // In a real app, these would be separate API calls
  const { data, isLoading } = useQuery({
    queryKey: ["procurement-dashboard"],
    queryFn: () => Promise.resolve({ 
      data: {
        pending_approvals: [
          { id: "PO-099", supplier: "Marble Egypt Co.", amount: 45000, project: "Grand Cairo Renovation", requested_by: "Mohamed (Site Eng)" },
          { id: "PO-102", supplier: "Carrier HVAC Parts", amount: 12500, project: "Sharm Resort Maintenance", requested_by: "Amr (PM)" }
        ],
        pending_grns: [
          { id: "GRN-044", po_ref: "PO-098", supplier: "Italian Tile Imports", expected: "2026-07-16", location: "Grand Cairo Site", items: 12 },
          { id: "GRN-045", po_ref: "PO-095", supplier: "Copper Cable Suppliers", expected: "2026-07-15", location: "Main Warehouse", items: 5 }
        ],
        unmatched_invoices: [
          { id: "INV-8821", supplier: "Marble Egypt Co.", amount: 45000, po_ref: "PO-099", days_open: 5 },
          { id: "INV-8815", supplier: "Paint & Finishes Ltd.", amount: 8200, po_ref: "PO-092", days_open: 12 }
        ]
      }
    }),
    staleTime: 30_000,
  });

  const d = data?.data;

  if (isLoading) return <LoadingState type="cards" rows={4} cols={4} />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Procurement Workbench" 
        subtitle="Unified view of purchasing, receiving, and invoice matching" 
        badge="PROC"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">Export Report</Button>
            <Button variant="primary" size="sm">New Purchase Order</Button>
          </div>
        } 
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SectionCard title="Pending PO Approvals" actions={<Link href="/supply-chain/purchase-requests" className="text-xs text-amber-600 font-semibold hover:underline">View All</Link>}>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600"><Clock className="w-5 h-5" /></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{d?.pending_approvals?.length || 0}</div>
              <div className="text-xs text-slate-500">Requires your signature</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Pending Goods Receipts" actions={<Link href="/supply-chain/goods-receipts" className="text-xs text-amber-600 font-semibold hover:underline">View All</Link>}>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600"><Truck className="w-5 h-5" /></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{d?.pending_grns?.length || 0}</div>
              <div className="text-xs text-slate-500">Arriving at sites/warehouse</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Unmatched Invoices" actions={<Link href="/supply-chain/invoice-matching" className="text-xs text-amber-600 font-semibold hover:underline">View All</Link>}>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600"><AlertTriangle className="w-5 h-5" /></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{d?.unmatched_invoices?.length || 0}</div>
              <div className="text-xs text-slate-500">Blocking payment processing</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Monthly Spend (YTD)">
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600"><DollarSign className="w-5 h-5" /></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{fmtCurrency(2450000)}</div>
              <div className="text-xs text-emerald-600 font-medium">+12% vs last month</div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals List */}
        <SectionCard title="Requires Your Approval" actions={<Button variant="ghost" size="xs">View POs</Button>}>
          <div className="space-y-3">
            {d?.pending_approvals?.map((po, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-amber-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600"><FileText className="w-4 h-4" /></div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{po.supplier}</div>
                    <div className="text-xs text-slate-500">{po.id} · {po.project}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">{fmtCurrency(po.amount)}</div>
                  <Button variant="primary" size="xs" className="mt-1">Approve</Button>
                </div>
              </div>
            ))}
            {(!d?.pending_approvals || d.pending_approvals.length === 0) && (
              <div className="text-center py-8 text-slate-400 text-sm">All caught up! No pending approvals.</div>
            )}
          </div>
        </SectionCard>

        {/* Incoming Deliveries */}
        <SectionCard title="Incoming Deliveries (Next 48h)" actions={<Button variant="ghost" size="xs">View GRNs</Button>}>
          <div className="space-y-3">
            {d?.pending_grns?.map((grn, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600"><Truck className="w-4 h-4" /></div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{grn.supplier}</div>
                    <div className="text-xs text-slate-500">{grn.id} · {grn.location} · {grn.items} items</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-amber-600">Due {fmtDate(grn.expected)}</div>
                  <Link href={`/supply-chain/goods-receipts/${grn.id}`} className="text-xs text-amber-600 font-semibold hover:underline flex items-center justify-end gap-1 mt-1">
                    Receive <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
