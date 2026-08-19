"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr  = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n: any) => `EGP ${Number(n||0).toLocaleString()}`;

export default function InventoryPage() {
  const router = useRouter();
  const [search,      setSearch]      = useState("");
  const [filterCat,   setFilterCat]   = useState("all");
  const [filterStock, setFilterStock] = useState("all");

  const { data: itemRaw, isLoading } = useQuery(["inv-items"],  ()=>authFetch("/api/v1/inventory-items-portal").then(r=>r.json()),{refetchInterval:60000});
  const { data: stockRaw }           = useQuery(["inv-stock"],  ()=>authFetch("/api/v1/stock-balances/").then(r=>r.json()));
  const { data: whRaw }              = useQuery(["inv-wh"],     ()=>authFetch("/api/v1/warehouses-portal").then(r=>r.json()));

  const items  = toArr(itemRaw);
  const stocks = toArr(stockRaw);
  const whs    = toArr(whRaw);
  const cats   = [...new Set(items.map((i: any) =>i.category).filter(Boolean))];

  const lowStock   = items.filter((i: any) =>{const bal=stocks.find((s: any) =>s.item_id===i.id);return bal&&Number(bal.quantity||0)<=Number(i.minimum_quantity||i.min_quantity||5);});
  const totalValue = stocks.reduce((s: any, b: any) =>{const item=items.find((i: any) =>i.id===b.item_id);return s+(Number(b.qty_on_hand||0)*Number(item?.unit_price||item?.cost||0));},0);

  const enriched = items.map(item=>{
    const bal = stocks.find((s: any) =>s.item_id===item.id);
    const qty = Number(bal?.qty_on_hand||0);
    const min = Number(item.minimum_quantity||item.min_quantity||5);
    return {...item,current_qty:qty,min_qty:min,is_low:qty<=min};
  });

  const filtered = enriched.filter((i: any) =>{
    const matchSearch = !search||(i.name||"").toLowerCase().includes(search.toLowerCase())||(i.sku||i.part_number||"").toLowerCase().includes(search.toLowerCase())||(i.category||"").toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat==="all"||i.category===filterCat;
    const matchStock  = filterStock==="all"||(filterStock==="low"&&i.is_low)||(filterStock==="ok"&&!i.is_low);
    return matchSearch&&matchCat&&matchStock;
  });

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Inventory</h1>
              <p className="tb-hero-description">{items.length} items · {lowStock.length} low stock · {whs.length} warehouses · {fmtEGP(totalValue)} total value</p>
            </div>
            <button onClick={()=>router.push("/supply-chain/purchase-requests")} className="tb-btn tb-btn-primary">+ Purchase Request</button>
          </div>
          <div className="mt-6" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
            {[
              {label:"Total Items", value:items.length,       color:"var(--color-text-inv)"},
              {label:"Low Stock",   value:lowStock.length,    color:lowStock.length>0?"var(--color-danger)":"var(--color-success)"},
              {label:"Categories",  value:cats.length,        color:"var(--color-info)"},
              {label:"Warehouses",  value:whs.length,         color:"var(--color-brand)"},
              {label:"Total Value", value:fmtEGP(totalValue), color:"var(--color-warning)"},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {lowStock.length>0&&(
          <div className="tb-alert tb-alert-danger mb-4">
            <span className="text-xl">⚠️</span>
            <div className="flex-1 text-sm font-semibold">
              {lowStock.length} item{lowStock.length>1?"s":""} below minimum stock level
            </div>
            <button onClick={()=>setFilterStock("low")} className="tb-btn tb-btn-danger tb-btn-sm ml-auto">View Low Stock →</button>
          </div>
        )}

        <div className="tb-section mb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <input className="tb-input" placeholder="Search by name, SKU, category..."
              value={search} onChange={(e: any) =>setSearch(e.target.value)} style={{maxWidth:"320px"}}/>
            <div className="tb-tabs border-0 mb-0">
              {["all","low","ok"].map((f: any) =>(
                <button key={f} onClick={()=>setFilterStock(f)} className={`tb-tab ${filterStock===f?"active":""}`}>
                  {f==="all"?"All Stock":f==="low"?"Low Stock":"In Stock"}
                  {f==="low"&&lowStock.length>0&&<span className="ml-1 opacity-80">{lowStock.length}</span>}
                </button>
              ))}
            </div>
            <div className="w-px bg-surface-alt h-5"/>
            <button onClick={()=>setFilterCat("all")} className={`tb-btn tb-btn-sm ${filterCat==="all"?"tb-btn-secondary":"tb-btn-ghost"}`}>All</button>
            {cats.slice(0,5).map((c: any) =>(
              <button key={c} onClick={()=>setFilterCat(c)} className={`tb-btn tb-btn-sm ${filterCat===c?"tb-btn-secondary":"tb-btn-ghost"}`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="tb-section">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-secondary">{filtered.length} items</div>
            <div className="text-sm font-bold text-success">{fmtEGP(totalValue)}</div>
          </div>
          {isLoading ? (
            <div className="flex flex-col gap-3">{[1,2,3,4,5].map((i: any) =><div key={i} className="tb-shimmer-block" style={{height:56}}/>)}</div>
          ) : filtered.length===0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">📦</div>
              <div className="tb-empty-title">No items found</div>
              <div className="tb-empty-desc">{search||filterCat!=="all"?"Try adjusting filters":"No inventory items yet"}</div>
            </div>
          ) : (
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead>
                  <tr>
                    <th>Item / SKU</th>
                    <th style={{textAlign:"center"}}>Category</th>
                    <th style={{textAlign:"center"}}>On Hand</th>
                    <th style={{textAlign:"center"}}>Min</th>
                    <th style={{textAlign:"center"}}>Unit Price</th>
                    <th style={{textAlign:"center"}}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item,i)=>{
                    const pct   = item.min_qty>0?Math.min((item.current_qty/item.min_qty)*100,100):100;
                    const color = item.is_low?"#A84A3D":"#547C4D";
                    return (
                      <tr key={i} onClick={()=>router.push(`/supply-chain/inventory/${item.id}`)} className="cursor-pointer">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-xs flex-shrink-0">📦</div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-primary truncate">{item.name||"—"}</div>
                              <div className="text-xs text-tertiary">{item.sku||item.part_number||"—"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="tb-badge" style={{fontSize:"0.625rem"}}>{item.category||"—"}</span>
                        </td>
                        <td className="text-center text-sm font-bold" style={{color}}>{item.current_qty}</td>
                        <td className="text-center text-xs text-tertiary">{item.min_qty}</td>
                        <td className="text-center text-xs text-secondary">{item.unit_price?fmtEGP(item.unit_price):"—"}</td>
                        <td className="px-2">
                          <div className="tb-progress">
                            <div className="tb-progress-bar" style={{background:color,width:`${pct}%`}}/>
                          </div>
                          {item.is_low&&(
                            <div className="text-center mt-1">
                              <span className="tb-badge tb-badge-danger" style={{fontSize:"0.5rem"}}>Low</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="tb-grid-2">
          <div className="tb-section">
            <div className="tb-section-title">Items by Category</div>
            <div className="flex flex-col gap-2">
              {cats.map(cat=>{
                const cnt = items.filter((i: any) =>i.category===cat).length;
                const pct = items.length>0?(cnt/items.length)*100:0;
                const low = enriched.filter((i: any) =>i.category===cat&&i.is_low).length;
                return (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-secondary capitalize">{cat}</span>
                        {low>0&&<span className="tb-badge tb-badge-danger" style={{fontSize:"0.5rem"}}>{low} low</span>}
                      </div>
                      <span className="text-xs font-bold text-primary">{cnt}</span>
                    </div>
                    <div className="tb-progress">
                      <div className="tb-progress-bar" style={{background:"#547C4D",width:`${pct}%`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="tb-section">
            <div className="tb-section-title">Quick Navigation</div>
            <div className="flex flex-col gap-2">
              {[
                {label:"Warehouses",       icon:"🏗️", path:"/supply-chain/warehouses"},
                {label:"Stock Balances",   icon:"⚖️", path:"/supply-chain/stock-levels"},
                {label:"Goods Receipts",   icon:"✅",  path:"/supply-chain/goods-receipts"},
                {label:"Purchase Requests",icon:"📋",  path:"/supply-chain/purchase-requests"},
                {label:"Purchase Orders",  icon:"📦",  path:"/supply-chain/purchase-orders"},
              ].map((a: any, i: number) =>(
                <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item w-full justify-start">
                  <span>{a.icon}</span>
                  <span className="text-sm text-secondary">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
