// @ts-nocheck
"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, DataTable, LoadingState, EmptyState, AlertBanner, SearchInput } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";

export default function InventoryPage() {
  const { data=[], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await fetch("/api/v1/inventory");
      if (!res.ok) return [];
      const d = await res.json();
      return Array.isArray(d) ? d : d?.items || d?.data || [];
    },
    staleTime: 30_000,
  });
  const { query, setQuery, filtered } = useSearch(data, ["name","sku","category"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, 25);
  const lowStock = useMemo(()=>data.filter((i:any)=>(i.quantity||0)<(i.min_quantity||5)).length,[data]);
  const columns = [
    { key:"name",     label:"Item",
      render:(row:any)=>(<div><p className="font-semibold text-sm">{row.name}</p><p className="text-xs text-slate-500">{row.sku||"—"}</p></div>)},
    { key:"category", label:"Category",
      render:(row:any)=>(<span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{row.category||"—"}</span>)},
    { key:"quantity", label:"Quantity",
      render:(row:any)=>{
        const qty=(row.quantity||0), min=(row.min_quantity||5);
        return <span className={`text-sm font-bold ${qty<min?"text-red-600":"text-emerald-600"}`}>{qty}</span>}},
    { key:"unit", label:"Unit",     render:(row:any)=>(<span className="text-xs text-slate-500">{row.unit||"pc"}</span>)},
    { key:"location", label:"Location",render:(row:any)=>(<span className="text-xs">{row.location||row.warehouse||"—"}</span>)},
  ];
  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Inventory" subtitle={`${data.length} items tracked`} badge="INV"
        actions={<button onClick={()=>refetch()} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">↺</button>}/>
      {lowStock>0&&(<div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">⚠️ {lowStock} item(s) below minimum stock level</div>)}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <SearchInput value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search inventory..." className="w-full sm:w-72"/>
      </div>
      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         items.length===0?<EmptyState icon="📦" title="No inventory" description="No inventory items found"/>:
         <DataTable columns={columns} data={items}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </div>
  );
}
