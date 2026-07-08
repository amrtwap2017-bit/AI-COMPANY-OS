"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { notificationsApi } from "@/lib/api";
import { formatRelative } from "@/lib/utils";
import {
  Bell, BellOff, Check, CheckCheck, Trash2,
  UserCheck, FileText, Award, XCircle, Users,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  entity_id?: string;
  entity_type?: string;
  recipient_role: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationList {
  notifications: Notification[];
  unread_count: number;
}

const TYPE_CONFIG: Record<string, {
  icon: React.ReactNode;
  color: string;
  bg: string;
  href?: (entity_id: string, entity_type: string) => string;
}> = {
  lead_qualified: {
    icon: <Users className="w-4 h-4" />,
    color: "text-purple-600",
    bg: "bg-purple-100",
    href: (id) => `/leads/${id}`,
  },
  lead_assigned: {
    icon: <UserCheck className="w-4 h-4" />,
    color: "text-blue-600",
    bg: "bg-blue-100",
    href: (id) => `/leads/${id}`,
  },
  quote_sent: {
    icon: <FileText className="w-4 h-4" />,
    color: "text-amber-600",
    bg: "bg-amber-100",
    href: (id) => `/quotes/${id}`,
  },
  quote_approved: {
    icon: <Award className="w-4 h-4" />,
    color: "text-green-600",
    bg: "bg-green-100",
    href: (id) => `/quotes/${id}`,
  },
  quote_rejected: {
    icon: <XCircle className="w-4 h-4" />,
    color: "text-red-600",
    bg: "bg-red-100",
    href: (id) => `/quotes/${id}`,
  },
};

const DEFAULT_TYPE = {
  icon: <Bell className="w-4 h-4" />,
  color: "text-gray-600",
  bg: "bg-gray-100",
};

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const qc = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", unreadOnly],
    queryFn: () =>
      notificationsApi.list(unreadOnly).then((r) => r.data as NotificationList),
    refetchInterval: 15_000,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount   = data?.unread_count ?? 0;

  async function markRead(id: string) {
    await notificationsApi.markRead(id);
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["notifications-unread"] });
  }

  async function markAllRead() {
    await notificationsApi.markAllRead();
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["notifications-unread"] });
  }

  async function deleteOne(id: string) {
    setDeleting(id);
    try {
      await notificationsApi.delete(id);
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    } finally {
      setDeleting(null);
    }
  }

  function handleClick(n: Notification) {
    if (!n.is_read) markRead(n.id);
    const cfg = TYPE_CONFIG[n.type];
    if (cfg?.href && n.entity_id && n.entity_type) {
      router.push(cfg.href(n.entity_id, n.entity_type));
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#1B2B4B]" aria-hidden="true" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-[#F59E0B] text-[#1B2B4B] text-sm font-bold
                               px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Business events and alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded border-gray-300 text-[#1B2B4B] focus:ring-[#1B2B4B]"
            />
            Unread only
          </label>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1B2B4B]
                         border border-[#1B2B4B] rounded-lg hover:bg-[#1B2B4B] hover:text-white
                         transition-colors focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-[#1B2B4B]"
            >
              <CheckCheck className="w-4 h-4" aria-hidden="true" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16" role="status">
          <div className="w-8 h-8 border-4 border-[#1B2B4B] border-t-transparent rounded-full animate-spin" />
          <span className="sr-only">Loading notifications...</span>
        </div>
      )}

      {/* Empty */}
      {!isLoading && notifications.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {unreadOnly ? "No unread notifications" : "No notifications yet"}
          </h3>
          <p className="text-gray-500 text-sm">
            Notifications appear here when leads are qualified, assigned, or
            quotes are actioned.
          </p>
        </div>
      )}

      {/* List */}
      {!isLoading && notifications.length > 0 && (
        <div className="space-y-2" role="list" aria-label="Notifications">
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_TYPE;
            return (
              <div
                key={n.id}
                role="listitem"
                className={`group bg-white rounded-xl border transition-all
                  ${n.is_read
                    ? "border-gray-200 opacity-75"
                    : "border-[#1B2B4B]/20 shadow-sm"
                  }`}
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center
                                flex-shrink-0 mt-0.5 ${cfg.bg} ${cfg.color}`}
                    aria-hidden="true"
                  >
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <button
                    onClick={() => handleClick(n)}
                    className="flex-1 text-left min-w-0 focus-visible:outline-none
                               focus-visible:ring-2 focus-visible:ring-[#1B2B4B] rounded"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-tight
                        ${n.is_read ? "text-gray-600" : "text-gray-900"}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span
                          className="w-2 h-2 bg-[#F59E0B] rounded-full flex-shrink-0 mt-1.5"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {formatRelative(n.created_at)}
                      {" · "}
                      <span className="capitalize">{n.recipient_role}</span>
                    </p>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100
                                  transition-opacity flex-shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={() => markRead(n.id)}
                        title="Mark as read"
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50
                                   rounded-lg transition-colors focus-visible:outline-none
                                   focus-visible:ring-2 focus-visible:ring-green-500"
                      >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteOne(n.id)}
                      disabled={deleting === n.id}
                      title="Delete notification"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50
                                 rounded-lg transition-colors disabled:opacity-50
                                 focus-visible:outline-none focus-visible:ring-2
                                 focus-visible:ring-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
