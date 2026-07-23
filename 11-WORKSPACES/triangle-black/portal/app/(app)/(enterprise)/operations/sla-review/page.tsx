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
  Progress,
} from "@/components/ui";

const fetchSLAData = async () => {
  const response = await fetch("/api/v1/ai/analytics/sla", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch SLA data");
  }
  return response.json();
};

const SLAReviewPage = () => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ["slaData"],
    queryFn: fetchSLAData,
    refetchInterval: 60000,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <div>Error fetching SLA data</div>;

  const { compliance_rate, sla_target, sla_status, total, completed, overdue, by_type } = data;

  const statusBadgeColor = sla_status === "at_risk" ? "red" : "green";
  const gapPercentage = (sla_target - compliance_rate).toFixed(2);
  const actionItems = compliance_rate < 95 && [
    { title: "Improve Compliance", description: "Review and optimize work orders." },
    { title: "Increase Resources", description: "Assign more personnel to critical tasks." },
    { title: "Enhance Training", description: "Provide additional training for staff." },
  ];

  return (
    <PageWrapper>
      <PageHeader title="SLA Review" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard>
          <StatusBadge status={sla_status} color={statusBadgeColor} />
        </SectionCard>
        <SectionCard>
          <MetricStrip
            title="Compliance Rate"
            value={`${compliance_rate.toFixed(2)}%`}
            target={`${sla_target}%`}
            gap={`${gapPercentage}%`}
            icon="chart-bar"
          />
        </SectionCard>
      </div>
      <Progress value={compliance_rate} max={sla_target} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {by_type.map((type) => (
          <SectionCard key={type.type}>
            <h3>{type.type}</h3>
            <p>Total: {type.total}</p>
            <p>Completed: {type.completed}</p>
            <p>Rate: {type.rate.toFixed(2)}%</p>
          </SectionCard>
        ))}
      </div>
      {actionItems.length > 0 && (
        <SectionCard title="Action Items">
          <ul>
            {actionItems.map((item, index) => (
              <li key={index}>
                <strong>{item.title}</strong>: {item.description}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </PageWrapper>
  );
};

export default SLAReviewPage;