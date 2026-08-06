"use client";
// @ts-nocheck
// Triangle Black — Notifications Center
// Sprint-052

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const fmtDT = (d: any) => { try { return new Date(d).toLocaleString("en-GB", { dateStyle:"short", timeStyle:"short" }); } catch { return "—"; } };

const TYPE_ICON: Record<string,string> = {
  work_order:"🔧", service_request:"🎫", invoice:"🧾", contract:"📋",
  maintenance:"⚙️", alert:"⚠️", system:"💻", approval:"✅", info:"ℹ️",
};
const PRIORITY_COLOR: Record<string,string> = {
  critical:"border-l-4 border-red-500 bg-red-50",
  high:    "border-l-4 border-orange-400 bg-orange-50",
  medium:  "border-l-4 border-yellow-400 bg-yellow-50",
  low:     "border-l-4 border-blue-400 bg-blue-50",
  info:    "border-l-4 border-gray-300 bg-white",
};

export default function NotificationsCenterPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [notifs, setNotifs]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [unread, setUnread]   = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/notifications/?limit=50")
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d) ? d : d?.notifications || d?.results || d?.items || [];
        setNotifs(items);
        setUnread(items.filter((n:any) => !n.read && !n.is_read).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted]);

  const filtered = notifs.filter(n =>
    filter === "all" ||
    (filter === "unread" && (!n.read && !n.is_read)) ||
    n.type === filter || n.priority === filter
  );

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">
            {notifs.length} total · {unread > 0 ? `${unread} unread` : "all read"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{unread}</span>
          )}
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="work_order">Work Orders</option>
            <option value="maintenance">Maintenance</option>
            <option value="alert">Alerts</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-xl">
          <p className="text-3xl mb-3">🔔</p>
          <p className="font-medium">No notifications</p>
          <p className="text-xs mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n: any, i: number) => {
            const isUnread = !n.read && !n.is_read;
            const priority = n.priority || n.urgency || "info";
            const type     = n.type || n.notification_type || "info";
            return (
              <div key={n.id || i}
                className={`rounded-xl p-4 transition-all ${PRIORITY_COLOR[priority] || "bg-white border border-gray-200"} ${isUnread ? "shadow-sm" : "opacity-80"}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5">{TYPE_ICON[type] || "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold text-gray-900 ${isUnread ? "" : "font-normal"}`}>
                        {n.title || n.message || n.content || "Notification"}
                      </p>
                      {isUnread && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                      )}
                      {priority !== "info" && priority !== "low" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-60 capitalize font-medium">
                          {priority}
                        </span>
                      )}
                    </div>
                    {n.body && <p className="text-xs text-gray-600 mt-1">{n.body}</p>}
                    {(n.entity_type || n.reference) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {n.entity_type && <span className="capitalize">{n.entity_type.replace("_"," ")} · </span>}
                        {n.reference}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{fmtDT(n.created_at || n.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
