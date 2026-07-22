"use client"; // @ts-nocheck


import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState, Progress } from "@/components/ui";
import { useQuery } from "@tanstack/react-query";

const fetchSLAData = async () => {
  try {
    const response = await fetch("/api/v1/analytics/sla");
    if (!response.ok) throw new Error("Failed to fetch SLA data");
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchWorkOrders = async () => {
  const response = await fetch("/api/v1/work-orders");
  return response.json();
};

const SLAReviewPage = () => {
  const { data: slaData, isLoading: isSLALoading, isError: isSLError } = useQuery(["sla"], fetchSLAData);
  const { data: workOrders, isLoading: isWorkOrdersLoading, isError: isWorkOrdersError } = useQuery(["work-orders"], fetchWorkOrders);

  if (isSLALoading || isWorkOrdersLoading) return <LoadingState />;
  if (isSLError || isWorkOrdersError) return <EmptyState title="Failed to load data" description="Please try again later." />;

  const complianceRate = slaData ? Math.round((slaData.completed / slaData.total) * 100) : null;
  const completedWOs = slaData ? slaData.completed : workOrders.filter(order => order.status === "completed").length;
  const openWOs = slaData ? slaData.open : workOrders.filter(order => order.status !== "completed").length;
  const overdueWOs = workOrders.filter(order => new Date(order.due_date) < new Date() && order.status !== "completed").length;

  const compliance = (completedWOs / (completedWOs + openWOs)) * 100;

  return (
    <PageWrapper>
      <PageHeader title="SLA Review" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Compliance Rate", value: complianceRate, unit: "%" },
            { label: "Completed WOs", value: completedWOs },
            { label: "Open WOs", value: openWOs },
            { label: "Overdue WOs", value: overdueWOs }
          ]}
        />
      </SectionCard>
      <SectionCard title="SLA Gauge">
        <Progress value={complianceRate} max={100} color={compliance >= 95 ? "green" : compliance >= 80 ? "amber" : "red"} />
        <div className="flex justify-between items-center mt-2">
          <span>SLA Target: 95%</span>
          <span>{completedWOs} of {completedWOs + openWOs} work orders completed on time</span>
        </div>
      </SectionCard>
      <SectionCard title="Work Orders Past Due">
        {overdueWOs > 0 ? (
          <ul>
            {workOrders
              .filter(order => new Date(order.due_date) < new Date() && order.status !== "completed")
              .sort((a, b) => new Date(b.due_date) - new Date(a.due_date))
              .map(order => (
                <li key={order.id} className="flex items-center justify-between mb-2">
                  <div>
                    {order.title}
                    <StatusBadge status={order.status} />
                  </div>
                  <span>{Math.floor((new Date() - new Date(order.due_date)) / (1000 * 60 * 60 * 24))} days overdue</span>
                </li>
              ))}
          </ul>
        ) : (
          <EmptyState title="All work orders within SLA" description="No work orders are past due." />
        )}
      </SectionCard>
      <SectionCard title="SLA by Work Order Type">
        {slaData ? (
          <div className="flex flex-wrap gap-4">
            {["hvac", "electrical", "plumbing", "mechanical"].map(type => (
              <div key={type} className="bg-white p-4 rounded-lg shadow-md w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                <h3>{type}</h3>
                <StatusBadge status="completed" count={slaData[type]} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No data available" description="Please try again later." />
        )}
      </SectionCard>
    </PageWrapper>
  );
};

export default SLAReviewPage;