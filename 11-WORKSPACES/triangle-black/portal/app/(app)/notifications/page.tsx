"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, PageWrapper, LoadingState, EmptyState, StatusFilterTabs } from "@/components/ui";
import { safeApi } from "@/lib/safe-api";
import { toast } from "@/lib/toast";
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, RefreshCw, X } from "lucide-react";
import { fmtDate } from "@/lib/design-tokens";

const TYPE_ICONS: any = { success: CheckCircle2, warning: AlertTriangle, info: Info, error: XCircle };
const TYPE_COLORS: any = {
  success: "text-emerald-600 bg-emerald-50 border-emerald-200",
  warning: "text-amber-600 bg-amber-50 border-amber-200",
  info:    "text-blue-600 bg-blue-50 border-blue-200",
  error:   "text-red-600 bg-red-50 border-red-200",
};

const FILTER_TABS = [
  { value: "all",    label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read",   label: "Read" },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const qc = useQueryClient();

  const { data: rawNotifs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["notifications-page"],
    queryFn: async () => {
      const r = await safeApi.notifications(50);
      return Array.isArray(r.data) ? r.data : r.data?.items || [];
    },
    staleTime: 30_000,
  });

  const notifs = rawNotifs.filter((n:any) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read")   return  n.is_read;
    return true;
  });

  const unreadCount = rawNotifs.filter((n:any) => !n.is_read).length;

  const tabs = FILTER_TABS.map(t => ({
    ...t,
    count: t.value === "all" ? rawNotifs.length :
           t.value === "unread" ? unreadCount :
           rawNotifs.length - unreadCount,
  }));

  async function markAllRead() {
    await safeApi.markAllRead();
    qc.invalidateQueries({ queryKey: ["notifications-page"] });
    toast.success("All notifications marked as read");
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount + " unread"}
        badge="NOTIF"
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="text-xs text-amber-600 font-semibold hover:underline">
                Mark all read
              </button>
            )}
            <button onClick={() => { refetch(); toast.success("Refreshed"); }}
              disabled={isFetching}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
              <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
            </button>
          </div>
        } />

      <StatusFilterTabs tabs={tabs} active={filter} onChange={setFilter} />

      {isLoading ? <LoadingState type="list" rows={5} /> :
       notifs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No notifications</p>
          <p className="text-xs text-slate-400 mt-1">You're all caught up</p>
        </div>
       ) : (
        <div className="space-y-2">
          {notifs.map((note:any) => {
            const Icon = TYPE_ICONS[note.type] || Info;
            const color = TYPE_COLORS[note.type] || TYPE_COLORS.info;
            return (
              <div key={note.id}
                className={"bg-white rounded-2xl border p-4 flex items-start gap-4 transition-all " +
                  (note.is_read ? "border-slate-100 opacity-70" : "border-slate-200 shadow-sm")}>
                <div className={"w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border " + color}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={"text-sm font-semibold " + (note.is_read ? "text-slate-500" : "text-slate-900")}>
                      {note.title}
                    </p>
                    {!note.is_read && <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{note.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{fmtDate(note.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
