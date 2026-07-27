"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useState } from "react";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n: any) => `EGP ${Number(n || 0).toLocaleString()}`;

export default function StockBalancesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterWH, setFilterWH] = useState("all");

  const { data: stockRaw } = useQuery(["sb-stock"], () => authFetch("/api/v1/stock-balances/").then(r => r.json()));
  const { data: whRaw } = useQuery(["sb-wh"], () => authFetch("/api/v1/warehouses/").then(r => r.json()));
  const { data: invRaw } = useQuery(["sb-inv"], () => authFetch("/api/v1/inventory-items/").then(r => r.json()));

  const stock = toArr(stockRaw);
  const warehouses = toArr(whRaw);
  const items = toArr(invRaw);

  const totalValue = stock.reduce((s: number, i: any) => s + Number(i.total_value || 0), 0);
  const lowStock = stock.filter((s: any) => {
    const item = items.find((i: any) => i.id === s.item_id);
    return Number(s.qty_on_hand || 0) < Number(item?.min_stock || 999);
  });
  const outOfStock = stock.filter((s: any) => Number(s.qty_on_hand || 0) === 0);

  const filtered = stock.filter((s: any) => {
    const matchSearch = !search || (s.item_name || "").toLowerCase().includes(search.toLowerCase()) || (s.item_code || "").toLowerCase().includes(search.toLowerCase());
    const matchWH = filterWH === "all" || s.warehouse_id === filterWH;
    return matchSearch && matchWH;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div>
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Supply Chain</div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Stock Balances</h1>
        <p className="text-slate-500 mt-1">Real-time inventory levels across all warehouses</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: stock.length, sub: `${items.length} item types`, color: "blue" },
          { label: "Total Value", value: fmtEGP(totalValue), sub: `${warehouses.length} warehouses`, color: "emerald" },
          { label: "Low Stock", value: lowStock.length, sub: "below minimum level", color: lowStock.length > 0 ? "amber" : "emerald" },
          { label: "Out of Stock", value: outOfStock.length, sub: "zero quantity", color: outOfStock.length > 0 ? "red" : "emerald" },
        ].map((k, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="text-xs text-slate-500 mb-2">{k.label}</div>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-slate-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Warehouse breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses.map((wh: any) => {
          const whStock = stock.filter((s: any) => s.warehouse_id === wh.id);
          const whValue = whStock.reduce((s: number, i: any) => s + Number(i.total_value || 0), 0);
          return (
            <div key={wh.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{wh.name}</div>
                  <div className="text-xs text-slate-500">{wh.type} · {wh.address || wh.code}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${wh.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{wh.is_active ? "Active" : "Inactive"}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2">
                  <div className="text-lg font-black text-blue-500">{whStock.length}</div>
                  <div className="text-xs text-slate-400">Items</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2">
                  <div className="text-lg font-black text-emerald-500">{fmtEGP(whValue)}</div>
                  <div className="text-xs text-slate-400">Value</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2">
                  <div className="text-lg font-black text-amber-500">{whStock.filter((s: any) => Number(s.qty_on_hand) < 10).length}</div>
                  <div className="text-xs text-slate-400">Low Stock</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and filter */}
      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by item name or code..."
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400" />
        <select value={filterWH} onChange={e => setFilterWH(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400">
          <option value="all">All Warehouses</option>
          {warehouses.map((wh: any) => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
        </select>
      </div>

      {/* Stock table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Item</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Code</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Warehouse</th>
              <th className="text-right px-5 py-3 text-slate-500 font-medium">On Hand</th>
              <th className="text-right px-5 py-3 text-slate-500 font-medium">Available</th>
              <th className="text-right px-5 py-3 text-slate-500 font-medium">Value</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {filtered.slice(0, 30).map((s: any, i: number) => {
              const item = items.find((it: any) => it.id === s.item_id);
              const min = Number(item?.min_stock || 0);
              const qty = Number(s.qty_on_hand || 0);
              const isLow = min > 0 && qty < min;
              const isOut = qty === 0;
              return (
                <tr key={i} className={`hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors ${isOut ? "bg-red-50/30" : isLow ? "bg-amber-50/30" : ""}`}>
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{s.item_name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{s.item_code}</td>
                  <td className="px-5 py-3 text-slate-500">{s.warehouse_name}</td>
                  <td className={`px-5 py-3 text-right font-bold ${isOut ? "text-red-500" : isLow ? "text-amber-500" : "text-slate-800 dark:text-slate-200"}`}>{qty}</td>
                  <td className="px-5 py-3 text-right text-slate-500">{Number(s.qty_available || 0)}</td>
                  <td className="px-5 py-3 text-right text-emerald-600 font-medium">{fmtEGP(s.total_value)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${isOut ? "bg-red-100 text-red-700" : isLow ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {isOut ? "OUT" : isLow ? "LOW" : "OK"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > 30 && <div className="text-center py-3 text-xs text-slate-400">Showing 30 of {filtered.length} records</div>}
      </div>
    </div>
  );
}
