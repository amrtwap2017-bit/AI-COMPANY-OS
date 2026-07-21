// @ts-nocheck
"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, DataTable, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { RefreshCw, Download, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function InventoryPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["inventory-full"],
    queryFn:  () => authFetchJSON("/api/v1/actions/inventory/dashboard"),
    staleTime: 30_000,
  });

  const { data: lowStock = [] } = useQuery({
    queryKey: ["inventory-low"],
    queryFn:  () => authFetchJSON("/api/v1/actions/inventory/low-stock"),
    staleTime: 60_000,
  });

  const { data: items_data = [] } = useQuery({
    queryKey: ["inventory-items"],
    queryFn:  () => authFetchJSON("/api/v1/inventory/items"),
    staleTime: 30_000,
  });

  const d = data || {};
  const items = Array.isArray(items_data) ? items_data : items_data?.items || items_data?.data || [];
  const lowList = Array.isArray(lowStock) ? lowStock : lowStock?.items || lowStock?.data || [];

  const { query, setQuery, filtered } = useSearch(items, ["name","category","sku","description"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 25);

  const kpis = useMemo(()=>({
    items:      d.items || items.length,
    warehouses: d.warehouses || 0,
    vendors:    d.vendors || 0,
    lowStock:   Array.isArray(lowList) ? lowList.length : d.low_stock_count || 0,
  }),[d, items, lowList]);

  function exportCSV() {
    const h = ["Name","Category","SKU","Quantity","Unit","Location","Status"];
    const r = filtered.map((i:any)=>[i.name||"",i.category||"",i.sku||"",i.quantity||0,i.unit||"",i.location||"",i.status||""]);
    const csv = [h,...r].map(row=>row.map(v=>'"'+String(v)+'"').join(",")).join("
");
    const blob = new window.Blob([csv],{type:"text/csv"});
    const url = window.URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href=url; a.download="inventory.csv"; a.click();
    window.URL.revokeObjectURL(url);
  }

  const columns = [
    { key:"name", label:"Item",
      render:(r:any)=>(
        <div>
          <p className="font-semibold text-sm text-slate-900">{r.name}</p>
          <p className="text-xs text-slate-400">{r.sku||"—"}</p>
        </div>
      )},
    { key:"category", label:"Category",
      render:(r:any)=><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg">{r.category||"—"}</span> },
    { key:"quantity", label:"Quantity",
      render:(r:any)=>{
        const qty=r.quantity||r.stock_quantity||0;
        const min=r.minimum_quantity||r.min_quantity||5;
        return <span className={`text-sm font-bold ${qty<min?"text-red-600":qty<min*2?"text-amber-600":"text-emerald-600"}`}>{qty}</span>;
      }},
    { key:"unit",   label:"Unit",     render:(r:any)=><span className="text-xs text-slate-500">{r.unit||"pc"}</span> },
    { key:"location",label:"Location", render:(r:any)=><span className="text-xs text-slate-500">{r.location||r.warehouse||"—"}</span> },
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Inventory" subtitle={`${kpis.items} items tracked`} badge="INV"
        actions={
          <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200">
              <Download className="w-4 h-4"/> Export
            </button>
            <button onClick={()=>refetch()} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/>
            </button>
          </div>
        }/>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label:"Total Items",   val:kpis.items,      color:"text-slate-900"},
          {label:"Warehouses",    val:kpis.warehouses,  color:"text-blue-700"},
          {label:"Vendors",       val:kpis.vendors,     color:"text-purple-700"},
          {label:"Low Stock",     val:kpis.lowStock,    color:kpis.lowStock>0?"text-red-600":"text-emerald-700"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className={`text-2xl font-bold ${k.color}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {kpis.lowStock > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0"/>
          <div>
            <p className="text-sm font-semibold text-amber-800">{kpis.lowStock} item(s) below minimum stock level</p>
            <p className="text-xs text-amber-600">Consider creating purchase requests for these items</p>
          </div>
          <Link href="/supply-chain/purchase-requests" className="ml-auto text-xs font-semibold text-amber-700 hover:underline">Create PR →</Link>
        </div>
      )}

      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name, category, SKU..."
          className="w-full max-w-sm border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"/>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         rows.length===0?<EmptyState icon="📦" title="No inventory" description="No items found"/>:
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>

      <div className="grid grid-cols-3 gap-3">
        {[
          {label:"All Items",        href:"/supply-chain/stock-balances"},
          {label:"Purchase Requests", href:"/supply-chain/purchase-requests"},
          {label:"Warehouses",        href:"/warehouses"},
        ].map(link=>(
          <Link key={link.href} href={link.href}
            className="bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-600 text-center hover:border-amber-300 hover:text-amber-700 transition-colors">
            {link.label}
          </Link>
        ))}
      </div>
    </PageWrapper>
  );
}
