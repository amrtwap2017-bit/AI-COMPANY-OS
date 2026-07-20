// @ts-nocheck
"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Button, DataTable } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { fmtCurrency, fmtDate } from "@/lib/design-tokens";
import { RefreshCw, Plus, ChevronRight, TrendingUp, Users, FileText } from "lucide-react";

export default function PipelinePage() {
  const [stage, setStage] = useState("all");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["pipeline"],
    queryFn: () => Promise.resolve({ data: { items: [
      { id: "1", company: "Grand Cairo Hotel", contact: "Ahmed Hassan", contact_id: "c1", stage: "proposal", value: 450000, probability: 60, expected_close: "2026-08-15", project_type: "Lobby Renovation" },
      { id: "2", company: "Sharm Resort & Spa", contact: "Fatima Ali", contact_id: "c2", stage: "negotiation", value: 1200000, probability: 80, expected_close: "2026-07-30", project_type: "MEP Overhaul Phase 2" },
      { id: "3", company: "Alexandria Inn", contact: "Mohamed Ibrahim", contact_id: "c3", stage: "qualification", value: 180000, probability: 30, expected_close: "2026-09-10", project_type: "Annual Maintenance SLA" },
      { id: "4", company: "Cairo Business Center", contact: "Laila Mahmoud", contact_id: "c4", stage: "discovery", value: 320000, probability: 20, expected_close: "2026-10-01", project_type: "Generator Installation" }
    ] } }),
  });

  const items = Array.isArray(data?.data) ? data.data : data?.data?.items || [];
  const filtered = stage === "all" ? items : items.filter(i => i.stage === stage);
  
  const stages = [
    { key: "all", label: "All Opportunities", count: items.length },
    { key: "discovery", label: "Discovery", count: items.filter(i => i.stage === 'discovery').length },
    { key: "qualification", label: "Qualification", count: items.filter(i => i.stage === 'qualification').length },
    { key: "proposal", label: "Proposal", count: items.filter(i => i.stage === 'proposal').length },
    { key: "negotiation", label: "Negotiation", count: items.filter(i => i.stage === 'negotiation').length }
  ];

  const columns = [
    { key: "company", label: "Company / Contact", render: (row: any) => (
      <div>
        <Link href="/commercial/customers" className="font-semibold text-slate-900 text-sm hover:text-amber-600 transition-colors">{row.company}</Link>
        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
          <Users className="w-3 h-3" /> {row.contact}
        </div>
      </div>
    )},
    { key: "project_type", label: "Expected Project", render: (row: any) => (
      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">{row.project_type}</span>
    )},
    { key: "value", label: "Deal Value", render: (row: any) => <span className="font-bold text-slate-900">{fmtCurrency(row.value)}</span> },
    { key: "probability", label: "Probability", render: (row: any) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500" style={{ width: `${row.probability}%` }}></div>
        </div>
        <span className="text-xs font-medium text-slate-700">{row.probability}%</span>
      </div>
    )},
    { key: "expected_close", label: "Expected Close", render: (row: any) => <span className="text-xs text-slate-600">{fmtDate(row.expected_close)}</span> },
    { key: "actions", label: "", render: (row: any) => (
      <div className="flex items-center gap-1">
        <Link href={`/commercial/proposals`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors" title="View Proposals">
          <FileText className="w-4 h-4" />
        </Link>
        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition-colors" title="Edit Deal">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )}
  ];

  const totalPipelineValue = items.reduce((sum: number, i: any) => sum + i.value, 0);
  const weightedValue = items.reduce((sum: number, i: any) => sum + (i.value * (i.probability / 100)), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb/>
      <PageHeader title="Sales Pipeline" subtitle="Track opportunities from lead to closed project" badge="PIPE"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={()=>refetch()}>Refresh</Button>
            <Link href="/commercial/leads/new">
              <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>Add Opportunity</Button>
            </Link>
          </div>
        } 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Pipeline Value</div>
          <div className="text-2xl font-bold text-slate-900">{fmtCurrency(totalPipelineValue)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Weighted Value</div>
          <div className="text-2xl font-bold text-emerald-600">{fmtCurrency(weightedValue)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Active Opportunities</div>
          <div className="text-2xl font-bold text-slate-900">{items.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
          {stages.map(s => (
            <button
              key={s.key}
              onClick={() => setStage(s.key)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                stage === s.key ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label} ({s.count})
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={filtered} />
      </div>
    </div>
  );
}
