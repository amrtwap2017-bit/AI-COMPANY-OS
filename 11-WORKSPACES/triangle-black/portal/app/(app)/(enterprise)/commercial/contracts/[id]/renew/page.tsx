"use client";
// @ts-nocheck
// Triangle Black — Contract Renewal
// Sprint-037: Contract Renewal Portal
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { toast } from "sonner";

const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n: any) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_COLOR: Record<string,string> = {
  active:   "bg-green-100 text-green-800",
  expired:  "bg-red-100 text-red-800",
  pending:  "bg-yellow-100 text-yellow-800",
  draft:    "bg-gray-100 text-gray-600",
};

export default function ContractRenewPage() {
  const { id }  = useParams();
  const router  = useRouter();
  const [mounted, setMounted]   = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [form, setForm] = useState({
    start_date:   "",
    end_date:     "",
    total_value:  "",
    notes:        "",
    renewal_type: "standard",
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    tbFetch(`/api/v1/contracts/${id}`)
      .then(r => r.json())
      .then((d: any) => {
        setContract(d);
        // Pre-fill with current contract + 1 year
        const now = new Date();
        const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        setForm(f => ({
          ...f,
          total_value:  String(d.total_value || ""),
          start_date:   now.toISOString().split("T")[0],
          end_date:     nextYear.toISOString().split("T")[0],
        }));
      })
      .catch(() => toast.error("Failed to load contract"))
      .finally(() => setLoading(false));
  }, [mounted, id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.start_date || !form.end_date) { toast.error("Start and end dates required"); return; }
    setSaving(true);
    try {
      // Create a new contract as renewal
      const res = await tbFetch("/api/v1/contracts/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       `${contract?.title || "Contract"} — Renewal`,
          description: form.notes || `Renewal of contract ${id?.slice(0,8)}`,
          total_value: Number(form.total_value) || 0,
          services:    contract?.services || [],
          lead_id:     contract?.lead_id,
          renewal_of:  id,
        }),
      });
      const data = await res.json();
      if (data.id) {
        toast.success("Contract renewal created successfully");
        router.push(`/commercial/contracts/${data.id}`);
      } else {
        toast.error(data.detail || "Renewal failed");
      }
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  if (!contract || contract.detail) return (
    <div className="p-8 text-center text-gray-500">
      <p className="text-2xl mb-2">📄</p><p>Contract not found</p>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <button onClick={() => router.push(`/commercial/contracts/${id}`)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← Back to Contract
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Renew Contract</h1>
        <p className="text-gray-500 text-sm mt-1">Create a renewal for this contract</p>
      </div>

      {/* Current Contract */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[var(--color-text-1)]">{contract.title}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(STATUS_COLOR as Record<string, any>)[contract.status] || "bg-gray-100 text-gray-600"}`}>
            {contract.status || "active"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            ["Current Value", fmtEGP(contract.total_value)],
            ["Services",      `${(contract.services||[]).length} items`],
            ["Contract ID",   id?.slice(0,12) + "..."],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-medium text-[var(--color-text-1)] mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Renewal Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="font-semibold text-[var(--color-text-1)]">Renewal Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Renewal Start Date *</label>
            <input type="date" required value={form.start_date}
              onChange={e => setForm(f=>({...f,start_date:e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Renewal End Date *</label>
            <input type="date" required value={form.end_date}
              onChange={e => setForm(f=>({...f,end_date:e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Renewal Value (EGP)</label>
          <input type="number" min="0" step="0.01" value={form.total_value}
            onChange={e => setForm(f=>({...f,total_value:e.target.value}))}
            placeholder={String(contract.total_value || "0")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          <p className="text-xs text-gray-400 mt-1">Leave blank to keep same value: {fmtEGP(contract.total_value)}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Renewal Type</label>
          <select value={form.renewal_type} onChange={e => setForm(f=>({...f,renewal_type:e.target.value}))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
            {["standard","extended","revised","escalated"].map((t: any) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))}
            rows={3} placeholder="Renewal terms, conditions, changes from original..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
        </div>

        {/* Duration preview */}
        {form.start_date && form.end_date && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-700 font-medium">📅 Renewal Period</p>
            <p className="text-sm text-blue-900 mt-1">
              {fmtDate(form.start_date)} → {fmtDate(form.end_date)}
              {" "}
              ({Math.round((new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / 86400000)} days)
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 py-2.5 bg-[var(--color-bg)] text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {saving ? "Creating Renewal..." : "🔄 Create Contract Renewal"}
          </button>
          <button type="button" onClick={() => router.push(`/commercial/contracts/${id}`)}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
