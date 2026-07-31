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
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };
const fmtEGP = (n) => n ? "EGP " + Number(n).toLocaleString() : "—";

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: raw, isLoading } = useQuery({ queryKey: ["leads-v2"], queryFn: () => authFetch("/api/v1/leads-portal-v2").then(r => r.json()), staleTime: 60000 });
  const leads = toArr(raw);
  const active = leads.filter(l => l.status === "active" || l.status === "won");
  const totalValue = leads.reduce((s, l) => s + Number(l.contract_value || l.deal_value || 0), 0);

  const filtered = useMemo(() => leads.filter(l => {
    const ms = !search || (l.company_name || l.name || "").toLowerCase().includes(search.toLowerCase()) || (l.contact_person || "").toLowerCase().includes(search.toLowerCase());
    const mv = filterStatus === "all" || l.status === filterStatus;
    return ms && mv;
  }), [leads, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = search || filterStatus !== "all";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div><h1 className="tb-hero-title">Customers</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>Hotel clients · Accounts · Relationship management</p>
            </div>
            <button onClick={() => router.push("/commercial/leads")}
              style={{ background: "linear-gradient(135deg,#8F6F3D,#B9924C)", color: "#181614", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              + New Lead
            </button>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{leads.length}</div><div className="tb-hero-kpi-label">Total</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#547C4D" }}>{active.length}</div><div className="tb-hero-kpi-label">Active</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#B9924C", fontSize: 14 }}>{fmtEGP(totalValue)}</div><div className="tb-hero-kpi-label">Pipeline Value</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{leads.filter(l => l.status === "won").length}</div><div className="tb-hero-kpi-label">Won</div></div>
            </>}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search customers..."
            style={{ padding: "8px 14px", borderRadius: 8, fontSize: 14, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)", minWidth: 200 }} />
          {["all", "prospect", "active", "won", "lost"].map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }} className={filterStatus === s ? "tb-pill tb-pill--active" : "tb-pill"}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== "all" && <span style={{ marginLeft: 4, opacity: 0.6 }}>{leads.filter(l => l.status === s).length}</span>}
            </button>
          ))}
          {hasFilters && <button onClick={() => { setSearch(""); setFilterStatus("all"); setPage(1); }}
            style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-3)", fontWeight: 600 }}>✕</button>}
        </div>
        <div className="tb-section">
          {isLoading ? <TableSkeleton /> : leads.length === 0 ? (
            <EmptyState icon="🏨" title="No customers yet" description="Start by adding your first hotel client lead" action={{ label: "Add Lead", onClick: () => router.push("/commercial/leads") }} />
          ) : filtered.length === 0 ? (
            <EmptyState icon="🔍" title="No customers found" description="Try adjusting your search or filter" />
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="tb-table-header">
                      {["CUSTOMER", "STATUS", "CONTACT", "VALUE", "CREATED", ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((l, i) => (
                      <tr key={l.id || i} className="tb-table-row" style={{ cursor: "pointer" }} onClick={() => router.push(`/commercial/leads/${l.id}`)}>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-1)" }}>{l.company_name || l.name || "—"}</div>
                          <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>{l.industry || l.type || "Hotel"}</div>
                        </td>
                        <td style={{ padding: "10px 14px" }}><StatusBadge status={l.status || "prospect"} /></td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontSize: 13, color: "var(--color-text-2)" }}>{l.contact_person || l.contact_name || "—"}</div>
                          <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>{l.contact_email || l.email || ""}</div>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "#B9924C" }}>{fmtEGP(l.contract_value || l.deal_value)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-text-3)" }}>{fmtDate(l.created_at)}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <button onClick={e => { e.stopPropagation(); router.push(`/commercial/leads/${l.id}`); }}
                            style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none", background: "rgba(185,146,76,0.12)", color: "#B9924C" }}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length > pageSize && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
                  <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} pageSize={pageSize} onPageSize={(s) => { setPageSize(s); setPage(1); }} pageSizes={[10, 25, 50]} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
