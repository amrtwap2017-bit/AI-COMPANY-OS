"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];

export default function RFQsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: raw, isLoading } = useQuery({
    queryKey: ["rfqs-list"],
    queryFn: () => authFetch("/api/v1/rfqs/").then(r => r.json()),
  });

  const all = toArr(raw);
  const statuses = ["all", "draft", "open", "closed", "awarded", "cancelled"];

  const filtered = all.filter(r => {
    const matchSearch = !search ||
      (r.rfq_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.category || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const open = all.filter(r => r.status === "open").length;
  const awarded = all.filter(r => r.status === "awarded").length;
  const draft = all.filter(r => r.status === "draft").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Request for Quotations</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>
                Competitive bidding · Vendor selection · Procurement workflow
              </p>
            </div>
            <button
              onClick={() => router.push("/supply-chain/rfq-management")}
              style={{
                background: "linear-gradient(135deg,#8F6F3D,#B9924C)",
                color: "#181614", border: "none", borderRadius: 10,
                padding: "10px 22px", fontWeight: 700, fontSize: 14,
                cursor: "pointer"
              }}
            >
              + New RFQ
            </button>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{all.length}</div>
                <div className="tb-hero-kpi-label">Total RFQs</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#5B7C8C" }}>{open}</div>
                <div className="tb-hero-kpi-label">Open</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#547C4D" }}>{awarded}</div>
                <div className="tb-hero-kpi-label">Awarded</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "var(--color-text-3)" }}>{draft}</div>
                <div className="tb-hero-kpi-label">Draft</div>
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
            placeholder="Search RFQs..."
            style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 14,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)", color: "var(--color-text-1)",
              minWidth: 240
            }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={filterStatus === s ? "tb-pill tb-pill--active" : "tb-pill"}
              >
                {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="tb-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 className="tb-section-title">
              RFQs
              <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: "var(--color-text-3)" }}>
                {filtered.length} of {all.length}
              </span>
            </h2>
          </div>

          {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No RFQs found"
              description={search ? "Try adjusting your search or filter" : "Create your first RFQ to start the procurement process"}
              action={{ label: "Create RFQ", onClick: () => router.push("/supply-chain/rfq-management") }}
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr className="tb-table-header">
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>RFQ</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>CATEGORY</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>DUE DATE</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>CREATED BY</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>STATUS</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>BIDS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr
                      key={r.id}
                      className="tb-table-row"
                      onClick={() => router.push(`/supply-chain/rfq-management/${r.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-1)" }}>
                          {r.rfq_number || r.id?.slice(0, 8)}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 2 }}>
                          {(r.title || "Untitled RFQ").slice(0, 50)}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--color-text-2)" }}>
                        {r.category || "General"}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--color-text-2)" }}>
                        {r.due_date ? new Date(r.due_date).toLocaleDateString("en-GB") : r.required_date ? new Date(r.required_date).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--color-text-2)" }}>
                        {r.created_by || "—"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <StatusBadge status={r.status || "draft"} />
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--color-text-2)" }}>
                        {Array.isArray(r.lines) ? r.lines.length : "—"}
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
