"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

export default function EditLeadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", company: "", phone: "",
    source: "web", priority: "medium", notes: "", status: "new",
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    tbFetch(`/api/v1/leads/${id}`).then((r) => {
      if (r.data) {
        const d = r.data as any;
        setForm({
          name: d.name || "",
          email: d.email || "",
          company: d.company || "",
          phone: d.phone || "",
          source: d.source || "web",
          priority: d.priority || "medium",
          notes: d.notes || "",
          status: d.status || "new",
        });
      }
      setLoading(false);
    });
  }, [mounted, id]);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const r = await tbFetch(`/api/v1/actions/leads/${id}`, { method: "PATCH", body: form });
    if (r.error) { setError(r.error); setSaving(false); return; }
    router.push(`/leads/${id}`);
  }

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => router.push(`/leads/${id}`)} className="text-sm text-blue-600 hover:underline mb-4 block">
        ← Back to Lead
      </button>
      <h1 className="text-2xl font-bold text-[var(--color-text-1)] mb-6">Edit Lead</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input required value={form.name} onChange={(e: any) => set("name", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input required type="email" value={form.email} onChange={(e: any) => set("email", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input value={form.company} onChange={(e: any) => set("company", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={form.phone} onChange={(e: any) => set("phone", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={(e: any) => set("status", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="new">New</option>
              <option value="qualified">Qualified</option>
              <option value="negotiation">Negotiation</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={form.priority} onChange={(e: any) => set("priority", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={(e: any) => set("notes", e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.push(`/leads/${id}`)}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
