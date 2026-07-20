// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import {serviceOpsApi,  inventoryApi } from "@/lib/api";

const TYPES = ["spare_part","consumable","tool","equipment","chemical","cable","service_non_stock"];
const UNITS = ["piece","meter","liter","kg","box","roll","set","pair"];

export default function ItemsPage() {
  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    item_code:"", name:"", category:"HVAC", unit_of_measure:"piece",
    item_type:"spare_part", min_stock:0, reorder_qty:0, standard_cost:0,
  });

  const load = () => serviceOpsApi.inventory.getItems().then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.item_code.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    await serviceOpsApi.inventory.createItem(form);
    setShowForm(false);
    setForm({ item_code:"", name:"", category:"HVAC", unit_of_measure:"piece",
              item_type:"spare_part", min_stock:0, reorder_qty:0, standard_cost:0 });
    load();
  };

  return (
    <div className="p-6 space-y-5 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-700">Items Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} items registered</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-[#152239] transition-colors">
          + Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-amber-700">New Item</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key:"item_code", label:"Item Code", type:"text" },
              { key:"name",      label:"Item Name", type:"text" },
              { key:"category",  label:"Category",  type:"text" },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input type={type} value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-600" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Item Type</label>
              <select value={form.item_type}
                onChange={e => setForm(f => ({ ...f, item_type: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-600">
                {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Unit</label>
              <select value={form.unit_of_measure}
                onChange={e => setForm(f => ({ ...f, unit_of_measure: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-600">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            {[
              { key:"min_stock",      label:"Min Stock" },
              { key:"reorder_qty",    label:"Reorder Qty" },
              { key:"standard_cost",  label:"Standard Cost (EGP)" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input type="number" value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-600" />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate}
              className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-[#152239]">
              Save Item
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-50">
          <input placeholder="Search items by name, code or category…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-600" />
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No items found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Code</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Unit</th>
                  <th className="px-6 py-3 font-medium text-right">Min Stock</th>
                  <th className="px-6 py-3 font-medium text-right">Std Cost</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">{item.item_code}</td>
                    <td className="px-6 py-3 font-medium text-gray-800">{item.name}</td>
                    <td className="px-6 py-3 text-gray-600">{item.category}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                        {item.item_type.replace(/_/g," ")}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{item.unit_of_measure}</td>
                    <td className="px-6 py-3 text-right text-gray-700">{item.min_stock}</td>
                    <td className="px-6 py-3 text-right text-gray-700">
                      {item.standard_cost > 0 ? `EGP ${item.standard_cost.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium
                        ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
