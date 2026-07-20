// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {serviceOpsApi,  inventoryApi } from "@/lib/api";

export default function InventoryDashboardPage() {
  const [dash, setDash]   = useState<any>(null);
  const [low, setLow]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([serviceOpsApi.inventory.getInventoryDashboard(), serviceOpsApi.inventory.getLowStock()])
      .then(([d, l]) => { setDash(d); setLow(l.items || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading inventory…</div>;

  const cards = [
    { label: "Total Items",    value: dash?.items?.total ?? 0,    color: "text-[#1B2B4B]", bg: "bg-slate-50" },
    { label: "Active Items",   value: dash?.items?.active ?? 0,   color: "text-green-600", bg: "bg-green-50" },
    { label: "Low Stock",      value: dash?.items?.low_stock ?? 0, color: "text-red-500",   bg: "bg-red-50"   },
    { label: "Warehouses",     value: dash?.warehouses?.total ?? 0,color: "text-blue-600",  bg: "bg-blue-50"  },
    { label: "Vendors",        value: dash?.vendors?.total ?? 0,   color: "text-purple-600",bg: "bg-purple-50"},
    { label: "Open PRs",       value: dash?.procurement?.open_prs ?? 0, color: "text-amber-500", bg: "bg-amber-50"},
    { label: "Open POs",       value: dash?.procurement?.open_pos ?? 0, color: "text-indigo-600", bg: "bg-indigo-50"},
    { label: "Pending GRN",    value: dash?.procurement?.pending_grn ?? 0,color: "text-orange-500",bg: "bg-orange-50"},
  ];

  const navItems = [
    { href: "/inventory/items",     label: "Items Catalog",      icon: "📦" },
    { href: "/inventory/warehouses",label: "Warehouses",          icon: "🏭" },
    { href: "/inventory/vendors",   label: "Vendors",             icon: "🤝" },
    { href: "/inventory/purchase-requests", label: "Purchase Requests", icon: "📋" },
    { href: "/inventory/purchase-orders",   label: "Purchase Orders",   icon: "🛒" },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B4B]">Inventory Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Stock control, procurement and vendor management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 shadow-sm border border-gray-100`}>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {navItems.map(({ href, label, icon }) => (
          <Link key={href} href={href}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100
                       hover:border-[#1B2B4B] hover:shadow-md transition-all text-center group">
            <div className="text-3xl mb-2">{icon}</div>
            <p className="text-sm font-semibold text-[#1B2B4B] group-hover:text-amber-500
                          transition-colors">{label}</p>
          </Link>
        ))}
      </div>

      {low.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">⚠ Low Stock Alerts ({low.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 pr-4">Code</th>
                  <th className="pb-2 pr-4">Item</th>
                  <th className="pb-2 pr-4">Category</th>
                  <th className="pb-2 pr-4 text-right">Min Stock</th>
                  <th className="pb-2 text-right">Reorder Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {low.slice(0, 10).map((item: any) => (
                  <tr key={item.id} className="hover:bg-red-50">
                    <td className="py-2 pr-4 font-mono text-xs text-gray-500">{item.item_code}</td>
                    <td className="py-2 pr-4 font-medium text-gray-800">{item.name}</td>
                    <td className="py-2 pr-4 text-gray-500">{item.category}</td>
                    <td className="py-2 pr-4 text-right text-red-500 font-semibold">{item.min_stock} {item.unit}</td>
                    <td className="py-2 text-right text-gray-600">{item.reorder_qty} {item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
