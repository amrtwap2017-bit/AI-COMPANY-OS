// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { projectsApi } from "@/lib/api/enterprise";
import { PageHeader, LoadingState, EmptyState, AlertBanner, DataTable } from "@/components/ui";
import { PageWrapper } from "@/components/ui";
import { ActionBar } from "@/components/ui/ActionBar";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { fmtCurrency, fmtDate, getStatus } from "@/lib/design-tokens";
import { RefreshCw, Plus, HardHat, ChevronRight, AlertTriangle } from "lucide-react";

const STATUS_TABS = ["all","planning","active","in_progress","completed","on_hold"];

export default function ProjectsCenterPage() {
  const [statusTab, setStatusTab] = useState("all");

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["projects", statusTab],
    queryFn:  () => projectsApi.list(statusTab !== "all" ? { status: statusTab } : {}),
    refetchInterval: 60_000,
  });

  const { data: dashData } = useQuery({
    queryKey: ["projects-dashboard"],
    queryFn:  () => projectsApi.dashboard(),
  });

  const projects: any[] = Array.isArray(data?.data) ? data.data : [];
  const dash = dashData?.data || {};
  const { query, setQuery, filtered } = useSearch(projects, ["title","description","status"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, 15);

  const columns = [
    { key:"title", label:"Project",
      render:(row:any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <Link href={"/projects-center/" + row.id}
              className="font-semibold text-sm text-slate-900 hover:text-amber-700">{row.title}</Link>
            <p className="text-xs text-slate-400">{fmtDate(row.start_date)} → {fmtDate(row.end_date)}</p>
          </div>
        </div>
      )},
    { key:"budget", label:"Budget",
      render:(row:any) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">{fmtCurrency(row.budget || 0)}</p>
          <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1">
            <div className="h-full bg-amber-500 rounded-full" style={{width: (row.completion_pct || 0) + "%"}} />
          </div>
        </div>
      )},
    { key:"completion_pct", label:"Progress",
      render:(row:any) => (
        <span className="text-sm font-bold text-slate-900">{row.completion_pct || 0}%</span>
      )},
    { key:"status", label:"Status",
      render:(row:any) => {
        const s = getStatus(row.status);
        return <span className={"text-xs px-2.5 py-0.5 rounded-full font-semibold " + s.bg + " " + s.text}>{row.status}</span>;
      }},
    { key:"action", label:"",
      render:(row:any) => (
        <Link href={"/projects-center/" + row.id}
          className="inline-flex items-center gap-1 text-xs text-amber-700 hover:bg-amber-50 px-2 py-1 rounded-lg">
          View <ChevronRight className="w-3 h-3" />
        </Link>
      )},
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Projects Center"
        subtitle={projects.length + " projects tracked"}
        badge="PROJ"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} disabled={isFetching}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
            </button>
          </div>
        } />

      {/* Dashboard KPIs */}
      {dash.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[{label:"Total",value:dash.total,color:"slate"},{label:"Active",value:dash.active,color:"emerald"},{label:"Completed",value:dash.completed,color:"blue"},{label:"At Risk",value:dash.at_risk_count,color:dash.at_risk_count>0?"red":"slate"}].map(k => (
            <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className={"text-2xl font-bold " + (k.color==="red"&&k.value>0?"text-red-600":k.color==="emerald"?"text-emerald-600":"text-slate-900")}>{k.value ?? 0}</div>
              <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed"} />}

      {/* Status filter */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setStatusTab(s)}
            className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-all " + (statusTab === s ? "bg-amber-600 text-white" : "text-slate-500 hover:bg-slate-100")}>
            {s === "all" ? "All" : s.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}
          </button>
        ))}
      </div>

      <ActionBar
        search={{ value: query, onChange: setQuery, placeholder: "Search projects..." }}
        resultCount={filtered.length} totalCount={projects.length} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? <LoadingState type="table" rows={5} /> :
         items.length === 0 ? (
          <EmptyState icon="🏗️" title="No projects yet"
            description="Projects will appear here once created" />
         ) : <DataTable columns={columns} data={items} />}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage} />
    </PageWrapper>
  );
}
