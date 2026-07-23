"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";

const fetchLeads = async () => {
  const response = await fetch("/api/v1/leads", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch leads");
  return response.json();
};

const fetchContracts = async () => {
  const response = await fetch("/api/v1/contracts", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch contracts");
  return response.json();
};

const PipelinePage = () => {
  const leadsQuery = useQuery(["leads"], fetchLeads, {
    refetchInterval: 120000,
  });

  const contractsQuery = useQuery(["contracts"], fetchContracts, {
    refetchInterval: 120000,
  });

  if (leadsQuery.isLoading || contractsQuery.isLoading) return <LoadingState />;

  if (leadsQuery.isError || contractsQuery.isError)
    return <EmptyState message="Failed to load data" />;

  const leads = leadsQuery.data;
  const contracts = contractsQuery.data;

  const statusCounts = {
    new: leads.filter((lead) => lead.status === "new").length,
    qualified: leads.filter((lead) => lead.status === "qualified").length,
    negotiation: leads.filter((lead) => lead.status === "negotiation").length,
    won: leads.filter((lead) => lead.status === "won").length,
    lost: leads.filter((lead) => lead.status === "lost").length,
  };

  const totalLeads = statusCounts.new + statusCounts.qualified + statusCounts.negotiation + statusCounts.won;

  return (
    <PageWrapper>
      <PageHeader title="Pipeline" />
      <SectionCard title="Metrics">
        <MetricStrip
          metrics={[
            { label: "Total Leads", value: totalLeads },
            { label: "New", value: statusCounts.new },
            { label: "Qualified", value: statusCounts.qualified },
            { label: "In Negotiation", value: statusCounts.negotiation },
            { label: "Won", value: statusCounts.won },
          ]}
        />
      </SectionCard>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-4 overflow-x-auto">
          <h3 className="text-lg font-bold mb-4">Kanban Pipeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="bg-white p-4 rounded-lg shadow-md">
                <h4 className="text-xl font-bold mb-2">{count}</h4>
                <p className="text-gray-600">EGP Sum: {toLocaleString(count * 1000)}</p>
                <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
                  {leads
                    .filter((lead) => lead.status === status)
                    .slice(0, 5)
                    .map((lead) => (
                      <div key={lead.id} className="bg-gray-100 p-3 rounded-lg shadow-sm">
                        <h5 className="font-bold">{lead.company_name}</h5>
                        <p>{lead.contact_name}</p>
                        <p>{toLocaleString(lead.value)} EGP</p>
                        <p
                          className={`text-red-600 ${new Date(lead.expected_close_date) < new Date() ? 'font-bold' : ''}`}
                        >
                          {lead.expected_close_date}
                        </p>
                        <StatusBadge status={lead.status} />
                      </div>
                    ))}
                  {leads.filter((lead) => lead.status === status).length > 5 && (
                    <button className="bg-gray-200 p-2 rounded-lg shadow-sm">
                      +{leads.filter((lead) => lead.status === status).length - 5} more
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/2 p-4">
          <h3 className="text-lg font-bold mb-4">Pipeline Metrics Bar Chart</h3>
          <div className="flex flex-col space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="bg-white p-4 rounded-lg shadow-md">
                <div
                  className={`bg-${status === "new" ? "blue" : status === "qualified" ? "purple" : status === "negotiation" ? "amber" : status === "won" ? "green" : "red"}-500 h-12 rounded-lg`}
                  style={{ width: `${(count / totalLeads) * 100}%` }}
                />
                <p className="text-center">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SectionCard title="Recent Leads">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th>Company</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Value EGP</th>
              <th>Expected Close</th>
            </tr>
          </thead>
          <tbody>
            {leads
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 10)
              .map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.company_name}</td>
                  <td>{lead.contact_name}</td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td>{toLocaleString(lead.value)} EGP</td>
                  <td>{lead.expected_close_date}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </SectionCard>
    </PageWrapper>
  );
};

export default PipelinePage;