// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState, Progress } from "@/components/ui";
import { useState } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || d?.technicians || d?.work_orders || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

const fetchTechnicians = async () => {
  const r = await authFetch(`/api/v1/technicians/`);
  return r.json();
};
const fetchWorkOrders = async () => {
  const r = await authFetch(`/api/v1/work-orders/?status=open&limit=100`);
  return r.json();
};

const DispatchPage = () => {
  const [dispatchResults, setDispatchResults] = useState<{[key:string]:any}>({});
  const { data: techData, isLoading: techLoading } = useQuery(["dispatch-techs"], fetchTechnicians, { refetchInterval: 60000 });
  const technicians: any[] = toArr(techData);
const items: any[] = toArr(techData);
  const { data: woData, isLoading: woLoading } = useQuery(["dispatch-wos"], fetchWorkOrders, { refetchInterval: 60000 });

  if (techLoading || woLoading) return <LoadingState />;

  const techs = toArr(techData);
  const wos = toArr(woData);
  const availableTechs = techs.filter((t:any) => (t.current_work_orders||0) < (t.max_work_orders||5)).length;
  const openWOs = wos.filter((wo:any) => !wo.technician_id).length;
  const needingDispatch = wos.filter((wo:any) => !wo.technician_id && (wo.priority==='critical'||wo.priority==='high')).length;

  return (
    <PageWrapper>
      <PageHeader title="AI Crew Planning & Dispatch" subtitle="Assign technicians to open work orders" />
      <MetricStrip metrics={[
        { label: "Available Techs", value: availableTechs },
        { label: "Open WOs", value: openWOs },
        { label: "Need Dispatch", value: needingDispatch },
        { label: "AI Recommendations", value: Object.keys(dispatchResults).length },
      ]} />
      <div className="grid grid-cols-2 gap-4 mt-4">
        <SectionCard title="Technician Capacity">
          {techs.length === 0 ? <EmptyState /> : (
            <div className="space-y-3">
              {techs.slice(0,10).map((tech:any) => (
                <div key={tech.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-slate-800">{tech.name}</p>
                    <p className="text-xs text-slate-500">{tech.specialization || tech.role || "Technician"}</p>
                  </div>
                  <StatusBadge status={tech.status || "active"} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
        <SectionCard title="Open WOs Needing Assignment">
          {wos.filter((wo:any) => !wo.technician_id).length === 0 ? <EmptyState /> : (
            <div className="space-y-3">
              {wos.filter((wo:any) => !wo.technician_id).slice(0,10).map((wo:any) => (
                <div key={wo.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-slate-800">{wo.title}</p>
                    <p className="text-xs text-slate-500">{wo.location || wo.hotel_id}</p>
                  </div>
                  <StatusBadge status={wo.priority || "medium"} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </PageWrapper>
  );
};
export default DispatchPage;
