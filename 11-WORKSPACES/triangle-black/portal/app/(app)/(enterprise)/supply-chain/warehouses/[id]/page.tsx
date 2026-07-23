"use client"; // @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Package, MapPin, ArrowUp, ArrowDown, BarChart3 } from "lucide-react";

export default function WarehouseDetailPage() {
  const { id } = useParams();

  const { data: warehouse, isLoading: wl } = useQuery({
    queryKey: ["warehouse", id],
    queryFn: () => authFetch(`/api/v1/warehouses/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: stockData = {} } = useQuery({
    queryKey: ["warehouse-stock", id],
    queryFn: () => authFetch(`/api/v1/stock-balances/?warehouse_id=${id}&limit=50`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: movementsData = {} } = useQuery({
    queryKey: ["warehouse-movements", id],
    queryFn: () => authFetch(`/api/v1/stock-movements/?warehouse_id=${id}&limit=30`).then(r => r.json()),
    enabled: !!id,
  });

  if (wl) return <PageWrapper><LoadingState title="Loading warehouse..." /></PageWrapper>;
  if (!warehouse || warehouse.detail) return (
    <PageWrapper><p className="p-8 text-slate-400">Warehouse not found</p></PageWrapper>
  );

  const stocks    = Array.isArray(stockData)    ? stockData    : stockData?.data    ?? stockData?.items    ?? [];
  const movements = Array.isArray(movementsData) ? movementsData : movementsData?.data ?? movementsData?.items ?? [];

  const totalItems    = stocks.length;
  const belowMinItems = stocks.filter((s: any) => {
    const min = Number(s.min_stock || s.item?.min_stock || 0);
    return Number(s.quantity || 0) <= min;
  }).length;

  const totalValue = stocks.reduce((sum: number, s: any) => {
    return sum + (Number(s.quantity || 0) * Number(s.unit_cost || 0));
  }, 0);

  return (
    <PageWrapper>
      <PageHeader
        title={warehouse.name || "Warehouse"}
        subtitle={warehouse.location || warehouse.address || ""}
        badge={warehouse.is_active !== false ? "Active" : "Inactive"}
      />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Items",    value: totalItems,    icon: Package,  color: "text-blue-600" },
          { label: "Below Minimum",  value: belowMinItems, icon: BarChart3, color: belowMinItems > 0 ? "text-red-600" : "text-emerald-600" },
          { label: "Est. Value EGP", value: `${totalValue.toLocaleString()}`, icon: MapPin, color: "text-slate-700" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Stock levels */}
        <SectionCard title={`Stock Levels (${stocks.length})`}>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {stocks.map((s: any) => {
              const qty = Number(s.quantity || 0);
              const min = Number(s.min_stock || s.item?.min_stock || 0);
              const max = Number(s.max_stock || s.item?.max_stock || qty * 2 || 100);
              const pct = max > 0 ? Math.min(100, Math.round(qty / max * 100)) : 0;
              const isLow = qty <= min;
              return (
                <div key={s.id ?? s.item_id}
                     className={`p-3 rounded-lg border ${isLow ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-slate-50"}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {s.item_name ?? s.name ?? s.item_id}
                      </div>
                      <div className="text-xs text-slate-400">{s.item_code ?? ""}</div>
                    </div>
                    <span className={`text-sm font-bold ml-2 flex-shrink-0 ${isLow ? "text-amber-600" : "text-emerald-600"}`}>
                      {qty} {s.unit_of_measure ?? ""}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded h-1.5">
                    <div
                      className={`h-1.5 rounded ${isLow ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {stocks.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No stock in this warehouse</p>
            )}
          </div>
        </SectionCard>

        {/* Recent movements */}
        <SectionCard title={`Recent Movements (${movements.length})`}>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {movements.map((m: any) => {
              const isIn = m.movement_type === "in" || Number(m.quantity) > 0;
              return (
                <div key={m.id}
                     className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    {isIn
                      ? <ArrowUp className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      : <ArrowDown className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    <div>
                      <div className="text-sm font-medium text-slate-700">
                        {m.item_name ?? m.reference ?? (isIn ? "Stock In" : "Stock Out")}
                      </div>
                      <div className="text-xs text-slate-400">
                        {String(m.created_at ?? "").slice(0,10)}
                        {m.reference ? ` · ${m.reference}` : ""}
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${isIn ? "text-emerald-600" : "text-red-600"}`}>
                    {isIn ? "+" : ""}{m.quantity} {m.unit_of_measure ?? ""}
                  </span>
                </div>
              );
            })}
            {movements.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No recent movements</p>
            )}
          </div>
        </SectionCard>
      </div>
    </PageWrapper>
  );
}
