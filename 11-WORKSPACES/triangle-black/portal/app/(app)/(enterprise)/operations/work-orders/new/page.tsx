"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

export default function NewWorkOrderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "",
    priority: "medium", type: "corrective",
  });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const r = await tbFetch("/api/v1/work-orders/", { method: "POST", body: form });
    if (r.error) { setError(r.error); setSaving(false); return; }
    router.push("/operations/work-orders");
  }

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => router.push("/operations/work-orders")}
        className="text-sm text-blue-600 hover:underline mb-4 block">
        ← Back to Work Orders
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Work Order</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input required value={form.title} onChange={(e) => set("title", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. HVAC Filter Replacement - Room 302" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the work required..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="corrective">Corrective</option>
              <option value="preventive">Preventive</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={form.priority} onChange={(e) => set("priority", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Creating..." : "Create Work Order"}
          </button>
          <button type="button" onClick={() => router.push("/operations/work-orders")}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
