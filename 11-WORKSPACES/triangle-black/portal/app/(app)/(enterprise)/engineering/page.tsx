// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchAssets = async () => {
  const res = await authFetch(`/api/v1/assets`);
  if (!res.ok) return [];
  return res.json();
};

const fetchMaintenanceSignals = async () => {
  const res = await authFetch(`/api/v1/ai/signals?category=maintenance`);
  if (!res.ok) return [];
  return res.json();
};

const fetchKpis = async () => {
  const res = await authFetch(`/api/v1/ai/analytics/kpis/live`);
  if (!res.ok) return [];
  return res.json();
};

export default function EngineeringPage() {
  const { data: assets, isLoading: isAssetsLoading } = useQuery(["assets"], fetchAssets, { refetchInterval: 120000 });
  const { data: signals, isLoading: isSignalsLoading } = useQuery(["signals"], fetchMaintenanceSignals, { refetchInterval: 120000 });
  const { data: kpis, isLoading: isKpisLoading } = useQuery(["kpis"], fetchKpis, { refetchInterval: 120000 });

  if (isAssetsLoading || isSignalsLoading || isKpisLoading) return <LoadingState />;

  const totalAssets = (assets || []).length;
  const inFault = toArr(assets).filter(asset => asset.status === "in-fault").length;
  const engineeringWosOpen = kpis?.engineeringWosOpen;
  const maintenanceSignalsCount = (signals || []).length;

  return (
    <PageWrapper>
      <PageHeader title="Engineering Hub" />
      <div className="grid grid-cols-3 gap-4">
        <MetricStrip label="Total Assets" value={totalAssets} />
        <MetricStrip label="In Fault" value={inFault} status={StatusBadge.Danger} />
        <MetricStrip label="Engineering WOs Open" value={engineeringWosOpen} />
        <MetricStrip label="Maintenance Signals" value={maintenanceSignalsCount} status={maintenanceSignalsCount > 0 ? StatusBadge.Warning : null} />
      </div>
      {maintenanceSignalsCount > 0 && (
        <div className="bg-yellow-100 p-4 rounded-md">
          <p className="text-yellow-700">There are {maintenanceSignalsCount} maintenance signals.</p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <Link href="/engineering/intelligence" passHref>
          <SectionCard title="Intelligence" />
        </Link>
        <Link href="/engineering/actions" passHref>
          <SectionCard title="Actions" />
        </Link>
        <Link href="/engineering/review" passHref>
          <SectionCard title="Review" />
        </Link>
        <Link href="/engineering/ai" passHref>
          <SectionCard title="AI Assistant" />
        </Link>
        <Link href="/maintenance/intelligence" passHref>
          <SectionCard title="Maintenance" />
        </Link>
        <Link href="/maintenance/assets" passHref>
          <SectionCard title="Assets" />
        </Link>
      </div>
    </PageWrapper>
  );
}