"use client"; // @ts-nocheck
"use client"; // @ts-nocheck

import { PageWrapper, PageHeader, SectionCard, StatusBadge, LoadingState } from "@/components/ui";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const fetchCustomerSuccessOverview = async () => {
  const response = await authFetch("/api/v1/customer-success/overview");
  return response.json();
};

const fetchRenewals = async () => {
  const response = await authFetch("/api/v1/customer-success/renewals");
  return response.json();
};

const fetchNPSData = async () => {
  const response = await authFetch("/api/v1/customer-success/nps/summary");
  return response.json();
};

const CustomerSuccessPage = () => {
  const { data: overview, isLoading: isOverviewLoading } = useQuery(["customer-success-overview"], fetchCustomerSuccessOverview);
  const { data: renewals, isLoading: isRenewalsLoading } = useQuery(["customer-success-renewals"], fetchRenewals);
  const { data: npsData, isLoading: isNPSLoading } = useQuery(["customer-success-nps"], fetchNPSData);

  if (isOverviewLoading || isRenewalsLoading || isNPSLoading) return <LoadingState />;

  return (
    <PageWrapper>
      <PageHeader title="Customer Success Dashboard" />
      <div className="grid grid-cols-2 gap-4">
        <SectionCard title="Total Clients" value={overview.total_clients} />
        <SectionCard title="Active Contracts" value={overview.active_contracts} />
        <SectionCard title="Expiring in 30 Days" value={overview.contracts_expiring_30_days} />
        <SectionCard title="NPS Score" value={overview.avg_satisfaction_score} />
        <SectionCard title="Renewal Pipeline EGP" value={overview.renewal_pipeline_value_egp} />
        <SectionCard title="At Risk Count" value={overview.at_risk_count} />
      </div>
      <h2 className="mt-8 text-xl font-bold">Renewals</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th>Hotel Name</th>
            <th>Contract End Date</th>
            <th>Days Remaining</th>
            <th>Risk Level</th>
            <th>Total Value EGP</th>
          </tr>
        </thead>
        <tbody>
          {renewals.renewals.map((renewal) => (
            <tr key={renewal.contract_id}>
              <td>{renewal.hotel_name}</td>
              <td>{new Date(renewal.end_date).toLocaleDateString()}</td>
              <td>{renewal.days_remaining}</td>
              <td><StatusBadge color={renewal.risk_level === "high" ? "red" : renewal.risk_level === "medium" ? "amber" : "green"}>{renewal.risk_level}</StatusBadge></td>
              <td>{renewal.total_value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="mt-8 text-xl font-bold">NPS Breakdown</h2>
      <div className="flex justify-between">
        <div className="bg-green-500 w-1/3 h-20 flex items-center justify-center">{npsData.promoters}</div>
        <div className="bg-yellow-500 w-1/3 h-20 flex items-center justify-center">{npsData.passives}</div>
        <div className="bg-red-500 w-1/3 h-20 flex items-center justify-center">{npsData.detractors}</div>
      </div>
    </PageWrapper>
  );
};

export default CustomerSuccessPage;