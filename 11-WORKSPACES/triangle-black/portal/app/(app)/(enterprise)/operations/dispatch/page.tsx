"use client"; // @ts-nocheck
// @ts-nocheck

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

const fetchTechnicians = async () => {
  const response = await fetch("/api/v1/technicians", {
    credentials: "include",
  });
  return response.json();
};

const fetchWorkOrders = async () => {
  const response = await fetch("/api/v1/work-orders", {
    credentials: "include",
  });
  return response.json();
};

const dispatchRecommendation = async (work_order_id: string) => {
  const response = await fetch("/api/v1/ai/dispatch/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ work_order_type: "exampleType", priority: 1, hotel_id: "exampleHotelId" }),
    credentials: "include",
  });
  return response.json();
};

const DispatchPage = () => {
  const [dispatchResults, setDispatchResults] = useState<{ [key: string]: any }>({});

  const { data: techniciansData, isLoading: techsLoading, isError: techsError } = useQuery(
    "technicians",
    fetchTechnicians,
    { refetchInterval: 60000 }
  );

  const { data: workOrdersData, isLoading: wosLoading, isError: wosError } = useQuery(
    "work-orders",
    fetchWorkOrders,
    { refetchInterval: 60000 }
  );

  if (techsLoading || wosLoading) return <LoadingState />;
  if (techsError || wosError) return <EmptyState />;

  const availableTechs = (techniciansData.technicians || []).filter(
    (tech: any) => tech.current_work_orders < tech.max_work_orders
  ).length;
  const openWOS = (workOrdersData.work_orders || []).filter((wo: any) => !wo.technician_id).length;
  const needingDispatch = (workOrdersData.work_orders || []).filter((wo: any) => !wo.technician_id && wo.priority > 0).length;
  const aiRecommendations = Object.keys(dispatchResults).length;

  return (
    <PageWrapper>
      <PageHeader title="AI Crew Planning and Dispatch" />
      <div className="grid grid-cols-1 gap-4">
        <MetricStrip
          metrics={[
            { label: "Available Techs", value: availableTechs },
            { label: "Open WOs", value: openWOS },
            { label: "WOs Needing Dispatch", value: needingDispatch },
            { label: "AI Recommendations Made", value: aiRecommendations },
          ]}
        />
        <SectionCard title="Technician Capacity">
          <div className="grid grid-cols-3 gap-4">
            {(techniciansData.technicians || []).map((tech: any) => (
              <div key={tech.id} className="bg-white p-4 rounded-lg shadow-md">
                <h3>{tech.name}</h3>
                <p>{Array.isArray(tech.specializations) ? (tech.specializations || []).slice(0, 2).join(", ") : tech.specializations}</p>
                <Progress value={(tech.current_work_orders / tech.max_work_orders) * 100} />
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Open WOs Needing Assignment">
          {workOrdersData.work_orders
            .filter((wo: any) => !wo.technician_id)
            .map((wo: any) => (
              <div key={wo.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                <div>
                  <h3>{wo.title}</h3>
                  <StatusBadge type={wo.type} />
                  <StatusBadge type={wo.priority.toString()} />
                </div>
                <button
                  onClick={() => {
                    dispatchRecommendation(wo.id).then((result: any) => {
                      setDispatchResults({ ...dispatchResults, [wo.id]: result });
                    });
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Get AI Recommendation
                </button>
                {dispatchResults[wo.id] && (
                  <div>
                    Recommended: {dispatchResults[wo.id].tech_name} - Score: {dispatchResults[wo.id].score}
                  </div>
                )}
              </div>
            ))}
        </SectionCard>
        <SectionCard title="Bulk Assignment Summary">
          <p>{availableTechs} technicians available for {openWOS} open WOs</p>
        </SectionCard>
      </div>
    </PageWrapper>
  );
};

export default DispatchPage;