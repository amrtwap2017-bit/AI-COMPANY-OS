"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchWOs() {
  try {  
    const r = await authFetch(`/api/v1/work-orders`).then(r => r.json());
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? d.data ?? [];
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return [];
  }
}

async function fetchAssets() {
  try {  
    const r = await authFetch(`/api/v1/assets`).then(r => r.json());
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? d.data ?? [];
  } catch (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
}

export default function DowntimeReviewPage() {
  const { data: wos = [], isLoading: woLoading } = useQuery({
    queryKey: ["downtime-wos"],
    queryFn: fetchWOs,
    refetchInterval: 300000,
  });
  const { data: assets = [], isLoading: assetLoading } = useQuery({
    queryKey: ["downtime-assets"],
    queryFn: fetchAssets,
    refetchInterval: 300000,
  });

  const isLoading = woLoading || assetLoading;

  return (
    <PageWrapper>
      {/* Your page content here */}
    </PageWrapper>
  );
}