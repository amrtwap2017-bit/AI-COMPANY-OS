// @ts-nocheck
"use client";

import { useQuery } from "react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

const TechnicianSettingsPage = () => {
  const { data: technicians, isLoading, isError } = useQuery(["technicians"], () => authFetch("/api/v1/technicians/?limit=100").then(r => r.json()), { refetchInterval: 60000 });

  if (isLoading) return <LoadingState />;
  if (isError || !technicians) return <EmptyState />;

  const techniciansArr = toArr(technicians);

  const kpiData = {
    totalTechnicians: techniciansArr.length,
    activeTechnicians: techniciansArr.filter(t => t.is_active).length,
    maxWorkOrders: Math.max(...techniciansArr.map(t => t.max_work_orders)),
    currentWorkOrders: techniciansArr.reduce((acc, t) => acc + t.current_work_orders, 0)
  };

  return (
    <PageWrapper>
      <PageHeader title="Technician Roster" />
      <div className="grid grid-cols-4 gap-4">
        <SectionCard title="Total Technicians">
          {kpiData.totalTechnicians}
        </SectionCard>
        <SectionCard title="Active Technicians">
          {kpiData.activeTechnicians}
        </SectionCard>
        <SectionCard title="Max Work Orders">
          {kpiData.maxWorkOrders}
        </SectionCard>
        <SectionCard title="Current Work Orders">
          {kpiData.currentWorkOrders}
        </SectionCard>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <input type="text" placeholder="Search..." className="border border-slate-200 px-3 py-2 rounded" />
        <Button>Filter</Button>
      </div>
      <table className="w-full mt-4">
        <thead>
          <tr>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">ID</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Name</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Specializations</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Max Work Orders</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Current Work Orders</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Active Status</th>
          </tr>
        </thead>
        <tbody>
          {techniciansArr.map(t => (
            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-3 text-sm text-slate-700">{t.id}</td>
              <td className="py-3 px-3 text-sm text-slate-700">{t.name}</td>
              <td className="py-3 px-3 text-sm text-slate-700">{t.specializations.join(", ")}</td>
              <td className="py-3 px-3 text-sm text-slate-700">{t.max_work_orders}</td>
              <td className="py-3 px-3 text-sm text-slate-700">{t.current_work_orders}</td>
              <td className="py-3 px-3 text-sm text-slate-700">
                {t.is_active ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Active</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Inactive</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageWrapper>
  );
};

export default TechnicianSettingsPage;