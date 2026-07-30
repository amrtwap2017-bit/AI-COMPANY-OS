"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const CATEGORY_COLOR = {
  hvac:"#60A5FA", electrical:"#FBBF24", plumbing:"#34D399",
  mechanical:"#A78BFA", general:"#94A3B8", fire:"#F87171"
};

export default function SuppliersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const { data: suppRaw, isLoading } = useQuery(
    ["supp-list"],
    () => authFetch("/api/v1/suppliers/").then(r => r.json()),
    { refetchInterval: 60000 }
  );
  const { data: poRaw } = useQuery(["supp-pos"], () => authFetch("/api/v1/purchase-orders-portal").then(r => r.json()));
  const { data: prRaw } = useQuery(["supp-prs"], () => authFetch("/api/v1/purchase-requests-portal").then(r => r.json()));

  const supps = toArr(suppRaw);
  const pos   = toArr(poRaw);
  const prs   = toArr(prRaw);

  const active   = supps.filter(s => s.status === "active" || !s.status).length;
  const cats     = [...new Set(supps.map(s => s.category).filter(Boolean))];
  const totalPOs = pos.length;

  const filtered = supps.filter(s => {
    const matchSearch = !search ||
      (s.name||"").toLowerCase().includes(search.toLowerCase()) ||
      (s.email||"").toLowerCase().includes(search.toLowerCase()) ||
      (s.category||"").toLowerCase().includes(search.toLowerCase()) ||
      (s.contact_name||"").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || s.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Suppliers</h1>
              <p className="tb-hero-description">{supps.length} suppliers · {active} active · {cats.length} categories</p>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Total",      value:supps.length, color:"#F1F5F9" },
              { label:"Active",     value:active,       color:"#34D399" },
              { label:"Categories", value:cats.length,  color:"#60A5FA" },
              { label:"Total POs",  value:totalPOs,     color:"#FBBF24" },
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
        <div className="tb-section">
          <div className="tb-flex-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-secondary text-sm">🔍</span>
              <input
                className="tb-search flex-1"
                placeholder="Search suppliers by name, category, contact..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFilterCat("all")} className={`tb-pill ${filterCat === "all" ? "tb-pill--active" : ""}`}>All</button>
              {cats.map(c => (
                <button key={c} onClick={() => setFilterCat(c)}
                  className={`tb-pill ${filterCat === c ? "tb-pill--active" : ""}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="tb-section">
          <div className="tb-flex-between mb-4">
            <div className="text-sm text-secondary">{filtered.length} suppliers</div>
            <button onClick={() => router.push("/supply-chain/purchase-orders")} className="tb-section-link">Purchase Orders →</button>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          ) : filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">🏭</div>
              <div className="tb-empty-title">No suppliers found</div>
              <div className="tb-empty-desc">{search || filterCat !== "all" ? "Try adjusting your filters" : "No suppliers yet"}</div>
            </div>
          ) : (
            <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"2fr 100px 140px 140px 80px"}}>
                {["Supplier","Category","Contact","Email","POs"].map((h, i) => (
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.map((s, i) => {
                const cc = CATEGORY_COLOR[s.category?.toLowerCase()] || "#94A3B8";
                const supplierPOs = pos.filter(p => p.supplier_id === s.id).length;
                return (
                  <button key={i}
                    onClick={() => router.push(`/supply-chain/suppliers/${s.id}`)}
                    className="tb-table-row"
                    style={{gridTemplateColumns:"2fr 100px 140px 140px 80px"}}>
                    <div className="flex items-center gap-3 pr-4 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-base-alt flex items-center justify-center text-sm flex-shrink-0 font-bold text-secondary">
                        {(s.name||"?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{s.name||"—"}</div>
                        {s.city && <div className="text-xs text-tertiary truncate">{s.city}</div>}
                      </div>
                    </div>
                    <div className="text-center">
                      {s.category
                        ? <span className="tb-badge" style={{background:`${cc}18`,color:cc,border:`1px solid ${cc}30`,fontSize:"0.625rem"}}>{s.category}</span>
                        : <span className="text-xs text-tertiary">—</span>}
                    </div>
                    <div className="text-center text-xs text-secondary truncate px-1">{s.contact_name||s.contact||"—"}</div>
                    <div className="text-center text-xs text-tertiary truncate px-1">{s.email||"—"}</div>
                    <div className="text-center">
                      <span className="text-sm font-bold" style={{color:supplierPOs>0?"#34D399":"#64748B"}}>{supplierPOs}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="tb-section">
            <div className="tb-section-title">Suppliers by Category</div>
            <div className="space-y-2">
              {cats.map(cat => {
                const cnt = supps.filter(s => s.category === cat).length;
                const pct = supps.length > 0 ? (cnt / supps.length) * 100 : 0;
                const c = CATEGORY_COLOR[cat?.toLowerCase()] || "#94A3B8";
                return (
                  <div key={cat}>
                    <div className="tb-flex-between mb-1">
                      <span className="text-xs text-secondary capitalize">{cat}</span>
                      <span className="text-xs font-bold text-primary">{cnt}</span>
                    </div>
                    <div className="tb-progress"><div className="tb-progress-bar" style={{background:c,width:`${pct}%`}}/></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="tb-section">
            <div className="tb-section-title">Supply Chain Links</div>
            <div className="space-y-2">
              {[
                { label:"Purchase Orders",   icon:"📦", path:"/supply-chain/purchase-orders",  count:pos.length },
                { label:"Purchase Requests", icon:"📋", path:"/supply-chain/purchase-requests", count:prs.length },
                { label:"Goods Receipts",    icon:"✅", path:"/supply-chain/goods-receipts",    count:null },
                { label:"RFQs",              icon:"📝", path:"/supply-chain/rfqs",              count:null },
              ].map((a, i) => (
                <button key={i} onClick={() => router.push(a.path)} className="tb-action-item w-full justify-between">
                  <div className="flex items-center gap-3">
                    <span>{a.icon}</span>
                    <span className="text-sm text-secondary">{a.label}</span>
                  </div>
                  {a.count !== null && <span className="tb-badge" style={{fontSize:"0.625rem"}}>{a.count}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
