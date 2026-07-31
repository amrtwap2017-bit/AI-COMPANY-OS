"use client";
// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n || 0).toLocaleString();
const fmtQty = (n, unit) => `${Number(n || 0).toLocaleString()} ${unit || ""}`.trim();

function getStockStatus(qtyOnHand: number, minStock: number, reorderQty: number) {
  if (qtyOnHand <= 0) return "critical";
  if (minStock > 0 && qtyOnHand <= minStock) return "critical";
  if (reorderQty > 0 && qtyOnHand <= reorderQty) return "low";
  return "ok";
}

const STATUS_COLORS = {
  ok:       { bg: "rgba(84,124,77,0.08)",  text: "#547C4D", border: "rgba(84,124,77,0.2)",  label: "In Stock" },
  low:      { bg: "rgba(176,122,42,0.08)", text: "#B07A2A", border: "rgba(176,122,42,0.2)", label: "Low Stock" },
  critical: { bg: "rgba(168,74,61,0.08)",  text: "#A84A3D", border: "rgba(168,74,61,0.2)",  label: "Critical" },
};

export default function StockBalancesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // ── DATA QUERIES ──────────────────────────────────────────
  const { data: rawBalances, isLoading: loadingBal } = useQuery({
    queryKey: ["stock-balances-list"],
    queryFn: () => authFetch("/api/v1/stock-balances/").then(r => r.json()),
    staleTime: 60000,
  });

  const { data: rawItems } = useQuery({
    queryKey: ["inventory-items-list"],
    queryFn: () => authFetch("/api/v1/inventory-items-portal").then(r => r.json()),
    staleTime: 300000,
  });

  const { data: rawWarehouses } = useQuery({
    queryKey: ["warehouses-list"],
    queryFn: () => authFetch("/api/v1/warehouses-portal").then(r => r.json()),
    staleTime: 300000,
  });

  // ── CLIENT-SIDE JOIN ──────────────────────────────────────
  const itemMap = useMemo(() => {
    const m = new Map();
    toArr(rawItems).forEach(item => m.set(item.id, item));
    return m;
  }, [rawItems]);

  const balances = useMemo(() => {
    return toArr(rawBalances).map(sb => {
      const item = itemMap.get(sb.item_id) || {};
      return {
        ...sb,
        category:      item.category || "—",
        unit:          item.unit_of_measure || "unit",
        min_stock:     item.min_stock || 0,
        reorder_qty:   item.reorder_qty || 0,
        status: getStockStatus(
          Number(sb.qty_on_hand || 0),
          Number(item.min_stock || 0),
          Number(item.reorder_qty || 0)
        ),
      };
    });
  }, [rawBalances, itemMap]);

  const warehouses = toArr(rawWarehouses);
  const categories = useMemo(() =>
    ["all", ...Array.from(new Set(balances.map(b => b.category).filter(Boolean).filter(c => c !== "—")))],
    [balances]
  );
  const warehouseNames = useMemo(() =>
    ["all", ...Array.from(new Set(balances.map(b => b.warehouse_name).filter(Boolean)))],
    [balances]
  );

  // ── FILTERING ─────────────────────────────────────────────
  const filtered = useMemo(() => balances.filter(b => {
    const matchSearch = !search ||
      (b.item_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.item_code || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.category || "").toLowerCase().includes(search.toLowerCase());
    const matchWH = filterWarehouse === "all" || b.warehouse_name === filterWarehouse;
    const matchCat = filterCategory === "all" || b.category === filterCategory;
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchWH && matchCat && matchStatus;
  }), [balances, search, filterWarehouse, filterCategory, filterStatus]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // ── KPIs ──────────────────────────────────────────────────
  const lowStock = balances.filter(b => b.status === "low").length;
  const critical = balances.filter(b => b.status === "critical").length;
  const totalValue = balances.reduce((s, b) => s + Number(b.total_value || 0), 0);
  const isLoading = loadingBal;
  const hasFilters = search || filterWarehouse !== "all" || filterCategory !== "all" || filterStatus !== "all";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Stock Balances</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>
                Inventory levels · Reorder alerts · {warehouses.length} warehouse{warehouses.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => router.push("/supply-chain/purchase-orders-v2")}
                style={{
                  background: "linear-gradient(135deg,#8F6F3D,#B9924C)",
                  color: "#181614", border: "none", borderRadius: 10,
                  padding: "10px 18px", fontWeight: 700, fontSize: 13,
                  cursor: "pointer", whiteSpace: "nowrap"
                }}
              >
                + New PO
              </button>
              <button
                onClick={() => router.push("/supply-chain")}
                style={{
                  background: "none", border: "1px solid var(--color-border)",
                  color: "var(--color-text-2)", borderRadius: 8,
                  padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600
                }}
              >
                ← Supply Chain
              </button>
            </div>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi" onClick={() => { setFilterStatus("all"); setPage(1); }} style={{ cursor: "pointer" }}>
                <div className="tb-hero-kpi-value">{balances.length}</div>
                <div className="tb-hero-kpi-label">Total SKUs</div>
              </div>
              <div className="tb-hero-kpi" onClick={() => { setFilterStatus("low"); setPage(1); }} style={{ cursor: "pointer" }}>
                <div className="tb-hero-kpi-value" style={{ color: "#B07A2A" }}>{lowStock}</div>
                <div className="tb-hero-kpi-label">Low Stock</div>
              </div>
              <div className="tb-hero-kpi" onClick={() => { setFilterStatus("critical"); setPage(1); }} style={{ cursor: "pointer" }}>
                <div className="tb-hero-kpi-value" style={{ color: "#A84A3D" }}>{critical}</div>
                <div className="tb-hero-kpi-label">Critical</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#B9924C", fontSize: 15 }}>
                  {fmtEGP(totalValue)}
                </div>
                <div className="tb-hero-kpi-label">Total Value</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div className="tb-canvas">

        {/* ── ALERT BANNER ──────────────────────────────── */}
        {critical > 0 && (
          <div style={{
            marginBottom: 16, padding: "12px 16px",
            background: "rgba(168,74,61,0.08)", border: "1px solid rgba(168,74,61,0.25)",
            borderRadius: 10, display: "flex", alignItems: "center", gap: 10
          }}>
            <span style={{ fontSize: 18 }}>🚨</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#A84A3D" }}>
                {critical} item{critical !== 1 ? "s" : ""} at critical stock level
              </span>
              <span style={{ fontSize: 13, color: "var(--color-text-3)", marginLeft: 8 }}>
                — immediate reorder required
              </span>
            </div>
            <button
              onClick={() => { setFilterStatus("critical"); setPage(1); }}
              style={{
                padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                cursor: "pointer", background: "rgba(168,74,61,0.12)",
                border: "1px solid rgba(168,74,61,0.3)", color: "#A84A3D"
              }}
            >
              View Critical
            </button>
          </div>
        )}

        {/* ── FILTER BAR ────────────────────────────────── */}
        <div className="tb-section" style={{ marginBottom: 20, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search items..."
              style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 14,
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)", color: "var(--color-text-1)",
                minWidth: 200
              }}
            />
            <select value={filterWarehouse} onChange={e => { setFilterWarehouse(e.target.value); setPage(1); }}
              style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)" }}>
              {warehouseNames.map(w => <option key={w} value={w}>{w === "all" ? "All Warehouses" : w}</option>)}
            </select>
            <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
              style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)" }}>
              {categories.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
            </select>
            <div style={{ display: "flex", gap: 6 }}>
              {["all", "ok", "low", "critical"].map(s => (
                <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
                  className={filterStatus === s ? "tb-pill tb-pill--active" : "tb-pill"}
                  style={s !== "all" && filterStatus === s ? {
                    color: STATUS_COLORS[s]?.text,
                    borderColor: STATUS_COLORS[s]?.border,
                    background: STATUS_COLORS[s]?.bg
                  } : {}}>
                  {s === "all" ? "All" : STATUS_COLORS[s]?.label}
                  {s !== "all" && (
                    <span style={{ marginLeft: 4, opacity: 0.7 }}>
                      {balances.filter(b => b.status === s).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {hasFilters && (
              <button onClick={() => { setSearch(""); setFilterWarehouse("all"); setFilterCategory("all"); setFilterStatus("all"); setPage(1); }}
                style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-3)", fontWeight: 600 }}>
                ✕ Clear
              </button>
            )}
            <span style={{ fontSize: 12, color: "var(--color-text-3)", marginLeft: "auto" }}>
              {filtered.length} of {balances.length} items
            </span>
          </div>
        </div>

        {/* ── TABLE ─────────────────────────────────────── */}
        <div className="tb-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 className="tb-section-title" style={{ margin: 0 }}>Inventory Stock Levels</h2>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#B9924C" }}>
              {fmtEGP(filtered.reduce((s, b) => s + Number(b.total_value || 0), 0))} total
            </span>
          </div>

          {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No stock items found"
              description={hasFilters ? "Try adjusting your filters" : "No inventory items in stock"}
              action={hasFilters ? { label: "Clear Filters", onClick: () => { setSearch(""); setFilterWarehouse("all"); setFilterCategory("all"); setFilterStatus("all"); setPage(1); } } : undefined}
            />
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="tb-table-header">
                      <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>ITEM</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>CATEGORY</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>WAREHOUSE</th>
                      <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>ON HAND</th>
                      <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>RESERVED</th>
                      <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>AVAILABLE</th>
                      <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>REORDER AT</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>STATUS</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((b, i) => {
                      const sc = STATUS_COLORS[b.status] || STATUS_COLORS.ok;
                      const isCritical = b.status === "critical";
                      const isLow = b.status === "low";
                      return (
                        <tr key={b.id || i} className="tb-table-row"
                          style={{
                            background: isCritical
                              ? "rgba(168,74,61,0.04)"
                              : isLow
                                ? "rgba(176,122,42,0.04)"
                                : undefined,
                            borderLeft: isCritical
                              ? "3px solid rgba(168,74,61,0.4)"
                              : isLow
                                ? "3px solid rgba(176,122,42,0.3)"
                                : "3px solid transparent"
                          }}>
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-1)" }}>
                              {b.item_name || "—"}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 1 }}>
                              {b.item_code || "—"}
                            </div>
                          </td>
                          <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--color-text-2)" }}>
                            {b.category}
                          </td>
                          <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--color-text-2)" }}>
                            {b.warehouse_name || "—"}
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right" }}>
                            <span style={{
                              fontSize: 14, fontWeight: 700,
                              color: isCritical ? "#A84A3D" : isLow ? "#B07A2A" : "var(--color-text-1)"
                            }}>
                              {fmtQty(b.qty_on_hand, b.unit)}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 13, color: "var(--color-text-3)" }}>
                            {fmtQty(b.qty_reserved, b.unit)}
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right" }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#547C4D" }}>
                              {fmtQty(b.qty_available, b.unit)}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 12, color: "var(--color-text-3)" }}>
                            {b.reorder_qty > 0 ? fmtQty(b.reorder_qty, b.unit) : "—"}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{
                              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                              background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`
                            }}>
                              {sc.label}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>
                            {(isCritical || isLow) && (
                              <button
                                onClick={() => router.push("/supply-chain/purchase-orders-v2")}
                                style={{
                                  padding: "5px 10px", borderRadius: 6, fontSize: 11,
                                  fontWeight: 700, cursor: "pointer", border: "none",
                                  background: isCritical ? "rgba(168,74,61,0.12)" : "rgba(176,122,42,0.12)",
                                  color: isCritical ? "#A84A3D" : "#B07A2A"
                                }}
                              >
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

              {filtered.length > pageSize && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPage={setPage}
                    total={filtered.length}
                    pageSize={pageSize}
                    onPageSize={(s) => { setPageSize(s); setPage(1); }}
                    pageSizes={[10, 25, 50]}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* ── WAREHOUSE SUMMARY ─────────────────────────── */}
        {warehouses.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(warehouses.length, 3)}, 1fr)`, gap: 16, marginTop: 16 }}>
            {warehouses.map((w, i) => {
              const wBalances = balances.filter(b => b.warehouse_name === w.name);
              const wValue = wBalances.reduce((s, b) => s + Number(b.total_value || 0), 0);
              const wCritical = wBalances.filter(b => b.status === "critical").length;
              return (
                <div key={w.id || i} className="tb-section">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text-1)" }}>{w.name}</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 2 }}>
                        {w.code} · {w.type || "warehouse"}
                      </div>
                    </div>
                    {wCritical > 0 && (
                      <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "rgba(168,74,61,0.12)", color: "#A84A3D" }}>
                        {wCritical} critical
                      </span>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "SKUs", value: wBalances.length },
                      { label: "Total Value", value: fmtEGP(wValue) },
                      { label: "Low Stock", value: wBalances.filter(b => b.status === "low").length },
                      { label: "Critical", value: wCritical },
                    ].map(({ label, value }, j) => (
                      <div key={j} style={{ padding: "8px 10px", background: "var(--color-surface-alt)", borderRadius: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-1)" }}>{value}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 2 }}>{label}</div>
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
