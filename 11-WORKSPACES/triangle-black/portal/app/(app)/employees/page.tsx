"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const DEPT_COLORS: Record<string, string> = {
  Engineering: "bg-blue-100 text-blue-700",
  Maintenance: "bg-yellow-100 text-yellow-700",
  Housekeeping: "bg-green-100 text-green-700",
  Management: "bg-purple-100 text-purple-700",
};

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/employees/?limit=100").then((r) => {
      if (r.error) setError(r.error);
      else setEmployees(Array.isArray(r.data) ? r.data : []);
      setLoading(false);
    });
  }, [mounted]);

  const filtered = employees.filter((e: any) =>
    !search ||
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase()) ||
    e.position?.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  if (error) return (
    <div className="p-8"><div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-700">{error}</p>
    </div></div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">{employees.length} total</p>
        </div>
        <button onClick={() => router.push("/employees/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + New Employee
        </button>
      </div>

      <input type="text" placeholder="Search name, department, position..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No employees found</p>
          <button onClick={() => router.push("/employees/new")}
            className="mt-3 text-sm text-blue-600 underline">Add first employee</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((emp) => (
            <div key={emp.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {emp.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text-1)]">{emp.name}</p>
                  <p className="text-sm text-gray-500">{emp.position || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {emp.department && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(DEPT_COLORS as Record<string, any>)[emp.department] || "bg-gray-100 text-gray-700"}`}>
                    {emp.department}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                  {emp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
