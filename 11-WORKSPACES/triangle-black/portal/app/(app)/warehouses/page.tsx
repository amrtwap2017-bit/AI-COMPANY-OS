// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, DataTable, LoadingState, EmptyState, AlertBanner } from "@/components/ui"
import { PageWrapper } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { Warehouse } from "lucide-react";

export default function WarehousesPage() {
  const { data=[], isLoading, isError, error } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await fetch("/api/v1/warehouses");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60_000,
  });
  const { page, totalPages, items, goToPage } = usePagination(
    Array.isArray(data) ? data : data?.items || data?.data || [], 20
  );
  const columns = [
    { key:"name",     label:"Warehouse",  render:(row:any)=>(<p className="font-semibold text-sm">{row.name||row.code||"—"}</p>)},
    { key:"location", label:"Location",   render:(row:any)=>(<span className="text-sm text-slate-600">{row.location||row.address||"—"}</span>)},
    { key:"capacity", label:"Capacity",   render:(row:any)=>(<span className="text-sm">{row.capacity||"—"}</span>)},
    { key:"items",    label:"Items",      render:(row:any)=>(<span className="text-sm font-semibold">{row.item_count||row.items||0}</span>)},
  ];
  return (
    <PageWrapper>
      <PageHeader title="Warehouses" subtitle={`${data.length||0} warehouses`} badge="WH"/>
      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={5}/>:
         items.length===0?<EmptyState icon="🏭" title="No warehouses" description="No warehouses configured"/>:
         <DataTable columns={columns} data={items}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}
