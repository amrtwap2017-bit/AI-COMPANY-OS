"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  MetricCard,
  StatusBadge,
  LoadingState,
  EmptyState,
  Button,
  Progress
} from "@/components/ui";

const fetchMaintenanceSignals = async () => {
  const response = await useAuthFetch("/api/v1/ai/signals?category=maintenance");
  return response.json();
};

const fetchAssets = async () => {
  const response = await useAuthFetch("/api/v1/assets");
  return response.json();
};

const fetchPMPlans = async () => {
  const response = await useAuthFetch("/api/v1/maintenance/pm-plans");
  return response.json();
};

const MaintenanceIntelligencePage = () => {
  const [assetsInFault, setAssetsInFault] = useState(0);
  const [criticalAssetsCount, setCriticalAssetsCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const assetsResponse = await useAuthFetch("/api/v1/assets");
        const assetsData = await assetsResponse.json();
        const faultCount = assetsData.filter(asset => ["fault", "breakdown"].includes(asset.status)).length;
        setAssetsInFault(faultCount);

        const criticalCount = assetsData.filter(asset => asset.criticality === "critical").length;
        setCriticalAssetsCount(criticalCount);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);

  const { data: signals, isLoading: signalsLoading, isError: signalsError } = useQuery({
    queryKey: ["maintenance-signals"],
    queryFn: fetchMaintenanceSignals,
    refetchInterval: 60000
  });

  const { data: assets, isLoading: assetsLoading, isError: assetsError } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchAssets
  });

  const { data: pmPlans, isLoading: pmPlansLoading, isError: pmPlansError } = useQuery({
    queryKey: ["pm-plans"],
    queryFn: fetchPMPlans
  });

  if (signalsLoading || assetsLoading || pmPlansLoading) return <LoadingState />;

  if (signalsError || assetsError || pmPlansError) return <EmptyState title="Failed to load data" description="Please try again later." />;

  const filteredSignals = signals.filter(signal => signal.category === "maintenance");

  const operationalAssets = assets.filter(asset => asset.status === "active");
  const faultAssets = assets.filter(asset => ["fault", "breakdown"].includes(asset.status));
  const underMaintenanceAssets = assets.filter(asset => asset.status === "under_maintenance");

  return (
    <PageWrapper>
      <PageHeader title="Maintenance Intelligence" />
      <SectionCard title="Metrics">
        <MetricStrip>
          <MetricCard
            title="Maintenance Signals"
            value={filteredSignals.length}
            icon="signal"
            color="red"
          />
          <MetricCard
            title="Assets in Fault"
            value={assetsInFault}
            icon="alert"
            color="red"
          />
          <MetricCard
            title="PM Plans Active"
            value={pmPlans.filter(plan => plan.status === "active").length}
            icon="calendar"
            color="green"
          />
          <MetricCard
            title="Critical Assets"
            value={criticalAssetsCount}
            icon="warning"
            color="orange"
          />
        </MetricStrip>
      </SectionCard>

      <SectionCard title="Maintenance Signals">
        {filteredSignals.length > 0 ? (
          filteredSignals.map(signal => (
            <div key={signal.signal_id} className="flex items-center space-x-4 p-2 border-b last:border-b-0">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div>
                <h3 className="font-bold">{signal.title}</h3>
                <p>{signal.message}</p>
                <p className="italic">{signal.recommended_action}</p>
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="Maintenance systems nominal" description="No signals at the moment." />
        )}
      </SectionCard>

      <SectionCard title="Asset Health Overview">
        {assets.length > 0 ? (
          assets
            .sort((a, b) => {
              if (a.status === "fault" && b.status !== "fault") return -1;
              if (b.status === "fault" && a.status !== "fault") return 1;
              if (a.criticality === "critical" && b.criticality !== "critical") return -1;
              if (b.criticality === "critical" && a.criticality !== "critical") return 1;
              return 0;
            })
            .map(asset => (
              <div key={asset.id} className="flex items-center space-x-4 p-2 border-b last:border-b-0">
                <span>{asset.name}</span>
                <StatusBadge status={asset.status} />
                <StatusBadge status={asset.criticality} />
                <StatusBadge status={asset.status} />
              </div>
            ))
        ) : (
          <EmptyState title="No assets found" description="Please check your data source." />
        )}
      </SectionCard>

      <SectionCard title="PM Plans Due Soon">
        {pmPlans.length > 0 ? (
          pmPlans
            .filter(plan => plan.next_due_date <= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) || plan.status === "overdue")
            .sort((a, b) => a.next_due_date - b.next_due_date)
            .map(plan => (
              <div key={plan.title} className="flex items-center space-x-4 p-2 border-b last:border-b-0">
                <span>{plan.title}</span>
                <StatusBadge status={plan.status} />
                <StatusBadge status={plan.plan_type} />
                <span>{plan.frequency}</span>
                <span>{plan.next_due_date.toLocaleDateString()}</span>
              </div>
            ))
        ) : (
          <EmptyState title="No PM plans due soon" description="All PM plans are up to date." />
        )}
      </SectionCard>
    </PageWrapper>
  );
};

export default MaintenanceIntelligencePage;