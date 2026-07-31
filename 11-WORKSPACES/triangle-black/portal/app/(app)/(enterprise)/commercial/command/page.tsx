"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n || 0).toLocaleString();

export default function CommercialCommandPage() {
  const router = useRouter();
  const { data: finDash, isLoading } = useQuery({ queryKey: ["cc-fin"], queryFn: () => authFetch("/api/v1/financial/dashboard").then(r => r.json()), staleTime: 60000 });
  const { data: rawLeads } = useQuery({ queryKey: ["cc-leads"], queryFn: () => authFetch("/api/v1/leads-portal-v2").then(r => r.json()), staleTime: 60000 });
  const { data: rawContracts } = useQuery({ queryKey: ["cc-contracts"], queryFn: () => authFetch("/api/v1/contracts-portal").then(r => r.json()), staleTime: 60000 });
  const { data: rawInv } = useQuery({ queryKey: ["cc-inv"], queryFn: () => authFetch("/api/v1/supplier-invoices/dashboard").then(r => r.json()), staleTime: 60000 });

  const leads = toArr(rawLeads);
  const contracts = toArr(rawContracts);
  const rev = finDash?.revenue || {};
  const invTotals = rawInv?.totals || {};
  const activeCont = contracts.filter(c => c.status === "active").length;
  const expiringSoon = contracts.filter(c => { if (!c.end_date) return false; const diff = (new Date(c.end_date).getTime() - Date.now()) / 86400000; return diff >= 0 && diff <= 30; }).length;

  const MODULES = [
    { label: "Leads & Pipeline", icon: "📊", path: "/commercial/leads", desc: `${leads.length} leads` },
    { label: "Contracts", icon: "📋", path: "/commercial/contracts", desc: `${activeCont} active` },
    { label: "Invoices", icon: "🧾", path: "/commercial/invoices", desc: `${fmtEGP(rev.total_invoiced || 0)} invoiced` },
    { label: "Customers", icon: "🏨", path: "/commercial/customers", desc: `${leads.filter(l => l.status === "won").length} accounts` },
    { label: "Payment History", icon: "💰", path: "/commercial/payment-history", desc: `${fmtEGP(rev.total_collected || 0)} collected` },
    { label: "Renewals", icon: "🔄", path: "/commercial/contracts/renewal", desc: `${expiringSoon} expiring soon` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div><h1 className="tb-hero-title">Commercial Command</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>Revenue overview · Pipeline · Contracts · Collections</p>
            </div>
            <button onClick={() => router.push("/financial")}
              style={{ background: "linear-gradient(135deg,#8F6F3D,#B9924C)", color: "#181614", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              P&L Dashboard →
            </button>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#B9924C", fontSize: 14 }}>{fmtEGP(rev.total_invoiced || 0)}</div><div className="tb-hero-kpi-label">Total Invoiced</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#547C4D", fontSize: 14 }}>{fmtEGP(rev.total_collected || 0)}</div><div className="tb-hero-kpi-label">Collected</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#A84A3D", fontSize: 14 }}>{fmtEGP(rev.total_outstanding || 0)}</div><div className="tb-hero-kpi-label">Outstanding</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: expiringSoon > 0 ? "#B07A2A" : "#547C4D" }}>{expiringSoon}</div><div className="tb-hero-kpi-label">Expiring Contracts</div></div>
            </>}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        {expiringSoon > 0 && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(176,122,42,0.08)", border: "1px solid rgba(176,122,42,0.25)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span>⚠️</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#B07A2A" }}>{expiringSoon} contracts expiring within 30 days — renewal required</span>
            <button onClick={() => router.push("/commercial/contracts")}
              style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", background: "rgba(176,122,42,0.12)", border: "1px solid rgba(176,122,42,0.3)", color: "#B07A2A" }}>
              View →
            </button>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          {MODULES.map((m, i) => (
            <button key={i} onClick={() => router.push(m.path)}
              style={{ padding: "16px 18px", borderRadius: 12, cursor: "pointer", textAlign: "left", background: "var(--color-surface)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 22 }}>{m.icon}</span>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-1)" }}>{m.label}</div>
              <div style={{ fontSize: 12, color: "#B9924C", fontWeight: 600 }}>{m.desc}</div>
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="tb-section">
            <h2 className="tb-section-title">Revenue Summary</h2>
            {[
              ["Total Invoiced", fmtEGP(rev.total_invoiced || 0), "#B9924C"],
              ["Collected", fmtEGP(rev.total_collected || 0), "#547C4D"],
              ["Outstanding", fmtEGP(rev.total_outstanding || 0), "#A84A3D"],
              ["Collection Rate", rev.total_invoiced > 0 ? `${Math.round(rev.total_collected / rev.total_invoiced * 100)}%` : "—", "#5B7C8C"],
            ].map(([label, value, color], i, arr) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <span style={{ fontSize: 13, color: "var(--color-text-3)" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: color as string }}>{value}</span>
              </div>
            ))}
          </div>
          <div className="tb-section">
            <h2 className="tb-section-title">Contracts Summary</h2>
            {[
              ["Total Contracts", contracts.length, "var(--color-text-1)"],
              ["Active", activeCont, "#547C4D"],
              ["Expiring Soon", expiringSoon, expiringSoon > 0 ? "#B07A2A" : "#547C4D"],
              ["Leads in Pipeline", leads.filter(l => !["won", "lost"].includes(l.status)).length, "#5B7C8C"],
            ].map(([label, value, color], i, arr) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <span style={{ fontSize: 13, color: "var(--color-text-3)" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: color as string }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
