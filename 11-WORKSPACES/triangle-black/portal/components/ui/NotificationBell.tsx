"use client"; // @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Bell, X, AlertCircle, AlertTriangle, Info } from "lucide-react";

const PRIORITY_ICONS: Record<string, any> = {
  critical: AlertCircle,
  high:     AlertTriangle,
  medium:   Info,
  low:      Info,
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "text-red-600 bg-red-50 border-red-200",
  high:     "text-amber-600 bg-amber-50 border-amber-200",
  medium:   "text-blue-600 bg-blue-50 border-blue-200",
  low:      "text-secondary bg-base-alt border-border",
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: count = {} } = useQuery({
    queryKey: ["notif-count"],
    queryFn: () => authFetch("/api/v1/notifications-portal?limit=1").then(r => r.json()),
    refetchInterval: 30000,
  });

  const { data: notifs = {}, refetch } = useQuery({
    queryKey: ["notif-list"],
    queryFn: () => authFetch("/api/v1/notifications-portal").then(r => r.json()),
    enabled: isOpen,
    refetchInterval: isOpen ? 30000 : false,
  });

  const badge   = count?.badge ?? 0;
  const critical = count?.critical ?? 0;
  const list     = notifs?.notifications ?? [];

  return (
    <div className="relative">
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) refetch(); }}
        className="relative p-2 rounded-lg hover:bg-surface-alt text-secondary hover:text-primary"
      >
        <Bell className="w-5 h-5" />
        {badge > 0 && (
          <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full
            w-5 h-5 flex items-center justify-center font-bold
            ${critical > 0 ? "bg-red-500" : "bg-amber-500"}`}>
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-96 bg-white border border-border
                        rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="font-medium text-sm text-primary">
              Notifications {badge > 0 && <span className="text-red-600">({badge})</span>}
            </div>
            <button onClick={() => setIsOpen(false)} className="text-tertiary hover:text-secondary">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {list.length === 0 ? (
              <div className="p-6 text-center text-sm text-tertiary">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                All clear — no active alerts
              </div>
            ) : list.map((n: any) => {
              const Icon = PRIORITY_ICONS[n.priority] ?? Info;
              const colorClass = PRIORITY_COLORS[n.priority] ?? PRIORITY_COLORS.low;
              return (
                <div key={n.id}
                     className={`flex gap-3 px-4 py-3 border-b border-slate-50 ${colorClass} border-l-4 border-l-current`}>
                  <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold">{n.title}</div>
                    <div className="text-xs opacity-80 mt-0.5 line-clamp-2">{n.message}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2 bg-base-alt border-t border-border text-xs text-tertiary text-center">
            Refreshes every 30s · {list.length} active alerts
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
