"use client";
// @ts-nocheck
// Triangle Black — Work Order Technician Assignment
// Sprint-024: WO Assignment Portal Page
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { toast } from "sonner";

export default function WorkOrderAssignPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mounted, setMounted]         = useState(false);
  const [wo, setWo]                   = useState<any>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState("");
  const [loading, setLoading]         = useState(true);
  const [assigning, setAssigning]     = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    Promise.all([
      tbFetch(`/api/v1/work-orders/${id}`).then(r => r.json()),
      tbFetch("/api/v1/technicians/?limit=100").then(r => r.json()),
    ]).then(([woData, techData]) => {
      setWo(woData);
      const techs = Array.isArray(techData) ? techData : techData?.results || techData?.items || [];
      setTechnicians(techs);
      if (woData?.technician_id) setSelectedTech(woData.technician_id);
    }).catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, [mounted, id]);

  const handleAssign = async () => {
    if (!selectedTech) { toast.error("Please select a technician"); return; }
    setAssigning(true);
    try {
      const res = await tbFetch(`/api/v1/work-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technician_id: selectedTech }),
      });
      const data = await res.json();
      if (res.ok || data.id || data.technician_id) {
        const tech = technicians.find(t => t.id === selectedTech);
        toast.success(`Assigned to ${tech?.name || selectedTech}`);
        router.push(`/operations/work-orders/${id}`);
      } else {
        toast.error(data.detail || "Assignment failed");
      }
    } catch { toast.error("Network error"); }
    finally { setAssigning(false); }
  };

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  const currentTech = technicians.find(t => t.id === wo?.technician_id);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push(`/operations/work-orders/${id}`)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          ← Back to Work Order
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Assign Technician</h1>
        <p className="text-gray-500 text-sm mt-1">
          {wo?.title || `Work Order ${id?.slice(0,8)}`}
        </p>
      </div>

      {/* Current Assignment */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Current Assignment</p>
        {currentTech ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
              {currentTech.name?.[0] || "T"}
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-1)]">{currentTech.name}</p>
              <p className="text-xs text-gray-500">{currentTech.email || currentTech.phone || "—"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No technician assigned yet</p>
        )}
      </div>

      {/* WO Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Work Order Details</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ["Status",   wo?.status],
            ["Priority", wo?.priority],
            ["Type",     wo?.type],
            ["Due Date", wo?.due_date ? new Date(wo.due_date).toLocaleDateString("en-GB") : "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-gray-500 text-xs">{label}</span>
              <p className="font-medium text-[var(--color-text-1)] capitalize">{value || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technician Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <p className="text-sm font-semibold text-[var(--color-text-1)]">Select Technician</p>

        {technicians.length === 0 ? (
          <p className="text-gray-400 text-sm">No technicians available</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {technicians.map(tech => (
              <button
                key={tech.id}
                onClick={() => setSelectedTech(tech.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  selectedTech === tech.id
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${
                  selectedTech === tech.id ? "bg-[var(--color-bg)] text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {tech.name?.[0] || "T"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-1)] truncate">{tech.name}</p>
                  <p className="text-xs text-gray-500 truncate">{tech.email || tech.phone || tech.department || "—"}</p>
                </div>
                {selectedTech === tech.id && (
                  <span className="text-[var(--color-text-1)] text-lg shrink-0">✓</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={handleAssign}
            disabled={assigning || !selectedTech}
            className="flex-1 py-2.5 bg-[var(--color-bg)] text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {assigning ? "Assigning..." : "Confirm Assignment"}
          </button>
          <button
            onClick={() => router.push(`/operations/work-orders/${id}`)}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
