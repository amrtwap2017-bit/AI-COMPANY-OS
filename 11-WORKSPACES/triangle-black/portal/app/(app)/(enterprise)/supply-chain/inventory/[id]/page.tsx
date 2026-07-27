"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

export default function InventoryItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: item, isLoading } = useQuery(
    ["inv-detail", id],
    () => authFetch("/api/v1/inventory-items/" + id).then(r => r.json()),
    { enabled: !!id }
  );
  const { data: stockRaw } = useQuery(
    ["inv-detail-stock"],
    () => authFetch("/api/v1/stock-balances/").then(r => r.json())
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-secondary text-sm animate-pulse">Loading...</div>
    </div>
  );

  if (!item || item.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">📦</div>
        <div className="tb-empty-title">Item not found</div>
        <button onClick={() => router.push("/supply-chain/inventory")} className="tb-btn-primary mt-4">Back</button>
      </div>
    </div>
  );

  const stocks = Array.isArray(stockRaw) ? stockRaw : [];
  const balance = stocks.find(s => s.item_id === id);
  const qty     = Number(balance?.qty_on_hand || 0);
  const minQty  = Number(item.minimum_quantity || item.min_quantity || 5);
  const isLow   = qty <= minQty;
  const pct     = minQty > 0 ? Math.min((qty / minQty) * 100, 200) : 100;
  const unitVal = Number(item.unit_price || item.cost || 0);
  const totalVal= qty * unitVal;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0D1A12 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1.5">Supply Chain · Inventory</div>
              <h1 className="tb-hero-title">{item.name || ("Item " + (id||"").slice(0,8))}</h1>
              <p className="tb-hero-description">
                {isLow
                  ? <span className="tb-badge mr-2" style={{background:"#F8717118",color:"#F87171",border:"1px solid #F8717130"}}>Low Stock</span>
                  : <span className="tb-badge mr-2" style={{background:"#34D39918",color:"#34D399",border:"1px solid #34D39930"}}>In Stock</span>}
                {item.category && <span className="text-secondary mr-2">{item.category}</span>}
                {item.sku && <span className="text-tertiary">SKU: {item.sku}</span>}
              </p>
            </div>
            <button onClick={() => router.push("/supply-chain/inventory")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"On Hand",     value:qty,              color:isLow?"#F87171":"#34D399" },
              { label:"Minimum",     value:minQty,           color:"#FBBF24" },
              { label:"Unit Price",  value:fmtEGP(unitVal),  color:"#60A5FA" },
              { label:"Stock Value", value:fmtEGP(totalVal), color:"#A78BFA" },
            ].map((k, i) => (
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {isLow && (
          <div className="tb-section" style={{borderColor:"#F8717140",background:"#F8717108"}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span style={{fontSize:"1.25rem"}}>⚠️</span>
                <span className="text-sm font-semibold text-red-400">
                  Stock below minimum — {qty} remaining (min: {minQty})
                </span>
              </div>
              <button onClick={() => router.push("/supply-chain/purchase-requests")} className="tb-section-link">
                Create PR →
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-5">
            <div className="tb-section">
              <div className="tb-section-title">Item Details</div>
              <div className="space-y-1">
                {[
                  ["Name",          item.name || "—"],
                  ["SKU",           item.sku || item.part_number || "—"],
                  ["Category",      item.category || "—"],
                  ["Unit",          item.unit || item.unit_of_measure || "—"],
                  ["Unit Price",    fmtEGP(unitVal)],
                  ["Minimum Stock", minQty],
                  ["On Hand",       qty],
                  ["Stock Value",   fmtEGP(totalVal)],
                  ["Warehouse",     balance?.warehouse_id || "—"],
                  ["Location",      item.location || item.storage_location || "—"],
                  ["Created",       fmtDate(item.created_at)],
                ].map(([l, v], i) => (
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{l}</span>
                    <span className="tb-info-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Stock Level</div>
              <div className="tb-flex-between mb-2">
                <span className="text-sm text-secondary">Current: {qty}</span>
                <span className="text-sm text-secondary">Min: {minQty}</span>
              </div>
              <div className="tb-progress tb-progress--md mb-2">
                <div className="tb-progress-bar" style={{
                  background: isLow ? "#F87171" : "#34D399",
                  width: Math.min(pct, 100) + "%"
                }}/>
              </div>
              <div className="text-xs text-tertiary">
                {isLow
                  ? "Reorder needed — " + (minQty - qty) + " units below minimum"
                  : qty + " units available — " + Math.round(pct - 100) + "% above minimum"}
              </div>
            </div>

            {item.description && (
              <div className="tb-section">
                <div className="tb-section-title">Description</div>
                <p className="text-sm text-secondary leading-relaxed">{item.description}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="tb-section">
              <div className="tb-section-title">Stock Status</div>
              <div className="text-center py-4">
                <div className="text-5xl font-black mb-2" style={{color:isLow?"#F87171":"#34D399"}}>
                  {isLow ? "!" : "✓"}
                </div>
                <div className="text-sm font-bold" style={{color:isLow?"#F87171":"#34D399"}}>
                  {isLow ? "LOW STOCK" : "IN STOCK"}
                </div>
                <div className="text-xs text-tertiary mt-1">{qty} units on hand</div>
              </div>
            </div>
            <div className="tb-section">
              <div className="tb-section-title">Quick Actions</div>
              <div className="space-y-2">
                {[
                  { label:"All Inventory",      icon:"📦", path:"/supply-chain/inventory" },
                  { label:"Purchase Requests",  icon:"📋", path:"/supply-chain/purchase-requests" },
                  { label:"Purchase Orders",    icon:"📦", path:"/supply-chain/purchase-orders" },
                  { label:"Warehouses",         icon:"🏗️",  path:"/supply-chain/warehouses" },
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
    </div>
  );
}
