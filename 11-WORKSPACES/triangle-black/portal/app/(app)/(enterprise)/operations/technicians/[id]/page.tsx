"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  Progress
} from "@/components/ui";

const fetchTechnician = async (id: string) => {
  const response = await fetch(`/api/v1/technicians?id=${id}`, { credentials: "include" });
  if (!response.ok) throw new Error("Technician not found");
  return response.json();
};

const fetchWorkOrders = async (id: string) => {
  const response = await fetch(`/api/v1/work-orders?technician_id=${id}`, { credentials: "include" });
  return response.json();
};

export default function TechnicianProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const { data: technician, isLoading, isError } = useQuery(["technician", id], () => fetchTechnician(id), {
    refetchInterval: 60000
  });

  const { data: workOrders = [] } = useQuery(["workOrders", id], () => fetchWorkOrders(id));

  if (isLoading) return <LoadingState />;
  if (isError || !technician) return <EmptyState title="Technician not found" backLink="/operations/technicians" />;

  const specializations = JSON.parse(technician.specializations || "[]");
  const currentWOs = workOrders.filter(w => w.status !== "completed").length;
  const maxCapacity = technician.capacity;
  const utilizationPercentage = ((currentWOs / maxCapacity) * 100).toFixed(2);
  const completedWOs = workOrders.filter(w => w.status === "completed").length;

  return (
    <PageWrapper>
      <PageHeader title="Technician Profile" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Current WOs", value: currentWOs },
            { label: "Max Capacity", value: maxCapacity },
            { label: "Utilization %", value: utilizationPercentage, suffix: "%" },
            { label: "Completed WOs", value: completedWOs }
          ]}
        />
      </SectionCard>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">{technician.name}</h2>
        <p>{technician.email}</p>
        <p>{technician.phone}</p>
        <div className="flex gap-2">
          {specializations.map((spec: string, index: number) => (
            <StatusBadge key={index} label={spec} />
          ))}
        </div>
        <Progress value={(currentWOs / maxCapacity) * 100} />
      </div>
      <SectionCard title="Assigned Work Orders">
        {workOrders.length === 0 ? (
          <EmptyState title="No work orders assigned" />
        ) : (
          <ul className="space-y-2">
            {workOrders
              .sort((a, b) => {
                if (a.status === "in_progress" && b.status !== "in_progress") return -1;
                if (b.status === "in_progress" && a.status !== "in_progress") return 1;
                return 0;
              })
              .map((wo: any) => (
                <li key={wo.id} className="flex items-center gap-2">
                  <span>{wo.title}</span>
                  <StatusBadge label={wo.type} />
                  <StatusBadge label={wo.priority} />
                  <StatusBadge label={wo.status} />
                </li>
              ))}
          </ul>
        )}
      </SectionCard>
      <Link href="/operations/technicians" className="text-sm text-gray-500">
        Back to Technicians
      </Link>
    </PageWrapper>
  );
}