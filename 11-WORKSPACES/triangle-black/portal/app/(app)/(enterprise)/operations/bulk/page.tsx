"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { TableSkeleton, KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "@/lib/toast";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };

export default function BulkOperationsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState("open");
  const [bulkStatus, setBulkStatus] = useState("in_progress");

  const { data: rawWOs, isLoading } = useQuery({ queryKey: ["bulk-wos"], queryFn: () => authFetch("/api/v1/work-orders/?limit=100").then(r => r.json()), staleTime: 30000 });
  const { data: rawTechs } = useQuery({ queryKey: ["bulk-techs"], queryFn: () => authFetch("/api/v1/technicians/").then(r => r.json()).catch(() => []), staleTime: 60000 });

  const wos = toArr(rawWOs).filter(w => !w.deleted_at);
  const techs = toArr(rawTechs).filter(t => t.is_active);
  const filtered = filterStatus === "all" ? wos : wos.filter(w => w.status === filterStatus);

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(w => w.id)));
  };
  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const bulkStatusMut = useMutation({
    mutationFn: async () => {
      const ids = Array.from(selected);
      await Promise.all(ids.map(id => authFetch(`/api/v1/work-orders/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: bulkStatus }) })));
    },
    onSuccess: () => { toast.success(`Updated ${selected.size} work orders to ${bulkStatus}`); qc.invalidateQueries(["bulk-wos"]); setSelected(new Set()); },
    onError: () => toast.error("Bulk update failed"),
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Bulk Operations</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>Select multiple work orders · Apply batch actions</p>
            </div>
            <button onClick={() => router.push("/operations/work-orders")}
              style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              ← Work Orders
            </button>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{wos.length}</div><div className="tb-hero-kpi-label">Total WOs</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#B9924C" }}>{selected.size}</div><div className="tb-hero-kpi-label">Selected</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{filtered.length}</div><div className="tb-hero-kpi-label">Filtered</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{techs.length}</div><div className="tb-hero-kpi-label">Technicians</div></div>
            </>}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        {/* Bulk Action Bar */}
        {selected.size > 0 && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(185,146,76,0.08)", border: "1px solid rgba(185,146,76,0.25)", borderRadius: 10, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#B9924C" }}>{selected.size} selected</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <span style={{ fontSize: 13, color: "var(--color-text-2)" }}>Set status to:</span>
              <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: 6, fontSize: 13, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)" }}>
                {["in_progress", "completed", "cancelled", "open"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
              <button onClick={() => bulkStatusMut.mutate()} disabled={bulkStatusMut.isLoading}
                style={{ padding: "7px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", background: "linear-gradient(135deg,#8F6F3D,#B9924C)", color: "#181614", border: "none" }}>
                {bulkStatusMut.isLoading ? "Updating..." : "Apply"}
              </button>
            </div>
            <button onClick={() => setSelected(new Set())}
              style={{ padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-3)", fontWeight: 600 }}>
              Clear
            </button>
          </div>
        )}

        {/* Filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {["all", "open", "in_progress", "completed"].map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setSelected(new Set()); }}
              className={filterStatus === s ? "tb-pill tb-pill--active" : "tb-pill"}>
              {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
              <span style={{ marginLeft: 4, opacity: 0.6 }}>{s === "all" ? wos.length : wos.filter(w => w.status === s).length}</span>
            </button>
          ))}
        </div>

        <div className="tb-section">
          {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
            <EmptyState icon="🔧" title="No work orders" description="No work orders match current filter" />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr className="tb-table-header">
                    <th style={{ padding: "10px 14px", width: 40 }}>
                      <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll}
                        style={{ cursor: "pointer", width: 16, height: 16 }} />
                    </th>
                    {["WORK ORDER", "PRIORITY", "STATUS", "DATE"].map((h, i) => (
                      <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w, i) => (
                    <tr key={w.id || i} className="tb-table-row"
                      style={{ background: selected.has(w.id) ? "rgba(185,146,76,0.05)" : undefined, borderLeft: selected.has(w.id) ? "3px solid #B9924C" : "3px solid transparent" }}>
                      <td style={{ padding: "10px 14px" }}>
                        <input type="checkbox" checked={selected.has(w.id)} onChange={() => toggle(w.id)}
                          style={{ cursor: "pointer", width: 16, height: 16 }} />
                      </td>
                      <td style={{ padding: "10px 14px" }} onClick={() => router.push(`/operations/work-orders/${w.id}`)}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-1)", cursor: "pointer" }}>{(w.title || "Untitled").slice(0, 50)}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>{w.id?.slice(0, 8)}</div>
                      </td>
                      <td style={{ padding: "10px 14px" }}><StatusBadge status={w.priority || "medium"} /></td>
                      <td style={{ padding: "10px 14px" }}><StatusBadge status={w.status || "open"} /></td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-text-3)" }}>{fmtDate(w.created_at)}</td>
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
