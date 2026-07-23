"use client";
jsx
"use client"; // @ts-nocheck

import { PageWrapper, PageHeader, SectionCard, StatusBadge, LoadingState } from "@/components/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const fetchWorkOrders = async () => {
  const response = await authFetch("/api/v1/work-orders/?status=open&limit=20");
  return response.json();
};

const updateWorkOrderStatus = async (id, to) => {
  const response = await authFetch(`/api/v1/work-orders/${id}/transition`, {
    method: "POST",
    body: JSON.stringify({ to }),
  });
  return response.json();
};

const MyDayPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery("workOrders", fetchWorkOrders);
  const startMutation = useMutation(updateWorkOrderStatus, {
    onSuccess: () => queryClient.invalidateQueries("workOrders"),
  });
  const completeMutation = useMutation(updateWorkOrderStatus, {
    onSuccess: () => queryClient.invalidateQueries("workOrders"),
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <div>Error fetching work orders</div>;

  const openCount = data.filter((wo) => wo.status === "open").length;
  const inProgressCount = data.filter((wo) => wo.status === "in_progress").length;
  const completedCount = data.filter((wo) => wo.status === "completed").length;

  return (
    <PageWrapper>
      <PageHeader title="My Day" />
      <div className="flex justify-between px-4">
        <StatusBadge label={`Open: ${openCount}`} color="blue" />
        <StatusBadge label={`In Progress: ${inProgressCount}`} color="green" />
        <StatusBadge label={`Completed: ${completedCount}`} color="gray" />
      </div>
      {data.map((wo) => (
        <SectionCard key={wo.id} className="swipeable-card">
          <h3>{wo.title}</h3>
          <div className="flex items-center">
            <StatusBadge label={wo.type} color="purple" />
            <span className={`ml-2 px-2 py-1 rounded-full bg-${wo.priority}-500 text-white`}>{wo.priority}</span>
          </div>
          <p>{wo.hotel_name}</p>
          <div className="flex justify-end mt-4">
            {wo.status === "open" && (
              <button
                onClick={() => startMutation.mutate([wo.id, "in_progress"])}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Start
              </button>
            )}
            {wo.status === "in_progress" && (
              <button
                onClick={() => completeMutation.mutate([wo.id, "completed"])}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Complete
              </button>
            )}
          </div>
        </SectionCard>
      ))}
    </PageWrapper>
  );
};

export default MyDayPage;