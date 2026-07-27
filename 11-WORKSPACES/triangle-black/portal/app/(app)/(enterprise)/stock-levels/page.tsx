"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function StockLevels() {
  const { data, isLoading } = useQuery(
    ["stock-levels"],
    () => authFetch("/api/v1/stock-balances/").then(r => r.json())
  );
  const items = toArr(data);
  const lowStock = items.filter((i: any) => Number(i.quantity || i.balance || 0) < Number(i.min_quantity || i.reorder_point || 10));

  if (isLoading) return <div className="p-6 text-gray-400">Loading stock levels...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Stock Levels</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Items</div>
          <div className="text-3xl font-bold">{items.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4 border-red-200">
          <div className="text-sm text-red-500">Low Stock Alerts</div>
          <div className="text-3xl font-bold text-red-600">{lowStock.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">Warehouses Active</div>
          <div className="text-3xl font-bold">{new Set(items.map((i: any) => i.warehouse_id)).size}</div>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-zinc-800">
            <tr>
              <th className="text-left p-3">Item</th>
              <th className="text-left p-3">Warehouse</th>
              <th className="text-right p-3">Quantity</th>
              <th className="text-right p-3">Min Level</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, i: number) => {
              const qty = Number(item.quantity || item.balance || 0);
              const min = Number(item.min_quantity || item.reorder_point || 10);
              const isLow = qty < min;
              return (
                <tr key={item.id || i} className="border-t hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <td className="p-3 font-medium">{item.item_name || item.name || item.sku || item.id}</td>
                  <td className="p-3 text-gray-500">{item.warehouse_name || item.warehouse_id || "—"}</td>
                  <td className={`p-3 text-right font-mono ${isLow ? "text-red-600 font-bold" : ""}`}>{qty}</td>
                  <td className="p-3 text-right font-mono text-gray-400">{min}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${isLow ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {isLow ? "LOW" : "OK"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
