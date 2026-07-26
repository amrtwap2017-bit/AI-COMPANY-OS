// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtNum = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };

const CATEGORIES = ["all","HVAC","Electrical","Plumbing","Fire Safety","Mechanical","Consumables","Tools","Other"];

export default function InventoryPage() {
  const [catFilter, setCatFilter] = useState("all");
  const [search,    setSearch]    = useState("all");
  const [lowOnly,   setLowOnly]   = useState(false);
  const [q,         setQ]         = useState("");

  const { data: itemsRaw = [], isLoading: itemsLoading } = useQuery(
    ["inventory-items"],
    () => authFetch("/api/v1/inventory-items/?limit=300").then(r => r.json()),
    { refetchInterval: 120000 }
  );

  const { data: stockRaw = [], isLoading: stockLoading } = useQuery(
    ["stock-balances"],
    () => authFetch("/api/v1/stock-balances/?limit=300").then(r => r.json()),
    { refetchInterval: 120000 }
  );

  const items  = toArr(itemsRaw);
  const stocks = toArr(stockRaw);

  const stockMap = stocks.reduce((m, s) => { m[s.item_id] = s; return m; }, {});

  const enriched = items.map(item => {
    const stock = stockMap[item.id] || {};
    return {
      ...item,
      qty_on_hand: stock.qty_on_hand ?? item.qty_on_hand ?? 0,
      qty_reserved: stock.qty_reserved ?? 0,
      warehouse_name: stock.warehouse_name || "—",
      is_low: (stock.qty_on_hand ?? item.qty_on_hand ?? 0) < (item.min_stock ?? 0),
      is_zero: (stock.qty_on_hand ?? item.qty_on_hand ?? 0) === 0,
    };
  });

  const filtered = enriched.filter(i => {
    if (catFilter !== "all" && i.category !== catFilter) return false;
    if (lowOnly && !i.is_low) return false;
    if (q && !i.name?.toLowerCase().includes(q.toLowerCase()) &&
             !i.sku?.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const isLoading = itemsLoading || stockLoading;
  const total     = items.length;
  const lowStock  = enriched.filter(i => i.is_low).length;
  const zeroStock = enriched.filter(i => i.is_zero).length;
  const okStock   = total - lowStock;
  const catCounts = items.reduce((a, i) => { a[i.category] = (a[i.category]||0)+1; return a; }, {});

  return (
    <PageWrapper>
      <PageHeader
        title="Inventory"
        subtitle={`${total} items · ${lowStock} below minimum · ${zeroStock} out of stock`}
        breadcrumbs={[{label:"Supply Chain",href:"/supply-chain"},{label:"Inventory"}]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total Items",   value:total,    color:"text-slate-800"},
          {label:"OK Stock",      value:okStock,  color:"text-emerald-700"},
          {label:"Low Stock",     value:lowStock, color:"text-amber-700"},
          {label:"Out of Stock",  value:zeroStock,color:"text-red-700"},
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading ? "…" : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {!isLoading && lowStock > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-amber-500 text-lg">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{lowStock} items below minimum stock level</p>
            <p className="text-xs text-amber-600">{zeroStock} items completely out of stock — review reorder requirements</p>
          </div>
          <button onClick={() => setLowOnly(!lowOnly)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${lowOnly ? "bg-amber-600 text-white border-amber-600" : "bg-white text-amber-700 border-amber-300 hover:bg-amber-50"}`}>
            {lowOnly ? "Show all" : "Show low stock only"}
          </button>
        </div>
      )}

      {!isLoading && Object.keys(catCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(catCounts).sort((a,b) => b[1]-a[1]).map(([cat, count]) => (
            <button key={cat}
              onClick={() => setCatFilter(catFilter === cat ? "all" : cat)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${catFilter === cat ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
              {cat} <span className={catFilter === cat ? "text-blue-200" : "text-slate-400"}>({count})</span>
            </button>
          ))}
          {catFilter !== "all" && (
            <button onClick={() => setCatFilter("all")} className="text-xs text-slate-400 hover:text-red-500 underline px-1">Clear</button>
          )}
        </div>
      )}

      <SectionCard title={`Inventory Items (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search item name or SKU…" value={q}
            onChange={e => setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-blue-400" />
          {(catFilter !== "all" || lowOnly || q) && (
            <button onClick={() => { setCatFilter("all"); setLowOnly(false); setQ(""); }}
              className="text-xs text-slate-400 hover:text-red-500 underline">Clear all</button>
          )}
        </div>

        {isLoading ? <LoadingState /> : filtered.length === 0 ? (
          <EmptyState title="No items found" subtitle="Adjust filters to see inventory items" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Item Name","SKU","Category","Unit","On Hand","Reserved","Min Stock","Status"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(item => (
                  <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${item.is_zero ? "bg-red-50/40" : item.is_low ? "bg-amber-50/30" : ""}`}>
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.description?.slice(0,50) || ""}</p>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-500">{item.sku || "—"}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">{item.category || "—"}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-500">{item.unit || "—"}</td>
                    <td className="py-3 px-3">
                      <span className={`text-sm font-bold ${item.is_zero ? "text-red-600" : item.is_low ? "text-amber-600" : "text-slate-800"}`}>
                        {fmtNum(item.qty_on_hand)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-500">{fmtNum(item.qty_reserved)}</td>
                    <td className="py-3 px-3 text-xs text-slate-500">{item.min_stock ? fmtNum(item.min_stock) : "—"}</td>
                    <td className="py-3 px-3">
                      {item.is_zero
                        ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Out of Stock</span>
                        : item.is_low
                        ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Low Stock</span>
                        : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">OK</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}
