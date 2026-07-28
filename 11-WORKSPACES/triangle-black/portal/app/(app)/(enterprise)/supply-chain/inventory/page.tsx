"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;

export default function InventoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStock, setFilterStock] = useState("all");

  const { data: itemRaw, isLoading } = useQuery(
    ["inv-items"],
    () => authFetch("/api/v1/inventory-items-portal").then(r => r.json()),
    { refetchInterval: 60000 }
  );
  const { data: stockRaw } = useQuery(
    ["inv-stock"],
    () => authFetch("/api/v1/stock-balances/").then(r => r.json())
  );
  const { data: whRaw } = useQuery(
    ["inv-wh"],
    () => authFetch("/api/v1/warehouses-portal").then(r => r.json())
  );

  const items  = toArr(itemRaw);
  const stocks = toArr(stockRaw);
  const whs    = toArr(whRaw);

  const cats       = [...new Set(items.map(i => i.category).filter(Boolean))];
  const lowStock   = items.filter(i => {
    const bal = stocks.find(s => s.item_id === i.id);
    return bal && Number(bal.quantity||0) <= Number(i.minimum_quantity||i.min_quantity||5);
  });
  const totalValue = stocks.reduce((s, b) => {
    const item = items.find(i => i.id === b.item_id);
    return s + (Number(b.qty_on_hand||0) * Number(item?.unit_price||item?.cost||0));
  }, 0);

  const enriched = items.map(item => {
    const bal = stocks.find(s => s.item_id === item.id);
    const qty = Number(bal?.qty_on_hand || 0);
    const min = Number(item.minimum_quantity || item.min_quantity || 5);
    return { ...item, current_qty: qty, min_qty: min, is_low: qty <= min };
  });

  const filtered = enriched.filter(i => {
    const matchSearch = !search ||
      (i.name||"").toLowerCase().includes(search.toLowerCase()) ||
      (i.sku||i.part_number||"").toLowerCase().includes(search.toLowerCase()) ||
      (i.category||"").toLowerCase().includes(search.toLowerCase());
    const matchCat   = filterCat   === "all" || i.category === filterCat;
    const matchStock = filterStock === "all"
      || (filterStock === "low"  && i.is_low)
      || (filterStock === "ok"   && !i.is_low);
    return matchSearch && matchCat && matchStock;
  });

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0D1A12 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Inventory</h1>
              <p className="tb-hero-description">{items.length} items · {lowStock.length} low stock · {whs.length} warehouses · {fmtEGP(totalValue)} total value</p>
            </div>
            <button onClick={() => router.push("/supply-chain/purchase-requests")} className="tb-btn-primary">
              + Purchase Request
            </button>
          </div>
          <div className="tb-grid-4 mt-6" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
            {[
              { label:"Total Items",   value:items.length,      color:"#F1F5F9" },
              { label:"Low Stock",     value:lowStock.length,   color:lowStock.length>0?"#F87171":"#34D399" },
              { label:"Categories",    value:cats.length,       color:"#60A5FA" },
              { label:"Warehouses",    value:whs.length,        color:"#A78BFA" },
              { label:"Total Value",   value:fmtEGP(totalValue),color:"#FBBF24" },
            ].map((k, i) => (
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {lowStock.length > 0 && (
          <div className="tb-section" style={{borderColor:"#F8717140",background:"#F8717108"}}>
            <div className="flex items-center gap-3">
              <span style={{fontSize:"1.25rem"}}>⚠️</span>
              <span className="text-sm font-semibold text-red-400">
                {lowStock.length} item{lowStock.length>1?"s":""} below minimum stock level
              </span>
              <button onClick={() => setFilterStock("low")} className="tb-section-link ml-auto">View Low Stock →</button>
            </div>
          </div>
        )}

        <div className="tb-section">
          <div className="tb-flex-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-secondary text-sm">🔍</span>
              <input
                className="tb-search flex-1"
                placeholder="Search by name, SKU, category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all","low","ok"].map(f => (
                <button key={f} onClick={() => setFilterStock(f)}
                  className={`tb-pill ${filterStock === f ? "tb-pill--active" : ""}`}>
                  {f === "all" ? "All Stock" : f === "low" ? "Low Stock" : "In Stock"}
                  {f === "low" && lowStock.length > 0 && <span className="ml-1 opacity-80">{lowStock.length}</span>}
                </button>
              ))}
              <div className="w-px bg-border mx-1"/>
              <button onClick={() => setFilterCat("all")} className={`tb-pill ${filterCat === "all" ? "tb-pill--active" : ""}`}>All</button>
              {cats.slice(0,5).map(c => (
                <button key={c} onClick={() => setFilterCat(c)}
                  className={`tb-pill ${filterCat === c ? "tb-pill--active" : ""}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="tb-section">
          <div className="tb-flex-between mb-4">
            <div className="text-sm text-secondary">{filtered.length} items</div>
            <div className="text-sm font-bold text-emerald-400">{fmtEGP(totalValue)}</div>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          ) : filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">📦</div>
              <div className="tb-empty-title">No items found</div>
              <div className="tb-empty-desc">{search || filterCat !== "all" ? "Try adjusting filters" : "No inventory items yet"}</div>
            </div>
          ) : (
            <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"2fr 100px 80px 80px 80px 110px"}}>
                {["Item / SKU","Category","On Hand","Min","Unit Price","Stock"].map((h, i) => (
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.map((item, i) => {
                const pct   = item.min_qty > 0 ? Math.min((item.current_qty / item.min_qty) * 100, 100) : 100;
                const color = item.is_low ? "#F87171" : "#34D399";
                return (
                  <button key={i}
                    onClick={() => router.push(`/supply-chain/inventory/${item.id}`)}
                    className="tb-table-row"
                    style={{gridTemplateColumns:"2fr 100px 80px 80px 80px 110px"}}>
                    <div className="flex items-center gap-3 pr-4 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-base-alt flex items-center justify-center text-xs flex-shrink-0">📦</div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{item.name||"—"}</div>
                        <div className="text-xs text-tertiary">{item.sku||item.part_number||"—"}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{fontSize:"0.625rem"}}>{item.category||"—"}</span>
                    </div>
                    <div className="text-center text-sm font-bold" style={{color}}>{item.current_qty}</div>
                    <div className="text-center text-xs text-tertiary">{item.min_qty}</div>
                    <div className="text-center text-xs text-secondary">{item.unit_price ? fmtEGP(item.unit_price) : "—"}</div>
                    <div className="px-2">
                      <div className="tb-progress">
                        <div className="tb-progress-bar" style={{background:color,width:`${pct}%`}}/>
                      </div>
                      {item.is_low && (
                        <div className="text-center">
                          <span className="tb-badge tb-badge--danger" style={{fontSize:"0.5rem",marginTop:2}}>Low</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="tb-section">
            <div className="tb-section-title">Items by Category</div>
            <div className="space-y-2">
              {cats.map(cat => {
                const cnt = items.filter(i => i.category === cat).length;
                const pct = items.length > 0 ? (cnt / items.length) * 100 : 0;
                const low = enriched.filter(i => i.category === cat && i.is_low).length;
                return (
                  <div key={cat}>
                    <div className="tb-flex-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-secondary capitalize">{cat}</span>
                        {low > 0 && <span className="tb-badge tb-badge--danger" style={{fontSize:"0.5rem"}}>{low} low</span>}
                      </div>
                      <span className="text-xs font-bold text-primary">{cnt}</span>
                    </div>
                    <div className="tb-progress"><div className="tb-progress-bar" style={{background:"#34D399",width:`${pct}%`}}/></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="tb-section">
            <div className="tb-section-title">Quick Navigation</div>
            <div className="space-y-2">
              {[
                { label:"Warehouses",          icon:"🏗️",  path:"/supply-chain/warehouses" },
                { label:"Stock Balances",       icon:"⚖️",  path:"/supply-chain/stock-levels" },
                { label:"Goods Receipts",       icon:"✅", path:"/supply-chain/goods-receipts" },
                { label:"Purchase Requests",    icon:"📋", path:"/supply-chain/purchase-requests" },
                { label:"Purchase Orders",      icon:"📦", path:"/supply-chain/purchase-orders" },
              ].map((a, i) => (
                <button key={i} onClick={() => router.push(a.path)} className="tb-action-item w-full justify-start">
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
