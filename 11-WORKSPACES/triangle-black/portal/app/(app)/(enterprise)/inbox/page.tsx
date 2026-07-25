// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchNotifications() {
  try {  
    const r = await authFetch(`/api/v1/notifications`, { credentials: "include" });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? d.notifications ?? [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

async function fetchSignals() {
  try {  
    const r = await fetch(`${BACK}/api/v1/ai/signals`, { credentials: "include" });
    if (!r.ok) return { signals: [], total: 0 };
    return r.json();
  } catch (error) {
    console.error("Error fetching signals:", error);
    return { signals: [], total: 0 };
  }
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
  const unread = (notifications || []).filter((n: any) => !n.read_at && !n.is_read).length;

  return (
    <PageWrapper>
      {/* Your component content here */}
    </PageWrapper>
  );
}