// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  Progress,
} from "@/components/ui";
import { useState } from "react";
import Link from "next/link";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchTechnicians = async () => {
  const response = await authFetch(`/api/v1/technicians`).then(r => r.json());
  if (!response.ok) return [];
  return response.json();
};

const TechniciansPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["technicians"],
    queryFn: fetchTechnicians,
    refetchInterval: 60000,
  });

  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "at_capacity" | "inactive">("all");

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <EmptyState />;

  const technicians = data.technicians;
  const totalTechnicians = (technicians || []).length;
  const activeTechnicians = toArr(technicians).filter(t => t.is_active).length;
  const atCapacityTechnicians = toArr(technicians).filter(t => t.current_work_orders >= t.max_work_orders).length;
  const avgUtilization = (toArr(technicians).reduce((acc: any, t: any) => acc + t.current_work_orders / t.max_work_orders, 0) / totalTechnicians) * 100;

  const filteredTechnicians = technicians
    .filter(t => {
      if (availabilityFilter === "available") return t.current_work_orders < t.max_work_orders;
      if (availabilityFilter === "at_capacity") return t.current_work_orders >= t.max_work_orders;
      if (availabilityFilter === "inactive") return !t.is_active;
      return true;
    })
    .sort((a: any, b: any) => b.current_work_orders - a.current_work_orders);

  return (
    <PageWrapper>
      <PageHeader title="Technician Management" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Technicians", value: totalTechnicians },
            { label: "Active", value: activeTechnicians, color: "green" },
            { label: "At Capacity", value: atCapacityTechnicians, color: "red" },
            { label: "Avg Utilization %", value: (Number(avgUtilization) || 0).toFixed(2) },
          ]}
        />
      </SectionCard>
      <div className="flex gap-4">
        <button
          onClick={() => setAvailabilityFilter("all")}
          className={`btn ${availabilityFilter === "all" ? "btn-active" : ""}`}
        >
          All
        </button>
        <button
          onClick={() => setAvailabilityFilter("available")}
          className={`btn ${availabilityFilter === "available" ? "btn-active" : ""}`}
        >
          Available
        </button>
        <button
          onClick={() => setAvailabilityFilter("at_capacity")}
          className={`btn ${availabilityFilter === "at_capacity" ? "btn-active" : ""}`}
        >
          At Capacity
        </button>
        <button
          onClick={() => setAvailabilityFilter("inactive")}
          className={`btn ${availabilityFilter === "inactive" ? "btn-active" : ""}`}
        >
          Inactive
        </button>
      </div>
      {filteredTechnicians.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {toArr(filteredTechnicians).map(t  => (
            <Link key={t.id} href={`/operations/technicians/${t.id}`}>
              <SectionCard>
                <h3 className="font-bold">{t.name}</h3>
                <p>{t.email}</p>
                <p>{t.phone}</p>
                <div className="flex gap-2">
                  {Array.isArray(t.specializations) ? t.(specializations || []).slice(0, 3).map(s => (
                    <StatusBadge key={s} label={s} />
                  )) : null}
                </div>
                <Progress value={t.current_work_orders} max={t.max_work_orders} color={t.current_work_orders / t.max_work_orders < 0.5 ? "green" : t.current_work_orders / t.max_work_orders < 0.85 ? "amber" : "red"} />
                <p>{t.current_work_orders}/{t.max_work_orders}</p>
              </SectionCard>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState message="No technicians found." />
      )}
    </PageWrapper>
  );
};

export default TechniciansPage;