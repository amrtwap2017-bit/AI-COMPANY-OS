"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n: any) => "EGP " + Number(n || 0).toLocaleString();
const fmtDate = (d: any) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime()) || dt.getFullYear() < 1990) return "—";
    return dt.toLocaleDateString("en-GB");
  } catch { return "—"; }
};
const SC = {
  draft: "#6D5F53",
  pending_signature: "#B07A2A",
  active: "#547C4D",
  expired: "#A84A3D",
  terminated: "#A84A3D",
  renewed: "#8D7443",
};

export default function ContractsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const { data: raw, isLoading } = useQuery(
    ["contracts-list"],
    () => authFetch("/api/v1/contracts/").then((r) => r.json()),
    { staleTime: 60000 }
  );
  const contracts = toArr(raw);
  const filtered = filter === "all" ? contracts : contracts.filter((c: any) => c.status === filter);
  const totalValue = filtered.reduce((s: any, c: any) => s + Number(c.total_value || 0), 0);
  const activeCount = contracts.filter((c: any) => c.status === "active").length;
  const pendingCount = contracts.filter((c: any) => c.status === "pending_signature").length;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-blue-400 mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Contracts</h1>
              <p className="tb-hero-description">
                {contracts.length} contracts · EGP {Number(contracts.reduce((s: any, c: any) => s + Number(c.total_value || 0), 0)).toLocaleString()} total value
              </p>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label: "Total", value: contracts.length, color: "#221D1A" },
              { label: "Active", value: activeCount, color: "#547C4D" },
              { label: "Pending Sign", value: pendingCount, color: "#B07A2A" },
              { label: "Total Value", value: fmtEGP(contracts.reduce((s: any, c: any) => s + Number(c.total_value || 0), 0)), color: "#8D7443" },
            ].map((k: any, i: number) => (
              <button key={i} onClick={()=>k.path&&router.push(k.path)} className="tb-hero-kpi text-left hover:opacity-80 transition-opacity">
                <div className="tb-hero-kpi-value" style={{ color: k.color, fontSize: "0.95rem" }}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section">
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all", "draft", "pending_signature", "active", "expired"].map((f: any) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={"tb-pill " + (filter === f ? "tb-pill--active" : "")}
              >
                {f === "all" ? "All" : f.replace(/_/g, " ")}
                {f !== "all" && (
                  <span className="ml-1 opacity-60">
                    {contracts.filter((c: any) => c.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="tb-flex-between mb-3">
            <div className="text-sm text-secondary">{filtered.length} contracts</div>
            <div className="text-sm font-bold text-emerald-400">{fmtEGP(totalValue)}</div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i: any) => (
                <div key={i} className="h-16 bg-base-alt rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">📄</div>
              <div className="tb-empty-title">No contracts found</div>
              <div className="tb-empty-desc">Contracts are created when a quotation is accepted</div>
            </div>
          ) : (
            <div className="tb-table" style={{ borderRadius: 12, overflow: "hidden" }}>
              <div className="tb-table-head" style={{ gridTemplateColumns: "2fr 110px 100px 120px 110px 100px" }}>
                {["Contract / Client", "Status", "Duration", "Value", "Start", "End"].map((h: any, i: number) => (
                  <div key={i} className="tb-table-head-cell" style={{ textAlign: i > 0 ? "center" : "left" }}>{h}</div>
                ))}
              </div>
              {filtered.map((c: any, i: number) => {
                const sc = SC[c.status] || "#6D5F53";
                return (
                  <div key={i} className="tb-table-row" style={{ gridTemplateColumns: "2fr 110px 100px 120px 110px 100px" }}>
                    <div className="min-w-0 pr-4">
                      <div className="text-sm font-semibold text-primary truncate">{c.title}</div>
                      <div className="text-xs text-tertiary">
                        {c.duration_months ? `${c.duration_months} months` : "—"}
                        {c.renewal_count > 0 && ` · Renewal #${c.renewal_count}`}
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{ background: sc + "18", color: sc, border: "1px solid " + sc + "30", fontSize: "0.5rem" }}>
                        {(c.status || "").replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="text-center text-xs text-secondary">{c.duration_months || "—"}m</div>
                    <div className="text-center text-sm font-bold text-emerald-400">{fmtEGP(c.total_value)}</div>
                    <div className="text-center text-xs text-tertiary">{fmtDate(c.start_date)}</div>
                    <div className="text-center text-xs text-tertiary">{fmtDate(c.end_date)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
