"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

export default function NewGLEntryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    description: "", reference: "",
    total_debit: "", total_credit: "",
  });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const r = await tbFetch("/api/v1/financial/gl/", {
      method: "POST",
      body: {
        description: form.description,
        reference: form.reference,
        total_debit: parseFloat(form.total_debit) || 0,
        total_credit: parseFloat(form.total_credit) || 0,
      }
    });
    if (r.error) { setError(r.error); setSaving(false); return; }
    router.push("/financial/gl");
  }

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => router.push("/financial/gl")} className="text-sm text-blue-600 hover:underline mb-4 block">
        ← Back to General Ledger
      </button>
      <h1 className="text-2xl font-bold text-[var(--color-text-1)] mb-6">New Journal Entry</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input value={form.description} onChange={(e) => set("description", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Payment received from client..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
          <input value={form.reference} onChange={(e) => set("reference", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="INV-2026-001" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Debit (EGP)</label>
            <input type="number" step="0.01" value={form.total_debit}
              onChange={(e) => set("total_debit", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit (EGP)</label>
            <input type="number" step="0.01" value={form.total_credit}
              onChange={(e) => set("total_credit", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00" />
          </div>
        </div>
        {form.total_debit && form.total_credit && parseFloat(form.total_debit) !== parseFloat(form.total_credit) && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            ⚠ Debit and credit do not balance
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Posting..." : "Post Entry"}
          </button>
          <button type="button" onClick={() => router.push("/financial/gl")}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
