"use client";
// @ts-nocheck
// Triangle Black — Employee Detail + Timesheets
// Sprint-013: Employee Timesheets
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { toast } from "sonner";

const fmtDate = (d: any) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; }
};
const STATUS_COLOR: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState("info");
  const [employee, setEmployee] = useState<any>(null);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    work_date: new Date().toISOString().split("T")[0],
    work_type: "regular",
    hours_worked: "8",
    overtime_hours: "0",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    Promise.all([
      tbFetch(`/api/v1/employees/${id}`).then(r => r.data ?? r),
      tbFetch(`/api/v1/timesheets/?employee_id=${id}&limit=100`).then(r => r.data ?? r),
      tbFetch(`/api/v1/timesheets/employee/${id}/summary`).then(r => r.data ?? r),
    ]).then(([emp, ts, sum]: any[]) => {
      setEmployee(emp);
      setTimesheets(Array.isArray(ts.results) ? ts.results : []);
      setSummary(sum);
    }).catch(() => toast.error("Failed to load employee data"))
      .finally(() => setLoading(false));
  }, [mounted, id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await tbFetch("/api/v1/timesheets/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, employee_id: id }),
      });
      const data = await res.json();
      if (data.id) {
        toast.success("Timesheet entry added");
        setTimesheets(prev => [data, ...prev]);
        setSummary((s: any) => s ? { ...s, total_entries: s.total_entries + 1, pending_count: s.pending_count + 1, total_hours: s.total_hours + parseFloat(form.hours_worked) } : s);
        setShowForm(false);
        setForm({ work_date: new Date().toISOString().split("T")[0], work_type: "regular", hours_worked: "8", overtime_hours: "0", notes: "" });
      } else {
        toast.error(data.detail || "Failed to create entry");
      }
    } catch { toast.error("Network error"); }
    finally { setSubmitting(false); }
  };

  const handleApprove = async (tsId: string) => {
    const res = await tbFetch(`/api/v1/timesheets/${tsId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved_by: "manager" }),
    });
    const data = await res.json();
    if (data.id) {
      toast.success("Approved");
      setTimesheets(prev => prev.map((t: any) => t.id === tsId ? data : t));
    }
  };

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  if (!employee) return (
    <div className="p-8 text-center text-gray-500">Employee not found</div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">{employee.full_name || employee.name || "Employee"}</h1>
          <p className="text-gray-500">{employee.position || employee.job_title} · {employee.department}</p>
        </div>
        <button
          onClick={() => router.push(`/employees/${id}/edit`)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
        >
          Edit Employee
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {["info", "timesheets"].map((t: any) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-2 px-1 border-b-2 text-sm font-medium capitalize transition-colors ${
                tab === t ? "border-gray-900 text-[var(--color-text-1)]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "timesheets" ? `Timesheets (${timesheets.length})` : t}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Info */}
      {tab === "info" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-[var(--color-text-1)]">Personal Information</h2>
            {[
              ["Email",      employee.email],
              ["Phone",      employee.phone],
              ["Department", employee.department],
              ["Position",   employee.position || employee.job_title],
              ["Status",     employee.status],
              ["Hire Date",  fmtDate(employee.hire_date || employee.created_at)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-[var(--color-text-1)]">{value || "—"}</span>
              </div>
            ))}
          </div>
          {summary && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-[var(--color-text-1)]">Timesheet Summary</h2>
              {[
                ["Total Entries",   summary.total_entries],
                ["Total Hours",     `${summary.total_hours}h`],
                ["Overtime Hours",  `${summary.total_overtime}h`],
                ["Pending",         summary.pending_count],
                ["Approved",        summary.approved_count],
                ["Rejected",        summary.rejected_count],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-[var(--color-text-1)]">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Timesheets */}
      {tab === "timesheets" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-[var(--color-text-1)]">Timesheet Entries</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-[var(--color-bg)] text-white rounded-lg text-sm font-medium hover:bg-gray-700"
            >
              + Add Entry
            </button>
          </div>

          {/* Add Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-5 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                <input type="date" required value={form.work_date}
                  onChange={(e: any) => setForm(f => ({ ...f, work_date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Work Type</label>
                <select value={form.work_type} onChange={(e: any) => setForm(f => ({ ...f, work_type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {["regular","overtime","sick","vacation","public_holiday","training"].map((t: any) => (
                    <option key={t} value={t}>{t.replace("_"," ").replace(/\b\w/g,l=>l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hours Worked</label>
                <input type="number" min="0" max="24" step="0.5" required value={form.hours_worked}
                  onChange={(e: any) => setForm(f => ({ ...f, hours_worked: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Overtime Hours</label>
                <input type="number" min="0" max="24" step="0.5" value={form.overtime_hours}
                  onChange={(e: any) => setForm(f => ({ ...f, overtime_hours: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e: any) => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2 flex gap-3">
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 bg-[var(--color-bg)] text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {submitting ? "Saving..." : "Save Entry"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Timesheets Table */}
          {timesheets.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
              No timesheet entries yet. Click "+ Add Entry" to start tracking.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Date","Type","Hours","Overtime","Status","Notes","Actions"].map((h: any) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {timesheets.map(ts => (
                    <tr key={ts.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{fmtDate(ts.work_date)}</td>
                      <td className="px-4 py-3 capitalize">{ts.work_type?.replace("_"," ")}</td>
                      <td className="px-4 py-3">{ts.hours_worked}h</td>
                      <td className="px-4 py-3">{ts.overtime_hours || 0}h</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(STATUS_COLOR as Record<string, any>)[ts.status] || ""}`}>
                          {ts.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-32 truncate">{ts.notes || "—"}</td>
                      <td className="px-4 py-3">
                        {ts.status === "pending" && (
                          <button onClick={() => handleApprove(ts.id)}
                            className="text-xs text-green-600 hover:text-green-800 font-medium">
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
