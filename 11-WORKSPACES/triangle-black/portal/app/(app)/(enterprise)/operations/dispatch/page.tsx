"use client"; // @ts-nocheck

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  Progress,
  Button,
} from "@/components/ui";

const fetchTechnicians = async () => {
  const response = await fetch("/api/v1/technicians", { credentials: "include" });
  return response.json();
};

const fetchWorkOrders = async () => {
  const response = await fetch("/api/v1/work-orders", { credentials: "include" });
  return response.json();
};

const dispatchTechnician = async (values) => {
  const response = await fetch("/api/v1/ai/dispatch/recommend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
    credentials: "include",
  });
  return response.json();
};

const DispatchPage = () => {
  const { data: technicians, isLoading: techniciansLoading } = useQuery(
    ["technicians"],
    fetchTechnicians,
    { refetchInterval: 30000 }
  );

  const { data: workOrders, isLoading: workOrdersLoading } = useQuery(
    ["work-orders"],
    fetchWorkOrders,
    { refetchInterval: 30000 }
  );

  const [selectedType, setSelectedType] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

  const dispatchMutation = useMutation(dispatchTechnician, {
    onSuccess: () => {
      // Refetch data after successful dispatch
      techniciansRefetch();
      workOrdersRefetch();
    },
  });

  if (techniciansLoading || workOrdersLoading) return <LoadingState />;

  const totalTechnicians = technicians.length;
  const availableTechnicians = technicians.filter(
    (t) => t.current_work_orders < t.max_work_orders
  ).length;
  const atCapacityTechnicians = technicians.filter(
    (t) => t.current_work_orders >= t.max_work_orders
  ).length;
  const openWOsUnassigned = workOrders.filter(
    (wo) => wo.status === "open" && (!wo.technician_id || wo.technician_id === "")
  ).length;

  return (
    <PageWrapper>
      <PageHeader title="Dispatch Operations" />
      <SectionCard title="Metrics">
        <MetricStrip
          label="Total Technicians"
          value={totalTechnicians}
          status={
            totalTechnicians > 0 ? StatusBadge.SUCCESS : StatusBadge.WARNING
          }
        />
        <MetricStrip
          label="Available Technicians"
          value={availableTechnicians}
          status={
            availableTechnicians > 0 ? StatusBadge.SUCCESS : StatusBadge.WARNING
          }
        />
        <MetricStrip
          label="At Capacity Technicians"
          value={atCapacityTechnicians}
          status={
            atCapacityTechnicians > 0 ? StatusBadge.ERROR : StatusBadge.SUCCESS
          }
        />
        <MetricStrip
          label="Open WOs Unassigned"
          value={openWOsUnassigned}
          status={
            openWOsUnassigned > 0 ? StatusBadge.WARNING : StatusBadge.SUCCESS
          }
        />
      </SectionCard>
      <SectionCard title="Technician Capacity Grid">
        <div className="grid grid-cols-3 gap-4">
          {technicians.map((t) => (
            <div key={t.id} className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="font-bold">{t.name}</h2>
              <Progress
                value={t.current_work_orders}
                max={t.max_work_orders}
                color={
                  t.current_work_orders / t.max_work_orders < 0.5
                    ? "green"
                    : t.current_work_orders / t.max_work_orders < 0.85
                    ? "amber"
                    : "red"
                }
              />
              {t.specializations.slice(0, 2).map((spec) => (
                <StatusBadge key={spec} label={spec} />
              ))}
              <p>{t.current_work_orders}/{t.max_work_orders}</p>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Quick Dispatch Panel">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full p-2 border rounded-md mb-4"
        >
          <option value="">Select Type</option>
          <option value="hvac">HVAC</option>
          <option value="electrical">Electrical</option>
          <option value="plumbing">Plumbing</option>
          <option value="mechanical">Mechanical</option>
          <option value="civil">Civil</option>
        </select>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="w-full p-2 border rounded-md mb-4"
        >
          <option value="">Select Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
        </select>
        <Button
          onClick={() =>
            dispatchMutation.mutate({ work_order_type: selectedType, priority: selectedPriority, hotel_id: 1 })
          }
          disabled={!selectedType || !selectedPriority}
        >
          Find Best Technician
        </Button>
        {dispatchMutation.isSuccess && (
          <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
            <h3>{dispatchMutation.data.recommended.name}</h3>
            <p>Score: {dispatchMutation.data.recommended.score}%</p>
            <p>Reason: {dispatchMutation.data.recommended.reason}</p>
            {dispatchMutation.data.warning && (
              <StatusBadge label="Warning" status={StatusBadge.WARNING} />
            )}
          </div>
        )}
      </SectionCard>
      <SectionCard title="Open Unassigned Work Orders">
        <ul className="divide-y divide-gray-200">
          {openWOsUnassigned.length > 0 ? (
            openWOsUnassigned.map((wo) => (
              <li key={wo.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3>{wo.title}</h3>
                  <StatusBadge label={wo.priority} />
                  <StatusBadge label={wo.type} />
                </div>
                <span>{wo.due_date}</span>
              </li>
            ))
          ) : (
            <EmptyState message="No unassigned work orders" />
          )}
        </ul>
      </SectionCard>
    </PageWrapper>
  );
};

export default DispatchPage;