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

export default function SitesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("all");

  const { data: raw, isLoading } = useQuery({
    queryKey: ["sites-list"],
    queryFn: () => authFetch("/api/v1/sites-portal").then(r => r.json()),
  });

  const all = toArr(raw);
  const filtered = all.filter(s => {
    const matchSearch = !search ||
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.city || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.contact_person || "").toLowerCase().includes(search.toLowerCase());
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" && s.is_active) ||
      (filterActive === "inactive" && !s.is_active);
    return matchSearch && matchActive;
  });

  const active = all.filter(s => s.is_active).length;
  const inactive = all.filter(s => !s.is_active).length;
  const cities = Array.from(new Set(all.map(s => s.city).filter(Boolean)));

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Hotel Sites</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>
                Managed properties · Field operations · Asset locations
              </p>
            </div>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{all.length}</div>
                <div className="tb-hero-kpi-label">Total Sites</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#547C4D" }}>{active}</div>
                <div className="tb-hero-kpi-label">Active</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "var(--color-text-3)" }}>{inactive}</div>
                <div className="tb-hero-kpi-label">Inactive</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{cities.length}</div>
                <div className="tb-hero-kpi-label">Cities</div>
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
            placeholder="Search sites..."
            style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 14,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)", color: "var(--color-text-1)",
              minWidth: 240
            }}
          />
          {["all", "active", "inactive"].map(f => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={filterActive === f ? "tb-pill tb-pill--active" : "tb-pill"}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Site Cards */}
        {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
          <EmptyState
            icon="🏨"
            title="No sites found"
            description={search ? "Try adjusting your search" : "No hotel sites configured yet"}
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {filtered.map(s => (
              <div
                key={s.id}
                className="tb-section"
                style={{ cursor: "pointer", transition: "box-shadow 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(185,146,76,0.15)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ""}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-1)" }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--color-text-3)", marginTop: 3 }}>
                      📍 {s.city || "Cairo"}{s.address ? ` · ${s.address.slice(0, 40)}` : ""}
                    </div>
                  </div>
                  <StatusBadge status={s.is_active ? "active" : "inactive"} />
                </div>
                {s.contact_person && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "linear-gradient(135deg,#8F6F3D,#B9924C)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0
                    }}>
                      {(s.contact_person || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-1)" }}>{s.contact_person}</div>
                      {s.contact_phone && (
                        <div style={{ fontSize: 12, color: "var(--color-text-3)" }}>{s.contact_phone}</div>
                      )}
                    </div>
                  </div>
                )}
                {s.notes && (
                  <div style={{
                    marginTop: 10, padding: "8px 12px",
                    background: "var(--color-surface-alt)", borderRadius: 8,
                    fontSize: 12, color: "var(--color-text-2)"
                  }}>
                    {s.notes.slice(0, 100)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
