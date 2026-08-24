"use client";
// Triangle Black — Technician Work Orders List (Mobile)
// Sprint-018
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const STATUS_COLOR: Record<string, string> = {
  open:        "bg-blue-900 text-blue-300",
  in_progress: "bg-yellow-900 text-yellow-300",
  completed:   "bg-green-900 text-green-300",
  pending:     "bg-gray-800 text-gray-400",
  cancelled:   "bg-red-900 text-red-300",
};
const PRIORITY_ICON: Record<string, string> = {
  critical: "🔴", high: "🟠", medium: "🟡", low: "🟢",
};

export default function TechnicianWorkOrdersPage() {
  const router  = useRouter();
  const [mounted, setMounted]     = useState(false);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/work-orders/?limit=100")
      .then(r => r.data ?? r)
      .then(data => {
        const list = Array.isArray(data) ? data : data?.results || data?.items || [];
        setWorkOrders(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted]);

  const filtered = workOrders.filter((wo: any) => {
    const matchFilter = filter === "all" || wo.status === filter;
    const matchSearch = !search || (wo.title || wo.description || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (!mounted || loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <h1 className="text-lg font-bold">Work Orders</h1>
        <p className="text-xs text-gray-500">{filtered.length} of {workOrders.length} shown</p>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-sm mx-auto">
        {/* Search */}
        <input
          type="search" placeholder="Search work orders..."
          value={search} onChange={(e: any) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", "open", "in_progress", "completed"].map((f: any) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"
              }`}
            >
              {f.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No work orders found</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((wo: any) => (
              <button
                key={wo.id}
                onClick={() => router.push(`/technician-portal/work-orders/${wo.id}`)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-left hover:border-gray-600 active:bg-gray-800 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{(PRIORITY_ICON as Record<string, any>)[wo.priority] || "⚪"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {wo.title || wo.description || `WO-${wo.id?.slice(0,8)}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {wo.location || wo.asset_name || "—"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(STATUS_COLOR as Record<string, any>)[wo.status] || "bg-gray-800 text-gray-400"}`}>
                        {wo.status?.replace("_", " ")}
                      </span>
                      {wo.due_date && (
                        <span className="text-xs text-gray-500">
                          Due: {new Date(wo.due_date).toLocaleDateString("en-GB")}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-600 text-lg">›</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex">
        {[
          { label: "Dashboard", icon: "🏠", path: "/technician-portal/dashboard", active: false },
          { label: "Work Orders", icon: "🔧", path: "/technician-portal/work-orders", active: true },
          { label: "Profile", icon: "👤", path: "/technician-portal/profile", active: false },
        ].map((item: any) => (
          <button key={item.label} onClick={() => router.push(item.path)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs ${item.active ? "text-blue-400" : "text-gray-500"}`}>
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
