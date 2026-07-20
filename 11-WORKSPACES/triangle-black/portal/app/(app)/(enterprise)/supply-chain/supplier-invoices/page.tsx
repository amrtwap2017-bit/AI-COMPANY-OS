// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { scApi } from "@/lib/supply-chain-api";
import { PageHeader, Button, DataTable, SearchInput, LoadingState, EmptyState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { fmtDate, fmtCurrency, getStatus } from "@/lib/design-tokens";
import Link from "next/link";
import { RefreshCw, Plus, ChevronRight, FileText, AlertCircle, CheckCircle } from "lucide-react";

export default function SupplierInvoicesPage() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const LIMIT = 25;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["supplier-invoices", page],
    queryFn: () => Promise.resolve({ data: { items: [
      { id: "1", invoice_number: "INV-8821", supplier: "Marble Egypt Co.", po_number: "PO-2026-099", grn_number: "GRN-2026-044", invoice_date: "2026-07-14", due_date: "2026-08-13", total_amount: 45000, status: "pending_match", discrepancy: true },
      { id: "2", invoice_number: "INV-8815", supplier: "Paint & Finishes Ltd.", po_number: "PO-2026-092", grn_number: "GRN-2026-040", invoice_date: "2026-07-01", due_date: "2026-07-31", total_amount: 8200, status: "approved", discrepancy: false },
      { id: "3", invoice_number: "INV-8802", supplier: "Carrier HVAC Parts", po_number: "PO-2026-090", grn_number: "GRN-2026-042", invoice_date: "2026-06-20", due_date: "2026-07-20", total_amount: 12500, status: "paid", discrepancy: false }
    ], total: 3 } }),
    staleTime: 30_000,
  });

  const all = Array.isArray(data?.data) ? data.data : data?.data?.items || data?.data?.data || [];
  const total = typeof data?.data?.total === 'number' ? data.data.total : all.length;
  const filtered = all.filter(r => (tab === "all" || r.status === tab) && (!search || r.invoice_number?.toLowerCase().includes(search.toLowerCase()) || r.supplier?.toLowerCase().includes(search.toLowerCase())));
  const statuses = ["all", "pending_match", "disputed", "approved", "paid"];
  const counts = statuses.reduce((a, t) => { a[t] = t === "all" ? all.length : all.filter(r => r.status === t).length; return a; }, {});

  const columns = [
    { key: "invoice_number", label: "Invoice Number", render: (row) => (
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-amber-700 font-semibold">{row.invoice_number}</span>
        {row.discrepancy && <AlertCircle className="w-4 h-4 text-red-500" title="Discrepancy Detected" />}
      </div>
    )},
    { key: "supplier", label: "Supplier", render: (row) => <div className="font-semibold text-slate-900 text-sm">{row.supplier}</div> },
    { key: "po_number", label: "Ref: PO / GRN", render: (row) => (
      <div className="text-xs text-slate-500">
        <div className="font-mono">{row.po_number}</div>
        <div className="font-mono text-slate-400">{row.grn_number}</div>
      </div>
    )},
    { key: "total_amount", label: "Invoice Amount", render: (row) => <span className="text-sm font-bold text-slate-900">{fmtCurrency(row.total_amount)}</span> },
    { key: "due_date", label: "Due Date", render: (row) => <span className="text-xs text-slate-600">{fmtDate(row.due_date)}</span> },
    { key: "status", label: "Status", render: (row) => {
      const s = getStatus(row.status);
      return <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${s.bg} ${s.text} border ${s.border}`}>{(row.status || "").replace("_", " ")}</span>;
    }},
    { key: "actions", label: "", render: (row) => (
      <Link href={`/supply-chain/supplier-invoices/${row.id}`} className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700">
        {row.status === 'pending_match' ? 'Match' : 'View'} <ChevronRight className="w-3.5 h-3.5"/>
      </Link>
    )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb/>
      <PageHeader title="Supplier Invoices" subtitle={`${total} invoices tracked · 3-Way Matching`} badge="INV"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching?"animate-spin":""}`} />} onClick={()=>refetch()}>Refresh</Button>
            <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>Manual Invoice Entry</Button>
          </div>
        } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Pending Match", val:counts.pending_match??0, bg:"bg-amber-50", border:"border-amber-200", txt:"text-amber-700"},
          {label:"Disputed", val:counts.disputed??0, bg:"bg-red-50", border:"border-red-200", txt:"text-red-700"},
          {label:"Approved for Payment", val:counts.approved??0, bg:"bg-blue-50", border:"border-blue-200", txt:"text-blue-700"},
          {label:"Total Payable", val:fmtCurrency(all.filter(r => r.status === 'approved' || r.status === 'pending_match').reduce((sum, r) => sum + (r.total_amount||0), 0)), bg:"bg-slate-50", border:"border-slate-200", txt:"text-slate-900"},
        ].map(k=>(
          <div key={k.label} className={`rounded-2xl border ${k.border} ${k.bg} p-4`}>
            <div className={`text-2xl font-bold ${k.txt}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wide">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1 flex-wrap">
          {statuses.map(t=>(
            <button key={t} onClick={()=>{setTab(t);setPage(0);}}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab===t?"bg-amber-600 text-white shadow-sm":"text-slate-500 hover:bg-slate-100"}`}>
              {t==="all"?"All":t.replace("_"," ").charAt(0).toUpperCase()+t.replace("_"," ").slice(1)}
              {counts[t]>0&&<span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${tab===t?"bg-amber-700 text-white":"bg-slate-200 text-slate-600"}`}>{counts[t]}</span>}
            </button>
          ))}
        </div>
        <SearchInput placeholder="Search invoice, supplier, or PO..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full lg:w-64" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? <LoadingState type="table" rows={8}/> : filtered.length===0 ? <EmptyState icon="" title="No invoices found" /> : (
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
