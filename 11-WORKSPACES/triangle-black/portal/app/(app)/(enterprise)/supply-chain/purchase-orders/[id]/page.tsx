"use client"; // @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Package, FileText, Building, CreditCard, Truck } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft:     "bg-slate-100 text-slate-600",
  submitted: "bg-blue-100 text-blue-700",
  approved:  "bg-emerald-100 text-emerald-700",
  sent:      "bg-purple-100 text-purple-700",
  received:  "bg-emerald-200 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
  closed:    "bg-slate-200 text-slate-500",
};

export default function PurchaseOrderDetailPage() {
  const { id } = useParams();

  const { data: po, isLoading } = useQuery({
    queryKey: ["po", id],
    queryFn: () => authFetch(`/api/v1/purchase-orders/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: vendor = {} } = useQuery({
    queryKey: ["po-vendor", po?.vendor_id],
    queryFn: () => authFetch(`/api/v1/inventory-vendors/${po?.vendor_id}`).then(r => r.json()),
    enabled: !!po?.vendor_id,
  });

  const { data: items = {} } = useQuery({
    queryKey: ["po-items", id],
    queryFn: () => authFetch(`/api/v1/purchase-orders/${id}/items`).then(r => r.json()).catch(() => ({})),
    enabled: !!id,
  });

  if (isLoading) return <PageWrapper><LoadingState title="Loading purchase order..." /></PageWrapper>;
  if (!po || po.detail) return <PageWrapper><p className="p-8 text-slate-400">Purchase order not found</p></PageWrapper>;

  const lineItems = Array.isArray(items) ? items : items?.data ?? items?.items ?? [];
  const totalValue = Number(po.total_amount || po.total_value || 0);

  return (
    <PageWrapper>
      <PageHeader
        title={po.po_number ?? po.title ?? `PO ${String(po.id).slice(0,8)}`}
        subtitle={vendor?.name ?? po.vendor_id ?? "Vendor"}
        badge={
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[po.status] ?? ""}`}>
            {po.status}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* PO Summary */}
        <div className="space-y-6">
          <SectionCard title="Order Summary">
            <div className="text-center p-4 bg-slate-50 rounded-xl mb-4">
              <CreditCard className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">
                {totalValue.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">Total Value (EGP)</div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["Status",        po.status],
                ["Currency",      po.currency ?? "EGP"],
                ["Payment Terms", po.payment_terms],
                ["Order Date",    String(po.created_at ?? "").slice(0,10)],
                ["Expected",      String(po.expected_delivery_date ?? po.required_date ?? "—").slice(0,10)],
                ["Hotel",         po.hotel_id],
              ].filter(([, v]) => v && v !== "—").map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-800 font-medium text-right max-w-32 truncate">{v}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Vendor info */}
          {vendor?.name && (
            <SectionCard title="Vendor">
              <div className="flex items-center gap-3 mb-3">
                <Building className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="font-medium text-slate-800">{vendor.name}</div>
                  <div className="text-xs text-slate-500">{vendor.category}</div>
                </div>
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                {vendor.phone && <div>📞 {vendor.phone}</div>}
                {vendor.email && <div>✉️ {vendor.email}</div>}
                {vendor.lead_time_days && <div>🚚 Lead time: {vendor.lead_time_days} days</div>}
              </div>
            </SectionCard>
          )}

          {/* PDF Export */}
          <SectionCard title="Documents">
            <a
              href={`http://localhost:8030/api/v1/pdf-export/preview/monthly-report`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-slate-200
                         rounded-lg text-sm hover:bg-slate-50 text-slate-700"
            >
              <FileText className="w-4 h-4" /> Monthly Report (PDF)
            </a>
          </SectionCard>
        </div>

        {/* Line items */}
        <div className="lg:col-span-2">
          <SectionCard title={`Line Items (${lineItems.length})`}>
            {lineItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 border-b border-slate-100">
                      <th className="text-left py-2 font-medium">Item</th>
                      <th className="text-right py-2 font-medium">Qty</th>
                      <th className="text-right py-2 font-medium">Unit Price</th>
                      <th className="text-right py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item: any) => (
                      <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-2">
                          <div className="font-medium text-slate-800">{item.name ?? item.description}</div>
                          <div className="text-xs text-slate-400">{item.item_code ?? ""}</div>
                        </td>
                        <td className="py-2 text-right text-slate-700">{item.quantity} {item.unit}</td>
                        <td className="py-2 text-right text-slate-700">
                          {Number(item.unit_price || 0).toLocaleString()}
                        </td>
                        <td className="py-2 text-right font-semibold text-slate-800">
                          {Number(item.total_price || (item.quantity * item.unit_price) || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                      <td colSpan={3} className="py-2 text-right font-semibold text-slate-700">Total</td>
                      <td className="py-2 text-right font-bold text-slate-800">
                        {totalValue.toLocaleString()} EGP
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No line items available</p>
                <p className="text-xs text-slate-300 mt-1">Total order value: {totalValue.toLocaleString()} EGP</p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
