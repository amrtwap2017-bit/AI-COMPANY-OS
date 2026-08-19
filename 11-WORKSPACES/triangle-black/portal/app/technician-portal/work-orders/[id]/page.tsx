"use client";
// @ts-nocheck
// Triangle Black — Technician Work Order Detail (Mobile)
// Sprint-018
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { toast } from "sonner";

const STATUS_OPTIONS = ["open","in_progress","on_hold","completed"];
const STATUS_COLOR: Record<string,string> = {
  open:"bg-blue-900 text-blue-300", in_progress:"bg-yellow-900 text-yellow-300",
  completed:"bg-green-900 text-green-300", on_hold:"bg-gray-800 text-gray-400",
};

export default function TechnicianWODetail() {
  const { id } = useParams();
  const router  = useRouter();
  const [mounted, setMounted] = useState(false);
  const [wo, setWo]           = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    tbFetch(`/api/v1/work-orders/${id}`)
      .then(r => r.json())
      .then(data => { setWo(data); setNewStatus(data.status || "open"); })
      .catch(() => toast.error("Failed to load work order"))
      .finally(() => setLoading(false));
  }, [mounted, id]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await tbFetch(`/api/v1/work-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      const data = await res.json();
      if (data.id || data.status) {
        toast.success("Work order updated");
        setWo(data);
      } else {
        toast.error(data.detail || "Update failed");
      }
    } catch { toast.error("Network error"); }
    finally { setUpdating(false); }
  };

  if (!mounted || loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!wo || wo.detail === "Not Found") return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
      Work order not found
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-8">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-xl">←</button>
        <div>
          <h1 className="text-base font-bold leading-tight">
            {wo.title || wo.description || `WO-${wo.id?.slice(0,8)}`}
          </h1>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(STATUS_COLOR as Record<string, any>)[wo.status] || "bg-gray-800 text-gray-400"}`}>
            {wo.status?.replace("_"," ")}
          </span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-sm mx-auto">

        {/* Details */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {[
            ["Priority",    wo.priority || "—"],
            ["Location",    wo.location || wo.asset_name || "—"],
            ["Assigned to", wo.assigned_to || "—"],
            ["Due date",    wo.due_date ? new Date(wo.due_date).toLocaleDateString("en-GB") : "—"],
            ["Created",     wo.created_at ? new Date(wo.created_at).toLocaleDateString("en-GB") : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between px-4 py-3">
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-xs text-white font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        {wo.description && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-2">Description</p>
            <p className="text-sm text-gray-300">{wo.description}</p>
          </div>
        )}

        {/* Update Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Update Status</p>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((s: any) => (
              <button key={s} onClick={() => setNewStatus(s)}
                className={`py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  newStatus === s ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}>
                {s.replace("_"," ").replace(/\b\w/g,l=>l.toUpperCase())}
              </button>
            ))}
          </div>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Add notes about the work done..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
          <button
            onClick={handleUpdate} disabled={updating}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors"
          >
            {updating ? "Updating..." : "Update Work Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
