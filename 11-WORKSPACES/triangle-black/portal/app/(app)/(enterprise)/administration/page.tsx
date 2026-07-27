"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, LoadingState } from "@/components/ui";
import Link from "next/link";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchUsers = async () => {
  const res = await authFetch(`/api/v1/auth/users`);
  if (!res.ok) return [];
  return res.json();
};

const fetchHealth = async () => {
  const res = await authFetch(`/api/v1/ai/health`);
  if (!res.ok) return [];
  return res.json();
};

export default function AdministrationPage() {
  const userQuery = useQuery(["users"], fetchUsers, { refetchInterval: 300000 });
  const healthQuery = useQuery(["health"], fetchHealth, { refetchInterval: 60000 });

  if (userQuery.isLoading || healthQuery.isLoading) return <LoadingState />;

  if (userQuery.isError || healthQuery.isError) return <div>Error fetching data</div>;

  const userCount = userQuery.data ? userQuery.data.count : 0;
  const healthStatus = healthQuery.data?.status || "unknown";
  const isDegraded = healthStatus !== "ok";

  return (
    <PageWrapper>
      <PageHeader title="Administration Hub" />
      <div className="grid grid-cols-2 gap-4">
        <SectionCard title="Total Users">
          <MetricStrip value={userCount} />
        </SectionCard>
        <SectionCard title="System Status">
          <MetricStrip value={healthStatus} color={isDegraded ? "amber" : "green"} />
        </SectionCard>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Link href="/administration/users" passHref>
          <SectionCard title="User Management">
            {userCount} users
          </SectionCard>
        </Link>
        <Link href="/administration/audit" passHref>
          <SectionCard title="Audit Log">Track all changes</SectionCard>
        </Link>
        <Link href="/admin/notification-rules" passHref>
          <SectionCard title="Notification Rules">Configure alerts</SectionCard>
        </Link>
        <SectionCard title="System Health">
          {healthStatus} - Last checked: {new Date().toLocaleString()}
        </SectionCard>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
        <p>Platform Version: Triangle Black v3.0.0</p>
        <p>Build Info: Hardcoded</p>
      </div>
    </PageWrapper>
  );
}