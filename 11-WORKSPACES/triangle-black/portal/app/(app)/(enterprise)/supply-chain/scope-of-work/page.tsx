"use client";
// @ts-nocheck
// Triangle Black — Scope of Work
// Sprint 302: Component Library Adoption
// Migrated: inline KPIs → KpiCard, inline badges → StatusBadge, inline empty → EmptyState

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { KpiCard }     from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState }  from "@/components/ui/EmptyState";
import { SectionCard } from "@/components/ui/SectionCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { DataTable }   from "@/components/ui/DataTable";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();

export default function ScopeOfWorkPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [showNewSOW, setShowNewSOW] = useState(false);
  const [newSOW, setNewSOW] = useState({
    title:"", type:"service", client_name:"", currency:"EGP",
    estimated_days:7, labor_cost:0, materials_cost:0, overhead_pct:15, profit_margin_pct:10
  });

  const { data: raw, isLoading } = useQuery(
    ["sow-list"],
    () => authFetch("/api/v1/scope-of-work/").then(r => r.json()),
    { staleTime: 60000 }
  );
  const sows = toArr(raw);
  const filtered = filter === "all" ? sows : sows.filter((s: any) => s.status === filter);

  const createSOW = useMutation(
    (payload: any) => authFetch("/api/v1/scope-of-work/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(r => r.json()),
    {
      onSuccess: (data) => {
        if (data.id || data.sow_number) {
          toast.success("Scope of Work created");
          setShowNewSOW(false);
          setNewSOW({ title:"", type:"service", client_name:"", currency:"EGP", estimated_days:7, labor_cost:0, materials_cost:0, overhead_pct:15, profit_margin_pct:10 });
          qc.invalidateQueries(["sow-list"]);
        } else {
          toast.error(data.detail || "Failed to create SOW");
        }
      },
      onError: () => toast.error("Connection error"),
    }
  );

  const columns = [
    { key: "title", label: "SOW / Title", render: (row: any) => (
      <div>
        <div className="font-semibold text-primary text-sm">{row.title}</div>
        <div className="text-xs text-tertiary">{row.sow_number || "—"}</div>
      </div>
    )},
    { key: "sow_type",    label: "Type",       render: (row: any) => <span className="tb-badge capitalize">{row.sow_type || "service"}</span> },
    { key: "status",      label: "Status",     render: (row: any) => <StatusBadge status={row.status} /> },
    { key: "client_name", label: "Client",     render: (row: any) => <span className="text-sm text-secondary">{row.client_name || "—"}</span> },
    { key: "total_cost",  label: "Total Cost", align: "right" as const, render: (row: any) => <span className="font-bold text-emerald-600">{fmtEGP(row.total_cost || 0)}</span> },
    { key: "created_at",  label: "Date",       align: "right" as const, render: (row: any) => <span className="text-xs text-tertiary">{fmtDate(row.created_at)}</span> },
  ];

  const handleExport = () => {
    const token = localStorage.getItem("tb_access_token") || "";
    fetch("http://localhost:8030/api/v1/export/scope-of-work", {
      headers: { "Authorization": "Bearer " + token }
    }).then(r => r.blob()).then(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "scope-of-work.csv";
      a.click();
    });
  };

  return (
    <div>
      {/* Hero */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6 mb-6">
            <div>
              <p className="tb-hero-title">Scope of Work</p>
              <p className="tb-hero-description">{sows.length} documents · BOQ &amp; cost estimates</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={handleExport} className="tb-btn-secondary" style={{ fontSize:"0.75rem" }}>⬇ Export CSV</button>
              <button onClick={() => setShowNewSOW(true)}
                style={{ background:"linear-gradient(135deg,#8F6F3D,#B9924C)", border:"none", borderRadius:8,
                         padding:"10px 18px", color:"#181614", fontSize:"0.875rem", fontWeight:700, cursor:"pointer" }}>
                + New SOW
              </button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="tb-hero-kpis">
            <KpiCard label="Total SOWs"  value={sows.length} color="slate" icon="📋" />
            <KpiCard label="Draft"       value={sows.filter((s:any) => s.status === "draft").length}             color="slate"   icon="✏️" />
            <KpiCard label="Pending"     value={sows.filter((s:any) => s.status === "pending_approval").length}  color="amber"   icon="⏳" status={sows.filter((s:any) => s.status === "pending_approval").length > 0 ? "warn" : "neutral"} />
            <KpiCard label="Approved"    value={sows.filter((s:any) => s.status === "approved").length}          color="emerald" icon="✅" status="ok" />
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="tb-canvas">
        <SectionCard title="Scope of Work Documents" subtitle="All SOW documents for procurement">
          {/* Filter Tabs */}
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            {["all","draft","pending_approval","approved","sent_to_client"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={"tb-pill " + (filter === f ? "tb-pill--active" : "")}>
                {f === "all" ? "All" : f.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          {isLoading ? (
            <LoadingState type="table" rows={6} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No SOW documents"
              description={filter === "all" ? "Create your first Scope of Work document" : `No documents with status: ${filter.replace(/_/g, " ")}`}
              action={{ label: "+ New SOW", onClick: () => setShowNewSOW(true) }}
            />
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              onRow={(row) => router.push(`/supply-chain/scope-of-work/${row.id}`)}
              keyField="id"
            />
          )}
        </SectionCard>
      </div>

      {/* New SOW Modal */}
      {showNewSOW && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:50,
                      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"var(--color-surface)", border:"1px solid var(--color-border)",
                        borderRadius:16, padding:32, width:"100%", maxWidth:500, boxShadow:"0 20px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontSize:"1.125rem", fontWeight:700, color:"var(--color-text-1)" }}>New Scope of Work</div>
              <button onClick={() => setShowNewSOW(false)}
                style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-text-3)", fontSize:"1.5rem" }}>×</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { label:"Title *", key:"title", type:"text", placeholder:"e.g. HVAC Maintenance SOW" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display:"block", fontSize:"0.75rem", color:"var(--color-text-3)", marginBottom:4, fontWeight:600, textTransform:"uppercase" }}>{f.label}</label>
                  <input type={f.type} value={(newSOW as any)[f.key]}
                    onChange={e => setNewSOW({ ...newSOW, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    style={{ width:"100%", background:"var(--color-bg-alt)", border:"1px solid var(--color-border)", borderRadius:8, padding:"10px 12px", fontSize:"0.875rem", color:"var(--color-text-1)", outline:"none" }} />
                </div>
              ))}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ display:"block", fontSize:"0.75rem", color:"var(--color-text-3)", marginBottom:4, fontWeight:600, textTransform:"uppercase" }}>Type</label>
                  <select value={newSOW.type} onChange={e => setNewSOW({ ...newSOW, type: e.target.value })}
                    style={{ width:"100%", background:"var(--color-bg-alt)", border:"1px solid var(--color-border)", borderRadius:8, padding:"10px 12px", fontSize:"0.875rem", color:"var(--color-text-1)", outline:"none" }}>
                    {["service","maintenance","installation","repair","inspection"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"0.75rem", color:"var(--color-text-3)", marginBottom:4, fontWeight:600, textTransform:"uppercase" }}>Client</label>
                  <input value={newSOW.client_name} onChange={e => setNewSOW({ ...newSOW, client_name: e.target.value })}
                    placeholder="Client name"
                    style={{ width:"100%", background:"var(--color-bg-alt)", border:"1px solid var(--color-border)", borderRadius:8, padding:"10px 12px", fontSize:"0.875rem", color:"var(--color-text-1)", outline:"none" }} />
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                {[
                  { label:"Labor Cost", key:"labor_cost" },
                  { label:"Materials",  key:"materials_cost" },
                  { label:"Days",       key:"estimated_days" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display:"block", fontSize:"0.75rem", color:"var(--color-text-3)", marginBottom:4, fontWeight:600, textTransform:"uppercase" }}>{f.label}</label>
                    <input type="number" value={(newSOW as any)[f.key]}
                      onChange={e => setNewSOW({ ...newSOW, [f.key]: Number(e.target.value) })}
                      style={{ width:"100%", background:"var(--color-bg-alt)", border:"1px solid var(--color-border)", borderRadius:8, padding:"10px 12px", fontSize:"0.875rem", color:"var(--color-text-1)", outline:"none" }} />
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8, marginTop:4 }}>
                <button
                  onClick={() => {
                    if (!newSOW.title.trim()) { toast.error("Title is required"); return; }
                    createSOW.mutate({ ...newSOW, hotel_id:"tb-default-hotel-000000000001", status:"draft",
                                       prepared_by:"amr@triangleblack.com",
                                       total_cost: newSOW.labor_cost + newSOW.materials_cost });
                  }}
                  disabled={createSOW.isLoading}
                  style={{ flex:1, background:"linear-gradient(135deg,#8F6F3D,#B9924C)", border:"none", borderRadius:8, padding:12, color:"#181614", fontSize:"0.9375rem", fontWeight:700, cursor:"pointer" }}>
                  {createSOW.isLoading ? "Creating..." : "Create SOW"}
                </button>
                <button onClick={() => setShowNewSOW(false)}
                  style={{ background:"var(--color-bg-alt)", border:"1px solid var(--color-border)", borderRadius:8, padding:"12px 20px", color:"var(--color-text-2)", cursor:"pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
