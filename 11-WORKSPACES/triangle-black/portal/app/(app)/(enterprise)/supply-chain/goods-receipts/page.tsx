// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { scApi } from "@/lib/supply-chain-api";
import { PageHeader, Button, DataTable, SearchInput, LoadingState, EmptyState } from "@/components/ui";
import { fmtDate, getStatus } from "@/lib/design-tokens";
import Link from "next/link";
import { RefreshCw, Plus, ChevronRight, Truck, Warehouse, MapPin } from "lucide-react";

export default function GoodsReceiptsPage() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const LIMIT = 25;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["grns", page],
    queryFn: () => scApi.goodsReceipts ? scApi.goodsReceipts.list(page * LIMIT, LIMIT) : Promise.resolve({ data: { items: [
      { id: "1", grn_number: "GRN-2026-044", po_number: "PO-2026-098", supplier: "Italian Tile Imports", receiving_location: "Grand Cairo Site", type: "Client Site", expected_date: "2026-07-16", status: "pending", items_count: 12 },
      { id: "2", grn_number: "GRN-2026-043", po_number: "PO-2026-095", supplier: "Copper Cable Suppliers", receiving_location: "Main Warehouse (Cairo)", type: "Warehouse", expected_date: "2026-07-15", status: "partial", items_count: 5 },
      { id: "3", grn_number: "GRN-2026-042", po_number: "PO-2026-090", supplier: "Carrier HVAC Parts", receiving_location: "Sharm Resort Site Store", type: "Client Site", expected_date: "2026-07-10", status: "completed", items_count: 2 }
    ], total: 3 } }),
    staleTime: 30_000,
  });

  const all = Array.isArray(data?.data) ? data.data : data?.data?.items || data?.data?.data || [];
  const total = typeof data?.data?.total === 'number' ? data.data.total : all.length;
  const filtered = all.filter(r => (tab === "all" || r.status === tab) && (!search || r.grn_number?.toLowerCase().includes(search.toLowerCase()) || r.supplier?.toLowerCase().includes(search.toLowerCase())));
  const statuses = ["all", "pending", "partial", "completed", "rejected"];
  const counts = statuses.reduce((a, t) => { a[t] = t === "all" ? all.length : all.filter(r => r.status === t).length; return a; }, {});

  const columns = [
    { key: "grn_number", label: "GRN Number", render: (row) => <span className="font-mono text-xs text-amber-700 font-semibold">{row.grn_number}</span> },
    { key: "supplier", label: "Supplier", render: (row) => (
      <div>
        <div className="font-semibold text-slate-900 text-sm">{row.supplier}</div>
        <div className="text-xs text-slate-500 font-mono">Ref: {row.po_number}</div>
      </div>
    )},
    { key: "receiving_location", label: "Receiving Location", render: (row) => (
      <div className="flex items-center gap-2 text-xs text-slate-600">
        {row.type === 'Warehouse' ? <Warehouse className="w-3.5 h-3.5 text-slate-400" /> : <MapPin className="w-3.5 h-3.5 text-blue-500" />}
        <div>
          <div className="font-medium text-slate-900">{row.receiving_location}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wide">{row.type}</div>
        </div>
      </div>
    )},
    { key: "expected_date", label: "Expected / Received", render: (row) => <span className="text-xs text-slate-500">{fmtDate(row.expected_date)}</span> },
    { key: "status", label: "Status", render: (row) => {
      const s = getStatus(row.status);
      return <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${s.bg} ${s.text} border ${s.border}`}>{row.status}</span>;
    }},
    { key: "actions", label: "", render: (row) => (
      <Link href={`/supply-chain/goods-receipts/${row.id}`} className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700">
        {row.status === 'pending' ? 'Receive' : 'View'} <ChevronRight className="w-3.5 h-3.5"/>
      </Link>
    )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Goods Receipts (GRN)" subtitle={`${total} delivery notes tracked`} badge="GRN"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching?"animate-spin":""}`} />} onClick={()=>refetch()}>Refresh</Button>
            <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>Manual GRN Entry</Button>
          </div>
        } />

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
        <SearchInput placeholder="Search GRN, PO, or supplier..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full lg:w-64" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? <LoadingState type="table" rows={8}/> : filtered.length===0 ? <EmptyState icon="🚚" title="No goods receipts found" /> : (
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
