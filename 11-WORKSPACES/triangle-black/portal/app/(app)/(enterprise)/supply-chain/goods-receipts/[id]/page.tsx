"use client"; // @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Package, Truck, CheckCircle, ClipboardList, Calendar } from "lucide-react";

export default function GoodsReceiptDetailPage() {
  const { id } = useParams();

  const { data: gr, isLoading } = useQuery({
    queryKey: ["gr", id],
    queryFn: () => authFetch(`/api/v1/goods-receipts/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: poData = {} } = useQuery({
    queryKey: ["gr-po", gr?.purchase_order_id],
    queryFn: () => authFetch(`/api/v1/purchase-orders/${gr?.purchase_order_id}`).then(r => r.json()),
    enabled: !!gr?.purchase_order_id,
  });

  if (isLoading) return <PageWrapper><LoadingState title="Loading goods receipt..." /></PageWrapper>;
  if (!gr || gr.detail) return <PageWrapper><p className="p-8 text-slate-400">Receipt not found</p></PageWrapper>;

  const po = poData;
  const items = Array.isArray(gr.items) ? gr.items : gr.line_items ?? [];

  return (
    <PageWrapper>
      <PageHeader
        title={gr.receipt_number ?? `GR ${String(gr.id).slice(0,8)}`}
        subtitle={`Received: ${String(gr.received_date ?? gr.created_at ?? "").slice(0,10)}`}
        badge={gr.status ?? "received"}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <SectionCard title="Receipt Information">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Truck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">
                  {gr.receipt_number ?? "Goods Receipt"}
                </div>
                <div className="text-sm text-emerald-600">Received</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["PO Number",     po?.po_number ?? gr.purchase_order_id],
                ["Received Date", String(gr.received_date ?? gr.created_at ?? "").slice(0,10)],
                ["Received By",   gr.received_by ?? "—"],
                ["Warehouse",     gr.warehouse_id ?? "—"],
                ["Notes",         gr.notes ?? "—"],
              ].filter(([, v]) => v && v !== "—").map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-800 font-medium text-right max-w-40 truncate">{v}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* PO summary */}
          {po?.total_amount && (
            <SectionCard title="Purchase Order">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 font-medium mb-1">PO Value</div>
                <div className="text-xl font-bold text-blue-800">
                  {Number(po.total_amount).toLocaleString()} EGP
                </div>
                <div className="text-xs text-blue-500 mt-1">Status: {po.status}</div>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="lg:col-span-2">
          <SectionCard title={`Received Items (${items.length})`}>
            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 border-b border-slate-100">
                      <th className="text-left py-2 font-medium">Item</th>
                      <th className="text-right py-2 font-medium">Ordered</th>
                      <th className="text-right py-2 font-medium">Received</th>
                      <th className="text-left py-2 font-medium">Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any) => (
                      <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-2">
                          <div className="font-medium text-slate-800">
                            {item.item_name ?? item.name ?? item.description}
                          </div>
                          <div className="text-xs text-slate-400">{item.unit_of_measure}</div>
                        </td>
                        <td className="py-2 text-right text-slate-600">{item.ordered_quantity ?? item.quantity}</td>
                        <td className="py-2 text-right">
                          <span className={`font-semibold ${
                            (item.received_quantity ?? item.quantity) >= (item.ordered_quantity ?? item.quantity)
                              ? "text-emerald-600" : "text-amber-600"
                          }`}>
                            {item.received_quantity ?? item.quantity}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium
                            ${item.condition === "good" || !item.condition
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"}`}>
                            {item.condition ?? "good"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No line items recorded</p>
                <p className="text-xs text-slate-300 mt-1">
                  This receipt was recorded without individual item breakdown
                </p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
