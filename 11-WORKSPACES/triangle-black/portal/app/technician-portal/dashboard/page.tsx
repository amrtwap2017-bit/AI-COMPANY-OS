"use client";
// @ts-nocheck
// Triangle Black — Technician Dashboard (Mobile)
// Sprint-018: Mobile Technician Portal
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const STATUS_COLOR: Record<string, string> = {
  open:        "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed:   "bg-green-100 text-green-800",
  pending:     "bg-gray-100 text-gray-700",
};
const PRIORITY_COLOR: Record<string, string> = {
  critical: "text-red-600",
  high:     "text-orange-500",
  medium:   "text-yellow-500",
  low:      "text-green-500",
};

export default function TechnicianDashboard() {
  const router = useRouter();
  const [mounted, setMounted]     = useState(false);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [stats, setStats]         = useState({ open: 0, in_progress: 0, completed: 0, total: 0 });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/work-orders/?limit=50")
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data?.results || data?.items || [];
        setWorkOrders(list);
        setStats({
          open:        list.filter((w: any) => w.status === "open").length,
          in_progress: list.filter((w: any) => w.status === "in_progress").length,
          completed:   list.filter((w: any) => w.status === "completed").length,
          total:       list.length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted]);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const todayWOs = workOrders.filter((w: any) =>
    w.status !== "completed" && w.status !== "cancelled"
  ).slice(0, 5);

  if (!mounted || loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-5">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{today}</p>
        <h1 className="text-xl font-bold text-white mt-1">My Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Triangle Black — Field Technician</p>
      </div>

      <div className="px-4 py-5 space-y-6 max-w-sm mx-auto">

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Open",        value: stats.open,        color: "text-blue-400" },
            { label: "In Progress", value: stats.in_progress, color: "text-yellow-400" },
            { label: "Completed",   value: stats.completed,   color: "text-green-400" },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Active Work Orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Active Work Orders</h2>
            <button
              onClick={() => router.push("/technician-portal/work-orders")}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              View all →
            </button>
          </div>

          {todayWOs.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-gray-400 text-sm">No active work orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayWOs.map((wo: any) => (
                <button
                  key={wo.id}
                  onClick={() => router.push(`/technician-portal/work-orders/${wo.id}`)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-left hover:border-gray-600 transition-colors active:bg-gray-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {wo.title || wo.description || `WO-${wo.id?.slice(0,8)}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {wo.location || wo.asset_name || "No location"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[wo.status] || "bg-gray-700 text-gray-300"}`}>
                        {wo.status?.replace("_", " ")}
                      </span>
                      <span className={`text-xs font-medium ${PRIORITY_COLOR[wo.priority] || "text-gray-400"}`}>
                        {wo.priority || "normal"}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex">
        {[
          { label: "Dashboard", icon: "🏠", path: "/technician-portal/dashboard", active: true },
          { label: "Work Orders", icon: "🔧", path: "/technician-portal/work-orders", active: false },
          { label: "Profile", icon: "👤", path: "/technician-portal/profile", active: false },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-colors ${
              item.active ? "text-blue-400" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
