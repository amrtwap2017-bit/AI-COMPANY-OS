"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchNotifications() {
  const r = await fetch(`${BACK}/api/v1/notifications`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? d.notifications ?? [];
}

async function fetchSignals() {
  const r = await fetch(`${BACK}/api/v1/ai/signals`, { credentials: "include" });
  if (!r.ok) return { signals: [], total: 0 };
  return r.json();
}

export default function InboxPage() {
  const { data: notifications = [], isLoading: notifLoading } = useQuery({
    queryKey: ["inbox-notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 60000,
  });
  const { data: signalsData = { signals: [], total: 0 }, isLoading: sigLoading } = useQuery({
    queryKey: ["inbox-signals"],
    queryFn: fetchSignals,
    refetchInterval: 60000,
  });

  const isLoading = notifLoading || sigLoading;
  const signals = signalsData.signals || [];
  const unread = notifications.filter((n) => !n.read_at && !n.is_read).length;
  const critical = signals.filter((s) => s.priority === "critical").length;

  if (isLoading) return <LoadingState message="Loading inbox..." />;

  return (
    <PageWrapper>
      <PageHeader
        title="Operations Inbox"
        subtitle="Notifications and AI operational alerts"
        badge={unread + critical > 0 ? `${unread + critical} Unread` : undefined}
      />
      <MetricStrip metrics={[
        { label: "Notifications", value: notifications.length },
        { label: "Unread",        value: unread,   color: "amber" as const },
        { label: "AI Signals",    value: signals.length },
        { label: "Critical",      value: critical, color: critical > 0 ? "red" as const : "slate" as const },
      ]} />

      <SectionCard title="AI Operational Signals">
        {signals.length === 0 ? (
          <EmptyState title="All clear" description="No active signals at this time" />
        ) : (
          <div className="space-y-2">
            {signals.map((sig) => (
              <div
                key={sig.signal_id}
                className={`px-4 py-3 rounded-lg border-l-4 ${
                  sig.priority === "critical" ? "border-red-500 bg-red-50" :
                  sig.priority === "high"     ? "border-amber-400 bg-amber-50" :
                  "border-blue-400 bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{sig.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{sig.message}</p>
                    <p className="text-xs italic text-slate-400 mt-1">{sig.recommended_action}</p>
                  </div>
                  <StatusBadge status={sig.priority} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="System Notifications">
        {notifications.length === 0 ? (
          <EmptyState title="No notifications" description="Your inbox is empty" />
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 10).map((n, i) => (
              <div key={n.id || i} className="flex items-start gap-3 px-4 py-3 bg-slate-50 rounded-lg">
                <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                  n.read_at || n.is_read ? "bg-slate-300" : "bg-blue-500"
                }`} />
                <div>
                  <p className="text-sm font-medium text-slate-800">{n.title || n.message || "Notification"}</p>
                  {n.body && <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>}
                  {n.created_at && (
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}
