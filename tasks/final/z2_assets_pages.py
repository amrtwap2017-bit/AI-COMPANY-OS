import os, json, datetime
LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/z2.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
r = {'created':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def write(path, content, label):
    os.makedirs(os.path.dirname(path),exist_ok=True)
    with open(path,'w') as f: f.write(content)
    log('  CREATED: '+label)
    r['created'].append(label)

log('Z2 START — Assets + Warehouses + Inventory UX')

# Assets page
assets_page = '''// @ts-nocheck
"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, DataTable, StatusPill, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Pagination } from "@/components/ui/Pagination";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { assetsApi } from "@/lib/api";
import { RefreshCw, Package, Search } from "lucide-react";

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const { data=[], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["assets"],
    queryFn: () => assetsApi.list({ limit: 200 }),
    staleTime: 30_000,
  });
  const { filtered } = useSearch(data, ["name","asset_type","location","serial_number"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, 20);
  const columns = [
    { key:"name", label:"Asset",
      render:(row:any)=>(
        <div>
          <p className="font-semibold text-sm text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.serial_number||"—"}</p>
        </div>)},
    { key:"asset_type", label:"Type",
      render:(row:any)=>(
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">{row.asset_type||"—"}</span>)},
    { key:"location", label:"Location",
      render:(row:any)=>(<span className="text-sm text-slate-600">{row.location||"—"}</span>)},
    { key:"status", label:"Status",
      render:(row:any)=>(<StatusPill status={row.status||"active"}/>)},
    { key:"model", label:"Model",
      render:(row:any)=>(<span className="text-xs text-slate-400">{row.model||row.manufacturer||"—"}</span>)},
  ];
  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Assets" subtitle={`${data.length} assets tracked`} badge="ASSET"
        actions={<button onClick={()=>refetch()} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/></button>}/>
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input value={search} onChange={e=>{setSearch(e.target.value)}}
            placeholder="Search assets..."
            className="w-full sm:w-80 pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm"/>
        </div>
      </div>
      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         items.length===0?<EmptyState icon="📦" title="No assets" description="No assets found"/>:
         <DataTable columns={columns} data={items}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </div>
  );
}
'''
write(PORTAL+'/app/(app)/assets/page.tsx', assets_page, 'assets/page.tsx')

# Warehouses page
wh_page = '''// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, DataTable, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
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
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Warehouses" subtitle={`${data.length||0} warehouses`} badge="WH"/>
      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={5}/>:
         items.length===0?<EmptyState icon="🏭" title="No warehouses" description="No warehouses configured"/>:
         <DataTable columns={columns} data={items}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </div>
  );
}
'''
write(PORTAL+'/app/(app)/warehouses/page.tsx', wh_page, 'warehouses/page.tsx')

# Inventory page
inv_page = '''// @ts-nocheck
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
'''
write(PORTAL+'/app/(app)/inventory/page.tsx', inv_page, 'inventory/page.tsx')

log('='*40)
log('Z2 COMPLETE — Created: '+str(len(r['created'])))
for c in r['created']: log('  OK '+c)
import json as _j
with open('/home/amr/AI-COMPANY-OS/tasks/logs/z2_result.json','w') as f:
    _j.dump(r,f,indent=2)