"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "@/lib/toast";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];

const STARS = (r) => {
  const s = Math.round(r || 0);
  return "★".repeat(s) + "☆".repeat(5 - s);
};

export default function VendorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const { data: raw, isLoading } = useQuery({
    queryKey: ["vendors-list"],
    queryFn: () => authFetch("/api/v1/vendors/").then(r => r.json()),
  });

  const all = toArr(raw).filter(v => !v.deleted_at);
  const categories = ["all", ...Array.from(new Set(all.map(v => v.category).filter(Boolean)))];

  const filtered = all.filter(v => {
    const matchSearch = !search ||
      (v.company_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.contact_person || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.email || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || v.category === filterCat;
    return matchSearch && matchCat;
  });

  const approved = all.filter(v => v.is_approved).length;
  const totalOrders = all.reduce((s, v) => s + (v.total_orders || 0), 0);
  const avgRating = all.length ? (all.reduce((s, v) => s + (v.rating || 0), 0) / all.length).toFixed(1) : "0.0";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Vendor Management</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>
                Approved suppliers · Performance tracking · Procurement partners
              </p>
            </div>
            <button
              onClick={() => router.push("/supply-chain/vendor-management")}
              style={{
                background: "linear-gradient(135deg,#8F6F3D,#B9924C)",
                color: "#181614", border: "none", borderRadius: 10,
                padding: "10px 22px", fontWeight: 700, fontSize: 14,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8
              }}
            >
              + New Vendor
            </button>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{all.length}</div>
                <div className="tb-hero-kpi-label">Total Vendors</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#547C4D" }}>{approved}</div>
                <div className="tb-hero-kpi-label">Approved</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{totalOrders}</div>
                <div className="tb-hero-kpi-label">Total Orders</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{avgRating}</div>
                <div className="tb-hero-kpi-label">Avg Rating</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────── */}
      <div className="tb-canvas">
        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vendors..."
            style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 14,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)", color: "var(--color-text-1)",
              minWidth: 240
            }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={filterCat === cat ? "tb-pill tb-pill--active" : "tb-pill"}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="tb-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 className="tb-section-title">
              Vendors
              <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: "var(--color-text-3)" }}>
                {filtered.length} of {all.length}
              </span>
            </h2>
          </div>

          {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
            <EmptyState
              icon="🏢"
              title="No vendors found"
              description={search ? "Try adjusting your search or filter" : "Add your first vendor to get started"}
              action={{ label: "Add Vendor", onClick: () => router.push("/supply-chain/vendor-management") }}
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr className="tb-table-header">
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>VENDOR</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>CATEGORY</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>CONTACT</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>RATING</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>ORDERS</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(v => (
                    <tr
                      key={v.id}
                      className="tb-table-row"
                      onClick={() => router.push(`/supply-chain/vendor-management/${v.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-1)" }}>
                          {v.company_name || "—"}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 2 }}>
                          {v.vendor_code} · {v.city || "Cairo"}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--color-text-2)" }}>
                        {v.category || "General"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: 13, color: "var(--color-text-1)" }}>{v.contact_person || "—"}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-3)" }}>{v.email || ""}</div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#B9924C" }}>
                        {STARS(v.rating)} <span style={{ color: "var(--color-text-3)", marginLeft: 4 }}>{(v.rating || 0).toFixed(1)}</span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--color-text-2)" }}>
                        {v.total_orders || 0}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <StatusBadge status={v.is_approved ? "approved" : "pending"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
