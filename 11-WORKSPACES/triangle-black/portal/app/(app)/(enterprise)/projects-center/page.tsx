// @ts-nocheck
"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Button, DataTable, SearchInput } from "@/components/ui";
import { fmtCurrency, fmtDate, getStatus } from "@/lib/design-tokens";
import { RefreshCw, Plus, ChevronRight, HardHat, Building2, FileText, Wrench, DollarSign } from "lucide-react";

export default function ProjectsCenterPage() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: () => Promise.resolve({ data: { items: [
      { id: "p1", name: "Grand Cairo Hotel - Lobby Renovation", client: "Grand Cairo Hotel", type: "Fit-out", budget: 450000, spent: 210000, progress: 65, status: "in_progress", start_date: "2026-05-01", end_date: "2026-09-30" },
      { id: "p2", name: "Sharm Resort - MEP Overhaul Phase 2", client: "Triangle Black Resort", type: "MEP", budget: 1200000, spent: 850000, progress: 40, status: "in_progress", start_date: "2026-06-15", end_date: "2027-02-28" },
      { id: "p3", name: "Alexandria Inn - Annual Maintenance Contract", client: "Alexandria Sea View Inn", type: "Maintenance SLA", budget: 180000, spent: 90000, progress: 50, status: "active", start_date: "2026-01-01", end_date: "2026-12-31" }
    ] } }),
  });

  const all = Array.isArray(data?.data) ? data.data : data?.data?.items || [];
  const total = typeof data?.data?.total === 'number' ? data.data.total : all.length;
  const filtered = all.filter(r => (tab === "all" || r.status === tab) && (!search || r.name.toLowerCase().includes(search.toLowerCase()) || r.client.toLowerCase().includes(search.toLowerCase())));
  const statuses = ["all", "in_progress", "active", "completed", "on_hold"];
  const counts = statuses.reduce((a: any, t: string) => { a[t] = t === "all" ? all.length : all.filter((r: any) => r.status === t).length; return a; }, {});

  const columns = [
    { key: "name", label: "Project / Contract Name", render: (row: any) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
          <HardHat className="w-5 h-5" />
        </div>
        <div>
          <Link href={`/projects-center/${row.id}`} className="font-semibold text-slate-900 text-sm hover:text-amber-600 transition-colors">{row.name}</Link>
          <div className="text-xs text-slate-500 flex items-center gap-1"><Building2 className="w-3 h-3" /> {row.client}</div>
        </div>
      </div>
    )},
    { key: "type", label: "Type", render: (row: any) => <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">{row.type}</span> },
    { key: "financials", label: "Budget vs Spent", render: (row: any) => (
      <div>
        <div className="text-xs font-semibold text-slate-900">{fmtCurrency(row.spent)} <span className="text-slate-400 font-normal">/ {fmtCurrency(row.budget)}</span></div>
        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-amber-500" style={{ width: `${(row.spent / row.budget) * 100}%` }}></div>
        </div>
      </div>
    )},
    { key: "progress", label: "Completion", render: (row: any) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500" style={{ width: `${row.progress}%` }}></div>
        </div>
        <span className="text-xs font-semibold text-slate-700">{row.progress}%</span>
      </div>
    )},
    { key: "status", label: "Status", render: (row: any) => {
      const s = getStatus(row.status);
      return <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${s.bg} ${s.text} border ${s.border}`}>{row.status.replace("_", " ")}</span>;
    }},
    { key: "actions", label: "Connected Modules", render: (row: any) => (
      <div className="flex flex-col gap-1">
        <Link href={`/commercial/invoices`} className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md w-fit">
          <DollarSign className="w-3 h-3" /> Invoices
        </Link>
        <Link href={`/operations/work-orders`} className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md w-fit">
          <Wrench className="w-3 h-3" /> Work Orders
        </Link>
      </div>
    )}
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Projects & Contracts" subtitle={`${total} active engagements · Engineering Partner`} badge="PRJ"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading?"animate-spin":""}`} />} onClick={()=>refetch()}>Refresh</Button>
            <Link href="/projects-center/new">
              <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>New Project / Bid</Button>
            </Link>
          </div>
        } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Active Projects", val:counts.in_progress + counts.active, bg:"bg-slate-50", border:"border-slate-200", txt:"text-slate-900"},
          {label:"Total Contract Value", val:fmtCurrency(all.reduce((sum: number, r: any) => sum + (r.budget||0), 0)), bg:"bg-emerald-50", border:"border-emerald-200", txt:"text-emerald-700"},
          {label:"Pending Approvals", val:"4", bg:"bg-amber-50", border:"border-amber-200", txt:"text-amber-700"},
          {label:"Overdue Milestones", val:"2", bg:"bg-red-50", border:"border-red-200", txt:"text-red-700"},
        ].map((k: any, i: number) => (
          <div key={i} className={`rounded-2xl border ${k.border} ${k.bg} p-4`}>
            <div className={`text-2xl font-bold ${k.txt}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wide">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {statuses.map((t: string) => (
              <button key={t} onClick={()=>{setTab(t);}} className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${tab===t?"bg-amber-600 text-white shadow-sm":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {t==="all"?"All":t.replace("_"," ")}
                {counts[t]>0 && <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${tab===t?"bg-amber-700 text-white":"bg-slate-200 text-slate-600"}`}>{counts[t]}</span>}
              </button>
            ))}
          </div>
          <SearchInput placeholder="Search projects or clients..." value={search} onChange={e=>setSearch(e.target.value)} className="lg:w-64" />
        </div>
        <DataTable columns={columns} data={filtered} />
      </div>
    </div>
  );
}
