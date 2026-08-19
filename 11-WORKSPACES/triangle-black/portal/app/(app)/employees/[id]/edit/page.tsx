"use client";
// @ts-nocheck
// Triangle Black — Employee Edit
// Sprint-014: Employee Detail/Edit Portal
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { toast } from "sonner";

const DEPARTMENTS = ["Engineering","Maintenance","Procurement","Finance","HR","Operations","Management","IT"];
const POSITIONS   = ["Engineer","Technician","Manager","Supervisor","Coordinator","Specialist","Director","Assistant"];
const STATUSES    = ["active","inactive","on_leave","terminated"];

export default function EmployeeEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mounted, setMounted]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    department: "", position: "",
    employee_id: "", status: "active",
    hire_date: "", notes: "",
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    tbFetch(`/api/v1/employees/${id}`)
      .then(r => r.data ?? r)
      .then(emp => {
        setForm({
          name:        emp.name        || "",
          email:       emp.email       || "",
          phone:       emp.phone       || "",
          department:  emp.department  || "",
          position:    emp.position    || "",
          employee_id: emp.employee_id || "",
          status:      emp.status      || "active",
          hire_date:   emp.hire_date ? emp.hire_date.split("T")[0] : "",
          notes:       emp.notes       || "",
        });
      })
      .catch(() => toast.error("Failed to load employee"))
      .finally(() => setLoading(false));
  }, [mounted, id]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res  = await tbFetch(`/api/v1/employees/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = res.data ?? res;
      if (data.id || data.name) {
        toast.success("Employee updated successfully");
        router.push(`/employees/${id}`);
      } else {
        toast.error(data.detail || "Update failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push(`/employees/${id}`)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          ← Back to Employee
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Edit Employee</h1>
        <p className="text-gray-500 text-sm mt-1">Update employee information</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

        {/* Name + Employee ID */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              name="name" required value={form.name} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Ahmed Hassan"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Employee ID</label>
            <input
              name="employee_id" value={form.employee_id} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="EMP-001"
            />
          </div>
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="ahmed@hotel.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
            <input
              name="phone" value={form.phone} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="+20 100 000 0000"
            />
          </div>
        </div>

        {/* Department + Position */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
            <select
              name="department" value={form.department} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((d: any) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
            <select
              name="position" value={form.position} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Select position</option>
              {POSITIONS.map((p: any) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Status + Hire Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status" value={form.status} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {STATUSES.map((s: any) => (
                <option key={s} value={s}>{s.replace("_"," ").replace(/\b\w/g,l=>l.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Hire Date</label>
            <input
              name="hire_date" type="date" value={form.hire_date} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes" value={form.notes} onChange={handleChange} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Additional notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit" disabled={saving}
            className="px-6 py-2 bg-[var(--color-bg)] text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/employees/${id}`)}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
