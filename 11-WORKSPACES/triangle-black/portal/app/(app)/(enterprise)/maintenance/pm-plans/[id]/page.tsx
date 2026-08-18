"use client";
// @ts-nocheck
// Triangle Black — PM Plan Detail + Complete Workflow
// Sprint-030: PM Completion

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { toast } from "sonner";

const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtDateTime = (d: any) => { try { return new Date(d).toLocaleString("en-GB", { dateStyle:"short", timeStyle:"short" }); } catch { return "—"; } };

const FREQ_LABEL: Record<string, string> = {
  daily:"Daily", weekly:"Weekly", monthly:"Monthly",
  quarterly:"Quarterly (90d)", biannual:"Bi-Annual (180d)", yearly:"Annual",
};
const STATUS_COLOR: Record<string, string> = {
  active:    "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  overdue:   "bg-red-100 text-red-800",
  inactive:  "bg-gray-100 text-gray-600",
};

export default function PMPlanDetailPage() {
  const { id }  = useParams();
  const router  = useRouter();
  const [mounted, setMounted]     = useState(false);
  const [plan, setPlan]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [result, setResult]       = useState<any>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    tbFetch(`/api/v1/maintenance/pm-plans/${id}`)
      .then(r => r.json())
      .then(d => { setPlan(d); if (d.status === "completed") setCompleted(true); })
      .catch(() => toast.error("Failed to load PM plan"))
      .finally(() => setLoading(false));
  }, [mounted, id]);

  const handleComplete = async () => {
    if (!confirm("Mark this PM plan as completed?")) return;
    setCompleting(true);
    try {
      const res = await tbFetch(`/api/v1/maintenance/pm-plans/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(`✅ Completed! Next due: ${fmtDate(data.next_due)}`);
        setCompleted(true);
        setResult(data);
        setPlan((p: any) => ({ ...p, status: "completed", next_due_ts: data.next_due }));
      } else {
        toast.error(data.detail || "Completion failed");
      }
    } catch { toast.error("Network error"); }
    finally { setCompleting(false); }
  };

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  if (!plan || plan.detail) return (
    <div className="p-8 text-center text-gray-500">
      <p className="text-2xl mb-2">📋</p>
      <p>PM Plan not found</p>
      <button onClick={() => router.push("/maintenance/pm-plans")}
        className="mt-4 text-sm text-gray-400 hover:text-gray-600">← Back to PM Plans</button>
    </div>
  );

  const isOverdue = plan.next_due_ts && new Date(plan.next_due_ts) < new Date() && plan.status !== "completed";

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.push("/maintenance/pm-plans")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
            ← PM Plans
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">{plan.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[plan.status] || "bg-gray-100 text-gray-600"}`}>
              {plan.status}
            </span>
            {isOverdue && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                ⚠️ OVERDUE
              </span>
            )}
            <span className="text-xs text-gray-500">{FREQ_LABEL[plan.frequency] || plan.frequency}</span>
          </div>
        </div>
        {!completed && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            {completing ? "Completing..." : "✅ Mark Complete"}
          </button>
        )}
      </div>

      {/* Completion Success Banner */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="font-semibold text-green-700">✅ PM Plan Completed</p>
          <p className="text-sm text-green-600 mt-1">
            Next scheduled maintenance: <strong>{fmtDate(result.next_due)}</strong>
            <span className="text-green-500 ml-2">({result.days_until_next} days from now)</span>
          </p>
        </div>
      )}

      {/* Plan Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-[var(--color-text-1)]">Plan Details</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            ["Plan Type",    plan.plan_type || "preventive"],
            ["Frequency",    FREQ_LABEL[plan.frequency] || plan.frequency],
            ["Status",       plan.status],
            ["Owner",        plan.owner || "—"],
            ["Asset Node",   plan.asset_node_id || "—"],
            ["Next Due",     fmtDate(plan.next_due_ts || plan.next_due_date)],
            ["Created",      fmtDate(plan.created_at)],
            ["Last Updated", fmtDate(plan.updated_at)],
          ].map(([label, value]) => (
            <div key={label} className="border-b border-gray-50 pb-2">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-medium text-[var(--color-text-1)] capitalize mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {plan.notes && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">📝 Instructions / Notes</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{plan.notes}</p>
        </div>
      )}

      {/* Due Date Visual */}
      <div className={`rounded-xl p-5 border ${isOverdue ? "bg-red-50 border-red-200" : completed ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {completed ? "Completed — Next Due" : isOverdue ? "OVERDUE Since" : "Next Maintenance Due"}
            </p>
            <p className={`text-2xl font-bold ${isOverdue ? "text-red-700" : "text-blue-700"}`}>
              {fmtDate(plan.next_due_ts || plan.next_due_date)}
            </p>
            <p className="text-xs text-gray-400 mt-1">{fmtDateTime(plan.next_due_ts || plan.next_due_date)}</p>
          </div>
          <span className="text-4xl">{isOverdue ? "🔴" : completed ? "✅" : "📅"}</span>
        </div>
      </div>
    </div>
  );
}
