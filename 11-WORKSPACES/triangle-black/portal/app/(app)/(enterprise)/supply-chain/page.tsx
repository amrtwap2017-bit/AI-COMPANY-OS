"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n: any) => `EGP ${Number(n || 0).toLocaleString()}`;
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function SupplyChainHub() {
  const router = useRouter();
  const { data: prRaw } = useQuery(["sc-prs"], () => authFetch("/api/v1/purchase-requests/").then(r => r.json()));
  const { data: poRaw } = useQuery(["sc-pos"], () => authFetch("/api/v1/purchase-orders/").then(r => r.json()));
  const { data: stockRaw } = useQuery(["sc-stock"], () => authFetch("/api/v1/stock-balances/").then(r => r.json()));
  const { data: supplierRaw } = useQuery(["sc-suppliers"], () => authFetch("/api/v1/suppliers/").then(r => r.json()));
  const { data: whRaw } = useQuery(["sc-wh"], () => authFetch("/api/v1/warehouses/").then(r => r.json()));
  const { data: invRaw } = useQuery(["sc-inv"], () => authFetch("/api/v1/inventory-items/").then(r => r.json()));
  const { data: dash } = useQuery(["sc-dash"], () => authFetch("/api/v1/dashboard/summary").then(r => r.json()));

  const prs = toArr(prRaw);
  const pos = toArr(poRaw);
  const stock = toArr(stockRaw);
  const suppliers = toArr(supplierRaw);
  const warehouses = toArr(whRaw);
  const invItems = toArr(invRaw);
  const d = dash?.inventory || {};

  const pendingPRs = prs.filter((p: any) => p.status === "pending" || p.status === "submitted");
  const approvedPRs = prs.filter((p: any) => p.status === "approved");
  const pendingPOs = pos.filter((p: any) => p.status === "pending" || p.status === "submitted");
  const totalStockValue = stock.reduce((s: number, i: any) => s + Number(i.total_value || 0), 0);
  const lowStockItems = stock.filter((s: any) => {
    const item = invItems.find((i: any) => i.id === s.item_id);
    return Number(s.qty_on_hand || 0) < Number(item?.min_stock || 999);
  });
  const preferredSuppliers = suppliers.filter((s: any) => s.preferred_flag);

  return (
    <div className="tb-page">
      <div>
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Supply Chain</div>
        <h1 className="text-3xl font-black text-primary">Supply Chain Hub</h1>
        <p className="text-secondary mt-1">Procurement, inventory, suppliers, and warehouses</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending PRs", value: pendingPRs.length, sub: `${approvedPRs.length} approved`, color: "amber", path: "/supply-chain/purchase-requests" },
          { label: "Active POs", value: pendingPOs.length, sub: `${pos.length} total`, color: "blue", path: "/supply-chain/purchase-orders" },
          { label: "Stock Value", value: fmtEGP(totalStockValue), sub: `${stock.length} items tracked`, color: "emerald", path: "/supply-chain/stock-balances" },
          { label: "Low Stock Alerts", value: lowStockItems.length, sub: "below minimum level", color: lowStockItems.length > 0 ? "red" : "emerald", path: "/supply-chain/reorder" },
        ].map((k, i) => (
          <button key={i} onClick={() => router.push(k.path)}
            className="bg-surface border border-border rounded-2xl p-5 text-left hover:border-amber-400 hover:shadow-lg transition-all">
            <div className="text-xs text-secondary mb-2">{k.label}</div>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-tertiary mt-1">{k.sub}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending PRs */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Pending Purchase Requests</h2>
            <button onClick={() => router.push("/supply-chain/purchase-requests")} className="text-xs text-amber-500 hover:underline">All PRs →</button>
          </div>
          {pendingPRs.length === 0 ? (
            <div className="text-center py-6 text-tertiary text-sm">✅ No pending PRs</div>
          ) : pendingPRs.slice(0, 6).map((pr: any, i: number) => (
            <button key={i} onClick={() => router.push(`/supply-chain/purchase-requests/${pr.id}`)}
              className="w-full flex items-center justify-between p-3 mb-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 text-left">
              <div>
                <div className="text-sm font-semibold truncate">{pr.title || pr.pr_number}</div>
                <div className="text-xs text-amber-600">{pr.department} · {pr.urgency}</div>
              </div>
              <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded font-bold">{pr.status}</span>
            </button>
          ))}
        </div>

        {/* Suppliers */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Suppliers</h2>
            <button onClick={() => router.push("/supply-chain/suppliers")} className="text-xs text-amber-500 hover:underline">All →</button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            {[
              { label: "Total", value: suppliers.length, color: "blue" },
              { label: "Preferred", value: preferredSuppliers.length, color: "emerald" },
              { label: "Active", value: suppliers.filter((s: any) => s.status === "active").length, color: "amber" },
            ].map((s, i) => (
              <div key={i} className="bg-base-alt dark:bg-surface-alt rounded-xl p-3">
                <div className={`text-2xl font-black text-${s.color}-500`}>{s.value}</div>
                <div className="text-xs text-secondary">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {suppliers.slice(0, 5).map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 bg-base-alt dark:bg-surface-alt rounded-lg">
                <div>
                  <div className="text-sm font-medium text-primary truncate">{s.company_name}</div>
                  <div className="text-xs text-tertiary">{s.supplier_type} · {s.payment_terms}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  {s.preferred_flag && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">★ Preferred</span>}
                  <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${s.risk_level === "low" ? "bg-emerald-100 text-emerald-700" : s.risk_level === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{s.risk_level || "—"} risk</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warehouses */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-primary">Warehouses</h2>
          <button onClick={() => router.push("/supply-chain/stock-balances")} className="text-xs text-amber-500 hover:underline">Stock levels →</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.map((wh: any) => {
            const whStock = stock.filter((s: any) => s.warehouse_id === wh.id);
            const whValue = whStock.reduce((s: number, i: any) => s + Number(i.total_value || 0), 0);
            return (
              <div key={wh.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-primary">{wh.name}</div>
                    <div className="text-xs text-secondary">{wh.type} · Manager: {wh.manager_name || "—"}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${wh.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-secondary"}`}>
                    {wh.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-base-alt dark:bg-surface-alt rounded-lg p-2 text-center">
                    <div className="text-lg font-black text-blue-500">{whStock.length}</div>
                    <div className="text-xs text-tertiary">Items</div>
                  </div>
                  <div className="bg-base-alt dark:bg-surface-alt rounded-lg p-2 text-center">
                    <div className="text-sm font-black text-emerald-500">{fmtEGP(whValue)}</div>
                    <div className="text-xs text-tertiary">Total Value</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Purchase Requests", icon: "📝", path: "/supply-chain/purchase-requests" },
          { label: "Purchase Orders", icon: "📦", path: "/supply-chain/purchase-orders" },
          { label: "Inventory", icon: "🗃️", path: "/supply-chain/inventory" },
          { label: "Suppliers", icon: "🏢", path: "/supply-chain/suppliers" },
        ].map((a, i) => (
          <button key={i} onClick={() => router.push(a.path)}
            className="bg-surface border border-border rounded-2xl p-5 text-center hover:border-amber-400 hover:shadow-lg transition-all">
            <div className="text-2xl mb-2">{a.icon}</div>
            <div className="text-sm font-bold text-primary">{a.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
