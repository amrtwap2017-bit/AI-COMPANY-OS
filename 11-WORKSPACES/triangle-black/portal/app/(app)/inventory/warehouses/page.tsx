// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import {serviceOpsApi,  inventoryApi } from "@/lib/api";

const TYPES = { main:"Main Warehouse", branch:"Branch", project:"Project Store", technician:"Tech Van", quarantine:"Quarantine" };

export default function WarehousesPage() {
  const [whs, setWhs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code:"", name:"", type:"main", address:"", manager_name:"" });

  const safe = (d) => Array.isArray(d) ? d : (d && d.items) ? d.items : [];
  const load = () => serviceOpsApi.warehouses.getWarehouses().then(d => setWhs(safe(d))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await serviceOpsApi.warehouses.createWarehouse(form);
    setShowForm(false);
    setForm({ code:"", name:"", type:"main", address:"", manager_name:"" });
    load();
  };

  return (
    <div className="p-6 space-y-5 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-700">Warehouses</h1>
          <p className="text-sm text-gray-500 mt-1">{whs.length} locations</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-[#152239]">+ Add Warehouse</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[{key:"code",label:"Code"},{key:"name",label:"Name"},{key:"manager_name",label:"Manager"},{key:"address",label:"Address"}].map(({key,label}) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input value={form[key]} onChange={e => setForm(f => ({...f,[key]:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-600" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({...f,type:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                {Object.entries(TYPES).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium">Save Warehouse</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="p-8 text-center text-gray-400">Loading...</div>
        : whs.length === 0 ? <div className="p-8 text-center text-gray-400">No warehouses yet. Add one above.</div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whs.map(wh => (
              <div key={wh.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{wh.name}</p>
                    <p className="text-xs font-mono text-gray-400">{wh.code}</p>
                  </div>
                  <span className={"px-2 py-0.5 rounded text-xs font-medium " + (wh.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                    {wh.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs mb-2">{TYPES[wh.type] || wh.type}</span>
                <div className="text-xs text-gray-500 space-y-1">
                  {wh.manager_name && <p>👤 {wh.manager_name}</p>}
                  {wh.address && <p>📍 {wh.address}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
