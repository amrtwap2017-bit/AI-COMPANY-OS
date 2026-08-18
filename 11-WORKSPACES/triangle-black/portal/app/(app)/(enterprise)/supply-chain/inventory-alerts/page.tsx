"use client";
// @ts-nocheck
// Triangle Black — Inventory Alerts Dashboard
// Sprint-034: Low Stock + Reorder Alerts

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const fmtNum = (n: any) => Number(n || 0).toLocaleString();

type StockItem = {
  id: string; item_id: string; warehouse_id: string;
  qty_on_hand: number; qty_reserved: number; qty_available: number;
  item_name?: string; item_code?: string; reorder_point?: number;
};

function AlertBadge({ level }: { level: "critical" | "low" | "ok" }) {
  if (level === "critical") return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-medium">🔴 Critical</span>;
  if (level === "low")      return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">🟡 Low Stock</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">✅ OK</span>;
}

function StockBar({ available, onHand }: { available: number; onHand: number }) {
  const pct = onHand > 0 ? Math.min(100, (available / onHand) * 100) : 0;
  const color = pct < 20 ? "bg-red-500" : pct < 50 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{Math.round(pct)}%</span>
    </div>
  );
}

export default function InventoryAlertsPage() {
  const router = useRouter();
  const [mounted, setMounted]     = useState(false);
  const [stocks, setStocks]       = useState<StockItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [threshold, setThreshold] = useState(20);
  const [filter, setFilter]       = useState<"all"|"critical"|"low">("all");
  const [search, setSearch]       = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/stock-balances/?limit=200")
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d) ? d : d?.results || d?.items || [];
        setStocks(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted]);

  const getLevel = (s: StockItem): "critical" | "low" | "ok" => {
    const avail = Number(s.qty_available || 0);
    if (avail <= 0)         return "critical";
    if (avail < threshold)  return "low";
    return "ok";
  };

  const filtered = stocks.filter(s => {
    const level = getLevel(s);
    const matchFilter = filter === "all" || level === filter;
    const name = (s.item_name || s.item_id || "").toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) ||
      (s.item_code || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }).sort((a,b) => Number(a.qty_available||0) - Number(b.qty_available||0));

  const critical = stocks.filter(s => getLevel(s) === "critical").length;
  const low      = stocks.filter(s => getLevel(s) === "low").length;
  const ok       = stocks.filter(s => getLevel(s) === "ok").length;

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Inventory Alerts</h1>
          <p className="text-gray-500 text-sm mt-1">
            {stocks.length} stock locations · {critical} critical · {low} low stock
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500">Alert threshold:</label>
          <input type="number" min="1" max="100" value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-900" />
          <button onClick={() => router.push("/supply-chain/inventory")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
            📦 Inventory
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"🔴 Critical (Out/Near Zero)", value:critical, color:"bg-red-50 border-red-200", tag:"critical" },
          { label:"🟡 Low Stock",                value:low,      color:"bg-yellow-50 border-yellow-200", tag:"low" },
          { label:"✅ Adequate Stock",            value:ok,       color:"bg-green-50 border-green-200", tag:"all" },
        ].map(k => (
          <button key={k.label}
            onClick={() => setFilter(filter===k.tag ? "all" : k.tag as any)}
            className={`${k.color} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity ${filter===k.tag ? "ring-2 ring-gray-900" : ""}`}>
            <p className="text-xs text-gray-500 font-medium">{k.label}</p>
            <p className="text-3xl font-bold text-[var(--color-text-1)] mt-1">{k.value}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <input type="search" placeholder="Search by item name or code..."
        value={search} onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
          {filter === "all" ? "All stock levels are adequate ✅" : `No ${filter} stock items found`}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Alert","Item","Code","Warehouse","On Hand","Reserved","Available","Stock Level"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(s => {
                const level = getLevel(s);
                return (
                  <tr key={s.id} className={`hover:bg-gray-50 ${level === "critical" ? "bg-red-50" : level === "low" ? "bg-yellow-50" : ""}`}>
                    <td className="px-4 py-3"><AlertBadge level={level} /></td>
                    <td className="px-4 py-3 font-medium text-[var(--color-text-1)] max-w-40 truncate">
                      {s.item_name || s.item_id || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.item_code || s.item_id?.slice(0,8) || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-32">{s.warehouse_id || "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{fmtNum(s.qty_on_hand)}</td>
                    <td className="px-4 py-3 text-gray-500">{fmtNum(s.qty_reserved)}</td>
                    <td className={`px-4 py-3 font-bold ${level==="critical" ? "text-red-600" : level==="low" ? "text-yellow-600" : "text-green-600"}`}>
                      {fmtNum(s.qty_available)}
                    </td>
                    <td className="px-4 py-3 w-32">
                      <StockBar available={Number(s.qty_available||0)} onHand={Number(s.qty_on_hand||1)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            Showing {filtered.length} of {stocks.length} stock locations · Threshold: &lt;{threshold} units = low stock
          </div>
        </div>
      )}
    </div>
  );
}
