// @ts-nocheck
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scApi, extractList, extractCount } from "@/lib/supply-chain-api";
import { exportToCSV } from "@/lib/csv-utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { fmtDate } from "@/lib/design-tokens";
import Link from "next/link";
import { FileSearch, RefreshCw, Download, Plus, ChevronRight, X } from "lucide-react";

const STATUS_CONFIG: Record<string,string> = {
  draft:    "bg-slate-100 text-slate-600 border border-slate-200",
  open:     "bg-blue-50 text-blue-700 border border-blue-200",
  sent:     "bg-indigo-50 text-indigo-700 border border-indigo-200",
  received: "bg-amber-50 text-amber-700 border border-amber-200",
  evaluated:"bg-purple-50 text-purple-700 border border-purple-200",
  awarded:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled:"bg-red-50 text-red-700 border border-red-200",
};

export default function RFQsPage() {
  const qc = useQueryClient();
  const [tab, setTab]       = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title:"", category:"HVAC", description:"" });
  const LIMIT = 25;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["rfqs", page],
    queryFn:  () => scApi.rfqs.list(page * LIMIT, LIMIT),
    staleTime: 30_000,
  });

  const all   = extractList(data?.data);
  const total = extractCount(data?.data);

  const filtered = all.filter(r =>
    (tab === "all" || r.status === tab) &&
    (!search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.rfq_number?.toLowerCase().includes(search.toLowerCase()))
  );

  const statuses = ["all","draft","open","sent","received","evaluated","awarded","cancelled"];
  const counts = statuses.reduce<Record<string,number>>((a,t) => {
    a[t] = t==="all" ? all.length : all.filter(r=>r.status===t).length;
    return a;
  }, {});

  const createMut = useMutation({
    mutationFn: (body:any) => scApi.rfqs.create({ ...body, lines:[] }),
    onSuccess: () => { qc.invalidateQueries({queryKey:["rfqs"]}); setShowCreate(false); setForm({title:"",category:"HVAC",description:""}); },
  });

  function handleExport() {
    exportToCSV(`rfqs-${new Date().toISOString().slice(0,10)}.csv`, all.map(r=>({
      rfq_number:r.rfq_number, title:r.title, category:r.category??"",
      status:r.status, due_date:r.due_date??"", created_at:r.created_at,
    })));
  }

  const columns = [
    { key: "rfq_number", label: "RFQ Number", render: (row: any) => <span className="font-mono text-xs text-amber-700 font-semibold">{row.rfq_number}</span> },
    { key: "title", label: "Title", render: (row: any) => <div className="font-semibold text-slate-900 text-sm">{row.title}</div> },
    { key: "category", label: "Category", render: (row: any) => <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">{row.category??"-"}</span> },
    { key: "status", label: "Status", render: (row: any) => <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${STATUS_CONFIG[row.status]??""}`}>{row.status}</span> },
    { key: "due_date", label: "Due Date", render: (row: any) => row.due_date ? <span className="text-xs text-slate-600">{fmtDate(row.due_date)}</span> : <span className="text-xs text-amber-600 font-medium">Not set</span> },
    { key: "created_at", label: "Created", render: (row: any) => <span className="text-xs text-slate-500">{fmtDate(row.created_at)}</span> },
    { key: "actions", label: "", render: (row: any) => (
      <Link href={`/supply-chain/rfqs/${row.id}`} className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
        Open <ChevronRight className="w-3.5 h-3.5"/>
      </Link>
    )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb/>
      <PageHeader title="RFQs & Sourcing" subtitle={`${total} requests for quotation · Supply Chain`} badge="RFQ"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching?"animate-spin":""}`} />} onClick={()=>refetch()}>Refresh</Button>
            <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handleExport}>Export CSV</Button>
            <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={()=>setShowCreate(true)}>New RFQ</Button>
          </div>
        } />

      {showCreate && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Create New RFQ</h3>
            <button onClick={()=>setShowCreate(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors"><X className="w-4 h-4 text-slate-400"/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title *</label>
              <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                placeholder="e.g. HVAC Filters Q3 2026" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</label>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all bg-white">
                {["HVAC","Electrical","Plumbing","Mechanical","Civil","Chemical","Fuel","General","IT","Security"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</label>
              <input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                placeholder="Brief scope description" />
            </div>
          </div>
          <div className="flex gap-2 pt-4 border-t border-slate-100">
            <Button variant="primary" size="sm" disabled={!form.title||createMut.isPending}
              onClick={()=>createMut.mutate(form)}>{createMut.isPending?"Creating…":"Create RFQ"}</Button>
            <Button variant="secondary" size="sm" onClick={()=>setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Total RFQs",   val:total,              bg:"bg-slate-50",   border:"border-slate-200",  txt:"text-slate-900"},
          {label:"Open",    val:counts.open??0,      bg:"bg-blue-50",    border:"border-blue-200",   txt:"text-blue-700"},
          {label:"Received",val:counts.received??0,  bg:"bg-amber-50",   border:"border-amber-200",  txt:"text-amber-700"},
          {label:"Awarded", val:counts.awarded??0,   bg:"bg-emerald-50", border:"border-emerald-200",txt:"text-emerald-700"},
        ].map(k=>(
          <div key={k.label} className={`rounded-2xl border ${k.border} ${k.bg} p-4 transition-all hover:shadow-sm`}>
            <div className={`text-2xl font-bold ${k.txt}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wide">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1 flex-wrap">
          {statuses.map(t=>(
            <button key={t} onClick={()=>{setTab(t);setPage(0);}}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab===t?"bg-amber-600 text-white shadow-sm":"text-slate-500 hover:bg-slate-100"}`}>
              {t==="all"?"All":t.charAt(0).toUpperCase()+t.slice(1)}
              {counts[t]>0&&<span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${tab===t?"bg-amber-700 text-white":"bg-slate-200 text-slate-600"}`}>{counts[t]}</span>}
            </button>
          ))}
        </div>
        <SearchInput placeholder="Search RFQs by title or number…" value={search} onChange={e=>setSearch(e.target.value)} className="w-full lg:w-64" />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? <LoadingState type="table" rows={8}/> : filtered.length===0 ? (
          <EmptyState icon="🔍" title="No RFQs found" description="Create an RFQ to invite supplier quotations" />
        ) : (
          <>
            <DataTable columns={columns} data={filtered} />
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
              <div className="text-xs text-slate-500">Showing {filtered.length} of {total}</div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="xs" onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}>Previous</Button>
                <span className="text-xs text-slate-500 font-medium">Page {page+1}</span>
                <Button variant="secondary" size="xs" onClick={()=>setPage(p=>p+1)} disabled={all.length<LIMIT}>Next</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
