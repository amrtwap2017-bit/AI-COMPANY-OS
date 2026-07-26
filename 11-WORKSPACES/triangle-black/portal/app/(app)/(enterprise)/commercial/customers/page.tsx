// @ts-nocheck
"use client";

import { useQuery } from "react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

const CustomerListPage = () => {
  const { data: customers, isLoading, isError } = useQuery(["customers"], () => authFetch("/api/v1/leads/?limit=100").then(r => r.json()), { refetchInterval: 60000 });

  if (isLoading) return <LoadingState />;
  if (isError || !customers) return <EmptyState />;

  const convertedLeads = customers.filter(c => c.status === "converted");
  const activeClients = customers.filter(c => c.status === "active");

  const kpiData = [
    { v: convertedLeads.length, label: "Converted Leads" },
    { v: activeClients.length, label: "Active Clients" },
    { v: customers.length, label: "Total Customers" },
    { v: Math.round(customers.reduce((acc, c) => acc + c.score, 0) / customers.length), label: "Average Score" }
  ];

  return (
    <PageWrapper>
      <PageHeader title="Customer List" />
      <div className="grid grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <SectionCard key={index}>
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <div className="text-2xl font-bold text-blue-700">{kpi.v}</div>
              <div className="text-xs text-slate-500">{kpi.label}</div>
            </div>
          </SectionCard>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4">
        <input type="search" placeholder="Search customers..." className="border border-slate-200 px-3 py-2 rounded-l" />
        <select className="border border-slate-200 px-3 py-2 rounded-r">
          <option value="">All</option>
          <option value="converted">Converted Leads</option>
          <option value="active">Active Clients</option>
        </select>
      </div>
      <table className="w-full mt-4 border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Company</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Contact</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Status</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Score</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-3 text-sm text-slate-700">{customer.company}</td>
              <td className="py-3 px-3 text-sm text-slate-700">{customer.name}</td>
              <td className="py-3 px-3 text-sm text-slate-700">
                {customer.status === "converted" && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Converted</span>}
                {customer.status === "active" && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Active</span>}
              </td>
              <td className="py-3 px-3 text-sm text-slate-700">{customer.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageWrapper>
  );
};

export default CustomerListPage;