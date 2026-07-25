// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";
const ENG_TYPES = ["hvac", "electrical", "mechanical", "corrective", "plumbing"];

async function fetchWOs() {
  try {  
    const r = await authFetch(`/api/v1/work-orders`).then(r => r.json());
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? [];
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
    return Array.isArray(d) ? d : d.items ?? [];
  } catch (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
}

export default function EngineeringReviewPage() {
  const { data: wos = [], isLoading: w1 } = useQuery({
    queryKey: ["eng-wos"], queryFn: fetchWOs, refetchInterval: 300000,
  });
  const { data: assets = [], isLoading: a1 } = useQuery({
    queryKey: ["eng-assets"], queryFn: fetchAssets, refetchInterval: 300000,
  });

  const isLoading = w1 || a1;

  const engWOs = toArr(wos).filter((w: any) => ENG_TYPES.includes(w.type));
  const completed = toArr(engWOs).filter((w: any) => w.status === "completed");
  const criticalOpen = toArr(engWOs).filter((w: any) => w.priority === "critical" && w.status === "open");
  const faultAssets = toArr(assets).filter((a: any) => a.status === "fault" || a.status === "breakdown");

  return (
    <PageWrapper>
      {/* Your page content here */}
    </PageWrapper>
  );
}