"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Package, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";

// Safe array extractor — handles all backend response shapes
const toArr = (d: any): any[] => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.records)) return d.records;
  return [];
};


export default function InventoryItemDetailPage() {
  const { id } = useParams();

  const { data: item, isLoading } = useQuery({
    queryKey: ["inv-item", id],
    queryFn: () => authFetch(`/api/v1/inventory-items/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: movements = {} } = useQuery({
    queryKey: ["inv-movements", id],
    queryFn: () => authFetch(`/api/v1/stock-movements/?item_id=${id}&limit=20`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: stockData = {} } = useQuery({
    queryKey: ["inv-stock", id],
    queryFn: () => authFetch(`/api/v1/stock-balances/?item_id=${id}`).then(r => r.json()),
    enabled: !!id,
  });

  if (isLoading) return <PageWrapper><LoadingState title="Loading item..." /></PageWrapper>;
  if (!item || item.detail) return <PageWrapper><p className="p-8 text-slate-400">Item not found</p></PageWrapper>;

  const moves = Array.isArray(movements) ? movements : movements?.data ?? movements?.items ?? [];
  const stocks = Array.isArray(stockData) ? stockData : stockData?.data ?? stockData?.items ?? [];
  const totalStock = toArr(stocks).reduce((sum: number, s: any) => sum + (Number(s.quantity) || 0), 0);
  const belowMin = totalStock <= (item.min_stock || 0);

  return (
    <PageWrapper>
      <PageHeader
        title={item.name || "Inventory Item"}
        subtitle={`${item.category} · ${item.item_code}`}
        badge={belowMin ? "Low Stock" : "In Stock"}
      />

      {belowMin && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <div>
            <div className="font-semibold text-amber-800">Stock Below Minimum</div>
            <div className="text-sm text-amber-600">
              Current: {totalStock} {item.unit_of_measure} · Min: {item.min_stock}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <SectionCard title="Item Details">
            <div className="space-y-2 text-sm">
              {[
                ["Code",        item.item_code],
                ["Category",    item.category],
                ["Unit",        item.unit_of_measure],
                ["Min Stock",   item.min_stock],
                ["Max Stock",   item.max_stock],
                ["Reorder Qty", item.reorder_qty],
              ].map(([k, v]) => v !== undefined && v !== null && (
                <div key={k as string} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-800 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Stock by Warehouse">
            {stocks.length > 0 ? toArr(stocks).map((s: any) => (
              <div key={s.id ?? s.warehouse_id} className="p-3 bg-slate-50 rounded-lg mb-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{s.warehouse_name ?? s.warehouse_id ?? "Warehouse"}</span>
                  <span className={`text-sm font-bold ${belowMin ? "text-amber-600" : "text-emerald-600"}`}>
                    {s.quantity} {item.unit_of_measure}
                  </span>
                </div>
                <div className="mt-1 w-full bg-slate-200 rounded h-1.5">
                  <div
                    className={`h-1.5 rounded ${belowMin ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(100, (s.quantity / (item.max_stock || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 text-center py-4">No stock balance data</p>
            )}
            <div className="mt-3 p-3 bg-slate-100 rounded-lg flex justify-between">
              <span className="text-sm text-slate-600">Total Stock</span>
              <span className={`text-sm font-bold ${belowMin ? "text-amber-600" : "text-emerald-600"}`}>
                {totalStock} {item.unit_of_measure}
              </span>
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-2">
          <SectionCard title={`Stock Movements (${moves.length})`}>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {toArr(moves).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3
                                             bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    {m.movement_type === "in" || m.quantity > 0
                      ? <ArrowUp className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      : <ArrowDown className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    <div>
                      <div className="text-sm font-medium text-slate-800 capitalize">
                        {m.movement_type ?? (m.quantity > 0 ? "IN" : "OUT")}
                      </div>
                      <div className="text-xs text-slate-400">{m.reference ?? m.notes ?? "—"}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${m.quantity > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {m.quantity > 0 ? "+" : ""}{m.quantity} {item.unit_of_measure}
                    </div>
                    <div className="text-xs text-slate-400">{String(m.created_at ?? "").slice(0,10)}</div>
                  </div>
                </div>
              ))}
              {moves.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">No movement history</p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
