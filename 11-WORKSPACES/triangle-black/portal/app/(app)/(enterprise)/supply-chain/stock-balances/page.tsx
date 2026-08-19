"use client";
// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { Pagination } from "@/components/ui/Pagination";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtQty = (n, unit) => `${Number(n||0).toLocaleString()} ${unit||""}`.trim();

function getStockStatus(qtyOnHand: any, minStock: any, reorderQty: any) {
  if (qtyOnHand <= 0) return "critical";
  if (minStock > 0 && qtyOnHand <= minStock) return "critical";
  if (reorderQty > 0 && qtyOnHand <= reorderQty) return "low";
  return "ok";
}

const STATUS_META = {
  ok:       {badge:"tb-badge-success", label:"In Stock"},
  low:      {badge:"tb-badge-warning", label:"Low Stock"},
  critical: {badge:"tb-badge-danger",  label:"Critical"},
};

export default function StockBalancesPage() {
  const router = useRouter();
  const [search,          setSearch]          = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState("all");
  const [filterCategory,  setFilterCategory]  = useState("all");
  const [filterStatus,    setFilterStatus]    = useState("all");
  const [page,            setPage]            = useState(1);
  const [pageSize,        setPageSize]        = useState(25);

  const { data: rawBalances,  isLoading } = useQuery({queryKey:["stock-balances-list"],  queryFn:()=>authFetch("/api/v1/stock-balances/").then(r => (r as any).data ?? r),               staleTime:60000});
  const { data: rawItems }               = useQuery({queryKey:["inventory-items-list"],  queryFn:()=>authFetch("/api/v1/inventory-items-portal").then(r => (r as any).data ?? r),        staleTime:300000});
  const { data: rawWarehouses }          = useQuery({queryKey:["warehouses-list"],        queryFn:()=>authFetch("/api/v1/warehouses-portal").then(r => (r as any).data ?? r),             staleTime:300000});

  const itemMap = useMemo(()=>{const m=new Map();toArr(rawItems).forEach((item: any) =>m.set(item.id,item));return m;},[rawItems]);
  const balances = useMemo(()=>toArr(rawBalances).map((sb: any) =>{
    const item=itemMap.get(sb.item_id)||{};
    return {...sb,category:item.category||"—",unit:item.unit_of_measure||"unit",min_stock:item.min_stock||0,reorder_qty:item.reorder_qty||0,
      status:getStockStatus(Number(sb.qty_on_hand||0),Number(item.min_stock||0),Number(item.reorder_qty||0))};
  }),[rawBalances,itemMap]);

  const warehouses    = toArr(rawWarehouses);
  const categories    = useMemo(()=>["all",...Array.from(new Set(balances.map((b: any) =>b.category).filter((c: any) =>c&&c!=="—")))]   ,[balances]);
  const warehouseNames= useMemo(()=>["all",...Array.from(new Set(balances.map((b: any) =>b.warehouse_name).filter(Boolean)))]  ,[balances]);

  const filtered = useMemo(()=>balances.filter((b: any) =>{
    const q=search.toLowerCase();
    return (!search||(b.item_name||"").toLowerCase().includes(q)||(b.item_code||"").toLowerCase().includes(q)||(b.category||"").toLowerCase().includes(q))
      &&(filterWarehouse==="all"||b.warehouse_name===filterWarehouse)
      &&(filterCategory==="all"||b.category===filterCategory)
      &&(filterStatus==="all"||b.status===filterStatus);
  }),[balances,search,filterWarehouse,filterCategory,filterStatus]);

  const totalPages = Math.ceil(filtered.length/pageSize);
  const paged      = filtered.slice((page-1)*pageSize,page*pageSize);
  const lowStock   = balances.filter((b: any) =>b.status==="low").length;
  const critical   = balances.filter((b: any) =>b.status==="critical").length;
  const totalValue = balances.reduce((s: any, b: any) =>s+Number(b.total_value||0),0);
  const hasFilters = search||filterWarehouse!=="all"||filterCategory!=="all"||filterStatus!=="all";
  const clearFilters=()=>{setSearch("");setFilterWarehouse("all");setFilterCategory("all");setFilterStatus("all");setPage(1);};

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Stock Balances</h1>
              <p className="tb-hero-description">Inventory levels · Reorder alerts · {warehouses.length} warehouse{warehouses.length!==1?"s":""}</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>router.push("/supply-chain/purchase-orders-v2")} className="tb-btn tb-btn-primary">+ New PO</button>
              <button onClick={()=>router.push("/supply-chain")} className="tb-btn tb-btn-secondary">← Supply Chain</button>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <button className="tb-hero-kpi cursor-pointer" onClick={()=>{setFilterStatus("all");setPage(1);}}>
                <div className="tb-hero-kpi-value">{balances.length}</div>
                <div className="tb-hero-kpi-label">Total SKUs</div>
              </button>
              <button className="tb-hero-kpi cursor-pointer" onClick={()=>{setFilterStatus("low");setPage(1);}}>
                <div className="tb-hero-kpi-value text-warning">{lowStock}</div>
                <div className="tb-hero-kpi-label">Low Stock</div>
              </button>
              <button className="tb-hero-kpi cursor-pointer" onClick={()=>{setFilterStatus("critical");setPage(1);}}>
                <div className="tb-hero-kpi-value text-danger">{critical}</div>
                <div className="tb-hero-kpi-label">Critical</div>
              </button>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value text-brand" style={{fontSize:"15px"}}>{fmtEGP(totalValue)}</div>
                <div className="tb-hero-kpi-label">Total Value</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {critical > 0 && (
          <div className="tb-alert tb-alert-danger mb-4">
            <span className="text-lg">🚨</span>
            <div className="flex-1">
              <span className="font-bold">{critical} item{critical!==1?"s":""} at critical stock level</span>
              <span className="text-sm ml-2 opacity-70">— immediate reorder required</span>
            </div>
            <button onClick={()=>{setFilterStatus("critical");setPage(1);}} className="tb-btn tb-btn-danger tb-btn-sm">View Critical</button>
          </div>
        )}

        <div className="tb-section mb-4">
          <div className="flex gap-2.5 flex-wrap items-center">
            <input value={search} onChange={(e: any) =>{setSearch(e.target.value);setPage(1);}}
              placeholder="Search items..." className="tb-input" style={{minWidth:"200px",width:"auto"}}/>
            <select value={filterWarehouse} onChange={(e: any) =>{setFilterWarehouse(e.target.value);setPage(1);}} className="tb-select" style={{width:"auto"}}>
              {warehouseNames.map((w: any) =><option key={w} value={w}>{w==="all"?"All Warehouses":w}</option>)}
            </select>
            <select value={filterCategory} onChange={(e: any) =>{setFilterCategory(e.target.value);setPage(1);}} className="tb-select" style={{width:"auto"}}>
              {categories.map((c: any) =><option key={c} value={c}>{c==="all"?"All Categories":c}</option>)}
            </select>
            <div className="flex gap-1.5">
              {["all","ok","low","critical"].map((s: any) =>(
                <button key={s} onClick={()=>{setFilterStatus(s);setPage(1);}}
                  className={`tb-btn tb-btn-sm ${filterStatus===s?s==="critical"?"tb-btn-danger":s==="ok"?"tb-btn-primary":"tb-btn-secondary":"tb-btn-ghost"}`}>
                  {s==="all"?"All":(STATUS_META as Record<string, any>)[s]?.label}
                  {s!=="all"&&<span className="ml-1 opacity-60">{balances.filter((b: any) =>b.status===s).length}</span>}
                </button>
              ))}
            </div>
            {hasFilters&&<button onClick={clearFilters} className="tb-btn tb-btn-ghost tb-btn-sm">✕ Clear</button>}
            <span className="text-xs text-tertiary ml-auto">{filtered.length} of {balances.length} items</span>
          </div>
        </div>

        <div className="tb-section">
          <div className="flex justify-between items-center mb-4">
            <div className="tb-section-title" style={{margin:0}}>Inventory Stock Levels</div>
            <span className="text-sm font-bold text-brand">{fmtEGP(filtered.reduce((s: any, b: any) =>s+Number(b.total_value||0),0))} total</span>
          </div>
          {isLoading ? <TableSkeleton /> : filtered.length===0 ? (
            <EmptyState icon="📦" title="No stock items found"
              description={hasFilters?"Try adjusting your filters":"No inventory items in stock"}
              action={hasFilters?{label:"Clear Filters",onClick:clearFilters}:undefined}/>
          ) : (
            <>
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Warehouse</th>
                      <th style={{textAlign:"right"}}>On Hand</th>
                      <th style={{textAlign:"right"}}>Reserved</th>
                      <th style={{textAlign:"right"}}>Available</th>
                      <th style={{textAlign:"right"}}>Reorder At</th>
                      <th>Status</th>
                      <th style={{textAlign:"center"}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((b: any, i: number) =>{
                      const meta=(STATUS_META as Record<string, any>)[b.status]||STATUS_META.ok;
                      const isCritical=b.status==="critical";
                      const isLow=b.status==="low";
                      return (
                        <tr key={b.id||i}>
                          <td>
                            <div className="font-semibold text-sm text-primary">{b.item_name||"—"}</div>
                            <div className="text-xs text-tertiary mt-0.5">{b.item_code||"—"}</div>
                          </td>
                          <td className="text-sm text-secondary">{b.category}</td>
                          <td className="text-sm text-secondary">{b.warehouse_name||"—"}</td>
                          <td className="text-right">
                            <span className={`font-bold text-sm ${isCritical?"text-danger":isLow?"text-warning":"text-primary"}`}>
                              {fmtQty(b.qty_on_hand,b.unit)}
                            </span>
                          </td>
                          <td className="text-right text-sm text-tertiary">{fmtQty(b.qty_reserved,b.unit)}</td>
                          <td className="text-right"><span className="text-sm font-semibold text-success">{fmtQty(b.qty_available,b.unit)}</span></td>
                          <td className="text-right text-xs text-tertiary">{b.reorder_qty>0?fmtQty(b.reorder_qty,b.unit):"—"}</td>
                          <td><span className={`tb-badge ${meta.badge}`}>{meta.label}</span></td>
                          <td className="text-center">
                            {(isCritical||isLow)&&(
                              <button onClick={()=>router.push("/supply-chain/purchase-orders-v2")}
                                className={`tb-btn tb-btn-sm ${isCritical?"tb-btn-danger":"tb-btn-ghost"}`}>
                                Reorder
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length>pageSize&&(
                <div className="mt-4 pt-4 border-t border-default">
                  <Pagination page={page} totalPages={totalPages} onPage={setPage}
                    total={filtered.length} pageSize={pageSize}
                    onPageSize={(s)=>{setPageSize(s);setPage(1);}} pageSizes={[10,25,50]}/>
                </div>
              )}
            </>
          )}
        </div>

        {warehouses.length>0&&(
          <div className="tb-grid-3">
            {warehouses.map((w: any, i: number) =>{
              const wBal=balances.filter((b: any) =>b.warehouse_name===w.name);
              const wValue=wBal.reduce((s: any, b: any) =>s+Number(b.total_value||0),0);
              const wCrit=wBal.filter((b: any) =>b.status==="critical").length;
              return (
                <div key={w.id||i} className="tb-section">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-primary">{w.name}</div>
                      <div className="text-xs text-tertiary mt-0.5">{w.code} · {w.type||"warehouse"}</div>
                    </div>
                    {wCrit>0&&<span className="tb-badge tb-badge-danger">{wCrit} critical</span>}
                  </div>
                  <div className="tb-grid-2">
                    {[{label:"SKUs",value:wBal.length},{label:"Total Value",value:fmtEGP(wValue)},{label:"Low Stock",value:wBal.filter((b: any) =>b.status==="low").length},{label:"Critical",value:wCrit}].map(({label,value},j)=>(
                      <div key={j} className="p-2 bg-surface-alt rounded-md">
                        <div className="font-bold text-sm text-primary">{value}</div>
                        <div className="text-xs text-tertiary mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
