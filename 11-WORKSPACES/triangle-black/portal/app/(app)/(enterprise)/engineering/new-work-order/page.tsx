"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useState } from "react";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function NewWorkOrder() {
  const { data: techData } = useQuery(["techs"], () => authFetch("/api/v1/technicians/").then(r => r.json()));
  const { data: assetData } = useQuery(["assets-wo"], () => authFetch("/api/v1/assets/").then(r => r.json()));
  const techs = toArr(techData);
  const assets = toArr(assetData);

  const [form, setForm] = useState({ title: "", description: "", priority: "medium", asset_id: "", technician_id: "" });
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatus("Submitting...");
    try {
      const res = await authFetch("/api/v1/work-orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("✅ Work order created successfully");
        setForm({ title: "", description: "", priority: "medium", asset_id: "", technician_id: "" });
      } else {
        const err = await res.text();
        setStatus("❌ Error: " + err);
      }
    } catch (err: any) {
      setStatus("❌ " + err.message);
    }
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Create Work Order</h1>
      {status && <div className={`p-3 rounded text-sm ${status.includes("✅") ? "bg-green-50 text-green-700" : status.includes("❌") ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>{status}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-lg border">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input className="w-full border rounded px-3 py-2 dark:bg-zinc-800" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="w-full border rounded px-3 py-2 dark:bg-zinc-800" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select className="w-full border rounded px-3 py-2 dark:bg-zinc-800" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Asset</label>
            <select className="w-full border rounded px-3 py-2 dark:bg-zinc-800" value={form.asset_id} onChange={e => setForm({ ...form, asset_id: e.target.value })}>
              <option value="">— Select Asset —</option>
              {assets.map((a: any) => <option key={a.id} value={a.id}>{a.name || a.asset_name || a.id}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Assign Technician</label>
          <select className="w-full border rounded px-3 py-2 dark:bg-zinc-800" value={form.technician_id} onChange={e => setForm({ ...form, technician_id: e.target.value })}>
            <option value="">— Select Technician —</option>
            {techs.map((t: any) => <option key={t.id} value={t.id}>{t.name || t.full_name || t.id}</option>)}
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">Create Work Order</button>
      </form>
    </div>
  );
}
