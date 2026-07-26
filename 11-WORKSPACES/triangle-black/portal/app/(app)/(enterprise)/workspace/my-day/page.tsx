// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import authFetch from "@/lib/hooks/useAuthFetch";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";
const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any): string => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0,10); } };

const fetchWorkOrders = async () => {
  const response = await authFetch("/api/v1/work-orders/?status=open&limit=20");
  if (!response.ok) {
    throw new Error("Failed to fetch work orders");
  }
  return response.json();
};

const MyDayPage: React.FC = () => {
  const { data, isLoading, isError } = useQuery(["workOrders"], fetchWorkOrders);

  const totalWOs = data ? data.total : 0;
  const completedTodayWOs = data ? data.completedToday : 0;
  const inProgressWOs = data ? data.inProgress : 0;

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState title="Failed to load work orders" />;

  return (
    <PageWrapper>
      <PageHeader title="My Day" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard title="Technician Stats">
          <MetricStrip label="Total WOs" value={totalWOs} />
          <MetricStrip label="Completed Today" value={completedTodayWOs} />
          <MetricStrip label="In Progress" value={inProgressWOs} />
        </SectionCard>
      </div>
      {data && data.workOrders.length > 0 ? (
        <div className="mt-4">
          {toArr(data.workOrders).map((wo) => (
            <div key={wo.id} className="bg-white p-4 rounded-lg shadow mb-2 flex items-center justify-between">
              <div>
                <h3>{wo.title}</h3>
                <p>{fmtDate(wo.location)}</p>
              </div>
              <StatusBadge status={wo.status} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No work orders assigned" />
      )}
    </PageWrapper>
  );
};

export default MyDayPage;
