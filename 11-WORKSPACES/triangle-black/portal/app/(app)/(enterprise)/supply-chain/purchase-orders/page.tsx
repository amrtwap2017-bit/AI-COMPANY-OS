"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_COLOR = {
  draft:"#94A3B8", pending:"#60A5FA", approved:"#A78BFA",
  ordered:"#FBBF24", received:"#34D399", cancelled:"#F87171"
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: poRaw, isLoading } = useQuery(
    ["po-list"],
    () => authFetch("/api/v1/purchase-orders-portal").then(r => r.json()),
    { refetchInterval: 60000 }
  );
  const { data: suppRaw } = useQuery(["po-supps"], () => authFetch("/api/v1/suppliers/").then(r => r.json()));
  const { data: prRaw }   = useQuery(["po-prs"],   () => authFetch("/api/v1/purchase-requests-portal").then(r => r.json()));

  const pos   = toArr(poRaw);
  const supps = toArr(suppRaw);
  const prs   = toArr(prRaw);

  const totalValue   = pos.reduce((s, p) => s + Number(p.total_amount || p.total_value || 0), 0);
  const pending      = pos.filter(p => p.status === "pending").length;
  const approved     = pos.filter(p => p.status === "approved").length;
  const received     = pos.filter(p => p.status === "received").length;
  const openPRs      = prs.filter(p => p.status === "pending" || p.status === "open").length;

  const filtered = pos.filter(p => {
    const matchSearch = !search ||
      (p.po_number||p.id||"").toLowerCase().includes(search.toLowerCase()) ||
      (p.supplier_name||"").toLowerCase().includes(search.toLowerCase()) ||
      (p.notes||p.description||"").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Purchase Orders</h1>
              <p className="tb-hero-description">{pos.length} orders · {fmtEGP(totalValue)} total value</p>
            </div>
            <button
              onClick={() => router.push("/supply-chain/purchase-requests")}
              className="tb-btn-primary"
            >
              + Purchase Request
            </button>
          </div>
          <div className="tb-grid-4 mt-6" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
            {[
              { label:"Total POs",   value:pos.length,        color:"#F1F5F9" },
              { label:"Pending",     value:pending,           color:"#60A5FA" },
              { label:"Approved",    value:approved,          color:"#A78BFA" },
              { label:"Received",    value:received,          color:"#34D399" },
              { label:"Open PRs",    value:openPRs,           color:"#FBBF24" },
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
        {/* Filters */}
        <div className="tb-section">
          <div className="tb-flex-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-secondary text-sm">🔍</span>
              <input
                className="tb-search flex-1"
                placeholder="Search by PO number, supplier..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all","pending","approved","ordered","received","cancelled"].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`tb-pill ${filterStatus === s ? "tb-pill--active" : ""}`}
                >
                  {s === "all" ? "All" : s}
                  {s !== "all" && (
                    <span className="ml-1 opacity-60">{pos.filter(p => p.status === s).length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="tb-section">
          <div className="tb-flex-between mb-4">
            <div className="text-sm text-secondary">{filtered.length} orders</div>
            <div className="text-sm font-bold text-emerald-400">
              {fmtEGP(filtered.reduce((s,p)=>s+Number(p.total_amount||p.total_value||0),0))}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">📦</div>
              <div className="tb-empty-title">No purchase orders</div>
              <div className="tb-empty-desc">
                {search || filterStatus !== "all" ? "Try adjusting your filters" : "No purchase orders found"}
              </div>
            </div>
          ) : (
            <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"1.5fr 120px 100px 130px 110px 110px"}}>
                {["PO Number / Supplier","Status","Items","Total Value","Order Date","Expected"].map((h, i) => (
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.map((po, i) => {
                const sc = STATUS_COLOR[po.status] || "#94A3B8";
                const supp = supps.find(s => s.id === po.supplier_id);
                return (
                  <button
                    key={i}
                    onClick={() => router.push(`/supply-chain/purchase-orders/${po.id}`)}
                    className="tb-table-row"
                    style={{gridTemplateColumns:"1.5fr 120px 100px 130px 110px 110px"}}
                  >
                    <div className="flex items-center gap-3 pr-4 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-base-alt flex items-center justify-center text-xs flex-shrink-0">
                        📦
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">
                          {po.po_number || `PO-${po.id?.slice(0,8)}`}
                        </div>
                        <div className="text-xs text-tertiary truncate">
                          {po.supplier_name || supp?.name || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`,fontSize:"0.625rem"}}>
                        {po.status||"—"}
                      </span>
                    </div>
                    <div className="text-center text-sm font-bold text-primary">
                      {po.items_count || po.line_items?.length || "—"}
                    </div>
                    <div className="text-center text-sm font-bold text-emerald-400">
                      {fmtEGP(po.total_amount || po.total_value || 0)}
                    </div>
                    <div className="text-center text-xs text-tertiary">{fmtDate(po.order_date || po.created_at)}</div>
                    <div className="text-center text-xs text-secondary">{fmtDate(po.expected_delivery_date || po.delivery_date)}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Value breakdown + supplier top */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="tb-section">
            <div className="tb-section-title">Order Value by Status</div>
            <div className="space-y-3">
              {Object.entries(STATUS_COLOR).map(([status, color]) => {
                const statusPos = pos.filter(p => p.status === status);
                const val = statusPos.reduce((s,p)=>s+Number(p.total_amount||p.total_value||0),0);
                const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
                return statusPos.length > 0 ? (
                  <div key={status}>
                    <div className="tb-flex-between mb-1">
                      <span className="text-xs text-secondary capitalize">{status} ({statusPos.length})</span>
                      <span className="text-xs font-bold text-primary">{fmtEGP(val)}</span>
                    </div>
                    <div className="tb-progress">
                      <div className="tb-progress-bar" style={{background:color,width:`${pct}%`}}/>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <div className="tb-section">
            <div className="tb-section-title">Quick Navigation</div>
            <div className="space-y-2">
              {[
                { label:"Purchase Requests",   icon:"📋", path:"/supply-chain/purchase-requests",   count:prs.length },
                { label:"Suppliers",           icon:"🏭", path:"/supply-chain/suppliers",            count:supps.length },
                { label:"Inventory",           icon:"📦", path:"/supply-chain/inventory",            count:null },
                { label:"Warehouses",          icon:"🏗️",  path:"/supply-chain/warehouses",          count:null },
                { label:"Goods Receipts",      icon:"✅", path:"/supply-chain/goods-receipts",       count:null },
              ].map((a, i) => (
                <button key={i} onClick={() => router.push(a.path)}
                  className="tb-action-item w-full justify-between">
                  <div className="flex items-center gap-3">
                    <span>{a.icon}</span>
                    <span className="text-sm text-secondary">{a.label}</span>
                  </div>
                  {a.count !== null && (
                    <span className="tb-badge" style={{fontSize:"0.625rem"}}>{a.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
