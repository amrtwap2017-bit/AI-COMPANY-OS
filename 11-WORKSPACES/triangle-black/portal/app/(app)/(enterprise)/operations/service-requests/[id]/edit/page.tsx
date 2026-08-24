"use client";
// Triangle Black — Service Request Update
// Sprint-033: SR Status Management
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { toast } from "sonner";

const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUS_OPTIONS = ["open","pending","in_progress","resolved","closed","cancelled"];
const URGENCY_OPTIONS = ["low","medium","high","critical"];

const STATUS_COLOR: Record<string,string> = {
  open:        "bg-blue-100 text-blue-800",
  pending:     "bg-yellow-100 text-yellow-800",
  in_progress: "bg-orange-100 text-orange-800",
  resolved:    "bg-green-100 text-green-800",
  closed:      "bg-gray-100 text-gray-600",
  cancelled:   "bg-red-100 text-red-800",
};
const URGENCY_COLOR: Record<string,string> = {
  critical: "text-red-600", high: "text-orange-500",
  medium:   "text-yellow-500", low: "text-green-600",
};

export default function ServiceRequestEditPage() {
  const { id }  = useParams();
  const router  = useRouter();
  const [mounted, setMounted]   = useState(false);
  const [sr, setSr]             = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [form, setForm] = useState({
    status: "", urgency: "", resolution_notes: "", contact_phone: "",
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    tbFetch(`/api/v1/service-requests/${id}`)
      .then(r => r.data ?? r)
      .then((d: any) => {
        setSr(d);
        setForm({
          status:           d.status || "open",
          urgency:          d.urgency || "medium",
          resolution_notes: d.resolution_notes || "",
          contact_phone:    d.contact_phone || "",
        });
      })
      .catch(() => toast.error("Failed to load service request"))
      .finally(() => setLoading(false));
  }, [mounted, id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await tbFetch(`/api/v1/service-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = res.data ?? res;
      if (data.id || data.status || res.ok) {
        toast.success("Service request updated");
        router.push(`/operations/service-requests/${id}`);
      } else {
        toast.error(data.detail || "Update failed");
      }
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  if (!sr || sr.detail) return (
    <div className="p-8 text-center text-gray-500">
      <p className="text-2xl mb-2">🎫</p>
      <p>Service request not found</p>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <button onClick={() => router.push(`/operations/service-requests/${id}`)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← Back to Request
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Update Service Request</h1>
        <p className="text-gray-500 text-sm mt-1">{sr.title || sr.category || `SR-${id?.slice(0,8)}`}</p>
      </div>

      {/* Current Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Current Status</p>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${(STATUS_COLOR as Record<string, any>)[sr.status] || "bg-gray-100 text-gray-600"}`}>
            {sr.status}
          </span>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Urgency</p>
          <span className={`text-sm font-semibold ${(URGENCY_COLOR as Record<string, any>)[sr.urgency] || "text-gray-600"}`}>
            {sr.urgency}
          </span>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-500">Submitted</p>
          <p className="text-sm text-gray-700">{fmtDate(sr.created_at)}</p>
        </div>
      </div>

      {/* SR Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Request Details</p>
        {[
          ["Category",    sr.category],
          ["Description", sr.description],
          ["Submitted by",sr.submitted_by || "—"],
          ["Site",        sr.site_id || "—"],
        ].filter(([,v])=>v).map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm py-1 border-b border-gray-50">
            <span className="text-gray-400">{label}</span>
            <span className="text-[var(--color-text-1)] font-medium text-right max-w-64 truncate">{value}</span>
          </div>
        ))}
      </div>

      {/* Update Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="font-semibold text-[var(--color-text-1)]">Update Request</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status *</label>
            <select value={form.status} onChange={(e: any) => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
              {STATUS_OPTIONS.map((s: any) => (
                <option key={s} value={s}>{s.replace("_"," ").replace(/\b\w/g,l=>l.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Urgency</label>
            <select value={form.urgency} onChange={(e: any) => setForm(f => ({ ...f, urgency: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
              {URGENCY_OPTIONS.map((u: any) => (
                <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone</label>
          <input value={form.contact_phone} onChange={(e: any) => setForm(f => ({...f, contact_phone: e.target.value}))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="+20 100 000 0000" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Resolution Notes {form.status === "resolved" && <span className="text-red-500">*</span>}
          </label>
          <textarea value={form.resolution_notes}
            onChange={(e: any) => setForm(f => ({...f, resolution_notes: e.target.value}))}
            rows={4} placeholder="Describe the resolution or action taken..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 py-2.5 bg-[var(--color-bg)] text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : "Update Request"}
          </button>
          <button type="button" onClick={() => router.push(`/operations/service-requests/${id}`)}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
